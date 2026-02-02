import React from 'react'
import AboutSection from './sections/AboutSection/AboutSection'
import DownloadSection from './sections/DownloadSection/DownloadSection'
import { useLanguage } from '../../context/LanguageContext'
import './content.css'

export default function Content() {
  const { t } = useLanguage()
  
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
          {/* Logo en el centro */}
          <div className="logo-card">
            <div className="logo-wrapper">
              <img 
                className="hero-logo" 
                src="src/assets/logo.png" 
                alt="ISV Toolkit Logo" 
              />
            </div>
          </div>
          
          {/* Título y descripción */}
          <div className="hero-info">
            <h1 className="hero-title">{t('heroTitle')}</h1>
            <p className="hero-description">
              {t('heroDescription')}
            </p>
            
            {/* Contenedor horizontal para las 4 tarjetas */}
            <div className="hero-features-row">
              {/* Tarjeta 1 */}
              <div className="hero-feature-card">
                <div className="hero-feature-icon">
                  <span>⚡</span>
                </div>
                <div className="hero-feature-content">
                  <h3>{t('feature1')}</h3>
                  <p>{t('feature1Desc')}</p>
                </div>
              </div>

              {/* Tarjeta 2 */}
              <div className="hero-feature-card">
                <div className="hero-feature-icon">
                  <span>🛡️</span>
                </div>
                <div className="hero-feature-content">
                  <h3>{t('feature2')}</h3>
                  <p>{t('feature2Desc')}</p>
                </div>
              </div>

              {/* Tarjeta 3 */}
              <div className="hero-feature-card">
                <div className="hero-feature-icon">
                  <span>🔧</span>
                </div>
                <div className="hero-feature-content">
                  <h3>{t('feature3')}</h3>
                  <p>{t('feature3Desc')}</p>
                </div>
              </div>

              {/* Tarjeta 4 */}
              <div className="hero-feature-card">
                <div className="hero-feature-icon">
                  <span>📊</span>
                </div>
                <div className="hero-feature-content">
                  <h3>{t('feature4')}</h3>
                  <p>{t('feature4Desc')}</p>
                </div>
              </div>
            </div>
            
            {/* Indicador de scroll */}
            <div className="mobile-scroll-hint">
              ← {t('slideToSeeMore') || "Desliza para ver más"} →
            </div>
          </div>
        </div>
      </section>

      {/* Sección About */}
      <AboutSection />
      
      {/* Sección Download */}
      <DownloadSection />
    </main>
  )
}