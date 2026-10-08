/**
 * 专辑封面抓取 —— iTunes（免 key，600x600）
 *
 * 两份专辑清单：
 *   A. 最近收藏的 10 张
 *   B. 听得最多的 10 张
 * 结果按 slug 落到 .tmp/covers-albums/，之后再归一化到 public/music/
 *
 * 先用「艺人目录 + 专辑名匹配」（music 页踩过的坑：search 的 track 粒度匹配不可靠），
 * 目录里找不到再退回 search。
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = 'F:/self/网站'
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

const norm = (s) =>
  (s || '')
    .toLowerCase()
    .replace(/[（(].*?[)）]/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fff]/g, '')

async function jget(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error('HTTP ' + res.status)
  return res.json()
}
async function save(url, out) {
  mkdirSync(resolve(out, '..'), { recursive: true })
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'image/*' } })
  if (!res.ok) throw new Error('HTTP ' + res.status)
  const buf = Buffer.from(await res.arrayBuffer())
  writeFileSync(out, buf)
  return buf.length
}

async function artistId(name) {
  const d = await jget(
    `https://itunes.apple.com/search?term=${encodeURIComponent(name)}&entity=musicArtist&limit=10&country=US`,
  )
  const want = norm(name)
  const hit =
    (d.results || []).find((r) => norm(r.artistName) === want) ||
    (d.results || []).find((r) => {
      const a = norm(r.artistName)
      return a.includes(want) || want.includes(a)
    })
  return hit?.artistId || null
}
async function artistAlbums(id) {
  const d = await jget(`https://itunes.apple.com/lookup?id=${id}&entity=album&limit=200&country=US`)
  return (d.results || []).filter((r) => r.wrapperType === 'collection')
}
function matchAlbum(albums, title) {
  const want = norm(title)
  const scored = albums
    .map((a) => {
      const n = norm(a.collectionName)
      let score = -1
      if (n === want) score = 100
      else if (n.startsWith(want) || want.startsWith(n)) score = 80
      else if (n.includes(want) || want.includes(n)) score = 50
      if (score < 0) return null
      if (/deluxe|remaster|anniversary|karaoke|instrumental|live|tribute/i.test(a.collectionName))
        score -= 15
      return { a, score }
    })
    .filter(Boolean)
    .sort((x, y) => y.score - x.score)
  return scored.length ? scored[0].a : null
}

/* 清单：slug|专辑名|艺人 */
const ALBUMS = [
  // A. 最近收藏
  ['a-timeless', 'Timeless', 'Prince'],
  ['a-ok', 'OK', '张震岳'],
  ['a-groupies', 'Groupies 吉他手', '陈绮贞'],
  ['a-music-fashion-film', 'Music, Fashion, Film', 'Charli xcx'],
  ['a-niguang', '逆光', '孙燕姿'],
  ['a-born-to-die', 'Born To Die', 'Lana Del Rey'],
  ['a-my-everything', 'My Everything', 'Ariana Grande'],
  ['a-honestly-nevermind', 'Honestly, Nevermind', 'Drake'],
  ['a-bully', 'BULLY', 'Kanye West'],
  ['a-olivia-sad', 'you seem pretty sad for a girl so in love', 'Olivia Rodrigo'],
  // B. 听得最多
  ['b-blonde', 'Blonde', 'Frank Ocean'],
  ['b-new-world', '新世界NEW WORLD', '华晨宇'],
  ['b-starboy', 'Starboy', 'The Weeknd'],
  ['b-2014-fhd', '2014 Forest Hills Drive', 'J. Cole'],
  ['b-damn', 'DAMN.', 'Kendrick Lamar'],
  ['b-liangbian', '量变临界点', '华晨宇'],
  ['b-gnx', 'GNX', 'Kendrick Lamar'],
  ['b-astroworld', 'ASTROWORLD', 'Travis Scott'],
  ['b-divide', '÷', 'Ed Sheeran'],
  ['b-dawn-fm', 'Dawn FM', 'The Weeknd'],
]

async function main() {
  const cache = new Map()
  async function albumsOf(artist) {
    if (cache.has(artist)) return cache.get(artist)
    const id = await artistId(artist)
    if (!id) {
      console.log(`  · 找不到艺人：${artist}`)
      cache.set(artist, [])
      return []
    }
    const list = await artistAlbums(id)
    cache.set(artist, list)
    return list
  }

  for (const [slug, title, artist] of ALBUMS) {
    const out = resolve(ROOT, '.tmp', 'covers-albums', `${slug}.jpg`)
    try {
      let art = null
      let got = ''
      const list = await albumsOf(artist)
      const hit = matchAlbum(list, title)
      if (hit) {
        art = (hit.artworkUrl100 || '').replace('100x100bb', '600x600bb')
        got = hit.collectionName
      }
      if (!art) {
        // 退回 search
        const d = await jget(
          `https://itunes.apple.com/search?term=${encodeURIComponent(artist + ' ' + title)}&entity=album&limit=5&country=US`,
        )
        const r = (d.results || []).find((x) => x.artworkUrl100)
        if (r) {
          art = r.artworkUrl100.replace('100x100bb', '600x600bb')
          got = `${r.artistName} / ${r.collectionName}`
        }
      }
      if (!art) {
        console.log(`  ✗ ${slug}：找不到「${title}」（${artist}）`)
        continue
      }
      await save(art, out)
      console.log(`  ✓ ${slug}.jpg  ← ${got}`)
    } catch (e) {
      console.log(`  ✗ ${slug}：${e.message}`)
    }
  }
  console.log('done')
}

main().catch((e) => {
  console.error('FATAL', e)
  process.exit(1)
})
