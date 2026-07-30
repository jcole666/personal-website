import { NavLink, useLocation } from 'react-router-dom'
import { Button } from 'animal-island-ui'
import { useTransition } from '../context/TransitionContext.jsx'
import TransitionLink from './TransitionLink.jsx'

const navItems = [
  { to: '/projects', label: '代码开发' },
  { to: '/coursework', label: '课程作业' },
  { to: '/experience', label: '经历分享' },
  { to: '/reading', label: '读书' },
  { to: '/music', label: '音乐' },
  { to: '/movies', label: '电影' },
  { to: '/food', label: '市集' },
]

function Navbar() {
  const { startTransition } = useTransition()
  const { pathname } = useLocation()

  // 各板块独立导航栏主题
  const isAnimalWorld = pathname === '/experience'
  const isReadingWorld = pathname === '/reading'
  const isMusicWorld = pathname === '/music'
  const isMoviesWorld = pathname === '/movies'
  const isFoodWorld = pathname === '/food'

  let navbarTheme = ''
  if (isAnimalWorld) navbarTheme = ' navbar-animal'
  else if (isReadingWorld) navbarTheme = ' navbar-reading'
  else if (isMusicWorld) navbarTheme = ' navbar-music'
  else if (isMoviesWorld) navbarTheme = ' navbar-movies'
  else if (isFoodWorld) navbarTheme = ' navbar-food'

  return (
    <nav className={`navbar${navbarTheme}`}>
      <div className="nav-inner">
        <TransitionLink to="/" className="nav-logo">
          流前
          <span className="nav-logo-tag">
            {isAnimalWorld ? 'ISLAND JOURNAL' : isReadingWorld ? 'READING NOTES' : isMusicWorld ? 'LISTENING ROOM' : isMoviesWorld ? 'SCREENING ROOM' : isFoodWorld ? 'FOOD MARKET' : 'PRIVATE GALLERY'}
          </span>
        </TransitionLink>
        <ul className="nav-links">
          {navItems.map((item) => (
            <li key={item.to}>
              {isAnimalWorld ? (
                <Button
                  type="default"
                  size="small"
                  onClick={() => startTransition(item.to)}
                >
                  {item.label}
                </Button>
              ) : (
                <NavLink
                  to={item.to}
                  onClick={(e) => {
                    e.preventDefault()
                    startTransition(item.to)
                  }}
                >
                  {item.label}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
