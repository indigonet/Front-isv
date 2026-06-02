import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
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
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 sm:p-6 pt-24 sm:pt-0 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/40 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="bg-card w-full max-w-4xl max-h-[85vh] rounded-2xl border border-accent/10 shadow-2xl flex flex-col relative animate-in zoom-in duration-300 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 sm:py-6 border-b border-accent/5">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="text-lg sm:text-xl font-black text-text-primary uppercase tracking-widest">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 sm:p-3 text-text-secondary/40 hover:text-accent transition-all duration-300 cursor-pointer shrink-0"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="flex-1 overflow-auto p-8 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
