import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Topbar from "./components/topbar/topbar";
import Content from "./components/content/content";
import Footer from "./components/footer/footer";
import Notes from "./components/release/notes";
import SimulatorView from "./simulator/SimulatorView";
import DrawableView from "./drawable/DrawableView";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
import "./index.css";

function AppContent() {
  const location = useLocation();
  const isDrawable = location.pathname === "/drawable";

  return (
    <div className="App">
      {!isDrawable && <Topbar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Content />} />
          <Route path="/simulator" element={<SimulatorView />} />
          <Route path="/release-notes" element={<Notes />} />
          <Route path="/drawable" element={<DrawableView />} />
        </Routes>
      </main>
      {!isDrawable && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
