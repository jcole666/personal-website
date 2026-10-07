import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'animal-island-ui/style'
import './common.css'
import './styles/reading.css'
import './styles/experience.css'
import './styles/home.css'
import './styles/music.css'
import './styles/movies.css'
import './styles/food.css'
import './styles/projects.css'
import './styles/courses.css'
import './styles/games.css'
import './styles/admin.css'
import { DataProvider } from './context/DataContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { EditModeProvider } from './context/EditModeContext.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <EditModeProvider>
        <AuthProvider>
          <DataProvider>
            <App />
          </DataProvider>
        </AuthProvider>
      </EditModeProvider>
    </BrowserRouter>
  </StrictMode>,
)