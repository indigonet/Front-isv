import React from "react";
import { useState } from "react";
import AboutSection from "./sections/AboutSection/AboutSection";
import DownloadSection from "./sections/DownloadSection/DownloadSection";
import logo from "../../assets/logo.png";
import { useLanguage } from "../../context/LanguageContext";
import "./content.css";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";


export default function Content() {
  const { t } = useLanguage();
  const [downloading, setDownloading] = useState(false);

  const DOWNLOAD_URL =
    "https://github.com/indigonet/Front-isv/releases/download/v1.2.4/ISV_Toolkit.exe";

  const handleDownload = () => {
    if (downloading) return;

    setDownloading(true);

    const link = document.createElement("a");
    link.href = DOWNLOAD_URL;
    link.download = "ISV_Toolkit.exe";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccessNotification();

    // Detener animación
    setTimeout(() => {
      setDownloading(false);
    }, 2500);
  };

  const showSuccessNotification = () => {
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      z-index: 9999;
      animation: slideIn 0.3s ease;
      max-width: 350px;
    `;

    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 1.5em;">✅</span>
        <div>
          <strong>¡Descarga iniciada!</strong>
          <div style="font-size: 0.9em; margin-top: 5px;">
            <strong>ISV_Toolkit.exe</strong> (103 MB)
          </div>
          <div style="font-size: 0.8em; margin-top: 8px; opacity: 0.9;">
            Si no se descarga automáticamente,<br>
            <a href="${DOWNLOAD_URL}" target="_blank" style="color: white; text-decoration: underline;">
              haz clic aquí para descargar manualmente
            </a>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 5000);
  };

  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo) {
      const section = document.getElementById(location.state.scrollTo);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  return (
    <main className="content">
      {/* Hero Section con las 4 tarjetas en fila */}
      <section className="hero-section">
        {/* Fondo de programación difuminado */}
        <div className="code-background">
          <div className="code-line"></div>
          <div className="code-line"></div>
          <div className="code-line"></div>
          <div className="code-line"></div>
          <div className="code-line"></div>
          <div className="code-line"></div>
          <div className="code-line"></div>
          <div className="code-line"></div>
        </div>

        <div className="hero-container">
          {/* Logo botón de descarga */}
          <div
            className={`logo-wrapper logo-button ${
              downloading ? "downloading" : ""
            }`}
            onClick={handleDownload}
            role="button"
            aria-label="Descargar ISV Toolkit"
            style={{ cursor: "pointer" }}
          >
            <img className="hero-logo" src={logo} alt="ISV Toolkit Logo" />
          </div>

          {/* Título y descripción */}
          <div className="hero-info">
            <h1 className="hero-title">{t("heroTitle")}</h1>
            <p className="hero-description">{t("heroDescription")}</p>

            {/* Contenedor horizontal para las 4 tarjetas */}
            <div className="hero-features-row">
              {/* Tarjeta 1 */}
              <div className="hero-feature-card">
                <div className="hero-feature-icon">
                  <span>⚡</span>
                </div>
                <div className="hero-feature-content">
                  <h3>{t("feature1")}</h3>
                  <p>{t("feature1Desc")}</p>
                </div>
              </div>

              {/* Tarjeta 2 */}
              <div className="hero-feature-card">
                <div className="hero-feature-icon">
                  <span>🛡️</span>
                </div>
                <div className="hero-feature-content">
                  <h3>{t("feature2")}</h3>
                  <p>{t("feature2Desc")}</p>
                </div>
              </div>

              {/* Tarjeta 3 */}
              <div className="hero-feature-card">
                <div className="hero-feature-icon">
                  <span>🔧</span>
                </div>
                <div className="hero-feature-content">
                  <h3>{t("feature3")}</h3>
                  <p>{t("feature3Desc")}</p>
                </div>
              </div>

              {/* Tarjeta 4 */}
              <div className="hero-feature-card">
                <div className="hero-feature-icon">
                  <span>📊</span>
                </div>
                <div className="hero-feature-content">
                  <h3>{t("feature4")}</h3>
                  <p>{t("feature4Desc")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección About */}
      <AboutSection />

      {/* Sección Download */}
      <DownloadSection />
    </main>
  );
}
