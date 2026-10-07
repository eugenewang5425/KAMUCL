import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { build } from 'esbuild'
import { parse, compileScript } from '@vue/compiler-sfc'
import { reactive, ref } from 'vue'
import { chineseModSearchTerms } from '../src/main/core/community-zh'
import { lookupMcmod, mcmodNameRank, parseMcmodSearch } from '../src/main/core/mcmodSearch'
import { initialCommunityQuery, initialCommunityVersionSelection, chooseCommunityInstance } from '../src/renderer/src/communityVersionSelection'
import { versionInstallHarness } from './helpers/version-install-harness'
import type { CommunityQuery, InstalledVersion } from '../src/shared/types'

const target: InstalledVersion = { id: 'named-instance', folder: 'fixture/registered', mcVersion: '1.20.1', loader: 'fabric' }
const query: CommunityQuery = { keyword: '悠然一派', kind: 'mod', source: 'modrinth', mcVersion: '1.20.1', loader: 'forge', offset: 0, limit: 20 }
const html = (s: string) => new Response(s, { headers: { 'content-type': 'text/html; charset=utf-8' } })
const search = (rows: Array<[string, string]>) => `<div class="search-result-list">${rows.map(([id, name]) => `<div class="result-item"><div class="head"><a href="https://www.mcmod.cn/class/${id}.html">${name}</a></div><div class="body">描述中的关键词不能证明项目身份</div></div>`).join('')}</div><div class="search-result-pages"></div>`
const entry = (name: string, ...urls: string[]) => `<div class="class-title"><h3>${name}</h3><h4>English Name</h4></div><ul class="common-link-icon-frame">${urls.map(url => `<li><a href="${url}">来源项目</a></li>`).join('')}</ul>`
async function fixture(t: any, fetcher: typeof fetch) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kamucl-community120-')), runtime = await versionInstallHarness(root, fetcher)
  t.after(async () => { await runtime.closeHttpClient(); fs.rmSync(root, { recursive: true, force: true }) })
  return runtime
}

test('fresh community filters are unrestricted; legacy route snapshots retain exact manual conditions', () => {
  const first = initialCommunityQuery()
  assert.equal(first.mcVersion, ''); assert.equal(first.loader, '')
  const previous = { query: { ...query, keyword: '中文查询', mcVersion: '24w14potato', loader: 'quilt' as const } }
  const restored = initialCommunityQuery(previous)
  assert.equal(restored.mcVersion, '24w14potato'); assert.equal(restored.loader, 'quilt'); assert.equal(restored.keyword, '中文查询')
  assert.deepEqual(initialCommunityVersionSelection(previous), { source: 'custom', instance: '', loaderSource: 'manual' })
})

test('explicit installed selection uses precise Minecraft version, preserves independent loader choice and rejects unknown/unfinished instances', () => {
  const first = chooseCommunityInstance(target, initialCommunityVersionSelection(), '')!
  assert.equal(first.mcVersion, '1.20.1'); assert.equal(first.loader, 'fabric'); assert.equal(first.selection.loaderSource, 'instance')
  const manual = chooseCommunityInstance(target, { source: 'custom', instance: '', loaderSource: 'manual' }, 'forge')!
  assert.equal(manual.loader, 'forge'); assert.equal(manual.selection.loaderSource, 'manual')
  for (const v of [{ ...target, incomplete: true }, { ...target, failed: true }, { ...target, mcVersion: '未知' }]) assert.equal(chooseCommunityInstance(v, first.selection, 'fabric'), undefined)
  assert.equal(target.id, 'named-instance', 'filter selection never rewrites an installed instance')
})

test('official common names and previous launcher wording resolve to the same explicit source slug', () => {
  for (const [a, b, slug] of [['悠然一派', '大气', 'atmospheric'], ['秋原', '秋意', 'autumnity'], ['碧海新生', '升级水域', 'upgrade-aquatic'], ['末地拓展', '末地扩展', 'endergetic'], ['静谧季节', '静谧四季/季节', 'serene-seasons']]) {
    assert.deepEqual(chineseModSearchTerms(a), [slug]); assert.deepEqual(chineseModSearchTerms(b), [slug])
  }
  assert.deepEqual(chineseModSearchTerms('不存在的网络翻译结果'), [])
})

