/** 把归一化后的图片路径写回 3 个数据文件（电影 / 游戏 / 市集） */
import { readFileSync, writeFileSync } from 'node:fs'

/* 逐行扫描：遇到 id 记下待填值，遇到空字段就填 */
function patch(text, map, field) {
  const lines = text.split('\n')
  let pending = null, n = 0
  for (let i = 0; i < lines.length; i++) {
    const st = lines[i].trim()
    if (st.startsWith("id: '")) {
      const key = st.split("'")[1]
      pending = map[key] ?? null
    }
    if (pending && (st === `${field}: '',` || st === `${field}: "",`)) {
      lines[i] = lines[i].replace(/''|""/, `'${pending}'`)
      pending = null
      n++
    }
  }
  return { text: lines.join('\n'), n }
}

/* ---------------- 电影 ---------------- */
{
  const p = 'F:/self/网站/src/data/movies.js'
  let s = readFileSync(p, 'utf8')

  const poster = {
    'w-1': '/movies/w-chungking-express.jpg',
    'w-2': '/movies/w-parasite.jpg',
    'w-3': '/movies/w-hanabun-no-koi.jpg',
    'w-4': '/movies/w-inception.jpg',
    'w-5': '/movies/w-shawshank.jpg',
    'w-6': '/movies/w-spirited-away.jpg',
    'w-7': '/movies/w-godfather.jpg',
    'w-8': '/movies/w-a-sun.jpg',
    'w-9': '/movies/w-spiderverse.jpg',
    'w-10': '/movies/w-let-bullets-fly.jpg',
    'w-11': '/movies/w-grand-budapest.jpg',
    'w-12': '/movies/w-umimachi-diary.jpg',
    'b-1': '/movies/b-chungking-express.jpg',
    'b-2': '/movies/b-parasite.jpg',
    'b-3': '/movies/b-hanabun-no-koi.jpg',
    'b-4': '/movies/b-spirited-away.jpg',
    'b-5': '/movies/b-let-bullets-fly.jpg',
    'b-6': '/movies/b-grand-budapest.jpg',
  }
  const people = {
    'p-1': '/movies/p-koreeda.jpg',
    'p-2': '/movies/p-hamaguchi.jpg',
    'p-3': '/movies/p-sakura-ando.jpg',
    'p-4': '/movies/p-wong-kar-wai.jpg',
    'p-5': '/movies/p-miyazaki.jpg',
    'p-6': '/movies/p-nolan.jpg',
  }
  let a = patch(s, poster, 'posterUrl')
  let b = patch(a.text, people, 'avatarUrl')
  // featured 没有 id 在 posterUrl 之前的位置，单独替换
  b.text = b.text.replace("    posterUrl: '',", "    posterUrl: '/movies/feat-your-name.jpg',")
  writeFileSync(p, b.text, 'utf8')
  console.log('movies.js  poster', a.n, ' avatar', b.n)
}

/* ---------------- 游戏（新增 coverUrl 字段） ---------------- */
{
  const p = 'F:/self/网站/src/data/games.js'
  let s = readFileSync(p, 'utf8')
  const cover = {
    botw: '/games/botw.jpg',
    'hollow-knight': '/games/hollow-knight.jpg',
    'elden-ring': '/games/elden-ring.jpg',
    stardew: '/games/stardew.jpg',
    'outer-wilds': '/games/outer-wilds.jpg',
    hades: '/games/hades.jpg',
    celeste: '/games/celeste.jpg',
    'slay-spire': '/games/slay-spire.jpg',
    ori: '/games/ori.jpg',
    portal2: '/games/portal2.jpg',
  }
  const lines = s.split('\n')
  let cur = null, n = 0
  const out = []
  for (const ln of lines) {
    out.push(ln)
    const st = ln.trim()
    if (st.startsWith("id: '")) cur = st.split("'")[1]
    // 在 genre 行后插入 coverUrl（每条游戏都有 genre）
    if (cur && cover[cur] && /^genre: '/.test(st)) {
      const indent = ln.match(/^\s*/)[0]
      out.push(`${indent}coverUrl: '${cover[cur]}',`)
      cur = null
      n++
    }
  }
  writeFileSync(p, out.join('\n'), 'utf8')
  console.log('games.js  插入 coverUrl', n)
}

/* ---------------- 市集 ---------------- */
{
  const p = 'F:/self/网站/src/data/food.js'
  const s = readFileSync(p, 'utf8')
  const map = {}
  for (const pre of ['d', 'm', 's', 't']) for (let i = 1; i <= 6; i++) map[`${pre}-${i}`] = `/food/${pre}-${i}.jpg`
  for (let i = 1; i <= 8; i++) map[`sh-${i}`] = `/food/sh-${i}.jpg`
  const r = patch(s, map, 'photoUrl')
  writeFileSync(p, r.text, 'utf8')
  console.log('food.js   photoUrl', r.n)
}
