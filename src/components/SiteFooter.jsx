import { getFooterTheme, footerThemeVars } from '../data/footerTheme.js'
import './SiteFooter.css'

/** 联系方式只在这里写一次 —— 之前 8 个页脚写的是假的 me@example.com */
const GITHUB_URL = 'https://github.com/jcole666'
const EMAIL = 'lq2107668126@gmail.com'
const COPYRIGHT = '© 2026 流前'

/**
 * 全站统一页脚
 *
 * 骨架固定：品牌区（品牌名 + 副标签） / 链接区（GitHub + Email） / 底部行（版权 + 回到顶部）
 * 每页的个性由 src/data/footerTheme.js 提供：文案、配色、字体、内容宽度
 *
 * 用法：<SiteFooter path="/movies" />
 */
export default function SiteFooter({ path }) {
  const theme = getFooterTheme(path)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="site-footer" style={footerThemeVars(theme)}>
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <span className="site-footer-logo">{theme.brand}</span>
          <span className="site-footer-tag">{theme.tag}</span>
        </div>

        <nav className="site-footer-links">
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={`mailto:${EMAIL}`}>Email</a>
        </nav>
      </div>

      <div className="site-footer-bottom">
        <span className="site-footer-copy">{COPYRIGHT}</span>
        <button type="button" className="site-footer-top" onClick={scrollToTop}>
          回到顶部 ↑
        </button>
      </div>
    </footer>
  )
}
