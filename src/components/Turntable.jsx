import { useRef, useEffect } from 'react'

/**
 * 黑胶转盘 — CSS 纯绘制，页面顶部氛围装饰
 *
 * 结构：
 *   - 后方光晕（暖色径向渐变）
 *   - 黑胶圆盘（repeating-radial-gradient 纹路）
 *   - 中心标签（小圆 + 文字占位）
 *   - 唱臂（从右侧伸入，有一个微小的初始角度）
 *
 * 动画：
 *   - 唱片匀速旋转（12s/圈），用伪随机微调模拟物理抖动
 */

/* 纹路段落的 offset 预设——模拟真实黑胶的"分组"感（空白间隔） */
const GROOVE_OFFSETS = [
  0.02, 0.05, 0.09, 0.14, 0.15, 0.16, 0.21, 0.26, 0.27, 0.28,
  0.33, 0.38, 0.39, 0.40, 0.45, 0.50, 0.51, 0.52, 0.57, 0.62,
  0.63, 0.64, 0.69, 0.74, 0.75, 0.76, 0.81, 0.86, 0.87, 0.88,
  0.93, 0.98,
]

function buildGrooveGradient() {
  const stops = ['0px']
  for (const off of GROOVE_OFFSETS) {
    const pos = 30 + off * 230 // 从 30px 到 260px
    stops.push(
      `transparent ${pos - 0.6}px`,
      `rgba(80, 78, 85, 0.3) ${pos - 0.2}px`,
      `rgba(50, 48, 55, 0.5) ${pos}px`,
      `rgba(80, 78, 85, 0.3) ${pos + 0.2}px`,
      `transparent ${pos + 0.6}px`
    )
  }
  return `repeating-radial-gradient(circle, ${stops.join(', ')})`
}

function Turntable({ size = 320 }) {
  const recordRef = useRef(null)
  const startedRef = useRef(false)

  useEffect(() => {
    const el = recordRef.current
    if (!el || startedRef.current) return
    startedRef.current = true

    // 给唱片一个初始随机角度，然后持续旋转
    const startAngle = Math.random() * 360
    el.style.transform = `rotate(${startAngle}deg)`
    el.style.transition = 'none'

    requestAnimationFrame(() => {
      el.style.transition = ''
      el.style.animation = `turntable-spin 12s linear infinite`
    })
  }, [])

  return (
    <div
      className="turntable-wrapper"
      style={{ width: size, height: size + 80 }}
    >
      {/* 光晕层 */}
      <div className="turntable-glow" />

      {/* 黑胶圆盘 */}
      <div className="turntable-record" ref={recordRef}>
        {/* 纹路层 */}
        <div
          className="turntable-grooves"
          style={{ background: buildGrooveGradient() }}
        />

        {/* 中心标签 */}
        <div className="turntable-label">
          <span className="turntable-label-text">流前音乐</span>
        </div>
      </div>

      {/* 唱臂 */}
      <div className="turntable-tonearm">
        <div className="turntable-tonearm-base" />
        <div className="turntable-tonearm-shaft" />
        <div className="turntable-tonearm-head" />
      </div>
    </div>
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
