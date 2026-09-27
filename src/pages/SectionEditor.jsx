import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import JsonEditor from '../components/edit/JsonEditor.jsx'
import { useEditMode } from '../context/EditModeContext.jsx'

const SECTION_TITLES = {
  sections: '首页板块', projects: '代码开发', courses: '课程学习',
  experience: '经历分享', reading: '读书笔记', music: '音乐',
  movies: '电影', food: '美食市集', games: '游戏',
}

function SectionEditor() {
  const { key } = useParams()
  const { data, saveSection } = useData()
  const { authed } = useAuth()
  const { enterEditMode } = useEditMode()

  // 当前板块的原始数据（每次从全局 data 读取，保证和页面显示一致）
  const original = useMemo(() => data[key], [data, key])

  // 可编辑副本 + 脏标记
  const [draft, setDraft] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('') // '' | '已保存' | 错误信息

  // 板块数据到达时初始化 draft
  useEffect(() => {
    if (original === undefined) return
    setDraft(structuredClone(original))
    setDirty(false)
    setStatus('')
  }, [original])

  const update = (nv) => {
    setDraft(nv)
    setDirty(true)
    setStatus('')
  }

  const save = async () => {
    if (!draft || !dirty) return
    setSaving(true)
    setStatus('')
    try {
      await saveSection(key, draft)
      setDirty(false)
      setStatus('已保存 ✓')
    } catch (err) {
      setStatus(`保存失败：${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const discard = () => {
    setDraft(structuredClone(original))
    setDirty(false)
    setStatus('')
  }

  if (original === undefined) {
    return (
      <main className="se-world">
        <div className="se-inner">
          <p className="se-loading">板块加载中…</p>
          <p className="se-back"><Link to="/admin">← 返回后台</Link></p>
        </div>
      </main>
    )
  }

  return (
    <main className="se-world">
      <div className="se-inner">
        {/* 顶栏 */}
        <header className="se-head">
          <div className="se-head-left">
            <Link to="/admin" className="se-back-btn">← 后台</Link>
            <h1 className="se-title">编辑 · {SECTION_TITLES[key] || key}</h1>
          </div>
          <div className="se-head-right">
            {dirty && <span className="se-dirty-dot" title="有未保存的修改" />}
            <button className="se-btn se-btn--secondary" onClick={discard} disabled={!dirty || saving}>
              放弃修改
            </button>
            <button className="se-btn se-btn--primary" onClick={save} disabled={!dirty || saving || !authed} title={authed ? '' : '未登录，请先在 /admin 登录'}>
              {saving ? '保存中…' : dirty ? '保存修改' : '已是最新'}
            </button>
          </div>
        </header>

        {!authed && (
          <div className="se-warn">
            未登录，保存会被拒绝。请先 <Link to="/admin">去登录</Link>。
          </div>
        )}

        {status && <div className={`se-status ${status.startsWith('保存失败') ? 'se-status--err' : ''}`}>{status}</div>}

        <p className="se-hint">直接编辑下面的字段，改完点「保存修改」。访客刷新页面即可看到新内容。</p>

        {/* 编辑区 */}
        <div className="se-editor">
          {draft !== null && <JsonEditor value={draft} onChange={update} />}
        </div>

        {/* 底部保存栏 */}
        <footer className="se-foot">
          <span className="se-foot-note">
            {dirty ? '有未保存的修改' : '所有修改已保存'}
            {' · '}板块数据：{SECTION_TITLES[key] || key}
          </span>
          <button className="se-btn se-btn--primary" onClick={save} disabled={!dirty || saving || !authed}>
            {saving ? '保存中…' : dirty ? '保存修改' : '已是最新'}
          </button>
          <button className="se-btn se-btn--secondary" onClick={enterEditMode}>
            开启编辑模式（到板块页面上看效果）
          </button>
        </footer>
      </div>
    </main>
  )
}

export default SectionEditor
