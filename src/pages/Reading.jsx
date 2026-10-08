import { useState, useMemo, useEffect, useRef } from 'react'
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
import { useModalBehavior } from '../hooks/useModalBehavior.js'
import {
  ScribbleDivider,
  ScribbleBookmark,
} from '../components/Scribble.jsx'
import EditButton from '../components/edit/EditButton.jsx'
import FileAttach from '../components/FileAttach.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import PhotoArt from '../components/PhotoArt.jsx'

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
/**
 * 水彩晕染色块
 *
 * 参考站的招牌手法：几个绝对定位的圆，各带一支水彩色（半透明），
 * 用大半径 blur 化开，再以 11~18s 的不同周期缓慢漂移 —— 像颜料在湿纸上渗。
 * 颜色和位置每个都不同，所以走内联 style；模糊和动画由 CSS 类统一管。
 */
const BLOBS = [
  { rgb: '232, 168, 124', a: 0.26, size: 440, top: '3%', left: '-8%', dur: 13, delay: 0 },
  { rgb: '133, 205, 202', a: 0.24, size: 400, top: '10%', right: '-6%', dur: 16, delay: -4 },
  { rgb: '195, 141, 148', a: 0.2, size: 340, top: '48%', left: '4%', dur: 11, delay: -8 },
  { rgb: '212, 163, 115', a: 0.22, size: 380, top: '76%', right: '0%', dur: 18, delay: -11 },
]

