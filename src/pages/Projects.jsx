import { useEffect, useMemo, useRef, useState } from 'react'
import seedProjectData from '../data/projects.js'
import { useData } from '../context/DataContext.jsx'
import EditButton from '../components/edit/EditButton.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import FileAttach from '../components/FileAttach.jsx'
import { useEditMode } from '../context/EditModeContext.jsx'

/**
 * 代码开发 · Editorial 编辑杂志风
 *
 * 参考 参考/editorial-showcase 的版式语言：
 *   巨型衬线标题（第二行斜体、降透明度）+ 右侧小号大写宽字距说明
 *   编号式列表（01 / 02 …）配发丝分隔线，hover 时标题转斜体
 *   标签一律 font-sans text-xs tracking-[0.2em] uppercase
 *
 * 禁用（这一条很重要，别加回来）：渐变、背景图案、阴影、彩色强调色、
 * 大圆角、单侧粗边框装饰。整页是纯单色 + 发丝线。
 */

/* ====== 工具 ====== */
function renderParagraphs(text) {
  if (!text) return null
  return text.trim().split('\n\n').map((para, i) => <p key={i}>{para.trim()}</p>)
}

const statusLabels = { active: '进行中', done: '已完成', abandoned: '搁置' }

const FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '进行中' },
  { key: 'done', label: '已完成' },
  { key: 'abandoned', label: '搁置' },
]

/** 首页面上只列这么多，其余收进「查看全部」面板 —— 项目会越写越多，不能一直往下堆 */
const PREVIEW_COUNT = 5

/**
 * 滚动进入视口时淡入上浮
 * 参考文件用的是同一套（IntersectionObserver + 0.8s cubic-bezier(0.16,1,0.3,1)）。
 * 开了「减少动效」的系统设置时直接显示，不做观察。
 */
function useReveal() {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // 开了「减少动效」、或环境不支持观察器时，直接显示 —— 免得内容卡在 opacity:0
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setShown(true)
      return
    }
    // 只播一次：进入视口后就把观察器断开，元素从此保持显示。
    // （试过"离开也复位"让动画反复播放，但上下滑时屏幕上一直有东西在动，观感偏晕，
    //   用户最终选择回到只播一次）
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return [ref, shown]
}

