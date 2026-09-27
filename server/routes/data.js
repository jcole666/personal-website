/**
 * /api/data 路由 — 通用 keyed 文档 API
 *   GET /api/data           全部板块
 *   GET /api/data/:key      单个板块（白名单校验）
 *   PUT /api/data/:key      整份保存（requireAuth）
 */
import { Router } from 'express'
import { get, set } from '../store.js'
import { isKey } from '../seed.js'
import { requireAuth } from '../auth.js'

const router = Router()

// 全部板块
router.get('/', async (req, res, next) => {
  try {
    const keys = ['food', 'games', 'courses', 'projects', 'reading', 'music', 'movies', 'experience', 'sections']
    const out = {}
    for (const k of keys) out[k] = await get(k)
    res.json(out)
  } catch (err) {
    next(err)
  }
})

// 单个板块
router.get('/:key', async (req, res, next) => {
  const { key } = req.params
  if (!isKey(key)) return res.status(400).json({ error: '未知板块' })
  try {
    res.json(await get(key))
  } catch (err) {
    next(err)
  }
})

// 保存（写接口，需登录）
router.put('/:key', requireAuth, async (req, res, next) => {
  const { key } = req.params
  if (!isKey(key)) return res.status(400).json({ error: '未知板块' })
  const body = req.body
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return res.status(400).json({ error: '数据必须是对象' })
  }
  try {
    await set(key, body)
    res.json({ ok: true, savedAt: Date.now() })
  } catch (err) {
    next(err)
  }
})

export default router
