import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ShieldCheck, Copy, Code2, Cpu, RefreshCw, Cloud, Terminal, Activity, ShieldAlert, Zap, Lock, XCircle, ChevronUp, ChevronDown, ChevronLeft, Trash2, HelpCircle, Clock, ArrowLeft, CheckCircle2, FileUp, FileDown } from 'lucide-react';

import { CONFIG } from './simulator.constants';
import { useSimulatorAuth }                from './useSimulatorAuth';
import AuthTokenModal                      from './AuthTokenModal';
import SimulatorSidebar                    from './SimulatorSidebar';
import SimulatorHistory, { CodeBlock }      from './SimulatorHistory';
import Modal                               from '../components/modal/Modal';
import { useLanguage }                     from '../context/LanguageContext';
import OnboardingTour                      from '../components/OnboardingTour';
import { Tooltip }                         from '@mui/material';

export const playSuccessChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now);
    osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1046.50, now + 0.12);
    osc2.frequency.exponentialRampToValueAtTime(1567.98, now + 0.35);
    gain2.gain.setValueAtTime(0.12, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.7);
  } catch {
    // Audio Context blocked
  }
};

export const cleanParamsForJson = (paramsObj) => {
  if (!paramsObj || typeof paramsObj !== 'object') return paramsObj;
  
  const {
    flashCount,
    flashBaseAmount,
    flashAltAmount,
    flashAltThreshold,
    ...cleaned
  } = paramsObj;

  if (cleaned.customId === '' || cleaned.customId === undefined) {
    cleaned.customId = '0';
  }
  if (cleaned.employeeId === '' || cleaned.employeeId === null || cleaned.employeeId === undefined) {
    cleaned.employeeId = 0;
  }

  // Omit paymentCategory if empty, whitespace, null, or undefined
  if (!cleaned.paymentCategory || (typeof cleaned.paymentCategory === 'string' && cleaned.paymentCategory.trim() === '')) {
    delete cleaned.paymentCategory;
  }

  return cleaned;
};

