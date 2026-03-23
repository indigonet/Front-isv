import React, { useEffect, useRef } from 'react';
import { Braces, ShieldCheck, UserCheck, Key, Eye, EyeOff, Lock } from 'lucide-react';
import Modal from '../components/modal/Modal';
import { useLanguage } from '../context/LanguageContext';

/**
 * Auth token configuration modal.
 * Receives all state / actions from the useSimulatorAuth hook via props.
 */
export default function AuthTokenModal({
  isOpen,
  onClose,
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

  // Auto-close on successful token fetch
  useEffect(() => {
    // If it WAS fetching and now it's NOT fetching, AND we have a token
    if (prevFetching.current && !fetching && accessToken && isOpen) {
      const timer = setTimeout(() => onClose(), 800);
      return () => clearTimeout(timer);
    }
    prevFetching.current = fetching;
  }, [accessToken, fetching, isOpen, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('tokenConfigBtn')}>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ── Left: credentials form ── */}
          <div className="space-y-4">
            {/* Client ID */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">
                {t('clientIdLabel')}
              </label>
              <div className="relative group">
                <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-accent transition-colors" />
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-background border border-accent/10 rounded-xl py-3 pl-12 pr-6 text-sm font-bold text-text-primary focus:border-accent outline-none transition-all shadow-sm truncate"
                  placeholder="Client ID"
                />
              </div>
            </div>

            {/* Client Secret */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">
                {t('clientSecretLabel')}
              </label>
              <div className="relative group">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-accent transition-colors" />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 text-text-secondary hover:text-accent cursor-pointer transition-colors p-2 rounded-lg bg-background/50 backdrop-blur-sm"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 ml-1" />}
                </button>
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  className="w-full bg-background border border-accent/10 rounded-xl py-3 pl-12 pr-20 text-sm font-bold text-text-primary focus:border-accent outline-none transition-all shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Get token button */}
            <button
              onClick={fetchToken}
              disabled={fetching || !clientId?.trim() || !clientSecret?.trim()}
              className="w-full py-5 rounded-2xl bg-accent text-white hover:bg-accent-warm transition-all font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 text-xs shadow-xl shadow-accent/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale disabled:pointer-events-none"
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
