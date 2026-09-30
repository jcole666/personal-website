import { useState } from 'react'
import seedFood from '../data/food.js'
import { useData } from '../context/DataContext.jsx'
import EditButton from '../components/edit/EditButton.jsx'
import PhotoArt from '../components/PhotoArt.jsx'
import SiteFooter from '../components/SiteFooter.jsx'

/* ====== 工具 ====== */
function renderParagraphs(text) {
  if (!text) return null
  return text.trim().split('\n\n').map((para, i) => <p key={i}>{para.trim()}</p>)
}

/**
 * 田园装饰：一小枝手绘叶子。
 * 用 SVG 线稿而不是 emoji —— emoji 是彩色位图，颜色改不动，
 * 而且和这套柔和大地色系放在一起会显得突兀。SVG 能直接吃 currentColor。
 */
function Sprig({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 44"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M20 42V6" />
      <path d="M20 32c-6-2-10-6-11-13 7 1 11 5 11 13Z" />
      <path d="M20 23c6-2 10-6 11-13-7 1-11 5-11 13Z" />
      <path d="M20 15c-5-2-8-5-9-10 6 1 9 4 9 10Z" />
      <path d="M20 9c5-2 8-4 9-8-6 1-9 3-9 8Z" />
    </svg>
  )
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
      <div className="food-card-photo">
        {/* 有 photoUrl 显示真照片，没有就画一张手绘食谱卡 */}
        <PhotoArt
          src={item.photoUrl}
          alt={item.name}
          id={item.id}
          label={item.name}
          theme="food"
          accent={badge}
        />
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
function FoodModal({ item, accent, onClose }) {
  if (!item) return null
  return (
    <div className="food-modal-overlay" onClick={onClose}>
      <div className="food-modal" onClick={(e) => e.stopPropagation()}>
        <button className="food-modal-close" onClick={onClose}>✕</button>
        <div className="food-modal-photo">
          <PhotoArt
            src={item.photoUrl}
            alt={item.name}
            id={item.id}
            label={item.name}
            theme="food"
            accent={accent}
          />
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
    <div className="food-stall">
      <div className="food-stall-head" id={stall.id}>
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

      <FoodModal item={modalItem} accent={stall.color} onClose={() => setModalItem(null)} />

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
  const { data } = useData()
  const foodData = data.food ?? seedFood

  return (
    <main className="food-world">
      <div className="food-inner">
        {/* 头部 */}
        <div className="food-hero">
          <div className="food-hero-sprigs" aria-hidden="true">
            <Sprig className="food-hero-sprig" />
            <Sprig className="food-hero-sprig food-hero-sprig--flip" />
          </div>
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

      <SiteFooter path="/food" />
      <EditButton sectionKey="food" label="市集" />
    </main>
  )
}

export default Food