test('MC百科 explicit slash aliases outrank substrings; equal named entries remain separately identified', async () => {
  assert.equal(mcmodNameRank('静谧四季/季节 (Serene Seasons)', '季节'), 1)
  const page = search([['1', '季节：附加 (Addon)'], ['2', '静谧四季/季节 (Serene Seasons)'], ['3', '季节 (Another Season)']])
  assert.deepEqual(parseMcmodSearch(page, '季节').map(r => r.id), ['3', '2'])
  const result = await lookupMcmod('山海之境', async input => {
    const url = new URL(String(input))
    return html(url.hostname === 'search.mcmod.cn' ? search([['71', '山海之境 (First)'], ['72', '山海之境 (Second)']]) : entry('山海之境', 'https://modrinth.com/mod/' + (url.pathname.includes('71') ? 'first-world' : 'second-world')))
  })
  assert.equal(result.entries.length, 2)
  assert.deepEqual(result.entries.flatMap(r => r.projects.map(p => p.slug)).sort(), ['first-world', 'second-world'])
})

test('changed MC百科 entry names cannot bind a stale search hit to unrelated project links', async () => {
  for (const changed of ['同名条目已更换', '山海之境：附加']) {
    const result = await lookupMcmod('山海之境', async input => html(String(input).includes('search.mcmod.cn') ? search([['71', '山海之境 (World)']]) : entry(changed, 'https://modrinth.com/mod/unrelated-project')))
    assert.deepEqual(result.entries, []); assert(result.warnings.some(w => w.includes('名称已变化')))
  }
})

test('single Chinese alias preserves domestic results, excludes similarly named addons, and keeps exact version/loader filters', async t => {
  const requests: URL[] = []
  const runtime = await fixture(t, async input => {
    const u = new URL(String(input)); requests.push(u)
    const k = u.searchParams.get('query'), hits = k === '悠然一派' ? [{ project_id: 'domestic', slug: 'domestic', title: '悠然一派中文项目' }]
      : [{ project_id: 'wrong-first', slug: 'atmospheric-addon', title: 'Atmospheric Addon' }, { project_id: 'correct', slug: 'atmospheric', title: 'Atmospheric' }]
    return Response.json({ hits, total_hits: hits.length })
  })
  const a = await runtime.communitySearchPage({ ...query, limit: 1 }), b = await runtime.communitySearchPage({ ...query, limit: 1, offset: 1 })
  assert.equal(a.total, 2); assert.deepEqual([...a.items, ...b.items].map(r => r.projectId), ['domestic', 'correct'])
  assert.equal(requests.length, 2, 'same catalog reused for the next page')
  for (const u of requests) { const facets = JSON.parse(u.searchParams.get('facets')!).flat(); assert(facets.includes('versions:1.20.1') && facets.includes('categories:forge') && facets.includes('project_type:mod')) }
})

test('failed alias lookup preserves original search and is retried instead of negative-cached', async t => {
  let fail = true, aliases = 0
  const runtime = await fixture(t, async input => {
    const k = new URL(String(input)).searchParams.get('query')
    if (k === 'autumnity') { aliases++; if (fail) return new Response('', { status: 503 }) }
    return Response.json({ hits: [{ project_id: k === '秋原' ? 'domestic' : 'official', slug: k === '秋原' ? 'native-autumn' : 'autumnity', title: String(k) }], total_hits: 1 })
  })
  const a = await runtime.communitySearchPage({ ...query, keyword: '秋原' })
  assert.deepEqual(a.items.map(r => r.projectId), ['domestic']); assert(a.warnings?.some(w => w.includes('查询失败')))
  fail = false
  const b = await runtime.communitySearchPage({ ...query, keyword: '秋原' })
  assert.deepEqual(b.items.map(r => r.projectId), ['domestic', 'official']); assert(aliases >= 2)
})

test('original Chinese service failure preserves verified alias success and remains uncached; all failed paths still fail', async t => {
  let failingOriginal = true, failingAlias = false, originals = 0
  const runtime = await fixture(t, async input => {
    const k = new URL(String(input)).searchParams.get('query')
    if (k === '钠') { originals++; if (failingOriginal) return new Response('', { status: 503 }) }
    if (k === 'sodium' && failingAlias) return new Response('', { status: 503 })
    return Response.json({ hits: [{ project_id: k === '钠' ? 'domestic' : 'official', slug: k === '钠' ? 'domestic-sodium' : 'sodium', title: String(k) }], total_hits: 1 })
  })
  const a = await runtime.communitySearchPage({ ...query, keyword: '钠' })
  assert.deepEqual(a.items.map(r => r.projectId), ['official']); assert(a.warnings?.some(w => w.includes('原中文关键词查询失败')))
  failingOriginal = false
  const b = await runtime.communitySearchPage({ ...query, keyword: '钠' })
  assert.deepEqual(b.items.map(r => r.projectId), ['domestic', 'official']); assert(originals >= 2)
  // A distinct query filter avoids the successful snapshot and probes real
  // failure behavior, without rewriting or clearing private product caches.
  failingOriginal = true; failingAlias = true
  await assert.rejects(runtime.communitySearchPage({ ...query, keyword: '钠', mcVersion: '1.21.1' }), /503/)
})

