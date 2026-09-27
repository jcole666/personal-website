import { useState, useMemo } from 'react'
import {
  profile as seedProfile,
  books as seedBooks,
  dailyQuotes as seedDailyQuotes,
  tagDimensions as seedTagDimensions,
  notes as seedNotes,
  getReadingBooks,
  getFinishedBooks,
  getWantToReadBooks,
  filterByTags,
  getTodayQuote,
} from '../data/reading.js'
import { useData } from '../context/DataContext.jsx'
import {
  ScribbleDivider,
  ScribbleProgress,
  ScribbleBookmark,
} from '../components/Scribble.jsx'
import EditButton from '../components/edit/EditButton.jsx'

/* ===================================================================
   小工具
   =================================================================== */

const tiltCache = new Map()
function cachedTilt(key) {
  if (!tiltCache.has(key)) {
    tiltCache.set(key, (Math.random() - 0.5) * 2.4)
  }
  return tiltCache.get(key)
}

function Stars({ rating }) {
  if (!rating) return null
  const els = []
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      els.push(<span key={i} className="reading-star reading-star--filled">★</span>)
    } else if (i - 0.5 <= rating) {
      els.push(<span key={i} className="reading-star reading-star--half">★</span>)
    } else {
      els.push(<span key={i} className="reading-star">★</span>)
    }
  }
  return <div className="reading-stars">{els}</div>
}

function renderParagraphs(text) {
  if (!text) return null
  return text
    .trim()
    .split('\n\n')
    .map((para, i) => <p key={i}>{para.trim()}</p>)
}

/* ===================================================================
   区块 0：书籍详情弹窗
   =================================================================== */