export default function SimulatorView({ onLog }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [country,         setCountry]         = useState(() => localStorage.getItem('isv_simulator_country') || 'cl'); // cl | ar
  const [isCountryOpen,   setIsCountryOpen]   = useState(false);
  
  const API_BASE = CONFIG[country].API_BASE;
  const COMMAND_METHODS = CONFIG[country].COMMAND_METHODS;

  const [method,   setMethod]   = useState('POST');
  const [env,      setEnv]      = useState('uat');
  const [selectedId, setSelectedId] = useState(() => {
    const saved = localStorage.getItem(`isv_selected_command_${country}`);
    const methods = CONFIG[country].COMMAND_METHODS;
    if (saved && methods.some(m => m.id === saved)) {
      return saved;
    }
    return methods[0].id;
  });
  const [url,      setUrl]      = useState(() => {
    const savedCmd = localStorage.getItem(`isv_selected_command_${country}`);
    const methods = CONFIG[country].COMMAND_METHODS;
    const activeMethod = (savedCmd && methods.find(m => m.id === savedCmd)) || methods[0];
    return API_BASE.uat + (activeMethod.endpoint || 'poll');
  });
  const [body,     setBody]     = useState(() => {
    const savedCmd = localStorage.getItem(`isv_selected_command_${country}`);
    const methods = CONFIG[country].COMMAND_METHODS;
    const activeMethod = (savedCmd && methods.find(m => m.id === savedCmd)) || methods[0];
    return JSON.stringify(cleanParamsForJson(activeMethod.template), null, 2);
  });
  const [loading,  setLoading]  = useState(false);
  const [response, setResponse] = useState(null);
  const [abortController, setAbortController] = useState(null);
  const [isFlashRunning, setIsFlashRunning] = useState(false);
  const [isStopping,     setIsStopping]     = useState(false);
  const flashRef = useRef(false);

  const [flashCount, setFlashCount] = useState(() => Number(localStorage.getItem('isv_flash_count')) || 10);
  const [flashBaseAmount, setFlashBaseAmount] = useState(() => Number(localStorage.getItem('isv_flash_base_amount')) || 5990);
  const [flashAltAmount, setFlashAltAmount] = useState(() => Number(localStorage.getItem('isv_flash_alt_amount')) || 1000);
  const [flashAltThreshold, setFlashAltThreshold] = useState(() => Number(localStorage.getItem('isv_flash_alt_threshold')) || 5);

  const [isAmountStatic, setIsAmountStatic] = useState(() => localStorage.getItem('isv_amount_static') === 'true');
  const [isTicketStatic, setIsTicketStatic] = useState(() => localStorage.getItem('isv_ticket_static') === 'true');

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [show401Prompt,   setShow401Prompt]   = useState(false);
  const [isExportSecurityOpen, setIsExportSecurityOpen] = useState(false);
  const [showJumpBtn,     setShowJumpBtn]     = useState(false);
  const [sendSuccess,     setSendSuccess]     = useState(false);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    localStorage.setItem('isv_flash_count', String(flashCount));
  }, [flashCount]);

  React.useEffect(() => {
    localStorage.setItem('isv_flash_base_amount', String(flashBaseAmount));
  }, [flashBaseAmount]);

  React.useEffect(() => {
    localStorage.setItem('isv_flash_alt_amount', String(flashAltAmount));
  }, [flashAltAmount]);

  React.useEffect(() => {
    localStorage.setItem('isv_flash_alt_threshold', String(flashAltThreshold));
  }, [flashAltThreshold]);

  React.useEffect(() => {
    localStorage.setItem('isv_amount_static', String(isAmountStatic));
  }, [isAmountStatic]);

  React.useEffect(() => {
    localStorage.setItem('isv_ticket_static', String(isTicketStatic));
  }, [isTicketStatic]);

  const [isTourRunning, setIsTourRunning] = useState(false);

  const handleTourFinish = () => {
    localStorage.setItem('isv_simulator_tour_seen', 'true');
    setIsTourRunning(false);
  };


  
  const [params, setParams] = useState(() => {
    const savedCmd = localStorage.getItem(`isv_selected_command_${country}`);
    const methods = CONFIG[country].COMMAND_METHODS;
    const activeMethod = (savedCmd && methods.find(m => m.id === savedCmd)) || methods[0];
    const template = { ...activeMethod.template };
    const keyPrefix = `isv_pos_${country}_${env}`;
    return {
      ...template,
      idTerminal:   localStorage.getItem(`${keyPrefix}_idTerminal`)   || template.idTerminal,
      idSucursal:   localStorage.getItem(`${keyPrefix}_idSucursal`)   || template.idSucursal,
      serialNumber: localStorage.getItem(`${keyPrefix}_idSerialNumber`) || template.serialNumber,
    };
  });

  // Reload triad when environment changes
  React.useEffect(() => {
    const keyPrefix = `isv_pos_${country}_${env}`;
    const savedTerminal = localStorage.getItem(`${keyPrefix}_idTerminal`);
    const savedSucursal = localStorage.getItem(`${keyPrefix}_idSucursal`);
    const savedSerial   = localStorage.getItem(`${keyPrefix}_idSerialNumber`);
    
    if (savedTerminal || savedSucursal || savedSerial) {
      setParams(prev => ({
        ...prev,
        idTerminal:   savedTerminal || prev.idTerminal,
        idSucursal:   savedSucursal || prev.idSucursal,
        serialNumber: savedSerial   || prev.serialNumber,
      }));
    }
  }, [env, country]);

  // ── Request history ─────────────────────────────────────────────
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('isv_simulator_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('isv_simulator_history', JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save simulator history:', e);
    }
  }, [history]);

  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  // ── Auth hook (token logic lives here) ─────────────────────────
  const auth = useSimulatorAuth({ env, country, onLog });

  const startTour = React.useCallback(() => {
    // 1. Validate token
    if (!auth.accessToken) {
      if (onLog) onLog(t('simTokenRequired'), 'warning');
      setIsAuthModalOpen(true);
      return;
    }
    
    // 2. Start tour and auto-click beacon
    setIsTourRunning(false);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsTourRunning(true);
      
      // Auto-click the beacon
      setTimeout(() => {
        const beaconBtn = document.querySelector('button[aria-label="Open the dialog"]') || document.querySelector('.react-joyride__beacon');
        if (beaconBtn) {
          beaconBtn.click();
        }
      }, 100);
    }, 50);
  }, [auth.accessToken, onLog, t]);

  React.useEffect(() => {
    const hasSeenTour = localStorage.getItem('isv_simulator_tour_seen');
    if (!hasSeenTour && auth.accessToken) {
      const timer = setTimeout(() => {
        startTour();
        localStorage.setItem('isv_simulator_tour_seen', 'true');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [auth.accessToken, startTour]);

  // ── Handlers ───────────────────────────────────────────────────
  
  // When country changes, reset command and url
  React.useEffect(() => {
    const newConfig = CONFIG[country];
    const savedCmd = localStorage.getItem(`isv_selected_command_${country}`);
    const activeMethod = (savedCmd && newConfig.COMMAND_METHODS.find(m => m.id === savedCmd)) || newConfig.COMMAND_METHODS[0];
    
    setSelectedId(activeMethod.id);
    setUrl(newConfig.API_BASE[env] + (activeMethod.endpoint || ''));
    setBody(JSON.stringify(activeMethod.template, null, 2));
    const keyPrefix = `isv_pos_${country}_${env}`;
    setParams(prev => ({
      ...activeMethod.template,
      idTerminal:   localStorage.getItem(`${keyPrefix}_idTerminal`)   || activeMethod.template.idTerminal,
      idSucursal:   localStorage.getItem(`${keyPrefix}_idSucursal`)   || activeMethod.template.idSucursal,
      serialNumber: localStorage.getItem(`${keyPrefix}_idSerialNumber`) || activeMethod.template.serialNumber,
    }));
    setIsTourRunning(false); // Stop onboarding tour if running
  }, [country]);

  const handleEnvChange = React.useCallback((newEnv) => {
    setEnv(newEnv);
    const endpoint = url.split('/').pop() || '';
    setUrl(CONFIG[country].API_BASE[newEnv] + endpoint);
    if (onLog) onLog(`${t('envLabel')}: ${newEnv.toUpperCase()}`, 'info');
  }, [country, url, onLog]);

  // Sync body and persist triad whenever params change
  React.useEffect(() => {
    const displayParams = cleanParamsForJson(params);
    setBody(JSON.stringify(displayParams, null, 2));
    
    // Auto-save POS config triad specific to country/env
    const keyPrefix = `isv_pos_${country}_${env}`;
    if (params.idTerminal)   localStorage.setItem(`${keyPrefix}_idTerminal`,   params.idTerminal);
    if (params.idSucursal)   localStorage.setItem(`${keyPrefix}_idSucursal`,   params.idSucursal);
    if (params.serialNumber) localStorage.setItem(`${keyPrefix}_idSerialNumber`, params.serialNumber);
  }, [params, country, env]);

  const lastScrollYRef = useRef(0);
  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const lastScrollY = lastScrollYRef.current;
      
      // Show only on mobile, after 400px, and ONLY when scrolling DOWN
      if (window.innerWidth < 1024) {
        const isScrollingDown = currentScrollY > lastScrollY;
        const isPastThreshold = currentScrollY > 400;
        
        setShowJumpBtn(isScrollingDown && isPastThreshold);
      } else {
        setShowJumpBtn(false);
      }
      
      lastScrollYRef.current = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToCommands = () => {
    const anchor = document.getElementById('mobile-commands-anchor');
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };



  // Called by SimulatorSidebar when a command is selected
  const handleLoadTemplate = React.useCallback((bodyStr, endpoint, cmdId) => {
    setSelectedId(cmdId);
    localStorage.setItem(`isv_selected_command_${country}`, cmdId);
    try {
      let template = JSON.parse(bodyStr);

      // RANDOMIZER: If it's an Argentina Sale, generate random amount and tip
      if (cmdId === 'sale_ar' && country === 'ar') {
        // Random amount between $1,500.00 and $85,000.00
        const randomAmount = Math.floor(Math.random() * (85000 - 1500 + 1) + 1500) * 100;
        // Random tip between $0.00 and $2,500.00
        const randomTip = Math.floor(Math.random() * (2500 - 0 + 1) + 0) * 100;
        
        template.amount = randomAmount;
        template.tip = randomTip;
      }

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
    setUrl(CONFIG[country].API_BASE[env] + endpoint);
    setResponse(null);
    if (onLog) onLog(`${t('templateLoaded')} → /${endpoint}`, 'info');
  }, [country, env, params.idTerminal, params.idSucursal, params.serialNumber, onLog]);

  // Called by SimulatorSidebar when a param input changes
  const handleSyncParam = React.useCallback((field, value) => {
    setParams(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSend = async () => {
    let currentParams = cleanParamsForJson(params);
    const currentBodyStr = JSON.stringify(currentParams, null, 2);

    if (loading || isFlashRunning) return;

    // ── Validation ──────────────────────────────────────────────
    if (!currentParams.idTerminal || !currentParams.idSucursal || !currentParams.serialNumber) {
      if (!window.confirm(t('simTriadWarn'))) return;
    }

    if (selectedId === 'c2c_sale' || selectedId === 'sale_promo') {
      if (!currentParams.amount || currentParams.amount <= 0) {
        if (onLog) onLog(t('errorInvalidAmount'), 'error');
        setLoading(false);
        return;
      }
      if (currentParams.ticketNumber === undefined || currentParams.ticketNumber === null) {
        if (onLog) onLog(t('errorTicketRequired'), 'error');
        setLoading(false);
        return;
      }
    }
    // ────────────────────────────────────────────────────────────

    setResponse(null);

    const isFlash = selectedId === 'flash_sale';
    
    // Internal request runner
    const runRequest = async (bodyToUse) => {
      const controller = new AbortController();
      setAbortController(controller);

      const updateParamsOnResponse = () => {
        const isSaleCmd = selectedId === 'c2c_sale' || selectedId === 'sale_promo' || selectedId === 'sale_ar' || selectedId === 'flash_sale';
        if (isSaleCmd) {
          setParams((prev) => {
            const isAr = country === 'ar';
            if (isAr) {
              const randomAmount = isAmountStatic ? prev.amount : (Math.floor(Math.random() * (85000 - 1500 + 1) + 1500) * 100);
              const randomTip = Math.floor(Math.random() * (2500 - 0 + 1) + 0) * 100;
              return {
                ...prev,
                amount: randomAmount,
                tip: randomTip
              };
            } else {
              const base = Math.floor(Math.random() * 99) + 1;
              const randomAmount = isAmountStatic ? prev.amount : ((base * 1000) + 990);
              const randomTicket = isTicketStatic ? prev.ticketNumber : String(parseInt(prev.ticketNumber || "0") + 1);
              return {
                ...prev,
                amount: randomAmount,
                ticketNumber: randomTicket
              };
            }
          });
        }
      };

      try {
        let fetchUrl = url;
        const proxyMap = {
          'https://api-dev-getnet-posintegrado.ione.cl/api/postxs/': '/api/cl/dev/',
          'https://api-uat-getnet-posintegrado.ione.cl/api/postxs/': '/api/cl/uat/',
          'https://api-getnet-posintegrado.ione.cl/api/postxs/':     '/api/cl/prod/',
          'https://api-dev.ione-tech.com/api/postxs/':              '/api/ar/dev/',
          'https://api-uat.ione-tech.com/api/postxs/':              '/api/ar/uat/',
          'https://api.ione-tech.com/api/postxs/':                  '/api/ar/prod/',
        };
        
        for (const [real, proxy] of Object.entries(proxyMap)) {
          if (fetchUrl.startsWith(real)) {
            fetchUrl = fetchUrl.replace(real, proxy);
            break;
          }
        }

        const headers = { 
          'Content-Type': 'application/json',
          'env': env,
          'country': country,
          'app': 'posintegrado'
        };
        if (auth.accessToken) headers['Authorization'] = `Bearer ${auth.accessToken}`;

        const options = { 
          method, 
          headers,
          body: method !== 'GET' && method !== 'HEAD' ? bodyToUse : undefined,
          signal: controller.signal
        };

        if (onLog) onLog(`→ ${method} ${url}`, 'info');

        const startTime = Date.now();
        const res       = await fetch(fetchUrl, options);
        const endTime   = Date.now();

        let data;
        const ct = res.headers.get('content-type');
        data = ct?.includes('application/json') ? await res.json() : await res.text();

        updateParamsOnResponse();

        setResponse(data);
        const now = new Date();
        const dateStr = now.toLocaleDateString('es-CL');
        const timeStr = now.toLocaleTimeString('es-CL', { hour12: false });

        setHistory((prev) => [{
          id:       `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          method,
          endpoint: url.split('/').pop() || '/sale',
          status:   res.status,
          request:  bodyToUse,
          response: data,
          time:     `${dateStr} ${timeStr}`,
        }, ...prev].slice(0, 100)); // Cap history to 100 items to prevent memory leaks

        if (res.ok) {
        if (onLog) onLog(`✅ ${res.status} OK (${endTime - startTime}ms)`, 'success');
        playSuccessChime();
        setSendSuccess(true);
        setTimeout(() => setSendSuccess(false), 2500);
      } else {
          if (onLog) onLog(`❌ ${res.status} — ${JSON.stringify(data).substring(0, 120)}`, 'error');
          if (res.status === 401) setShow401Prompt(true);
        }
      } catch (error) {
        updateParamsOnResponse();

        if (error.name === 'AbortError') {
          if (onLog) onLog(t('requestCancelled'), 'info');
        } else {
          console.error('Request Error:', error);
          if (onLog) onLog(`Error: ${error.message}`, 'error');
          setResponse({ error: error.message });
        }
      } finally {
        setAbortController(null);
      }
    };

    setLoading(true);
    try {
      if (isFlash) {
        if (onLog) onLog(t('flashSaleStarting'), 'info');
        flashRef.current = true;
        setIsFlashRunning(true);
        
        let iterParams = { ...params };
        if (iterParams.customId === '') iterParams.customId = '0';
        if (iterParams.employeeId === '' || iterParams.employeeId === null || iterParams.employeeId === undefined) {
          iterParams.employeeId = 0;
        }
        const totalSales = Number(flashCount) || 1;
        const threshold = Number(flashAltThreshold) || (totalSales + 1);
        
        for (let i = 1; i <= totalSales; i++) {
          if (!flashRef.current) break;
          
          // Determine amount based on threshold, respecting isAmountStatic
          const amountToUse = isAmountStatic ? iterParams.amount : (i >= threshold ? Number(flashAltAmount) : Number(flashBaseAmount));
          iterParams.amount = amountToUse;
          
          // Strip out simulator parameters and clean JSON payload before sending API request
          const apiParams = cleanParamsForJson(iterParams);
          const bodyToUse = JSON.stringify(apiParams, null, 2);
          setBody(bodyToUse); 
          setParams(iterParams);
          
          await runRequest(bodyToUse);
          
          if (i < totalSales && flashRef.current) {
            const nextTicket = isTicketStatic ? iterParams.ticketNumber : String(parseInt(iterParams.ticketNumber || "0") + 1);
            const nextCustomId = String(Math.floor(Math.random() * 9999999));
            const nextEmployeeId = (parseInt(iterParams.employeeId || "1") % 99) + 1;
            
            iterParams = {
              ...iterParams,
              ticketNumber: nextTicket,
              customId: nextCustomId,
              employeeId: nextEmployeeId,
            };
            
            if (flashRef.current) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }
      } else {
        await runRequest(currentBodyStr);
      }
    } finally {
      setIsFlashRunning(false);
      setIsStopping(false);
      setLoading(false);
      flashRef.current = false;

      // Auto-scroll to response layout on mobile for visibility
      if (window.innerWidth < 1024) {
        setTimeout(() => {
          const respView = document.getElementById('response-view');
          if (respView) {
            respView.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 150);
      }
    }
  };

  const handleCancel = () => {
    if (isFlashRunning) {
      setIsStopping(true);
      flashRef.current = false;
      setIsFlashRunning(false);
      if (onLog) onLog(t('flashSaleStopping'), 'info');
      if (abortController) {
        abortController.abort();
        setAbortController(null);
      }
      return;
    }
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

  const handleClearResponse = React.useCallback(() => setResponse(null), []);
  
  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('isv_simulator_history');
    } catch (e) {
      console.error('Failed to clear simulator history from localStorage:', e);
    }
  };

  // ── Export / Import Full Configuration File (JSON) ────────────────
  const fileInputRef = useRef(null);

  const handleExportConfig = () => {
    setIsExportSecurityOpen(true);
  };

  const confirmExportConfig = () => {
    setIsExportSecurityOpen(false);
    try {
      const triadStorageKey = `isv_saved_triads_${country}_${env}`;
      let savedTriads = [];
      try {
        const raw = localStorage.getItem(triadStorageKey);
        if (raw) savedTriads = JSON.parse(raw);
      } catch {}

      const configData = {
        version: '1.0',
        app: 'ISV_Toolkit_C2C_Simulator',
        exportedAt: new Date().toISOString(),
        country,
        env,
        credentials: {
          clientId: localStorage.getItem(`isv_auth_clientId_${country}`) || '',
          clientSecret: localStorage.getItem(`isv_auth_clientSecret_${country}`) || '',
        },
        posTriad: {
          idTerminal: params?.idTerminal || '',
          idSucursal: params?.idSucursal || '',
          serialNumber: params?.serialNumber || '',
        },
        savedTriads,
        simulatorSettings: {
          isAmountStatic: localStorage.getItem('isv_amount_static') === 'true',
          isTicketStatic: localStorage.getItem('isv_ticket_static') === 'true',
        }
      };

      const jsonString = JSON.stringify(configData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `isv-simulator-config-${country}-${env}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      triggerSnackbar(t('configExported') || 'Configuración exportada exitosamente', 'success');
    } catch (error) {
      console.error('Export Error:', error);
      triggerSnackbar('Error al exportar la configuración', 'error');
    }
  };

  const handleImportConfigClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleImportConfigFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        if (!content) return;
        const data = JSON.parse(content);

        if (!data || typeof data !== 'object') {
          throw new Error('Formato JSON inválido');
        }

        // 1. Credentials
        if (data.credentials) {
          if (data.credentials.clientId) {
            localStorage.setItem(`isv_auth_clientId_${country}`, data.credentials.clientId);
            if (auth.setClientId) auth.setClientId(data.credentials.clientId);
          }
          if (data.credentials.clientSecret) {
            localStorage.setItem(`isv_auth_clientSecret_${country}`, data.credentials.clientSecret);
            if (auth.setClientSecret) auth.setClientSecret(data.credentials.clientSecret);
          }
        }

        // 2. Saved Triads
        if (Array.isArray(data.savedTriads)) {
          const triadStorageKey = `isv_saved_triads_${country}_${env}`;
          localStorage.setItem(triadStorageKey, JSON.stringify(data.savedTriads));
        }

        // 3. Current POS Triad
        if (data.posTriad) {
          const { idTerminal, idSucursal, serialNumber } = data.posTriad;
          if (idTerminal) handleSyncParam('idTerminal', idTerminal);
          if (idSucursal) handleSyncParam('idSucursal', idSucursal);
          if (serialNumber) handleSyncParam('serialNumber', serialNumber);
        }

        triggerSnackbar(t('configImported') || '¡Configuración e historial de tríadas importados con éxito!', 'success');
        window.dispatchEvent(new Event('storage'));
      } catch (err) {
        console.error('Import Error:', err);
        triggerSnackbar('Error al importar archivo. Verifique el formato JSON.', 'error');
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen w-full pt-8 sm:pt-10 pb-8 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden transition-colors duration-500">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent pointer-events-none opacity-40" />
      
      <div className="w-full max-w-[1920px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-12 relative z-10">

        {/* Header Content */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-10 relative rounded-[2.5rem] shadow-2xl transition-colors duration-500 z-20">
          <div className="absolute inset-0 bg-card rounded-[2.5rem] border border-accent/10 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-grid-white/[0.02] dark:bg-grid-white/[0.02] bg-grid-black/[0.02]" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/10 rounded-full blur-[80px]" />
          </div>
          
          <div className="relative z-10 space-y-2">
            <div id="tour-welcome" className="flex items-center gap-3">
              <Tooltip title={t('backToMain') || 'Volver al Inicio'} arrow placement="top">
                <button
                  onClick={() => navigate('/')}
                  aria-label={t('backToMain') || 'Volver al Inicio'}
                  style={{ backgroundColor: 'transparent', boxShadow: 'none' }}
                  className="btn-reset p-2.5 !bg-transparent hover:!bg-accent/10 text-text-primary hover:text-accent rounded-2xl cursor-pointer flex items-center justify-center border-none outline-none"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </Tooltip>
              <div className="p-3 bg-linear-to-br from-accent to-blue-600 rounded-2xl shadow-xl shadow-accent/20">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tighter uppercase transition-colors">
                {t('simulatorTitle')}
              </h2>
            </div>
            <p className="text-text-secondary font-medium pl-1 text-sm sm:text-base transition-colors">{t('simulatorDesc')}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10">
            {/* Export and Import Config Buttons (Más grandes y separados a la izquierda del selector de País) */}
            <div className="flex items-center gap-3 mr-3 z-10">
              {/* Hidden File Input for Import */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportConfigFile}
                accept=".json"
                className="hidden"
              />

              {/* Export Config Button */}
              <Tooltip title={t('exportConfig')} arrow placement="bottom">
                <button
                  type="button"
                  onClick={handleExportConfig}
                  className="btn-reset p-3 bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-500/30 hover:border-indigo-400/70 text-indigo-300 hover:text-white rounded-xl transition-all shadow-[0_4px_15px_rgba(99,102,241,0.15)] hover:shadow-[0_0_20px_rgba(99,102,241,0.35)] cursor-pointer flex items-center justify-center shrink-0 border-none outline-none group"
                  aria-label="Exportar Configuración"
                >
                  <FileUp className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                </button>
              </Tooltip>

              {/* Import Config Button */}
              <Tooltip title={t('importConfig')} arrow placement="bottom">
                <button
                  type="button"
                  onClick={handleImportConfigClick}
                  className="btn-reset p-3 bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 hover:border-emerald-400/70 text-emerald-300 hover:text-white rounded-xl transition-all shadow-[0_4px_15px_rgba(16,185,129,0.15)] hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] cursor-pointer flex items-center justify-center shrink-0 border-none outline-none group"
                  aria-label="Importar Configuración"
                >
                  <FileDown className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                </button>
              </Tooltip>
            </div>

            {/* Ultra-Modern Glassmorphic Country Selector */}
            <div id="tour-country-selector" className="relative mr-2 z-50">
              <button
                onClick={() => setIsCountryOpen(!isCountryOpen)}
                className="flex items-center gap-3 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-indigo-500/80 rounded-2xl py-2.5 px-4 shadow-[0_4px_25px_rgba(0,0,0,0.4)] backdrop-blur-xl cursor-pointer transition-all duration-300 group"
              >
                <div className="relative flex items-center justify-center">
                  <img 
                    src={`https://flagcdn.com/w20/${country}.png`} 
                    alt={country}
                    className="w-5 h-3.5 rounded-xs border border-white/20 shadow-md relative z-10"
                  />
                  <div className="absolute inset-0 bg-indigo-500/40 blur-xs rounded-full opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <span className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <span>{country === 'cl' ? 'Chile' : 'Argentina'}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border shadow-sm ${
                    country === 'cl' 
                      ? 'bg-blue-500/30 text-blue-200 border-blue-400/60 shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
                      : 'bg-sky-500/30 text-sky-200 border-sky-400/60 shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                  }`}>
                    {country.toUpperCase()}
                  </span>
                </span>
                
                <div className={`transition-transform duration-300 ${isCountryOpen ? 'rotate-180 text-indigo-400' : 'text-slate-400 group-hover:text-indigo-400'}`}>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isCountryOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsCountryOpen(false)} />
                  <div className="absolute top-full left-0 mt-3 w-64 bg-slate-950/95 border border-slate-700/80 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(99,102,241,0.2)] z-50 p-2.5 animate-in fade-in slide-in-from-top-3 backdrop-blur-2xl ring-1 ring-white/10">
                    <div className="px-3.5 py-2 mb-1.5 border-b border-slate-800/80 flex items-center justify-between">
                      <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest opacity-90">{t('simCountrySelectLabel')}</span>
                    </div>
                    
                    <div className="space-y-2 pt-1">
                      {/* Chile Option */}
                      <button
                        onClick={() => { 
                          setCountry('cl'); 
                          localStorage.setItem('isv_simulator_country', 'cl');
                          setIsCountryOpen(false); 
                        }}
                        className={`flex w-full items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-200 cursor-pointer border group ${
                          country === 'cl' 
                            ? 'bg-slate-800/90 border-2 border-indigo-500/80 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]' 
                            : 'bg-slate-900/40 border border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800/60 hover:border-indigo-500/40'
                        }`}
                      >
                        <img src="https://flagcdn.com/w20/cl.png" className="w-5 h-3.5 rounded-xs border border-white/20 shadow-md" alt="CL" />
                        <div className="flex flex-col items-start leading-none">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black">Chile</span>
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${
                              country === 'cl' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>CL</span>
                          </div>
                        </div>
                        {country === 'cl' && (
                          <div className="ml-auto w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
                        )}
                      </button>

                      {/* Argentina Option */}
                      <button
                        onClick={() => { 
                          setCountry('ar'); 
                          localStorage.setItem('isv_simulator_country', 'ar');
                          setIsCountryOpen(false); 
                        }}
                        className={`flex w-full items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-200 cursor-pointer border group ${
                          country === 'ar' 
                            ? 'bg-slate-800/90 border-2 border-indigo-500/80 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]' 
                            : 'bg-slate-900/40 border border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800/60 hover:border-indigo-500/40'
                        }`}
                      >
                        <img src="https://flagcdn.com/w20/ar.png" className="w-5 h-3.5 rounded-xs border border-white/20 shadow-md" alt="AR" />
                        <div className="flex flex-col items-start leading-none">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black">Argentina</span>
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${
                              country === 'ar' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>AR</span>
                          </div>
                        </div>
                        {country === 'ar' && (
                          <div className="ml-auto w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Tooltip title={t('simTourTooltip')} arrow placement="bottom">
              <button
                onClick={startTour}
                className="p-2.5 bg-transparent hover:bg-white/10 border border-transparent hover:border-white/20 text-white/80 hover:text-white rounded-lg transition-all shadow-none cursor-pointer flex items-center justify-center"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </Tooltip>

            <button
              id="tour-auth-btn"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-6 py-3 bg-accent hover:bg-accent-warm text-white rounded-lg transition-all font-black uppercase tracking-widest text-[11px] flex items-center gap-2.5 shadow-[0_8px_20px_-4px_rgba(14,165,233,0.4)] cursor-pointer ring-1 ring-white/10"
            >
              <ShieldCheck className="w-4 h-4" /> TOKEN
            </button>

            {auth.accessToken && (
              <Tooltip title={t('copyToken')} arrow placement="bottom">
                <div 
                  onClick={() => copyToClipboard(auth.accessToken)}
                  className="flex items-center gap-2.5 px-4 py-3 bg-emerald-500/3 border border-emerald-500/20 rounded-2xl group cursor-pointer hover:bg-emerald-500/8 hover:border-emerald-500/40 transition-all duration-300"
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
              </Tooltip>
            )}
          </div>
        </div>

        {/* Main interactive grid */}
        <div id="simulator-main" className={`${(!auth.accessToken && !isTourRunning) ? 'hidden' : 'grid'} grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-top-4 duration-700`}>
          
          {/* MOBILE ONLY: Selector appears first */}
          <div id="mobile-commands-anchor" className="lg:hidden scroll-mt-24">
            <SimulatorSidebar
              selectedId={selectedId}
              country={country}
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
              isFlashRunning={isFlashRunning}
              isStopping={isStopping}
              flashCount={flashCount}
              setFlashCount={setFlashCount}
              flashBaseAmount={flashBaseAmount}
              setFlashBaseAmount={setFlashBaseAmount}
              flashAltAmount={flashAltAmount}
              setFlashAltAmount={setFlashAltAmount}
              flashAltThreshold={flashAltThreshold}
              setFlashAltThreshold={setFlashAltThreshold}
              isAmountStatic={isAmountStatic}
              setIsAmountStatic={setIsAmountStatic}
              isTicketStatic={isTicketStatic}
              setIsTicketStatic={setIsTicketStatic}
            />
          </div>

          {/* Builder Section (Middle on mobile, Left on desktop) */}
          <div id="simulator-main-builder" className="lg:col-span-8 space-y-6 scroll-mt-24">
            <div className="bg-card rounded-[1rem] border border-accent/10 shadow-xl overflow-hidden flex flex-col transition-all hover:shadow-2xl hover:border-accent/20">
              
              {/* URL bar */}
              <div className="p-6 bg-accent/2 border-b border-accent/5 flex flex-col sm:flex-row items-center gap-4">
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
                  id="tour-send-btn"
                  onClick={loading ? handleCancel : handleSend}
                  disabled={!loading && !auth.accessToken}
                  style={{ minWidth: '210px', height: '52px' }}
                  className={`hidden sm:flex px-6 rounded-2xl font-normal text-xs uppercase tracking-widest items-center justify-center gap-3 transition-all duration-500 ease-in-out select-none cursor-pointer relative overflow-hidden ${
                    loading
                      ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-[0_0_30px_rgba(239,68,68,0.7)] border-2 border-red-400'
                      : !auth.accessToken
                        ? 'bg-slate-800/60 text-slate-400/60 cursor-not-allowed border border-dashed border-slate-700/60 shadow-none'
                        : 'bg-gradient-to-r from-accent via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(14,165,233,0.35)] border border-accent/40'
                  }`}
                >
                  {/* Internal sweeping light ray beam */}
                  {(!loading ? auth.accessToken : true) && (
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none"
                      style={{
                        animation: loading ? 'shimmerSweep 1.5s infinite linear' : 'shimmerSweep 3s infinite linear',
                      }}
                    />
                  )}

                  {/* Bottom animated red energy line on Cancel / Loading */}
                  {loading && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-400 animate-pulse shadow-[0_0_12px_#f43f5e]" />
                  )}

                  {loading ? (
                    <div className="flex items-center gap-2.5 animate-in fade-in duration-300 relative z-10">
                      <RefreshCw className="w-4 h-4 animate-spin text-white shrink-0 opacity-90" />
                      <span className="font-normal tracking-wider text-white">{isStopping ? 'DETENIENDO...' : isFlashRunning ? 'DETENER' : t('simCancelBtn')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 animate-in fade-in duration-300 relative z-10">
                      <Play className="w-4 h-4 fill-current outline-none shrink-0 opacity-90" />
                      <span className="font-normal tracking-widest">{t('simSendBtn')}</span>
                      {!auth.accessToken && <Lock className="w-3.5 h-3.5 opacity-60 ml-1 shrink-0" />}
                    </div>
                  )}
                </button>
              </div>

              {/* Editor + Response view */}
              <div id="tour-request-response" className="grid grid-cols-1 xl:grid-cols-2 divide-y xl:divide-y-0 xl:divide-x divide-accent/5 flex-1 min-h-[580px] h-[580px] max-h-[580px]">
                <div className="flex flex-col bg-accent/1 h-full min-h-0">
                  <div className="px-6 h-14 bg-white/5 border-b border-white/5 flex items-center justify-between shrink-0">
                    <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-accent" /> REQUEST BODY (JSON)
                    </span>
                    <Tooltip title={t('copyRequest')} arrow placement="top">
                      <button 
                        onClick={() => copyToClipboard(body)}
                        className="p-1.5 hover:bg-accent/5 rounded-lg text-text-secondary hover:text-accent transition-all cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </Tooltip>
                  </div>
                  <div className="flex-1 p-6 min-h-0 overflow-hidden">
                    <textarea
                      className="w-full h-full bg-transparent outline-none border-none no-focus-glow resize-none text-emerald-500 font-mono text-[13px] font-bold leading-relaxed custom-scrollbar selection:bg-accent selection:text-white overflow-y-auto"
                      value={body}
                      readOnly
                      spellCheck="false"
                    />
                  </div>
                </div>

                <div id="response-view" className="flex flex-col bg-accent/1 scroll-mt-20 h-full min-h-0">
                  <div className="px-6 h-14 bg-white/5 border-b border-white/5 flex items-center justify-between shrink-0">
                    <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-sky-400" /> RESPONSE VIEW
                    </span>
                    {response && (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-accent/5 rounded-lg p-0.5 border border-accent/10">
                          <Tooltip title={t('copyResponse') || 'Copiar Respuesta'} arrow placement="top">
                            <button 
                              onClick={() => copyToClipboard(JSON.stringify(response, null, 2))}
                              className="p-1.5 hover:bg-accent/10 rounded-md text-text-secondary hover:text-accent transition-all cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </Tooltip>
                          <div className="w-px h-3 bg-accent/10" />
                          <Tooltip title={t('clearResponse') || 'Limpiar'} arrow placement="top">
                            <button 
                              onClick={handleClearResponse}
                              className="p-1.5 hover:bg-rose-500/10 rounded-md text-text-secondary hover:text-rose-500 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </Tooltip>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[9px] font-black text-emerald-500">OK</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-6 min-h-0 overflow-hidden">
                    {response ? (
                      <div className="h-full overflow-y-auto custom-scrollbar pr-2">
                        <pre className="font-mono text-[13px] text-sky-400 font-bold leading-relaxed animate-in fade-in duration-500 whitespace-pre-wrap break-all">
                          {JSON.stringify(response, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-text-secondary/20 italic gap-4 grayscale opacity-40">
                        <Activity className="w-16 h-16" />
                        <p className="text-xs font-black uppercase tracking-widest">{t('simWaiting')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ALWAYS: History Panel in bottom space */}
            <div id="tour-history">
              <SimulatorHistory
                history={history}
                onSelectHistory={(item) => setSelectedHistoryItem(item)}
                onClearHistory={handleClearHistory}
              />
            </div>
          </div>

          {/* SIDEBAR Column: (Desktop Side / Mobile Bottom) */}
          <div className="lg:col-span-4 space-y-6 flex flex-col">
            {/* DESKTOP ONLY: Side Selector */}
            <div id="desktop-commands-anchor" className="hidden lg:block">
              <SimulatorSidebar
                selectedId={selectedId}
                country={country}
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
                sendSuccess={sendSuccess}
                isFlashRunning={isFlashRunning}
                isStopping={isStopping}
                flashCount={flashCount}
                setFlashCount={setFlashCount}
                flashBaseAmount={flashBaseAmount}
                setFlashBaseAmount={setFlashBaseAmount}
                flashAltAmount={flashAltAmount}
                setFlashAltAmount={setFlashAltAmount}
                flashAltThreshold={flashAltThreshold}
                setFlashAltThreshold={setFlashAltThreshold}
                isAmountStatic={isAmountStatic}
                setIsAmountStatic={setIsAmountStatic}
                isTicketStatic={isTicketStatic}
                setIsTicketStatic={setIsTicketStatic}
              />
            </div>
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
        country={country}
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
        <div className="flex flex-col flex-1 min-h-0 h-full">
          {/* Header metadata */}
          <div className="flex flex-wrap items-center gap-2 pb-3 mb-4 border-b border-slate-200/50 dark:border-accent/10 shrink-0 select-none">
            <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
              selectedHistoryItem?.status < 400 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.1)]' 
                : 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.1)]'
            }`}>
              {selectedHistoryItem?.status}
            </span>
            <span className="text-[9px] font-black px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-text-secondary tracking-wider">
              {selectedHistoryItem?.method}
            </span>
            <span className="text-[9px] font-bold text-text-secondary/50 flex items-center gap-1 ml-auto shrink-0 font-mono">
              <Clock className="w-3 h-3 opacity-60" /> {selectedHistoryItem?.time}
            </span>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            <div className="flex flex-col min-h-0 h-full">
              <CodeBlock code={selectedHistoryItem?.request} filename="REQUEST" />
            </div>
            <div className="flex flex-col min-h-0 h-full">
              <CodeBlock code={selectedHistoryItem?.response ? selectedHistoryItem.response : {}} filename="RESPONSE" />
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

      {/* Export Security Warning Modal */}
      <Modal 
        isOpen={isExportSecurityOpen} 
        onClose={() => setIsExportSecurityOpen(false)} 
        title={t('exportSecurityTitle')}
        size="sm"
      >
        <div className="space-y-6">
          <div className="flex gap-4 p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
            <ShieldAlert className="w-8 h-8 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-black text-amber-500 uppercase tracking-widest">
                {t('exportSecurityTitle')}
              </h4>
              <p className="text-xs font-bold text-text-secondary leading-relaxed">
                {t('exportSecurityDesc')}
              </p>
            </div>
          </div>

          <div className="space-y-2.5 p-4 bg-background border border-accent/10 rounded-2xl">
            <div className="flex items-center gap-2.5 text-xs font-bold text-text-primary">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{t('exportSecurityCredsNotice')}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-text-primary">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{t('exportSecurityTriadsNotice')}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-3 border-t border-slate-700/30 w-full">
            <button 
              onClick={() => setIsExportSecurityOpen(false)} 
              className="flex-1 max-w-[130px] py-2.5 rounded-xl border border-slate-700/60 hover:bg-slate-800/60 transition-all text-[10px] font-bold uppercase tracking-wider text-slate-300 cursor-pointer text-center flex justify-center"
            >
              {t('cancel')}
            </button>
            <button
              onClick={confirmExportConfig}
              className="flex-1 max-w-[210px] py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition-all flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer text-center"
            >
              <FileUp className="w-3.5 h-3.5" /> {t('exportSecurityConfirmBtn')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Floating Scroll-to-Top Button (Mobile Only) */}
      <div className={`fixed bottom-8 right-6 z-100 transition-all duration-500 transform lg:hidden ${
        showJumpBtn ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-50 pointer-events-none'
      }`}>
        <Tooltip title={t('simBackToCommands')} arrow placement="left">
          <button
            onClick={scrollToCommands}
            className="flex items-center justify-center w-12 h-12 bg-accent text-white rounded-full shadow-[0_10px_25px_-5px_rgba(14,165,233,0.5)] active:scale-90 transition-all border border-white/20 backdrop-blur-sm group"
          >
            <ChevronUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
          </button>
        </Tooltip>
      </div>
      
      <OnboardingTour run={isTourRunning} onFinish={handleTourFinish} />
    </div>
  );
}
