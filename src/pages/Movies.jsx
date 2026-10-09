import { useState, useMemo } from 'react'
import seedMovieData, { filterMoviesByGenre } from '../data/movies.js'
import { useData } from '../context/DataContext.jsx'
import Filmstrip, { Stars } from '../components/Filmstrip.jsx'
import EditButton from '../components/edit/EditButton.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import CineHero from '../components/CineHero.jsx'
import PhotoArt from '../components/PhotoArt.jsx'

/* ====== 小工具 ====== */

/** 我的星级（1–5 实心星，其余空心） */
function MyStars({ value, label, size }) {
  if (!value) return null
  return (
    <span className={`mv-stars ${size === 'lg' ? 'mv-stars--lg' : ''}`} title={label || ''}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= value ? 'mv-star mv-star--on' : 'mv-star'}>★</span>
      ))}
      {label && <em className="mv-stars-label">{label}</em>}
    </span>
  )
}

/** 年份 / 国家 / 时长 这类元信息，拼成一行 */
function metaLine(movie) {
  const parts = []
  if (movie.year) parts.push(movie.year)
  if (movie.countries?.length) parts.push(movie.countries.join(' '))
  if (movie.durations?.length) parts.push(movie.durations[0])
  return parts.join(' · ')
}

/* ====== 电影详情弹窗 ====== */
function MovieModal({ movie, onClose }) {
  if (!movie) return null
  return (
    <div className="movie-modal-overlay" onClick={onClose}>
      <div className="movie-modal" onClick={(e) => e.stopPropagation()}>
        <button className="movie-modal-close" onClick={onClose}>✕</button>
        <div className="movie-modal-cover">
          <PhotoArt src={movie.posterUrl} alt={movie.title} id={movie.id} theme="poster" />
        </div>
        <div className="movie-modal-body">
          <div className="movie-modal-meta">
            {movie.tag && <span className="movie-modal-tag">{movie.tag}</span>}
            <span className="movie-modal-date">{movie.watchedDate} 看过</span>
          </div>
          <h2 className="movie-modal-title">{movie.title}</h2>
          {movie.originalTitle && <p className="mv-modal-original">{movie.originalTitle}</p>}
          <p className="movie-modal-director">{metaLine(movie)}</p>

          <div className="mv-modal-ratings">
            <div className="mv-modal-rating">
              <span className="mv-modal-rating-label">我的评分</span>
              <MyStars value={movie.myRating} label={movie.myLabel} size="lg" />
            </div>
            {movie.doubanRating != null && (
              <div className="mv-modal-rating">
                <span className="mv-modal-rating-label">豆瓣</span>
                <span className="mv-douban-score">{movie.doubanRating}</span>
              </div>
            )}
          </div>

          <dl className="mv-modal-facts">
            {movie.directors?.length > 0 && (
              <>
                <dt>导演</dt>
                <dd>{movie.directors.join(' / ')}</dd>
              </>
            )}
            {movie.actors?.length > 0 && (
              <>
                <dt>主演</dt>
                <dd>{movie.actors.join(' / ')}</dd>
              </>
            )}
            {movie.genres?.length > 0 && (
              <>
                <dt>类型</dt>
                <dd>{movie.genres.join(' / ')}</dd>
              </>
            )}
          </dl>
        </div>
      </div>
    </div>
  )
}

/* ====== 最近看过（大卡片）====== */
function FeaturedMovie({ movie, onSelect }) {
  if (!movie) return null
  return (
    <div className="mv-featured" onClick={() => onSelect(movie)}>
      <div className="mv-featured-poster">
        <PhotoArt src={movie.posterUrl} alt={movie.title} id={movie.id} theme="poster" />
      </div>
      <div className="mv-featured-body">
        <span className="mv-featured-kicker">最近看过 · {movie.watchedDate}</span>
        <h2 className="mv-featured-title">{movie.title}</h2>
        {movie.originalTitle && <p className="mv-featured-original">{movie.originalTitle}</p>}
        <p className="mv-featured-meta">{metaLine(movie)}</p>
        <div className="mv-featured-ratings">
          <MyStars value={movie.myRating} label={movie.myLabel} size="lg" />
          {movie.doubanRating != null && (
            <span className="mv-featured-douban">豆瓣 {movie.doubanRating}</span>
          )}
        </div>
        {movie.genres?.length > 0 && (
          <div className="mv-featured-genres">
            {movie.genres.map((g) => <span key={g} className="mv-genre-pill">{g}</span>)}
          </div>
        )}
        {movie.directors?.length > 0 && (
          <p className="mv-featured-credits">
            {movie.directors.join(' / ')}
            {movie.actors?.length > 0 && <span> · {movie.actors.slice(0, 3).join(' / ')}</span>}
          </p>
        )}
      </div>
    </div>
  )
}

