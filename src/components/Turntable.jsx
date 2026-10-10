import { useRef, useEffect } from 'react'

/**
 * 黑胶唱机 — 纯 SVG 绘制，页面顶部的氛围装饰
 *
 * 结构（自下而上）：
 *   脚垫 → 底座（plinth）→ 转盘槽 → 转盘（mat + 频闪点）→ 黑胶
 *   → 唱臂（配重 / 臂管 / 防滑 / 抬臂杆 / 唱头 / 唱针）→ 品牌铭牌 + 转速键 + 指示灯
 * 唱片本身仍在转（12s/圈），只让「黑胶 + 中心标」这一组转，底座和唱臂不动。
 *
 * ⚠️ SVG 里旋转要显式给 transform-origin，否则会绕整个 viewBox 转。
 */

const CX = 168 // 转盘圆心
const CY = 184
const RECORD_R = 90
const PLATTER_R = RECORD_R + 9

/* 唱片纹路：一圈圈同心圆，靠近外缘更密（模拟真实黑胶） */
function grooves() {
  const out = []
  for (let r = RECORD_R - 3; r > 33; r -= 2.9) {
    const i = Math.round((RECORD_R - 3 - r) / 2.9)
    const bright = i % 5 === 0
    out.push(
      <circle
        key={r}
        cx={CX}
        cy={CY}
        r={r}
        fill="none"
        stroke={bright ? 'rgba(168,166,180,0.22)' : 'rgba(104,102,116,0.13)'}
        strokeWidth="1"
      />,
    )
  }
  return out
}

