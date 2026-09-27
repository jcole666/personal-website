/**
 * 认证：登录 / 登出 / 当前状态 + requireAuth 中间件
 * 密码存 .env 的 ADMIN_PASSWORD，session 由 express-session 管理。
 */
import { Router } from 'express'

export function authRoutes() {
  const router = Router()

  // 当前登录态
  router.get('/me', (req, res) => {
    if (req.session?.authed) return res.json({ authed: true })
    res.status(401).json({ authed: false })
  })

  // 登录
  router.post('/login', (req, res) => {
    const { password } = req.body || {}
    if (password && password === process.env.ADMIN_PASSWORD) {
      req.session.authed = true
      req.session.save(() => res.json({ ok: true }))
    } else {
      res.status(401).json({ error: '密码错误' })
    }
  })

  // 登出
  router.post('/logout', (req, res) => {
    req.session.destroy(() => res.json({ ok: true }))
  })

  return router
}

/** 写接口守卫：未登录返回 401 */
export function requireAuth(req, res, next) {
  if (req.session?.authed) return next()
  res.status(401).json({ error: '未登录' })
}
