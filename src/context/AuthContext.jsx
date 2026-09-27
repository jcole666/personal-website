import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const AuthContext = createContext(null)

/**
 * AuthProvider — 登录状态管理
 *   - 挂载时 GET /api/auth/me 探测是否已登录（cookie 自动携带）
 *   - 提供 login(password) / logout()
 * 编辑模式下保存数据时才真正需要登录；未登录保存会被后端 401。
 */
export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(null) // null=探测中 | true | false

  useEffect(() => {
    let cancelled = false
    fetch('/api/auth/me', { credentials: 'same-origin' })
      .then((r) => {
        if (cancelled) return
        setAuthed(r.ok)
      })
      .catch(() => {
        if (cancelled) return
        setAuthed(false) // 后端没开 → 视为未登录，编辑保存会失败但不白屏
      })
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ password }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || '登录失败')
    }
    setAuthed(true)
    return true
  }, [])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'same-origin',
    }).catch(() => {})
    setAuthed(false)
  }, [])

  return (
    <AuthContext.Provider value={{ authed, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