function DetailModal({ book, onClose }) {
  if (!book) return null

  return (
    <div className="reading-modal-overlay" onClick={onClose}>
      <div className="reading-modal" onClick={(e) => e.stopPropagation()}>
        <button className="reading-modal-close" onClick={onClose}>✕</button>

        {book.coverUrl ? (
          <div className="reading-modal-cover">
            <img src={book.coverUrl} alt={book.title} />
          </div>
        ) : (
          <div className="reading-modal-cover">
            <span>{book.title}</span>
            <span style={{ fontSize: '0.7rem' }}>{book.author}</span>
          </div>
        )}

        <div className="reading-modal-body">
          <div className="reading-modal-meta">
            <span className="reading-modal-genre">{book.tags?.[0] || ''}</span>
            <span className="reading-modal-date">{book.finishedDate}</span>
            <Stars rating={book.rating} />
          </div>
          <h2 className="reading-modal-title">{book.title}</h2>
          <p className="reading-modal-author">{book.author}</p>

          {book.reflection && (
            <div className="reading-modal-reflection">
              {renderParagraphs(book.reflection)}
            </div>
          )}

          {book.highlights.length > 0 && (
            <div className="reading-modal-highlights">
              {book.highlights.map((h, i) => (
                <div key={i}>
                  <p className="reading-modal-highlight-text">"{h.text}"</p>
                  {h.note && (
                    <p className="reading-modal-highlight-note">{h.note}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ===================================================================
   区块 1：每日金句横幅 + 历史记录
   =================================================================== */

function QuoteBanner({ dailyQuotes }) {
  const [showHistory, setShowHistory] = useState(false)
  const todayQuote = getTodayQuote(dailyQuotes)

  if (!todayQuote) return null

  return (
    <>
      <section className="reading-quote-banner">
        <div className="reading-quote-label">
          <span className="reading-quote-tag">DAILY · 每日金句</span>
          <button
            className="reading-quote-history-btn"
            onClick={() => setShowHistory(true)}
          >
            📅 历史记录
          </button>
        </div>
        <blockquote className="reading-quote-text">
          {todayQuote.text}
        </blockquote>
        <cite className="reading-quote-source">—— {todayQuote.source}</cite>
      </section>

      {showHistory && (
        <div
          className="reading-quote-history-overlay"
          onClick={() => setShowHistory(false)}
        >
          <div
            className="reading-quote-history-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="reading-quote-history-head">
              <h3 className="reading-quote-history-title">📅 历史金句</h3>
              <button
                className="reading-quote-history-close"
                onClick={() => setShowHistory(false)}
              >
                ✕
              </button>
            </div>
            <div className="reading-quote-history-list">
              {dailyQuotes.map((q, i) => (
                <div key={i} className="reading-quote-history-item">
                  <p className="reading-quote-history-date">{q.date}</p>
                  <p className="reading-quote-history-text">{q.text}</p>
                  <span className="reading-quote-history-source">
                    —— {q.source}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ===================================================================
   区块 2：统计数字
   =================================================================== */

function StatsRow({ profile }) {
  return (
    <div className="reading-stats">
      <div className="reading-stat-item">
        <span className="reading-stat-num">{profile.stats.finished}</span>
        <span className="reading-stat-label">已读</span>
      </div>
      <div className="reading-stat-item">
        <span className="reading-stat-num">{profile.stats.reading}</span>
        <span className="reading-stat-label">在读</span>
      </div>
      <div className="reading-stat-item">
        <span className="reading-stat-num">{profile.stats.wantToRead}</span>
        <span className="reading-stat-label">想读</span>
      </div>
    </div>
  )
}

/* ===================================================================
   区块 3：在读
   =================================================================== */

function CurrentlyReading({ books }) {
  const readingBooks = getReadingBooks(books)

  if (readingBooks.length === 0) {
    return (
      <section className="reading-current">
        <h2 className="reading-section-label">📖 正在读……</h2>
        <p className="reading-empty">暂时没有在读的书～</p>
      </section>
    )
  }

  const book = readingBooks[0]

  return (
    <section className="reading-current">
      <h2 className="reading-section-label">📖 正在读……</h2>

      <div className="reading-current-card">
        <div className="reading-current-cover">
          {book.coverUrl ? (
            <img src={book.coverUrl} alt={book.title} />
          ) : (
            <>
              <span>{book.title}</span>
              <span style={{ fontSize: '0.68rem' }}>{book.author}</span>
            </>
          )}
        </div>

        <div className="reading-current-info">
          <h3 className="reading-current-title">{book.title}</h3>
          <p className="reading-current-author">{book.author}</p>
          <p className="reading-current-progress-label">阅读进度</p>
          <ScribbleProgress progress={0.35} color="#b0a090" />

          {book.highlights.length > 0 && (
            <div className="reading-current-highlights">
              {book.highlights.map((h, i) => (
                <div key={i} className="reading-current-highlight">
                  <p className="reading-current-highlight-text">"{h.text}"</p>
                  {h.note && (
                    <p className="reading-current-highlight-note">{h.note}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/* ===================================================================
   区块 4：已读 —— 多维标签筛选 + 画廊网格 + 详情弹窗
   =================================================================== */

const PAGE_SIZE = 15

function FinishedGallery({ books, tagDimensions }) {
  const finishedBooks = useMemo(() => getFinishedBooks(books), [books])

  // 类型多选 + 国家单选
  const [selectedTags, setSelectedTags] = useState([])
  const [selectedCountry, setSelectedCountry] = useState(null)  // 单选
  const [customTags, setCustomTags] = useState([])
  const [newTagInput, setNewTagInput] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null)

  const allCustomOptions = useMemo(() => [...new Set(customTags)], [customTags])

  // 筛选：类型多选 AND 国家单选
  const filtered = useMemo(() => {
    let result = finishedBooks
    if (selectedTags.length > 0) {
      result = filterByTags(result, selectedTags)
    }
    if (selectedCountry) {
      result = result.filter((b) => b.tags?.includes(selectedCountry))
    }
    return result
  }, [finishedBooks, selectedTags, selectedCountry])

  const visible = showAll ? filtered : filtered.slice(0, PAGE_SIZE)
  const hasMore = filtered.length > PAGE_SIZE && !showAll

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
    setShowAll(false)
  }

  // 国家单选：点击已选中的就取消
  const selectCountry = (country) => {
    setSelectedCountry((prev) => (prev === country ? null : country))
    setShowAll(false)
  }

  const addCustomTag = () => {
    const trimmed = newTagInput.trim()
    if (trimmed && !customTags.includes(trimmed)) {
      setCustomTags((prev) => [...prev, trimmed])
      setSelectedTags((prev) => [...prev, trimmed])
    }
    setNewTagInput('')
  }

  return (
    <section className="reading-finished-section">
      <h2 className="reading-section-label">📚 已读</h2>

      {/* 多维筛选栏 */}
      <div className="reading-filter-dimensions">
        {tagDimensions.map((dim) => (
          <div key={dim.key} className="reading-filter-dim">
            <span className="reading-filter-dim-label">{dim.label}</span>
            {dim.options.map((opt) => {
              // 国家维度：单选
              const isCountry = dim.key === 'country'
              const isActive = isCountry
                ? selectedCountry === opt
                : selectedTags.includes(opt)
              return (
                <button
                  key={opt}
                  className={`reading-filter-btn ${isActive ? 'reading-filter-btn--active' : ''}`}
                  onClick={() => {
                    if (isCountry) {
                      selectCountry(opt)
                    } else {
                      toggleTag(opt)
                    }
                  }}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        ))}

        {/* 用户自定义标签行 */}
        <div className="reading-filter-dim">
          <span className="reading-filter-dim-label">自定义</span>
          {allCustomOptions.map((tag) => (
            <button
              key={tag}
              className={`reading-filter-btn ${
                selectedTags.includes(tag) ? 'reading-filter-btn--active' : ''
              }`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
          <input
            type="text"
            className="reading-filter-input"
            placeholder="+ 新标签"
            value={newTagInput}
            style={{
              fontSize: '0.78rem',
              padding: '4px 12px',
              borderRadius: '999px',
              border: '1.5px dashed rgba(180, 160, 140, 0.35)',
              background: 'transparent',
              color: '#b0a090',
              width: '90px',
              outline: 'none',
              fontFamily: 'inherit',
            }}
            onChange={(e) => setNewTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addCustomTag()
            }}
            onBlur={addCustomTag}
          />
        </div>
      </div>

      {/* 画廊网格 */}
      {visible.length > 0 ? (
        <div className="reading-gallery">
          {visible.map((book) => (
            <article
              key={book.id}
              className="reading-gallery-card"
              style={{ '--card-tilt': `${cachedTilt(book.id)}deg` }}
              onClick={() => setSelectedBook(book)}
            >
              <div className="reading-gallery-cover">
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt={book.title} />
                ) : (
                  <>
                    <span style={{ fontWeight: 600 }}>{book.title}</span>
                    <span style={{ fontSize: '0.68rem' }}>{book.author}</span>
                  </>
                )}
              </div>
              <div className="reading-gallery-body">
                <h3 className="reading-gallery-title">{book.title}</h3>
                <p className="reading-gallery-author">{book.author}</p>
                <div className="reading-gallery-footer">
                  <span className="reading-gallery-date">
                    {book.finishedDate}
                  </span>
                  <Stars rating={book.rating} />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="reading-empty">
          <span>这个组合还没有读完的书～试试调整筛选条件</span>
        </div>
      )}

      {hasMore && (
        <button className="reading-more-btn" onClick={() => setShowAll(true)}>
          查看更多（共 {filtered.length} 本）
        </button>
      )}

      <DetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />
    </section>
  )
}

/* ===================================================================
   区块 5：想读
   =================================================================== */

function WantToRead({ books }) {
  const wantBooks = getWantToReadBooks(books)
  if (wantBooks.length === 0) return null

  return (
    <section className="reading-want-section">
      <h2 className="reading-section-label">📝 想读……</h2>
      <div className="reading-want-grid">
        {wantBooks.map((book) => (
          <div key={book.id} className="reading-want-card">
            <div className="reading-want-cover">
              {book.coverUrl ? (
                <img src={book.coverUrl} alt={book.title} />
              ) : (
                <span>{book.title}</span>
              )}
            </div>
            <div className="reading-want-info">
              <h3 className="reading-want-title">{book.title}</h3>
              <p className="reading-want-author">{book.author}</p>
              <p className="reading-want-reason">{book.wantReason}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ===================================================================
   区块 6：感想便签墙 + 大弹窗
   独立于书本，自定义文艺标题，两栏弹窗展示
   =================================================================== */

const NOTES_PREVIEW = 6

function ReflectionsWall({ notes }) {
  const [showAll, setShowAll] = useState(false)
  const visibleNotes = showAll ? notes : notes.slice(0, NOTES_PREVIEW)
  const hasMore = notes.length > NOTES_PREVIEW && !showAll

  if (notes.length === 0) return null

  return (
    <>
      <section className="reading-reflections-wall">
        <h2 className="reading-section-label">💭 随想便签</h2>

        <div className="reading-reflections-flow">
          {visibleNotes.map((note) => (
            <div
              key={note.id}
              className="reading-sticky-note"
              style={{
                '--note-bg': note.color,
                '--note-tilt': `${cachedTilt(`note-${note.id}`)}deg`,
              }}
            >
              <span className="reading-note-date">{note.date}</span>
              <h3 className="reading-note-title">{note.title}</h3>
              <div className="reading-note-text">
                {renderParagraphs(note.content)}
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <button
            className="reading-reflections-more"
            onClick={() => setShowAll(true)}
          >
            查看更多随想 →
          </button>
        )}
      </section>

      {/* 大弹窗：两栏展示全部便签 */}
      {showAll && (
        <div
          className="reading-notes-overlay"
          onClick={() => setShowAll(false)}
        >
          <div
            className="reading-notes-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="reading-notes-head">
              <h2 className="reading-notes-head-title">💭 随想便签</h2>
              <button
                className="reading-quote-history-close"
                onClick={() => setShowAll(false)}
              >
                ✕
              </button>
            </div>

            <div className="reading-notes-body">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="reading-note-full"
                  style={{
                    '--note-bg': note.color,
                    '--note-tilt': `${cachedTilt(`full-${note.id}`)}deg`,
                  }}
                >
                  <span className="reading-note-full-date">{note.date}</span>
                  <h3 className="reading-note-full-title">{note.title}</h3>
                  <div className="reading-note-full-text">
                    {renderParagraphs(note.content)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ===================================================================
   页尾标记
   =================================================================== */

function EndMark() {
  return (
    <div className="reading-end-mark">
      <ScribbleDivider color="#d4c8b0" />
      <ScribbleBookmark color="#b0a090" />
    </div>
  )
}

/* ===================================================================
   主组件
   =================================================================== */

function Reading() {
  const { data } = useData()
  const readingData = data.reading ?? {
    profile: seedProfile,
    books: seedBooks,
    dailyQuotes: seedDailyQuotes,
    tagDimensions: seedTagDimensions,
    notes: seedNotes,
  }

  return (
    <main className="reading-world">
      <div className="reading-inner">
        <QuoteBanner dailyQuotes={readingData.dailyQuotes} />
        <StatsRow profile={readingData.profile} />
        <CurrentlyReading books={readingData.books} />
        <FinishedGallery books={readingData.books} tagDimensions={readingData.tagDimensions} />
        <WantToRead books={readingData.books} />
        <ReflectionsWall notes={readingData.notes} />
        <EndMark />
      </div>

      <footer className="reading-footer">
        <div className="reading-footer-inner">
          <div className="reading-footer-brand">
            <span className="reading-footer-logo">流前 · 读书笔记</span>
            <span className="reading-footer-tag">好记性不如烂笔头</span>
          </div>
          <nav className="reading-footer-links">
            <a href="https://github.com/jcole666" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href="mailto:me@example.com">Email</a>
          </nav>
        </div>
        <div className="reading-footer-bottom">
          <span>© 2026 流前 · 用 React + Rough.js 手工打造</span>
        </div>
      </footer>
      <EditButton sectionKey="reading" label="读书笔记" />
    </main>
  )
}

export default Reading
