/**
 * 音乐页图片抓取 v4 —— 全部 collectionId 已联网核实
 *
 * 源：iTunes / Apple Music（600x600 正方形封面，配 VinylDisc 正好）
 * 单曲复用所属专辑封面（单曲页也多是这样，且避免 search 的误匹配）
 *
 * 未能从 iTunes 取到的：
 *   - My Bloody Valentine《loveless》→ 美区没上架，另走 Wikipedia（见 fetch-music-wiki.mjs）
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = 'F:/self/网站'
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

async function jget(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
async function save(url, out) {
  mkdirSync(resolve(out, '..'), { recursive: true })
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'image/*' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  writeFileSync(out, Buffer.from(await res.arrayBuffer()))
}

/* 已核实的 collectionId */
const ID = {
  antsFromUpThere: 1586070259, // Black Country, New Road
  ourHope: 1615341464, // Hitsujibungaku 羊文学
  purpleRain: 1746833068, // Prince
  kidA: 1097862870, // Radiohead
  jiXinan: 1545534900, // 万能青年旅店
  forEmma: 947059824, // Bon Iver
  blonde: 1146195596, // Frank Ocean
  lemonade: 1460473526, // Beyoncé
  inRainbows: 1109714933, // Radiohead
  fantasy: 1721454234, // 周杰伦 范特西
  madvillainy: 887699504, // Madvillain
  wanqingDebut: 1545534900, // 万青首专（与冀西南同一个条目，用作秦皇岛封面）
}

const PLAN = [
  ['al-ants-from-up-there', ID.antsFromUpThere],
  ['al-our-hope', ID.ourHope],
  ['al-purple-rain', ID.purpleRain],
  ['al-kid-a', ID.kidA],
  ['al-ji-xinan-lin-lu-xing', ID.jiXinan],
  ['al-for-emma', ID.forEmma],
  ['al-blonde', ID.blonde],
  ['al-lemonade', ID.lemonade],
  ['al-in-rainbows', ID.inRainbows],
  ['al-fantasy', ID.fantasy],
  ['al-madvillainy', ID.madvillainy],

  ['s-burning', ID.ourHope],
  ['s-basketball-shoes', ID.antsFromUpThere],
  ['s-when-doves-cry', ID.purpleRain],
  ['s-everything-right-place', ID.kidA],
  ['s-qinhuangdao', ID.wanqingDebut],
  ['s-skinny-love', ID.forEmma],
  ['s-hebei-moqilin', ID.jiXinan],
  ['s-nights', ID.blonde],
  ['s-weird-fishes', ID.inRainbows],
  ['s-accordion', ID.madvillainy],
  ['s-ai-zai-xiyuan-qian', ID.fantasy],
  ['latest-burning', ID.ourHope],
]

async function main() {
  const cache = new Map()
  async function artFor(id) {
    if (cache.has(id)) return cache.get(id)
    const d = await jget(`https://itunes.apple.com/lookup?id=${id}&country=US`)
    const r = (d.results || [])[0]
    if (!r) throw new Error(`collectionId ${id} 无结果`)
    const url = (r.artworkUrl100 || '').replace('100x100bb', '600x600bb')
    console.log(`  · ${r.artistName} / ${r.collectionName}`)
    cache.set(id, url)
    return url
  }
  let ok = 0
  for (const [name, id] of PLAN) {
    try {
      await save(await artFor(id), resolve(ROOT, '.tmp', 'covers-music', `${name}.jpg`))
      console.log(`  ✓ ${name}.jpg`)
      ok++
    } catch (e) {
      console.log(`  ✗ ${name}：${e.message}`)
    }
  }
  console.log(`完成 ${ok}/${PLAN.length}`)
}

main().catch((e) => {
  console.error('FATAL', e)
  process.exit(1)
})
