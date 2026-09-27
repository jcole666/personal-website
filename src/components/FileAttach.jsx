import { Fragment, useRef, useState } from 'react'
import { useEditMode } from '../context/EditModeContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { renderMarkdown } from '../lib/markdown.js'
import './FileAttach.css'

/**
 * FileAttach — 附件列表 + 上传 + 阅读
 *
 * 用在「学习笔记」这类地方：光写几行字不够，笔记可能是 PDF / Markdown，
 * 作业可能是 ZIP。这里给出真正的文件：能读、能打开、能下载，
 * 编辑模式下还能上传和删除。
 *
 * - 上传走后端 POST /api/files（原始字节 + X-File-Name 头），需要登录；
 *   上传成功后调 onChange(新数组)，由父组件负责把数据落盘。
 * - Markdown / txt 点「阅读」在原地展开渲染后的排版，不用跳浏览器看一堆
 *   原始符号。渲染交给 src/lib/markdown.js（先转义再插标签，免疫 XSS）。
 * - 图片附件直接显示缩略图，点开看大图。
 *
 * 样式用一组 CSS 变量控制，页面可以覆盖（默认值配的是 Memphis 孟菲斯风）。
 */

const TEXT_EXT = ['md', 'markdown', 'txt']
const IMAGE_EXT = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif', 'bmp']

/** 人类可读的体积 */
function formatSize(bytes) {
  if (typeof bytes !== 'number') return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/** 按扩展名给图标、类型标签，以及「能不能读 / 是不是图片」 */
function fileKind(name = '') {
  const ext = (name.split('.').pop() || '').toLowerCase()
  const text = TEXT_EXT.includes(ext)
  const image = IMAGE_EXT.includes(ext)

  let icon = '📎'
  let label = ext ? ext.toUpperCase() : 'FILE'
  if (ext === 'pdf') {
    icon = '📕'
    label = 'PDF'
  } else if (text) {
    icon = '📝'
    label = ext === 'txt' ? 'TXT' : 'MD'
  } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    icon = '📦'
    label = 'ZIP'
  } else if (['doc', 'docx'].includes(ext)) {
    icon = '📄'
    label = 'DOC'
  } else if (['ppt', 'pptx'].includes(ext)) {
    icon = '📊'
    label = 'PPT'
  } else if (['xls', 'xlsx', 'csv'].includes(ext)) {
    icon = '📈'
    label = 'XLS'
  } else if (image) {
    icon = '🖼️'
    label = 'IMG'
  }

  return { icon, label, text, image }
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
  const [reader, setReader] = useState(null)
  const inputRef = useRef(null)
  // 用来丢弃过期的 fetch 结果：连着点两个文件时，先回来的那个不能覆盖后点的
  const tokenRef = useRef(0)

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
    if (reader?.url === f.url) setReader(null)
    await onChange(files.filter((x) => x.url !== f.url))
  }

  async function toggleRead(f) {
    // 点同一个文件就收起
    if (reader?.url === f.url) {
      tokenRef.current++
      setReader(null)
      return
    }

    const token = ++tokenRef.current
    setReader({ url: f.url, name: f.name, html: '', error: '', loading: true })
    try {
      const res = await fetch(f.url)
      if (!res.ok) throw new Error(`读取失败（${res.status}）`)
      const text = await res.text()
      if (tokenRef.current !== token) return
      setReader({ url: f.url, name: f.name, html: renderMarkdown(text), error: '', loading: false })
    } catch (err) {
      if (tokenRef.current !== token) return
      setReader({ url: f.url, name: f.name, html: '', error: err.message, loading: false })
    }
  }

  return (
    <div className="fa">
      {files.length > 0 ? (
        <ul className="fa-list">
          {files.map((f, index) => {
            const kind = fileKind(f.name)
            const opened = reader?.url === f.url
            const readerId = `fa-reader-${index}`
            return (
              <Fragment key={f.url}>
                <li className="fa-item">
                  {kind.image ? (
                    <a
                      className="fa-thumb"
                      href={f.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`查看大图 ${f.name}`}
                    >
                      <img src={f.url} alt={f.name} loading="lazy" />
                    </a>
                  ) : (
                    <span className="fa-icon" aria-hidden="true">
                      {kind.icon}
                    </span>
                  )}

                  <span className="fa-meta">
                    <span className="fa-name">{f.name}</span>
                    <span className="fa-sub">
                      {kind.label}
                      {f.size ? ` · ${formatSize(f.size)}` : ''}
                    </span>
                  </span>

                  <span className="fa-actions">
                    {kind.text && (
                      <button
                        type="button"
                        className="fa-btn fa-btn--read"
                        onClick={() => toggleRead(f)}
                        aria-expanded={opened}
                        aria-controls={readerId}
                      >
                        {opened ? '收起' : '阅读'}
                      </button>
                    )}
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

                {opened && (
                  <li className="fa-reader" id={readerId}>
                    <div className="fa-reader-head">
                      <span className="fa-reader-name">{reader.name}</span>
                      <button
                        type="button"
                        className="fa-btn fa-btn--read"
                        onClick={() => {
                          tokenRef.current++
                          setReader(null)
                        }}
                      >
                        收起
                      </button>
                    </div>
                    <div className="fa-reader-body">
                      {reader.loading && <p className="fa-reader-hint">读取中…</p>}
                      {reader.error && <p className="fa-error">{reader.error}</p>}
                      {reader.html && (
                        // 内容经 src/lib/markdown.js 先转义再插标签，见该文件顶部说明
                        <div
                          className="fa-md"
                          dangerouslySetInnerHTML={{ __html: reader.html }}
                        />
                      )}
                      {!reader.loading && !reader.error && !reader.html && (
                        <p className="fa-reader-hint">这个文件是空的。</p>
                      )}
                    </div>
                  </li>
                )}
              </Fragment>
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
              <span className="fa-hint">PDF / Markdown / 图片 / ZIP 都行，单个不超过 50MB</span>
            </>
          )}
        </div>
      )}

      {error && <p className="fa-error">{error}</p>}
    </div>
  )
}
