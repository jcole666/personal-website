import { useEffect, useMemo, useRef, useState } from 'react'
import seedFood from '../data/food.js'
import { useData } from '../context/DataContext.jsx'
import { useEditMode } from '../context/EditModeContext.jsx'
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
  const { editMode } = useEditMode()
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
        {/* 占位标记 —— 只在编辑模式（?edit=1）显示，访客看不到 */}
        {item.placeholder && editMode && <span className="food-ph-badge">示例</span>}
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
  const { editMode } = useEditMode()
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
          {item.placeholder && editMode && (
            <span className="food-ph-badge food-ph-badge--modal">示例</span>
          )}
        </div>
        <div className="food-modal-body">
          {item.placeholder && editMode && (
            <p className="food-ph-note">
              ⚠️ 这条是 AI 生成的占位示例（店名 / 价格 / 评分 / 点评都是编的），待替换成真实记录
            </p>
          )}
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

/* ====== 全部显示弹窗 ======
   ⚠️ 点条目**只开详情弹窗、不关清单** —— 关掉详情要回到这个清单，
   不是直接回市集页。详情弹窗 z-index 比清单高（见 food.css）。 */
function FullListModal({ items, title, badge, onClose, onSelect }) {
  return (
    <div className="food-full-overlay" onClick={onClose}>
      <div className="food-full-panel" onClick={(e) => e.stopPropagation()}>
        <button className="food-full-close" onClick={onClose}>✕</button>
        <h2 className="food-full-title">{title}</h2>
        <div className="food-full-grid">
          {items.map((item) => (
            <FoodCard key={item.id} item={item} badge={badge} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ====== 「流前精选」弹窗 ======
   每个摊位挑出来的几件（评分 ≥4.5，理由取自自己的点评），一排 5 张卡片，
   卡上直接带推荐理由。
   ⚠️ 点卡片**只开详情弹窗、不关这个清单** —— 关掉详情要回到精选，不是直接回市集页。
   详情弹窗 z-index 比它高（见 food.css）。 */
function PicksModal({ stall, picks, onClose, onSelect }) {
  const { editMode } = useEditMode()
  if (!stall) return null
  return (
    <div className="food-picks-overlay" onClick={onClose}>
      <div
        className={`food-picks-panel food-picks-panel--n${Math.min(Math.max(picks.length, 1), 5)}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="food-picks-close" onClick={onClose} aria-label="关闭">✕</button>

        <div className="food-picks-head">
          <span className="food-picks-dot" style={{ background: stall.color }} />
          <span className="food-picks-icon">{stall.icon}</span>
          <h2 className="food-picks-title">流前精选 · {stall.name}</h2>
          <span className="food-picks-count">{picks.length} 件</span>
        </div>

        <div className="food-picks-grid">
          {picks.map((item) => (
            <div
              key={item.id}
              className="food-pick-card"
              onClick={() => onSelect(item)}
              title={item.name}
            >
              <div className="food-pick-photo">
                <PhotoArt
                  src={item.photoUrl}
                  alt={item.name}
                  id={item.id}
                  theme="food"
                  accent={stall.color}
                />
                <span className="food-pick-badge">✦ 精选</span>
                {item.placeholder && editMode && (
                  <span className="food-ph-badge food-ph-badge--pick">示例</span>
                )}
              </div>
              <div className="food-pick-body">
                <div className="food-pick-name">{item.name}</div>
                <div className="food-pick-shop">{item.shop}</div>
                <p className="food-pick-reason">{item.pick}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ====== 单个摊位 ======
   overrideItems：搜索时传进来的「命中条目」。传 null 表示正常显示整个摊位。
   —— 搜索是在摊位内部过滤、命中为 0 的摊位整块隐藏，
      这样顶部 / 侧边的快速跳转在搜索时依然指向真实存在的摊位。 */
function Stall({ stall, overrideItems }) {
  const [modalItem, setModalItem] = useState(null)
  const [showAll, setShowAll] = useState(false)
  const [picksOpen, setPicksOpen] = useState(false)

  const searching = Array.isArray(overrideItems)
  const items = searching ? overrideItems : stall.items
  const visible = searching || showAll ? items : items.slice(0, 6)
  const hasMore = !searching && items.length >= 6
  /* 精选始终取摊位的全量（不受搜索影响）—— 它是一份独立的「我推荐」名单 */
  const picks = stall.items.filter((it) => it.pick)

  return (
    <div className="food-stall">
      <div className="food-stall-head" id={stall.id}>
        <span className="food-stall-dot" style={{ background: stall.color }} />
        <span className="food-stall-icon">{stall.icon}</span>
        <span className="food-stall-name">{stall.name}</span>
        {picks.length > 0 && (
          <button
            type="button"
            className="food-pick-btn"
            onClick={() => setPicksOpen(true)}
            title={`${stall.name}的流前精选`}
          >
            <span className="food-pick-btn-mark" aria-hidden="true">✦</span>
            流前精选
          </button>
        )}
        <span className="food-stall-desc">{items.length} 种</span>
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

      {picksOpen && (
        <PicksModal
          stall={stall}
          picks={picks}
          onClose={() => setPicksOpen(false)}
          onSelect={setModalItem}
        />
      )}

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
  const { editMode } = useEditMode()
  const foodData = data.food ?? seedFood
  const stalls = foodData.stalls

  /* 占位内容计数 —— 每条数据带 placeholder: true，替换后删掉那一行即可。
     只在编辑模式（?edit=1）下显示提示，访客看不到。 */
  const placeholderCount = stalls.reduce(
    (n, s) => n + s.items.filter((it) => it.placeholder).length,
    0,
  )
  const totalCount = stalls.reduce((n, s) => n + s.items.length, 0)

  /* 搜索：输入框内容和「真正生效的关键词」分开存 ——
     用户要的是「输入后点一下才搜」，不是边打字边过滤（和游戏页一致） */
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const kw = searchTerm.trim().toLowerCase()

  /* 在每个摊位内部过滤，命中为 0 的摊位整块隐藏 */
  const matches = useMemo(() => {
    if (!kw) return null
    const byStall = new Map()
    let total = 0
    for (const stall of stalls) {
      const hit = stall.items.filter((it) =>
        [it.name, it.shop, it.location, it.price, ...(it.tags ?? [])]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(kw)),
      )
      if (hit.length) {
        byStall.set(stall.id, hit)
        total += hit.length
      }
    }
    return { byStall, total }
  }, [kw, stalls])

  const shownStalls = matches ? stalls.filter((s) => matches.byStall.has(s.id)) : stalls

  /* 侧边快速跳转：顶部那一条滚出「吸顶导航下沿」之后才出现 —— 两者不同时出现。
     这里用 scroll 监听而不是 IntersectionObserver：顶部那条被吸顶导航**盖住**时
     它仍然算 intersecting，observer 判不出来。 */
  const quickNavRef = useRef(null)
  const [sideNavOn, setSideNavOn] = useState(false)
  const [activeId, setActiveId] = useState(stalls[0]?.id ?? '')
  const stallsRef = useRef(stalls)
  stallsRef.current = stalls

  useEffect(() => {
    const navH =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-height'),
      ) || 72

    const onScroll = () => {
      const el = quickNavRef.current
      if (el) setSideNavOn(el.getBoundingClientRect().bottom <= navH)
      // 当前所在摊位 = 最后一个顶部越过导航下沿的
      let cur = null
      for (const s of stallsRef.current) {
        const head = document.getElementById(s.id)
        if (head && head.getBoundingClientRect().top <= navH + 64) cur = s.id
      }
      if (cur) setActiveId(cur)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  /* 页内跳转用 JS 滚动，不在 URL 里留 hash（免得刷新 / 回退被锚点劫持）。
     落点由 .food-stall-head 的 scroll-margin-top: 90px 保证在导航下面。 */
  function jumpTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function runSearch() {
    setSearchTerm(searchInput)
  }

  function clearSearch() {
    setSearchInput('')
    setSearchTerm('')
  }

  return (
    <main className="food-world">
      <div className="food-inner">
        {/* 占位内容提示 —— 只在编辑模式（?edit=1）显示，访客看不到 */}
        {editMode && placeholderCount > 0 && (
          <div className="food-ph-notice">
            <span className="food-ph-notice-tag">示例</span>
            <p className="food-ph-notice-text">
              本页 <b>{placeholderCount}</b> / {totalCount} 条内容还是 AI 生成的占位示例 ——
              店名、地点、日期、价格、评分、点评、以及「流前精选」的理由<b>全部是编的</b>，
              照片也有不少是「同类代表图」而非那家店的实物。
              <br />
              替换某条时，删掉 <code>src/data/food.js</code> 里那一行的{' '}
              <code>placeholder: true</code>，角标和这个计数会自动减少。
            </p>
          </div>
        )}

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
        <nav className="food-quick-nav" ref={quickNavRef}>
          {stalls.map((stall) => (
            <a
              key={stall.id}
              href={`#${stall.id}`}
              className="food-quick-nav-item"
              style={{ '--nav-color': stall.color }}
              onClick={(e) => {
                e.preventDefault()
                jumpTo(stall.id)
              }}
            >
              <span className="food-quick-nav-dot" style={{ background: stall.color }} />
              <span>{stall.icon}</span>
              <span>{stall.name}</span>
            </a>
          ))}
        </nav>

        {/* 搜索：放在快速导航和第一个摊位之间，样式跟导航那条同一个盒子语言 */}
        <div className="food-search-wrap">
          <div className="food-search">
            <input
              className="food-search-input"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') runSearch()
              }}
              placeholder="搜索菜名 / 店铺 / 位置 / 标签"
              aria-label="搜索市集"
            />
            <button className="food-search-btn" onClick={runSearch}>搜索</button>
            {searchTerm && (
              <button className="food-search-clear" onClick={clearSearch} aria-label="清除搜索">
                ×
              </button>
            )}
          </div>
          {kw && (
            <p className="food-result-count">
              「{searchTerm}」
              <span className="food-result-num">共 {matches.total} 种</span>
            </p>
          )}
        </div>

        {/* 各摊位 */}
        {shownStalls.map((stall) => (
          <Stall
            key={stall.id}
            stall={stall}
            overrideItems={matches ? matches.byStall.get(stall.id) : null}
          />
        ))}

        {kw && matches.total === 0 && (
          <div className="food-empty">没有找到「{searchTerm}」，换个关键词试试～</div>
        )}
      </div>

      {/* 侧边快速跳转 —— 只在顶部那条滚出视口后出现（两者不同时出现） */}
      <nav
        className={`food-side-nav${sideNavOn ? ' food-side-nav--show' : ''}`}
        aria-label="摊位快速跳转"
        aria-hidden={!sideNavOn}
      >
        {stalls.map((stall) => (
          <button
            key={stall.id}
            type="button"
            className={`food-side-nav-item${activeId === stall.id ? ' food-side-nav-item--active' : ''}`}
            style={{ '--nav-color': stall.color }}
            title={stall.name}
            onClick={() => jumpTo(stall.id)}
            tabIndex={sideNavOn ? 0 : -1}
          >
            <span className="food-side-nav-dot" style={{ background: stall.color }} />
            <span className="food-side-nav-icon" aria-hidden="true">{stall.icon}</span>
            <span className="food-side-nav-label">{stall.name}</span>
          </button>
        ))}
      </nav>

      <SiteFooter path="/food" />
      <EditButton sectionKey="food" label="市集" />
    </main>
  )
}

export default Food