/* ====== 画廊卡片 ====== */
function GalleryCard({ movie, onSelect }) {
  return (
    <div className="movie-gallery-card" onClick={() => onSelect(movie)}>
      <div className="movie-gallery-poster">
        <PhotoArt src={movie.posterUrl} alt={movie.title} id={movie.id} theme="poster" />
        {movie.doubanRating != null && (
          <span className="mv-card-douban">{movie.doubanRating}</span>
        )}
      </div>
      <div className="movie-gallery-info">
        <div className="movie-gallery-title">{movie.title}</div>
        <div className="movie-gallery-director">
          {movie.year}
          {movie.directors?.length > 0 && <span> · {movie.directors[0]}</span>}
        </div>
        <div className="mv-card-foot">
          <MyStars value={movie.myRating} />
          <span className="mv-card-date">{movie.watchedDate.slice(0, 7)}</span>
        </div>
      </div>
    </div>
  )
}

/* ====== 类型筛选 ====== */
function GenreFilter({ genres, active, onSelect }) {
  return (
    <div className="movies-filter">
      <button
        className={`movies-filter-btn ${active === null ? 'movies-filter-btn--active' : ''}`}
        onClick={() => onSelect(null)}
      >全部</button>
      {genres.map((g) => (
        <button
          key={g}
          className={`movies-filter-btn ${active === g ? 'movies-filter-btn--active' : ''}`}
          onClick={() => onSelect(g === active ? null : g)}
        >{g}</button>
      ))}
    </div>
  )
}

/* ====== 年份选择 ====== */
function YearPicker({ currentYear, onSelect, onClose }) {
  const years = []
  for (let y = 2020; y <= 2027; y++) years.push(y)
  return (
    <div className="year-picker-overlay" onClick={onClose}>
      <div className="year-picker-panel" onClick={(e) => e.stopPropagation()}>
        <div className="year-picker-title">选择年份</div>
        <div className="year-picker-grid">
          {years.map((y) => (
            <button
              key={y}
              className={`year-picker-year ${y === currentYear ? 'year-picker-year--active' : ''}`}
              onClick={() => { onSelect(y); onClose() }}
            >{y}</button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ====== 星空观影日历 ====== */
function TicketCalendar({ movies, onSelect }) {
  /* 默认停在「最近看过的那部」所在月份 —— 停在当月会是一片空白 */
  const latest = movies?.[0]?.watchedDate ?? ''
  const [y0, m0] = latest
    ? latest.split('-').map(Number)
    : [new Date().getFullYear(), new Date().getMonth() + 1]
  const [year, setYear] = useState(y0)
  const [month, setMonth] = useState(m0)
  const [showYearPicker, setShowYearPicker] = useState(false)

  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay()

  const days = []
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({ day: d, movies: movies.filter((m) => m.watchedDate === dateStr) })
  }

  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(year - 1) } else setMonth(month - 1) }
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(year + 1) } else setMonth(month + 1) }

  return (
    <div className="calendar-wrap">
      <div className="calendar-head">
        <span className="calendar-year" onClick={() => setShowYearPicker(true)}>{year}</span>
        <div className="calendar-month-nav">
          <button className="calendar-nav-btn" onClick={prevMonth}>◂</button>
          <span className="calendar-month-label">{monthNames[month - 1]}</span>
          <button className="calendar-nav-btn" onClick={nextMonth}>▸</button>
        </div>
      </div>
      <div className="calendar-weekdays">{weekdays.map((w) => <span key={w} className="calendar-weekday">{w}</span>)}</div>
      <div className="calendar-grid">
        {Array.from({ length: firstDayOfWeek }, (_, i) => <div key={`e-${i}`} className="calendar-day calendar-day--empty" />)}
        {days.map(({ day, movies: dayMovies }) => (
          <div
            key={day}
            className={`calendar-day ${dayMovies.length > 0 ? 'calendar-day--has-movie' : ''}`}
            onClick={() => dayMovies.length > 0 && onSelect(dayMovies[0])}
            title={dayMovies.length > 0 ? dayMovies.map((m) => `${m.title} ★${m.myRating}`).join(' / ') : ''}
          >
            <span className="calendar-day-number">{day}</span>
            {dayMovies.slice(0, 1).map((m) => (
              <span key={m.id} className="calendar-day-movie">{m.title}</span>
            ))}
          </div>
        ))}
      </div>
      {showYearPicker && <YearPicker currentYear={year} onSelect={setYear} onClose={() => setShowYearPicker(false)} />}
    </div>
  )
}

