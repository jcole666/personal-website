import { useRef, useEffect } from 'react'

/**
 * 黑胶唱机 — 纯 SVG 绘制，页面顶部的氛围装饰
 *
 * 之前是 CSS 拼的「绿色方块 + 黑圆 + 一根棍」，太粗糙。改成 SVG 手绘：
 *   底座（plinth）→ 转盘槽 → 转盘 → 黑胶 → 唱臂（配重 / 臂管 / 唱头 / 唱针）
 *   → 转速键 + 电源灯 + 转轴
 * 唱片本身仍在转（12s/圈），只让「黑胶 + 中心标」这一组转，底座和唱臂不动。
 *
 * ⚠️ SVG 里旋转要显式给 transform-origin，否则会绕整个 viewBox 转。
 */

const CX = 170 // 转盘圆心
const CY = 185
const RECORD_R = 92

/* 唱片纹路：一圈圈同心圆，靠近外缘更密（模拟真实黑胶） */
function grooves() {
  const out = []
  for (let r = RECORD_R - 4; r > 34; r -= 3.2) {
    // 每隔几圈来一条稍亮的，做出「分组」的层次
    const bright = Math.round((RECORD_R - 4 - r) / 3.2) % 4 === 0
    out.push(
      <circle
        key={r}
        cx={CX}
        cy={CY}
        r={r}
        fill="none"
        stroke={bright ? 'rgba(150,148,160,0.20)' : 'rgba(110,108,120,0.12)'}
        strokeWidth="1"
      />,
    )
  }
  return out
}

