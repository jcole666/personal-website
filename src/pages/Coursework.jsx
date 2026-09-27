import { useState, useMemo } from 'react'
import seedCourseData from '../data/courses.js'
import { useData } from '../context/DataContext.jsx'
import EditButton from '../components/edit/EditButton.jsx'
import SiteFooter from '../components/SiteFooter.jsx'

/* ====== 工具 ====== */
function Stars({ n }) {
  return <span>{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>
}

const neonMap = {
  magenta: '#ff2d95',
  cyan: '#00f0ff',
  amber: '#ffb800',
  violet: '#b347ea',
  emerald: '#39ff14',
}

const statusLabels = { learning: '正在学', completed: '学完了', planned: '想去学' }

const subjectTags = ['CS基础', 'AI', '数学', '系统', '其他']

/* ====== 弹窗 ====== */
function CourseModal({ course, onClose }) {
  if (!course) return null
  const neon = neonMap[course.color] || '#ff2d95'

  return (
    <div className="courses-modal-overlay" onClick={onClose}>
      <div className="courses-modal" style={{ '--neon-color': neon }} onClick={(e) => e.stopPropagation()}>
        <button className="courses-modal-close" onClick={onClose} aria-label="关闭" />
        <div className="courses-modal-body">
          <div className="courses-modal-top">
            <span className={`courses-modal-status courses-modal-status--${course.status}`}>
              {statusLabels[course.status]}
            </span>
            {course.rating && (
              <span className="courses-modal-rating"><Stars n={course.rating} /></span>
            )}
          </div>

          <h2 className="courses-modal-title">{course.title}</h2>
          <div className="courses-modal-subtitle">{course.subtitle}</div>
          <div className="courses-modal-school">{course.school} · {course.platform}</div>

          <div className="courses-modal-tags">
            {course.tags.map((t) => (
              <span key={t} className="courses-modal-tag">{t}</span>
            ))}
          </div>

          <hr className="courses-modal-sep" />

          {course.fullReview ? (
            <div className="courses-modal-review">
              <div className="courses-modal-section-title">学习感想</div>
              {course.fullReview.split('\n\n').map((p, i) => <p key={i}>{p.trim()}</p>)}
            </div>
          ) : (
            <div className="courses-modal-feeling">"{course.feeling}"</div>
          )}

          {course.notes?.length > 0 && (
            <div className="courses-modal-notes">
              <div className="courses-modal-section-title">学习笔记</div>
              {course.notes.map((n, i) => (
                <div key={i} className="courses-modal-note-item">{n}</div>
              ))}
            </div>
          )}

          <div className="courses-modal-links">
            {course.links?.map((l, i) => (
              <a key={i} className="courses-modal-link" href={l.url} target="_blank" rel="noreferrer">→ {l.label}</a>
            ))}
            {course.notesDownload && (
              <span className="courses-modal-download" title="笔记下载">
                📥 {course.notesDownload}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ====== 卡片 ====== */
function CourseCard({ course, onSelect }) {
  const neon = neonMap[course.color] || '#ff2d95'

  return (
    <div
      className="courses-card"
      style={{ '--neon-color': neon }}
      onClick={() => onSelect(course)}
    >
      <div className="courses-card-stripe" />

      <div className="courses-card-body">
        <div className="courses-card-top">
          <span className={`courses-card-status courses-card-status--${course.status}`}>
            {statusLabels[course.status]}
          </span>
          {course.rating && <span className="courses-card-rating"><Stars n={course.rating} /></span>}
        </div>

        <h3 className="courses-card-title">{course.title}</h3>
        <div className="courses-card-school">{course.school}</div>

        <div className="courses-card-tags">
          {course.tags.map((t) => (
            <span key={t} className="courses-card-tag">{t}</span>
          ))}
        </div>

        {course.feeling && (
          <div className="courses-card-feeling">"{course.feeling.slice(0, 50)}..."</div>
        )}

        {course.progress != null && (
          <div className="courses-card-progress">
            <div className="courses-card-bar">
              <div className="courses-card-fill" style={{ width: `${course.progress}%` }} />
            </div>
            <div className="courses-card-pct">{course.progress}%</div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ====== 主组件 ====== */
function Courses() {
  const { data } = useData()
  const courseData = data.courses ?? seedCourseData

  const [statusFilter, setStatusFilter] = useState('all')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [modalItem, setModalItem] = useState(null)
  const [showCount, setShowCount] = useState(4)

  const filtered = useMemo(() => {
    let list = courseData.courses
    if (statusFilter !== 'all') {
      list = list.filter((c) => c.status === statusFilter)
    }
    if (subjectFilter !== 'all') {
      list = list.filter((c) => c.tags.includes(subjectFilter))
    }
    return list
  }, [statusFilter, subjectFilter])

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

  function handleStatusChange(key) {
    setStatusFilter(key)
    setShowCount(4)
  }

  function handleSubjectChange(key) {
    setSubjectFilter(key)
    setShowCount(4)
  }

  return (
    <main className="courses-world">
      {/* 建筑剪影 */}
      <div className="courses-buildings" />
      {/* 湿路面 */}
      <div className="courses-road" />

      <div className="courses-inner">
        {/* 标题 */}
        <div className="courses-hero">
          <h1 className="courses-hero-title">课程学习</h1>
          <p className="courses-hero-sub">
            {courseData.stats.total} 门课程 · {courseData.stats.learning} 正在学 · {courseData.stats.completed} 已完成 · {courseData.stats.planned} 想去学
          </p>
        </div>

        {/* 筛选：两排 */}
        <div className="courses-filters">
          {/* 状态筛选 */}
          <div className="courses-filter-row">
            {statusFilters.map((f) => (
              <button
                key={f.key}
                className={`courses-filter-btn ${statusFilter === f.key ? 'courses-filter-btn--active' : ''}`}
                onClick={() => handleStatusChange(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
          {/* 科目筛选 */}
          <div className="courses-filter-row">
            {subjectFilters.map((f) => (
              <button
                key={f.key}
                className={`courses-filter-btn courses-filter-btn--subject ${subjectFilter === f.key ? 'courses-filter-btn--active' : ''}`}
                onClick={() => handleSubjectChange(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 画廊 */}
        <div className="courses-grid">
          {visible.map((course) => (
            <CourseCard key={course.id} course={course} onSelect={setModalItem} />
          ))}
        </div>

        {/* 查看更多 */}
        {hasMore && (
          <div className="courses-more-wrap">
            <button className="courses-more-btn" onClick={() => setShowCount((n) => n + 4)}>
              显示更多
            </button>
          </div>
        )}

        {/* 底部装饰线（这一页的霓虹个性，保留） */}
        <div className="courses-footer-bar" />
      </div>

      <SiteFooter path="/coursework" />

      {/* 弹窗 */}
      <CourseModal course={modalItem} onClose={() => setModalItem(null)} />
      <EditButton sectionKey="courses" label="课程学习" />
    </main>
  )
}

export default Courses
