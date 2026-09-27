import { useState } from 'react'
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

/* ====== 项目条目 ====== */
function ProjectRow({ project, index, onSelect }) {
  const abandoned = project.status === 'abandoned'

  return (
    <div
      className={`ed-row${abandoned ? ' ed-row--abandoned' : ''}`}
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
    </div>
  )
}

/* ====== 灵感碎片 ====== */
function IdeaCard({ idea }) {
  return (
    <div className="ed-idea">
      <p className="ed-idea-text">{idea.text}</p>
    </div>
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
            <h1 className="ed-hero-title">
              代码开发
              <br />
              <em>写下来的东西。</em>
            </h1>
            <p className="ed-hero-note">
              课余写的项目、踩过的坑，以及那些还没动手的念头。
              每一个都留着当时的思路和取舍。
            </p>
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
              {projectData.ideas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
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
