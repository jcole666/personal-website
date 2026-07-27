import { NavLink } from 'react-router-dom'
import { useTransition } from '../context/TransitionContext.jsx'
import TransitionLink from './TransitionLink.jsx'

const navItems = [
  { to: '/projects', label: '代码开发' },
  { to: '/coursework', label: '课程作业' },
  { to: '/essays', label: '随笔' },
  { to: '/experience', label: '经历分享' },
  { to: '/reading', label: '读书' },
  { to: '/music', label: '音乐' },
  { to: '/movies', label: '电影' },
  { to: '/milktea', label: '奶茶打卡' },
]

function Navbar() {
  const { startTransition } = useTransition()

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <TransitionLink to="/" className="nav-logo">
          流前
          <span className="nav-logo-tag">PRIVATE GALLERY</span>
        </TransitionLink>
        <ul className="nav-links">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={(e) => {
                  e.preventDefault()
                  startTransition(item.to)
                }}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