test('MC百科 explicit linked identity remains usable when the original Chinese provider query fails', async t => {
  const runtime = await fixture(t, async input => {
    const u = new URL(String(input))
    if (u.hostname === 'search.mcmod.cn') return html(search([['777', '山海之境 (World)']]))
    if (u.hostname === 'www.mcmod.cn') return html(entry('山海之境', 'https://modrinth.com/mod/world-of-mountains'))
    const k = u.searchParams.get('query')
    if (k === '山海之境') return new Response('', { status: 503 })
    return Response.json({ hits: [{ project_id: 'actual-linked', slug: 'world-of-mountains', title: 'Mountain World' }], total_hits: 1 })
  })
  const a = await runtime.communitySearchPage({ ...query, keyword: '山海之境' })
  assert.deepEqual(a.items.map(r => r.projectId), ['actual-linked']); assert(a.warnings?.some(w => w.includes('原中文关键词查询失败')))
})

test('known local alias with a different repository slug falls back to explicit MC百科 source identity, never a search first-hit', async t => {
  const runtime = await fixture(t, async input => {
    const u = new URL(String(input))
    if (u.hostname === 'search.mcmod.cn') return html(search([['260', '应用能源2 (Applied Energistics 2)']]))
    if (u.hostname === 'www.mcmod.cn') return html(entry('应用能源2', 'https://modrinth.com/mod/ae2'))
    const k = u.searchParams.get('query'), hits = k === 'ae2' ? [{ project_id: 'wrong', slug: 'ae2-addon', title: 'AE2 addon' }, { project_id: 'real', slug: 'ae2', title: 'Applied Energistics 2' }] : []
    return Response.json({ hits, total_hits: hits.length })
  })
  const a = await runtime.communitySearchPage({ ...query, keyword: '应用能源2' })
  assert.deepEqual(a.items.map(r => r.projectId), ['real']); assert(a.warnings?.some(w => w.includes('明确链接')))
})

/** Compile the actual product setup and mount it with real Vue lifecycle hooks.
 * Source metadata transport and DOM renderer host are synthetic; no GUI or live
 * service claim. Every transition below calls the compiled product handlers. */
async function mountedCommunity() {
  const descriptor = parse(fs.readFileSync('src/renderer/src/views/CommunityView.vue', 'utf8')).descriptor
  const script = compileScript(descriptor, { id: 'community-120-real-setup' }).content
  const requests: Array<{ query: any; resolve: (v: any) => void }> = [], fileRequests: any[] = [], state: any = {}
  const fixture = { state, store: reactive({ installed: [target], settings: { theme: 'black-orange' }, searchKeyword: '' }), selected: ref(target), requests, fileRequests }
  const code = (await build({ stdin: { contents: script, loader: 'ts', resolveDir: path.resolve('src/renderer/src/views') }, bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', logLevel: 'silent', plugins: [{ name: 'scoped-community-transport-and-child-host-fixtures', setup(b) {
    b.onResolve({ filter: /\.vue$/ }, () => ({ path: 'child-host', namespace: 'fixture' }))
    b.onResolve({ filter: /^\.\.\/(api|store|modFavorites)$/ }, args => ({ path: args.path.split('/').at(-1)!, namespace: 'fixture' }))
    b.onResolve({ filter: /^@shared\// }, args => ({ path: path.resolve('src/shared', args.path.slice('@shared/'.length) + '.ts') }))
    b.onLoad({ filter: /.*/, namespace: 'fixture' }, args => ({ loader: 'ts', contents: args.path === 'api' ? `const f=globalThis.fixture; export const communitySearch=q=>new Promise(resolve=>f.requests.push({query:{...q},resolve})); export const communityFiles=(...a)=>{f.fileRequests.push(a);return Promise.resolve([])}; export const getManifest=()=>Promise.resolve([{id:'1.21.1',type:'release'},{id:'1.20.1',type:'release'}]); export const getModTargets=()=>Promise.resolve({versions:f.store.installed,errors:[]}); export const errText=e=>String(e); export const communityDownload=()=>Promise.reject('not an install test');`
      : args.path === 'store' ? `const f=globalThis.fixture; export const store=f.store,selectedInstance=f.selected;export const toast=()=>{};export const displayVersionName=v=>v.id;`
      : args.path === 'modFavorites' ? `export const favorites=[],favoriteBusy=new Set(); export const loadFavorites=async()=>{};export const toggleProject=()=>{};`
      : 'export default {}' }))
  } }] })).outputFiles[0].text
  const require = createRequire(path.resolve('package.json')), vue = require('vue'), module = { exports: {} as any }
  const content: any = { scrollTop: 0 }, document = { querySelector: (s: string) => s === '.content' ? content : null }
  class Observer { observe() {} disconnect() {} }
  new Function('require', 'module', 'exports', 'globalThis', 'document', 'ResizeObserver', 'IntersectionObserver', code)(require, module, module.exports, { fixture }, document, Observer, Observer)
  const component = module.exports.default, setup = component.setup
  component.setup = (props: any, context: any) => { fixture.state.current = setup(props, context); return fixture.state.current }
  component.render = () => vue.h('div', 'synthetic lifecycle host')
  const node = (text = ''): any => ({ text, children: [], parent: null })
  const renderer = vue.createRenderer({ createElement: node, createText: node, createComment: node, setText: (n: any, t: string) => n.text = t, setElementText: (n: any, t: string) => n.text = t, patchProp() {}, parentNode: (n: any) => n.parent, nextSibling: () => null,
    insert(n: any, p: any) { n.parent = p; p.children.push(n) }, remove(n: any) { n.parent.children.splice(n.parent.children.indexOf(n), 1); n.parent = null } })
  const mount = async () => { const app = renderer.createApp(component); app.mount(node()); await vue.nextTick(); await new Promise(resolve => setImmediate(resolve)); return app }
  const resolveLast = async (title = 'Actual fixture response') => { const request = requests.at(-1)!; request.resolve({ items: [{ source: 'modrinth', projectId: title, slug: 'fixture', title, description: '', downloads: 0, author: '' }], total: 1, offset: 0, limit: 20 }); await new Promise(resolve => setImmediate(resolve)) }
  return { fixture, mount, resolveLast, requests, vue }
}