function Turntable({ size = 360 }) {
  const recordRef = useRef(null)
  const startedRef = useRef(false)

  useEffect(() => {
    const el = recordRef.current
    if (!el || startedRef.current) return
    startedRef.current = true

    // 随机初始角度，避免刷新后每次都从同一个位置开始
    const startAngle = Math.random() * 360
    el.style.transform = `rotate(${startAngle}deg)`
    el.style.transition = 'none'

    requestAnimationFrame(() => {
      el.style.transition = ''
      el.style.animation = 'turntable-spin 12s linear infinite'
    })
  }, [])

  return (
    <svg
      className="turntable-svg"
      viewBox="0 0 420 340"
      width={size}
      height={size * (340 / 420)}
      role="img"
      aria-label="黑胶唱机"
    >
      <defs>
        <linearGradient id="tt-plinth" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor="#3a3a44" />
          <stop offset="45%" stopColor="#23232b" />
          <stop offset="100%" stopColor="#141419" />
        </linearGradient>
        <linearGradient id="tt-platter" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#2b2b33" />
          <stop offset="100%" stopColor="#101014" />
        </linearGradient>
        <linearGradient id="tt-arm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d9d9e0" />
          <stop offset="55%" stopColor="#8e8e99" />
          <stop offset="100%" stopColor="#5a5a63" />
        </linearGradient>
        <radialGradient id="tt-sheen" cx="0.35" cy="0.28" r="0.75">
          <stop offset="0%" stopColor="rgba(255,255,255,0.16)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <filter id="tt-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="4" dy="5" stdDeviation="3" floodColor="#000" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* ── 底座 ── */}
      <rect x="18" y="58" width="384" height="256" rx="12" fill="url(#tt-plinth)" stroke="#000" strokeWidth="4" filter="url(#tt-shadow)" />
      {/* 底座顶面高光 */}
      <rect x="18" y="58" width="384" height="10" rx="5" fill="rgba(255,255,255,0.07)" />

      {/* ── 转盘槽 ── */}
      <circle cx={CX} cy={CY} r={RECORD_R + 12} fill="#0b0b0e" stroke="#000" strokeWidth="3" />
      {/* 转盘侧面厚度（右下偏移一圈，做出立体感） */}
      <circle cx={CX + 3} cy={CY + 4} r={RECORD_R + 6} fill="#26262e" />
      <circle cx={CX} cy={CY} r={RECORD_R + 6} fill="url(#tt-platter)" />

      {/* ── 黑胶（会转的一组） ── */}
      <g
        ref={recordRef}
        style={{ transformOrigin: `${CX}px ${CY}px` }}
      >
        <circle cx={CX} cy={CY} r={RECORD_R} fill="#08080a" />
        {grooves()}
        {/* 唱片边缘的一圈反光 */}
        <circle cx={CX} cy={CY} r={RECORD_R - 1} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1.5" />
        {/* 中心标 */}
        <circle cx={CX} cy={CY} r="34" fill="#ff2d78" stroke="#000" strokeWidth="2" />
        <circle cx={CX} cy={CY} r="34" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
        <text
          x={CX}
          y={CY + 5}
          textAnchor="middle"
          fontSize="13"
          fontWeight="900"
          fill="#ffffff"
          style={{ fontFamily: "'Noto Sans SC', sans-serif", letterSpacing: '0.04em' }}
        >
          流前音乐
        </text>
        {/* 转轴 */}
        <circle cx={CX} cy={CY} r="4" fill="#e6e6ec" stroke="#000" strokeWidth="1.5" />
      </g>

      {/* 唱片表面的斜向反光（不跟着转，像固定的灯光） */}
      <ellipse cx={CX - 26} cy={CY - 34} rx="52" ry="34" fill="url(#tt-sheen)" transform={`rotate(-28 ${CX} ${CY})`} />

      {/* ── 唱臂 ── */}
      <g transform="rotate(-17 340 110)">
        {/* 臂管 */}
        <rect x="214" y="106" width="126" height="7" rx="3.5" fill="url(#tt-arm)" stroke="#000" strokeWidth="1.5" />
        {/* 唱头（前端的小方块） */}
        <rect x="206" y="101" width="26" height="17" rx="3" fill="#3d3d47" stroke="#000" strokeWidth="2" />
        {/* 唱针 */}
        <line x1="212" y1="118" x2="209" y2="127" stroke="#c9c9d2" strokeWidth="2" strokeLinecap="round" />
        <circle cx="209" cy="128" r="2" fill="#ff2d78" />
      </g>

      {/* 唱臂支点 */}
      <circle cx="340" cy="110" r="24" fill="#2e2e37" stroke="#000" strokeWidth="3" />
      <circle cx="340" cy="110" r="15" fill="url(#tt-arm)" stroke="#000" strokeWidth="1.5" />
      <circle cx="340" cy="110" r="5" fill="#1a1a1f" />
      {/* 配重（支点右后方） */}
      <rect x="356" y="94" width="30" height="32" rx="7" fill="#3d3d47" stroke="#000" strokeWidth="2.5" />
      <rect x="362" y="100" width="18" height="20" rx="4" fill="rgba(255,255,255,0.10)" />

      {/* 唱臂托架 */}
      <rect x="296" y="240" width="18" height="26" rx="4" fill="#3d3d47" stroke="#000" strokeWidth="2" />

      {/* ── 控制区：转速键 + 电源灯 ── */}
      <rect x="300" y="278" width="42" height="20" rx="4" fill="#1b1b21" stroke="#000" strokeWidth="2" />
      <text x="321" y="292" textAnchor="middle" fontSize="10" fontWeight="700" fill="#c9c9d2" style={{ fontFamily: 'monospace' }}>33</text>
      <rect x="350" y="278" width="42" height="20" rx="4" fill="#1b1b21" stroke="#000" strokeWidth="2" />
      <text x="371" y="292" textAnchor="middle" fontSize="10" fontWeight="700" fill="#6a6a74" style={{ fontFamily: 'monospace' }}>45</text>
      {/* 电源灯 */}
      <circle cx="36" cy="288" r="5" fill="#ff2d78" />
      <circle cx="36" cy="288" r="9" fill="none" stroke="rgba(255,45,120,0.35)" strokeWidth="2" />
      <text x="52" y="292" fontSize="9" fill="#8a8a94" style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}>POWER</text>
    </svg>
  )
}

export default Turntable

/**
 * 专辑黑胶滑出组件
 * 包在专辑卡片上：hover 时封面左移，黑胶从右侧滑出
 */
export function VinylDisc({ size = 100 }) {
  const half = size / 2

  return (
    <div
      className="vinyl-disc"
      style={{ width: size, height: size }}
    >
      <div className="vinyl-disc-grooves" />
      <div
        className="vinyl-disc-label"
        style={{ width: half * 0.55, height: half * 0.55 }}
      >
        <span className="vinyl-disc-label-text">33 ⅓ RPM</span>
      </div>
    </div>
  )
}
