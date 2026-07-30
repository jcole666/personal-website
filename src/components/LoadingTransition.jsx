import { useState, useEffect, useRef } from 'react'
import { Loading } from 'animal-island-ui'
import { useTransition } from '../context/TransitionContext.jsx'

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
      // ① 关幕：四周向中间变黑（CSS clip-path 动画，~1.2s）
      setStep('closing')
      const t1 = setTimeout(() => {
        // ② 黑底 + 小岛插画停留
        setStep('showing')
        const t2 = setTimeout(() => {
          handleCovered() // 切页 → phase 变为 'revealing'
        }, 700)
        return () => clearTimeout(t2)
      }, 1200)
      return () => clearTimeout(t1)
    }

    if (phase === 'revealing') {
      // ③ 开幕：Loading 自带的中心透明圆扩散
      setStep('opening')
      const timer = setTimeout(() => {
        handleRevealed()
        setStep(null)
      }, durationRef.current + 300)
      return () => clearTimeout(timer)
    }
  }, [phase])

  if (phase === 'idle' && step === null) return null

  return (
    <>
      {/* 阶段一：关幕动画 — 用 mask 做四周→中心收拢 */}
      {step === 'closing' && (
        <div className="transition-curtain transition-curtain--closing" />
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