test('actual compiled community defaults to all, keeps exact explicit choices on route return, and does not select the launcher instance', async () => {
  const h = await mountedCommunity(), app = await h.mount(), s = h.fixture.state.current
  assert.equal(h.requests[0].query.mcVersion, undefined); assert.equal(h.requests[0].query.loader, undefined)
  await h.resolveLast(); s.useInstance(s.installedVersionOptions.value[0].value)
  assert.equal(h.requests.at(-1)!.query.mcVersion, '1.20.1'); assert.equal(h.requests.at(-1)!.query.loader, 'fabric')
  const selected = h.fixture.selected.value
  s.query.loader = 'forge'; s.loaderChanged(); s.useInstance(s.installedVersionOptions.value[0].value)
  assert.equal(s.query.loader, 'forge'); assert.equal(s.manualLoaderMismatch.value, true); assert.equal(h.fixture.selected.value, selected)
  s.chooseVersionSource('custom'); s.query.mcVersion = '24w14potato'; s.customVersionChanged(); s.query.keyword = '返回后保留'; s.onSearch(); await h.resolveLast('route-kept-result')
  const count = h.requests.length; app.unmount(); const returned = await h.mount(), restored = h.fixture.state.current
  assert.equal(restored.query.mcVersion, '24w14potato'); assert.equal(restored.query.loader, 'forge'); assert.equal(restored.query.keyword, '返回后保留')
  assert.equal(restored.versionSelection.source, 'custom'); assert.equal(restored.results.value[0].title, 'route-kept-result'); assert.equal(h.requests.length, count, 'route return retains results without implicitly searching again')
  restored.chooseVersionSource('all'); assert.equal(h.requests.at(-1)!.query.mcVersion, undefined); assert.equal(h.requests.at(-1)!.query.loader, 'forge', 'user independently selected loader is visibly retained')
  returned.unmount()
})

test('actual compiled community ignores old response after a new exact version query and after leaving the route', async () => {
  const h = await mountedCommunity(), app = await h.mount(), s = h.fixture.state.current, first = h.requests[0]
  s.chooseVersionSource('custom'); s.query.mcVersion = '26.3'; s.customVersionChanged(); const newer = h.requests.at(-1)!
  newer.resolve({ items: [], total: 0, offset: 0, limit: 20 }); await new Promise(resolve => setImmediate(resolve))
  first.resolve({ items: [{ title: 'stale old version' }], total: 1, offset: 0, limit: 20 }); await new Promise(resolve => setImmediate(resolve))
  assert.deepEqual(s.results.value, []); assert.equal(s.query.mcVersion, '26.3')
  s.onSearch(); const late = h.requests.at(-1)!; app.unmount(); late.resolve({ items: [{ title: 'late after unmount' }], total: 1, offset: 0, limit: 20 }); await new Promise(resolve => setImmediate(resolve))
  assert.deepEqual(s.results.value, [])
})
