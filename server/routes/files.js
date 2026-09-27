/**
 * /api/files — 附件上传 / 删除
 *
 *   POST   /api/files        上传（需登录）
 *   DELETE /api/files/:stored 删除（需登录）
 *
 * 为什么不用 multer：
 *   这个项目只需要"整个请求体就是一个文件"这一种最简单的场景，
 *   用 express.raw 收原始字节、文件名放 X-File-Name 请求头就够了，
 *   省掉一个 multipart 依赖。前端也简单：body 直接塞 File 对象。
 *
 * 文件落在 server/uploads/（.gitignore 里已经排除）。
 * ⚠️ 这是本地磁盘存储 —— 部署到 Serverless 平台会丢，需要换成对象存储。
 */
import { Router } from 'express'
import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { requireAuth } from '../auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** 上传目录（server/uploads） */
export const UPLOAD_DIR = path.join(__dirname, '..', 'uploads')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

/** 单文件上限 50MB */
const MAX_BYTES = 50 * 1024 * 1024

/**
 * 只保留一个安全文件名：去掉目录分隔符、Windows 非法字符、控制字符。
 * 存盘时还会再加时间戳+随机串前缀，所以重名也不会互相覆盖。
 */
function safeName(raw) {
  const base = path
    .basename(String(raw))
    // eslint-disable-next-line no-control-regex
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_')
    .trim()
  return base.slice(0, 120) || 'file'
}

export function filesRoutes() {
  const router = Router()

  // 上传
  router.post('/', requireAuth, express.raw({ type: '*/*', limit: MAX_BYTES }), (req, res) => {
    const rawName = req.get('X-File-Name')
    if (!rawName) return res.status(400).json({ error: '缺少 X-File-Name 请求头' })

    let decoded = ''
    try {
      decoded = decodeURIComponent(rawName)
    } catch {
      return res.status(400).json({ error: '文件名编码有误' })
    }

    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      return res.status(400).json({ error: '文件是空的' })
    }

    const name = safeName(decoded)
    const stored = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${name}`

    try {
      fs.writeFileSync(path.join(UPLOAD_DIR, stored), req.body)
    } catch (err) {
      return res.status(500).json({ error: '写入失败：' + err.message })
    }

    res.json({
      name,
      url: `/uploads/${encodeURIComponent(stored)}`,
      size: req.body.length,
      type: req.get('Content-Type') || 'application/octet-stream',
      uploadedAt: Date.now(),
    })
  })

  // 删除
  router.delete('/:stored', requireAuth, (req, res) => {
    let stored = ''
    try {
      stored = decodeURIComponent(req.params.stored)
    } catch {
      return res.status(400).json({ error: '文件名编码有误' })
    }
    // 只取最后一段，杜绝 ../ 之类的路径穿越
    stored = path.basename(stored)
    const file = path.join(UPLOAD_DIR, stored)

    if (!file.startsWith(UPLOAD_DIR)) return res.status(400).json({ error: '非法路径' })
    if (fs.existsSync(file)) {
      try {
        fs.unlinkSync(file)
      } catch (err) {
        return res.status(500).json({ error: '删除失败：' + err.message })
      }
    }
    res.json({ ok: true })
  })

  return router
}
