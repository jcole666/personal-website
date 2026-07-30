import { useState } from 'react'
import foodData from '../data/food.js'

/* ====== 工具 ====== */
function getPhotoGradient(id) {
  const palettes = [
    ['#e8c4a0', '#d4a878'], ['#c4a888', '#b89870'],
    ['#d4b896', '#c4a076'], ['#e0ccb0', '#ccb088'],
    ['#dcc8a8', '#c8b490'], ['#e8d4b8', '#d0bc98'],
    ['#c8b090', '#b8a080'], ['#d8c4a8', '#c8b488'],
    ['#e4d0b4', '#ccb894'], ['#ccc0a0', '#bcb088'],
  ]
  let hash = 0
  for (let i = 0; i < id.length; i++) { hash = ((hash << 5) - hash) + id.charCodeAt(i); hash |= 0 }
  const idx = Math.abs(hash) % palettes.length
  return `linear-gradient(135deg, ${palettes[idx][0]}, ${palettes[idx][1]})`
}

function renderParagraphs(text) {
  if (!text) return null
  return text.trim().split('\n\n').map((para, i) => <p key={i}>{para.trim()}</p>)
}

function StarsText({ rating }) {
  if (!rating) return null
  const filled = Math.floor(rating)
  const half = rating % 1 >= 0.5
  let s = ''
  for (let i = 0; i < filled; i++) s += '★'
  if (half) s += '½'
  let rest = ''
  for (let i = 0; i < 5 - filled - (half ? 1 : 0); i++) rest += '☆'
  return <span>{s}{rest}</span>
}

/* ====== 单张卡片 ====== */
function FoodCard({ item, badge, onSelect }) {
  return (
    <div className="food-card" onClick={() => onSelect(item)}>
      <div className="food-card-photo" style={{ background: getPhotoGradient(item.id) }}>
        {item.photoUrl ? (
          <img src={item.photoUrl} alt={item.name} />
        ) : (
          <span className="food-card-photo-placeholder">🍽️</span>
        )}
        {badge && (
          <span className="food-card-badge" style={{ background: badge }}>
            {item.tags?.[0] || ''}
          </span>
        )}
      </div>
      <div className="food-card-info">
        <div className="food-card-name">{item.name}</div>
        <div className="food-card-shop">{item.shop}</div>
        <div className="food-card-meta-row">
          <span className="food-card-rating"><StarsText rating={item.rating} /></span>
          {item.price && <span className="food-card-price">{item.price}</span>}
        </div>
      </div>
    </div>
  )
}

/* ====== 详情弹窗 ====== */
function FoodModal({ item, onClose }) {
  if (!item) return null
  return (
    <div className="food-modal-overlay" onClick={onClose}>
      <div className="food-modal" onClick={(e) => e.stopPropagation()}>
        <button className="food-modal-close" onClick={onClose}>✕</button>
        <div className="food-modal-photo">
          {item.photoUrl ? (
            <img src={item.photoUrl} alt={item.name} />
          ) : (
            <span style={{ fontSize: '3rem', opacity: 0.2 }}>🍽️</span>
          )}
        </div>
        <div className="food-modal-body">
          <div className="food-modal-tags">
            {item.tags?.map((t) => <span key={t} className="food-modal-tag">{t}</span>)}
          </div>
          <h2 className="food-modal-name">{item.name}</h2>
          <p className="food-modal-shop">{item.shop} · {item.location}</p>
          <p className="food-modal-meta-row">{item.date} · {item.price}</p>
          <div className="food-modal-review">{renderParagraphs(item.review)}</div>
        </div>
      </div>
    </div>
  )
}

/* ====== 全部显示弹窗 ====== */
function FullListModal({ items, title, badge, onClose, onSelect }) {
  return (
    <div className="food-full-overlay" onClick={onClose}>
      <div className="food-full-panel" onClick={(e) => e.stopPropagation()}>
        <button className="food-full-close" onClick={onClose}>✕</button>
        <h2 className="food-full-title">{title}</h2>
        <div className="food-full-grid">
          {items.map((item) => (
            <FoodCard key={item.id} item={item} badge={badge} onSelect={(it) => { onSelect(it); onClose() }} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ====== 单个摊位 ====== */
function Stall({ stall }) {
  const [modalItem, setModalItem] = useState(null)
  const [showAll, setShowAll] = useState(false)

  const visible = showAll ? stall.items : stall.items.slice(0, 6)
  const hasMore = stall.items.length >= 6

  return (
    <div className="food-stall" id={stall.id}>
      <div className="food-stall-head">
        <span className="food-stall-dot" style={{ background: stall.color }} />
        <span className="food-stall-icon">{stall.icon}</span>
        <span className="food-stall-name">{stall.name}</span>
        <span className="food-stall-desc">{stall.items.length} 种</span>
      </div>

      <div className="food-stall-grid">
        {visible.map((item) => (
          <FoodCard key={item.id} item={item} badge={stall.color} onSelect={setModalItem} />
        ))}
      </div>

      {hasMore && (
        <button className="food-more-btn" onClick={() => setShowAll(true)}>
          查看全部 {stall.items.length} 种
        </button>
      )}

      <FoodModal item={modalItem} onClose={() => setModalItem(null)} />

      {showAll && (
        <FullListModal
          items={stall.items}
          title={`${stall.icon} ${stall.name}`}
          badge={stall.color}
          onClose={() => setShowAll(false)}
          onSelect={setModalItem}
        />
      )}
    </div>
  )
}

/* ====== 主组件 ====== */
function Food() {
  return (
    <main className="food-world">
      <div className="food-inner">
        {/* 头部 */}
        <div className="food-hero">
          <h1 className="food-hero-title">市集</h1>
          <div className="food-hero-line" />
          <p className="food-hero-sub">从学校后街到城市角落，记录吃过的每一口好味道。</p>
        </div>

        {/* 快速导航栏 */}
        <nav className="food-quick-nav">
          {foodData.stalls.map((stall) => (
            <a
              key={stall.id}
              href={`#${stall.id}`}
              className="food-quick-nav-item"
              style={{ '--nav-color': stall.color }}
            >
              <span className="food-quick-nav-dot" style={{ background: stall.color }} />
              <span>{stall.icon}</span>
              <span>{stall.name}</span>
            </a>
          ))}
        </nav>

        {/* 各摊位 */}
        {foodData.stalls.map((stall) => (
          <Stall key={stall.id} stall={stall} />
        ))}
      </div>

      <footer className="food-footer">
        <div className="food-footer-inner">
          <div className="food-footer-brand">
            <span className="food-footer-logo">流前</span>
            <span className="food-footer-tag">市集</span>
          </div>
          <nav className="food-footer-links">
            <a href="https://github.com/jcole666" target="_blank" rel="noreferrer">GitHub</a>
            <a href="mailto:me@example.com">Email</a>
          </nav>
        </div>
        <div className="food-footer-bottom">
          <span>© 2026 流前</span>
        </div>
      </footer>
    </main>
  )
}

export default Food
