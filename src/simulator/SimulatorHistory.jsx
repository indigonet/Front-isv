import React from 'react';
import { History, Trash2, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function SimulatorHistory({ 
  history, 
  onSelectHistory, 
  onClearHistory 
}) {
  const { t } = useLanguage();

  return (
    <div className="bg-card rounded-[2.5rem] border border-accent/10 p-4 sm:p-6 lg:p-8 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <History className="w-24 h-24" />
      </div>
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
          {t('simHistory')}
        </h3>
        {history.length > 0 && (
          <button 
            onClick={onClearHistory}
            className="p-1.5 hover:bg-rose-500/10 rounded-lg text-text-secondary/40 hover:text-rose-500 transition-all cursor-pointer"
            title={t('simClearHistory') || 'Limpiar Historial'}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <div className="space-y-3 relative z-10">
        {history.length === 0 ? (
          <p className="text-[10px] text-text-secondary/40 font-bold uppercase tracking-widest text-center py-6">
            {t('simNoHistory')}
          </p>
        ) : (
          history.map((h) => (
            <div 
              key={h.id} 
              onClick={() => onSelectHistory?.(h)}
              className="flex items-center justify-between hover:bg-accent/5 p-3 rounded-2xl border border-transparent hover:border-accent/10 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${h.status < 400 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
                <div className="flex flex-col">
                  <span className="text-xs font-black text-text-primary uppercase tracking-tight group-hover:text-accent transition-colors">{h.endpoint}</span>
                  <span className="text-[9px] font-bold text-text-secondary/60">{h.method} · {h.time}</span>
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
      </div>
    </div>
  );
}
