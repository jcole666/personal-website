/**
 * JSON 文件存储 — 内存缓存 + 原子写 + 写队列
 *
 * 数据形状与 src/data/*.js 一一对应（9 个板块文档）。
 * 首次访问某 key 时，若 server/data/<key>.json 不存在，
 * 就从 src/data/*.js 惰性播种（只进内存，不落盘）。
 * 首次保存时才写盘。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')

// 目录不存在则创建
fs.mkdirSync(DATA_DIR, { recursive: true })

// key -> 文档（内存缓存）
const cache = new Map()

// 串行化写入的 Promise 队列，杜绝并发覆盖
let writeQueue = Promise.resolve()

/** 从 src/data/*.js 播种一个板块（懒加载，返回该板块的完整文档） */
async function loadSeed(key) {
  switch (key) {
    case 'reading': {
      const m = await import('../src/data/reading.js')
      return {
        profile: m.profile,
        books: m.books,
        dailyQuotes: m.dailyQuotes,
        tagDimensions: m.tagDimensions,
        notes: m.notes,
      }
    }
    case 'experience': {
      const m = await import('../src/data/experience.js')
      return { experiences: m.experiences, experienceTypes: m.experienceTypes }
    }
    case 'sections': {
      const m = await import('../src/data/sections.js')
      return { sections: m.sections }
    }
    default: {
      const m = await import(`../src/data/${key}.js`)
      return m.default
    }
  }
}

/** 读取某个板块文档 */
export async function get(key) {
  if (cache.has(key)) return cache.get(key)

  const file = path.join(DATA_DIR, `${key}.json`)
  let doc
  if (fs.existsSync(file)) {
    doc = JSON.parse(fs.readFileSync(file, 'utf8'))
  } else {
    doc = await loadSeed(key) // 惰性播种，不落盘
  }
  cache.set(key, doc)
  return doc
}

/** 原子写入单个文件 */
function atomicWrite(key, value) {
  const file = path.join(DATA_DIR, `${key}.json`)
  const tmp = `${file}.tmp`
  // 备份旧文件，方便手残恢复
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, `${file}.bak`)
  }
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2), 'utf8')
  fs.renameSync(tmp, file) // 同一文件系统内原子替换
}

/** 保存某板块文档（写入内存 + 队列落盘） */
export function set(key, value) {
  cache.set(key, value)
  writeQueue = writeQueue
    .then(() => atomicWrite(key, value))
    .catch((err) => console.error(`[store] 写入 ${key} 失败:`, err))
  return writeQueue
}

/** 列出所有已加载的 key */
export function keys() {
  return [...cache.keys()]
}
