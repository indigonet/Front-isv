import React, { useState, useCallback, useEffect } from 'react';
import { ChevronRight, Layers, History, X, Trash2 } from 'lucide-react';

import { COMMAND_METHODS, FIELD_CONFIG } from './simulator.constants';
import { useLanguage } from '../context/LanguageContext';



export default function SimulatorSidebar({
  env,
  onEnvChange,
  onLoadTemplate,   // (bodyStr, endpoint) => void
  onSyncParam,      // (field, value) => void
  accessToken,
  onClearToken,
  history,
  onClearResponse,
  params,
}) {
  const { t } = useLanguage();
  const [selectedId, setSelectedId] = useState(COMMAND_METHODS[0].id);

  const selected = COMMAND_METHODS.find((m) => m.id === selectedId) ?? COMMAND_METHODS[0];
  const Icon = selected.icon;

  const handleCommandChange = useCallback((id) => {
    setSelectedId(id);
    const method = COMMAND_METHODS.find((m) => m.id === id);
    if (method) {
      // Use the template from the selected method
      onLoadTemplate(JSON.stringify(method.template, null, 2), method.endpoint);
    }
  }, [onLoadTemplate]);

  const handleParamChange = useCallback((field, rawValue) => {
    let finalValue = rawValue;
    if (typeof rawValue !== 'boolean' && FIELD_CONFIG[field]?.type === 'number') {
      finalValue = rawValue === '' ? '' : Number(rawValue);
    }
    onSyncParam(field, finalValue);
  }, [onSyncParam]);

  // Auto-save POS config whenever the triad changes
  useEffect(() => {
    if (params.idTerminal !== undefined) localStorage.setItem('isv_pos_idTerminal', params.idTerminal);
    if (params.idSucursal !== undefined) localStorage.setItem('isv_pos_idSucursal', params.idSucursal);
    if (params.serialNumber !== undefined) localStorage.setItem('isv_pos_serialNumber', params.serialNumber);
  }, [params.idTerminal, params.idSucursal, params.serialNumber]);

  // ── Render one input field based on its FIELD_CONFIG type ──────────────────
  const renderField = (field) => {
    const cfg = FIELD_CONFIG[field];
    if (!cfg) return null;
    const value = params[field] ?? (cfg.type === 'toggle' ? false : '');

    if (cfg.type === 'toggle') {
      return (
        <label
          key={field}
          className={`col-span-2 flex items-center justify-between p-3 bg-background border border-accent/10 rounded-xl cursor-pointer hover:border-accent/30 transition-all select-none`}
        >
          <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
            {field === 'c2cMode' ? (value ? t('simDesatendido') : t('simAtendido')) : t(cfg.label)}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={Boolean(value)}
            onClick={() => handleParamChange(field, !value)}
            className={`relative w-10 h-5 rounded-full transition-all duration-300 focus:outline-none border-2 ${
              value 
                ? 'bg-accent border-accent shadow-lg shadow-accent/30' 
                : 'bg-transparent border-text-secondary/30'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full shadow transition-all duration-300 ${
                value 
                  ? 'translate-x-5 bg-white scale-110' 
                  : 'translate-x-0 bg-text-secondary/40'
              }`}
            />
          </button>
        </label>
      );
    }

    return (
      <label
        key={field}
        className={`block space-y-1.5 ${cfg.span === 2 ? 'col-span-2' : ''}`}
      >
        <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">
          {t(cfg.label)}
        </span>
        <input
          type={cfg.type}
          value={value}
          onChange={(e) => handleParamChange(field, e.target.value)}
          className="w-full bg-background border border-accent/10 rounded-xl px-3 py-2.5 outline-none focus:border-accent transition-all font-black text-text-primary text-sm shadow-sm"
        />
      </label>
    );
  };

  return (
    <div className="lg:col-span-4 space-y-6">

      {/* ── Main card ── */}
      <div className="bg-card rounded-[2.5rem] border border-accent/10 p-8 shadow-xl space-y-6">

        {/* Environment toggle */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent" /> {t('simEnv')}
          </h3>
          <div className="flex p-1.5 gap-2 bg-accent/5 rounded-2xl border border-accent/10">
            <button
              onClick={() => onEnvChange('uat')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all cursor-pointer ${
                env === 'uat' ? 'bg-accent text-white shadow-lg' : 'text-text-secondary hover:bg-accent/5'
              }`}
            >
              UAT
            </button>
            <button
              onClick={() => onEnvChange('prod')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all cursor-pointer ${
                env === 'prod' ? 'bg-rose-600 text-white shadow-lg' : 'text-text-secondary hover:bg-accent/5'
              }`}
            >
              {t('simProdEnv')}
            </button>
          </div>
        </div>

        <div className="border-t border-accent/5" />

        {/* Command selector */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
            {t('simCommand')}
          </h3>

          <div className="relative">
            <select
              value={selectedId}
              onChange={(e) => handleCommandChange(e.target.value)}
              className="w-full appearance-none bg-background border border-accent/10 rounded-2xl px-5 py-4 pr-10 font-black text-text-primary text-sm outline-none focus:border-accent transition-all cursor-pointer shadow-sm"
            >
              {COMMAND_METHODS.map((m) => (
                <option key={m.id} value={m.id}>{t(m.label)}</option>
              ))}
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary rotate-90 pointer-events-none" />
          </div>

          {/* Command card */}
          <div className={`p-4 rounded-2xl ${selected.bg} border border-white/5 flex items-center gap-4 animate-in fade-in duration-200`}>
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm shrink-0">
              <Icon className={`w-5 h-5 ${selected.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-black tracking-tight ${selected.color} uppercase leading-tight`}>
                {t(selected.label)}
              </p>
              <p className="text-[9px] text-text-secondary/60 font-bold mt-0.5">
                /{selected.endpoint.toUpperCase()} · CMD {selected.template.command ?? '—'}
              </p>
            </div>
            {selected.fields.length > 0 && (
              <span className={`text-[9px] font-black px-2 py-1 rounded-lg bg-white/10 ${selected.color} uppercase tracking-widest shrink-0`}>
                {selected.fields.length} {t('simParamsCount')}
              </span>
            )}
          </div>
        </div>

        {/* Dynamic params */}
        {selected.fields.length > 0 && (
          <>
            <div className="border-t border-accent/5" />
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
                {t('simParams')}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {selected.fields.map(renderField)}
              </div>
              <button
                onClick={onClearResponse}
                className="w-full mt-4 py-2.5 rounded-xl border border-accent/10 text-text-secondary hover:bg-accent/5 hover:text-accent transition-all font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 cursor-pointer active:scale-95 group"
              >
                <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                {t('simClearResponse')}
              </button>
            </div>
          </>
        )}

        {/* Print service note */}
        {selectedId === 'print_service' && (
          <p className="text-[9px] text-text-secondary/60 font-bold px-1 -mt-2">
            ℹ️ {t('simDetailsNotice')}
          </p>
        )}

        {/* Token status */}
        <div className="border-t border-accent/5 pt-2">
          {accessToken ? (
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center justify-between animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter truncate">Token Activo</span>
              </div>
              <button 
                onClick={() => {
                  if (window.confirm(t('confirmClearToken'))) {
                    onClearToken();
                  }
                }} 
                className="p-1 hover:bg-rose-500/10 rounded-full text-rose-500 transition-colors cursor-pointer group"
                title={t('simClearBtn')}
              >
                <X className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          ) : (
            <div className="p-3 bg-text-secondary/5 border border-text-secondary/10 rounded-2xl flex items-center gap-2 opacity-50">
              <div className="w-2 h-2 rounded-full bg-text-secondary/30 shrink-0" />
              <span className="text-[10px] font-black text-text-secondary uppercase tracking-tighter">{t('simNoToken')}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── History card ── */}
      <div className="bg-card rounded-[2.5rem] border border-accent/10 p-8 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <History className="w-24 h-24" />
        </div>
        <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-6 relative z-10">
          {t('simHistory')}
        </h3>
        <div className="space-y-3 relative z-10">
          {history.length === 0 ? (
            <p className="text-[10px] text-text-secondary/40 font-bold uppercase tracking-widest text-center py-6">
              {t('simNoHistory')}
            </p>
          ) : (
            history.map((h) => (
              <div key={h.id} className="flex items-center justify-between hover:bg-accent/5 p-2 rounded-xl transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${h.status < 400 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-text-primary uppercase tracking-tight">{h.endpoint}</span>
                    <span className="text-[9px] font-bold text-text-secondary/60">{h.method} · {h.time}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-black tracking-widest ${h.status < 400 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {h.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
