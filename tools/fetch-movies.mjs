/**
 * 抓取电影页数据（豆瓣）
 *
 * 数据来源：用户提供的豆瓣「看过」列表截图。
 * 本脚本负责把截图里的片名+年份，换成豆瓣上的权威信息（导演/演员/类型/国家/评分/海报）。
 *
 * 两个接口（均直连可用，不需要代理）：
 *   1. movie.douban.com/j/subject_suggest?q=   → 拿 subject id（按年份匹配，避免同名片）
 *   2. m.douban.com/rexxar/api/v2/movie/<id>   → 拿完整条目（需带 Referer）
 *
 * ⚠️ 不要用 movie.douban.com/subject/<id>/ —— 会 302 到登录/验证页。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

/** 截图里读出来的 17 部（顺序 = 豆瓣列表顺序 = 看过时间倒序） */
const LIST = [
  { q: '奥德赛', year: 2026, mine: 5, label: '力荐', date: '2026-09-15', tag: '美国历史片榜' },
  { q: '给阿嬷的情书', year: 2026, mine: 5, label: '力荐', date: '2026-05-16', tag: '第28届上海国际电影节获奖名单' },
  { q: '飞驰人生3', year: 2026, mine: 3, label: '还行', date: '2026-02-26', tag: '' },
  { q: '爱情三选一', year: 2008, mine: 4, label: '推荐', date: '2025-12-19', tag: '' },
  { q: '诺丁山', year: 1999, mine: 4, label: '推荐', date: '2025-12-18', tag: '英国爱情片榜' },
  { q: '当哈利遇到莎莉', year: 1989, mine: 4, label: '推荐', date: '2025-12-17', tag: '第43届英国电影学院奖获奖名单' },
  { q: '机器人之梦', year: 2023, mine: 5, label: '力荐', date: '2024-11-24', tag: '豆瓣电影Top250' },
  { q: '死亡诗社', year: 1989, mine: 5, label: '力荐', date: '2024-07-02', tag: '豆瓣电影Top250' },
  { q: '盗梦空间', year: 2010, mine: 5, label: '力荐', date: '2023-09-18', tag: '豆瓣电影Top250' },
  { q: '奥本海默', year: 2023, mine: 5, label: '力荐', date: '2023-09-16', tag: '美国历史片榜' },
  { q: '超脱', year: 2011, mine: 4, label: '推荐', date: '2023-09-15', tag: '豆瓣电影Top250' },
  { q: '蜘蛛侠：纵横宇宙', year: 2023, mine: 5, label: '力荐', date: '2023-07-30', tag: '美国动画片榜' },
  { q: '肖申克的救赎', year: 1994, mine: 5, label: '力荐', date: '2023-01-24', tag: '豆瓣电影Top250' },
  { q: '情书', year: 1995, mine: 5, label: '力荐', date: '2023-01-23', tag: '豆瓣电影Top250' },
  { q: '海蒂和爷爷', year: 2015, mine: 5, label: '力荐', date: '2023-01-23', tag: '豆瓣电影Top250' },
  { q: '海上钢琴师', year: 1998, mine: 5, label: '力荐', date: '2023-01-20', tag: '豆瓣电影Top250' },
  { q: '大话西游之大圣娶亲', year: 1995, mine: 5, label: '力荐', date: '2021-07-22', tag: '豆瓣电影Top250' },
]

const OUT_DIR = path.resolve(fileURLToPath(import.meta.url), '../../.tmp/movies-raw')
fs.mkdirSync(OUT_DIR, { recursive: true })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function getJSON(url, referer) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, ...(referer ? { Referer: referer } : {}) },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`)
  return res.json()
}

async function pickSubject(item) {
  const list = await getJSON(
    `https://movie.douban.com/j/subject_suggest?q=${encodeURIComponent(item.q)}`,
  )
  if (!Array.isArray(list) || !list.length) return null
  const exact = list.filter((x) => String(x.year) === String(item.year))
  const pick = exact[0] ?? list[0]
  return pick
}

const result = []
for (const item of LIST) {
  try {
    const sub = await pickSubject(item)
    if (!sub) {
      console.log(`✗ ${item.q}：suggest 无结果`)
      result.push({ ...item, id: null })
      continue
    }
    const detail = await getJSON(
      `https://m.douban.com/rexxar/api/v2/movie/${sub.id}`,
      `https://m.douban.com/movie/subject/${sub.id}/`,
    )
    const poster = (detail.pic?.large || sub.img || '').replace(
      /\/[sml]_ratio_poster\//,
      '/l_ratio_poster/',
    )
    const rec = {
      ...item,
      id: sub.id,
      doubanTitle: detail.title,
      subTitle: detail.original_title || sub.sub_title || '',
      year: detail.year || item.year,
      rating: detail.rating?.value ?? null,
      genres: detail.genres ?? [],
      countries: detail.countries ?? [],
      durations: detail.durations ?? [],
      directors: (detail.directors ?? []).map((x) => x.name),
      actors: (detail.actors ?? []).slice(0, 5).map((x) => x.name),
      poster,
    }
    result.push(rec)
    console.log(
      `✓ ${rec.doubanTitle} (${rec.year}) id=${rec.id} 评分${rec.rating} 导演=${rec.directors.join('/')} 海报=${poster ? '有' : '无'}`,
    )
    await sleep(700)
  } catch (e) {
    console.log(`✗ ${item.q}：${e.message}`)
    result.push({ ...item, id: null })
  }
}

fs.writeFileSync(path.join(OUT_DIR, 'meta.json'), JSON.stringify(result, null, 1))
console.log(`\n完成 ${result.length} 条，已写 .tmp/movies-raw/meta.json`)
