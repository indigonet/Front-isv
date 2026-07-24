import React from "react";
import { Share2, Check, X } from "lucide-react";

export default function ShareModal({
  isOpen,
  onClose,
  isLinkCopied,
  onCopyLink,
  elementsCount,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <Share2 size={24} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
              Compartir Proyecto
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Copia el enlace único de tu diagrama ({elementsCount} elementos)
            </p>
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 mb-5 flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={window.location.href}
            className="w-full bg-transparent text-xs font-mono text-slate-600 dark:text-slate-300 focus:outline-none truncate"
          />
          <button
            onClick={onCopyLink}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              isLinkCopied
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                : "bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20"
            }`}
          >
            {isLinkCopied ? (
              <>
                <Check size={14} />
                <span>Copiado</span>
              </>
            ) : (
              <span>Copiar Enlace</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
