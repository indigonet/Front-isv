import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../../context/LanguageContext";
import { Download, FileText } from "lucide-react";
import "./DownloadSection.css";

export default function DownloadSection() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);

  const DOWNLOAD_URL =
    "https://github.com/indigonet/ISV_Toolkit_Flutter/releases/download/ISVTOOLKIT/ISV_Toolkit_1.0.5_Setup.exe";
  const RELEASES_PAGE = "https://github.com/indigonet/Front-isv/releases/tag/1.0.5";

  const downloadOptions = [
    {
      id: 1,
      os: t("windows"),
      icon: "🪟",
      version: "v1.0.5",
      fileSize: "185 MB",
      fileName: "ISV_Toolkit_1.0.5_Setup.exe",
      requirements: t("ADB PlatformTools"),
    },
  ];

  const handleDownload = () => {
    setIsDownloading(true);

    try {
      // Crear enlace de descarga
      const link = document.createElement("a");
      link.href = DOWNLOAD_URL;
      link.download = "ISV_Toolkit_Setup.exe";
      link.target = "_blank";

      // Forzar descarga
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSuccessNotification();
    } catch (error) {
      console.error("❌ Error en descarga:", error);
      // Fallback: abrir página de releases
      window.open(RELEASES_PAGE, "_blank");
    } finally {
      setTimeout(() => setIsDownloading(false), 2000);
    }
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
            <strong>ISV_Toolkit_1.0.5_Setup.exe</strong> (185 MB)
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

  // Agregar estilos para animaciones
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
      
      .download-button.loading {
        position: relative;
        color: transparent;
      }
      
      .download-button.loading::after {
        content: '';
        position: absolute;
        width: 20px;
        height: 20px;
        border: 2px solid white;
        border-radius: 50%;
        border-top-color: transparent;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <section className="download-section-v2" id="download">
      <div className="download-header-v2">
        <h2 className="download-title-v2">{t("downloadTitle")}</h2>
        <p className="download-subtitle-v2">{t("downloadSubtitle")}</p>
      </div>

      <div className="download-grid-v2">
        {/* Columna 1: Requerimientos */}
        <div className="download-col requirements-col">
          <div className="glass-card-v2">
            <h3 className="card-title-v2">
              <span className="icon-glow">📋</span> {t("requirementsTitle")}
            </h3>
            <ul className="info-list-v2">
              <li>
                <span className="info-icon-v2">💻</span>
                <div>
                  <strong>{t("os")}</strong>
                  <p>{t("osDesc")}</p>
                </div>
              </li>
              <li>
                <span className="info-icon-v2">🧠</span>
                <div>
                  <strong>{t("ram")}</strong>
                  <p>{t("ramDesc")}</p>
                </div>
              </li>
              <li>
                <span className="info-icon-v2">💾</span>
                <div>
                  <strong>{t("disk")}</strong>
                  <p>{t("diskDesc")}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Columna 2: Descarga Principal (Destacada) */}
        <div className="download-col main-download-col">
          {downloadOptions.map((option) => (
            <div key={option.id} className="premium-download-card">
              <div className="platform-tag">{option.os}</div>
              <div className="card-header-v2">
                <div className="main-os-icon">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--color-primary)', filter: 'drop-shadow(0 10px 20px rgba(var(--color-primary-rgb), 0.3))' }}>
                    <path d="M0 3.449L9.75 2.1V11.4H0V3.449zm0 17.102L9.75 21.9V12.6H0v7.951zM10.65 1.95l13.35-1.95V11.4h-13.35V1.95zm0 20.1l13.35 1.95V12.6h-13.35v9.45z"/>
                  </svg>
                </div>
                <div className="version-pill">{option.version}</div>
              </div>

              <div className="download-details-v2">
                <div className="detail-item-v2">
                  <span>{t("file")}</span>
                  <strong>{option.fileName}</strong>
                </div>
                <div className="detail-item-v2">
                  <span>{t("size")}</span>
                  <strong>{option.fileSize}</strong>
                </div>
              </div>

              <button
                className={`action-download-btn ${isDownloading ? "loading" : ""}`}
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  t("downloading")
                ) : (
                  <>
                    <Download size={22} />
                    <span>{t("downloadButton")} {option.os}</span>
                  </>
                )}
              </button>

              <div className="github-fallback-v2" style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
                <a href={RELEASES_PAGE} target="_blank" rel="noopener noreferrer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  Source on GitHub
                </a>
                <a
                  href="/release-notes"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/release-notes");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    color: "var(--color-primary)",
                    textDecoration: "underline",
                    marginTop: "4px"
                  }}
                >
                  <FileText size={15} />
                  <span>Ver Notas de Lanzamiento</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Columna 3: Dependencias */}
        <div className="download-col dependencies-col">
          <div className="glass-card-v2">
            <h3 className="card-title-v2">
              <span className="icon-glow">📦</span> {t("dependenciesTitle")}
            </h3>
            <div className="dep-grid-v2">
              <a href="https://developer.android.com/studio/releases/platform-tools" target="_blank" className="dep-item-v2">
                <span className="dep-icon-v2">🔧</span>
                <strong>Platform Tools</strong>
              </a>
              <a href="https://developer.android.com/studio/releases/build-tools" target="_blank" className="dep-item-v2">
                <span className="dep-icon-v2">🛠️</span>
                <strong>Build Tools</strong>
              </a>
              <a href="https://www.oracle.com/java/technologies/javase/jdk11-archive-downloads.html" target="_blank" className="dep-item-v2">
                <span className="dep-icon-v2">☕</span>
                <strong>JDK 11</strong>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
