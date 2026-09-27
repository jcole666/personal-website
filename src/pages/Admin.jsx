import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useEditMode } from '../context/EditModeContext.jsx'

/** 9 个板块入口（与 server/seed.js 的 KEYS 对应） */
const SECTION_KEYS = [
  { key: 'sections',   title: '首页板块',   icon: '🗺️', desc: '首页卡片、导航、最新更新' },
  { key: 'projects',   title: '代码开发',   icon: '📐', desc: '项目、灵感碎片' },
  { key: 'courses',    title: '课程学习',   icon: '🎓', desc: '课程、笔记、进度' },
  { key: 'experience', title: '经历分享',   icon: '🏝️', desc: '旅程、活动、支教' },
  { key: 'reading',    title: '读书笔记',   icon: '📖', desc: '已读/在读/想读、金句、随想' },
  { key: 'music',      title: '音乐',       icon: '🎵', desc: '单曲、专辑、音乐人' },
  { key: 'movies',     title: '电影',       icon: '🎬', desc: '观影、日历、人物' },
  { key: 'food',       title: '美食市集',   icon: '🍜', desc: '摊位、商品' },
  { key: 'games',      title: '游戏',       icon: '🎮', desc: '游戏收藏、游玩记录' },
]

function LoginForm({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { login } = useAuth()

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(password)
      onLogin?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="admin-login" onSubmit={submit}>
      <h2 className="admin-login-title">管理入口</h2>
      <p className="admin-login-sub">输入密码进入编辑后台</p>
      <input
        type="password"
        className="admin-login-input"
        placeholder="密码"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoFocus
      />
      {error && <p className="admin-login-error">{error}</p>}
      <button type="submit" className="admin-login-btn" disabled={busy || !password}>
        {busy ? '登录中…' : '进入后台'}
      </button>
    </form>
  )
}

function Admin() {
  const { authed, logout } = useAuth()
  const { editMode, enterEditMode } = useEditMode()

  // 还在探测登录态（后端未响应）时显示加载
  if (authed === null) {
    return (
      <main className="admin-world">
        <div className="admin-inner">
          <p className="admin-loading">正在连接后台…</p>
        </div>
      </main>
    )
  }

  // 未登录 → 登录表单
  if (!authed) {
    return (
      <main className="admin-world">
        <div className="admin-inner">
          <LoginForm />
          <p className="admin-back">
            <Link to="/">← 返回首页</Link>
          </p>
        </div>
      </main>
    )
  }

  // 已登录 → 板块入口
  return (
    <main className="admin-world">
      <div className="admin-inner">
        <header className="admin-head">
          <h1 className="admin-title">编辑后台</h1>
          <p className="admin-sub">选择一个板块开始编辑，保存后访客刷新即可看到</p>
        </header>

        <div className="admin-grid">
          {SECTION_KEYS.map((s) => (
            <Link key={s.key} to={`/admin/${s.key}`} className="admin-card">
              <span className="admin-card-icon">{s.icon}</span>
              <div className="admin-card-body">
                <h3 className="admin-card-title">{s.title}</h3>
                <p className="admin-card-desc">{s.desc}</p>
              </div>
              <span className="admin-card-arrow">→</span>
            </Link>
          ))}
        </div>

        <div className="admin-actions">
          <button className="admin-enter-edit" onClick={enterEditMode}>
            {editMode ? '✓ 编辑模式已开启' : '开启编辑模式（页面显示编辑按钮）'}
          </button>
          <button className="admin-logout" onClick={logout}>
            退出登录
          </button>
        </div>
      </div>
    </main>
  )
}

export default Admin
