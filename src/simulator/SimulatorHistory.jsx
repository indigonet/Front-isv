import React, { useState } from 'react';
import { History, Trash2, ChevronRight, ArrowLeft, Copy, Check, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Tooltip } from '@mui/material';
import Modal from '../components/modal/Modal';

// Reusable premium monochromatic code block with Clipboard feedback
export function CodeBlock({ code, filename }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    let cleanCode = code;
    if (typeof code !== 'string') {
      try {
        cleanCode = JSON.stringify(code, null, 2);
      } catch {
        cleanCode = String(code);
      }
    }
    navigator.clipboard.writeText(cleanCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  let displayCode = '';
  try {
    displayCode = typeof code === 'string'
      ? JSON.stringify(JSON.parse(code), null, 2)
      : JSON.stringify(code, null, 2);
  } catch {
    displayCode = typeof code === 'string' ? code : String(code);
  }

  return (
    <div className="flex flex-col min-h-0 h-full rounded-2xl border border-slate-200/60 dark:border-accent/15 overflow-hidden bg-white dark:bg-slate-950 shadow-xs transition-all duration-300 hover:border-slate-300 dark:hover:border-accent/25">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200/50 dark:border-accent/10 select-none">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-1">
            <span className="w-2 h-2 rounded-full bg-rose-500/70" />
            <span className="w-2 h-2 rounded-full bg-amber-500/70" />
            <span className="w-2 h-2 rounded-full bg-emerald-500/70" />
          </div>
          <span className="text-[10px] font-bold text-text-secondary/70 font-mono tracking-wide">{filename}</span>
        </div>
        
        <button
          onClick={handleCopy}
          className="btn-reset p-1.5 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 text-text-secondary/50 hover:text-accent rounded-lg transition-all duration-200 flex items-center gap-1 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-500" />
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest px-0.5">{t('copied') || 'Copiado!'}</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span className="text-[9px] font-black uppercase tracking-widest px-0.5">{t('copy') || 'Copiar'}</span>
            </>
          )}
        </button>
      </div>

      {/* Code Area */}
      <div className="flex-1 p-4 professional-scrollbar">
        <pre className="font-mono text-[11px] font-bold leading-relaxed whitespace-pre-wrap select-text selection:bg-indigo-500/20 text-slate-800 dark:text-slate-100">
          {displayCode}
        </pre>
      </div>
    </div>
  );
}

const getResponseMessages = (response) => {
  if (!response) return [];
  let obj = response;
  if (typeof response === 'string') {
    try {
      obj = JSON.parse(response);
    } catch {
      return [];
    }
  }
  if (typeof obj !== 'object' || obj === null) return [];

  const msgs = [];
  
  if (obj.message && typeof obj.message === 'string') {
    msgs.push(obj.message);
  } else if (obj.responseMessage && typeof obj.responseMessage === 'string') {
    msgs.push(obj.responseMessage);
  }

  const nestedMsg = obj.data?.response?.responseMessage || obj.response?.responseMessage || obj.data?.responseMessage;
  if (nestedMsg && typeof nestedMsg === 'string' && !msgs.includes(nestedMsg)) {
    msgs.push(nestedMsg);
  }

  return msgs;
};

