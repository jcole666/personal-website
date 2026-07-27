import { motion } from 'framer-motion'
import { useTransition } from '../context/TransitionContext.jsx'

// 5 套形状，每套是一堆错落的圆团（无底座，靠圆团自然堆出蓬松起伏的轮廓）
const shapes = [
  [[52, 98, 24], [86, 100, 28], [122, 98, 26], [156, 96, 22], [70, 78, 26], [106, 72, 32], [142, 80, 26], [92, 56, 24], [126, 58, 22]],
  [[40, 102, 20], [72, 104, 24], [104, 104, 26], [136, 104, 24], [168, 102, 20], [88, 86, 24], [122, 84, 26], [152, 90, 20]],
  [[80, 116, 24], [110, 116, 26], [95, 94, 28], [120, 90, 26], [100, 68, 26], [122, 66, 24], [108, 44, 22], [112, 26, 16]],
  [[46, 104, 28], [88, 108, 34], [134, 106, 32], [176, 102, 26], [66, 78, 30], [110, 70, 38], [152, 78, 30], [90, 50, 26], [130, 50, 26]],
  [[70, 96, 20], [98, 98, 22], [126, 96, 20], [84, 80, 20], [112, 80, 22], [98, 64, 18]],
]

const coverPos = [
  { x: -32, y: -26 }, { x: 0, y: -30 }, { x: 32, y: -26 },
  { x: -42, y: -2 }, { x: -14, y: -6 }, { x: 14, y: 6 }, { x: 42, y: 2 },
  { x: -32, y: 26 }, { x: 0, y: 30 }, { x: 32, y: 26 },
  { x: -16, y: 14 }, { x: 16, y: -14 },
]

const scales = [1.3, 0.85, 1.5, 0.75, 1.15, 0.95, 1.35, 0.8, 1.2, 1.0, 1.45, 0.9]
const rots = [-9, 6, -4, 7, -6, 4, -8, 5, -3, 8, -7, 3]
// 每朵云的整体亮度：有亮有暗，画面才有层次
const brights = [1.0, 0.87, 0.96, 0.82, 1.0, 0.9, 0.85, 0.99, 0.83, 0.94, 1.0, 0.88]

const clouds = coverPos.map((c, i) => ({
  cover: { x: `${c.x}vw`, y: `${c.y}vh` },
  start: { x: `${c.x * 2.8}vw`, y: `${c.y * 2.8}vh` },
  balls: shapes[i % shapes.length],
  seed: i % 4,
  uid: i,
  scale: scales[i % scales.length],
  rotate: rots[i % rots.length],
  bright: brights[i % brights.length],
}))

function CloudShape({ balls, seed, uid }) {
  const clipId = `cloud-clip-${uid}`
  return (
    <svg viewBox="0 0 220 150" className="cloud-svg" aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          {balls.map((b, j) => (
            <circle key={j} cx={b[0]} cy={b[1]} r={b[2]} />
          ))}
        </clipPath>
      </defs>
      <g filter={`url(#cloud-rough-${seed})`}>
        {/* 主体：整朵云共享光源的球体明暗（描边走 CSS）*/}
        {balls.map((b, j) => (
          <circle key={j} cx={b[0]} cy={b[1]} r={b[2]} fill="url(#ball-grad)" />
        ))}
        {/* 每团底部的交叉排线暗部，裁在云轮廓内 */}
        <g clipPath={`url(#${clipId})`} opacity="0.5">
          {balls.map((b, j) => (
            <circle key={j} cx={b[0] + b[2] * 0.14} cy={b[1] + b[2] * 0.5} r={b[2] * 0.92} fill="url(#hatch)" stroke="none" />
          ))}
        </g>
        {/* 受光侧高光（左上），裁在云轮廓内 */}
        <g clipPath={`url(#${clipId})`}>
          <rect x="0" y="0" width="220" height="150" fill="url(#highlight)" stroke="none" />
        </g>
      </g>
    </svg>
  )
}

function CloudTransition() {
  const { phase, handleCovered, handleRevealed } = useTransition()
  const covering = phase === 'covering'
  const active = phase !== 'idle'

  return (
    <div className={`cloud-layer ${active ? 'is-active' : ''}`}>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          {/* 整朵云共享光源：左上受光、右下转暗 */}
          <radialGradient id="ball-grad" cx="72" cy="42" r="165" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.42" stopColor="#eff0f5" />
            <stop offset="0.75" stopColor="#dadae6" />
            <stop offset="1" stopColor="#c0c0d2" />
          </radialGradient>
          {/* 受光侧高光 */}
          <radialGradient id="highlight" cx="64" cy="34" r="88" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.28" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          {/* 交叉排线（cross-hatch）暗部 */}
          <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M0,8 L8,0" stroke="#6a6a77" strokeWidth="0.9" />
            <path d="M0,0 L8,8" stroke="#6a6a77" strokeWidth="0.7" opacity="0.6" />
          </pattern>
          {[0, 1, 2, 3].map((s) => (
            <filter id={`cloud-rough-${s}`} key={s}>
              <feTurbulence type="fractalNoise" baseFrequency="0.012 0.016" numOctaves="3" seed={s * 3 + 1} result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" />
            </filter>
          ))}
        </defs>
      </svg>

      {/* 白色补底：兜底填缝，确保完全覆盖时不露空 */}
      <motion.div
        className="cloud-fill"
        initial={{ opacity: 0 }}
        animate={{ opacity: covering ? 1 : 0 }}
        transition={{ duration: 0.55, ease: 'easeInOut', delay: covering ? 0.35 : 0 }}
      />

      {clouds.map((c, i) => (
        <motion.div
          key={i}
          className="cloud-puff"
          style={{ filter: `brightness(${c.bright})` }}
          initial={{ x: c.start.x, y: c.start.y, scale: c.scale * 0.5, opacity: 0, rotate: c.rotate }}
          animate={
            covering
              ? { x: c.cover.x, y: c.cover.y, scale: c.scale, opacity: 1, rotate: c.rotate * 0.3 }
              : { x: c.start.x, y: c.start.y, scale: c.scale * 0.5, opacity: 0, rotate: c.rotate }
          }
          transition={{ duration: 0.9, ease: 'easeInOut' }}
          onAnimationComplete={() => {
            if (i !== 0) return
            if (phase === 'covering') handleCovered()
            if (phase === 'revealing') handleRevealed()
          }}
        >
          <CloudShape balls={c.balls} seed={c.seed} uid={c.uid} />
        </motion.div>
      ))}
    </div>
  )
}

export default CloudTransition
