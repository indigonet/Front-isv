import React, { useState, useCallback, useEffect } from 'react';
import { ChevronRight, Layers, History, X, Trash2, Play, RefreshCw, Lock, ShieldCheck, Wand2, HelpCircle, XCircle } from 'lucide-react';

import { COMMAND_METHODS, FIELD_CONFIG } from './simulator.constants';
import { useLanguage } from '../context/LanguageContext';



export default function SimulatorSidebar({
  selectedId, 
  env,
  onEnvChange,
  onLoadTemplate,
  onSyncParam,
  accessToken,
  onClearToken,
  history,
  onSelectHistory,
  onClearHistory,
  onClearResponse,
  params,
  onOpenAuth,
  onSend,
  onCancel,
  loading,
}) {
  const { t } = useLanguage();

  const selected = COMMAND_METHODS.find((m) => m.id === selectedId) ?? COMMAND_METHODS[0];
  const Icon = selected.icon;

  const handleCommandChange = useCallback((id) => {
    const method = COMMAND_METHODS.find((m) => m.id === id);
    if (method) {
      let finalTemplate = { ...method.template };

      // Auto-randomize on LOAD for Sale and Sale Promo
      if (id === 'c2c_sale' || id === 'sale_promo') {
        const base = Math.floor(Math.random() * 99) + 1;
        const randomAmt = (base * 1000) + 990;
        const randomTk = Math.floor(Math.random() * 89999) + 10000;
        
        finalTemplate.amount = randomAmt;
        finalTemplate.ticketNumber = String(randomTk);
      }

      onLoadTemplate(JSON.stringify(finalTemplate, null, 2), method.endpoint, id);
    }
  }, [onLoadTemplate]);

  const formatCLP = (num) => {
    if (!num && num !== 0) return '';
    return `$ ${Number(num).toLocaleString('es-CL')}`;
  };

  const parseCLP = (str) => {
    return Number(str.replace(/[^0-9]/g, ''));
  };

  const handleParamChange = useCallback((field, rawValue) => {
    let finalValue = rawValue;
    if (field === 'amount') {
      finalValue = parseCLP(String(rawValue));
    } else if (field === 'idPromo' || field === 'serialNumber') {
      finalValue = String(rawValue).toUpperCase();
    } else if (typeof rawValue !== 'boolean' && FIELD_CONFIG[field]?.type === 'number') {
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
            className={`relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none border-2 ${
              value 
                ? 'border-accent/60 shadow-lg shadow-accent/10' 
                : 'border-text-secondary/20'
            }`}
             style={{ 
              backgroundColor: value ? 'rgb(51, 65, 85)' : 'rgb(229, 231, 235)',
              transition: 'background-color 0.3s ease'
             }}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-all duration-300 shadow-sm ${
                value 
                  ? 'translate-x-5 bg-white scale-110 shadow-accent/40' 
                  : 'translate-x-0 bg-white'
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
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest leading-none">
            {t(cfg.label)}
          </span>
        </div>
        <input
          type={field === 'amount' ? 'text' : cfg.type}
          value={field === 'amount' ? formatCLP(value) : value}
          onChange={(e) => handleParamChange(field, e.target.value)}
          maxLength={field === 'serialNumber' ? 20 : undefined}
          className="w-full bg-background border border-accent/10 rounded-xl px-3 py-2.5 outline-none focus:border-accent transition-all font-black text-text-primary text-sm shadow-sm"
        />
      </label>
    );
  };

  return (
    <div className="lg:col-span-4 space-y-6">

      {/* ── Main card ── */}
      <div className="bg-card rounded-[2.5rem] border border-accent/10 p-4 sm:p-6 lg:p-8 shadow-xl space-y-6">

        {/* Command selector */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
            {t('simCommand')}
          </h3>

          <div className="relative">
            <select
              value={selectedId}
              onChange={(e) => handleCommandChange(e.target.value)}
              className="w-full appearance-none bg-background border border-accent/10 rounded-2xl px-5 py-3.5 pr-10 font-black text-text-primary text-sm outline-none focus:border-accent transition-all cursor-pointer shadow-sm"
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
            {(selected.id === 'sale_promo' || selected.id === 'c2c_mode' || selected.id === 'bioauth') && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const el = e.currentTarget.nextElementSibling;
                    if (el) el.classList.toggle('opacity-100');
                    if (el) el.classList.toggle('pointer-events-none');
                  }}
                  className="p-1 transition-colors hover:text-accent text-accent/40 cursor-help"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
                <div className="absolute right-0 bottom-full mb-2 w-48 p-3 bg-card border border-accent/20 rounded-xl shadow-2xl opacity-0 md:group-hover:opacity-100 pointer-events-none transition-all duration-300 z-50 text-[9px] font-bold text-text-secondary leading-relaxed backdrop-blur-md translate-y-2 group-hover:translate-y-0">
                  {t('simVersionNotice') && t('simVersionNotice') !== 'simVersionNotice' 
                    ? t('simVersionNotice') 
                    : 'Este comando al igual que el de c2cmode son solo para las versiones 1.0.1 de iOnetech'}
                </div>
              </div>
            )}
            {selected.fields.length > 0 && (
              <span className={`text-[9px] font-bold px-2 py-1 rounded-lg bg-white/10 ${selected.color} uppercase tracking-widest shrink-0 hidden md:flex items-center gap-1.5`}>
                <span className="opacity-50">{selected.fields.length}</span>
                <span>{t('simParamsCount')}</span>
              </span>
            )}
          </div>
        </div>

        {/* Dynamic params */}
        {selected.fields.length > 0 && (
          <>
            <div className="border-t border-accent/5" />
              <div className="grid grid-cols-2 gap-2">
                {selected.fields.map(renderField)}
              </div>
          </>
        )}

        {/* Send Button (Visible ONLY on small screens for mobile UX) */}
        <div className="sm:hidden pt-2">
           <button
            onClick={loading ? onCancel : onSend}
            disabled={!loading && !accessToken}
            className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl text-xs uppercase tracking-widest ${
              loading
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20 cursor-pointer'
                : !accessToken 
                  ? 'bg-text-secondary/10 text-text-secondary/40 cursor-not-allowed border border-dashed border-text-secondary/20 grayscale shadow-none' 
                  : 'bg-accent hover:bg-accent-warm text-white glow shadow-accent/20 cursor-pointer'
            }`}
          >
            {loading ? (
              <>
                <XCircle className="w-4 h-4" />
                <span>Cancelar</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current outline-none" />
                <span>{t('simSendBtn')}</span>
                {!accessToken && <Lock className="w-3.5 h-3.5 opacity-50 ml-1" />}
              </>
            )}
          </button>
        </div>

        {/* Print service note */}
        {selectedId === 'print_service' && (
          <p className="text-[9px] text-text-secondary/60 font-bold px-1 -mt-2">
            ℹ️ {t('simDetailsNotice')}
          </p>
        )}

        {/* Token status & Actions */}
        <div className="border-t border-accent/5 pt-6 space-y-3">
          {accessToken ? (
            <div 
              onClick={() => {
                if (window.confirm(t('confirmClearToken'))) {
                  onClearToken();
                }
              }} 
              className="group relative overflow-hidden bg-gradient-to-r from-emerald-500/[0.03] to-emerald-500/[0.08] border border-emerald-500/20 rounded-2xl p-4 transition-all duration-500 hover:shadow-lg hover:shadow-emerald-500/5 hover:border-emerald-500/40 cursor-pointer active:scale-95"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{t('tokenActive')}</span>
                </div>
                <div className="p-1.5 bg-rose-500 group-hover:bg-rose-600 rounded-lg text-white transition-all shadow-lg shadow-rose-500/10">
                  <Trash2 className="w-3 h-3" />
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="w-full p-4 bg-accent/[0.03] border border-accent/20 rounded-2xl flex items-center justify-between hover:bg-accent/[0.08] hover:border-accent transition-all cursor-pointer group active:scale-95 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-accent/10 text-accent group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-accent uppercase tracking-widest">
                  {t('simNoToken')}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-accent/40 group-hover:translate-x-1 transition-transform" />
            </button>
          )}

        </div>
      </div>

    </div>
  );
}