function WatercolorBlobs() {
  return (
    <div className="reading-blobs" aria-hidden="true">
      {BLOBS.map((b, i) => (
        <span
          key={i}
          className="reading-blob"
          style={{
            background: `rgba(${b.rgb}, ${b.a})`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            top: b.top,
            left: b.left,
            right: b.right,
            animationDuration: `${b.dur}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
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
  // Esc 关闭 + 锁背景滚动。组件常驻挂载、内部 return null，必须传 isOpen
  useModalBehavior(Boolean(book), onClose)
  // 当前展开的章节（手风琴）。hooks 必须在 early return 之前调用
  const [openChapter, setOpenChapter] = useState(null)
  useEffect(() => {
    setOpenChapter(null)
  }, [book?.id])
  if (!book) return null
  const files = book.files ?? []
  const chapters = book.chapters ?? []

  return (
    <div className="reading-modal-overlay" onClick={onClose}>
      <div className="reading-modal" onClick={(e) => e.stopPropagation()}>
        <button className="reading-modal-close" onClick={onClose}>✕</button>

        <div className="reading-modal-cover">
          <PhotoArt src={book.coverUrl} alt={book.title} id={book.id} theme="journal" />
        </div>

        <div className="reading-modal-body">
          <div className="reading-modal-meta">
            <span className="reading-modal-genre">{book.tags?.[0] || ''}</span>
            {book.finishedDate && <span className="reading-modal-date">{book.finishedDate}</span>}
            <Stars rating={book.rating} />
          </div>
          <h2 className="reading-modal-title">{book.title}</h2>
          <p className="reading-modal-author">{book.author}</p>

          {book.reflection && (
            <div className="reading-modal-reflection">
              {renderParagraphs(book.reflection)}
            </div>
          )}

          {/* 分章节读书笔记：点标题展开该章正文 */}
          {chapters.length > 0 && (
            <div className="reading-modal-chapters">
              <h4 className="reading-modal-chapters-label">读书笔记</h4>
              {chapters.map((ch, i) => {
                const open = openChapter === i
                return (
                  <div key={i} className={`reading-chapter${open ? ' reading-chapter--open' : ''}`}>
                    <button
                      type="button"
                      className="reading-chapter-head"
                      onClick={() => setOpenChapter(open ? null : i)}
                      aria-expanded={open}
                    >
                      <span className="reading-chapter-num">{String(i + 1).padStart(2, '0')}</span>
                      <span className="reading-chapter-title">{ch.title}</span>
                      <span className="reading-chapter-toggle">{open ? '−' : '+'}</span>
                    </button>
                    {open && (
                      <div className="reading-chapter-body">
                        {renderParagraphs(ch.content)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {book.highlights?.length > 0 && (
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
              <h3 className="reading-modal-files-label">附件</h3>
              <FileAttach
                files={files}
                onChange={(next) => onFilesChange(book.id, next)}
                label="笔记"
                emptyHint={chapters.length === 0 ? '这本书还没有上传笔记。' : undefined}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ===================================================================
   区块 1：最近金句横幅 + 历史记录
   =================================================================== */

function QuoteBanner({ dailyQuotes }) {
  const [showHistory, setShowHistory] = useState(false)
  const todayQuote = getTodayQuote(dailyQuotes)

  useModalBehavior(showHistory, () => setShowHistory(false))

  if (!todayQuote) return null

  return (
    <>
      <section className="reading-quote-banner">
        <div className="reading-quote-label">
          <span className="reading-quote-tag">RECENT · 最近金句</span>
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
              <h3 className="reading-quote-history-title">过往金句</h3>
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
   区块 2：统计数字（四张卡，点击滚到对应区块）
   =================================================================== */

function StatsRow({ profile, notesCount, onJump }) {
  const stats = [
    { key: 'finished', num: profile.stats.finished, label: '已读' },
    { key: 'reading', num: profile.stats.reading, label: '在读' },
    { key: 'want', num: profile.stats.wantToRead, label: '想读' },
    { key: 'notes', num: notesCount, label: '随想便签' },
  ]
  return (
    <div className="reading-stats">
      {stats.map((s) => (
        <button
          key={s.key}
          type="button"
          className="reading-stat-item"
          onClick={() => onJump(s.key)}
        >
          <span className="reading-stat-num">{s.num}</span>
          <span className="reading-stat-label">{s.label}</span>
        </button>
      ))}
    </div>
  )
}

/* ===================================================================
   区块 3：在读
   =================================================================== */

function CurrentlyReading({ books, onSelect }) {
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
        <div className="reading-current-cover">
          <PhotoArt src={book.coverUrl} alt={book.title} id={book.id} theme="journal" />
        </div>

        <div className="reading-current-info">
          <h3 className="reading-current-title">{book.title}</h3>
          <p className="reading-current-author">{book.author}</p>

          {book.reflection && (
            <div className="reading-current-reflection">
              {renderParagraphs(book.reflection)}
            </div>
          )}

          {book.highlights?.length > 0 && (
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

          <button
            type="button"
            className="reading-current-open"
            onClick={() => onSelect(book.id)}
          >
            查看读书笔记 →
          </button>
        </div>
      </div>
    </section>
  )
}

/* ===================================================================
   区块 4：已读 —— 多维标签筛选 + 画廊网格 + 详情弹窗
   =================================================================== */

const PAGE_SIZE = 12

function FinishedGallery({ books, tagDimensions, modalId, onModalChange }) {
  const finishedBooks = useMemo(() => getFinishedBooks(books), [books])

  // 类型多选 + 国家单选
  const [selectedTags, setSelectedTags] = useState([])
  const [selectedCountry, setSelectedCountry] = useState(null)  // 单选
  const [showAll, setShowAll] = useState(false)
  // 搜索：输入不即时过滤，点 🔍 或回车才提交（同课程学习页）
  const [term, setTerm] = useState('')
  const [query, setQuery] = useState('')

  // 筛选：类型多选 AND 国家单选 AND 关键词
  const filtered = useMemo(() => {
    let result = finishedBooks
    if (selectedTags.length > 0) {
      result = filterByTags(result, selectedTags)
    }
    if (selectedCountry) {
      result = result.filter((b) => b.tags?.includes(selectedCountry))
    }
    const q = query.trim().toLowerCase()
    if (q) {
      result = result.filter((b) => {
        const hay = [b.title, b.author, ...(b.tags || [])].join(' ').toLowerCase()
        return hay.includes(q)
      })
    }
    return result
  }, [finishedBooks, selectedTags, selectedCountry, query])

  // 搜索态下直接展示全部匹配；普通态先显示 12 本，点按钮展开全部
  const isSearching = query.trim().length > 0
  const visible = isSearching || showAll ? filtered : filtered.slice(0, PAGE_SIZE)
  const hasMore = !isSearching && !showAll && filtered.length > PAGE_SIZE

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

  const runSearch = () => {
    setQuery(term)
    setShowAll(false)
  }

  const clearSearch = () => {
    setTerm('')
    setQuery('')
  }

  return (
    <section className="reading-finished-section">
      <h2 className="reading-section-label">已读</h2>

      {/* 多维筛选栏（类型 / 国家·地区）+ 右侧搜索 */}
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
                  type="button"
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

        {/* 搜索框：输入完点 🔍 或回车才搜（同课程学习页） */}
        <div className="reading-search-inline">
          <input
            type="text"
            className="reading-search-input"
            placeholder="搜索书名 / 作者…"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') runSearch()
              if (e.key === 'Escape') clearSearch()
            }}
            aria-label="搜索已读书籍"
          />
          {term && (
            <button
              type="button"
              className="reading-search-clear"
              aria-label="清除搜索"
              onClick={clearSearch}
            >
              ✕
            </button>
          )}
          <button
            type="button"
            className="reading-search-btn"
            aria-label="搜索"
            onClick={runSearch}
          >
            🔍
          </button>
        </div>
      </div>

      {/* 画廊网格 */}
      {visible.length > 0 ? (
        <div className="reading-gallery">
          {visible.map((book) => (
            <article
              key={book.id}
              className="reading-gallery-card"
              onClick={() => onModalChange(book.id)}
            >
              <div className="reading-gallery-cover">
                <PhotoArt src={book.coverUrl} alt={book.title} id={book.id} theme="journal" />
              </div>
              <div className="reading-gallery-body">
                <h3 className="reading-gallery-title">{book.title}</h3>
                <p className="reading-gallery-author">{book.author}</p>
                <div className="reading-gallery-tags">
                  {book.tags?.map((t) => (
                    <span key={t} className="reading-gallery-tag">{t}</span>
                  ))}
                </div>
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
          显示全部 {filtered.length} 本 ↓
        </button>
      )}

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
            <div className="reading-want-cover">
                <PhotoArt src={book.coverUrl} alt={book.title} id={book.id} theme="journal" />
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

  // 弹窗状态提到主组件 —— 在读区块和已读区块都能打开同一本书的详情
  const [modalId, setModalId] = useState(null)
  const selectedBook = modalId ? readingData.books.find((b) => b.id === modalId) : null

  // 四张统计卡点击后滚到对应区块
  const finishedRef = useRef(null)
  const currentRef = useRef(null)
  const wantRef = useRef(null)
  const notesRef = useRef(null)
  const jump = (key) => {
    const map = {
      finished: finishedRef,
      reading: currentRef,
      want: wantRef,
      notes: notesRef,
    }
    map[key]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
      <WatercolorBlobs />

      <div className="reading-inner">
        <QuoteBanner dailyQuotes={readingData.dailyQuotes} />
        <StatsRow
          profile={readingData.profile}
          notesCount={readingData.notes.length}
          onJump={jump}
        />
        <div ref={currentRef}>
          <CurrentlyReading books={readingData.books} onSelect={setModalId} />
        </div>
        <div ref={finishedRef}>
          <FinishedGallery
            books={readingData.books}
            tagDimensions={readingData.tagDimensions}
            modalId={modalId}
            onModalChange={setModalId}
          />
        </div>
        <div ref={wantRef}>
          <WantToRead books={readingData.books} />
        </div>
        <div ref={notesRef}>
          <ReflectionsWall notes={readingData.notes} />
        </div>
        <EndMark />
      </div>

      {/* 在读 / 已读共用同一个详情弹窗，由 modalId 决定展示哪本书 */}
      <DetailModal
        book={selectedBook}
        onClose={() => setModalId(null)}
        onFilesChange={handleBookFiles}
      />

      <SiteFooter path="/reading" />
      <EditButton sectionKey="reading" label="读书笔记" />
    </main>
  )
}

export default Reading
