import { useState, useMemo } from 'react'
import seedGameData from '../data/games.js'
import { useData } from '../context/DataContext.jsx'
import EditButton from '../components/edit/EditButton.jsx'
import PhotoArt from '../components/PhotoArt.jsx'
import SiteFooter from '../components/SiteFooter.jsx'

/* ====== 工具 ====== */
const statusLabels = { completed: '已通关', playing: '正在玩', 'want-to-play': '想去玩' }

/* `hours` 是自带单位的展示串，排序要先转成小时数：
     '56.5 小时' → 56.5    '95 小时以上' → 95    '111 分钟' → 1.85    '' → 0
   注意「X 小时以上」按 X 算，Switch 只报下限，这是能拿到的最好数据。 */
function hoursToNumber(hours) {
  if (!hours) return 0
  const m = String(hours).match(/([\d.]+)/)
  if (!m) return 0
  const n = parseFloat(m[1])
  if (Number.isNaN(n)) return 0
  return /分钟/.test(hours) ? n / 60 : n
}

/* 状态颜色 —— 全部取自蒸汽波的四支霓虹 */
const statusColors = {
  completed: '#05ffa1',
  playing: '#01cdfe',
  'want-to-play': '#b967ff',
}

/* ====== 游戏卡片 ====== */
function GameCard({ game, onSelect }) {
  const color = statusColors[game.status] || '#9c9080'

  return (
    <div className="games-card" onClick={() => onSelect(game)}>
      {/* 高光扫光：hover 时一道白光从左侧扫过 */}
      <span className="vw-sweep" aria-hidden="true" />
      <div className="games-card-stripe" style={{ background: color }} />

      {/* 竖版封面（2:3）。没有图时 PhotoArt 会画占位插画 */}
      <div className="games-card-cover">
        <PhotoArt src={game.coverUrl} alt={game.title} id={game.id} theme="poster" />
      </div>

      <div className="games-card-body">
        {/* 顶部：状态 + 平台 */}
        <div className="games-card-top">
          <span className="games-card-status" style={{ color, borderColor: `${color}55` }}>
            {statusLabels[game.status]}
          </span>
          <span className="games-card-platform">{game.platform}</span>
        </div>

        {/* 标题 + 评分 */}
        <h3 className="games-card-title">{game.title}</h3>
        <div className="games-card-subtitle">{game.subtitle}</div>

        {/* 原来的星级评分去掉了 —— 用户没给评分，不编。
            改成显示游玩时长（截图里的真实数据），想玩的显示「还没开始」 */}
        <span className={`games-card-hours ${game.hours ? '' : 'games-card-hours--empty'}`}>
          {game.hours || '还没开始'}
        </span>

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
          <div className="games-modal-head">
            {/* 竖版封面（2:3），和卡片一致 */}
            <div className="games-modal-cover">
              <PhotoArt src={game.coverUrl} alt={game.title} id={game.id} theme="poster" />
            </div>
            <div className="games-modal-headinfo">
              <div className="games-modal-top">
                <span className="games-modal-status">{statusLabels[game.status]}</span>
                <span className="games-modal-genre">{game.genre}</span>
              </div>

              <h2 className="games-modal-title">{game.title}</h2>
              <div className="games-modal-subtitle">{game.subtitle}</div>

              <div className="games-modal-meta">
                {game.platform && <span>{game.platform}</span>}
                {/* hours 现在自带单位（"56.5 小时" / "95 小时以上" / "111 分钟"），
                    不要再在后面补「小时」，否则会变成「111 分钟 小时」 */}
                {game.hours && <span>{game.hours}</span>}
              </div>
            </div>
          </div>

          <hr className="games-modal-sep" />

          {game.review && (
            <div className="games-modal-review">
              {game.review.split('\n\n').map((p, i) => <p key={i}>{p.trim()}</p>)}
            </div>
          )}

          {/* 想去玩的游戏写「想玩的原因」，位置和「心得」一致 */}
          {game.status === 'want-to-play' && game.reason && (
            <>
              <div className="games-modal-moments-title">想玩的原因</div>
              <div className="games-modal-review">
                {game.reason.split('\n\n').map((p, i) => <p key={i}>{p.trim()}</p>)}
              </div>
            </>
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
  /* 搜索：输入框的内容和「真正生效的关键词」分开存 ——
     用户要的是「输入后点一下才搜」，不是边打字边过滤 */
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const genres = useMemo(() => {
    const set = new Set(gameData.games.map((g) => g.genre))
    return ['all', ...set]
  }, [gameData])

  /* 排序：正在玩 → 已通关 → 想去玩（用户指定的顺序）。
     组内规则：
       - 已通关 按游玩时长从长到短（用户要求，时间长的在前）
       - 正在玩 / 想去玩 保持数据里的顺序（正在玩本来就是最少的，想去玩没有时长） */
  const STATUS_ORDER = { playing: 0, completed: 1, 'want-to-play': 2 }

  const filtered = useMemo(() => {
    const kw = searchTerm.trim().toLowerCase()
    let list = [...gameData.games].sort((a, b) => {
      const sa = STATUS_ORDER[a.status] ?? 9
      const sb = STATUS_ORDER[b.status] ?? 9
      if (sa !== sb) return sa - sb
      // 同一组内：已通关按时长降序
      if (a.status === 'completed') return hoursToNumber(b.hours) - hoursToNumber(a.hours)
      return 0
    })
    if (statusFilter !== 'all') list = list.filter((g) => g.status === statusFilter)
    if (genreFilter !== 'all') list = list.filter((g) => g.genre === genreFilter)
    if (kw) {
      list = list.filter((g) =>
        [g.title, g.subtitle, g.platform, g.genre, ...(g.tags ?? [])]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(kw)),
      )
    }
    return list
  }, [statusFilter, genreFilter, searchTerm, gameData])

  /* 一次性全部显示 —— 之前是点一下加 6 个，用户说内容不多，直接铺开 */
  const visible = filtered

  function runSearch() {
    setSearchTerm(searchInput)
  }

  function handleStatus(key) {
    setStatusFilter(key)
  }

  function handleGenre(key) {
    setGenreFilter(key)
  }

  const statusFilters = [
    { key: 'all', label: '全部' },
    { key: 'completed', label: '已通关' },
    { key: 'playing', label: '正在玩' },
    { key: 'want-to-play', label: '想去玩' },
  ]

  return (
    <main className="games-world">
      {/* Vaporwave 背景：落日圆盘 + 透视网格地面 + 扫描线。
          原来那张海拉鲁全景照片去掉了 —— 蒸汽波要的是深紫底 + 霓虹网格，
          写实风景照片叠上去只会互相打架（文件还在 public/ 里，没删） */}
      <div className="vw-bg" aria-hidden="true">
        <div className="vw-sun" />
        <div className="vw-floor" />
        <div className="vw-scanlines" />
      </div>

      <div className="games-inner">
        {/* 标题 */}
        <div className="games-hero">
          <p className="vw-kana">ゲーム コレクション</p>
          <h1 className="games-hero-title">流前游戏</h1>
          <p className="games-hero-sub">
            {gameData.stats.total} 款游戏 · {gameData.stats.completed} 已通关 · {gameData.stats.playing} 正在玩 · {gameData.stats.wantToPlay} 想去玩
          </p>
        </div>

        {/* 筛选：第一排是状态标签 + 右侧搜索栏；第二排是类型标签 */}
        <div className="games-filters">
          <div className="games-filter-row games-filter-row--split">
            <div className="games-filter-statuses">
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

            <div className="games-search">
              <input
                className="games-search-input"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') runSearch() }}
                placeholder="搜索游戏名 / 平台 / 类型"
                aria-label="搜索游戏"
              />
              <button className="games-search-btn" onClick={runSearch}>搜索</button>
              {searchTerm && (
                <button
                  className="games-search-clear"
                  onClick={() => { setSearchInput(''); setSearchTerm('') }}
                  aria-label="清除搜索"
                >
                  ×
                </button>
              )}
            </div>
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

        {/* 当前结果条数（搜索/筛选后给个反馈，不然不知道筛掉了多少） */}
        <p className="games-result-count">
          {searchTerm ? `「${searchTerm}」` : ''}
          {statusFilter !== 'all' ? ` · ${statusLabels[statusFilter]}` : ''}
          {genreFilter !== 'all' ? ` · ${genreFilter}` : ''}
          <span className="games-result-num">共 {filtered.length} 款</span>
        </p>

        {/* 画廊网格：一次性全部铺开 */}
        <div className="games-grid">
          {visible.map((game) => (
            <GameCard key={game.id} game={game} onSelect={setModalItem} />
          ))}
        </div>

        {filtered.length === 0 && <div className="games-empty">没有符合条件的游戏，换个关键词试试～</div>}
      </div>

      <SiteFooter path="/games" />

      <GameModal game={modalItem} onClose={() => setModalItem(null)} />
      <EditButton sectionKey="games" label="游戏" />
    </main>
  )
}

export default Games
