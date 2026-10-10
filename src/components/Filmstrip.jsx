import { useMemo } from 'react'
import PhotoArt from './PhotoArt.jsx'

/**
 * 闪烁星空 — 随机散布的星星，每颗独立闪烁
 */
function Stars() {
  const stars = useMemo(() => {
    const result = []
    for (let i = 0; i < 80; i++) {
      result.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 1 + Math.random() * 2.5,
        dur: 1.8 + Math.random() * 3.5,
        delay: Math.random() * 4,
      })
    }
    return result
  }, [])

  return (
    <div className="movies-stars">
      {stars.map((s) => (
        <span
          key={s.id}
          className="movies-star"
          style={{
            left: `${s.left}vw`,
            top: `${s.top}vh`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            '--twinkle-dur': `${s.dur}s`,
            '--twinkle-delay': `${s.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

/**
 * 单张海报
 */
function PosterCard({ movie, onSelect }) {
  return (
    <div
      className="film-poster-card"
      onClick={() => onSelect(movie)}
      title={movie.title}
    >
      <div className="film-poster-img">
        {/* 有 posterUrl 显示真海报，没有就画一张极简艺术海报（featured 的 posterColor 会被复用） */}
        <PhotoArt
          src={movie.posterUrl}
          alt={movie.title}
          id={movie.id}
          label={movie.title}
          theme="poster"
          accent={movie.posterColor}
        />
      </div>
      <span className="film-poster-title">{movie.title}</span>
      <span className="film-poster-year">{movie.year}</span>
    </div>
  )
}

/**
 * 胶片 Banner — CSS 无限循环滚动，前面出去后面进来
 *
 * 2026-10-09：
 *   · 用户说串灯绳「好累赘」→ 删掉（原 StringLights 组件已移除）。
 *   · 齿孔动画跟海报一起暂停 ——
 *     海报速度 = 每张宽 140 + 间距 16 = 156px / 5s = 31.2 px/s（与张数无关），
 *     齿孔周期 36px → 周期时长 = 36 / 31.2 ≈ 1.154s，由组件算好传给 CSS。
 *
 * 2026-10-10：暂停改成**纯 CSS**（`.filmstrip-film:hover` 同时管海报和齿孔）。
 *   原来海报靠 CSS `:hover`（整条海报行都算）、齿孔靠 React 的「鼠标压在某张卡上」，
 *   两个判定范围不一致 → 鼠标停在两张卡中间的缝里时海报停了、齿孔还在滚。
 *   现在只有一个条件，组件里的 hoveredIndex / onHover 一并删掉。
 */
const POSTER_W = 140
const POSTER_GAP = 16
const SPROCKET_PERIOD = 36

function Filmstrip({ movies, onSelect }) {
  const doubled = useMemo(
    () => (movies.length > 0 ? [...movies, ...movies] : []),
    [movies]
  )

  if (!movies || movies.length === 0) return null

  const scrollDur = movies.length * 5
  const speed = (POSTER_W + POSTER_GAP) / 5
  const sprocketDur = SPROCKET_PERIOD / speed

  return (
    <div className="filmstrip-wrapper">
      <div className="filmstrip-hang">
        <div className="filmstrip-film" style={{ '--sprocket-dur': `${sprocketDur}s` }}>
          <div className="filmstrip-sprockets filmstrip-sprockets--top" />

          <div className="filmstrip-posters" style={{ '--scroll-dur': `${scrollDur}s` }}>
            {doubled.map((movie, i) => (
              <PosterCard key={`${movie.id}-${i}`} movie={movie} onSelect={onSelect} />
            ))}
          </div>

          <div className="filmstrip-sprockets filmstrip-sprockets--bottom" />
        </div>
      </div>
    </div>
  )
}

export { Stars }
export default Filmstrip
