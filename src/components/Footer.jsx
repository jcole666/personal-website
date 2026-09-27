import { useLocation } from 'react-router-dom'
import SiteFooter from './SiteFooter.jsx'

/**
 * 首页与后台的页脚
 *
 * 8 个板块页面各自渲染自己那份 <SiteFooter path="/xxx" /> —— 因为页脚位置要在
 * 各页自己的容器里（比如经历页的页脚后面还跟着一条海浪），所以这里只管首页和后台。
 * 之前这里列了 8 个 isXxxWorld 判断，但每个的作用都只是 return null。
 */
function Footer() {
  const { pathname } = useLocation()

  const isGlobalFooter = pathname === '/' || pathname.startsWith('/admin')
  if (!isGlobalFooter) return null

  return <SiteFooter path="/" />
}

export default Footer
