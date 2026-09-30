import { useState, useEffect, useMemo } from 'react'
import seedMovieData, { extractMovieTags, filterByMovieTag } from '../data/movies.js'
import { useData } from '../context/DataContext.jsx'
import Filmstrip, { Stars } from '../components/Filmstrip.jsx'
import EditButton from '../components/edit/EditButton.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import CineHero from '../components/CineHero.jsx'
import PhotoArt from '../components/PhotoArt.jsx'

/* 小工具 */
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
  return <span className="signboard-rating">{s || rating}</span>
}

/* ====== 电影详情弹窗 — 左海报右信息 ====== */
function MovieModal({ movie, onClose }) {
  if (!movie) return null
  return (
    <div className="movie-modal-overlay" onClick={onClose}>
      <div className="movie-modal" onClick={(e) => e.stopPropagation()}>
        <button className="movie-modal-close" onClick={onClose}>✕</button>
        <div className="movie-modal-cover">
          <PhotoArt src={movie.posterUrl} alt={movie.title} id={movie.id} label={movie.title} theme="poster" accent={movie.posterColor} />
        </div>
        <div className="movie-modal-body">
          <div className="movie-modal-meta">
            {movie.tags?.map((t) => <span key={t} className="movie-modal-tag">{t}</span>)}
            {movie.watchedDate && <span className="movie-modal-date">{movie.watchedDate}</span>}
          </div>
          <h2 className="movie-modal-title">{movie.title}</h2>
          <p className="movie-modal-director">{movie.director} · {movie.year}</p>
          {movie.reflection && <div className="movie-modal-reflection">{renderParagraphs(movie.reflection)}</div>}
          {movie.quote && <p className="movie-modal-quote">"{movie.quote}"</p>}
        </div>
      </div>
    </div>
  )
}

/* ====== 人物弹窗 ====== */
function PersonModal({ person, onClose }) {
  if (!person) return null
  return (
    <div className="person-modal-overlay" onClick={onClose}>
      <div className="person-modal" onClick={(e) => e.stopPropagation()}>
        <button className="person-modal-close" onClick={onClose}>✕</button>
        <div className="person-modal-avatar">
          <PhotoArt src={person.avatarUrl} alt={person.name} id={person.id} label={person.name} theme="poster" />
        </div>
        <h2 className="person-modal-name">{person.name}</h2>
        <p className="person-modal-role">{person.role}</p>
        <p className="person-modal-movies">代表作：{person.movies?.join(' / ')}</p>
        <div className="person-modal-note">{renderParagraphs(person.note)}</div>
      </div>
    </div>
  )
}

