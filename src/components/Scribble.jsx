/**
 * Scribble 手绘组件集合
 *
 * 封装 Rough.js，每个组件都是一个独立的 SVG 小部件。
 * 不是全局 Canvas，不影响页面布局流。
 *
 * 用法：
 *   <ScribbleDivider />
 *   <ScribbleUnderline>这段文字下面会有手绘波浪线</ScribbleUnderline>
 *   <ScribbleBorder><div>这个 div 会有手绘边框</div></ScribbleBorder>
 */

import { useRef, useEffect, useCallback, useState } from 'react'
import rough from 'roughjs/bundled/rough.esm.js'

/* ===== 工具函数：创建 Rough.js SVG 生成器 ===== */
function useRoughSVG() {
  const svgRef = useRef(null)
  const rcRef = useRef(null)

  const getRC = useCallback(() => {
    if (!rcRef.current && svgRef.current) {
      rcRef.current = rough.svg(svgRef.current)
    }
    return rcRef.current
  }, [])

  return { svgRef, getRC }
}

/**
 * 手绘分割线
 * 一条略带抖动感的水平线
 */
export function ScribbleDivider({ color = '#c4b5a0', width = '100%', className = '' }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const w = svg.clientWidth || 300
    const rc = rough.svg(svg)
    // 清除旧的
    svg.innerHTML = ''

    const line = rc.line(0, 6, w, 6, {
      roughness: 1.3,
      strokeWidth: 1.0,
      stroke: color,
    })
    svg.appendChild(line)
  }, [color])

  return (
    <div ref={containerRef} className={`scribble-divider ${className}`} style={{ width }}>
      <svg ref={svgRef} width="100%" height="14" style={{ display: 'block' }} />
    </div>
  )
}

/**
 * 手绘波浪下划线
 * 用在摘录的句子下方
 */
export function ScribbleUnderline({
  children,
  color = '#c4b5a0',
  className = '',
}) {
  const svgRef = useRef(null)
  const [svgWidth, setSvgWidth] = useState(200)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    // 用父元素宽度
    const parent = svg.parentElement
    if (parent) {
      setSvgWidth(parent.clientWidth || 200)
    }
  }, [children])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg || !svgWidth) return

    const rc = rough.svg(svg)
    svg.innerHTML = ''

    // 画一条不规则波浪线
    const points = []
    const segments = 8
    const segW = svgWidth / segments
    for (let i = 0; i <= segments; i++) {
      const x = i * segW
      // 正弦 + 随机偏移，模拟手抖
      const yBase = 10 + Math.sin(i * 1.2) * 3
      const yJitter = (Math.random() - 0.5) * 2
      points.push([x, yBase + yJitter])
    }

    const pathStr = points
      .map(([x, y], i) => {
        if (i === 0) return `M ${x} ${y}`
        const prev = points[i - 1]
        const cpx = (prev[0] + x) / 2
        return `Q ${cpx} ${prev[1] + 2} ${x} ${y}`
      })
      .join(' ')

    const curve = rc.curve(points, {
      roughness: 1.5,
      strokeWidth: 1.0,
      stroke: color,
    })
    svg.appendChild(curve)
  }, [svgWidth, color])

  return (
    <span className={`scribble-underline ${className}`}>
      {children}
      <svg ref={svgRef} width="100%" height="18" style={{ display: 'block' }} />
    </span>
  )
}

/**
 * 手绘边框容器
 * 给任意内容包一层不规则矩形框
 */
export function ScribbleBorder({
  children,
  color = '#c4b5a0',
  padding = 16,
  className = '',
}) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [size, setSize] = useState({ w: 300, h: 100 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSize({
          w: entry.contentRect.width,
          h: entry.contentRect.height,
        })
      }
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg || !size.w || !size.h) return

    const rc = rough.svg(svg)
    svg.innerHTML = ''

    const rect = rc.rectangle(2, 2, size.w - 4, size.h - 4, {
      roughness: 1.6,
      strokeWidth: 1.1,
      stroke: color,
      fill: 'none',
    })
    svg.appendChild(rect)
  }, [size, color])

  return (
    <div className={`scribble-border ${className}`} style={{ position: 'relative' }}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      />
      <div ref={containerRef} style={{ padding }}>
        {children}
      </div>
    </div>
  )
}

/**
 * 手绘进度条
 * 一条不规则线段 + 端点标记，表示阅读进度
 */
export function ScribbleProgress({
  progress = 0.35,
  color = '#c4b5a0',
  className = '',
}) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [w, setW] = useState(200)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    setW(el.clientWidth || 200)
  }, [])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg || !w) return

    const rc = rough.svg(svg)
    svg.innerHTML = ''

    const endX = Math.max(10, w * Math.min(Math.max(progress, 0), 1))
    const midX = endX * 0.55

    const points = [
      [4, 14],
      [midX * 0.4, 12],
      [midX, 16],
      [endX * 0.8, 13],
      [endX, 14],
    ]

    const line = rc.curve(points, {
      roughness: 1.4,
      strokeWidth: 1.5,
      stroke: color,
    })

    svg.appendChild(line)

    // 末端小圆点
    const dot = rc.circle(endX, 14, 5, {
      roughness: 0.8,
      strokeWidth: 1.2,
      stroke: color,
      fill: color,
      fillStyle: 'solid',
    })
    svg.appendChild(dot)

    // 起点小圆点
    const startDot = rc.circle(4, 14, 3.5, {
      roughness: 0.5,
      strokeWidth: 1,
      stroke: color,
      fill: '#faf7f2',
      fillStyle: 'solid',
    })
    svg.appendChild(startDot)
  }, [w, progress, color])

  return (
    <div ref={containerRef} className={`scribble-progress ${className}`} style={{ width: '100%' }}>
      <svg ref={svgRef} width="100%" height="28" style={{ display: 'block' }} />
    </div>
  )
}

/**
 * 手绘书签图标
 * 一个小小的手绘书签，作为页面结束标记
 */
export function ScribbleBookmark({ color = '#c4b5a0', className = '' }) {
  const svgRef = useRef(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const rc = rough.svg(svg)

    // 书签形状：上窄下宽的矩形 + 底部三角形
    const points = [
      [15, 4],
      [15, 36],
      [30, 26],
      [45, 36],
      [45, 4],
    ]

    const bookmark = rc.polygon(points, {
      roughness: 1.2,
      strokeWidth: 1.3,
      stroke: color,
      fill: '#faf7f2',
      fillStyle: 'solid',
    })
    svg.appendChild(bookmark)

    // 中间一根装饰线
    const midLine = rc.line(22, 18, 38, 18, {
      roughness: 0.8,
      strokeWidth: 0.7,
      stroke: color,
    })
    svg.appendChild(midLine)
  }, [color])

  return (
    <div className={`scribble-bookmark ${className}`} style={{ display: 'inline-block' }}>
      <svg
        ref={svgRef}
        width="60"
        height="44"
        viewBox="0 0 60 44"
        style={{ display: 'block' }}
      />
    </div>
  )
}
