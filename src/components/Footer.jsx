import { useLocation } from 'react-router-dom'

/**
 * 全局页脚
 *
 * 只在首页和后台出现 —— 8 个板块页面都有各自写在页面组件里的专属页脚
 * （比如 .movies-footer / .food-footer / .experience-footer）。
 *
 * 之前这里列了 8 个 isXxxWorld 布尔判断，但每一个的作用都只是 return null，
 * 合起来等价于"只在首页和后台显示"，所以直接写成这一个条件。
 */
function Footer() {
  const { pathname } = useLocation()

  const isGlobalFooter = pathname === '/' || pathname.startsWith('/admin')
  if (!isGlobalFooter) return null

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">流前</span>
          <a className="footer-tagline" href="mailto:lq2107668126@gmail.com">
            email：lq2107668126@gmail.com
          </a>
        </div>
        <nav className="footer-links">
          <a href="https://github.com/jcole666" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </nav>
      </div>
      <div className="footer-bottom">
        <button className="footer-top" onClick={scrollToTop}>
          回到顶部 ↑
        </button>
      </div>
    </footer>
  )
}

export default Footer
