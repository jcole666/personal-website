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
import { useEditMode } from '../context/EditModeContext.jsx'
import {
  ScribbleDivider,
  ScribbleProgress,
  ScribbleBookmark,
} from '../components/Scribble.jsx'
import EditButton from '../components/edit/EditButton.jsx'
import FileAttach from '../components/FileAttach.jsx'
import SiteFooter from '../components/SiteFooter.jsx'

/* ===================================================================
   小工具
   =================================================================== */

/**
 * 便签的轻微歪斜 —— 只有便签用。
 * 书架上的书是排列整齐的（Antique Stillness：旧纸张平铺，不歪斜），
 * 但随手贴上去的便签本来就该是歪的，这个歪斜是静态的、不参与任何 hover 过渡。
 * 按 key 缓存，避免每次渲染都换一个角度。
 */
const tiltCache = new Map()
function cachedTilt(key) {
  if (!tiltCache.has(key)) {
    tiltCache.set(key, (Math.random() - 0.5) * 2.4)
  }
  return tiltCache.get(key)
}

/**
 * 复古四角装饰
 *
 * 参考站的招牌细节：四角各一个内缩 8px 的 L 形角标，常态很淡（opacity .3），
 * 鼠标凑近才慢慢显现到全不透明 —— 模拟「读者凑近才看清的旧书细节」。
 * 用 4 个 span 而不是伪元素，因为 ::before/::after 只有两个，
 * 而且分开写才能让四角各自做透明度过渡。
 */
function Corners() {
  return (
    <>
      <span className="rv-corner rv-corner--tl" aria-hidden="true" />
      <span className="rv-corner rv-corner--tr" aria-hidden="true" />
      <span className="rv-corner rv-corner--bl" aria-hidden="true" />
      <span className="rv-corner rv-corner--br" aria-hidden="true" />
    </>
  )
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

function DetailModal({ book, onClose, onFilesChange }) {
  const { editMode } = useEditMode()
  if (!book) return null
  const files = book.files ?? []

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

          {/* 读书笔记附件：md 笔记 / 摘抄导出 / 书摘 PDF，md 可以就地阅读 */}
          {(files.length > 0 || editMode) && (
            <div className="reading-modal-files">
              <h3 className="reading-modal-files-label">读书笔记</h3>
              <FileAttach
                files={files}
                onChange={(next) => onFilesChange(book.id, next)}
                label="笔记"
                emptyHint="这本书还没有上传笔记。"
              />
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
        <Corners />
        <div className="reading-quote-label">
          <span className="reading-quote-tag">DAILY · 每日金句</span>
          <button
            className="reading-quote-history-btn"
            onClick={() => setShowHistory(true)}
          >
            历史记录
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
              <h3 className="reading-quote-history-title">历史金句</h3>
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
        <h2 className="reading-section-label">正在读</h2>
        <p className="reading-empty">暂时没有在读的书～</p>
      </section>
    )
  }

  const book = readingBooks[0]

  return (
    <section className="reading-current">
      <h2 className="reading-section-label">正在读</h2>

      <div className="reading-current-card">
        <Corners />
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
          <ScribbleProgress progress={0.35} color="#8b4513" />

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

function FinishedGallery({ books, tagDimensions, onFilesChange }) {
  const finishedBooks = useMemo(() => getFinishedBooks(books), [books])

  // 类型多选 + 国家单选
  const [selectedTags, setSelectedTags] = useState([])
  const [selectedCountry, setSelectedCountry] = useState(null)  // 单选
  const [customTags, setCustomTags] = useState([])
  const [newTagInput, setNewTagInput] = useState('')
  const [showAll, setShowAll] = useState(false)
  // 存 id 而不是对象快照 —— 上传附件后 books 会更新，按 id 重查才拿得到最新的 files
  const [selectedId, setSelectedId] = useState(null)
  const selectedBook = selectedId ? books.find((b) => b.id === selectedId) : null

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
      <h2 className="reading-section-label">已读</h2>

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
              onClick={() => setSelectedId(book.id)}
            >
              <Corners />
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

      <DetailModal
        book={selectedBook}
        onClose={() => setSelectedId(null)}
        onFilesChange={onFilesChange}
      />
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
      <h2 className="reading-section-label">想读</h2>
      <div className="reading-want-grid">
        {wantBooks.map((book) => (
          <div key={book.id} className="reading-want-card">
            <Corners />
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
        <h2 className="reading-section-label">随想便签</h2>

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
              <h2 className="reading-notes-head-title">随想便签</h2>
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
      <ScribbleDivider color="#a0632a" />
      <ScribbleBookmark color="#8b4513" />
    </div>
  )
}

/* ===================================================================
   主组件
   =================================================================== */

function Reading() {
  const { data, saveSection } = useData()
  const readingData = data.reading ?? {
    profile: seedProfile,
    books: seedBooks,
    dailyQuotes: seedDailyQuotes,
    tagDimensions: seedTagDimensions,
    notes: seedNotes,
  }

  /** 上传 / 删除某本书的附件后，把整个 reading 文档存回后端 */
  async function handleBookFiles(bookId, files) {
    const next = {
      ...readingData,
      books: readingData.books.map((b) => (b.id === bookId ? { ...b, files } : b)),
    }
    await saveSection('reading', next)
  }

  return (
    <main className="reading-world">
      <div className="reading-inner">
        <QuoteBanner dailyQuotes={readingData.dailyQuotes} />
        <StatsRow profile={readingData.profile} />
        <CurrentlyReading books={readingData.books} />
        <FinishedGallery
          books={readingData.books}
          tagDimensions={readingData.tagDimensions}
          onFilesChange={handleBookFiles}
        />
        <WantToRead books={readingData.books} />
        <ReflectionsWall notes={readingData.notes} />
        <EndMark />
      </div>

      <SiteFooter path="/reading" />
      <EditButton sectionKey="reading" label="读书笔记" />
    </main>
  )
}

export default Reading
