import { useState, useMemo } from 'react'
import seedCourseData from '../data/courses.js'
import { useData } from '../context/DataContext.jsx'
import EditButton from '../components/edit/EditButton.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import FileAttach from '../components/FileAttach.jsx'
import { useEditMode } from '../context/EditModeContext.jsx'

/**
 * 课程学习 · Memphis 孟菲斯风格
 *
 * 参考 参考/memphis-showcase 的版式语言：
 *   4px 纯黑粗边 + 硬边偏移阴影（无模糊）+ 高饱和撞色 + 几何装饰 + 点状/条纹图案
 *   标题用多层错位 text-shadow；卡片里的装饰在 hover 时各自朝不同方向动（Playful Chaos）
 *
 * 该风格明确禁止：单调配色、对称规整布局、细边框、省略几何装饰、
 *   装饰在 hover 时静止、按钮 hover 位移减小阴影。
 *
 * 有一处指南自相矛盾：Token 字典写 hover 时阴影收到 2px，但「必须遵守」和「绝对禁止」
 *   都说 hover 要"增大阴影 + 换色，不要向阴影方向移动"。按"禁止项优先级最高"，
 *   这里采用 —— hover 阴影放大到 8px 并换撞色；active 才位移到 6px 且阴影归零（玩具按键）。
 */

/* ====== 调色板 ====== */
const MP = {
  red: '#ff6b6b',
  yellow: '#feca57',
  cyan: '#48dbfb',
  pink: '#ff9ff3',
  green: '#1dd1a1',
  purple: '#5f27cd',
  cream: '#fef9ef',
}

/**
 * 数据里的颜色键 → 孟菲斯调色板
 * 紫色 #5f27cd 太深，黑字压不住（对比度只有 3.0），所以它单独用白字
 */
const courseColor = {
  magenta: { bg: MP.pink, ink: '#000000' },
  amber: { bg: MP.yellow, ink: '#000000' },
  emerald: { bg: MP.green, ink: '#000000' },
  violet: { bg: MP.purple, ink: '#ffffff' },
  cyan: { bg: MP.cyan, ink: '#000000' },
}
const DEFAULT_COLOR = { bg: MP.red, ink: '#000000' }

const statusLabels = { learning: '正在学', completed: '学完了', planned: '想去学' }
const subjectTags = ['CS基础', 'AI', '数学', '系统', '其他']

function Stars({ n }) {
  return (
    <span className="mp-stars">
      {'★'.repeat(n)}
      {'☆'.repeat(5 - n)}
    </span>
  )
}

/* ====== 卡片 ====== */
function CourseCard({ course, onSelect }) {
  const c = courseColor[course.color] || DEFAULT_COLOR

  return (
    <div
      className="mp-card"
      style={{ '--mp-color': c.bg, '--mp-ink': c.ink }}
      onClick={() => onSelect(course)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(course)
        }
      }}
    >
      {/* 几何装饰：hover 时各自朝不同方向动，不统一方向 */}
      <span className="mp-card-deco mp-card-deco--circle" aria-hidden="true" />
      <span className="mp-card-deco mp-card-deco--tri" aria-hidden="true" />
      <span className="mp-card-deco mp-card-deco--ring" aria-hidden="true" />

      <div className="mp-card-body">
        <div className="mp-card-top">
          <span className={`mp-chip mp-chip--${course.status}`}>{statusLabels[course.status]}</span>
          {course.rating && <Stars n={course.rating} />}
        </div>

        <h3 className="mp-card-title">{course.title}</h3>
        {course.subtitle && <p className="mp-card-subtitle">{course.subtitle}</p>}
        <p className="mp-card-school">{course.school}</p>

        <div className="mp-card-tags">
          {course.tags.map((t) => (
            <span key={t} className="mp-card-tag">
              {t}
            </span>
          ))}
        </div>

        {course.progress != null && (
          <div className="mp-card-progress">
            <div className="mp-card-bar">
              <div className="mp-card-fill" style={{ width: `${course.progress}%` }} />
            </div>
            <span className="mp-card-pct">{course.progress}%</span>
          </div>
        )}

        <span className="mp-card-cta">查看笔记 →</span>
      </div>
    </div>
  )
}

