import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Topbar from "./components/topbar/topbar";
import Content from "./components/content/content";
import Footer from "./components/footer/footer";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
import "./index.css";

import OutOfService from "./components/OutOfService";

// Cambiar a 'false' si se desea reactivar la aplicación normalmente
const IS_OUT_OF_SERVICE = true;

const Notes = lazy(() => import("./components/release/notes"));
const SimulatorView = lazy(() => import("./simulator/SimulatorView"));
const DrawableView = lazy(() => import("./drawable/DrawableView"));

function LoadingFallback() {
  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center gap-3 select-none">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
        <div className="absolute inset-0 rounded-full bg-accent/10 blur-md animate-pulse" />
      </div>
      <span className="text-xs font-black uppercase tracking-widest text-accent animate-pulse mt-2">
        Cargando módulo...
      </span>
    </div>
  );
}

function AppContent() {
  const location = useLocation();

  if (IS_OUT_OF_SERVICE) {
    return <OutOfService />;
  }

  const isDrawable = location.pathname === "/drawable";
  const isSimulator = location.pathname === "/simulator";
  const hideTopbar = isDrawable || isSimulator;

  return (
    <div className="App">
      {!hideTopbar && <Topbar />}
      <main className="main-content">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Content />} />
            <Route path="/simulator" element={<SimulatorView />} />
            <Route path="/release-notes" element={<Notes />} />
            <Route path="/drawable" element={<DrawableView />} />
            <Route path="*" element={<OutOfService />} />
          </Routes>
        </Suspense>
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
