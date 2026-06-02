import React from "react";
import { useState } from "react";
import AboutSection from "./sections/AboutSection/AboutSection";
import DownloadSection from "./sections/DownloadSection/DownloadSection";
import logo from "../../assets/logo.png";
import { useLanguage } from "../../context/LanguageContext";
import "./content.css";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";


import { Zap, Shield, Wrench, Key, Download, Github } from "lucide-react";

export default function Content() {
  const { t } = useLanguage();
  const [downloading, setDownloading] = useState(false);

  const DOWNLOAD_URL =
    "https://github.com/indigonet/ISV_Toolkit_Flutter/releases/download/ISVTOOLKIT/ISV_Toolkit_Setup.exe";

  const handleDownload = () => {
    if (downloading) return;

    setDownloading(true);

    const link = document.createElement("a");
    link.href = DOWNLOAD_URL;
    link.download = "ISV_Toolkit_Setup.exe";
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
        <span style="font-size: 1.5em;"></span>
        <div>
          <strong>¡Descarga iniciada!</strong>
          <div style="font-size: 0.9em; margin-top: 5px;">
            <strong>ISV_Toolkit_Setup.exe</strong> (14 MB)
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
      {/* Hero Section Redesign: Two Columns */}
      <section className="hero-section">
        {/* Modern Mesh Gradient Background */}
        <div className="hero-mesh-background"></div>
        
        <div className="hero-container-v2">
          {/* Left Column: Information */}
          <div className="hero-text-content">
            <div className="hero-badge">{t("topbar.logoText")} v1.0.3</div>
            <h1 className="hero-title-v2">{t("heroTitle")}</h1>
            <p className="hero-description-v2">{t("heroDescription")}</p>
            
            <div className="hero-actions">
              <button 
                className={`cta-button primary ${downloading ? "loading" : ""}`}
                onClick={handleDownload}
              >
                <Download size={20} />
                {downloading ? t("downloading") : t("topbar.download") + " Toolkit"}
              </button>
              <button 
                className="cta-button secondary"
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t("learnMore")}
              </button>
            </div>
          </div>

          {/* Right Column: Visual Component */}
          <div className="hero-visual-content">
            <div className={`logo-main-container ${downloading ? "anim-download" : ""}`}>
              <div className="logo-glow"></div>
              <img 
                className="hero-logo-v2" 
                src={logo} 
                alt="ISV Toolkit Logo" 
                loading="eager"
              />
              {/* Floating elements for extra depth */}
              <div className="floating-element f1">⚡</div>
              <div className="floating-element f2">🛡️</div>
              <div className="floating-element f3">📊</div>
            </div>
          </div>
        </div>

        {/* Features Section - Bento Style Grid */}
        <div className="features-grid-container">
          <div className="features-grid">
            {/* Feature 1 */}
            <div className="feature-card-v2 feature-primary">
              <div className="feature-icon-wrapper icon-blue">
                <Zap className="feature-icon-v2" />
              </div>
              <div className="feature-info-v2">
                <h3>{t("feature1")}</h3>
                <p>{t("feature1Desc")}</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="feature-card-v2 feature-info">
              <div className="feature-icon-wrapper icon-sky">
                <Shield className="feature-icon-v2" />
              </div>
              <div className="feature-info-v2">
                <h3>{t("feature2")}</h3>
                <p>{t("feature2Desc")}</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="feature-card-v2 feature-tools">
              <div className="feature-icon-wrapper icon-indigo">
                <Wrench className="feature-icon-v2" />
              </div>
              <div className="feature-info-v2">
                <h3>{t("feature3")}</h3>
                <p>{t("feature3Desc")}</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="feature-card-v2 feature-accent">
              <div className="feature-icon-wrapper icon-rose">
                <Key className="feature-icon-v2" />
              </div>
              <div className="feature-info-v2">
                <h3>{t("feature4")}</h3>
                <p>{t("feature4Desc")}</p>
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
