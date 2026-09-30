import { useState, useMemo } from 'react'
import seedMusicData, { extractAllTags, filterByTag } from '../data/music.js'
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
          <div className="music-modal-meta">
            {item.tags?.map((t) => <span key={t} className="music-modal-tag">{t}</span>)}
            {item.year && <span className="music-modal-year">{item.year}</span>}
          </div>
          <h2 className="music-modal-title">{item.title}</h2>
          <p className="music-modal-artist">{item.artist}</p>
          {item.album && <p className="music-modal-album">收录于 <span>{item.album}</span></p>}
          {item.reflection && <div className="music-modal-reflection">{renderParagraphs(item.reflection)}</div>}
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

/* 音乐人弹窗 */
function ArtistModal({ artist, onClose }) {
  if (!artist) return null
  return (
    <div className="artist-modal-overlay" onClick={onClose}>
      <div className="artist-modal" onClick={(e) => e.stopPropagation()}>
        <button className="artist-modal-close" onClick={onClose}>✕</button>
        <div className="artist-modal-avatar"><PhotoArt src={artist.avatarUrl} alt={artist.name} id={artist.id} theme="poster" /></div>
        <h2 className="artist-modal-name">{artist.name}</h2>
        <div className="artist-modal-tags">{artist.tags?.map((t) => <TagPill key={t} tag={t} />)}</div>
        {artist.profile && <div className="artist-modal-profile">{renderParagraphs(artist.profile)}</div>}
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
          {renderAs === 'grid' && items.map((item) => (
            <div key={item.id} className="music-single-card" onClick={() => onItemClick(item)}>
              <div className="music-single-cover-wrap">
                <div className="music-single-cover"><PhotoArt src={item.coverUrl} alt={item.title} id={item.id} theme="poster" /></div>
                <VinylDisc size={100} />
              </div>
              <div className="music-single-body">
                <h3 className="music-single-title">{item.title}</h3>
                <p className="music-single-artist">{item.artist}</p>
                <div className="music-single-meta">{item.tags?.slice(0, 1).map((t) => <TagPill key={t} tag={t} />)}</div>
                {item.reflection && <p className="music-single-reflection">{item.reflection}</p>}
              </div>
            </div>
          ))}
          {renderAs === 'row' && items.map((item) => (
            <div key={item.id} className="music-albums-row-card" onClick={() => onItemClick(item)}>
              <div className="music-albums-row-cover-wrap">
                <div className="music-albums-row-cover"><PhotoArt src={item.coverUrl} alt={item.title} id={item.id} theme="poster" /></div>
                <VinylDisc size={52} />
              </div>
              <div className="music-albums-row-info">
                <div className="music-albums-row-header"><span className="music-albums-row-title">{item.title}</span><span className="music-albums-row-artist">· {item.artist}</span></div>
                <div className="music-albums-row-meta"><span className="music-albums-row-year">{item.year}</span>{item.tags?.slice(0, 1).map((t) => <TagPill key={t} tag={t} />)}</div>
                <p className="music-albums-row-reflection">{item.reflection}</p>
              </div>
            </div>
          ))}
          {renderAs === 'circle' && (
            <div className="music-artists-list">
              {items.map((a) => (
                <div key={a.id} className="music-artist-item" onClick={() => a.profile && onItemClick(a)}>
                  <div className="music-artist-avatar"><PhotoArt src={a.avatarUrl} alt={a.name} id={a.id} theme="poster" /></div>
                  <span className="music-artist-name">{a.name}</span>
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
function LatestPickBanner({ pick }) {
  if (!pick) return null
  return (
    <div className="latest-pick-banner">
      <div className="latest-pick-cover"><PhotoArt src={pick.coverUrl} alt={pick.title} id={pick.id} theme="poster" /></div>
      <div className="latest-pick-info">
        <p className="latest-pick-label">LATEST PICK</p>
        <h3 className="latest-pick-title">{pick.title}</h3>
        <p className="latest-pick-artist">{pick.artist}</p>
        <p className="latest-pick-reason">{pick.recommend}</p>
      </div>
    </div>
  )
}

const SINGLE_PAGE = 10
const ALBUM_PAGE = 10
const ARTIST_PAGE = 8
const FEATURED_PAGE = 4

function SingleCard({ single, onClick }) {
  return (
    <div className="music-single-card" onClick={onClick}>
      <div className="music-single-cover-wrap">
        <div className="music-single-cover"><PhotoArt src={single.coverUrl} alt={single.title} id={single.id} theme="poster" /></div>
        <VinylDisc size={100} />
      </div>
      <div className="music-single-body">
        <h3 className="music-single-title">{single.title}</h3>
        <p className="music-single-artist">{single.artist}</p>
        <div className="music-single-meta">{single.tags?.slice(0, 1).map((t) => <TagPill key={t} tag={t} />)}</div>
        {single.reflection && <p className="music-single-reflection">{single.reflection}</p>}
      </div>
    </div>
  )
}

function SinglesGrid({ singles, onSelect, onShowAll }) {
  if (!singles.length) return <div className="music-empty">还没有这个标签的单曲～</div>
  const visible = singles.slice(0, SINGLE_PAGE)
  return (
    <>
      <div className="music-singles-grid">{visible.map((s) => <SingleCard key={s.id} single={s} onClick={() => onSelect(s)} />)}</div>
      {singles.length > SINGLE_PAGE && <button className="music-more-btn" onClick={onShowAll}>查看更多（共 {singles.length} 首）</button>}
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
        <p className="music-albums-row-reflection">{album.reflection}</p>
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
          <div key={a.id} className="music-artist-item" onClick={() => a.profile && onSelect(a)}>
            <div className="music-artist-avatar"><PhotoArt src={a.avatarUrl} alt={a.name} id={a.id} theme="poster" /></div>
            <span className="music-artist-name">{a.name}</span>
            <p className="music-artist-note">{a.note}</p>
          </div>
        ))}
      </div>
      {artists.length > ARTIST_PAGE && <button className="music-more-btn" onClick={onShowAll}>查看更多（共 {artists.length} 位）</button>}
    </div>
  )
}

function FeaturedWall({ albums, onSelect, onShowAll }) {
  const featured = useMemo(() => albums.filter((a) => a.featured && a.featuredText), [albums])
  if (!featured.length) return null
  const visible = featured.slice(0, FEATURED_PAGE)
  return (
    <section className="music-featured-section">
      <h2 className="music-section-label">深度聆听</h2>
      <div className="music-featured-list">
        {visible.map((a) => (
          <div key={a.id} className="music-featured-item" onClick={() => onSelect(a)}>
            <div className="music-featured-header"><span className="music-featured-album">{a.title}</span><span className="music-featured-artist">{a.artist}</span></div>
            <div className="music-featured-text">{renderParagraphs(a.featuredText)}</div>
          </div>
        ))}
      </div>
      {featured.length > FEATURED_PAGE && <button className="music-more-btn" onClick={onShowAll}>查看更多（共 {featured.length} 篇）</button>}
    </section>
  )
}

function TagFilter({ tags, activeTag, onSelect }) {
  return (
    <div className="music-filter">
      <button className={`music-filter-btn ${activeTag === null ? 'music-filter-btn--active' : ''}`} onClick={() => onSelect(null)}>全部</button>
      {tags.map((tag) => (
        <button key={tag} className={`music-filter-btn ${activeTag === tag ? 'music-filter-btn--active' : ''}`} onClick={() => onSelect(tag === activeTag ? null : tag)}>{tag}</button>
      ))}
    </div>
  )
}

function Music() {
  const { data } = useData()
  const musicData = data.music ?? seedMusicData

  const allTags = useMemo(() => extractAllTags(musicData), [musicData])
  const [activeTag, setActiveTag] = useState(null)
  const singles = useMemo(() => filterByTag(musicData.singles, activeTag), [activeTag, musicData])
  const albums = useMemo(() => filterByTag(musicData.albums, activeTag), [activeTag, musicData])
  const artists = useMemo(() => filterByTag(musicData.artists, activeTag), [activeTag, musicData])

  const [modalItem, setModalItem] = useState(null)
  const [featuredItem, setFeaturedItem] = useState(null)
  const [artistItem, setArtistItem] = useState(null)
  const [fullListType, setFullListType] = useState(null)

  return (
    <main className="music-world">
      <div className="music-inner">
        <Turntable size={220} />
        <p className="turntable-title">最近推荐</p>
        <LatestPickBanner pick={musicData.latestPick} />
        <div style={{ marginTop: 36 }}><TagFilter tags={allTags} activeTag={activeTag} onSelect={setActiveTag} /></div>

        <section style={{ marginBottom: 56 }}>
          <h2 className="music-section-label">最近所听</h2>
          <SinglesGrid singles={singles} onSelect={setModalItem} onShowAll={() => setFullListType('singles')} />
        </section>

        <section style={{ marginBottom: 56 }}>
          <h2 className="music-section-label">专辑推荐</h2>
          <AlbumsList albums={albums} onSelect={setModalItem} onShowAll={() => setFullListType('albums')} />
        </section>

        <section className="music-artists-section">
          <h2 className="music-section-label">音乐人</h2>
          <ArtistsList artists={artists} onSelect={setArtistItem} onShowAll={() => setFullListType('artists')} />
        </section>

        <FeaturedWall albums={albums} onSelect={setFeaturedItem} onShowAll={() => setFullListType('featured')} />
      </div>

      <SiteFooter path="/music" />

      <MusicModal item={modalItem} onClose={() => setModalItem(null)} />
      <ArtistModal artist={artistItem} onClose={() => setArtistItem(null)} />
      <FeaturedModal item={featuredItem} onClose={() => setFeaturedItem(null)} />

      {fullListType === 'singles' && <FullListModal title="全部单曲" items={singles} renderAs="grid" onItemClick={(item) => { setFullListType(null); setModalItem(item) }} onClose={() => setFullListType(null)} />}
      {fullListType === 'albums' && <FullListModal title="全部专辑" items={albums} renderAs="row" onItemClick={(item) => { setFullListType(null); setModalItem(item) }} onClose={() => setFullListType(null)} />}
      {fullListType === 'artists' && <FullListModal title="全部音乐人" items={artists} renderAs="circle" onItemClick={(artist) => { setFullListType(null); setArtistItem(artist) }} onClose={() => setFullListType(null)} />}
      {fullListType === 'featured' && <FullListModal title="全部深度聆听" items={albums.filter((a) => a.featured && a.featuredText)} renderAs="card" onItemClick={(item) => { setFullListType(null); setFeaturedItem(item) }} onClose={() => setFullListType(null)} />}

      <EditButton sectionKey="music" label="音乐" />
    </main>
  )
}

export default Music