/* ====== 今夜放映木牌 ====== */
function FeaturedSignboard({ movie }) {
  if (!movie) return null
  return (
    <div className="signboard">
      <div className="signboard-inner">
        <span className="signboard-label">▼ 今夜放映 ▼</span>
        <div className="signboard-content">
          <div className="signboard-poster">
            <PhotoArt src={movie.posterUrl} alt={movie.title} id={movie.id} label={movie.title} theme="poster" accent={movie.posterColor} />
          </div>
          <div className="signboard-info">
            <h2 className="signboard-title">{movie.title}</h2>
            <div className="signboard-meta">
              <span className="signboard-director">{movie.director} · {movie.year}</span>
              <StarsText rating={movie.rating} />
              {movie.tags?.slice(0, 3).map((t) => <TagPill key={t} tag={t} />)}
            </div>
            {movie.reflection && <div className="signboard-reflection">{renderParagraphs(movie.reflection)}</div>}
            {movie.quote && <p className="signboard-quote">"{movie.quote}"</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

function TagPill({ tag }) {
  return <span className="movie-tag-pill">{tag}</span>
}

/* ====== 标签筛选 ====== */
function TagFilter({ tags, activeTag, onSelect }) {
  return (
    <div className="movies-filter">
      <button className={`movies-filter-btn ${activeTag === null ? 'movies-filter-btn--active' : ''}`} onClick={() => onSelect(null)}>全部</button>
      {tags.map((tag) => (
        <button key={tag} className={`movies-filter-btn ${activeTag === tag ? 'movies-filter-btn--active' : ''}`} onClick={() => onSelect(tag === activeTag ? null : tag)}>{tag}</button>
      ))}
    </div>
  )
}

/* ====== 画廊卡片 ====== */
function GalleryCard({ movie, onSelect }) {
  return (
    <div className="movie-gallery-card" onClick={() => onSelect(movie)}>
      <div className="movie-gallery-poster">
        <PhotoArt src={movie.posterUrl} alt={movie.title} id={movie.id} label={movie.title} theme="poster" accent={movie.posterColor} />
      </div>
      <div className="movie-gallery-info">
        <div className="movie-gallery-title">{movie.title}</div>
        <div className="movie-gallery-director">{movie.director} · {movie.year}</div>
        <div className="movie-gallery-tags">
          {movie.tags?.map((t) => <TagPill key={t} tag={t} />)}
        </div>
        <div className="movie-gallery-rating"><StarsText rating={movie.rating} /></div>
      </div>
    </div>
  )
}

/* ====== 年份选择 ====== */
function YearPicker({ currentYear, onSelect, onClose }) {
  const years = []
  for (let y = 2020; y <= 2030; y++) years.push(y)

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
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [showYearPicker, setShowYearPicker] = useState(false)

  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay()

  const days = []
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dayMovies = movies.filter((m) => m.watchedDate === dateStr)
    days.push({ day: d, movies: dayMovies })
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
        {days.map(({ day, movies }) => (
          <div key={day} className={`calendar-day ${movies.length > 0 ? 'calendar-day--has-movie' : ''}`}
            onClick={() => movies.length > 0 && onSelect(movies[0])}
            title={movies.length > 0 ? movies.map(m => `${m.title} ★${m.rating}`).join(' / ') : ''}>
            <span className="calendar-day-number">{day}</span>
            {movies.length === 1 && <span className="calendar-day-movie">{movies[0].title}</span>}
            {movies.length > 1 && (
              <div className="calendar-day-movies">
                {movies.slice(0, 3).map((m) => <span key={m.id} className="calendar-day-movie">{m.title}</span>)}
                {movies.length > 3 && <span className="calendar-day-movie">+{movies.length - 3}</span>}
              </div>
            )}
          </div>
        ))}
      </div>
      {showYearPicker && <YearPicker currentYear={year} onSelect={setYear} onClose={() => setShowYearPicker(false)} />}
    </div>
  )
}

/* ====== 放映排期便签 ====== */
const tiltCache = {}
function noteTilt(key) {
  if (!tiltCache[key]) tiltCache[key] = (Math.random() - 0.5) * 2.5
  return tiltCache[key]
}

function WatchlistNotes({ watchlist }) {
  if (!watchlist || watchlist.length === 0) return <div className="movies-empty">—</div>
  return (
    <div className="watchlist-notes">
      {watchlist.map((item) => (
        <div key={item.id} className="watchlist-note" style={{ '--note-tilt': `${noteTilt(item.id)}deg` }}>
          <span className="watchlist-note-check" />
          <span className="watchlist-note-title">{item.title}</span>
          <span className="watchlist-note-year">{item.year}</span>
          <span className="watchlist-note-director">— {item.director}</span>
        </div>
      ))}
    </div>
  )
}

/* ====== 关注人物相框 ====== */
function PeopleGrid({ people, onSelect }) {
  if (!people || people.length === 0) return <div className="movies-empty">还没有这个标签的人物</div>
  return (
    <div className="people-grid">
      {people.map((p) => (
        <div key={p.id} className="person-card" onClick={() => onSelect(p)}>
          <div className="person-avatar">
            <PhotoArt src={p.avatarUrl} alt={p.name} id={p.id} label={p.name} theme="poster" />
          </div>
          <h3 className="person-name">{p.name}</h3>
          <p className="person-role">{p.role}</p>
          <p className="person-movies">{p.movies?.join(' / ')}</p>
          <p className="person-note">{p.note}</p>
        </div>
      ))}
    </div>
  )
}

/* ====== 更多弹窗 ====== */
function FullListModal({ title, items, renderAs, onClose, onSelect }) {
  const bodyClass = renderAs === 'people' ? 'full-list-body--people' : 'full-list-body--grid'

  return (
    <div className="full-list-overlay" onClick={onClose}>
      <div className="full-list-panel" onClick={(e) => e.stopPropagation()}>
        <button className="full-list-close" onClick={onClose}>✕</button>
        <h2 className="full-list-title">{title}</h2>
        <div className={bodyClass}>
          {items.map((item) => (
            <GalleryCard key={item.id} movie={item} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </div>
  )
}

function FullPeopleModal({ title, items, onClose, onSelect }) {
  return (
    <div className="full-list-overlay" onClick={onClose}>
      <div className="full-list-panel" onClick={(e) => e.stopPropagation()}>
        <button className="full-list-close" onClick={onClose}>✕</button>
        <h2 className="full-list-title">{title}</h2>
        <div className="full-list-body--people">
          {items.map((p) => (
            <div key={p.id} className="person-card" onClick={() => { onSelect(p); onClose() }}>
              <div className="person-avatar">
                <PhotoArt src={p.avatarUrl} alt={p.name} id={p.id} label={p.name} theme="poster" />
              </div>
              <h3 className="person-name">{p.name}</h3>
              <p className="person-role">{p.role}</p>
              <p className="person-movies">{p.movies?.join(' / ')}</p>
              <p className="person-note">{p.note}</p>
            </div>
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

  const allTags = useMemo(() => extractMovieTags(movieData), [movieData])
  const [activeTag, setActiveTag] = useState(null)
  const [modalItem, setModalItem] = useState(null)
  const [personItem, setPersonItem] = useState(null)
  const [showMoreMovies, setShowMoreMovies] = useState(false)
  const [showMorePeople, setShowMorePeople] = useState(false)

  const watched = useMemo(() => filterByMovieTag(movieData.watched, activeTag), [activeTag, movieData])
  const visibleMovies = watched.slice(0, 15) // 最多 5 行 × 3
  const hasMore = watched.length > 15

  const people = useMemo(() => filterByMovieTag(movieData.people, activeTag), [activeTag, movieData])
  const visiblePeople = people.slice(0, 6) // 最多显示 6 人
  const hasMorePeople = people.length > 6

  return (
    <main className="movies-world">
      <Stars />

      {/* 0. 电影感视频首屏 —— 文字全在遮罩层上，视频只是氛围 */}
      <CineHero>
        <p className="cine-hero-kicker">NOW SHOWING</p>
        <h1 className="cine-hero-title">流前影院</h1>
        <p className="cine-hero-sub">一场一场，都记着。</p>
        <a className="cine-hero-cta" href="#movie-gallery">开始放映</a>
      </CineHero>

      <div className="movies-inner">
        {/* 1. 滚动胶片 Banner */}
        <Filmstrip movies={movieData.bannerMovies} onSelect={setModalItem} />

        {/* 2. 今夜放映 — 不受标签影响 */}
        <section style={{ marginBottom: 48 }}>
          <FeaturedSignboard movie={movieData.featured} />
        </section>

        {/* 3. 标签筛选 + 画廊 */}
        <TagFilter tags={allTags} activeTag={activeTag} onSelect={setActiveTag} />

        <section className="movie-gallery-section" id="movie-gallery">
          <h2 className="movies-section-label">观影画廊</h2>
          <div className="movie-gallery">
            {visibleMovies.map((m) => (
              <GalleryCard key={m.id} movie={m} onSelect={setModalItem} />
            ))}
          </div>
          {hasMore && (
            <button className="movies-more-btn" onClick={() => setShowMoreMovies(true)}>
              查看更多（共 {watched.length} 部）
            </button>
          )}
          {watched.length === 0 && <div className="movies-empty">还没有这个标签的电影</div>}
        </section>

        {/* 4. 星空观影日历 */}
        <section className="calendar-section">
          <h2 className="movies-section-label">星空观影日历</h2>
          <TicketCalendar movies={movieData.watched} onSelect={setModalItem} />
        </section>

        {/* 5. 放映排期 */}
        <section className="watchlist-section">
          <h2 className="movies-section-label">放映排期</h2>
          <WatchlistNotes watchlist={movieData.watchlist} />
        </section>

        {/* 6. 关注人物 */}
        <section className="people-section">
          <h2 className="movies-section-label">关注人物</h2>
          <PeopleGrid people={visiblePeople} onSelect={setPersonItem} />
          {hasMorePeople && (
            <button className="movies-more-btn" onClick={() => setShowMorePeople(true)}>
              查看更多（共 {people.length} 人）
            </button>
          )}
          {people.length === 0 && <div className="movies-empty">还没有这个标签的人物</div>}
        </section>
      </div>

      <SiteFooter path="/movies" />

      <MovieModal movie={modalItem} onClose={() => setModalItem(null)} />
      <PersonModal person={personItem} onClose={() => setPersonItem(null)} />

      {showMoreMovies && (
        <FullListModal
          title="全部观影记录"
          items={watched}
          onClose={() => setShowMoreMovies(false)}
          onSelect={setModalItem}
        />
      )}

      {showMorePeople && (
        <FullPeopleModal
          title="全部关注人物"
          items={people}
          onClose={() => setShowMorePeople(false)}
          onSelect={setPersonItem}
        />
      )}

      <EditButton sectionKey="movies" label="电影" />
    </main>
  )
}

export default Movies
