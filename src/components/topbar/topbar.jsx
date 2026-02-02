import { useState, useEffect, useRef } from "react";
import "./topbar.css";
import MenuIcon from "@mui/icons-material/Menu";
import TranslateIcon from "@mui/icons-material/Translate";
import { Switch, Stack } from "@mui/material";
import { LightMode, DarkMode } from "@mui/icons-material";
import { useLanguage } from "../../context/LanguageContext";
import iconDark from "../../assets/icono.png";
import iconLight from "../../assets/iconoblanco.png";
import { useNavigate, useLocation } from "react-router-dom";

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // Referencia al menú para detectar clics fuera
  const menuRef = useRef(null);
  const burgerRef = useRef(null);
  const goToNotes = () => {
    navigate("/release-notes");
    setOpen(false);
    setShowLanguageDropdown(false);
  };

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Usa el contexto
  const { language, changeLanguage, t } = useLanguage();

  // Cargar preferencias del usuario
  useEffect(() => {
    // Verificar preferencia de modo oscuro del sistema
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    setDarkMode(prefersDark);
    applyTheme(prefersDark);
  }, []);

  // Detectar clics fuera del menú para cerrarlo
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Si el menú está abierto y se hace clic fuera del menú y fuera del botón burger
      if (
        open &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        burgerRef.current &&
        !burgerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }

      // Cerrar dropdown de idiomas si se hace clic fuera
      if (showLanguageDropdown && !event.target.closest(".language-selector")) {
        setShowLanguageDropdown(false);
      }
    };

    // Cerrar menú al hacer scroll
    const handleScroll = () => {
      if (open) {
        setOpen(false);
      }
      if (showLanguageDropdown) {
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [open, showLanguageDropdown]);

  // Aplicar tema
  const applyTheme = (isDark) => {
    if (isDark) {
      document.documentElement.setAttribute("data-theme", "dark");
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      document.body.classList.add("light-mode");
      document.body.classList.remove("dark-mode");
    }
  };

  const goToHome = () => {
    navigate("/", { state: { scrollTo: "top" } });
  };

  const goToFeatures = () => {
    navigate("/", { state: { scrollTo: "about" } });
    setOpen(false);
    setShowLanguageDropdown(false);
  };

  const goToDownload = () => {
    navigate("/", { state: { scrollTo: "download" } });
    setOpen(false);
    setShowLanguageDropdown(false);
  };

  const handleGitHubDownload = () => {
    window.open("https://github.com/indigonet/ISV_Toolkit", "_blank");
    setOpen(false);
    setShowLanguageDropdown(false);
  };

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
    setShowLanguageDropdown(false);
    setOpen(false);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    applyTheme(newDarkMode);
    localStorage.setItem("theme", newDarkMode ? "dark" : "light");
  };

  const getIconImage = () => {
    return darkMode ? iconDark : iconLight;
  };

  return (
    <header className="topbar">
      <div
        className="logo-container"
        onClick={goToHome}
        style={{ cursor: "pointer" }}
      >
        <span className="logo-text">{t("topbar.logoText")}</span>
        <img
          src={getIconImage()}
          alt="ISV Toolkit Logo"
          className="logo-image"
          key={darkMode ? "dark-icon" : "light-icon"} // Forzar recarga de imagen
        />
      </div>

      <nav
        className={`menu ${open ? "open" : ""}`}
        ref={menuRef}
        onClick={(e) => {
          // Cerrar menú al hacer clic en cualquier enlace dentro
          if (e.target.tagName === "A") {
            setOpen(false);
          }
        }}
      >
        
        <a
          href="/notes"
          onClick={(e) => {
            e.preventDefault();
            goToNotes();
          }}
          className="menu-link"
        >
          Release notes
        </a>
        <a
          href="#about"
          onClick={(e) => {
            e.preventDefault();
            goToFeatures();
          }}
          className="menu-link"
        >
          {t("topbar.features")}
        </a>
        <a
          href="#download"
          onClick={(e) => {
            e.preventDefault();
            goToDownload();
          }}
          className="menu-link"
        >
          {t("topbar.download")}
        </a>

        {/* Selector de idiomas */}
        <div className="language-selector">
          <button
            className="language-toggle"
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            aria-label={t("topbar.language")}
            onBlur={() => setTimeout(() => setShowLanguageDropdown(false), 200)}
          >
            <TranslateIcon />
            <span className="language-code">{language.toUpperCase()}</span>
          </button>

          {showLanguageDropdown && (
            <div
              className="language-dropdown"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={`language-option ${language === "es" ? "active" : ""}`}
                onClick={() => handleLanguageChange("es")}
                onMouseDown={(e) => e.preventDefault()} // Prevenir blur inmediato
              >
                <span className="flag">🇪🇸</span>
                <span>Español</span>
              </button>
              <button
                className={`language-option ${language === "en" ? "active" : ""}`}
                onClick={() => handleLanguageChange("en")}
                onMouseDown={(e) => e.preventDefault()}
              >
                <span className="flag">🇺🇸</span>
                <span>English</span>
              </button>
              <button
                className={`language-option ${language === "pt" ? "active" : ""}`}
                onClick={() => handleLanguageChange("pt")}
                onMouseDown={(e) => e.preventDefault()}
              >
                <span className="flag">PT</span>
                <span>Português</span>
              </button>
            </div>
          )}
        </div>

        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ display: { xs: "flex" } }}
          className="theme-switch-container"
        >
          <LightMode
            fontSize="small"
            sx={{
              color: darkMode ? "rgba(255,255,255,0.3)" : "#fde047",
              transition: "color .3s",
            }}
          />

          <Switch
            checked={darkMode}
            onChange={toggleDarkMode}
            color="default"
            sx={{
              width: 52,
              height: 28,
              padding: 0,

              "& .MuiSwitch-switchBase": {
                padding: 0,
                margin: 0.5,
                "&.Mui-checked": {
                  transform: "translateX(24px)",
                },
              },

              "& .MuiSwitch-thumb": {
                width: 22,
                height: 22,
                backgroundColor: darkMode ? "#fafafa" : "#fff",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              },

              "& .MuiSwitch-track": {
                borderRadius: 999,
                backgroundColor: darkMode ? "#334155" : "#e5e7eb",
                border: darkMode ? "2px solid #7dd3fc" : "2px solid #a9b3c0",
                opacity: 1,
                transition: "background-color 0.3s, border-color 0.3s",
              },
            }}
          />

          <DarkMode
            fontSize="small"
            sx={{
              color: darkMode ? "#7dd3fc" : "rgba(0,0,0,0.3)",
              transition: "color .3s",
            }}
          />
        </Stack>

        <button
          className="github-download-btn"
          onClick={handleGitHubDownload}
          aria-label="GitHub"
        >
          <span className="github-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </span>
          <span className="github-text">{t("topbar.github")}</span>
        </button>
      </nav>

      <button
        className={`burger ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label="Menú"
        ref={burgerRef}
        aria-expanded={open}
      >
        <MenuIcon />
      </button>
    </header>
  );
}
