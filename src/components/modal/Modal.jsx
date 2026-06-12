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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="bg-card/95 backdrop-blur-xl w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] rounded-2xl border border-slate-200/60 dark:border-accent/15 shadow-2xl flex flex-col relative animate-in zoom-in duration-300 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 sm:py-6 border-b border-slate-100 dark:border-accent/5">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="text-lg sm:text-xl font-black text-text-primary uppercase tracking-widest">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="btn-reset p-2 sm:p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-text-secondary/40 hover:text-accent transition-all duration-300 cursor-pointer rounded-xl shrink-0 flex items-center justify-center border border-transparent hover:border-slate-200/50 dark:hover:border-slate-700/30"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
