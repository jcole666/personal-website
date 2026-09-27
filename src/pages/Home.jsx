import Hero from '../components/Hero.jsx'
import Sections from '../components/Sections.jsx'
import EditButton from '../components/edit/EditButton.jsx'

function Home() {
  return (
    <>
      <Hero />
      <Sections />
      <EditButton sectionKey="sections" label="首页板块" />
    </>
  )
}

export default Home
