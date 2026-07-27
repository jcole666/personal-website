import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const TransitionContext = createContext(null)

// 自定义 hook：任何组件里调用 useTransition() 就能拿到转场控制
export function useTransition() {
  return useContext(TransitionContext)
}

export function TransitionProvider({ children }) {
  const navigate = useNavigate()
  const [phase, setPhase] = useState('idle') // 'idle' | 'covering' | 'revealing'
  const [target, setTarget] = useState(null)

  // 卡片点击时调用：开始「覆盖」
  const startTransition = (to) => {
    if (phase !== 'idle') return // 转场进行中就忽略，防止重复触发
    setTarget(to)
    setPhase('covering')
  }

  // 覆盖动画播完：偷偷换页 + 开始「散开」
  const handleCovered = () => {
    if (target) navigate(target)
    setPhase('revealing')
  }

  // 散开动画播完：回到平静
  const handleRevealed = () => {
    setPhase('idle')
    setTarget(null)
  }

  return (
    <TransitionContext.Provider
      value={{ phase, startTransition, handleCovered, handleRevealed }}
    >
      {children}
    </TransitionContext.Provider>
  )
}
