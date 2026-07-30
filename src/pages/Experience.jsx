import { useState, useMemo } from 'react'
import {
  Title,
  Tag,
  Divider,
  Typewriter,
  Time,
  BackTop,
  Icon,
} from 'animal-island-ui'
import { experiences, experienceTypes } from '../data/experience.js'
import Villagers from '../components/Villagers.jsx'

// 类型标签颜色映射
const typeColors = {
  '旅行': 'app-teal',
  '支教': 'app-orange',
  '活动': 'purple',
  '实习': 'app-blue',
  '竞赛': 'app-yellow',
  '社团': 'app-green',
  '志愿': 'lime-green',
}

function renderParagraphs(text) {
  return text
    .trim()
    .split('\n\n')
    .map((para, i) => <p key={i}>{para.trim()}</p>)
}

/**
 * 经历详情弹窗
 * 从页面中间弹出，显示照片 + 完整文字
 */
function DetailModal({ item, onClose }) {
  if (!item) return null

  return (
    <div className="exp-modal-overlay" onClick={onClose}>
      <div className="exp-modal" onClick={(e) => e.stopPropagation()}>
        {/* 关闭按钮 */}
        <button className="exp-modal-close" onClick={onClose}>
          ✕
        </button>

        {/* 封面图 */}
        {item.cover ? (
          <div className="exp-modal-cover">
            <img src={item.cover} alt={item.title} />
          </div>
        ) : (
          <div className="exp-modal-cover exp-modal-cover--placeholder">
            <Icon name="icon-camera" size={48} />
            <span>暂无照片</span>
          </div>
        )}

        {/* 内容区 */}
        <div className="exp-modal-body">
          <div className="exp-modal-meta">
            <Tag color={typeColors[item.type]} size="small">{item.type}</Tag>
            <span className="exp-modal-date">{item.date}</span>
          </div>
          <h2 className="exp-modal-title">{item.title}</h2>
          <div className="exp-modal-details">
            {renderParagraphs(item.details)}
          </div>
        </div>
      </div>
    </div>
  )
}

function Experience() {
  const [activeType, setActiveType] = useState(null) // null = 全部
  const [selectedItem, setSelectedItem] = useState(null)

  // 根据类型筛选
  const filtered = useMemo(() => {
    if (!activeType) return experiences
    return experiences.filter((e) => e.type === activeType)
  }, [activeType])

  return (
    <main className="experience-world">
      <div className="experience-inner">
        {/* 飘带标题 */}
        <div className="experience-title-wrap">
          <Title size="large" color="app-teal">
            <Icon name="icon-map" size={36} />
            {' '}经历分享
          </Title>
        </div>

        {/* 动森时钟 + 打字机开场 */}
        <div className="experience-hero">
          <div className="experience-hero-time">
            <Time />
          </div>
          <div className="experience-hero-text">
            <Typewriter speed={60}>
              <p className="experience-intro-text">
                欢迎来到我的冒险笔记！这里记录了我大学生活中走过的路、踩过的坑、遇见的人。
              </p>
            </Typewriter>
          </div>
        </div>

        <Divider type="dashed-brown" />

        {/* 类型筛选栏 —— 轻量标签，不抢眼 */}
        <div className="exp-filter">
          <button
            className={`exp-filter-btn ${activeType === null ? 'exp-filter-btn--active' : ''}`}
            onClick={() => setActiveType(null)}
          >
            全部
          </button>
          {experienceTypes.map((type) => (
            <button
              key={type}
              className={`exp-filter-btn ${activeType === type ? 'exp-filter-btn--active' : ''}`}
              onClick={() => setActiveType(type === activeType ? null : type)}
            >
              {type}
            </button>
          ))}
        </div>

        {/* 画廊卡片网格 */}
        <div className="exp-gallery">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="exp-card"
              onClick={() => setSelectedItem(item)}
            >
              {/* 照片区 */}
              <div className="exp-card-cover">
                {item.cover ? (
                  <img src={item.cover} alt={item.title} />
                ) : (
                  <div className="exp-card-cover--empty">
                    <Icon name="icon-camera" size={32} />
                  </div>
                )}
              </div>

              {/* 信息区 */}
              <div className="exp-card-body">
                <div className="exp-card-top">
                  <Tag color={typeColors[item.type]} size="small">{item.type}</Tag>
                  <span className="exp-card-date">{item.date}</span>
                </div>
                <h3 className="exp-card-title">{item.title}</h3>
                <p className="exp-card-summary">{item.summary}</p>
              </div>
            </article>
          ))}
        </div>

        {/* 空状态 */}
        {filtered.length === 0 && (
          <div className="exp-empty">
            <Icon name="icon-map" size={48} />
            <p>还没有这个类型的记录，去创造一些回忆吧～</p>
          </div>
        )}
      </div>

      {/* 页脚 */}
      <footer className="experience-footer">
        <div className="experience-footer-inner">
          <div className="experience-footer-brand">
            <span className="experience-footer-logo">流前</span>
            <span className="experience-footer-tag">
              <Icon name="icon-miles" size={18} /> 岛屿日志
            </span>
          </div>
          <nav className="experience-footer-links">
            <a href="https://github.com/jcole666" target="_blank" rel="noreferrer">GitHub</a>
            <a href="mailto:me@example.com">Email</a>
          </nav>
        </div>
        <div className="experience-footer-bottom">
          <span>© 2026 流前 · 用 React + 动森 UI 手工打造</span>
        </div>
      </footer>

      {/* 海浪 + 回到顶部 + 桌面宠物 */}
      <div className="experience-sea" />
      <BackTop />
      <Villagers />

      {/* 详情弹窗 */}
      <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </main>
  )
}

export default Experience