export default function SimulatorHistory({ 
  history, 
  onSelectHistory, 
  onClearHistory 
}) {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);

  return (
    <div className="bg-card rounded-[1rem] border border-accent/10 p-4 sm:p-6 lg:p-8 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <History className="w-24 h-24" />
      </div>
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
          {t('simHistory')}
        </h3>
        {history.length > 0 && (
          <Tooltip title={t('simClearHistory') || 'Limpiar Historial'} arrow placement="top">
            <button 
              onClick={onClearHistory}
              className="btn-reset p-1.5 hover:bg-rose-500/10 rounded-lg text-text-secondary/40 hover:text-rose-500 transition-all cursor-pointer flex items-center justify-center border border-transparent hover:border-rose-500/20"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        )}
      </div>
      <div className="space-y-3 relative z-10">
        {history.length === 0 ? (
          <p className="text-[10px] text-text-secondary/40 font-bold uppercase tracking-widest text-center py-6">
            {t('simNoHistory')}
          </p>
        ) : (
          history.slice(0, 5).map((h) => (
            <div 
              key={h.id} 
              onClick={() => onSelectHistory?.(h)}
              className="flex items-center justify-between hover:bg-accent/5 p-3 rounded-2xl border border-transparent hover:border-accent/10 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${h.status < 400 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
                <div className="flex flex-col">
                  <span className="text-xs font-black text-text-primary uppercase tracking-tight group-hover:text-accent transition-colors">{h.endpoint}</span>
                  <span className="text-[9px] font-bold text-text-secondary/60">{h.method} · {h.time}</span>
                  {getResponseMessages(h.response).map((msg, idx) => (
                    <span key={idx} className="text-[10px] font-bold text-text-secondary/80 mt-0.5 break-all">
                      {msg}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black tracking-widest ${h.status < 400 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {h.status}
                </span>
                <ChevronRight className="w-3 h-3 text-text-secondary/20" />
              </div>
            </div>
          ))
        )}

        {history.length > 5 && (
          <div className="mt-4 pt-2 border-t border-accent/5 flex flex-col items-center">
            <span
              onClick={() => {
                setActiveItem(null);
                setIsModalOpen(true);
              }}
              className="text-[11px] font-bold text-accent hover:text-accent-warm transition-colors uppercase tracking-widest cursor-pointer underline font-black"
            >
              {t('viewFullHistory') ? t('viewFullHistory').replace('{count}', history.length - 5) : `Ver transacciones restantes (${history.length - 5})`}
            </span>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setActiveItem(null);
        }} 
        title={t('simHistory') || "Historial"}
      >
        {activeItem ? (
          <div className="space-y-4 flex flex-col h-full animate-in fade-in duration-300">
            {/* Back button and title */}
            <div className="flex items-center gap-4 pb-3 border-b border-slate-100 dark:border-accent/5">
              <button 
                onClick={() => setActiveItem(null)}
                className="btn-reset flex items-center justify-center text-text-secondary hover:text-accent hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-accent/10 hover:border-slate-300 dark:hover:border-accent/20 rounded-xl transition-all cursor-pointer shrink-0"
                style={{ padding: '8px' }}
                title="Volver al historial"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                    activeItem.status < 400 
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.1)]' 
                      : 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.1)]'
                  }`}>
                    {activeItem.status}
                  </span>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-text-secondary tracking-wider">
                    {activeItem.method}
                  </span>
                  <span className="text-[9px] font-bold text-text-secondary/50 flex items-center gap-1 ml-auto shrink-0">
                    <Clock className="w-3 h-3 opacity-60" /> {activeItem.time}
                  </span>
                </div>
                <h4 className="text-sm sm:text-md font-black text-text-primary uppercase tracking-tight mt-1 truncate">
                  {activeItem.endpoint}
                </h4>
              </div>
            </div>

            {/* Request/Response layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[50vh] md:h-[45vh] mt-2">
              <div className="flex flex-col min-h-0">
                <CodeBlock code={activeItem.request} filename="request.json" />
              </div>
              <div className="flex flex-col min-h-0">
                <CodeBlock code={activeItem.response ? activeItem.response : {}} filename="response.json" />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
            {history.slice(5).map((h) => (
              <div 
                key={h.id} 
                onClick={() => setActiveItem(h)}
                className="flex items-center justify-between hover:bg-accent/5 p-3.5 rounded-2xl border border-slate-200/50 dark:border-accent/10 transition-all cursor-pointer bg-slate-50/30 dark:bg-accent/2 group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${h.status < 400 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-text-primary uppercase tracking-tight group-hover:text-accent transition-colors">{h.endpoint}</span>
                    <span className="text-[9px] font-bold text-text-secondary/60">{h.method} · {h.time}</span>
                    {getResponseMessages(h.response).map((msg, idx) => (
                      <span key={idx} className="text-[10px] font-bold text-text-secondary/80 mt-0.5 break-all">
                        {msg}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black tracking-widest ${h.status < 400 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {h.status}
                  </span>
                  <ChevronRight className="w-3 h-3 text-text-secondary/20" />
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
