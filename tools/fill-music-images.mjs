/**
 * 补齐音乐页缺失封面 / 头像（v3：严格匹配，宁缺勿错）
 *
 * 规则：**标题和艺人必须都匹配**才接受 ——
 *   v2 只要求「标题或艺人匹配」，结果把《感同身受》配上了 Brighton Liu 的封面、
 *   把《Bittersweet Poetry》配成了 Kanye 的《Homecoming》，全是错的。
 *   配错封面比没有封面更糟，所以这里宁缺勿错。
 * 另外处理繁体：iTunes 中文曲库常用繁体（吻別 / 楓葉做的風鈴 / 愛愛愛），
 *   标题和艺人名都做一次繁→简归一；艺人还支持英文别名（张学友=Jacky Cheung）。
 */
import fs from 'node:fs'
import path from 'node:path'

const OUT = path.resolve('public/music')
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, '').slice(0, 48)

const T2S = { 別: '别', 楓: '枫', 葉: '叶', 風: '风', 鈴: '铃', 愛: '爱', 於: '于', 裏: '里', 後: '后', 樂: '乐', 聲: '声', 聽: '听', 說: '说', 個: '个', 們: '们', 這: '这', 為: '为', 與: '与', 從: '从' }
const conv = (s) => String(s || '').replace(/[別楓葉風鈴愛於裏後樂聲聽說個們這為與從]/g, (c) => T2S[c] || c)
const norm = (s) => conv(String(s || '').toLowerCase()).replace(/[^a-z0-9\u4e00-\u9fa5]/g, '')
const base = (s) => norm(String(s || '').replace(/[（(【\[].*?[）)】\]]/g, '').replace(/\s*[-–—]\s*(remix|live|acoustic|remaster(ed)?)\b.*$/i, ''))

/* 艺人的英文别名（iTunes 里华人歌手多用英文名） */
const ALIAS = {
  张学友: ['jacky cheung'],
  方大同: ['khalil fong'],
  华晨宇: ['hua chenyu', 'huachenyu'],
  幼稚园杀手: ['kindergarten killer'],
}

const artistMatch = (hitArtist, queryArtist) => {
  const a = norm(hitArtist), q = norm(queryArtist)
  if (!q) return false
  if (a.includes(q) || q.includes(a)) return true
  return (ALIAS[queryArtist] || []).some((x) => a.includes(norm(x)))
}

async function search(term, country, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=12&country=${country}`)
      if (r.ok) { const t = await r.text(); if (t.trim()) return JSON.parse(t).results || [] }
    } catch { /* retry */ }
    await wait(2500 * (i + 1))
  }
  return []
}

async function download(url, file) {
  const dst = path.join(OUT, file)
  if (fs.existsSync(dst)) return true
  try {
    const r = await fetch(url)
    if (!r.ok) return false
    fs.writeFileSync(dst, Buffer.from(await r.arrayBuffer()))
    return true
  } catch { return false }
}

/* 只接受「标题命中 + 艺人命中」 */
function pick(hits, title, artist) {
  const nt = norm(title), nb = base(title)
  const main = artist.split(' / ')[0]
  for (const h of hits) {
    const t = norm(h.trackName), tb = base(h.trackName)
    const titleOk = t === nt || tb === nb || (nb.length >= 3 && (tb.includes(nb) || nb.includes(tb)))
    if (!titleOk) continue
    const anyArtistOk = [main, ...artist.split(' / ')].some((a) => artistMatch(h.artistName, a.trim()))
    if (anyArtistOk) return h
  }
  return null
}

const SONGS = [
  ['热身freestyle', 'Zh0yu3q1yg'],
  ['Break the Fall (Acoustic)', 'Swsh'],
  ['Logic - Dear god (remix)', '法老'],
  ['I.D.W.G.A.J', 'LAUSSE THE CAT'],
  ['山沟沟的作家', 'FLOOD芙拉得 / yama亚麻'],
  ['自夸小队', '某幻君 / 老番茄 / 王瀚哲 (中国BOY) / 花少北'],
  ['秃爵', '某幻君 / 老番茄'],
  ['感同身受', '某幻君'],
  ['天使与魔鬼', '幼稚园杀手 / 幸存者联盟'],
  ['嘴硬', '幼稚园杀手'],
  ['吻别', '张学友'],
  ['枫叶做的风铃', '方大同'],
  ['Bittersweet Poetry', 'Kanye West / John Mayer'],
  ['爱爱爱', '方大同'],
  ['Diamonds From Sierra Leone (Remix)', 'Kanye West / JAŸ-Z'],
  ['Thinkin Bout You (Spring Sampler / 2012)', 'Frank Ocean'],
]

async function main() {
  const result = { songs: [], artists: [] }
  for (const [title, artist] of SONGS) {
    const main = artist.split(' / ')[0]
    let hits = await search(`${main} ${title}`, 'us')
    if (!hits.length) { await wait(900); hits = await search(title, 'cn') }
    if (!hits.length) { await wait(900); hits = await search(title, 'us') }
    const best = hits.length ? pick(hits, title, artist) : null
    let cover = ''
    if (best) {
      const url = (best.artworkUrl100 || '').replace('100x100bb', '600x600bb')
      const file = `s-${slug(title + artist)}.jpg`
      if (await download(url, file)) cover = `/music/${file}`
    }
    result.songs.push({ title, artist, coverUrl: cover })
    console.log(`${cover ? '✓' : '✗'} ${title}${best ? `  [${best.trackName} / ${best.artistName}]` : '  (无匹配)'}`)
    await wait(1300)
  }
  fs.writeFileSync('.tmp/fill-result.json', JSON.stringify(result, null, 1))
  console.log(`\n单曲封面 ${result.songs.filter((s) => s.coverUrl).length}/${result.songs.length}`)
}
main()
