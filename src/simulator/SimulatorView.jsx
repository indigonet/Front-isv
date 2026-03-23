import React, { useState } from 'react';
import { Play, ShieldCheck, Copy, Code2, Cpu, RefreshCw, Cloud, Terminal, Activity, ShieldAlert, Zap, Lock, XCircle, ChevronUp } from 'lucide-react';

import { EXAMPLE_BODY_C2C_SALE, API_BASE, COMMAND_METHODS } from './simulator.constants';
import { useSimulatorAuth }                from './useSimulatorAuth';
import AuthTokenModal                      from './AuthTokenModal';
import SimulatorSidebar                    from './SimulatorSidebar';
import SimulatorHistory                    from './SimulatorHistory';
import Modal                               from '../components/modal/Modal';
import { useLanguage }                     from '../context/LanguageContext';

export default function SimulatorView({ onLog }) {
  const { t } = useLanguage();
  // ── Request state ──────────────────────────────────────────────
  // ── Request state ──────────────────────────────────────────────
  const [method,   setMethod]   = useState('POST');
  const [env,      setEnv]      = useState('uat');
  const [selectedId, setSelectedId] = useState(COMMAND_METHODS[0].id);
  const [url,      setUrl]      = useState(API_BASE.uat + 'poll');
  const [body,     setBody]     = useState(JSON.stringify(COMMAND_METHODS[0].template, null, 2));
  const [loading,  setLoading]  = useState(false);
  const [response, setResponse] = useState(null);
  const [abortController, setAbortController] = useState(null);
  
  // Initialize with localStorage if available for the triad
  const [params,   setParams]   = useState(() => {
    const template = { ...COMMAND_METHODS[0].template };
    
    // Auto-randomize if initial command is a sale
    if (COMMAND_METHODS[0].id === 'c2c_sale' || COMMAND_METHODS[0].id === 'sale_promo') {
      const base = Math.floor(Math.random() * 99) + 1;
      template.amount = (base * 1000) + 990;
      template.ticketNumber = String(Math.floor(Math.random() * 89999) + 10000);
    }

    return {
      ...template,
      idTerminal:   localStorage.getItem('isv_pos_idTerminal')   || template.idTerminal,
      idSucursal:   localStorage.getItem('isv_pos_idSucursal')   || template.idSucursal,
      serialNumber: localStorage.getItem('isv_pos_serialNumber') || template.serialNumber,
    };
  });

  // ── Request history ─────────────────────────────────────────────
  const [history, setHistory] = useState([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  // ── Auth modal ──────────────────────────────────────────────────
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [show401Prompt,   setShow401Prompt]   = useState(false);
  const [country,         setCountry]         = useState('cl'); // cl | ar
  const [showJumpBtn,     setShowJumpBtn]     = useState(false);
  const [lastScrollY,     setLastScrollY]     = useState(0);

  // ── Auth hook (token logic lives here) ─────────────────────────
  const auth = useSimulatorAuth({ env, onLog });

  // ── Handlers ───────────────────────────────────────────────────
  const handleEnvChange = (newEnv) => {
    setEnv(newEnv);
    const endpoint = url.split('/').pop() || 'sale';
    setUrl(API_BASE[newEnv] + endpoint);
    if (onLog) onLog(`Entorno: ${newEnv.toUpperCase()}`, 'info');
  };

  // Sync body and persist triad whenever params change
  React.useEffect(() => {
    setBody(JSON.stringify(params, null, 2));
    
    // Auto-save POS config triad
    if (params.idTerminal)   localStorage.setItem('isv_pos_idTerminal',   params.idTerminal);
    if (params.idSucursal)   localStorage.setItem('isv_pos_idSucursal',   params.idSucursal);
    if (params.serialNumber) localStorage.setItem('isv_pos_serialNumber', params.serialNumber);
  }, [params]);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show only on mobile, after 400px, and ONLY when scrolling DOWN
      if (window.innerWidth < 1024) {
        const isScrollingDown = currentScrollY > lastScrollY;
        const isPastThreshold = currentScrollY > 400;
        
        setShowJumpBtn(isScrollingDown && isPastThreshold);
      } else {
        setShowJumpBtn(false);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const scrollToCommands = () => {
    const anchor = document.getElementById('mobile-commands-anchor');
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Called by SimulatorSidebar when a command is selected
  const handleLoadTemplate = (bodyStr, endpoint, cmdId) => {
    setSelectedId(cmdId);
    try {
      const template = JSON.parse(bodyStr);
      // Preserve current triad when switching templates
      const mergedParams = {
        ...template,
        idTerminal:   params.idTerminal   || template.idTerminal,
        idSucursal:   params.idSucursal   || template.idSucursal,
        serialNumber: params.serialNumber || template.serialNumber,
      };
      setParams(mergedParams); 
    } catch {
      setBody(bodyStr);
    }
    setUrl(API_BASE[env] + endpoint);
    setResponse(null);
    if (onLog) onLog(`Plantilla cargada → /${endpoint}`, 'info');
  };

  // Called by SimulatorSidebar when a param input changes
  const handleSyncParam = (field, value) => {
    setParams(prev => ({ ...prev, [field]: value }));
  };

  const handleSend = async () => {
    let currentParams = { ...params };
    const currentBodyStr = JSON.stringify(currentParams, null, 2);

    if (loading) return;

    // ── Validation ──────────────────────────────────────────────
    if (!currentParams.idTerminal || !currentParams.idSucursal || !currentParams.serialNumber) {
      if (!window.confirm(t('simTriadWarn'))) return;
    }

    if (selectedId === 'c2c_sale' || selectedId === 'sale_promo') {
      if (!currentParams.amount || currentParams.amount <= 0) {
        if (onLog) onLog('❌ Error: El monto es inválido', 'error');
        setLoading(false);
        return;
      }
      if (!currentParams.ticketNumber) {
        if (onLog) onLog('❌ Error: El número de ticket es requerido', 'error');
        setLoading(false);
        return;
      }
    }
    // ────────────────────────────────────────────────────────────

    setLoading(true);
    const controller = new AbortController();

    if (auth.accessToken) {
      if (onLog) onLog(`🔑 Token cargado: ${auth.accessToken.substring(0, 30)}...`, 'info');
    } else {
      if (onLog) onLog('⚠️ Sin token — el request irá SIN Authorization header', 'error');
    }
    if (onLog) onLog(`→ ${method} ${url}`, 'info');

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (auth.accessToken) headers['Authorization'] = `Bearer ${auth.accessToken}`;

      const options = { 
        method, 
        headers,
        body: method !== 'GET' && method !== 'HEAD' ? currentBodyStr : undefined,
        signal: controller.signal
      };

      setAbortController(controller);

      const startTime = Date.now();
      const res       = await fetch(url, options);
      const endTime   = Date.now();

      let data;
      const ct = res.headers.get('content-type');
      data = ct?.includes('application/json') ? await res.json() : await res.text();

      setResponse(data);
      setHistory((prev) => [{
        id:       `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        method,
        endpoint: url.split('/').pop() || '/sale',
        status:   res.status,
        request:  currentBodyStr,
        response: data,
        time:     new Date().toLocaleTimeString('es-CL', { hour12: false }),
      }, ...prev]);

      if (res.ok) {
        if (onLog) onLog(`✅ ${res.status} OK (${endTime - startTime}ms)`, 'success');
      } else {
        if (onLog) onLog(`❌ ${res.status} — ${JSON.stringify(data).substring(0, 120)}`, 'error');
        if (res.status === 401) setShow401Prompt(true);
      }

      // Auto-scroll to response on mobile (success or error)
      if (window.innerWidth < 1024) {
        setTimeout(() => {
          const responseEl = document.getElementById('response-view');
          if (responseEl) {
            responseEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        if (onLog) onLog('🚫 Petición cancelada por el usuario', 'info');
      } else {
        console.error('Request Error:', error);
        if (onLog) onLog(`Error: ${error.message}`, 'error');
        setResponse({ error: error.message });
      }
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  };

  const handleCancel = () => {
    if (abortController) {
      const confirmMsg = t('cancelConfirm') || 'La transacción seguirá por el servicio pero si cancelas no podrás ver la respuesta en esta pantalla.';
      if (window.confirm(confirmMsg)) {
        abortController.abort();
        setAbortController(null);
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    if (onLog) onLog(t('simCopied'), 'success');
  };

  const handleClearResponse = () => setResponse(null);
  
  const handleClearHistory = () => {
    if (window.confirm(t('confirmClearHistory') || '¿Estás seguro de que deseas borrar el historial de transacciones?')) {
      setHistory([]);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full py-8 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden transition-colors duration-500">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent pointer-events-none opacity-40" />
      
      <div className="max-w-[1700px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-12 relative z-10">

        {/* Header Content */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-10 bg-card rounded-[2.5rem] border border-accent/10 relative overflow-hidden shadow-2xl transition-colors duration-500">
          <div className="absolute inset-0 bg-grid-white/[0.02] dark:bg-grid-white/[0.02] bg-grid-black/[0.02] pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-accent to-blue-600 rounded-2xl shadow-xl shadow-accent/20">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tighter uppercase transition-colors">
                {t('simulatorTitle')}
              </h2>
            </div>
            <p className="text-text-secondary font-medium pl-1 text-sm sm:text-base transition-colors">{t('simulatorDesc')}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 bg-accent text-white hover:bg-accent-warm rounded-xl transition-all font-black uppercase tracking-widest text-[9px] flex items-center gap-2.5 active:scale-95 shadow-lg shadow-accent/20 cursor-pointer glow"
            >
              <ShieldCheck className="w-4 h-4" /> TOKEN
            </button>

            {auth.accessToken && (
              <div 
                onClick={() => copyToClipboard(`Bearer ${auth.accessToken}`)}
                className="flex items-center gap-2.5 px-4 py-3 bg-emerald-500/[0.03] border border-emerald-500/20 rounded-2xl group cursor-pointer hover:bg-emerald-500/[0.08] hover:border-emerald-500/40 transition-all duration-300 active:scale-95"
              >
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-emerald-500 blur-md opacity-20 animate-pulse" />
                  <Lock className="w-3.5 h-3.5 text-emerald-500 relative z-10" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[7px] font-black text-emerald-500/60 uppercase tracking-[0.25em] leading-none">{t('simStatus')}</span>
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none mt-1">{t('simTokenActive')}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main interactive grid */}
        <div id="simulator-main" className={`grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-top-4 duration-700 ${!auth.accessToken ? 'hidden' : ''}`}>
          
          {/* MOBILE ONLY: Selector appears first */}
          <div id="mobile-commands-anchor" className="lg:hidden scroll-mt-24">
            <SimulatorSidebar
              selectedId={selectedId}
              env={env}
              onEnvChange={handleEnvChange}
              onLoadTemplate={handleLoadTemplate}
              onSyncParam={handleSyncParam}
              accessToken={auth.accessToken}
              onClearToken={auth.clearToken}
              onClearResponse={handleClearResponse}
              params={params}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onSend={handleSend}
              onCancel={handleCancel}
              loading={loading}
            />
          </div>

          {/* Builder Section (Middle on mobile, Left on desktop) */}
          <div id="simulator-main-builder" className="lg:col-span-8 space-y-6 scroll-mt-24">
            <div className="bg-card rounded-[2.5rem] border border-accent/10 shadow-xl overflow-hidden flex flex-col transition-all hover:shadow-2xl hover:border-accent/20">
              
              {/* URL bar */}
              <div className="p-6 bg-accent/[0.02] border-b border-accent/5 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-2 p-2 px-3 bg-accent/5 rounded-xl border border-accent/10">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      env === 'prod' ? 'text-rose-500' : env === 'uat' ? 'text-accent' : 'text-emerald-500'
                    }`}>
                      {env}
                    </span>
                  </div>
                </div>
                <div className="flex-1 relative group w-full">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={url}
                    readOnly
                    className="w-full bg-background border border-accent/10 rounded-xl px-12 py-3 text-[11px] font-black tracking-wider text-text-primary outline-none focus:border-accent transition-all shadow-sm"
                  />
                </div>
                <button
                  onClick={loading ? handleCancel : handleSend}
                  disabled={!loading && !auth.accessToken}
                  className={`hidden sm:flex px-8 py-3.5 rounded-2xl text-white font-black items-center justify-center gap-3 transition-all active:scale-95 cursor-pointer shadow-xl text-xs uppercase tracking-widest w-full sm:w-auto ${
                    loading 
                      ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/40 animate-pulse-gentle' 
                      : !auth.accessToken 
                        ? 'bg-text-secondary/10 text-text-secondary/40 cursor-not-allowed border border-dashed border-text-secondary/20 grayscale shadow-none'
                        : 'bg-accent hover:bg-accent-warm glow shadow-accent/20'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{t('simCancelBtn')}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current outline-none" />
                      <span>{t('simSendBtn')}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Editor + Response view */}
              <div className="grid grid-cols-1 xl:grid-cols-2 divide-y xl:divide-y-0 xl:divide-x divide-accent/5 flex-1 min-h-0">
                <div className="flex flex-col bg-accent/[0.01]">
                  <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-accent" /> REQUEST BODY (JSON)
                    </span>
                    <button 
                      onClick={() => copyToClipboard(body)}
                      className="p-1.5 hover:bg-accent/5 rounded-lg text-text-secondary hover:text-accent transition-all cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex-1 p-6">
                    <textarea
                      className="w-full h-full min-h-[400px] bg-transparent outline-none resize-none text-emerald-500 font-mono text-[13px] font-bold leading-relaxed custom-scrollbar selection:bg-accent selection:text-white"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      spellCheck="false"
                    />
                  </div>
                </div>

                <div id="response-view" className="flex flex-col bg-accent/[0.01] scroll-mt-20">
                  <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-sky-400" /> RESPONSE VIEW
                    </span>
                    {response && (
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black text-emerald-500">OK</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-6">
                    {response ? (
                      <div className="h-full overflow-y-auto custom-scrollbar pr-2">
                        <pre className="font-mono text-[13px] text-sky-400 font-bold leading-relaxed animate-in fade-in duration-500 whitespace-pre-wrap break-all">
                          {JSON.stringify(response, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-text-secondary/20 italic gap-4 grayscale opacity-40">
                        <Activity className="w-16 h-16" />
                        <p className="text-xs font-black uppercase tracking-widest">{t('simWaiting')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR Column: (Desktop Side / Mobile Bottom) */}
          <div className="lg:col-span-4 space-y-6 flex flex-col">
            {/* DESKTOP ONLY: Side Selector */}
            <div className="hidden lg:block">
              <SimulatorSidebar
                selectedId={selectedId}
                env={env}
                onEnvChange={handleEnvChange}
                onLoadTemplate={handleLoadTemplate}
                onSyncParam={handleSyncParam}
                accessToken={auth.accessToken}
                onClearToken={auth.clearToken}
                onClearResponse={handleClearResponse}
                params={params}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onSend={handleSend}
                onCancel={handleCancel}
                loading={loading}
              />
            </div>

            {/* ALWAYS: History Panel */}
            <SimulatorHistory
              history={history}
              onSelectHistory={(item) => setSelectedHistoryItem(item)}
              onClearHistory={handleClearHistory}
            />
          </div>
        </div>
      </div>

      {/* Modals and Overlays */}
      <AuthTokenModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          auth.setFetching(false);
        }}
        env={env}
        onEnvChange={handleEnvChange}
        clientId={auth.clientId}         setClientId={auth.setClientId}
        clientSecret={auth.clientSecret} setClientSecret={auth.setClientSecret}
        accessToken={auth.accessToken}
        showSecret={auth.showSecret}     setShowSecret={auth.setShowSecret}
        fetching={auth.fetching}
        fetchToken={auth.fetchToken}
        clearToken={auth.clearToken}
      />

      <Modal 
        isOpen={!!selectedHistoryItem} 
        onClose={() => setSelectedHistoryItem(null)} 
        title={`${t('simTransactionDetail')}: ${selectedHistoryItem?.endpoint?.toUpperCase()}`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh]">
          <div className="space-y-3 flex flex-col min-h-0">
            <h4 className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2 px-1">
              <Code2 className="w-3.5 h-3.5" /> {t('simRequestBody')}
            </h4>
            <div className="flex-1 overflow-auto bg-slate-50/80 rounded-2xl p-5 border border-slate-200 custom-scrollbar">
              <pre className="font-mono text-[11px] text-slate-800 font-bold leading-relaxed whitespace-pre-wrap selection:bg-accent/20">
                {selectedHistoryItem?.request}
              </pre>
            </div>
          </div>
          <div className="space-y-3 flex flex-col min-h-0">
            <h4 className="text-[10px] font-black text-sky-500 uppercase tracking-widest flex items-center gap-2 px-1">
              <Terminal className="w-3.5 h-3.5" /> {t('simResponseData')}
            </h4>
            <div className="flex-1 overflow-auto bg-slate-50/80 rounded-2xl p-5 border border-slate-200 custom-scrollbar">
              <pre className="font-mono text-[11px] text-slate-800 font-bold leading-relaxed whitespace-pre-wrap selection:bg-sky-500/20">
                {selectedHistoryItem?.response ? JSON.stringify(selectedHistoryItem.response, null, 2) : '{}'}
              </pre>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={show401Prompt} onClose={() => setShow401Prompt(false)} title={t('unauthorizedTitle')}>
        <div className="space-y-6">
          <div className="flex gap-4 p-5 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
            <ShieldAlert className="w-8 h-8 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-black text-rose-500 uppercase tracking-widest">Unauthorized</h4>
              <p className="text-xs font-bold text-text-secondary leading-relaxed">{t('unauthorizedDesc')}</p>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShow401Prompt(false)} className="flex-1 py-3 rounded-xl border border-accent/10 hover:bg-accent/5 transition-all text-[11px] font-black uppercase tracking-widest text-text-secondary cursor-pointer">
              {t('ignoreBtn')}
            </button>
            <button
              onClick={() => {
                setShow401Prompt(false);
                setIsAuthModalOpen(true);
              }}
              className="flex-1 py-3 rounded-xl bg-accent text-white hover:bg-accent-warm transition-all flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest shadow-lg shadow-accent/20 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" /> {t('fetchTokenBtn')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Floating Scroll-to-Top Button (Mobile Only) */}
      <div className={`fixed bottom-8 right-6 z-[100] transition-all duration-500 transform lg:hidden ${
        showJumpBtn ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-50 pointer-events-none'
      }`}>
        <button
          onClick={scrollToCommands}
          className="flex items-center justify-center w-12 h-12 bg-accent text-white rounded-full shadow-[0_10px_25px_-5px_rgba(14,165,233,0.5)] active:scale-90 transition-all border border-white/20 backdrop-blur-sm group"
          title={t('simBackToCommands')}
        >
          <ChevronUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