/* ====== 更多弹窗 ====== */
function FullListModal({ title, items, onClose, onSelect }) {
  return (
    <div className="full-list-overlay" onClick={onClose}>
      <div className="full-list-panel" onClick={(e) => e.stopPropagation()}>
        <button className="full-list-close" onClick={onClose}>✕</button>
        <h2 className="full-list-title">{title}</h2>
        <div className="full-list-body--grid">
          {items.map((item) => (
            <GalleryCard key={item.id} movie={item} onSelect={(m) => { onClose(); onSelect(m) }} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ====== 主组件 ====== */
function Movies() {
  const { data } = useData()
  const movieData = data.movies ?? seedMovieData

  const watched = movieData.watched ?? []
  const [activeGenre, setActiveGenre] = useState(null)
  const [modalItem, setModalItem] = useState(null)
  const [showAll, setShowAll] = useState(false)

  const genres = movieData.genres ?? []
  const filtered = useMemo(() => filterMoviesByGenre(watched, activeGenre), [watched, activeGenre])

  const GALLERY_PAGE = 12
  const visible = filtered.slice(0, GALLERY_PAGE)
  const hasMore = filtered.length > GALLERY_PAGE

  const stats = movieData.stats ?? {}
  const featured = watched[0] ?? null

  return (
    <main className="movies-world">
      <Stars />

      {/* 0. 电影感视频首屏 */}
      <CineHero>
        <p className="cine-hero-kicker">NOW SHOWING</p>
        <h1 className="cine-hero-title">流前影院</h1>
        <p className="cine-hero-sub">一场一场，都记着。</p>
        <a className="cine-hero-cta" href="#movie-gallery">开始放映</a>
      </CineHero>

      <div className="movies-inner">
        {/* 1. 观影统计 */}
        <div className="mv-stats">
          <div className="mv-stat">
            <span className="mv-stat-num">{stats.count}</span>
            <span className="mv-stat-label">部看过</span>
          </div>
          <div className="mv-stat">
            <span className="mv-stat-num">{stats.fiveStar}</span>
            <span className="mv-stat-label">部力荐</span>
          </div>
          <div className="mv-stat">
            <span className="mv-stat-num">{stats.avgDouban}</span>
            <span className="mv-stat-label">豆瓣均分</span>
          </div>
          <div className="mv-stat mv-stat--wide">
            <span className="mv-stat-num mv-stat-num--sm">
              {stats.firstDate?.replace(/-/g, '.')} — {stats.lastDate?.replace(/-/g, '.')}
            </span>
            <span className="mv-stat-label">观影跨度</span>
          </div>
        </div>

        {/* 2. 滚动胶片 Banner */}
        <Filmstrip movies={movieData.bannerMovies} onSelect={setModalItem} />

        {/* 3. 最近看过 */}
        <section className="mv-section">
          <h2 className="movies-section-label">最近看过</h2>
          <FeaturedMovie movie={featured} onSelect={setModalItem} />
        </section>

        {/* 4. 类型筛选 + 观影画廊 */}
        <section className="movie-gallery-section" id="movie-gallery">
          <h2 className="movies-section-label">观影画廊</h2>
          <GenreFilter genres={genres} active={activeGenre} onSelect={setActiveGenre} />
          <div className="movie-gallery">
            {visible.map((m) => (
              <GalleryCard key={m.id} movie={m} onSelect={setModalItem} />
            ))}
          </div>
          {hasMore && (
            <button className="movies-more-btn" onClick={() => setShowAll(true)}>
              查看更多（共 {filtered.length} 部）
            </button>
          )}
          {filtered.length === 0 && <div className="movies-empty">还没有这个类型的电影</div>}
        </section>

        {/* 5. 星空观影日历 */}
        <section className="calendar-section">
          <h2 className="movies-section-label">星空观影日历</h2>
          <TicketCalendar movies={watched} onSelect={setModalItem} />
        </section>
      </div>

      <SiteFooter path="/movies" />

      <MovieModal movie={modalItem} onClose={() => setModalItem(null)} />

      {showAll && (
        <FullListModal
          title={`全部观影记录（${filtered.length} 部）`}
          items={filtered}
          onClose={() => setShowAll(false)}
          onSelect={setModalItem}
        />
      )}

      <EditButton sectionKey="movies" label="电影" />
    </main>
  )
}

export default Movies
