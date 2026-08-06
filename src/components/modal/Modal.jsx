import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-300">
      {/* Backdrop with dark blur */}
      <div 
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-lg transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Card with crisp contrast border and shadow */}
      <div className="bg-white dark:bg-slate-900 backdrop-blur-xl w-full max-w-4xl h-[82vh] min-h-[480px] rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] flex flex-col relative animate-in zoom-in-95 duration-200 overflow-hidden z-10">
        {/* Header - Compact & Crisp */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200/60 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="text-sm sm:text-base font-black text-text-primary uppercase tracking-widest truncate">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="btn-reset p-1.5 sm:p-2 hover:bg-rose-500/10 hover:text-rose-500 text-text-secondary/50 transition-all duration-200 cursor-pointer rounded-xl shrink-0 flex items-center justify-center border border-transparent hover:border-rose-500/20"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        
        {/* Body - Compact & Auto-scrollable */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 custom-scrollbar flex flex-col min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
}
