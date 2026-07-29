import { useLocation } from 'react-router-dom'

function Footer() {
  const { pathname } = useLocation()
  const isAnimalWorld = pathname === '/experience'
  const isReadingWorld = pathname === '/reading'
  const isMusicWorld = pathname === '/music'
  const isMoviesWorld = pathname === '/movies'

  // 有独立页脚的板块，全局 Footer 不渲染
  if (isAnimalWorld || isReadingWorld || isMusicWorld || isMoviesWorld) return null

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">流前</span>
          <p className="footer-tagline">一个正在建造的个人世界。</p>
        </div>
        <nav className="footer-links">
          <a href="https://github.com/jcole666" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="mailto:me@example.com">Email</a>
        </nav>
      </div>
      <div className="footer-bottom">
        <span className="footer-copy">© 2026 流前 · 用 React 手工打造</span>
        <button className="footer-top" onClick={scrollToTop}>
          回到顶部 ↑
        </button>
      </div>
    </footer>
  )
}

export default Footer