/* ====== 弹窗 ====== */
function CourseModal({ course, onClose, onFilesChange }) {
  const { editMode } = useEditMode()
  if (!course) return null
  const c = courseColor[course.color] || DEFAULT_COLOR
  const files = course.files ?? []
  const notes = course.notes ?? []

  return (
    <div className="mp-modal-overlay" onClick={onClose}>
      <div
        className="mp-modal"
        style={{ '--mp-color': c.bg, '--mp-ink': c.ink }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="mp-modal-close" onClick={onClose} aria-label="关闭">
          ✕
        </button>

        <div className="mp-modal-head" style={{ background: c.bg, '--mp-ink': c.ink }}>
          <div className="mp-modal-top">
            <span className={`mp-chip mp-chip--${course.status}`}>{statusLabels[course.status]}</span>
            {course.rating && <Stars n={course.rating} />}
          </div>
          <h2 className="mp-modal-title">{course.title}</h2>
          {course.subtitle && <p className="mp-modal-subtitle">{course.subtitle}</p>}
          <p className="mp-modal-school">
            {course.school} · {course.platform}
          </p>
          <div className="mp-card-tags">
            {course.tags.map((t) => (
              <span key={t} className="mp-card-tag">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="mp-modal-body">
          {course.fullReview ? (
            <div className="mp-modal-review">
              <h4 className="mp-modal-label">学习感想</h4>
              {course.fullReview.split('\n\n').map((p, i) => (
                <p key={i}>{p.trim()}</p>
              ))}
            </div>
          ) : (
            <blockquote className="mp-modal-quote">「{course.feeling}」</blockquote>
          )}

          {/* 学习笔记 = 文字笔记 + 附件（PDF / Markdown / 作业 ZIP） */}
          {(notes.length > 0 || files.length > 0 || editMode) && (
            <div className="mp-modal-notes">
              <h4 className="mp-modal-label">学习笔记</h4>

              {notes.length > 0 && (
                <ul>
                  {notes.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              )}

              <FileAttach
                files={files}
                onChange={onFilesChange}
                label="笔记 / 作业"
                emptyHint="这门课还没有上传笔记或作业。"
              />
            </div>
          )}

          <div className="mp-modal-links">
            {course.links?.map((l, i) => (
              <a key={i} className="mp-btn mp-btn--sm" href={l.url} target="_blank" rel="noreferrer">
                {l.label} ↗
              </a>
            ))}
            {course.notesDownload && (
              <span className="mp-modal-file">📥 {course.notesDownload}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ====== 主组件 ====== */
function Courses() {
  const { data, saveSection } = useData()
  const courseData = data.courses ?? seedCourseData

  const [statusFilter, setStatusFilter] = useState('all')
  const [subjectFilter, setSubjectFilter] = useState('all')
  // 存 id 而不是快照 —— 上传附件后 courseData 会更新，按 id 重新查才能拿到最新的 files
  const [modalId, setModalId] = useState(null)
  const [showCount, setShowCount] = useState(4)

  const modalCourse = modalId ? courseData.courses.find((c) => c.id === modalId) : null

  /** 上传 / 删除附件后，把整个 courses 文档存回后端 */
  async function handleFilesChange(files) {
    if (!modalCourse) return
    const next = {
      ...courseData,
      courses: courseData.courses.map((c) => (c.id === modalCourse.id ? { ...c, files } : c)),
    }
    await saveSection('courses', next)
  }

  const filtered = useMemo(() => {
    let list = courseData.courses
    if (statusFilter !== 'all') list = list.filter((c) => c.status === statusFilter)
    if (subjectFilter !== 'all') list = list.filter((c) => c.tags.includes(subjectFilter))
    return list
  }, [courseData, statusFilter, subjectFilter])

  const visible = filtered.slice(0, showCount)
  const hasMore = showCount < filtered.length

  const statusFilters = [
    { key: 'all', label: '全部' },
    { key: 'learning', label: '正在学' },
    { key: 'completed', label: '学完了' },
    { key: 'planned', label: '想去学' },
  ]
  const subjectFilters = [
    { key: 'all', label: '全部科目' },
    ...subjectTags.map((s) => ({ key: s, label: s })),
  ]

  const stats = [
    { n: courseData.stats.total, label: '门课程', color: MP.red },
    { n: courseData.stats.learning, label: '正在学', color: MP.yellow },
    { n: courseData.stats.completed, label: '已完成', color: MP.cyan },
    { n: courseData.stats.planned, label: '想去学', color: MP.pink },
  ]

  const change = (setter) => (key) => {
    setter(key)
    setShowCount(4)
  }

  return (
    <main className="mp-world">
      {/* ===== Hero：渐变底 + 散布的几何装饰 + 多层硬阴影标题 ===== */}
      <header className="mp-hero">
        <span className="mp-deco mp-deco--1" aria-hidden="true" />
        <span className="mp-deco mp-deco--2" aria-hidden="true" />
        <span className="mp-deco mp-deco--3" aria-hidden="true" />
        <span className="mp-deco mp-deco--4" aria-hidden="true" />
        <span className="mp-deco mp-deco--5" aria-hidden="true" />
        <span className="mp-hero-dots" aria-hidden="true" />

        <div className="mp-hero-inner">
          <span className="mp-badge">
            <span className="mp-dot" style={{ background: MP.red }} />
            课程学习 — COURSEWORK
            <span className="mp-dot" style={{ background: MP.cyan }} />
          </span>

          <h1 className="mp-hero-title">课程学习</h1>

          <p className="mp-hero-sub">
            课上听的、课下补的，还有那些自己找来啃的。每门都留了笔记和当时的感受。
          </p>

          <div className="mp-stats">
            {stats.map((s) => (
              <div key={s.label} className="mp-stat" style={{ '--mp-color': s.color }}>
                <b>{s.n}</b>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ===== 筛选 ===== */}
      <section className="mp-filters">
        <div className="mp-filter-row">
          {statusFilters.map((f) => (
            <button
              key={f.key}
              className={`mp-btn${statusFilter === f.key ? ' mp-btn--on' : ''}`}
              onClick={() => change(setStatusFilter)(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="mp-filter-row">
          {subjectFilters.map((f) => (
            <button
              key={f.key}
              className={`mp-btn mp-btn--sm${subjectFilter === f.key ? ' mp-btn--on' : ''}`}
              onClick={() => change(setSubjectFilter)(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* ===== 卡片网格 ===== */}
      <section className="mp-grid-section">
        <div className="mp-grid">
          {visible.map((course) => (
            <CourseCard key={course.id} course={course} onSelect={(c) => setModalId(c.id)} />
          ))}
        </div>

        {visible.length === 0 && <p className="mp-empty">这个组合下还没有课程，换个筛选试试。</p>}

        {hasMore && (
          <div className="mp-more-wrap">
            <button className="mp-btn mp-btn--lg" onClick={() => setShowCount((n) => n + 4)}>
              再看 {Math.min(4, filtered.length - showCount)} 门 ↓
            </button>
          </div>
        )}
      </section>

      <SiteFooter path="/coursework" />

      <CourseModal
        course={modalCourse}
        onClose={() => setModalId(null)}
        onFilesChange={handleFilesChange}
      />
      <EditButton sectionKey="courses" label="课程学习" />
    </main>
  )
}

export default Courses
