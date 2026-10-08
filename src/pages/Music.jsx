import { useState, useMemo } from 'react'
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

const SINGLE_PAGE = 15
const THOUGHT_PAGE = 6
const ALBUM_PAGE = 10
const ARTIST_PAGE = 8
const FEATURED_PAGE = 4

/* 单曲改成「曲目行」而不是卡片。
   用户的歌单有 193 首（红心 100 + 播放排行 93 的并集），用大卡片铺开太长，
   而且其中 87 首是华语歌、iTunes 没有收录（没有封面），
   铺成卡片会满屏占位图。改成曲目列表后：
   有封面就显示 40px 小图，没有就留一个同尺寸的空位，视觉上不会突兀。 */
function TrackRow({ single, index, onClick }) {
  return (
    <div className="music-track" onClick={onClick}>
      <span className="music-track-index">{String(index + 1).padStart(2, '0')}</span>
      <div className={`music-track-thumb ${single.coverUrl ? '' : 'music-track-thumb--empty'}`}>
        {single.coverUrl && (
          <PhotoArt src={single.coverUrl} alt={single.title} id={single.id} theme="poster" />
        )}
      </div>
      <div className="music-track-body">
        <span className="music-track-title">{single.title}</span>
        <span className="music-track-artist">{single.artist}</span>
      </div>
      <div className="music-track-badges">
        {single.heart && <span className="music-track-badge music-track-badge--heart" title={`红心第 ${single.heart} 首`}>♥ {single.heart}</span>}
        {single.plays && <span className="music-track-badge music-track-badge--plays" title={`播放量第 ${single.plays} 名`}>▶ {single.plays}</span>}
      </div>
    </div>
  )
}

function SinglesGrid({ singles, onSelect, onShowAll }) {
  if (!singles.length) return <div className="music-empty">还没有这个标签的单曲～</div>
  const visible = singles.slice(0, SINGLE_PAGE)
  return (
    <>
      <div className="music-tracklist">
        {visible.map((s, i) => <TrackRow key={s.id} single={s} index={i} onClick={() => onSelect(s)} />)}
      </div>
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

/* 两栏切换：每个板块都有「最近所听 / 历史记录」两个视角。
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

  // 标签筛选去掉了：新数据里只有音乐人有 tags，歌曲/专辑没有，
  // 留着会让「选中一个标签 → 歌曲和专辑整块变空」，不如先撤掉。
  const singles = musicData.singles
  const albums = musicData.albums
  const artists = musicData.artists

  /* 三个板块各自的「最近所听 / 历史记录」两栏。
     数据是同一批，只是口径不同（不额外改数据文件）：
       歌曲  —— 最近所听 = 红心过的（heart 序号，1 最近）；历史记录 = 播放榜（plays 名次，1 最多）
       专辑  —— 最近所听 = 最近收藏的 10 张；历史记录 = 听得最多的 10 张（featured）
       音乐人 —— 最近所听 = 最近关注的 10 位；历史记录 = 播放量前十（有 plays 字段） */
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

  const [modalItem, setModalItem] = useState(null)
  const [featuredItem, setFeaturedItem] = useState(null)
  const [artistItem, setArtistItem] = useState(null)
  const [fullListType, setFullListType] = useState(null)

  return (
    <main className="music-world">
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

        {/* ===== 推歌 ===== */}
        <section className="music-block music-block--pick">
          <div className="music-block-head">
            <h2 className="music-section-label">推歌</h2>
            <span className="music-block-note">本期最想让你听的一首</span>
          </div>
          <LatestPickBanner pick={musicData.latestPick} />
        </section>

        {/* ===== 歌曲 ===== */}
        <section className="music-block">
          <div className="music-block-head">
            <h2 className="music-section-label">歌曲</h2>
            <SectionTabs
              active={songTab}
              onChange={setSongTab}
              tabs={[
                { key: 'recent', label: '最近所听', count: songsRecent.length },
                { key: 'history', label: '历史记录', count: songsHistory.length },
              ]}
            />
          </div>
          <SinglesGrid singles={songList} onSelect={setModalItem} onShowAll={() => setFullListType('singles')} />
        </section>

        {/* ===== 专辑 ===== */}
        <section className="music-block">
          <div className="music-block-head">
            <h2 className="music-section-label">专辑</h2>
            <SectionTabs
              active={albumTab}
              onChange={setAlbumTab}
              tabs={[
                { key: 'recent', label: '最近所听', count: albumsRecent.length },
                { key: 'history', label: '历史记录', count: albumsHistory.length },
              ]}
            />
          </div>
          <AlbumsList albums={albumList} onSelect={setModalItem} onShowAll={() => setFullListType('albums')} />
        </section>

        {/* ===== 音乐人 ===== */}
        <section className="music-block">
          <div className="music-block-head">
            <h2 className="music-section-label">音乐人</h2>
            <SectionTabs
              active={artistTab}
              onChange={setArtistTab}
              tabs={[
                { key: 'recent', label: '最近所听', count: artistsRecent.length },
                { key: 'history', label: '历史记录', count: artistsHistory.length },
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
      <ArtistModal artist={artistItem} onClose={() => setArtistItem(null)} />
      <FeaturedModal item={featuredItem} onClose={() => setFeaturedItem(null)} />

      {fullListType === 'singles' && <FullListModal title={songTab === 'recent' ? '最近所听 · 全部' : '历史记录 · 全部'} items={songList} renderAs="tracks" onItemClick={(item) => { setFullListType(null); setModalItem(item) }} onClose={() => setFullListType(null)} />}
      {fullListType === 'thoughts' && <FullListModal title="全部感想" items={musicData.thoughts ?? []} renderAs="thoughts" onItemClick={() => {}} onClose={() => setFullListType(null)} />}
      {fullListType === 'albums' && <FullListModal title={albumTab === 'recent' ? '最近所听 · 全部专辑' : '历史记录 · 全部专辑'} items={albumList} renderAs="row" onItemClick={(item) => { setFullListType(null); setModalItem(item) }} onClose={() => setFullListType(null)} />}
      {fullListType === 'artists' && <FullListModal title={artistTab === 'recent' ? '最近所听 · 全部音乐人' : '历史记录 · 全部音乐人'} items={artistList} renderAs="circle" onItemClick={(artist) => { setFullListType(null); setArtistItem(artist) }} onClose={() => setFullListType(null)} />}

      <EditButton sectionKey="music" label="音乐" />
    </main>
  )
}

export default Music
