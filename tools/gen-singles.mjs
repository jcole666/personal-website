/** 生成 music.js 里的 singles 数组（193 首，避免手写） */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = 'F:/self/网站'
const songs = JSON.parse(readFileSync(resolve(ROOT, '.tmp', 'songs.json'), 'utf8'))
const map = JSON.parse(readFileSync(resolve(ROOT, '.tmp', 'songs-cover-map.json'), 'utf8'))

const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")

let out = ''
let n = 0
for (const s of songs) {
  const main = (s.a || '').split('/')[0].trim()
  const hit = map[`${s.t}|||${main}`]
  n++
  const id = `sg-${n}`
  const cover = hit?.cover || ''
  const album = hit?.album || ''
  out += `    {\n`
  out += `      id: '${id}',\n`
  out += `      title: '${esc(s.t)}',\n`
  out += `      artist: '${esc(s.a)}',\n`
  if (album) out += `      album: '${esc(album)}',\n`
  out += `      coverUrl: '${cover}',\n`
  if (s.heart) out += `      heart: ${s.heart},\n`
  if (s.play) out += `      plays: ${s.play},\n`
  out += `    },\n`
}

writeFileSync(resolve(ROOT, '.tmp', 'singles-array.txt'), out, 'utf8')
const withCover = songs.filter((s) => map[`${s.t}|||${(s.a || '').split('/')[0].trim()}`]).length
console.log(`生成 ${n} 条；有封面 ${withCover} 条（${Math.round((withCover / n) * 100)}%）`)
