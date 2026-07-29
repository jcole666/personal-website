import { Routes, Route } from 'react-router-dom'
import { TransitionProvider } from './context/TransitionContext.jsx'
import LoadingTransition from './components/LoadingTransition.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Projects from './pages/Projects.jsx'
import Coursework from './pages/Coursework.jsx'
import Essays from './pages/Essays.jsx'
import Experience from './pages/Experience.jsx'
import Reading from './pages/Reading.jsx'
import Music from './pages/Music.jsx'
import Movies from './pages/Movies.jsx'
import Milktea from './pages/Milktea.jsx'

function App() {
  return (
    <TransitionProvider>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/coursework" element={<Coursework />} />
          <Route path="/essays" element={<Essays />} />
          <Route path="/experience" element={<Experience />} />
          <Route path="/reading" element={<Reading />} />
          <Route path="/music" element={<Music />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/milktea" element={<Milktea />} />
        </Routes>
        <Footer />
        <LoadingTransition />
      </div>
    </TransitionProvider>
  )
}

export default App
