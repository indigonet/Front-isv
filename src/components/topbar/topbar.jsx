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
import { useTheme } from "../../context/ThemeContext";
import { Cloud, Palette } from "lucide-react";

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showTopbar, setShowTopbar] = useState(true);
  const lastScrollY = useRef(0);
  // Referencia al menú para detectar clics fuera
  const menuRef = useRef(null);
  const burgerRef = useRef(null);

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

      const currentScrollY = window.scrollY;
      if (currentScrollY <= 10) {
        setShowTopbar(true);
      } else if (currentScrollY > lastScrollY.current + 10) {
        setShowTopbar(false);
      } else if (currentScrollY < lastScrollY.current - 10) {
        setShowTopbar(true);
      }
      lastScrollY.current = currentScrollY;
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

  const { language, changeLanguage, t } = useLanguage();

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
    setShowLanguageDropdown(false);
    setOpen(false);
  };

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

  const getIconImage = () => {
    return darkMode ? iconDark : iconLight;
  };

  return (
    <header className={`topbar ${!showTopbar ? "hidden" : ""}`}>
      <div className="topbar-container">
        <div className="topbar-row">
          <div
            className="logo-container"
            onClick={goToHome}
            style={{ cursor: "pointer" }}
          >
            <div className="logo-brand">
              <span className="logo-text-v2">ISV</span>
              <span className="logo-subtext-v2">Toolkit</span>
            </div>
            <div className="logo-icon-wrapper">
              <img
                src={getIconImage()}
                alt="ISV Toolkit Logo"
                className="logo-image-v2"
                loading="eager"
                style={{ fetchPriority: 'high' }}
                key={darkMode ? "dark-icon" : "light-icon"}
              />
            </div>
          </div>

          <nav className="desktop-menu">
            <a
              href="/simulator"
              onClick={(e) => {
                e.preventDefault();
                navigate("/simulator");
                setOpen(false);
                setShowLanguageDropdown(false);
              }}
              className="menu-link c2c-cloud"
            >
              <Cloud size={18} />
              <span>C2C</span>
            </a>
            <a
              href="/drawable"
              onClick={(e) => {
                e.preventDefault();
                navigate("/drawable");
                setOpen(false);
                setShowLanguageDropdown(false);
              }}
              className="menu-link diagram-link"
            >
              <Palette size={18} />
              <span>{t("topbar.diagramacion")}</span>
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
          </nav>

          <div className="desktop-actions">
            {/* Selector de idiomas */}
            <div className="language-selector">
              <button
                className="language-toggle btn-reset"
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
                    className={`language-option btn-reset ${language === "es" ? "active" : ""}`}
                    onClick={() => handleLanguageChange("es")}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <span className="flag">🇪🇸</span>
                    <span>Español</span>
                  </button>
                  <button
                    className={`language-option btn-reset ${language === "en" ? "active" : ""}`}
                    onClick={() => handleLanguageChange("en")}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <span className="flag">🇺🇸</span>
                    <span>English</span>
                  </button>
                  <button
                    className={`language-option btn-reset ${language === "pt" ? "active" : ""}`}
                    onClick={() => handleLanguageChange("pt")}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <span className="flag">🇵🇹</span>
                    <span>Português</span>
                  </button>
                </div>
              )}
            </div>

            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
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
                    border: darkMode ? "2px solid #7dd3fc" : "2px solid #94a3b8",
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

          </div>

          <button
            className={`burger ${open ? "open" : ""}`}
            onClick={() => setOpen(!open)}
            aria-label="Menú"
            ref={burgerRef}
            aria-expanded={open}
          >
            <MenuIcon />
          </button>
        </div>

        {open && (
          <div className="mobile-menu" ref={menuRef}>
            <a
              href="/simulator"
              onClick={(e) => {
                e.preventDefault();
                navigate("/simulator");
                setOpen(false);
                setShowLanguageDropdown(false);
              }}
              className="menu-link c2c-cloud"
            >
              <Cloud size={18} />
              <span>C2C</span>
            </a>
            <a
              href="/drawable"
              onClick={(e) => {
                e.preventDefault();
                navigate("/drawable");
                setOpen(false);
                setShowLanguageDropdown(false);
              }}
              className="menu-link diagram-link"
            >
              <Palette size={18} />
              <span>{t("topbar.diagramacion")}</span>
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

            <div className="mobile-actions-divider"></div>

            <div className="mobile-actions-row">
              <div className="language-selector">
                <button
                  className="language-toggle btn-reset"
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  aria-label={t("topbar.language")}
                >
                  <TranslateIcon />
                  <span className="language-code">{language.toUpperCase()}</span>
                </button>

                {showLanguageDropdown && (
                  <div className="language-dropdown">
                    <button
                      className={`language-option btn-reset ${language === "es" ? "active" : ""}`}
                      onClick={() => handleLanguageChange("es")}
                    >
                      <span className="flag">🇪🇸</span>
                      <span>Español</span>
                    </button>
                    <button
                      className={`language-option btn-reset ${language === "en" ? "active" : ""}`}
                      onClick={() => handleLanguageChange("en")}
                    >
                      <span className="flag">🇺🇸</span>
                      <span>English</span>
                    </button>
                    <button
                      className={`language-option btn-reset ${language === "pt" ? "active" : ""}`}
                      onClick={() => handleLanguageChange("pt")}
                    >
                      <span className="flag">🇵🇹</span>
                      <span>Português</span>
                    </button>
                  </div>
                )}
              </div>

              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                className="theme-switch-container"
              >
                <LightMode
                  fontSize="small"
                  sx={{
                    color: darkMode ? "rgba(255,255,255,0.3)" : "#fde047",
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
                    },

                    "& .MuiSwitch-track": {
                      borderRadius: 999,
                      backgroundColor: darkMode ? "#334155" : "#e5e7eb",
                      border: darkMode ? "2px solid #7dd3fc" : "2px solid #94a3b8",
                      opacity: 1,
                    },
                  }}
                />

                <DarkMode
                  fontSize="small"
                  sx={{
                    color: darkMode ? "#7dd3fc" : "rgba(0,0,0,0.3)",
                  }}
                />
              </Stack>
            </div>

          </div>
        )}
      </div>
    </header>
  );
}
