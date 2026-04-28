import React, { useEffect, useRef } from 'react';
import { Braces, ShieldCheck, UserCheck, Key, Eye, EyeOff, Lock } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import Modal from '../components/modal/Modal';
import { useLanguage } from '../context/LanguageContext';

/**
 * Auth token configuration modal.
 * Receives all state / actions from the useSimulatorAuth hook via props.
 */
export default function AuthTokenModal({
  isOpen,
  onClose,
  env,
  country,
  onEnvChange,
  // from useSimulatorAuth
  clientId,
  setClientId,
  clientSecret,
  setClientSecret,
  accessToken,
  showSecret,
  setShowSecret,
  fetching,
  fetchToken,
  clearToken,
}) {
  const { t } = useLanguage();
  const prevFetching = useRef(fetching);
  const recaptchaRef = useRef();

  // Auto-close on successful token fetch
  useEffect(() => {
    // If it WAS fetching and now it's NOT fetching, AND we have a token
    if (prevFetching.current && !fetching && accessToken && isOpen) {
      const timer = setTimeout(() => onClose(), 800);
      return () => clearTimeout(timer);
    }
    prevFetching.current = fetching;
  }, [accessToken, fetching, isOpen, onClose]);

  const modalTitle = (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
      <span className="text-sm sm:text-xl truncate">{t('tokenConfigBtn')}</span>
      <span className="hidden sm:inline text-text-secondary/40 font-normal">-</span>
      <div className="flex items-center gap-2 bg-accent/5 sm:bg-transparent px-2.5 py-1 sm:p-0 rounded-lg border border-accent/10 sm:border-none w-fit">
        <img 
          src={`https://flagcdn.com/w20/${country}.png`} 
          alt={country} 
          className="w-4 sm:w-5 rounded-[2px] shadow-sm shrink-0"
        />
        <span className={`${country === 'cl' ? 'text-indigo-500' : 'text-sky-500'} text-[10px] sm:text-lg font-black uppercase tracking-widest`}>
          {country === 'cl' ? 'Chile' : 'Argentina'}
        </span>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ── Environment & Credentials ── */}
          <div className="space-y-6">
            {/* Environment selection (NEW) */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">
                {t('simEnv')}
              </label>
              <div className="relative group">
                <select
                  value={env}
                  onChange={(e) => {
                    const newEnv = e.target.value;
                    if (accessToken && !window.confirm(t('confirmClearToken'))) return;
                    if (accessToken) clearToken();
                    onEnvChange(newEnv);
                  }}
                  className={`w-full appearance-none bg-background border border-indigo-500/10 rounded-lg py-3.5 px-5 text-xs font-black uppercase tracking-widest outline-none transition-all shadow-sm cursor-pointer pr-10 ${
                    env === 'prod' ? 'text-rose-500 border-rose-500/20' : env === 'uat' ? 'text-indigo-500 border-indigo-500/20' : 'text-emerald-500 border-emerald-500/20'
                  } focus:ring-4 focus:ring-indigo-500/5`}
                >
                  <option value="dev">DEV - Ambiente Desarrollo</option>
                  <option value="uat">UAT - Ambiente Pruebas</option>
                  <option value="prod">PROD - Ambiente Producción</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-4">
            {/* Client ID */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-70">
                {t('clientIdLabel')}
              </label>
              <div className="relative group">
                <UserCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500/30 group-focus-within:text-indigo-500 transition-colors z-20 pointer-events-none" />
                
                <input
                  id="clientIdInput"
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="peer w-full bg-background border border-indigo-500/10 rounded-xl py-4 pl-14 pr-14 text-sm font-bold text-text-primary focus:border-indigo-500 outline-none transition-all shadow-sm"
                  placeholder="Client ID"
                />

                {/* Preview Overlay: Static, non-scrollable view when not focused */}
                {clientId && (
                  <div 
                    className="absolute inset-y-0 left-14 right-14 flex items-center pointer-events-none peer-focus:hidden bg-background z-10"
                  >
                    <span className="text-sm font-bold text-text-primary truncate block w-full">
                      {clientId}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Client Secret */}
            <div className="space-y-2 mt-5">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-70">
                {t('clientSecretLabel')}
              </label>
              <div className="relative group">
                <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500/30 group-focus-within:text-indigo-500 transition-colors z-20 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 z-20 text-text-secondary/30 hover:text-indigo-500 transition-colors cursor-pointer"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  className="w-full bg-background border border-indigo-500/10 rounded-xl py-4 pl-14 pr-16 text-sm font-bold text-text-primary focus:border-indigo-500 outline-none transition-all shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Google ReCAPTCHA Invisible */}
            <ReCAPTCHA
              ref={recaptchaRef}
              size="invisible"
              sitekey={(import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI").trim()} // Limpia espacios accidentales
            />

            {/* Get token button */}
            <button
              onClick={async (e) => {
                e.preventDefault();
                try {
                  const token = await recaptchaRef.current.executeAsync();
                  if (token) {
                    fetchToken();
                    recaptchaRef.current.reset();
                  }
                } catch (error) {
                  console.error('Error en ReCAPTCHA:', error);
                }
              }}
              disabled={fetching || !clientId?.trim() || !clientSecret?.trim()}
              className="w-full py-5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 text-xs shadow-[0_12px_24px_-8px_rgba(79,70,229,0.5)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale disabled:pointer-events-none"
            >
              {fetching ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('fetchingToken')}
                </div>
              ) : (
                <>
                  <Braces className="w-5 h-5 text-white" />
                  {t('fetchTokenBtn')}
                </>
              )}
            </button>
            </div>
          </div>

          {/* ── Right: token status panel ── */}
          <div
            className="rounded-3xl p-6 border space-y-4 flex flex-col justify-between h-full transition-all duration-500"
            style={{
              borderColor: accessToken ? 'rgba(5, 150, 105, 0.3)' : 'rgba(2, 132, 199, 0.2)',
              background:  accessToken ? 'rgba(5, 150, 105, 0.05)' : 'rgba(2, 132, 199, 0.05)',
            }}
          >
            <div className="space-y-3">
              {/* Status indicator */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full shrink-0 transition-all ${
                    accessToken
                      ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)] animate-pulse'
                      : 'bg-text-secondary/20'
                  }`}
                />
                <h4
                  className={`text-[11px] font-black uppercase tracking-widest ${
                    accessToken ? 'text-emerald-500' : 'text-text-secondary/40'
                  }`}
                >
                  {accessToken ? t('tokenActive') : t('tokenMissing')}
                </h4>
              </div>
              {/* Token value or empty state */}
              {accessToken ? (
                <div className="space-y-2">
                  <div className="p-3 bg-background border border-emerald-500/20 rounded-2xl break-all font-mono text-[10px] text-emerald-500 font-bold max-h-[120px] overflow-auto custom-scrollbar leading-relaxed">
                    {accessToken}
                  </div>
                  <p className="text-[9px] text-text-secondary ml-1 transition-colors">
                    {t('tokenInfo')}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-3 opacity-40">
                  <ShieldCheck className="w-10 h-10 text-text-secondary" />
                  <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">
                    {t('tokenGuide')}
                  </p>
                </div>
              )}
            </div>

            {/* Clear button */}
            {accessToken && (
              <button
                onClick={clearToken}
                className="w-full py-3 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition-all font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                {t('simClearBtn')}
              </button>
            )}
          </div>
        </div>

        {/* Privacy Note */}
        <div className="pt-4 border-t border-accent/5 flex items-center gap-3 opacity-60">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Lock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="space-y-0.5">
          </div>
        </div>
      </div>
    </Modal>
  );
}
