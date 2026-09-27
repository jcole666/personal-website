import { useRef, useState } from 'react'
import { useEditMode } from '../context/EditModeContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import './FileAttach.css'

/**
 * FileAttach — 附件列表 + 上传
 *
 * 用在「学习笔记」这类地方：光写几行字不够，笔记可能是 PDF / Markdown，
 * 作业可能是 ZIP。这里给出真正的文件：能打开、能下载、编辑模式下能上传和删除。
 *
 * 上传走后端 POST /api/files（原始字节 + X-File-Name 头），需要登录；
 * 上传成功后调 onChange(新数组)，由父组件负责把数据落盘。
 *
 * 样式用一组 CSS 变量控制，页面可以覆盖（默认值配的是 Memphis 孟菲斯风）。
 */

/** 人类可读的体积 */
function formatSize(bytes) {
  if (typeof bytes !== 'number') return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/** 按扩展名给图标与类型标签 */
function fileKind(name = '') {
  const ext = (name.split('.').pop() || '').toLowerCase()
  if (ext === 'pdf') return { icon: '📕', label: 'PDF' }
  if (['md', 'markdown', 'txt'].includes(ext)) return { icon: '📝', label: 'MD' }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return { icon: '📦', label: 'ZIP' }
  if (['doc', 'docx'].includes(ext)) return { icon: '📄', label: 'DOC' }
  if (['ppt', 'pptx'].includes(ext)) return { icon: '📊', label: 'PPT' }
  if (['xls', 'xlsx', 'csv'].includes(ext)) return { icon: '📈', label: 'XLS' }
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return { icon: '🖼️', label: 'IMG' }
  return { icon: '📎', label: ext ? ext.toUpperCase() : 'FILE' }
}

/** 从 /uploads/xxx 里取出存盘名，删除接口要用 */
function storedName(url = '') {
  return decodeURIComponent(url.split('/').pop() || '')
}

export default function FileAttach({ files = [], onChange, emptyHint, label = '附件' }) {
  const { editMode } = useEditMode()
  const { authed } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  async function upload(file) {
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-File-Name': encodeURIComponent(file.name),
        },
        body: file,
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || `上传失败（${res.status}）`)
      await onChange([...files, body])
    } catch (err) {
      setError(err.message === '未登录' ? '上传需要登录，先去 /admin 登录一次' : err.message)
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function remove(f) {
    setError('')
    try {
      await fetch(`/api/files/${encodeURIComponent(storedName(f.url))}`, { method: 'DELETE' })
    } catch {
      /* 文件删不掉不该阻塞列表更新，继续把条目摘掉 */
    }
    await onChange(files.filter((x) => x.url !== f.url))
  }

  return (
    <div className="fa">
      {files.length > 0 ? (
        <ul className="fa-list">
          {files.map((f) => {
            const kind = fileKind(f.name)
            return (
              <li key={f.url} className="fa-item">
                <span className="fa-icon" aria-hidden="true">
                  {kind.icon}
                </span>
                <span className="fa-meta">
                  <span className="fa-name">{f.name}</span>
                  <span className="fa-sub">
                    {kind.label}
                    {f.size ? ` · ${formatSize(f.size)}` : ''}
                  </span>
                </span>
                <span className="fa-actions">
                  <a className="fa-btn" href={f.url} target="_blank" rel="noreferrer">
                    打开 ↗
                  </a>
                  <a className="fa-btn" href={f.url} download={f.name}>
                    下载 ↓
                  </a>
                  {editMode && (
                    <button
                      type="button"
                      className="fa-btn fa-btn--danger"
                      onClick={() => remove(f)}
                      aria-label={`删除 ${f.name}`}
                    >
                      ✕
                    </button>
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      ) : (
        emptyHint && !editMode && <p className="fa-empty">{emptyHint}</p>
      )}

      {editMode && (
        <div className="fa-upload">
          {/* 上传接口要登录。没登录就直接说清楚，别等传完再报错、留下一个没人引用的文件 */}
          {authed === false ? (
            <p className="fa-hint">
              上传需要先登录 —— 去 <a href="/admin">/admin</a> 登录一次再回来
            </p>
          ) : (
            <>
              <input
                ref={inputRef}
                type="file"
                className="fa-file"
                onChange={(e) => {
                  const picked = e.target.files?.[0]
                  if (picked) upload(picked)
                }}
              />
              <button
                type="button"
                className="fa-btn fa-btn--pick"
                onClick={() => inputRef.current?.click()}
                disabled={busy}
              >
                {busy ? '上传中…' : `+ 上传${label}`}
              </button>
              <span className="fa-hint">PDF / Markdown / ZIP 都行，单个不超过 50MB</span>
            </>
          )}
        </div>
      )}

      {error && <p className="fa-error">{error}</p>}
    </div>
  )
}
