import React, { useState } from "react";
import { useLanguage } from "../../../../context/LanguageContext";
import "./DownloadSection.css";

export default function DownloadSection() {
  const { t } = useLanguage();
  const [isDownloading, setIsDownloading] = useState(false);

  const DOWNLOAD_URL =
    "https://github.com/indigonet/ISV_Toolkit_Front/releases/download/1.2.4/ISV_Toolkit.exe";
  const RELEASES_PAGE = "https://github.com/indigonet/ISV_Toolkit";

  const downloadOptions = [
    {
      id: 1,
      os: t("windows"),
      icon: "🪟",
      version: "v1.2.4",
      fileSize: "103 MB",
      fileName: "ISVToolkit.exe", 
      requirements: t("ADB PlatformTools"),
    },
  ];

  const handleDownload = () => {
    setIsDownloading(true);

    try {
      // Crear enlace de descarga
      const link = document.createElement("a");
      link.href = DOWNLOAD_URL;
      link.download = "ISVToolkit.exe";
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
            <strong>ISVToolkit.exe</strong> (103 MB)
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
    <section className="download-section" id="download">
      <h2 className="download-title">{t("downloadTitle")}</h2>
      <p className="download-subtitle">{t("downloadSubtitle")}</p>

      <div className="download-content">
        {/* Columna izquierda - Requerimientos */}
        <div className="requirements-column">
          <div className="requirements-card">
            <h3 className="requirements-title">{t("requirementsTitle")}</h3>
            <ul className="requirements-list">
              <li className="requirement-item">
                <span className="requirement-icon">💻</span>
                <div className="requirement-content">
                  <h4>{t("os")}</h4>
                  <p>{t("osDesc")}</p>
                </div>
              </li>
              <li className="requirement-item">
                <span className="requirement-icon">🧠</span>
                <div className="requirement-content">
                  <h4>{t("ram")}</h4>
                  <p>{t("ramDesc")}</p>
                </div>
              </li>
              <li className="requirement-item">
                <span className="requirement-icon">💾</span>
                <div className="requirement-content">
                  <h4>{t("disk")}</h4>
                  <p>{t("diskDesc")}</p>
                </div>
              </li>
              <li className="requirement-item">
                <span className="requirement-icon">🔌</span>
                <div className="requirement-content">
                  <h4>{t("internet")}</h4>
                  <p>{t("internetDesc")}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Columna central - Tarjeta de descarga */}
        <div className="download-column">
          <div className="download-grid">
            {downloadOptions.map((option) => (
              <div key={option.id} className="download-card">
                <div className="card-header">
                  <span className="os-icon">{option.icon}</span>
                  <h3 className="os-name">{option.os}</h3>
                </div>

                <div className="card-body">
                  <div className="version-info">
                    <span className="version-label">{t("version")}</span>
                    <span className="version-value">{option.version}</span>
                  </div>

                  <div className="file-info">
                    <span className="file-label">{t("file")}</span>
                    <span className="file-value">{option.fileName}</span>
                  </div>

                  <div className="size-info">
                    <span className="size-label">{t("size")}</span>
                    <span className="size-value">{option.fileSize}</span>
                  </div>

                  <div className="requirements-info">
                    <span className="req-label">{t("requirements")}</span>
                    <span className="req-value">{option.requirements}</span>
                  </div>
                </div>

                <button
                  className={`download-button ${isDownloading ? "loading" : ""}`}
                  onClick={handleDownload}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <span className="button-text">Descargando...</span>
                  ) : (
                    <>
                      <span className="button-icon">⬇️</span>
                      <span className="button-text">
                        {t("downloadButton")} {option.os}
                        <br />
                        <small style={{ fontSize: "0.75em", opacity: 0.9 }}>
                          v1.2.4 • 103 MB
                        </small>
                      </span>
                    </>
                  )}
                </button>

                {/* Enlace directo como respaldo */}
                <div
                  style={{
                    textAlign: "center",
                    marginTop: "15px",
                    paddingTop: "15px",
                    borderTop: "1px solid #e0e5ff",
                  }}
                >
                  <a
                    href={DOWNLOAD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#667eea",
                      textDecoration: "none",
                      fontSize: "0.85rem",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    Enlace directo al archivo
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Columna derecha - Dependencias */}
        <div className="dependencies-column">
          <div className="dependencies-card">
            <h3 className="dependencies-title">{t("dependenciesTitle")}</h3>
            <ul className="dependencies-list">
              <li className="dependency-item">
                <a
                  href="https://developer.android.com/studio/releases/platform-tools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dependency-link"
                >
                  <span className="dependency-icon">🔧</span>
                  <div className="dependency-content">
                    <h4>{t("platformTools")}</h4>
                    <p>{t("platformToolsDesc")}</p>
                  </div>
                </a>
              </li>
              <li className="dependency-item">
                <a
                  href="https://developer.android.com/studio/releases/build-tools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dependency-link"
                >
                  <span className="dependency-icon">🛠️</span>
                  <div className="dependency-content">
                    <h4>{t("buildTools")}</h4>
                    <p>{t("buildToolsDesc")}</p>
                  </div>
                </a>
              </li>
              <li className="dependency-item">
                <a
                  href="https://www.oracle.com/java/technologies/javase/jdk11-archive-downloads.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dependency-link"
                >
                  <span className="dependency-icon">☕</span>
                  <div className="dependency-content">
                    <h4>{t("jdk")}</h4>
                    <p>{t("jdkDesc")}</p>
                  </div>
                </a>
              </li>
              <li className="dependency-item">
                <div className="dependency-link free">
                  <span className="dependency-icon">🎁</span>
                  <div className="dependency-content">
                    <h4>{t("free")}</h4>
                    <p>{t("freeDesc")}</p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
