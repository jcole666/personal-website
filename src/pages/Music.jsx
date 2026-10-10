import { useState, useMemo, useRef, useLayoutEffect } from 'react'
import seedMusicData from '../data/music.js'
import { useData } from '../context/DataContext.jsx'
import Turntable, { VinylDisc } from '../components/Turntable.jsx'
import PhotoArt from '../components/PhotoArt.jsx'
import EditButton from '../components/edit/EditButton.jsx'
import SiteFooter from '../components/SiteFooter.jsx'

/* 小工具 */
function renderParagraphs(text) {
  if (!text) return null
  return text.trim().split('\n\n').map((para, i) => <p key={i}>{para.trim()}</p>)
}

function TagPill({ tag }) {
  return <span className="music-tag-pill">{tag}</span>
}

/** 名字里有没有中日韩汉字 —— 有就竖排（用户要求中文名竖着写） */
const hasCJK = (s) => /[\u3400-\u9fff]/.test(String(s ?? ''))
const artistNameClass = (name) =>
  `music-artist-name${hasCJK(name) ? ' music-artist-name--cjk' : ''}`

/** 某个音乐人的作品（按艺人名匹配，含合作曲） */
function artistWorks(artist, singles, albums) {
  if (!artist) return { songs: [], albums: [] }
  const n = String(artist.name).toLowerCase()
  return {
    songs: singles.filter((s) => String(s.artist ?? '').toLowerCase().includes(n)),
    albums: albums.filter((a) => String(a.artist ?? '').toLowerCase().includes(n)),
  }
}

