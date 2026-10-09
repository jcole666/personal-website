/**
 * 生成 src/data/movies.js —— 用豆瓣抓来的真实数据（.tmp/movies-raw/）
 *
 * 「我的评分 / 看过日期 / 片单标签」来自用户豆瓣截图（截图里读出来的，不是编的）；
 * 其余（导演、演员、类型、国家、时长、豆瓣评分、原名、海报）来自豆瓣接口。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..')
const RAW = path.join(ROOT, '.tmp/movies-raw')

/**
 * 截图里的信息：序号 → 我的评分、评语、看过日期、片单标签、类型
 *
 * ⚠️ 为什么要单独写类型：豆瓣 rexxar 接口的 genres 字段有时只回 3 个
 *   （比如《蜘蛛侠：纵横宇宙》只给「喜剧/动作/科幻」，漏了「动画/奇幻/冒险」，
 *   导致按「动画」筛选时它不出现）。截图里是完整的一行，所以以截图为准。
 */
const MINE = {
  '01': { mine: 5, label: '力荐', date: '2026-09-15', tag: '美国历史片榜' , genres: ['动作', '历史', '奇幻', '冒险']},
  '02': { mine: 5, label: '力荐', date: '2026-05-16', tag: '第28届上海国际电影节获奖名单' , genres: ['剧情', '家庭']},
  '03': { mine: 3, label: '还行', date: '2026-02-26', tag: '' , genres: ['剧情', '喜剧', '运动']},
  '04': { mine: 4, label: '推荐', date: '2025-12-19', tag: '' , genres: ['剧情', '喜剧', '爱情']},
  '05': { mine: 4, label: '推荐', date: '2025-12-18', tag: '英国爱情片榜' , genres: ['喜剧', '爱情']},
  '06': { mine: 4, label: '推荐', date: '2025-12-17', tag: '第43届英国电影学院奖获奖名单' , genres: ['剧情', '喜剧', '爱情']},
  '07': { mine: 5, label: '力荐', date: '2024-11-24', tag: '豆瓣电影Top250' , genres: ['剧情', '动画', '音乐']},
  '08': { mine: 5, label: '力荐', date: '2024-07-02', tag: '豆瓣电影Top250' , genres: ['剧情']},
  '09': { mine: 5, label: '力荐', date: '2023-09-18', tag: '豆瓣电影Top250' , genres: ['剧情', '科幻', '悬疑', '冒险']},
  '10': { mine: 5, label: '力荐', date: '2023-09-16', tag: '美国历史片榜' , genres: ['剧情', '传记', '历史']},
  '11': { mine: 4, label: '推荐', date: '2023-09-15', tag: '豆瓣电影Top250' , genres: ['剧情']},
  '12': { mine: 5, label: '力荐', date: '2023-07-30', tag: '美国动画片榜' , genres: ['喜剧', '动作', '科幻', '动画', '奇幻', '冒险']},
  '13': { mine: 5, label: '力荐', date: '2023-01-24', tag: '豆瓣电影Top250' , genres: ['剧情', '犯罪']},
  '14': { mine: 5, label: '力荐', date: '2023-01-23', tag: '豆瓣电影Top250' , genres: ['剧情', '爱情']},
  '15': { mine: 5, label: '力荐', date: '2023-01-23', tag: '豆瓣电影Top250' , genres: ['剧情', '家庭', '冒险']},
  '16': { mine: 5, label: '力荐', date: '2023-01-20', tag: '豆瓣电影Top250' , genres: ['剧情', '音乐']},
  '17': { mine: 5, label: '力荐', date: '2021-07-22', tag: '豆瓣电影Top250' , genres: ['喜剧', '爱情', '奇幻', '古装']},
}

