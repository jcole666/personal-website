/**
 * 服务器入口 — Express 5
 *  - 生产环境托管 dist/ 静态文件
 *  - /api/* 数据接口
 *  - SPA 回退（非 API 的 GET 一律发 index.html）
 *
 * 启动：npm run dev:server （开发） / npm start （生产）
 */
import 'dotenv/config'
import express from 'express'
import session from 'express-session'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import dataRouter from './routes/data.js'
import { filesRoutes, UPLOAD_DIR } from './routes/files.js'
import { authRoutes } from './auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3001

const app = express()

// 全局中间件
app.use(express.json({ limit: '1mb' }))
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 3600 * 1000 },
  }),
)

// API
app.use('/api/auth', authRoutes())
app.use('/api/data', dataRouter)
app.use('/api/files', filesRoutes())
app.get('/api/health', (req, res) => res.json({ ok: true }))

// 附件静态托管。必须放在下面的 SPA 回退之前，否则会被回退吃掉、返回 index.html
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d' }))

// 生产：托管 dist/
const distDir = path.join(__dirname, '..', 'dist')
/* 静态资源。
   ⚠️ redirect:false 是必须的：public/games、public/music、public/movies、public/food
   这些图片目录会被 express.static 当成「同名路由是个目录」，于是把 /games 301 成 /games/。
   地址栏一变，前端拿到的 pathname 就带尾斜杠，导航/页脚主题查表全部落空、
   悄悄退回默认配色（深紫字压深底，几乎看不清）。
   关掉这个跳转后，/games 会正常落到下面的 SPA 回退。
   （前端 getNavTheme 也做了去尾斜杠兜底，两边都保险。） */
app.use(express.static(distDir, { redirect: false }))

// SPA 回退：非 /api 的 GET 一律发 index.html（Express 5 不能用 '*'）
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/')) {
    return res.sendFile(path.join(distDir, 'index.html'))
  }
  next()
})

// 统一错误处理
app.use((err, req, res, next) => {
  console.error('[server] 错误:', err)
  res.status(500).json({ error: '服务器内部错误' })
})

app.listen(PORT, () => {
  console.log(`🚀 服务器已启动: http://localhost:${PORT}`)
})
