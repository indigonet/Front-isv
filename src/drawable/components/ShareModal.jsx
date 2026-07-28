import React, { useState, useEffect } from "react";
import {
  Share2,
  Check,
  X,
  Copy,
  Code as CodeIcon,
  Upload,
  Info,
  Loader2,
  Link,
  Zap,
  Globe,
  Cloud,
} from "lucide-react";
import { createShortProject } from "../utils/shareUtils";

export default function ShareModal({
  isOpen,
  onClose,
  elements = [],
  onCopyJSON,
  onDownloadJSON,
  showToast,
  onProjectCreated,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [shortUrl, setShortUrl] = useState("");
  const [projectId, setProjectId] = useState("");
  const [isCloudSaved, setIsCloudSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const generateLink = async () => {
      setIsLoading(true);
      setIsCopied(false);
      try {
        const result = await createShortProject(elements);
        if (!isMounted) return;

        setShortUrl(result.shortUrl);
        setProjectId(result.id);
        setIsCloudSaved(result.isCloudSaved);
        if (onProjectCreated && result.id) {
          onProjectCreated(result.id);
        }
      } catch (err) {
        console.error("Failed to generate short project URL:", err);
        if (isMounted) {
          const fallback = `${window.location.origin}${window.location.pathname}#id=error`;
          setShortUrl(fallback);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    generateLink();

    return () => {
      isMounted = false;
    };
  }, [isOpen, elements]);

  if (!isOpen) return null;

  const urlLength = shortUrl ? shortUrl.length : 0;

  const handleCopy = () => {
    if (!shortUrl) return;
    navigator.clipboard.writeText(shortUrl);
    setIsCopied(true);
    if (showToast) {
      showToast(`¡Enlace corto copiado al portapapeles! (${urlLength} caracteres)`, "success");
    }
    setTimeout(() => setIsCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60 animate-fade-in">
      <div className="relative w-full max-w-lg p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Share2 size={22} />
            </div>
         
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Short URL Main Box */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Link size={14} className="text-purple-600 dark:text-purple-400" />
              <span>Enlace del Diagrama</span>
            </label>
            {shortUrl && !isLoading && (
              <div className="flex items-center gap-1.5">
                {isCloudSaved && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-full border border-purple-200/60 dark:border-purple-800/60" title="Guardado en nube de sincronización">
                    <Cloud size={11} /> Nube
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                readOnly
                value={isLoading ? "Generando ID corto..." : shortUrl}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-slate-100 font-mono focus:outline-none select-all truncate pr-8"
              />
              {isLoading && (
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-purple-600 dark:text-purple-400">
                  <Loader2 size={16} className="animate-spin" />
                </div>
              )}
            </div>

            <button
              onClick={handleCopy}
              disabled={isLoading || !shortUrl}
              className={`btn-draw px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                isCopied
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  : "bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              {isCopied ? (
                <>
                  <Check size={16} />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>Copiar Enlace</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* JSON Export & Download buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={onCopyJSON}
            className="btn-draw p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-purple-50 dark:hover:bg-purple-950/30 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer"
          >
            <CodeIcon size={16} />
            <span>Copiar JSON</span>
          </button>

          <button
            onClick={() => {
              if (onDownloadJSON) onDownloadJSON();
              onClose();
            }}
            className="btn-draw p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-purple-50 dark:hover:bg-purple-950/30 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer"
          >
            <Upload size={16} />
            <span>Descargar .json</span>
          </button>
        </div>

        {/* Summary Footer */}
        <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-700/40 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Info size={16} className="text-purple-500" />
            <span>
              Total de Elementos:{" "}
              <strong className="text-slate-800 dark:text-slate-200">{elements.length}</strong>
            </span>
          </div>
          <div>
            <span>
              ID Corto: <strong className="font-mono text-purple-600 dark:text-purple-400">{projectId || "—"}</strong>
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
