/**
 * 给「人生必听歌单」的 46 首补封面（iTunes Search，Apple 图床可直连）
 * 输出：public/music/s-<slug>.jpg（600x600）
 */
import fs from 'node:fs'
import path from 'node:path'

const must = JSON.parse(fs.readFileSync('.tmp/must-listen.json', 'utf8'))
const OUT = path.resolve('public/music')
const CACHE = path.resolve('.tmp/must-covers.json')
fs.mkdirSync(OUT, { recursive: true })

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

function slug(title, artist) {
  return (title + artist).toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, '').slice(0, 48)
}

async function searchItunes(term) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=8&country=us`
  const res = await fetch(url)
  if (!res.ok) return []
  const j = await res.json()
  return j.results || []
}

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, '')

async function main() {
  const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {}
  const result = []

  for (let i = 0; i < must.length; i++) {
    const [title, artist] = must[i]
    const mainArtist = artist.split(' / ')[0]
    const key = `${title}|${artist}`
    let cover = cache[key] ?? null

    if (cover === undefined || cover === null) {
      let hits = []
      try { hits = await searchItunes(`${mainArtist} ${title}`) } catch { hits = [] }
      if (!hits.length) {
        try { hits = await searchItunes(title) } catch { hits = [] }
      }
      // 匹配：歌名一致 + 艺人包含
      const nt = norm(title)
      let best = hits.find((h) => norm(h.trackName) === nt && norm(h.artistName).includes(norm(mainArtist)))
      if (!best) best = hits.find((h) => norm(h.trackName) === nt)
      if (!best) best = hits.find((h) => norm(h.trackName).includes(nt) && norm(h.artistName).includes(norm(mainArtist)))
      cover = best ? (best.artworkUrl100 || '').replace('100x100bb', '600x600bb') : ''
      cache[key] = cover
      fs.writeFileSync(CACHE, JSON.stringify(cache, null, 1))
      await wait(350)
    }

    let file = ''
    if (cover) {
      file = `s-${slug(title, artist)}.jpg`
      const dst = path.join(OUT, file)
      if (!fs.existsSync(dst)) {
        try {
          const r = await fetch(cover)
          if (r.ok) fs.writeFileSync(dst, Buffer.from(await r.arrayBuffer()))
        } catch { /* 忽略 */ }
      }
    }
    result.push({ title, artist, coverUrl: file ? `/music/${file}` : '', itunes: cover })
    console.log(`${cover ? '✓' : '✗'} ${String(i + 1).padStart(2)} ${title} — ${artist}`)
  }

  fs.writeFileSync('.tmp/must-covers-result.json', JSON.stringify(result, null, 1))
  console.log(`\n有封面 ${result.filter((r) => r.coverUrl).length}/${result.length}`)
}

main()
