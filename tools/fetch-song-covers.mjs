/**
 * 歌曲封面：按「歌名 + 艺人」查 iTunes，取所属专辑封面。
 * 相同专辑复用同一个文件（去重），输出映射 songs-cover-map.json。
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = 'F:/self/网站'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
const OUT = resolve(ROOT, '.tmp', 'covers-songs')

const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, '')
const slug = (s) => norm(s).slice(0, 40) || 'x'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function jget(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error('HTTP ' + res.status)
  return res.json()
}
async function save(url, out) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'image/*' } })
  if (!res.ok) throw new Error('HTTP ' + res.status)
  writeFileSync(out, Buffer.from(await res.arrayBuffer()))
}

const songs = JSON.parse(readFileSync(resolve(ROOT, '.tmp', 'songs.json'), 'utf8'))
const map = {}
const albumCache = new Map()
let ok = 0, miss = 0

for (let i = 0; i < songs.length; i++) {
  const s = songs[i]
  const main = (s.a || '').split('/')[0].trim()
  const key = `${s.t}|||${main}`
  try {
    const d = await jget(
      `https://itunes.apple.com/search?term=${encodeURIComponent(main + ' ' + s.t)}&entity=song&limit=5&country=US`,
    )
    const rs = (d.results || []).filter((r) => r.artworkUrl100)
    const wantT = norm(s.t)
    const wantA = norm(main)
    const hit =
      rs.find((r) => norm(r.trackName) === wantT && norm(r.artistName).includes(wantA)) ||
      rs.find((r) => norm(r.trackName) === wantT) ||
      rs.find((r) => norm(r.artistName).includes(wantA))
    if (!hit) { miss++; map[key] = null; await sleep(200); continue }
    const album = hit.collectionName || hit.trackName
    const art = hit.artworkUrl100.replace('100x100bb', '600x600bb')
    const file = `s-${slug(album + '-' + hit.artistName)}.jpg`
    if (!albumCache.has(file)) {
      await save(art, resolve(OUT, file))
      albumCache.set(file, true)
    }
    map[key] = { cover: `/music/${file}`, album, artist: hit.artistName }
    ok++
  } catch (e) {
    miss++
    map[key] = null
  }
  await sleep(180)
}

mkdirSync(OUT, { recursive: true })
writeFileSync(resolve(ROOT, '.tmp', 'songs-cover-map.json'), JSON.stringify(map, null, 1), 'utf8')
console.log(`歌曲封面完成：命中 ${ok} / 未命中 ${miss} / 共 ${songs.length}`)
console.log(`去重后封面文件：${albumCache.size}`)
