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
    "https://github.com/indigonet/Front-isv/releases/download/1.0.6/ISV_Toolkit_v1.0.6_Setup.exe";

  const downloadOptions = [
    {
      id: 1,
      os: t("windows"),
      icon: "🪟",
      version: "v1.0.6",
      fileSize: "122 MB",
      fileName: "ISV_Toolkit_v1.0.6_Setup.exe",
      requirements: t("ADB PlatformTools"),
    },
  ];

  const handleDownload = () => {
    setIsDownloading(true);

    try {
      // Crear enlace de descarga
      const link = document.createElement("a");
      link.href = DOWNLOAD_URL;
      link.download = "ISV_Toolkit_v1.0.6_Setup.exe";
      link.target = "_blank";

      // Forzar descarga
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSuccessNotification();
    } catch (error) {
      console.error("❌ Error en descarga:", error);
      window.open(DOWNLOAD_URL, "_blank");
    } finally {
      setTimeout(() => setIsDownloading(false), 2000);
    }
  };

  const showSuccessNotification = () => {
    const notification = document.createElement("div");
    notification.className = "download-toast";

    notification.innerHTML = `
      <div class="download-toast-content">
        <span class="download-toast-icon">✅</span>
        <div class="download-toast-text">
          <strong>¡Descarga iniciada!</strong>
          <div class="download-toast-details">
            <strong>ISV_Toolkit_v1.0.6_Setup.exe</strong> (122 MB)
          </div>
          <div class="download-toast-fallback">
            Si no se descarga automáticamente,<br>
            <a href="${DOWNLOAD_URL}" target="_blank" rel="noopener noreferrer">
              haz clic aquí para descargar manualmente
            </a>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("toast-out");
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 5000);
  };

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
                  <svg
                    width="76"
                    height="76"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="os-svg-icon"
                  >
                    <path d="M0 3.449L9.75 2.1V11.4H0V3.449zm0 17.102L9.75 21.9V12.6H0v7.951zM10.65 1.95l13.35-1.95V11.4h-13.35V1.95zm0 20.1l13.35 1.95V12.6h-13.35v9.45z" />
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
                aria-label={`${t("downloadButton")} ${option.os}`}
              >
                {isDownloading ? (
                  <span>{t("downloading")}</span>
                ) : (
                  <>
                    <Download size={22} className="btn-icon" />
                    <span>
                      {t("downloadButton")} {option.os}
                    </span>
                  </>
                )}
              </button>

              <div className="github-fallback-v2">
                <a
                  href="/release-notes"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/release-notes");
                  }}
                  className="release-notes-link"
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
              <a
                href="https://developer.android.com/studio/releases/platform-tools"
                target="_blank"
                rel="noopener noreferrer"
                className="dep-item-v2"
              >
                <span className="dep-icon-v2">🔧</span>
                <div className="dep-text-group">
                  <strong>Platform Tools</strong>
                  <span className="dep-subtext">ADB & Fastboot</span>
                </div>
              </a>
              <a
                href="https://developer.android.com/studio/releases/build-tools"
                target="_blank"
                rel="noopener noreferrer"
                className="dep-item-v2"
              >
                <span className="dep-icon-v2">🛠️</span>
                <div className="dep-text-group">
                  <strong>Build Tools</strong>
                  <span className="dep-subtext">AAPT & APKSigner</span>
                </div>
              </a>
              <a
                href="https://www.oracle.com/java/technologies/javase/jdk11-archive-downloads.html"
                target="_blank"
                rel="noopener noreferrer"
                className="dep-item-v2"
              >
                <span className="dep-icon-v2">☕</span>
                <div className="dep-text-group">
                  <strong>JDK 11</strong>
                  <span className="dep-subtext">Para JarSigner</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
