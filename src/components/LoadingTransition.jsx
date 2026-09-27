import { useState, useEffect, useRef } from 'react'
import { Loading } from 'animal-island-ui'
import { useTransition } from '../context/TransitionContext.jsx'

/**
 * 转场三个阶段的时长（毫秒）—— 想调节快慢改这里就行
 *
 * ① 黑幕从四周向中心收拢。必须与 common.css 里 curtain-close 的动画时长一致，
 *    否则 CSS 动画还没播完就被切到下一阶段。
 * ② 黑底 + 右下角小岛插画停留。这是纯等待，给太长会很拖。
 * ③ 圆圈扩散是 <Loading> 组件自带的（时长由它内部公式 hypot/2+50 ÷ 1500 算出，
 *    改不了），这里只是扩散播完后再多留一点缓冲才收尾。
 */
const CURTAIN_MS = 800
const ISLAND_MS = 700
const REVEAL_PAD_MS = 200

function LoadingTransition() {
  const { phase, handleCovered, handleRevealed } = useTransition()
  // step 控制阶段：null | 'closing' | 'showing' | 'opening'
  const [step, setStep] = useState(null)
  const durationRef = useRef(1000)

  // 根据视口尺寸预计算扩散动画时长（与 Loading 组件内部公式一致）
  useEffect(() => {
    const w = window.innerWidth
    const h = window.innerHeight
    const d = Math.ceil(Math.hypot(w, h) / 2) + 50
    durationRef.current = Math.max(0.1, d / 1500) * 1000
  }, [])

  useEffect(() => {
    if (phase === 'covering') {
      // ① 关幕：黑幕从四周向中间收拢（CSS mask 动画）
      setStep('closing')
      const t1 = setTimeout(() => {
        // ② 黑底 + 小岛插画停留
        setStep('showing')
        const t2 = setTimeout(() => {
          handleCovered() // 切页 → phase 变为 'revealing'
        }, ISLAND_MS)
        return () => clearTimeout(t2)
      }, CURTAIN_MS)
      return () => clearTimeout(t1)
    }

    if (phase === 'revealing') {
      // ③ 开幕：Loading 自带的中心透明圆扩散
      setStep('opening')
      const timer = setTimeout(() => {
        handleRevealed()
        setStep(null)
      }, durationRef.current + REVEAL_PAD_MS)
      return () => clearTimeout(timer)
    }
  }, [phase])

  if (phase === 'idle' && step === null) return null

  return (
    <>
      {/* 阶段一：关幕动画 — 用 mask 做四周→中心收拢
          时长从 CURTAIN_MS 注入 CSS，保证动画和下面的 setTimeout 永远同步 */}
      {step === 'closing' && (
        <div
          className="transition-curtain transition-curtain--closing"
          style={{ '--curtain-ms': `${CURTAIN_MS}ms` }}
        />
      )}

      {/* 阶段二&三：Loading 组件负责黑底+小岛+中心扩散开场 */}
      {(step === 'showing' || step === 'opening') && (
        <Loading
          active={step === 'showing'}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            height: '100%',
          }}
        />
      )}
    </>
  )
}

export default LoadingTransition
