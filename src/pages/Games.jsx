import { useState, useMemo } from 'react'
import seedGameData from '../data/games.js'
import { useData } from '../context/DataContext.jsx'
import EditButton from '../components/edit/EditButton.jsx'
import SiteFooter from '../components/SiteFooter.jsx'

/* ====== 工具 ====== */
function Stars({ n }) {
  return <span>{'★'.repeat(Math.floor(n))}{n % 1 ? '½' : ''}</span>
}

const statusLabels = { completed: '已通关', playing: '正在玩', 'want-to-play': '想去玩' }

/* 状态颜色 */
const statusColors = {
  completed: '#c8a050',
  playing: '#4aa8e0',
  'want-to-play': '#9c9080',
}

/* 平台图标映射 */
const platformIcon = {
  Switch: '🕹️',
  'Nintendo Switch': '🕹️',
  PC: '🖥️',
  'PC / Switch': '🖥️🕹️',
}

/* ====== 游戏卡片 ====== */
function GameCard({ game, onSelect }) {
  const color = statusColors[game.status] || '#9c9080'

  return (
    <div className="games-card" onClick={() => onSelect(game)}>
      <div className="games-card-stripe" style={{ background: color }} />

      <div className="games-card-body">
        {/* 顶部：状态 + 平台 */}
        <div className="games-card-top">
          <span className="games-card-status" style={{ color, borderColor: `${color}55` }}>
            {statusLabels[game.status]}
          </span>
          <span className="games-card-platform">
            {platformIcon[game.platform] || '🎮'} {game.platform}
          </span>
        </div>

        {/* 标题 + 评分 */}
        <h3 className="games-card-title">{game.title}</h3>
        <div className="games-card-subtitle">{game.subtitle}</div>

        {game.rating && (
          <span className="games-card-rating"><Stars n={game.rating} /></span>
        )}

        {/* 一句感受 */}
        {game.feeling && (
          <div className="games-card-feeling">"{game.feeling.slice(0, 45)}..."</div>
        )}

        {/* 标签 */}
        <div className="games-card-tags">
          <span className="games-card-tag games-card-tag--genre">{game.genre}</span>
          {game.tags?.slice(0, 2).map((t) => (
            <span key={t} className="games-card-tag">{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ====== 弹窗 ====== */
function GameModal({ game, onClose }) {
  if (!game) return null

  return (
    <div className="games-modal-overlay" onClick={onClose}>
      <div className="games-modal" onClick={(e) => e.stopPropagation()}>
        <button className="games-modal-close" onClick={onClose} aria-label="关闭" />
        <div className="games-modal-body">
          <div className="games-modal-top">
            <span className="games-modal-status">{statusLabels[game.status]}</span>
            <span className="games-modal-genre">{game.genre}</span>
          </div>

          <h2 className="games-modal-title">{game.title}</h2>
          <div className="games-modal-subtitle">{game.subtitle}</div>

          <div className="games-modal-meta">
            {game.platform && <span>{platformIcon[game.platform] || '🎮'} {game.platform}</span>}
            {game.period && <span>{game.period}</span>}
            {game.hours && <span>⏱ {game.hours}</span>}
          </div>

          {game.rating && (
            <span className="games-modal-rating"><Stars n={game.rating} /></span>
          )}

          <hr className="games-modal-sep" />

          {game.review && (
            <div className="games-modal-review">
              {game.review.split('\n\n').map((p, i) => <p key={i}>{p.trim()}</p>)}
            </div>
          )}

          {game.moments?.length > 0 && (
            <>
              <div className="games-modal-moments-title">最喜欢的瞬间</div>
              {game.moments.map((m, i) => (
                <div key={i} className="games-modal-moment">{m}</div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ====== 主组件 ====== */
function Games() {
  const { data } = useData()
  const gameData = data.games ?? seedGameData

  const [statusFilter, setStatusFilter] = useState('all')
  const [genreFilter, setGenreFilter] = useState('all')
  const [modalItem, setModalItem] = useState(null)
  const [showCount, setShowCount] = useState(6)

  const genres = useMemo(() => {
    const set = new Set(gameData.games.map((g) => g.genre))
    return ['all', ...set]
  }, [])

  const filtered = useMemo(() => {
    let list = gameData.games
    if (statusFilter !== 'all') list = list.filter((g) => g.status === statusFilter)
    if (genreFilter !== 'all') list = list.filter((g) => g.genre === genreFilter)
    return list
  }, [statusFilter, genreFilter])

  const visible = filtered.slice(0, showCount)
  const hasMore = showCount < filtered.length

  function handleStatus(key) {
    setStatusFilter(key)
    setShowCount(6)
  }

  function handleGenre(key) {
    setGenreFilter(key)
    setShowCount(6)
  }

  const statusFilters = [
    { key: 'all', label: '全部' },
    { key: 'completed', label: '已通关' },
    { key: 'playing', label: '正在玩' },
    { key: 'want-to-play', label: '想去玩' },
  ]

  return (
    <main className="games-world">
      {/* 海拉鲁全景图片背景 */}
      <div className="games-backdrop" />
      <div className="games-cloud-layer games-cloud-layer-1" />
      <div className="games-cloud-layer games-cloud-layer-2" />

      <div className="games-inner">
        {/* 标题 */}
        <div className="games-hero">
          <h1 className="games-hero-title">流前游戏</h1>
          <p className="games-hero-sub">
            {gameData.stats.total} 款游戏 · {gameData.stats.completed} 已通关 · {gameData.stats.playing} 正在玩 · {gameData.stats.wantToPlay} 想去玩
          </p>
        </div>

        {/* 筛选：两排标签 */}
        <div className="games-filters">
          <div className="games-filter-row">
            {statusFilters.map((f) => (
              <button
                key={f.key}
                className={`games-filter-btn ${statusFilter === f.key ? 'games-filter-btn--active' : ''}`}
                onClick={() => handleStatus(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="games-filter-row">
            <button
              className={`games-filter-btn games-filter-btn--genre ${genreFilter === 'all' ? 'games-filter-btn--active' : ''}`}
              onClick={() => handleGenre('all')}
            >
              全部类型
            </button>
            {genres.filter((g) => g !== 'all').map((g) => (
              <button
                key={g}
                className={`games-filter-btn games-filter-btn--genre ${genreFilter === g ? 'games-filter-btn--active' : ''}`}
                onClick={() => handleGenre(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* 画廊网格 */}
        <div className="games-grid">
          {visible.map((game) => (
            <GameCard key={game.id} game={game} onSelect={setModalItem} />
          ))}
        </div>

        {/* 查看更多 */}
        {hasMore && (
          <div className="games-more-wrap">
            <button className="games-more-btn" onClick={() => setShowCount((n) => n + 6)}>
              显示更多
            </button>
          </div>
        )}
      </div>

      <SiteFooter path="/games" />

      <GameModal game={modalItem} onClose={() => setModalItem(null)} />
      <EditButton sectionKey="games" label="游戏" />
    </main>
  )
}

export default Games
