import { Link } from 'react-router-dom'
import { useTransition } from '../context/TransitionContext.jsx'

// 一个「会触发云朵转场」的链接：外表是普通 Link，点击时拦掉默认跳转、改走云朵转场
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
