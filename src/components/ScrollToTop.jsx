import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * 路由切换时回到页面顶部
 *
 * 单页应用不会重新加载文档，浏览器会**保留上一个页面的滚动位置** ——
 * 所以从首页滚到底部点进某个世界，新页面会停在中段而不是最上面。
 *
 * 用 useLayoutEffect 而不是 useEffect：前者在浏览器绘制之前执行，
 * 避免用户看到「先在新页面中段渲染一帧、再跳到顶部」的闪烁。
 *
 * 时机上也不用担心被看见：本站的跳转都走 LoadingTransition 黑幕，
 * 路由切换发生在幕布完全关闭的时候，滚动归零是在黑屏底下完成的。
 */
function ScrollToTop() {
  const { pathname } = useLocation()

  /* 关掉浏览器的自动滚动恢复 —— 刷新 / 后退时浏览器会把上次的滚动位置还原，
     表现就是「一进来不在最上面，而是停在页面中段」。这是这类问题的常见元凶。 */
  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default ScrollToTop
