import { Icon } from 'animal-island-ui'
import TransitionLink from './TransitionLink.jsx'
import { sections as seedSections } from '../data/sections.js'
import { useData } from '../context/DataContext.jsx'

function Sections() {
  const { data } = useData()
  const sections = data.sections?.sections ?? seedSections

  return (
    <section className="worlds">
      <div className="worlds-head">
        <span className="worlds-eyebrow">CHOOSE A WORLD</span>
        <h2 className="worlds-title">选择一个世界</h2>
      </div>
      <div className="worlds-list">
        {sections.map((section) => (
          <TransitionLink to={section.link} className="world-card" key={section.num}>
            {/* 液态玻璃虹彩边缘 */}
            <span className="world-iris" aria-hidden="true" />
            {/* hover 高光扫过层（玻璃反光） */}
            <span className="world-shine" aria-hidden="true" />
            <span className="world-num" aria-hidden="true">
              {section.num}
            </span>
            <div className="world-body">
              <span className="world-icon">
                <Icon name={section.icon} size={42} />
              </span>
              <div className="world-text">
                <h3 className="world-title">{section.title}</h3>
                <span className="world-label">{section.label}</span>
                <p className="world-desc">{section.desc}</p>
              </div>
            </div>
            <div className="world-latest">
              <span className="world-latest-tag">最新</span>
              <p className="world-latest-text">{section.latest}</p>
              <span className="world-enter">▸ 进入传送门</span>
            </div>
          </TransitionLink>
        ))}
      </div>
    </section>
  )
}

export default Sections
