/** 补抓未命中的歌曲封面：放宽匹配 + 多 storefront */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = 'F:/self/网站'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
const OUT = resolve(ROOT, '.tmp', 'covers-songs')
const MAP = resolve(ROOT, '.tmp', 'songs-cover-map.json')

const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, '')
const slug = (s) => norm(s).slice(0, 40) || 'x'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function jget(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!r.ok) throw new Error('HTTP ' + r.status)
  return r.json()
}
async function save(url, out) {
  const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'image/*' } })
  if (!r.ok) throw new Error('HTTP ' + r.status)
  writeFileSync(out, Buffer.from(await r.arrayBuffer()))
}

const map = JSON.parse(readFileSync(MAP, 'utf8'))
const songs = JSON.parse(readFileSync(resolve(ROOT, '.tmp', 'songs.json'), 'utf8'))
const todo = songs.filter((s) => !map[`${s.t}|||${(s.a || '').split('/')[0].trim()}`])

const STORES = ['US', 'CN', 'TW', 'JP']
let ok = 0

for (const s of todo) {
  const main = (s.a || '').split('/')[0].trim()
  const key = `${s.t}|||${main}`
  const wantT = norm(s.t)
  let done = false
  for (const cc of STORES) {
    if (done) break
    try {
      const d = await jget(
        `https://itunes.apple.com/search?term=${encodeURIComponent(main + ' ' + s.t)}&entity=song&limit=10&country=${cc}`,
      )
      const rs = (d.results || []).filter((r) => r.artworkUrl100)
      if (!rs.length) continue
      // 放宽：标题前缀/包含 或 艺人包含，二者满足其一即可
      const hit =
        rs.find((r) => norm(r.trackName).includes(wantT) || wantT.includes(norm(r.trackName))) ||
        rs.find((r) => norm(r.artistName).includes(norm(main))) ||
        rs[0]
      const album = hit.collectionName || hit.trackName
      const art = hit.artworkUrl100.replace('100x100bb', '600x600bb')
      const file = `s-${slug(album + '-' + hit.artistName)}.jpg`
      await save(art, resolve(OUT, file))
      map[key] = { cover: `/music/${file}`, album, artist: hit.artistName }
      ok++
      done = true
    } catch (e) {
      /* 换下一个 storefront */
    }
    await sleep(150)
  }
  await sleep(120)
}

writeFileSync(MAP, JSON.stringify(map, null, 1), 'utf8')
const total = songs.length
const hit = Object.values(map).filter(Boolean).length
console.log(`补抓 ${ok} 首；现在命中 ${hit}/${total}，仍缺 ${total - hit}`)
