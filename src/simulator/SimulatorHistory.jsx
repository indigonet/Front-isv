import React, { useState } from 'react';
import { History, Trash2, ChevronRight, ArrowLeft, Copy, Check, Clock, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (#N -> #1) or 'asc' (#1 -> #N)
  const [pageSize, setPageSize] = useState(10); // 10, 50, 100
  const [currentPage, setCurrentPage] = useState(1);

  const filteredHistory = history.filter((h) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const endpointMatch = h.endpoint?.toLowerCase().includes(term);
    const methodMatch = h.method?.toLowerCase().includes(term);
    const statusMatch = String(h.status).includes(term);
    const timeMatch = h.time?.toLowerCase().includes(term);
    return endpointMatch || methodMatch || statusMatch || timeMatch;
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    const numA = history.length - history.indexOf(a);
    const numB = history.length - history.indexOf(b);
    return sortOrder === 'desc' ? numB - numA : numA - numB;
  });

  const totalPages = Math.max(1, Math.ceil(sortedHistory.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedHistory = sortedHistory.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  return (
    <div className="bg-card rounded-[1rem] border border-accent/10 p-4 sm:p-6 lg:p-8 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <History className="w-24 h-24" />
      </div>
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
            {t('simHistory')}
          </h3>
          {history.length > 0 && (
            <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-accent/10 text-accent border border-accent/20">
              {history.length}
            </span>
          )}
        </div>
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
                setSearchTerm('');
                setCurrentPage(1);
                setIsModalOpen(true);
              }}
              className="text-[11px] font-black text-accent hover:text-accent-warm transition-colors uppercase tracking-widest cursor-pointer underline hover:no-underline"
            >
              {`Ver historial completo (${history.length} transacciones)`}
            </span>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setActiveItem(null);
          setSearchTerm('');
        }} 
        title={`${t('simHistory') || "Historial Completo"} (${history.length})`}
      >
        {activeItem ? (
          <div className="space-y-4 flex flex-col h-full animate-in fade-in duration-200">
            {/* Back button and header info */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200/50 dark:border-accent/15">
              <button 
                onClick={() => setActiveItem(null)}
                className="btn-reset flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-text-secondary hover:text-accent hover:bg-accent/10 border border-slate-200 dark:border-accent/20 rounded-xl transition-all cursor-pointer shrink-0"
                title="Volver al historial"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver</span>
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                    activeItem.status < 400 
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)]' 
                      : 'bg-rose-500/10 text-rose-500 border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.15)]'
                  }`}>
                    {activeItem.status}
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-text-secondary tracking-wider">
                    {activeItem.method}
                  </span>
                  <span className="text-[10px] font-bold text-text-secondary/70 flex items-center gap-1 ml-auto shrink-0">
                    <Clock className="w-3.5 h-3.5 opacity-70" /> {activeItem.time}
                  </span>
                </div>
                <h4 className="text-sm font-black text-text-primary uppercase tracking-tight mt-1 truncate">
                  {activeItem.endpoint}
                </h4>
              </div>
            </div>

            {/* Request & Response code blocks side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[55vh] md:h-[50vh]">
              <div className="flex flex-col min-h-0 h-full">
                <CodeBlock code={activeItem.request} filename="request.json" />
              </div>
              <div className="flex flex-col min-h-0 h-full">
                <CodeBlock code={activeItem.response ? activeItem.response : {}} filename="response.json" />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-3 h-full">
            {/* Top Header: Search Bar + Icon-only Sort Button */}
            <div className="flex items-center justify-between gap-2.5 pb-2 border-b border-slate-200/50 dark:border-slate-800">
              {/* Search Bar */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Buscar por endpoint, estado (200, 400), método..."
                  className="w-full pl-3.5 pr-8 py-1.5 bg-slate-100/90 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-all font-medium"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setCurrentPage(1);
                    }}
                    className="btn-reset absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 bg-transparent hover:bg-transparent border-none text-xs text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-100 cursor-pointer flex items-center justify-center leading-none"
                    title="Limpiar búsqueda"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Icon-Only Sort Button with Cyan Accent Background & White Arrow */}
              <Tooltip title={sortOrder === 'desc' ? 'Ordenar: Mayor a Menor (#)' : 'Ordenar: Menor a Mayor (#)'} arrow placement="top">
                <button
                  type="button"
                  onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                  style={{ backgroundColor: '#0ea5e9', color: '#ffffff' }}
                  className="p-2 rounded-xl !bg-accent hover:!bg-sky-500 !text-white shadow-md border border-accent/40 transition-all cursor-pointer shrink-0 flex items-center justify-center outline-none"
                  aria-label="Ordenar"
                >
                  <ArrowDown className={`w-4 h-4 !text-white transition-transform duration-300 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                </button>
              </Tooltip>
            </div>

            {/* Paginated History Items List - Expandable flex-1 */}
            <div className="space-y-2.5 flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
              {paginatedHistory.length === 0 ? (
                <div className="py-12 text-center text-text-secondary/60 text-xs font-bold uppercase tracking-wider">
                  No se encontraron transacciones
                </div>
              ) : (
                paginatedHistory.map((h, idx) => {
                  const itemNumber = history.length - history.indexOf(h);
                  const responseMsgs = getResponseMessages(h.response);
                  const isSuccess = h.status < 400;

                  return (
                    <div 
                      key={h.id || idx} 
                      onClick={() => setActiveItem(h)}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-700/90 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer group shadow-2xs hover:shadow-xs flex flex-col gap-2"
                    >
                      {/* Top Row: Number, Indicator, Endpoint, Method, Date & Status */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {/* Item Numbering Badge */}
                          <span className="px-2 py-0.5 text-xs font-black font-mono rounded-md bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 shrink-0">
                            #{itemNumber}
                          </span>

                          {/* Status Dot */}
                          <div className={`w-2 h-2 rounded-full shrink-0 ${isSuccess ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'}`} />

                          {/* Endpoint Title */}
                          <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                            {h.endpoint}
                          </span>

                          {/* Method Badge */}
                          <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0">
                            {h.method}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          {/* Date & Time */}
                          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 opacity-60 shrink-0" />
                            <span>{h.time}</span>
                          </span>

                          {/* Status Code Badge */}
                          <span className={`text-[11px] font-bold tracking-wider px-2 py-0.5 rounded-md border ${
                            isSuccess 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                          }`}>
                            {h.status}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 transition-colors" />
                        </div>
                      </div>

                      {/* Bottom Box: Response Summary Messages */}
                      {responseMsgs.length > 0 && (
                        <div className="bg-slate-50 dark:bg-slate-900/90 p-2 rounded-lg border border-slate-200/80 dark:border-slate-700/90 text-[11px] font-medium text-slate-800 dark:text-slate-100 flex flex-col gap-0.5">
                          {responseMsgs.map((msg, mIdx) => (
                            <div key={mIdx} className="flex items-start gap-1.5 break-all">
                              <span className="text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5 text-[10px]">•</span>
                              <span className="line-clamp-2">{msg}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Modest Bottom Pagination & Page Size Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400 shrink-0 select-none">
              <span>
                Mostrando {sortedHistory.length > 0 ? ((safeCurrentPage - 1) * pageSize) + 1 : 0}-{Math.min(safeCurrentPage * pageSize, sortedHistory.length)} de {sortedHistory.length}
              </span>

              <div className="flex items-center gap-3 font-mono">
                {/* Items Per Page Selector (10, 50, 100) */}
                <div className="flex items-center gap-1 font-sans">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Por pág:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-0.5 text-[11px] font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                {/* Modest Page Navigation */}
                <div className="flex items-center gap-1">
                  <button
                    disabled={safeCurrentPage <= 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="btn-reset p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                    title="Página anterior"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    {safeCurrentPage} / {totalPages}
                  </span>

                  <button
                    disabled={safeCurrentPage >= totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="btn-reset p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                    title="Página siguiente"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