const esc = (s) => String(s ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'")
const arr = (a) => `[${(a ?? []).map((x) => `'${esc(x)}'`).join(', ')}]`

const idxs = Object.keys(MINE).sort()
const movies = []
for (const idx of idxs) {
  const p = path.join(RAW, `${idx}-detail.json`)
  if (!fs.existsSync(p)) {
    console.log(`✗ 缺 ${idx}-detail.json`)
    continue
  }
  const d = JSON.parse(fs.readFileSync(p, 'utf8'))
  if (!d.title) {
    console.log(`✗ ${idx} 详情为空`)
    continue
  }
  const m = MINE[idx]
  movies.push({
    idx,
    id: `mv-${idx}`,
    doubanId: String(d.id ?? ''),
    title: d.title,
    originalTitle: d.original_title || '',
    year: Number(d.year) || null,
    posterUrl: `/movies/mv-${idx}.jpg`,
    poster: (d.pic?.large || '').replace(/\/[sml]_ratio_poster\//, '/l_ratio_poster/'),
    doubanRating: d.rating?.value ?? null,
    doubanVotes: d.rating?.count ?? null,
    myRating: m.mine,
    myLabel: m.label,
    watchedDate: m.date,
    tag: m.tag,
    genres: m.genres ?? d.genres ?? [],
    countries: d.countries ?? [],
    durations: d.durations ?? [],
    directors: (d.directors ?? []).map((x) => x.name),
    actors: (d.actors ?? []).slice(0, 5).map((x) => x.name),
  })
}

/* ===== 统计 ===== */
const withRating = movies.filter((m) => m.doubanRating)
const stats = {
  count: movies.length,
  avgDouban: withRating.length
    ? (withRating.reduce((s, m) => s + m.doubanRating, 0) / withRating.length).toFixed(1)
    : '—',
  fiveStar: movies.filter((m) => m.myRating === 5).length,
  firstDate: movies.length ? movies[movies.length - 1].watchedDate : '',
  lastDate: movies.length ? movies[0].watchedDate : '',
}

/* ===== 胶片 banner：力荐 + 豆瓣 Top250 里挑前 8 张 ===== */
const banner = movies.slice(0, 8)

/* ===== 类型标签（用于筛选），按出现次数排序 ===== */
const genreCount = new Map()
movies.forEach((m) => m.genres.forEach((g) => genreCount.set(g, (genreCount.get(g) ?? 0) + 1)))
const genres = [...genreCount.entries()].sort((a, b) => b[1] - a[1]).map(([g]) => g)

function movieBlock(m, indent = '    ') {
  const L = []
  L.push(`${indent}{`)
  L.push(`${indent}  id: '${m.id}',`)
  L.push(`${indent}  doubanId: '${m.doubanId}',`)
  L.push(`${indent}  title: '${esc(m.title)}',`)
  if (m.originalTitle) L.push(`${indent}  originalTitle: '${esc(m.originalTitle)}',`)
  L.push(`${indent}  year: ${m.year},`)
  L.push(`${indent}  posterUrl: '${m.posterUrl}',`)
  L.push(`${indent}  doubanRating: ${m.doubanRating ?? 'null'},`)
  L.push(`${indent}  myRating: ${m.myRating},`)
  L.push(`${indent}  myLabel: '${m.myLabel}',`)
  L.push(`${indent}  watchedDate: '${m.watchedDate}',`)
  if (m.tag) L.push(`${indent}  tag: '${esc(m.tag)}',`)
  L.push(`${indent}  genres: ${arr(m.genres)},`)
  L.push(`${indent}  countries: ${arr(m.countries)},`)
  L.push(`${indent}  durations: ${arr(m.durations)},`)
  L.push(`${indent}  directors: ${arr(m.directors)},`)
  L.push(`${indent}  actors: ${arr(m.actors)},`)
  L.push(`${indent}},`)
  return L.join('\n')
}

const out = `/**
 * 电影页数据 —— 露天影院
 *
 * ⚠️ 真实数据，不要编：
 *   - 「看过」清单来自用户豆瓣截图（片名/年份/我的星级/看过日期/片单标签）
 *   - 导演、演员、类型、国家、时长、豆瓣评分、原名、海报 来自豆瓣接口
 *     （tools/fetch-movies.sh 抓取 → tools/build-movies.mjs 生成）
 *   - 顺序 = 豆瓣列表顺序 = 看过时间倒序（最近看的在最前）
 *
 * 字段说明：
 *   myRating    我的星级 1–5（豆瓣的「力荐/推荐/还行」）
 *   myLabel     对应的文字评语
 *   doubanRating 豆瓣评分（不是我打的）
 *   tag         豆瓣给这部电影挂的片单标签，没有就留空
 */

const movieData = {
  stats: {
    count: ${stats.count},
    avgDouban: ${stats.avgDouban},
    fiveStar: ${stats.fiveStar},
    firstDate: '${stats.firstDate}',
    lastDate: '${stats.lastDate}',
  },

  /* 片单标签 / 类型，用于筛选 */
  genres: ${arr(genres)},

  /* 胶片 banner（取最近看的 8 部） */
  bannerMovies: [
${banner.map((m) => movieBlock(m, '    ')).join('\n')}
  ],

  /* 已看（豆瓣「看过」全量，倒序） */
  watched: [
${movies.map((m) => movieBlock(m, '    ')).join('\n')}
  ],
}

/* 按类型筛选（全部 = 返回原数组） */
export function filterMoviesByGenre(list, genre) {
  if (!genre) return list ?? []
  return (list ?? []).filter((m) => (m.genres ?? []).includes(genre))
}

export default movieData
`

fs.writeFileSync(path.join(ROOT, 'src/data/movies.js'), out)
console.log(`✓ 生成 src/data/movies.js：${movies.length} 部，类型 ${genres.length} 个`)
console.log(`  统计：${stats.count} 部 · 豆瓣均分 ${stats.avgDouban} · 五星 ${stats.fiveStar} 部`)
movies.forEach((m) => console.log(`  ${m.id} ${m.title}（${m.year}）豆瓣${m.doubanRating} 我${m.myRating}★ ${m.watchedDate}`))
