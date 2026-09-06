import React from 'react';
import { ServerOff, AlertTriangle, RefreshCw, ShieldAlert } from 'lucide-react';

export default function OutOfService() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#0f172a] text-slate-100 p-4 sm:p-6 select-none font-sans">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphic Container */}
      <div className="relative z-10 max-w-lg w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl text-center flex flex-col items-center gap-6">
        
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold tracking-wide uppercase">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          Estado: Fuera de Servicio
        </div>

        {/* Icon with Glowing Ring */}
        <div className="relative flex items-center justify-center mt-2">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-red-500/20 to-amber-500/20 blur-xl animate-pulse" />
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center shadow-inner relative z-10">
            <ServerOff className="w-10 h-10 sm:w-12 sm:h-12 text-red-400" />
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Página Fuera de Servicio
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-sm mx-auto">
            El acceso a esta plataforma ha sido deshabilitado temporalmente. Disculpa las molestias ocasionadas.
          </p>
        </div>

        {/* Info Box */}
        <div className="w-full bg-slate-950/50 rounded-xl p-4 border border-slate-800/60 flex items-start gap-3 text-left">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">¿Necesitas soporte técnico?</p>
            <p>Por favor ponte en contacto con el administrador del sistema para más detalles.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 w-full flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleReload}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 active:scale-[0.98] border border-slate-700 text-sm font-medium text-slate-200 transition-all cursor-pointer shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
        </div>

        {/* Footer note */}
        <div className="text-[11px] text-slate-500 mt-2">
          Código 404 / 503 • Portal Suspendido
        </div>
      </div>
    </div>
  );
}
