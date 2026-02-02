import { BrowserRouter, Routes, Route } from "react-router-dom";
import Topbar from "./components/topbar/topbar";
import Content from "./components/content/content";
import Footer from "./components/footer/footer";
import Notes from "./components/release/notes";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <div className="App">
            <Topbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Content />} />
                <Route path="/release-notes" element={<Notes />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
