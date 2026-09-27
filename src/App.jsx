import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { TransitionProvider } from './context/TransitionContext.jsx'
import LoadingTransition from './components/LoadingTransition.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import AcidSquares from './components/AcidSquares.jsx'
import Home from './pages/Home.jsx'
import Projects from './pages/Projects.jsx'
import Coursework from './pages/Coursework.jsx'
import Experience from './pages/Experience.jsx'
import Reading from './pages/Reading.jsx'
import Music from './pages/Music.jsx'
import Movies from './pages/Movies.jsx'
import Food from './pages/Food.jsx'
import Games from './pages/Games.jsx'
import Admin from './pages/Admin.jsx'
import SectionEditor from './pages/SectionEditor.jsx'

function App() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  // 背景光斑视差：鼠标位置写进全局 CSS 变量 --par-x / --par-y（-0.5 ~ 0.5）
  useEffect(() => {
    const onMove = (e) => {
      document.documentElement.style.setProperty(
        '--par-x',
        (e.clientX / window.innerWidth - 0.5).toFixed(3),
      )
      document.documentElement.style.setProperty(
        '--par-y',
        (e.clientY / window.innerHeight - 0.5).toFixed(3),
      )
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <TransitionProvider>
      <div className={`app${isHome ? ' app--home' : ''}`}>
        {/* 首页：AcidSquares WebGL 动态背景；其他页面：液态玻璃光斑层 */}
        {isHome ? (
          <div className="acid-bg" aria-hidden="true">
            <AcidSquares
              color1="#d9d3e8"
              color2="#a55ee8"
              color3="#FFFFFF"
              detail="low"
              speed={0.4}
              waveDepth={1.2}
              zoom={1.25}
              density={10}
              glow={1.1}
              exposure={2600}
              spread={0.3}
              stepSize={0.002}
              colorShift={0}
              contrast={0.8}
              brightness={1}
              opacity={1}
              mouseInteraction
              mouseStrength={0.25}
              mouseRadius={0.3}
              blur={0}
              grain
              grainIntensity={0.05}
            />
          </div>
        ) : (
          <div className="glass-ambient" aria-hidden="true">
            <span className="glass-orb glass-orb--1" />
            <span className="glass-orb glass-orb--2" />
            <span className="glass-orb glass-orb--3" />
            <span className="glass-orb glass-orb--4" />
            <span className="glass-orb glass-orb--5" />
            <span className="glass-orb glass-orb--6" />
          </div>
        )}
        {/* 内容层（z-index:1，压在背景之上） */}
        <div className="app-content">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/coursework" element={<Coursework />} />
            <Route path="/experience" element={<Experience />} />
            <Route path="/reading" element={<Reading />} />
            <Route path="/music" element={<Music />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/food" element={<Food />} />
            <Route path="/games" element={<Games />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/:key" element={<SectionEditor />} />
          </Routes>
          <Footer />
          <LoadingTransition />
        </div>
      </div>
    </TransitionProvider>
  )
}

export default App
