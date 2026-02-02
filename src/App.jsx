import Topbar from './components/Topbar/Topbar'
import Content from './components/content/content'
import Footer from './components/footer/footer'
import { LanguageProvider } from './context/LanguageContext'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="App">
          <Topbar />
          <Content />
          <Footer/>
        </div>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App