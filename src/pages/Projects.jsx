import { useState } from 'react'
import seedProjectData from '../data/projects.js'
import { useData } from '../context/DataContext.jsx'
import EditButton from '../components/edit/EditButton.jsx'

/* ====== 工具 ====== */
function renderParagraphs(text) {
  if (!text) return null
  return text.trim().split('\n\n').map((para, i) => <p key={i}>{para.trim()}</p>)
}

const statusLabels = { active: '进行中', done: '已完成', abandoned: '搁置' }

/* ====== 项目卡片（GradientCard 风格） ====== */
const gradientMap = { active: 'green', done: 'purple', abandoned: 'gray' }
const badgeColorMap = { active: '#10B981', done: '#8B5CF6', abandoned: '#9CA3AF' }

function ProjectCard({ project, onSelect }) {
  const gradient = gradientMap[project.status] || 'gray'
  const badgeColor = badgeColorMap[project.status] || '#9CA3AF'

  return (
    <div
      className={`projects-card projects-card--${gradient} ${project.status === 'abandoned' ? 'projects-card--abandoned' : ''}`}
      onClick={() => onSelect(project)}
    >
      {/* 装饰背景图形（hover 时缩放 + 旋转） */}
      <span className="projects-card-graphic" aria-hidden="true" />

      {/* 卡片内容 */}
      <div className="projects-card-content">
        {/* 徽章 */}
        <div className="projects-card-badge">
          <span className="projects-card-badge-dot" style={{ backgroundColor: badgeColor }} />
          {statusLabels[project.status] || statusLabels.done}
        </div>

        {/* 标题 */}
        <h3 className="projects-card-title">{project.title}</h3>

        {/* 技术栈 */}
        <div className="projects-card-tech">
          {project.techStack?.map((t) => (
            <span key={t} className="projects-card-tag">{t}</span>
          ))}
        </div>

        {/* 描述 */}
        <p className="projects-card-desc">{project.description}</p>

        {/* 进度（可选） */}
        {project.progress != null && (
          <div className="projects-card-progress">
            <div className="projects-card-bar">
              <div className="projects-card-fill" style={{ width: `${project.progress}%` }} />
            </div>
            <div className="projects-card-pct">{project.progress}%</div>
          </div>
        )}

        {/* CTA */}
        <span className="projects-card-cta">
          查看详情
          <svg className="projects-card-cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </div>
  )
}

/* ====== 灵感碎片卡片（GradientCard 风格） ====== */
const ideaGradientMap = { green: 'green', blue: 'purple', pink: 'gray' }
const ideaBadgeColorMap = { green: '#10B981', blue: '#8B5CF6', pink: '#EC4899' }

function IdeaCard({ idea }) {
  const gradient = ideaGradientMap[idea.color] || 'green'
  const badgeColor = ideaBadgeColorMap[idea.color] || '#10B981'

  return (
    <div className={`projects-idea-card projects-card--${gradient}`}>
      <span className="projects-card-graphic" aria-hidden="true" />
      <div className="projects-idea-card-content">
        <div className="projects-card-badge">
          <span className="projects-card-badge-dot" style={{ backgroundColor: badgeColor }} />
          灵感
        </div>
        <div className="projects-idea-card-text">{idea.text}</div>
      </div>
    </div>
  )
}

/* ====== 弹窗（GradientCard 风格） ====== */
function ProjectModal({ project, onClose }) {
  if (!project) return null
  const badgeColor = badgeColorMap[project.status] || '#9CA3AF'

  return (
    <div className="projects-modal-overlay" onClick={onClose}>
      <div className="projects-modal" onClick={(e) => e.stopPropagation()}>
        <button className="projects-modal-close" onClick={onClose} aria-label="关闭" />
        <div className="projects-modal-body">
          <div className="projects-modal-head">
            <div className="projects-card-badge">
              <span className="projects-card-badge-dot" style={{ backgroundColor: badgeColor }} />
              {statusLabels[project.status] || statusLabels.done}
            </div>
            <h2 className="projects-modal-title">{project.title}</h2>
            <div className="projects-modal-tags">
              {project.techStack?.map((t) => (
                <span key={t} className="projects-modal-tag">{t}</span>
              ))}
            </div>
            <span className="projects-modal-date">
              {project.startedAt || project.date}
              {project.completedAt ? ` → ${project.completedAt}` : ''}
            </span>
          </div>
          <hr className="projects-modal-sep" />
          {project.detail ? (
            <div className="projects-modal-detail">{renderParagraphs(project.detail)}</div>
          ) : (
            <div className="projects-modal-desc">{project.description}</div>
          )}
          {project.highlights?.length > 0 && (
            <div className="projects-modal-highlights">
              {project.highlights.map((h, i) => (
                <div key={i} className="projects-modal-highlight">{h}</div>
              ))}
            </div>
          )}
          {project.repoUrl && (
            <span className="projects-modal-link">
              <a href={project.repoUrl} target="_blank" rel="noreferrer" className="projects-modal-link-a">
                → 仓库
              </a>
            </span>
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

  const filtered = filter === 'all'
    ? allProjects
    : allProjects.filter((p) => p.status === filter)

  const filters = [
    { key: 'all', label: '全部' },
    { key: 'active', label: '进行中' },
    { key: 'done', label: '已完成' },
    { key: 'abandoned', label: '搁置' },
  ]

  return (
    <main className="projects-world">
      <div className="projects-inner">
        {/* 头部 */}
        <div className="projects-hero">
          <h1 className="projects-hero-title">代码开发</h1>
          <p className="projects-hero-sub">GRAPH PAPER · WRENCH IT TILL IT WORKS</p>
        </div>

        {/* 筛选按钮 */}
        <div className="projects-filter">
          {filters.map((f) => (
            <button
              key={f.key}
              className={`projects-filter-btn ${filter === f.key ? 'projects-filter-btn--active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* 项目画廊 */}
        <div className="projects-grid">
          {filtered.map((item) => (
            <ProjectCard key={item.id} project={item} onSelect={setModalItem} />
          ))}
        </div>

        {/* 灵感碎片 */}
        <div className="projects-ideas-section">
          <h2 className="projects-ideas-title">灵感碎片</h2>
          <div className="projects-ideas-grid">
            {projectData.ideas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        </div>
      </div>

      <footer className="projects-footer">
        <div className="projects-footer-inner">
          <div className="projects-footer-brand">
            <span className="projects-footer-logo">流前 · 坐标纸</span>
            <span className="projects-footer-tag">GRAPH PAPER · SINCE 2025</span>
          </div>
          <nav className="projects-footer-links">
            <a href="https://github.com/jcole666" target="_blank" rel="noreferrer">GitHub</a>
            <a href="mailto:me@example.com">Email</a>
          </nav>
        </div>
        <div className="projects-footer-bottom">
          <span>© 2026 流前</span>
        </div>
      </footer>

      <ProjectModal project={modalItem} onClose={() => setModalItem(null)} />
      <EditButton sectionKey="projects" label="代码开发" />
    </main>
  )
}

export default Projects
