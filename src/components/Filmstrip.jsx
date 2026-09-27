import { useState, useMemo } from 'react'
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
 * 串灯绳
 */
function StringLights({ count = 14, hoveredIndex, className = '' }) {
  return (
    <div className={`string-lights ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={`string-light ${i === hoveredIndex ? 'string-light--glow' : ''}`}
          style={{ animationDelay: `${i * 0.35}s` }}
        />
      ))}
    </div>
  )
}

/**
 * 单张海报
 */
function PosterCard({ movie, index, onHover, onSelect }) {
  return (
    <div
      className="film-poster-card"
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(-1)}
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
 */
function Filmstrip({ movies, onSelect }) {
  const [hoveredIndex, setHoveredIndex] = useState(-1)

  const doubled = useMemo(
    () => (movies.length > 0 ? [...movies, ...movies] : []),
    [movies]
  )

  if (!movies || movies.length === 0) return null

  const scrollDur = movies.length * 5

  return (
    <div className="filmstrip-wrapper">
      <StringLights count={14} hoveredIndex={hoveredIndex % movies.length} />

      <div className="filmstrip-hang">
        <div className="filmstrip-film">
          <div className="filmstrip-sprockets filmstrip-sprockets--top" />

          <div className="filmstrip-posters" style={{ '--scroll-dur': `${scrollDur}s` }}>
            {doubled.map((movie, i) => (
              <PosterCard
                key={`${movie.id}-${i}`}
                movie={movie}
                index={i % movies.length}
                onHover={setHoveredIndex}
                onSelect={onSelect}
              />
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