/* 详情弹窗（单曲/专辑通用） */
function MusicModal({ item, onClose }) {
  if (!item) return null
  return (
    <div className="music-modal-overlay" onClick={onClose}>
      <div className="music-modal" onClick={(e) => e.stopPropagation()}>
        <button className="music-modal-close" onClick={onClose}>✕</button>
        <div className="music-modal-cover">
          <PhotoArt src={item.coverUrl} alt={item.title} id={item.id} theme="poster" />
        </div>
        <div className="music-modal-body">
          {/* 歌曲只有 title/artist/album + 榜单名次（没有 tags/reflection），
              所以这里按「有没有榜单信息」决定显示什么 */}
          <div className="music-modal-meta">
            {item.heart && <span className="music-modal-tag">红心第 {item.heart} 首</span>}
            {item.plays && <span className="music-modal-tag">播放量第 {item.plays} 名</span>}
            {item.tags?.map((t) => <span key={t} className="music-modal-tag">{t}</span>)}
            {item.year && <span className="music-modal-year">{item.year}</span>}
          </div>
          <h2 className="music-modal-title">{item.title}</h2>
          <p className="music-modal-artist">{item.artist}</p>
          {item.album && <p className="music-modal-album">收录于 <span>{item.album}</span></p>}
          {item.reflection && (
            <div className="music-modal-reflection">
              <h3 className="music-modal-reflection-title">我的感悟</h3>
              <div className="music-modal-reflection-body">{renderParagraphs(item.reflection)}</div>
            </div>
          )}
          {item.lyricQuote && (
            <div className="music-modal-lyric">
              <p className="music-modal-lyric-quote">"{item.lyricQuote}"</p>
              {item.lyricNote && <p className="music-modal-lyric-note">{item.lyricNote}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* 音乐人弹窗 —— 除了名字/标签/note，还把这位音乐人的歌和专辑列出来 */
function ArtistModal({ artist, singles, albums, onPickItem, onClose }) {
  if (!artist) return null
  const works = artistWorks(artist, singles, albums)
  return (
    <div className="artist-modal-overlay" onClick={onClose}>
      <div className="artist-modal" onClick={(e) => e.stopPropagation()}>
        <button className="artist-modal-close" onClick={onClose}>✕</button>
        <div className="artist-modal-top">
          <div className="artist-modal-avatar"><PhotoArt src={artist.avatarUrl} alt={artist.name} id={artist.id} theme="poster" /></div>
          <div className="artist-modal-headtext">
            <h2 className="artist-modal-name">{artist.name}</h2>
            <div className="artist-modal-tags">{artist.tags?.map((t) => <TagPill key={t} tag={t} />)}</div>
          </div>
        </div>
        {artist.note && <p className="artist-modal-note">{artist.note}</p>}
        {artist.profile && (
          <div className="music-modal-reflection artist-modal-reflection">
            <h3 className="music-modal-reflection-title">我的感悟</h3>
            <div className="music-modal-reflection-body">{renderParagraphs(artist.profile)}</div>
          </div>
        )}

        {works.songs.length > 0 && (
          <div className="artist-modal-works">
            <h3 className="artist-modal-works-title">我收藏的歌 · {works.songs.length}</h3>
            <div className="music-tracklist">
              {works.songs.slice(0, 12).map((s, i) => (
                <TrackRow key={s.id} single={s} index={i} onClick={() => onPickItem(s)} />
              ))}
            </div>
          </div>
        )}
        {works.albums.length > 0 && (
          <div className="artist-modal-works">
            <h3 className="artist-modal-works-title">相关专辑 · {works.albums.length}</h3>
            <div className="music-artist-albums">
              {works.albums.map((a) => (
                <div key={a.id} className="music-artist-album" onClick={() => onPickItem(a)}>
                  <div className="music-artist-album-cover"><PhotoArt src={a.coverUrl} alt={a.title} id={a.id} theme="poster" /></div>
                  <span className="music-artist-album-title">{a.title}</span>
                  <span className="music-artist-album-year">{a.year}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* 深度聆听详情弹窗 */
function FeaturedModal({ item, onClose }) {
  if (!item) return null
  return (
    <div className="music-modal-overlay" onClick={onClose}>
      <div className="music-modal" onClick={(e) => e.stopPropagation()}>
        <button className="music-modal-close" onClick={onClose}>✕</button>
        <div className="music-modal-body" style={{ paddingTop: 40 }}>
          <div className="music-modal-meta">
            {item.tags?.slice(0, 2).map((t) => <span key={t} className="music-modal-tag">{t}</span>)}
            {item.year && <span className="music-modal-year">{item.year}</span>}
          </div>
          <h2 className="music-modal-title">{item.title}</h2>
          <p className="music-modal-artist">{item.artist}</p>
          <div className="music-modal-reflection">{renderParagraphs(item.featuredText)}</div>
        </div>
      </div>
    </div>
  )
}

/* 往期推歌弹窗 */
function PickHistoryModal({ picks, onClose }) {
  return (
    <div className="full-list-overlay" onClick={onClose}>
      <div className="full-list-panel" onClick={(e) => e.stopPropagation()}>
        <div className="full-list-head">
          <h2 className="full-list-head-title">历史推歌</h2>
          <button className="full-list-close" onClick={onClose}>✕</button>
        </div>
        <div className="pick-history-list">
          {picks.map((p) => (
            <article key={p.id} className="pick-history-item">
              <div className="pick-history-cover">
                <PhotoArt src={p.coverUrl} alt={p.title} id={p.id} theme="poster" />
              </div>
              <div className="pick-history-body">
                <span className="pick-history-rank">播放量第 {p.rank} 名</span>
                <h3 className="pick-history-title">{p.title}</h3>
                <p className="pick-history-artist">{p.artist}</p>
                <p className="pick-history-reason">{p.recommend}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

/* "查看更多"完整列表弹窗 */
function FullListModal({ title, items, renderAs, onItemClick, onClose }) {
  return (
    <div className="full-list-overlay" onClick={onClose}>
      <div className="full-list-panel" onClick={(e) => e.stopPropagation()}>
        <div className="full-list-head">
          <h2 className="full-list-head-title">{title}</h2>
          <button className="full-list-close" onClick={onClose}>✕</button>
        </div>
        <div className={`full-list-body full-list-body--${renderAs}`}>
          {renderAs === 'tracks' && (
            <div className="music-tracklist">
              {items.map((item, i) => (
                <TrackRow key={item.id} single={item} index={i} onClick={() => onItemClick(item)} />
              ))}
            </div>
          )}
          {renderAs === 'thoughts' && (
            <div className="music-thought-list">
              {items.map((t) => <ThoughtCard key={t.id} thought={t} />)}
            </div>
          )}
          {renderAs === 'row' && items.map((item) => (
            <div key={item.id} className="music-albums-row-card" onClick={() => onItemClick(item)}>
              <div className="music-albums-row-cover-wrap">
                <div className="music-albums-row-cover"><PhotoArt src={item.coverUrl} alt={item.title} id={item.id} theme="poster" /></div>
                <VinylDisc size={52} />
              </div>
              <div className="music-albums-row-info">
                <div className="music-albums-row-header"><span className="music-albums-row-title">{item.title}</span><span className="music-albums-row-artist">· {item.artist}</span></div>
                <div className="music-albums-row-meta"><span className="music-albums-row-year">{item.year}</span>{item.tags?.slice(0, 1).map((t) => <TagPill key={t} tag={t} />)}</div>
              </div>
            </div>
          ))}
          {renderAs === 'circle' && (
            <div className="music-artists-list">
              {items.map((a) => (
                <div key={a.id} className="music-artist-item" onClick={() => onItemClick(a)}>
                  <div className="music-artist-avatar"><PhotoArt src={a.avatarUrl} alt={a.name} id={a.id} theme="poster" /></div>
                  <span className={artistNameClass(a.name)}>{a.name}</span>
                  <p className="music-artist-note">{a.note}</p>
                </div>
              ))}
            </div>
          )}
          {renderAs === 'card' && (
            <div className="music-featured-list" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {items.map((a) => (
                <div key={a.id} className="music-featured-item" onClick={() => onItemClick(a)}>
                  <div className="music-featured-header"><span className="music-featured-album">{a.title}</span><span className="music-featured-artist">{a.artist}</span></div>
                  <div className="music-featured-text">{renderParagraphs(a.featuredText)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* 本期推荐横幅 */
function LatestPickBanner({ pick, onShowHistory, historyCount }) {
  if (!pick) return null
  return (
    <div className="latest-pick-banner">
      <div className="latest-pick-cover"><PhotoArt src={pick.coverUrl} alt={pick.title} id={pick.id} theme="poster" /></div>
      <div className="latest-pick-info">
        <div className="latest-pick-toprow">
          <p className="latest-pick-label">LATEST PICK</p>
          {historyCount > 0 && (
            <button className="latest-pick-history-btn" onClick={onShowHistory}>
              历史推歌 <span className="latest-pick-history-count">{historyCount}</span> →
            </button>
          )}
        </div>
        <h3 className="latest-pick-title">{pick.title}</h3>
        <p className="latest-pick-artist">{pick.artist}</p>
        <p className="latest-pick-reason">{pick.recommend}</p>
      </div>
    </div>
  )
}

/* 搜索框 + 结果 */
function MusicSearch({ query, onQueryChange, results, onPickItem, onPickArtist }) {
  const hasQuery = query.trim().length > 0
  return (
    <div className="music-search">
      <div className="music-search-bar">
        <span className="music-search-icon" aria-hidden="true">🔍</span>
        <input
          className="music-search-input"
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="搜歌曲 / 专辑 / 音乐人……"
          aria-label="搜索"
        />
        {hasQuery && (
          <button className="music-search-clear" onClick={() => onQueryChange('')} aria-label="清空">✕</button>
        )}
      </div>

      {hasQuery && results && (
        <div className="music-search-results">
          {results.songs.length + results.albums.length + results.artists.length === 0 && (
            <p className="music-search-empty">没找到「{query}」，换个关键词试试～</p>
          )}

          {results.artists.length > 0 && (
            <div className="music-search-group">
              <h3 className="music-search-group-title">音乐人 <span>{results.artists.length}</span></h3>
              <div className="music-search-artists">
                {results.artists.slice(0, 12).map((a) => (
                  <button key={a.id} className="music-search-artist" onClick={() => onPickArtist(a)}>
                    <span className="music-search-artist-avatar"><PhotoArt src={a.avatarUrl} alt={a.name} id={a.id} theme="poster" /></span>
                    <span className="music-search-artist-name">{a.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.albums.length > 0 && (
            <div className="music-search-group">
              <h3 className="music-search-group-title">专辑 <span>{results.albums.length}</span></h3>
              <div className="music-search-albums">
                {results.albums.slice(0, 12).map((a) => (
                  <button key={a.id} className="music-search-album" onClick={() => onPickItem(a)}>
                    <span className="music-search-album-cover"><PhotoArt src={a.coverUrl} alt={a.title} id={a.id} theme="poster" /></span>
                    <span className="music-search-album-title">{a.title}</span>
                    <span className="music-search-album-artist">{a.artist}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.songs.length > 0 && (
            <div className="music-search-group">
              <h3 className="music-search-group-title">歌曲 <span>{results.songs.length}</span></h3>
              <div className="music-tracklist">
                {results.songs.slice(0, 20).map((s, i) => (
                  <TrackRow key={s.id} single={s} index={i} onClick={() => onPickItem(s)} />
                ))}
              </div>
              {results.songs.length > 20 && (
                <p className="music-search-more">还有 {results.songs.length - 20} 首，输入更具体的关键词缩小范围</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const SINGLE_PAGE = 16
const THOUGHT_PAGE = 6
/* 专辑每栏只铺 8 张 —— 每栏总共就 10 张，铺满 10 张的话「查看更多」永远不出现。
   用户明确要求专辑下面也要有「查看更多」按钮（后续还会加专辑）。 */
const ALBUM_PAGE = 8
const ARTIST_PAGE = 9
const MUST_PAGE = 16
const FEATURED_PAGE = 4

/* 单曲改成「曲目行」而不是卡片。
   用户的歌单有 193 首（红心 100 + 播放排行 93 的并集），用大卡片铺开太长，
   而且其中 87 首是华语歌、iTunes 没有收录（没有封面），
   铺成卡片会满屏占位图。改成曲目列表后：
   有封面就显示 40px 小图，没有就留一个同尺寸的空位，视觉上不会突兀。 */
function TrackRow({ single, index, onClick }) {
  /* 左边只留一个「序号位」：
     有榜单名次（红心 / 播放量）就把角标放这儿 —— 榜单里 index+1 和名次是同一个数，
     原来左右各显示一遍（01 … ▶1），用户说重复了。
     没有榜单的（人生必听歌单、搜索结果）才显示朴素的两位序号。 */
  const badge = single.heart
    ? { mod: 'heart', text: `♥ ${single.heart}`, title: `红心第 ${single.heart} 首` }
    : single.plays
      ? { mod: 'plays', text: `▶ ${single.plays}`, title: `播放量第 ${single.plays} 名` }
      : null

  return (
    <div className="music-track" onClick={onClick}>
      {badge ? (
        <span
          className={`music-track-badge music-track-badge--${badge.mod} music-track-badge--lead`}
          title={badge.title}
        >
          {badge.text}
        </span>
      ) : (
        <span className="music-track-index">{String(index + 1).padStart(2, '0')}</span>
      )}

      <div className={`music-track-thumb ${single.coverUrl ? '' : 'music-track-thumb--empty'}`}>
        {single.coverUrl && (
          <PhotoArt src={single.coverUrl} alt={single.title} id={single.id} theme="poster" />
        )}
      </div>
      <div className="music-track-body">
        <span className="music-track-title">{single.title}</span>
        <span className="music-track-artist">{single.artist}</span>
      </div>
    </div>
  )
}

function SinglesGrid({ singles, onSelect, onShowAll, pageSize = SINGLE_PAGE }) {
  if (!singles.length) return <div className="music-empty">还没有这个标签的单曲～</div>
  const visible = singles.slice(0, pageSize)
  return (
    <>
      <div className="music-tracklist">
        {visible.map((s, i) => <TrackRow key={s.id} single={s} index={i} onClick={() => onSelect(s)} />)}
      </div>
      {singles.length > pageSize && <button className="music-more-btn" onClick={onShowAll}>查看更多（共 {singles.length} 首）</button>}
    </>
  )
}

function AlbumRow({ album, onClick }) {
  return (
    <div className="music-albums-row-card" onClick={onClick}>
      <div className="music-albums-row-cover-wrap">
        <div className="music-albums-row-cover"><PhotoArt src={album.coverUrl} alt={album.title} id={album.id} theme="poster" /></div>
        <VinylDisc size={52} />
      </div>
      <div className="music-albums-row-info">
        <div className="music-albums-row-header"><span className="music-albums-row-title">{album.title}</span><span className="music-albums-row-artist">· {album.artist}</span></div>
        <div className="music-albums-row-meta"><span className="music-albums-row-year">{album.year}</span>{album.tags?.slice(0, 1).map((t) => <TagPill key={t} tag={t} />)}</div>
      </div>
    </div>
  )
}

function AlbumsList({ albums, onSelect, onShowAll }) {
  if (!albums.length) return <div className="music-empty">还没有这个标签的专辑～</div>
  const visible = albums.slice(0, ALBUM_PAGE)
  return (
    <div>
      {visible.map((a) => <AlbumRow key={a.id} album={a} onClick={() => onSelect(a)} />)}
      {albums.length > ALBUM_PAGE && <button className="music-more-btn" onClick={onShowAll}>查看更多（共 {albums.length} 张）</button>}
    </div>
  )
}

function ArtistsList({ artists, onSelect, onShowAll }) {
  if (!artists.length) return <div className="music-empty">还没有这个标签的音乐人～</div>
  const visible = artists.slice(0, ARTIST_PAGE)
  return (
    <div>
      <div className="music-artists-list">
        {visible.map((a) => (
          <div key={a.id} className="music-artist-item" onClick={() => onSelect(a)}>
            <div className="music-artist-avatar"><PhotoArt src={a.avatarUrl} alt={a.name} id={a.id} theme="poster" /></div>
            <span className={artistNameClass(a.name)}>{a.name}</span>
            <p className="music-artist-note">{a.note}</p>
          </div>
        ))}
      </div>
      {artists.length > ARTIST_PAGE && <button className="music-more-btn" onClick={onShowAll}>查看更多（共 {artists.length} 位）</button>}
    </div>
  )
}

/* 两栏切换：每个板块都有「最近 / 历史」两个视角。
   数据来源是同一批，只是排序和筛选口径不同（见 Music() 里的派生逻辑）。 */
function SectionTabs({ tabs, active, onChange }) {
  return (
    <div className="music-tabs" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.key}
          role="tab"
          aria-selected={active === t.key}
          className={`music-tab ${active === t.key ? 'music-tab--active' : ''}`}
          onClick={() => onChange(t.key)}
        >
          {t.label}
          <span className="music-tab-count">{t.count}</span>
        </button>
      ))}
    </div>
  )
}

/* 感想：先一段整体的音乐感悟，再是每首歌的具体感受（卡片带封面 + 文字）。
   默认只铺 THOUGHT_PAGE 张，其余点「查看更多」进弹窗看。 */
function ThoughtsWall({ intro, thoughts, onShowAll }) {
  if (!thoughts?.length) return null
  const visible = thoughts.slice(0, THOUGHT_PAGE)
  return (
    <section className="music-block music-thoughts-section">
      <div className="music-block-head">
        <h2 className="music-section-label">感想</h2>
        {thoughts.length > THOUGHT_PAGE && (
          <button className="music-more-btn music-more-btn--inline" onClick={onShowAll}>
            查看更多（共 {thoughts.length} 首）
          </button>
        )}
      </div>

      {intro && <p className="music-thought-intro">{intro}</p>}

      <div className="music-thought-list">
        {visible.map((t) => (
          <ThoughtCard key={t.id} thought={t} />
        ))}
      </div>
    </section>
  )
}

function ThoughtCard({ thought }) {
  return (
    <article className="music-thought-item">
      <div className="music-thought-cover">
        <PhotoArt src={thought.coverUrl} alt={thought.title} id={thought.id} theme="poster" />
      </div>
      <div className="music-thought-body">
        <header className="music-thought-head">
          <span className="music-thought-album">{thought.title}</span>
          <span className="music-thought-artist">{thought.artist}</span>
        </header>
        <div className="music-thought-text">{renderParagraphs(thought.text)}</div>
      </div>
    </article>
  )
}

function Music() {
  const { data } = useData()
  const musicData = data.music ?? seedMusicData

  const singles = musicData.singles ?? []
  const albums = musicData.albums ?? []
  const artists = musicData.artists ?? []

  /* 三个板块各自的「最近 / 历史」两栏。
     数据是同一批，只是口径不同（不额外改数据文件）：
       歌曲  —— 最近红心 = 红心过的（heart 序号，1 最近）；历史记录 = 播放榜（plays 名次，1 最多）
       专辑  —— 最近收藏 = 最近收藏的 10 张；历史记录 = 听得最多的 10 张（featured）
       音乐人 —— 最近关注 = 最近关注的 10 位；历史记录 = 播放量前十（有 plays 字段） */
  const [songTab, setSongTab] = useState('recent')
  const [albumTab, setAlbumTab] = useState('recent')
  const [artistTab, setArtistTab] = useState('recent')

  const songsRecent = useMemo(
    () => singles.filter((s) => s.heart).sort((a, b) => a.heart - b.heart),
    [singles],
  )
  const songsHistory = useMemo(
    () => singles.filter((s) => s.plays).sort((a, b) => a.plays - b.plays),
    [singles],
  )
  const albumsRecent = useMemo(() => albums.filter((a) => !a.featured), [albums])
  const albumsHistory = useMemo(() => albums.filter((a) => a.featured), [albums])
  const artistsRecent = useMemo(() => artists.filter((a) => !a.plays), [artists])
  const artistsHistory = useMemo(
    () => artists.filter((a) => a.plays).sort((a, b) => a.plays - b.plays),
    [artists],
  )

  const songList = songTab === 'recent' ? songsRecent : songsHistory
  const albumList = albumTab === 'recent' ? albumsRecent : albumsHistory
  const artistList = artistTab === 'recent' ? artistsRecent : artistsHistory

  /* 左栏歌单要和右栏专辑一样长 —— 量一次右栏专辑列表的高度，换算成能放几行歌。
     歌曲行高会随字号 / 断点变，所以实测而不是写死数字。 */
  const albumColRef = useRef(null)
  const [songPage, setSongPage] = useState(SINGLE_PAGE)

  useLayoutEffect(() => {
    const col = albumColRef.current
    if (!col) return
    const compute = () => {
      const rows = col.querySelectorAll('.music-albums-row-card')
      const track = document.querySelector('.music-split-col .music-track')
      if (!rows.length) return
      const first = rows[0].getBoundingClientRect()
      const last = rows[rows.length - 1].getBoundingClientRect()
      const albumH = last.bottom - first.top
      const rowH = track ? track.getBoundingClientRect().height + 1 : 58
      if (rowH <= 0) return
      const n = Math.max(8, Math.round(albumH / rowH))
      setSongPage((p) => (p === n ? p : n))
    }
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(col)
    return () => ro.disconnect()
  }, [albumTab, albumList.length])

  const [modalItem, setModalItem] = useState(null)
  const [featuredItem, setFeaturedItem] = useState(null)
  const [artistItem, setArtistItem] = useState(null)
  const [fullListType, setFullListType] = useState(null)
  const [pickHistoryOpen, setPickHistoryOpen] = useState(false)

  /* ===== 搜索 ===== */
  const [query, setQuery] = useState('')
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    const artistHits = artists.filter((a) => String(a.name).toLowerCase().includes(q))
    const artistNames = artistHits.map((a) => String(a.name).toLowerCase())
    const byArtist = (name) => artistNames.some((n) => String(name ?? '').toLowerCase().includes(n))
    const songs = singles.filter(
      (s) =>
        String(s.title).toLowerCase().includes(q) ||
        String(s.artist).toLowerCase().includes(q) ||
        String(s.album ?? '').toLowerCase().includes(q) ||
        byArtist(s.artist),
    )
    const alb = albums.filter(
      (a) =>
        String(a.title).toLowerCase().includes(q) ||
        String(a.artist).toLowerCase().includes(q) ||
        byArtist(a.artist),
    )
    return { songs, albums: alb, artists: artistHits }
  }, [query, singles, albums, artists])

  const pickHistory = musicData.pickHistory ?? []

  /* 人生必听歌单（用户提供的 62 首「更喜欢的音乐」）
     ⚠️ 这里 map 时要**带上 reflection** —— 漏掉字段的话弹窗里就没有感悟了 */
  const mustList = useMemo(
    () =>
      (musicData.mustListen ?? []).map((m, i) => ({
        id: `must-${i + 1}`,
        title: m.title,
        artist: m.artist,
        coverUrl: m.coverUrl || '',
        reflection: m.reflection || '',
      })),
    [musicData.mustListen],
  )

  return (
    <main className="music-world">
      {/* 背景装饰气泡（Neo-Brutalist 硬边圆） */}
      <div className="music-decor" aria-hidden="true">
        <span className="music-bubble music-bubble--1" />
        <span className="music-bubble music-bubble--2" />
        <span className="music-bubble music-bubble--3" />
        <span className="music-bubble music-bubble--4" />
        <span className="music-bubble music-bubble--5" />
        <span className="music-bubble music-bubble--6" />
        <span className="music-bubble music-bubble--7" />
      </div>

      <div className="music-inner">
        {/* Hero：左边「流前音乐」四个大字（两字一排、共两排），右边黑胶唱机 */}
        <div className="music-hero">
          <h1 className="music-hero-title" aria-label="流前音乐">
            <span>流前</span>
            <span>音乐</span>
          </h1>
          <div className="music-hero-deck">
            <Turntable size={380} />
          </div>
        </div>

        {/* ===== 人生必听歌单（原「推歌」）===== */}
        <section className="music-block music-block--must">
          <div className="music-block-head">
            <h2 className="music-section-label">人生必听歌单</h2>
            <span className="music-block-note">「更喜欢的音乐」· {mustList.length} 首</span>
          </div>
          <p className="music-must-intro">
            Prince 占了快十首，Kanye 那一串也几乎把几张专辑搬全了 —— 这张单子比红心那边更集中，
            挑的时候几乎不用想，因为都是会反复回去听的东西。
          </p>
          <div className="music-tracklist">
            {mustList.slice(0, MUST_PAGE).map((s, i) => (
              <TrackRow key={s.id} single={s} index={i} onClick={() => setModalItem(s)} />
            ))}
          </div>
          {mustList.length > MUST_PAGE && (
            <button className="music-more-btn" onClick={() => setFullListType('must')}>
              查看更多（共 {mustList.length} 首）
            </button>
          )}
        </section>

        {/* ===== 搜索 ===== */}
        <section className="music-block music-block--search">
          <MusicSearch
            query={query}
            onQueryChange={setQuery}
            results={searchResults}
            onPickItem={setModalItem}
            onPickArtist={setArtistItem}
          />
        </section>

        {/* ===== 歌曲 / 专辑（左右两列，长度对齐） ===== */}
        <section className="music-block">
          <div className="music-split">
            <div className="music-split-col">
              <div className="music-block-head">
                <h2 className="music-section-label">歌曲</h2>
                <SectionTabs
                  active={songTab}
                  onChange={setSongTab}
                  tabs={[
                    { key: 'recent', label: '最近红心', count: songsRecent.length },
                    { key: 'history', label: '历史收听榜', count: songsHistory.length },
                  ]}
                />
              </div>
              <SinglesGrid
                singles={songList}
                pageSize={songPage}
                onSelect={setModalItem}
                onShowAll={() => setFullListType('singles')}
              />
            </div>

            <div className="music-split-col">
              <div className="music-block-head">
                <h2 className="music-section-label">专辑</h2>
                <SectionTabs
                  active={albumTab}
                  onChange={setAlbumTab}
                  tabs={[
                    { key: 'recent', label: '最近收藏', count: albumsRecent.length },
                    { key: 'history', label: '历史收听榜', count: albumsHistory.length },
                  ]}
                />
              </div>
              <div ref={albumColRef}>
                <AlbumsList albums={albumList} onSelect={setModalItem} onShowAll={() => setFullListType('albums')} />
              </div>
            </div>
          </div>
        </section>

        {/* ===== 音乐人 ===== */}
        <section className="music-block">
          <div className="music-block-head">
            <h2 className="music-section-label">音乐人</h2>
            <SectionTabs
              active={artistTab}
              onChange={setArtistTab}
              tabs={[
                { key: 'recent', label: '最近关注', count: artistsRecent.length },
                { key: 'history', label: '历史收听榜', count: artistsHistory.length },
              ]}
            />
          </div>
          <ArtistsList artists={artistList} onSelect={setArtistItem} onShowAll={() => setFullListType('artists')} />
        </section>

        {/* ===== 感想 ===== */}
        <ThoughtsWall
          intro={musicData.thoughtIntro}
          thoughts={musicData.thoughts ?? []}
          onShowAll={() => setFullListType('thoughts')}
        />
      </div>

      <SiteFooter path="/music" />

      <MusicModal item={modalItem} onClose={() => setModalItem(null)} />
      <ArtistModal
        artist={artistItem}
        singles={singles}
        albums={albums}
        onPickItem={(item) => { setArtistItem(null); setModalItem(item) }}
        onClose={() => setArtistItem(null)}
      />
      <FeaturedModal item={featuredItem} onClose={() => setFeaturedItem(null)} />
      {pickHistoryOpen && <PickHistoryModal picks={pickHistory} onClose={() => setPickHistoryOpen(false)} />}

      {/* ⚠️ 点清单里的条目只打开详情弹窗，**不要关掉清单** ——
          这样关掉详情后会回到「查看更多」列表，而不是回到主页（用户反馈过）。
          详情弹窗的 z-index 比清单高，靠 CSS 保证盖在上面。 */}
      {fullListType === 'singles' && <FullListModal title={songTab === 'recent' ? '最近红心 · 全部' : '历史收听榜 · 全部'} items={songList} renderAs="tracks" onItemClick={setModalItem} onClose={() => setFullListType(null)} />}
      {fullListType === 'thoughts' && <FullListModal title="全部感想" items={musicData.thoughts ?? []} renderAs="thoughts" onItemClick={() => {}} onClose={() => setFullListType(null)} />}
      {fullListType === 'albums' && <FullListModal title={albumTab === 'recent' ? '最近收藏 · 全部专辑' : '历史收听榜 · 全部专辑'} items={albumList} renderAs="row" onItemClick={setModalItem} onClose={() => setFullListType(null)} />}
      {fullListType === 'artists' && <FullListModal title={artistTab === 'recent' ? '最近关注 · 全部音乐人' : '历史收听榜 · 全部音乐人'} items={artistList} renderAs="circle" onItemClick={setArtistItem} onClose={() => setFullListType(null)} />}
      {fullListType === 'must' && <FullListModal title="人生必听歌单 · 全部 62 首" items={mustList} renderAs="tracks" onItemClick={setModalItem} onClose={() => setFullListType(null)} />}

      <EditButton sectionKey="music" label="音乐" />
    </main>
  )
}

export default Music
