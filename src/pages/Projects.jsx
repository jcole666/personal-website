import { useEffect, useRef, useState } from 'react'
import seedProjectData from '../data/projects.js'
import { useData } from '../context/DataContext.jsx'
import EditButton from '../components/edit/EditButton.jsx'
import SiteFooter from '../components/SiteFooter.jsx'

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
function ProjectModal({ project, onClose }) {
  if (!project) return null

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
        </div>
      </div>
    </div>
  )
}

/* ====== 主组件 ====== */
function Projects() {
  const { data } = useData()
  const projectData = data.projects ?? seedProjectData

  const [filter, setFilter] = useState('all')
  const [modalItem, setModalItem] = useState(null)

  const allProjects = projectData.active
    ? [projectData.active, ...projectData.done, ...projectData.abandoned]
    : [...projectData.done, ...projectData.abandoned]

  const filtered =
    filter === 'all' ? allProjects : allProjects.filter((p) => p.status === filter)

  const filters = [
    { key: 'all', label: '全部' },
    { key: 'active', label: '进行中' },
    { key: 'done', label: '已完成' },
    { key: 'abandoned', label: '搁置' },
  ]

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
            <nav className="ed-filters">
              {filters.map((f) => (
                <button
                  key={f.key}
                  className={`ed-filter${filter === f.key ? ' ed-filter--active' : ''}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="ed-list">
            {filtered.map((item, i) => (
              <ProjectRow key={item.id} project={item} index={i} onSelect={setModalItem} />
            ))}
          </div>

          {filtered.length === 0 && <p className="ed-empty">这个分类下暂时没有项目。</p>}
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

      <ProjectModal project={modalItem} onClose={() => setModalItem(null)} />
      <EditButton sectionKey="projects" label="代码开发" />
    </main>
  )
}

export default Projects