/** delay 用来做错落感（毫秒） */
function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const [ref, shown] = useReveal()
  return (
    <Tag
      ref={ref}
      className={`ed-reveal${shown ? ' is-shown' : ''}${className ? ` ${className}` : ''}`}
      style={{ '--reveal-delay': `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

/* ====== 项目条目 ====== */
function ProjectRow({ project, index, onSelect }) {
  const abandoned = project.status === 'abandoned'

  return (
    <Reveal
      className={`ed-row${abandoned ? ' ed-row--abandoned' : ''}`}
      delay={Math.min(index, 4) * 70}
      onClick={() => onSelect(project)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(project)
        }
      }}
    >
      <div className="ed-row-main">
        <span className="ed-row-num">{String(index + 1).padStart(2, '0')}</span>
        <div className="ed-row-body">
          <h3 className="ed-row-title">{project.title}</h3>
          <p className="ed-row-desc">{project.description}</p>
          {project.techStack?.length > 0 && (
            <p className="ed-row-tech">{project.techStack.join(' · ')}</p>
          )}
        </div>
      </div>
      <span className="ed-row-meta">
        {statusLabels[project.status] || statusLabels.done}
        {project.progress != null && ` · ${project.progress}%`}
      </span>
    </Reveal>
  )
}

/* ====== 灵感碎片 ====== */
function IdeaCard({ idea, index }) {
  return (
    <Reveal className="ed-idea" delay={index * 90}>
      <p className="ed-idea-text">{idea.text}</p>
    </Reveal>
  )
}

/* ====== 弹窗 ====== */
function ProjectModal({ project, onClose, onFilesChange }) {
  const { editMode } = useEditMode()
  if (!project) return null

  const files = project.files ?? []

  return (
    <div className="ed-modal-overlay" onClick={onClose}>
      <div className="ed-modal" onClick={(e) => e.stopPropagation()}>
        <button className="ed-modal-close" onClick={onClose} aria-label="关闭" />

        <div className="ed-modal-body">
          <div className="ed-modal-head">
            <span className="ed-label">
              {statusLabels[project.status] || statusLabels.done}
              {project.startedAt || project.date ? ` · ${project.startedAt || project.date}` : ''}
              {project.completedAt ? ` → ${project.completedAt}` : ''}
            </span>
            <h2 className="ed-modal-title">{project.title}</h2>
            {project.techStack?.length > 0 && (
              <p className="ed-modal-tech">{project.techStack.join(' · ')}</p>
            )}
          </div>

          {project.detail ? (
            <div className="ed-modal-detail">{renderParagraphs(project.detail)}</div>
          ) : (
            <p className="ed-modal-detail">{project.description}</p>
          )}

          {project.highlights?.length > 0 && (
            <ul className="ed-modal-highlights">
              {project.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          )}

          {project.repoUrl && (
            <a
              className="ed-modal-link hover-underline"
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
            >
              仓库 ↗
            </a>
          )}

          {/* 项目文档：设计稿 / 截图 / 说明文档，md 可以就地阅读 */}
          {(files.length > 0 || editMode) && (
            <div className="ed-modal-files">
              <h3 className="ed-label">项目文档</h3>
              <FileAttach
                files={files}
                onChange={(next) => onFilesChange(project.id, next)}
                label="文档 / 截图"
                emptyHint="这个项目还没有上传文档或截图。"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ====== 「查看全部」面板：全屏列表 + 搜索 + 筛选 ====== */
function AllProjectsPanel({ projects, onClose, onSelect }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')

  // Esc 关闭
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // 面板是整屏的，锁住背后页面的滚动，否则滚轮会穿透
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const results = useMemo(() => {
    const kw = query.trim().toLowerCase()
    return projects.filter((p) => {
      if (status !== 'all' && p.status !== status) return false
      if (!kw) return true
      const hay = [p.title, p.description, ...(p.techStack ?? [])].join(' ').toLowerCase()
      return hay.includes(kw)
    })
  }, [projects, query, status])

  return (
    <div className="ed-all" role="dialog" aria-modal="true" aria-label="全部项目">
      <div className="ed-all-inner">
        <div className="ed-all-head">
          <h2 className="ed-all-title">全部项目</h2>
          <button className="ed-modal-close ed-all-close" onClick={onClose} aria-label="关闭" />
        </div>

        <div className="ed-all-controls">
          {/* 底线输入框 + 浮动标签（Editorial 风格的表单语言） */}
          <label className="ed-field">
            <input
              className="ed-field-input"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder=" "
              autoFocus
            />
            <span className="ed-field-label">搜索项目 / 技术栈</span>
          </label>

          <nav className="ed-filters">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`ed-filter${status === f.key ? ' ed-filter--active' : ''}`}
                onClick={() => setStatus(f.key)}
              >
                {f.label}
              </button>
            ))}
          </nav>
        </div>

        <p className="ed-all-count">
          {results.length} / {projects.length} 个项目
        </p>

        <div className="ed-list">
          {results.map((p, i) => (
            <ProjectRow key={p.id} project={p} index={i} onSelect={onSelect} />
          ))}
        </div>

        {results.length === 0 && <p className="ed-empty">没有匹配的项目，换个关键词试试。</p>}
      </div>
    </div>
  )
}

/* ====== 主组件 ====== */
function Projects() {
  const { data, saveSection } = useData()
  const projectData = data.projects ?? seedProjectData

  // 存 id 而不是对象快照 —— 上传附件后 projectData 会更新，按 id 重查才拿得到最新的 files
  const [modalId, setModalId] = useState(null)
  const [showAll, setShowAll] = useState(false)

  // ⚠️ 每个字段都要兜底：spread 一个 undefined 会直接抛 TypeError，
  // 整页白屏。2026-10-07 就踩过一次 —— 数据里删掉 abandoned 字段后
  // 这里没改，页面直接挂了。
  const allProjects = [
    ...(projectData.active ? [projectData.active] : []),
    ...(projectData.done ?? []),
    ...(projectData.abandoned ?? []),
  ]

  const preview = allProjects.slice(0, PREVIEW_COUNT)
  const modalItem = modalId ? allProjects.find((p) => p.id === modalId) : null

  /** 上传 / 删除某个项目的附件后，把整个 projects 文档存回后端。
      active 是单个对象、done / abandoned 是数组，所以分开打补丁 */
  async function handleProjectFiles(projectId, files) {
    const patch = (p) => (p && p.id === projectId ? { ...p, files } : p)
    const next = { ...projectData }
    if (next.active) next.active = patch(next.active)
    next.done = (next.done ?? []).map(patch)
    next.abandoned = (next.abandoned ?? []).map(patch)
    await saveSection('projects', next)
  }

  return (
    <main className="ed-world">
      <div className="ed-inner">
        {/* Hero：巨型衬线标题 + 斜体副行，右侧小号大写说明 */}
        <header className="ed-hero">
          <div className="ed-hero-row">
            <Reveal as="h1" className="ed-hero-title">
              代码开发
              <br />
              <em>写下来的东西。</em>
            </Reveal>
            <Reveal as="p" className="ed-hero-note" delay={140}>
              课余写的项目、踩过的坑，以及那些还没动手的念头。
              每一个都留着当时的思路和取舍。
            </Reveal>
          </div>
        </header>

        {/* 项目列表 */}
        <section className="ed-section">
          <div className="ed-sec-head">
            <h2 className="ed-label">项目</h2>
            {/* 项目会越写越多，页面上只列前几个，筛选和搜索都收进面板里 */}
            <button className="ed-see-all hover-underline" onClick={() => setShowAll(true)}>
              查看全部 {allProjects.length} 个
            </button>
          </div>

          <div className="ed-list">
            {preview.map((item, i) => (
              <ProjectRow
                key={item.id}
                project={item}
                index={i}
                onSelect={(p) => setModalId(p.id)}
              />
            ))}
          </div>
        </section>

        {/* 灵感碎片 */}
        {projectData.ideas?.length > 0 && (
          <section className="ed-section">
            <div className="ed-sec-head">
              <h2 className="ed-label">灵感碎片</h2>
              <span className="ed-label ed-label--muted">还没动手</span>
            </div>
            <div className="ed-grid">
              {projectData.ideas.map((idea, i) => (
                <IdeaCard key={idea.id} idea={idea} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      <SiteFooter path="/projects" />

      {showAll && (
        <AllProjectsPanel
          projects={allProjects}
          onClose={() => setShowAll(false)}
          onSelect={(p) => {
            // 先关面板再开详情 —— 不做嵌套弹窗
            setShowAll(false)
            setModalId(p.id)
          }}
        />
      )}

      <ProjectModal
        project={modalItem}
        onClose={() => setModalId(null)}
        onFilesChange={handleProjectFiles}
      />
      <EditButton sectionKey="projects" label="代码开发" />
    </main>
  )
}

export default Projects
