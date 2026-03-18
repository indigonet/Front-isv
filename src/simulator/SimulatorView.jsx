import React, { useState } from 'react';
import { Play, ShieldCheck, Copy, Code2, Cpu, RefreshCw, Cloud, Terminal, Activity, ShieldAlert, Zap } from 'lucide-react';

import { EXAMPLE_BODY_C2C_SALE, API_BASE } from './simulator.constants';
import { useSimulatorAuth }                from './useSimulatorAuth';
import AuthTokenModal                      from './AuthTokenModal';
import SimulatorSidebar                    from './SimulatorSidebar';
import Modal                               from '../components/modal/Modal';
import { useLanguage }                     from '../context/LanguageContext';

export default function SimulatorView({ onLog }) {
  const { t } = useLanguage();
  // ── Request state ──────────────────────────────────────────────
  const [method,   setMethod]   = useState('POST');
  const [env,      setEnv]      = useState('uat');
  const [url,      setUrl]      = useState(API_BASE.uat + 'sale');
  const [body,     setBody]     = useState(JSON.stringify(EXAMPLE_BODY_C2C_SALE, null, 2));
  const [loading,  setLoading]  = useState(false);
  const [response, setResponse] = useState(null);
  
  // Initialize with localStorage if available for the triad
  const [params,   setParams]   = useState({
    ...EXAMPLE_BODY_C2C_SALE,
    idTerminal:   localStorage.getItem('isv_pos_idTerminal')   || EXAMPLE_BODY_C2C_SALE.idTerminal,
    idSucursal:   localStorage.getItem('isv_pos_idSucursal')   || EXAMPLE_BODY_C2C_SALE.idSucursal,
    serialNumber: localStorage.getItem('isv_pos_serialNumber') || EXAMPLE_BODY_C2C_SALE.serialNumber,
  });

  // ── Request history ─────────────────────────────────────────────
  const [history, setHistory] = useState([]);

  // ── Auth modal ──────────────────────────────────────────────────
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [show401Prompt,   setShow401Prompt]   = useState(false);
  const [country,         setCountry]         = useState('cl'); // cl | ar

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

  // Called by SimulatorSidebar when a command is selected
  const handleLoadTemplate = (bodyStr, endpoint) => {
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
    try {
      const parsedBody = JSON.parse(body);
      if (!parsedBody.idTerminal || !parsedBody.idSucursal || !parsedBody.serialNumber) {
        const warn = window.confirm(t('simTriadWarn'));
        if (!warn) return;
      }
    } catch {
      // Ignorar si el JSON está mal formado hasta que empiece la petición
    }

    setLoading(true);

    if (auth.accessToken) {
      if (onLog) onLog(`🔑 Token cargado: ${auth.accessToken.substring(0, 30)}...`, 'info');
    } else {
      if (onLog) onLog('⚠️ Sin token — el request irá SIN Authorization header', 'error');
    }
    if (onLog) onLog(`→ ${method} ${url}`, 'info');

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (auth.accessToken) headers['Authorization'] = `Bearer ${auth.accessToken}`;

      const options = { method, headers };
      if (method !== 'GET' && method !== 'HEAD' && body) options.body = body;

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
        time:     new Date().toLocaleTimeString('es-CL', { hour12: false }),
      }, ...prev]);

      if (res.ok) {
        if (onLog) onLog(`✅ ${res.status} OK (${endTime - startTime}ms)`, 'success');
      } else {
        if (onLog) onLog(`❌ ${res.status} — ${JSON.stringify(data).substring(0, 120)}`, 'error');
        if (res.status === 401) setShow401Prompt(true);
      }
    } catch (error) {
      console.error('Request Error:', error);
      if (onLog) onLog(`Error: ${error.message}`, 'error');
      setResponse({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    if (onLog) onLog('Copiado al portapapeles', 'success');
  };

  const handleClearResponse = () => setResponse(null);

  return (
    <div className="min-h-[calc(100vh-80px)] w-full py-8 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden transition-colors duration-500">
      {/* Background Effects - Optimized for performance */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent pointer-events-none opacity-40" />
      
      <div className="max-w-[1700px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-12 relative z-10">

      {/* Header */}
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
          {/* Country selector hidden for now */}
          {/* <div className="flex items-center gap-2 p-1.5 bg-background border border-accent/10 rounded-2xl shadow-sm">
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-xs cursor-pointer px-2"
            >
              <option value="cl">{t('countryChile')}</option>
              <option value="ar">{t('countryArgentina')}</option>
            </select>
          </div> */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-6 py-3 bg-accent text-white hover:bg-accent-warm rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] flex items-center gap-2 active:scale-95 shadow-lg shadow-accent/20 cursor-pointer glow"
          >
            <ShieldCheck className="w-5 h-5 transition-transform" /> {t('tokenConfigBtn')}
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── Left: request builder ── */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-card rounded-[2.5rem] border border-accent/10 shadow-xl overflow-hidden flex flex-col transition-all hover:shadow-2xl hover:border-accent/20">

            {/* URL bar */}
            <div className="p-6 bg-accent/[0.02] border-b border-accent/5 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="bg-card border border-accent/10 rounded-xl px-4 py-3 font-black text-accent outline-none focus:ring-4 focus:ring-accent/5 transition-all cursor-pointer text-xs uppercase tracking-widest shadow-sm"
                >
                  <option>POST</option>
                  <option>GET</option>
                  <option>PUT</option>
                  <option>DELETE</option>
                </select>
              </div>
              <div className="flex-1 relative group w-full">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors">
                  <Code2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-card border border-accent/10 rounded-2xl py-3 pl-10 pr-4 text-sm text-text-primary font-bold outline-none focus:ring-4 focus:ring-accent/5 transition-all shadow-sm"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={loading}
                className="bg-accent hover:bg-accent-warm px-8 py-3 rounded-2xl text-white font-black flex items-center justify-center gap-3 transition-all glow active:scale-95 cursor-pointer disabled:opacity-50 shadow-xl shadow-accent/20 text-xs uppercase tracking-widest w-full sm:w-auto"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                {t('simSendBtn')}
              </button>
            </div>

            {/* Body / Response panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 flex-1 divide-y md:divide-y-0 md:divide-x divide-accent/5">
              {/* Request JSON */}
              <div className="flex flex-col">
                <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-accent" /> REQUEST JSON
                  </span>
                  <button
                    onClick={() => copyToClipboard(body)}
                    className="p-1.5 hover:bg-accent/5 rounded-lg text-text-secondary hover:text-accent transition-all cursor-pointer"
                    title="Copiar body"
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

              {/* Response */}
              <div className="flex flex-col bg-accent/[0.01]">
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

        {/* ── Right sidebar ── */}
        <SimulatorSidebar
          env={env}
          onEnvChange={handleEnvChange}
          onLoadTemplate={handleLoadTemplate}
          onSyncParam={handleSyncParam}
          accessToken={auth.accessToken}
          onClearToken={auth.clearToken}
          history={history}
          onClearResponse={handleClearResponse}
          params={params}
        />
      </div>

      {/* Auth modal */}
      <AuthTokenModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          auth.setFetching(false);
        }}
        clientId={auth.clientId}         setClientId={auth.setClientId}
        clientSecret={auth.clientSecret} setClientSecret={auth.setClientSecret}
        accessToken={auth.accessToken}
        showSecret={auth.showSecret}     setShowSecret={auth.setShowSecret}
        fetching={auth.fetching}
        fetchToken={auth.fetchToken}
        clearToken={auth.clearToken}
      />

      {/* 401 Token Missing Prompt */}
      <Modal isOpen={show401Prompt} onClose={() => setShow401Prompt(false)} title={t('unauthorizedTitle')}>
        <div className="space-y-6">
          <div className="flex gap-4 p-5 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
            <ShieldAlert className="w-8 h-8 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-black text-rose-500 uppercase tracking-widest">Unauthorized</h4>
              <p className="text-xs font-bold text-text-secondary leading-relaxed">
                {t('unauthorizedDesc')}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShow401Prompt(false)}
              className="flex-1 py-3 rounded-xl border border-accent/10 hover:bg-accent/5 transition-all text-[11px] font-black uppercase tracking-widest text-text-secondary cursor-pointer"
            >
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
    </div>
    </div>
  );
}
