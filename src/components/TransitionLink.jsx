import { Link } from 'react-router-dom'
import { useTransition } from '../context/TransitionContext.jsx'

// 一个「会触发全站转场」的链接：外表是普通 Link，点击时拦掉默认跳转，
// 改走 LoadingTransition 的黑幕转场（黑幕收拢 → 小岛停留 → 圆圈扩散）
function TransitionLink({ to, children, ...props }) {
  const { startTransition } = useTransition()
  return (
    <Link
      to={to}
      {...props}
      onClick={(e) => {
        e.preventDefault()
        startTransition(to)
      }}
    >
      {children}
    </Link>
  )
}

export default TransitionLink