/* 转盘边缘的频闪点：一圈小刻度，用来判断转速 */
function strobeDots() {
  const out = []
  const n = 44
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const r1 = PLATTER_R - 3
    const r2 = PLATTER_R - 0.5
    out.push(
      <line
        key={i}
        x1={CX + Math.cos(a) * r1}
        y1={CY + Math.sin(a) * r1}
        x2={CX + Math.cos(a) * r2}
        y2={CY + Math.sin(a) * r2}
        stroke={i % 2 === 0 ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)'}
        strokeWidth="1.2"
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
      viewBox="0 0 420 350"
      width={size}
      height={size * (350 / 420)}
      role="img"
      aria-label="黑胶唱机"
    >
      <defs>
        {/* 底座：上亮下暗的金属/木壳质感 */}
        <linearGradient id="tt-plinth" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#43434f" />
          <stop offset="42%" stopColor="#26262f" />
          <stop offset="100%" stopColor="#131317" />
        </linearGradient>
        <linearGradient id="tt-plinth-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.10)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        {/* 转盘（金属拉丝） */}
        <linearGradient id="tt-platter" x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#3a3a45" />
          <stop offset="55%" stopColor="#1c1c22" />
          <stop offset="100%" stopColor="#0e0e12" />
        </linearGradient>
        {/* 唱臂金属杆 */}
        <linearGradient id="tt-arm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e2e2ea" />
          <stop offset="45%" stopColor="#9a9aa6" />
          <stop offset="100%" stopColor="#565660" />
        </linearGradient>
        {/* 唱头铝壳 */}
        <linearGradient id="tt-headshell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b9b9c4" />
          <stop offset="100%" stopColor="#5c5c66" />
        </linearGradient>
        {/* 黑胶表面的固定灯光反光 */}
        <radialGradient id="tt-sheen" cx="0.35" cy="0.28" r="0.75">
          <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="55%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        {/* 转盘垫（绒面） */}
        <radialGradient id="tt-mat" cx="0.5" cy="0.45" r="0.62">
          <stop offset="0%" stopColor="#232329" />
          <stop offset="100%" stopColor="#0c0c10" />
        </radialGradient>
        <filter id="tt-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="4" dy="6" stdDeviation="4" floodColor="#000" floodOpacity="0.5" />
        </filter>
        <filter id="tt-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="1" dy="2" stdDeviation="1.4" floodColor="#000" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* ── 脚垫（底座四角下方） ── */}
      <rect x="34" y="306" width="26" height="12" rx="3" fill="#0a0a0d" />
      <rect x="360" y="306" width="26" height="12" rx="3" fill="#0a0a0d" />
      <rect x="140" y="310" width="140" height="9" rx="4" fill="#08080a" opacity="0.85" />

      {/* ── 底座 ── */}
      <rect x="16" y="56" width="388" height="252" rx="13" fill="url(#tt-plinth)" stroke="#000" strokeWidth="4" filter="url(#tt-shadow)" />
      {/* 顶面高光 */}
      <rect x="16" y="56" width="388" height="12" rx="6" fill="url(#tt-plinth-top)" />
      {/* 面板接缝 */}
      <line x1="16" y1="70" x2="404" y2="70" stroke="rgba(0,0,0,0.55)" strokeWidth="1.5" />

      {/* ── 转盘槽 ── */}
      <circle cx={CX} cy={CY} r={PLATTER_R + 11} fill="#0a0a0d" stroke="#000" strokeWidth="3" />
      {/* 转盘侧面厚度 */}
      <circle cx={CX + 3} cy={CY + 4} r={PLATTER_R + 5} fill="#242430" />
      {/* 转盘本体 */}
      <circle cx={CX} cy={CY} r={PLATTER_R + 5} fill="url(#tt-platter)" />
      {/* 转盘垫 */}
      <circle cx={CX} cy={CY} r={PLATTER_R} fill="url(#tt-mat)" />
      {strobeDots()}

      {/* ── 黑胶（会转的一组） ── */}
      <g ref={recordRef} style={{ transformOrigin: `${CX}px ${CY}px` }}>
        <circle cx={CX} cy={CY} r={RECORD_R} fill="#08080a" />
        {grooves()}
        {/* 唱片边缘反光 */}
        <circle cx={CX} cy={CY} r={RECORD_R - 1} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1.5" />
        <circle cx={CX} cy={CY} r={RECORD_R - 5} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        {/* 中心标 */}
        <circle cx={CX} cy={CY} r="33" fill="#ff2d78" stroke="#000" strokeWidth="2" />
        <circle cx={CX} cy={CY} r="33" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
        <circle cx={CX} cy={CY} r="28" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
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
        <circle cx={CX} cy={CY} r="4.2" fill="#e6e6ec" stroke="#000" strokeWidth="1.5" />
      </g>

      {/* 唱片表面固定反光（不跟转） */}
      <ellipse cx={CX - 24} cy={CY - 32} rx="50" ry="33" fill="url(#tt-sheen)" transform={`rotate(-28 ${CX} ${CY})`} />

      {/* ── 唱臂 ── */}
      <g transform="rotate(-17 342 108)" filter="url(#tt-soft)">
        {/* 臂管（略带锥度） */}
        <path d="M 224 104 L 344 108 L 344 115 L 224 111 Z" fill="url(#tt-arm)" stroke="#000" strokeWidth="1.4" />
        {/* 臂管上的走线 */}
        <line x1="232" y1="108" x2="338" y2="111" stroke="rgba(0,0,0,0.35)" strokeWidth="1" />
        {/* 唱头壳 */}
        <rect x="204" y="99" width="30" height="19" rx="3" fill="url(#tt-headshell)" stroke="#000" strokeWidth="1.8" />
        <rect x="208" y="103" width="22" height="5" rx="1.5" fill="rgba(255,255,255,0.18)" />
        {/* 唱针 */}
        <line x1="210" y1="118" x2="206" y2="128" stroke="#d2d2dc" strokeWidth="2" strokeLinecap="round" />
        <circle cx="206" cy="129" r="2.2" fill="#ff2d78" />
      </g>

      {/* 唱臂支点 */}
      <circle cx="342" cy="108" r="25" fill="#2c2c36" stroke="#000" strokeWidth="3" />
      <circle cx="342" cy="108" r="16" fill="url(#tt-arm)" stroke="#000" strokeWidth="1.5" />
      <circle cx="342" cy="108" r="5" fill="#16161b" />
      {/* 配重（支点右后） */}
      <rect x="358" y="92" width="32" height="34" rx="8" fill="#3d3d47" stroke="#000" strokeWidth="2.5" />
      <rect x="364" y="98" width="20" height="22" rx="4" fill="rgba(255,255,255,0.10)" />
      {/* 防滑调节盘 */}
      <circle cx="374" cy="140" r="9" fill="#2c2c36" stroke="#000" strokeWidth="2" />
      <circle cx="374" cy="140" r="3" fill="#ff9500" />
      {/* 抬臂杆 */}
      <rect x="322" y="128" width="7" height="20" rx="3" fill="#c9c9d2" stroke="#000" strokeWidth="1.4" />

      {/* 唱臂托架 */}
      <rect x="292" y="236" width="18" height="28" rx="4" fill="#3d3d47" stroke="#000" strokeWidth="2" />
      <rect x="296" y="240" width="10" height="6" rx="2" fill="rgba(255,255,255,0.12)" />

      {/* ── 品牌铭牌（左下，避开转盘圆弧） ── */}
      <rect x="30" y="282" width="100" height="24" rx="4" fill="#101014" stroke="#000" strokeWidth="2" />
      <text x="80" y="298" textAnchor="middle" fontSize="9" fontWeight="800" fill="#cfcfd8" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.1em' }}>LIUQIAN TT-1</text>

      {/* ── 控制区：转速键 ── */}
      <rect x="292" y="276" width="44" height="22" rx="4" fill="#1b1b21" stroke="#000" strokeWidth="2" />
      <circle cx="303" cy="287" r="3" fill="#ff2d78" />
      <text x="319" y="291" textAnchor="middle" fontSize="10" fontWeight="700" fill="#dcdce4" style={{ fontFamily: 'monospace' }}>33</text>
      <rect x="344" y="276" width="44" height="22" rx="4" fill="#1b1b21" stroke="#000" strokeWidth="2" />
      <circle cx="355" cy="287" r="3" fill="#2b2b33" />
      <text x="371" y="291" textAnchor="middle" fontSize="10" fontWeight="700" fill="#6a6a74" style={{ fontFamily: 'monospace' }}>45</text>

      {/* 电源灯（挪到面板左上角，原来在左下和铭牌打架） */}
      <circle cx="38" cy="92" r="4.5" fill="#ff2d78" />
      <circle cx="38" cy="92" r="9" fill="none" stroke="rgba(255,45,120,0.32)" strokeWidth="2" />
      <text x="54" y="96" fontSize="9" fill="#8a8a94" style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}>POWER</text>
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
