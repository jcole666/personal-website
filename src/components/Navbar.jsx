import { NavLink, useLocation } from 'react-router-dom'
import { Button } from 'animal-island-ui'
import { useTransition } from '../context/TransitionContext.jsx'
import { useEditMode } from '../context/EditModeContext.jsx'
import TransitionLink from './TransitionLink.jsx'
import { getNavTheme, navThemeVars } from '../data/navTheme.js'
import { siteNav } from '../data/siteNav.js'

/** 经历分享页的导航项用的是动森 UI 的按钮组件，而不是普通文字链接 */
const ISLAND_WORLD = '/experience'

function Navbar() {
  const { startTransition } = useTransition()
  const { pathname } = useLocation()
  const { editMode } = useEditMode()

  // 主题配置来自 src/data/navTheme.js —— 全站唯一一份，改导航配色只需要改那张表
  const theme = getNavTheme(pathname)
  const isIslandWorld = pathname === ISLAND_WORLD

  const go = (to) => (e) => {
    e.preventDefault()
    startTransition(to)
  }

  return (
    // 主题以 CSS 自定义属性注入，具体样式统一写在 common.css 的导航基础层里
    <nav className="navbar" style={navThemeVars(theme)}>
      <div className="nav-inner">
        <TransitionLink to="/" className="nav-logo">
          流前
          <span className="nav-logo-tag">{theme.tag}</span>
        </TransitionLink>

        <ul className="nav-links">
          {siteNav.map((item) => (
            <li key={item.to}>
              {isIslandWorld ? (
                <Button
                  type="default"
                  size="small"
                  className={
                    pathname === item.to
                      ? 'nav-world-btn nav-world-btn--active'
                      : 'nav-world-btn'
                  }
                  onClick={() => startTransition(item.to)}
                >
                  {item.label}
                </Button>
              ) : (
                <NavLink to={item.to} onClick={go(item.to)}>
                  {item.label}
                </NavLink>
              )}
            </li>
          ))}
        </ul>

        {editMode && (
          <NavLink to="/admin" className="nav-admin-link" onClick={go('/admin')}>
            ✎ 后台
          </NavLink>
        )}
      </div>
    </nav>
  )
}

export default Navbar
