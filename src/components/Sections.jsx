import { Link } from 'react-router-dom'
import { sections } from '../data/sections.js'

function Sections() {
  return (
    <section className="worlds">
      <div className="worlds-head">
        <span className="worlds-eyebrow">CHOOSE A WORLD</span>
        <h2 className="worlds-title">选择一个世界</h2>
      </div>
      <div className="worlds-list">
        {sections.map((section) => (
          <Link to={section.link} className="world-card" key={section.num}>
            <span className="world-num" aria-hidden="true">
              {section.num}
            </span>
            <div className="world-body">
              <span className="world-icon">{section.icon}</span>
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
          </Link>
        ))}
      </div>
    </section>
  )
}

export default Sections
