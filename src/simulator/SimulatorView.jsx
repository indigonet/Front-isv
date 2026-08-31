import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Sparkles, ShieldCheck, Copy, Check, Code2, Cpu, RefreshCw, Cloud, Terminal, Activity, ShieldAlert, Zap, Lock, XCircle, ChevronUp, ChevronDown, ChevronLeft, Trash2, HelpCircle, Clock, ArrowLeft, CheckCircle2, FileUp, FileDown } from 'lucide-react';

import { CONFIG } from './simulator.constants';
import { useSimulatorAuth } from './useSimulatorAuth';
import AuthTokenModal from './AuthTokenModal';
import SimulatorSidebar from './SimulatorSidebar';
import SimulatorHistory, { CodeBlock } from './SimulatorHistory';
import Modal from '../components/modal/Modal';
import { useLanguage } from '../context/LanguageContext';
import OnboardingTour from '../components/OnboardingTour';
import { Tooltip } from '@mui/material';
import Button from '../components/ui/Button';

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

  // customId: if empty or undefined, send empty string "" (max length 25)
  if (cleaned.customId === undefined || cleaned.customId === null) {
    cleaned.customId = '';
  } else {
    cleaned.customId = String(cleaned.customId).slice(0, 25);
  }

  // webhook: optional field, delete if empty, whitespace, null, or undefined
  if (!cleaned.webhook || (typeof cleaned.webhook === 'string' && cleaned.webhook.trim() === '')) {
    delete cleaned.webhook;
  } else if (typeof cleaned.webhook === 'string') {
    cleaned.webhook = cleaned.webhook.trim();
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
  const [country, setCountry] = useState(() => localStorage.getItem('isv_simulator_country') || 'cl'); // cl | ar
  const [isCountryOpen, setIsCountryOpen] = useState(false);

  const API_BASE = CONFIG[country].API_BASE;
  const COMMAND_METHODS = CONFIG[country].COMMAND_METHODS;

  const [method, setMethod] = useState('POST');
  const [env, setEnv] = useState('uat');
  const [selectedId, setSelectedId] = useState(() => {
    const saved = localStorage.getItem(`isv_selected_command_${country}`);
    const methods = CONFIG[country].COMMAND_METHODS;
    if (saved && methods.some(m => m.id === saved)) {
      return saved;
    }
    return methods[0].id;
  });
  const [url, setUrl] = useState(() => {
    const savedCmd = localStorage.getItem(`isv_selected_command_${country}`);
    const methods = CONFIG[country].COMMAND_METHODS;
    const activeMethod = (savedCmd && methods.find(m => m.id === savedCmd)) || methods[0];
    return API_BASE.uat + (activeMethod.endpoint || 'poll');
  });
  const [body, setBody] = useState(() => {
    const savedCmd = localStorage.getItem(`isv_selected_command_${country}`);
    const methods = CONFIG[country].COMMAND_METHODS;
    const activeMethod = (savedCmd && methods.find(m => m.id === savedCmd)) || methods[0];
    return JSON.stringify(cleanParamsForJson(activeMethod.template), null, 2);
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [abortController, setAbortController] = useState(null);
  const [isFlashRunning, setIsFlashRunning] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const flashRef = useRef(false);

  const [flashCount, setFlashCount] = useState(() => Number(localStorage.getItem('isv_flash_count')) || 10);
  const [flashBaseAmount, setFlashBaseAmount] = useState(() => Number(localStorage.getItem('isv_flash_base_amount')) || 5990);
  const [flashAltAmount, setFlashAltAmount] = useState(() => Number(localStorage.getItem('isv_flash_alt_amount')) || 1000);
  const [flashAltThreshold, setFlashAltThreshold] = useState(() => Number(localStorage.getItem('isv_flash_alt_threshold')) || 5);

  const [isAmountStatic, setIsAmountStatic] = useState(() => localStorage.getItem('isv_amount_static') === 'true');
  const [isTicketStatic, setIsTicketStatic] = useState(() => localStorage.getItem('isv_ticket_static') === 'true');

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [show401Prompt, setShow401Prompt] = useState(false);
  const [isExportSecurityOpen, setIsExportSecurityOpen] = useState(false);
  const [showJumpBtn, setShowJumpBtn] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

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



  const getInitialParams = React.useCallback((countryCode, envCode) => {
    const newConfig = CONFIG[countryCode] || CONFIG.cl;
    const savedCmd = localStorage.getItem(`isv_selected_command_${countryCode}`);
    const activeMethod = (savedCmd && newConfig.COMMAND_METHODS.find(m => m.id === savedCmd)) || newConfig.COMMAND_METHODS[0];

    const keyPrefix = `isv_pos_${countryCode}_${envCode}`;
    let savedTerminal = localStorage.getItem(`${keyPrefix}_idTerminal`) || '';
    let savedSucursal = localStorage.getItem(`${keyPrefix}_idSucursal`) || '';
    let savedSerial = localStorage.getItem(`${keyPrefix}_idSerialNumber`) || '';

    // Safeguard against cross-country contamination in localStorage
    if (countryCode === 'cl' && (savedTerminal.toUpperCase().startsWith('AR') || savedSerial.toUpperCase().startsWith('NAC'))) {
      const clTriadsRaw = localStorage.getItem(`isv_saved_triads_cl_${envCode}`);
      const clTriads = clTriadsRaw ? JSON.parse(clTriadsRaw) : [];
      const isActuallyInCl = clTriads.some(t => t.idTerminal === savedTerminal || t.serialNumber === savedSerial);
      if (!isActuallyInCl) {
        savedTerminal = '';
        savedSucursal = '';
        savedSerial = '';
        localStorage.removeItem(`${keyPrefix}_idTerminal`);
        localStorage.removeItem(`${keyPrefix}_idSucursal`);
        localStorage.removeItem(`${keyPrefix}_idSerialNumber`);
      }
    } else if (countryCode === 'ar' && savedTerminal.toUpperCase().startsWith('CL')) {
      const arTriadsRaw = localStorage.getItem(`isv_saved_triads_ar_${envCode}`);
      const arTriads = arTriadsRaw ? JSON.parse(arTriadsRaw) : [];
      const isActuallyInAr = arTriads.some(t => t.idTerminal === savedTerminal || t.serialNumber === savedSerial);
      if (!isActuallyInAr) {
        savedTerminal = '';
        savedSucursal = '';
        savedSerial = '';
        localStorage.removeItem(`${keyPrefix}_idTerminal`);
        localStorage.removeItem(`${keyPrefix}_idSucursal`);
        localStorage.removeItem(`${keyPrefix}_idSerialNumber`);
      }
    }

    let template = { ...activeMethod.template };

    // Auto-generate realistic demo values for sale commands if empty or 0
    if (activeMethod.id === 'sale_ar' && countryCode === 'ar') {
      if (!template.amount || template.amount === 0) {
        template.amount = Math.floor(Math.random() * (85000 - 1500 + 1) + 1500) * 100;
        template.tip = Math.floor(Math.random() * (2500 - 0 + 1) + 0) * 100;
      }
    } else if ((activeMethod.id === 'c2c_sale' || activeMethod.id === 'sale_promo') && countryCode === 'cl') {
      if (!template.amount || template.amount === 0) {
        const base = Math.floor(Math.random() * 99) + 1;
        template.amount = (base * 1000) + 990;
        template.ticketNumber = String(Math.floor(Math.random() * 89999) + 10000);
      }
    }

    return {
      ...template,
      idTerminal: savedTerminal || template.idTerminal || '',
      idSucursal: savedSucursal || template.idSucursal || '',
      serialNumber: savedSerial || template.serialNumber || '',
    };
  }, []);

  const [params, setParams] = useState(() => getInitialParams(country, env));

  const activeCountryRef = useRef(country);
  const activeEnvRef = useRef(env);

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

  // When country changes, reset command and url cleanly with country-specific params
  React.useEffect(() => {
    activeCountryRef.current = country;
    activeEnvRef.current = env;

    const newConfig = CONFIG[country] || CONFIG.cl;
    const savedCmd = localStorage.getItem(`isv_selected_command_${country}`);
    const activeMethod = (savedCmd && newConfig.COMMAND_METHODS.find(m => m.id === savedCmd)) || newConfig.COMMAND_METHODS[0];

    setSelectedId(activeMethod.id);
    setUrl(newConfig.API_BASE[env] + (activeMethod.endpoint || ''));

    const freshParams = getInitialParams(country, env);
    setParams(freshParams);
    setBody(JSON.stringify(cleanParamsForJson(freshParams), null, 2));
    setIsTourRunning(false); // Stop onboarding tour if running
  }, [country, env, getInitialParams]);

  const handleEnvChange = React.useCallback((newEnv) => {
    setEnv(newEnv);
    activeEnvRef.current = newEnv;
    const endpoint = url.split('/').pop() || '';
    setUrl(CONFIG[country].API_BASE[newEnv] + endpoint);
    const freshParams = getInitialParams(country, newEnv);
    setParams(freshParams);
    if (onLog) onLog(`${t('envLabel')}: ${newEnv.toUpperCase()}`, 'info');
  }, [country, url, onLog, t, getInitialParams]);

  // Sync body and persist triad only if params belong to current active country & env
  React.useEffect(() => {
    if (activeCountryRef.current !== country || activeEnvRef.current !== env) {
      return;
    }
    const displayParams = cleanParamsForJson(params);
    setBody(JSON.stringify(displayParams, null, 2));

    // Auto-save POS config triad specific to country/env
    const keyPrefix = `isv_pos_${country}_${env}`;
    if (params.idTerminal !== undefined) localStorage.setItem(`${keyPrefix}_idTerminal`, String(params.idTerminal));
    if (params.idSucursal !== undefined) localStorage.setItem(`${keyPrefix}_idSucursal`, String(params.idSucursal));
    if (params.serialNumber !== undefined) localStorage.setItem(`${keyPrefix}_idSerialNumber`, String(params.serialNumber));
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

      // Auto-randomize demo amounts if empty or 0
      if (cmdId === 'sale_ar' && country === 'ar') {
        if (!template.amount || template.amount === 0) {
          template.amount = Math.floor(Math.random() * (85000 - 1500 + 1) + 1500) * 100;
          template.tip = Math.floor(Math.random() * (2500 - 0 + 1) + 0) * 100;
        }
      } else if ((cmdId === 'c2c_sale' || cmdId === 'sale_promo') && country === 'cl') {
        if (!template.amount || template.amount === 0) {
          const base = Math.floor(Math.random() * 99) + 1;
          template.amount = (base * 1000) + 990;
          template.ticketNumber = String(Math.floor(Math.random() * 89999) + 10000);
        }
      }

      // Preserve current triad when switching templates
      const mergedParams = {
        ...template,
        idTerminal: params.idTerminal !== undefined && params.idTerminal !== '' ? params.idTerminal : template.idTerminal,
        idSucursal: params.idSucursal !== undefined && params.idSucursal !== '' ? params.idSucursal : template.idSucursal,
        serialNumber: params.serialNumber !== undefined && params.serialNumber !== '' ? params.serialNumber : template.serialNumber,
      };
      setParams(mergedParams);
    } catch {
      setBody(bodyStr);
    }
    setUrl(CONFIG[country].API_BASE[env] + endpoint);
    setResponse(null);
    if (onLog) onLog(`${t('templateLoaded')} → /${endpoint}`, 'info');
  }, [country, env, params.idTerminal, params.idSucursal, params.serialNumber, onLog, t]);

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
          'https://api-getnet-posintegrado.ione.cl/api/postxs/': '/api/cl/prod/',
          'https://api-dev.ione-tech.com/api/postxs/': '/api/ar/dev/',
          'https://api-uat.ione-tech.com/api/postxs/': '/api/ar/uat/',
          'https://api.ione-tech.com/api/postxs/': '/api/ar/prod/',
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
        const res = await fetch(fetchUrl, options);
        const endTime = Date.now();

        let data;
        const ct = res.headers.get('content-type');
        data = ct?.includes('application/json') ? await res.json() : await res.text();

        updateParamsOnResponse();

        setResponse(data);
        const now = new Date();
        const dateStr = now.toLocaleDateString('es-CL');
        const timeStr = now.toLocaleTimeString('es-CL', { hour12: false });

        setHistory((prev) => [{
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          method,
          endpoint: url.split('/').pop() || '/sale',
          status: res.status,
          request: bodyToUse,
          response: data,
          time: `${dateStr} ${timeStr}`,
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
        if (iterParams.customId === undefined || iterParams.customId === null) iterParams.customId = '';
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

      // Auto-scroll to request/response layout on mobile for visibility
      if (window.innerWidth < 1024) {
        setTimeout(() => {
          const reqRespView = document.getElementById('tour-request-response') || document.getElementById('response-view');
          if (reqRespView) {
            reqRespView.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  const [copiedRequest, setCopiedRequest] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  const copyToClipboard = (text, type = 'generic') => {
    navigator.clipboard.writeText(text);
    if (onLog) onLog(t('simCopied'), 'success');
    if (type === 'request') {
      setCopiedRequest(true);
      setTimeout(() => setCopiedRequest(false), 2000);
    } else if (type === 'response') {
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
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
      } catch { }

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

      if (onLog) {
        onLog(t('configExported') || 'Configuración exportada exitosamente', 'success');
      }
    } catch (error) {
      console.error('Export Error:', error);
      if (onLog) {
        onLog('Error al exportar la configuración', 'error');
      }
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

        if (onLog) {
          onLog(t('configImported') || '¡Configuración e historial de tríadas importados con éxito!', 'success');
        }
        window.dispatchEvent(new Event('storage'));
      } catch (err) {
        console.error('Import Error:', err);
        if (onLog) {
          onLog('Error al importar archivo. Verifique el formato JSON.', 'error');
        }
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

          <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-2.5 sm:gap-3 relative z-10 w-full sm:w-auto">
            {/* Row 1 in mobile / inline in desktop: [Export, Import, Tour] + [Country Selector] */}
            <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 w-full sm:w-auto">
              {/* Circular Action Buttons: Export, Import, Tour */}
              <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
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
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleExportConfig}
                    aria-label="Exportar Configuración"
                  >
                    <FileUp className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  </Button>
                </Tooltip>

                {/* Import Config Button */}
                <Tooltip title={t('importConfig')} arrow placement="bottom">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleImportConfigClick}
                    aria-label="Importar Configuración"
                  >
                    <FileDown className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  </Button>
                </Tooltip>

                {/* Tour Guide Button (Placed right next to Import) */}
                <Tooltip title={t('simTourTooltip')} arrow placement="bottom">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={startTour}
                    aria-label={t('simTourTooltip')}
                  >
                    <HelpCircle className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  </Button>
                </Tooltip>
              </div>

              {/* Ultra-Modern Glassmorphic Country Selector */}
              <div id="tour-country-selector" className="relative shrink-0 z-50">
                <button
                  type="button"
                  onClick={() => setIsCountryOpen(!isCountryOpen)}
                  className={`btn-reset flex items-center gap-2.5 h-9.5 px-4 rounded-full cursor-pointer transition-all duration-200 group border border-slate-300 dark:border-slate-700 outline-none select-none font-bold text-xs bg-[var(--bg-surface)] text-text-primary shadow-xs hover:border-indigo-400 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800 ${isCountryOpen
                    ? 'border-indigo-500 text-indigo-500'
                    : ''
                    }`}
                  aria-haspopup="listbox"
                  aria-expanded={isCountryOpen}
                >
                  {/* Flag with clean border - No purple glow */}
                  <div className="relative flex items-center justify-center shrink-0">
                    <img
                      src={`https://flagcdn.com/w40/${country}.png`}
                      alt={country === 'cl' ? 'Bandera de Chile' : 'Bandera de Argentina'}
                      className="w-5 h-3.5 object-cover rounded-xs border border-slate-300 dark:border-white/20 shadow-xs relative z-10 transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>

                  {/* Country label & code badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                      {country === 'cl' ? 'Chile' : 'Argentina'}
                    </span>
                    <span
                      className={`text-[10px] font-black tracking-wider px-1.5 py-0.5 rounded-md border ${country === 'cl'
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/80'
                        : 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/80'
                        }`}
                    >
                      {country.toUpperCase()}
                    </span>
                  </div>

                  {/* Dropdown Chevron */}
                  <div
                    className={`transition-transform duration-200 ease-out ml-0.5 ${isCountryOpen
                      ? 'rotate-180 text-slate-700 dark:text-slate-200'
                      : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                      }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isCountryOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsCountryOpen(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute top-full right-0 sm:left-0 sm:right-auto mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-50 p-2 animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/5 dark:ring-white/10">
                      {/* Header Label */}
                      <div className="px-3 py-2 mb-1.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 tracking-wider uppercase">
                          {t('simCountrySelectLabel')}
                        </span>
                      </div>

                      {/* Options List */}
                      <div className="space-y-1.5 pt-0.5" role="listbox">
                        {/* Chile Option */}
                        <button
                          type="button"
                          onClick={() => {
                            setCountry('cl');
                            localStorage.setItem('isv_simulator_country', 'cl');
                            setIsCountryOpen(false);
                          }}
                          className={`btn-reset flex w-full items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer text-left border relative overflow-hidden group ${country === 'cl'
                            ? 'bg-slate-100 dark:bg-slate-800/90 border-slate-300 dark:border-slate-700 shadow-xs'
                            : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-200/80 dark:hover:border-slate-700/60'
                            }`}
                          role="option"
                          aria-selected={country === 'cl'}
                        >
                          <div className="relative shrink-0 flex items-center justify-center">
                            <img
                              src="https://flagcdn.com/w40/cl.png"
                              className="w-5 h-3.5 object-cover rounded-xs border border-slate-300 dark:border-white/20 shadow-xs"
                              alt="Chile"
                            />
                          </div>

                          <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold transition-colors ${country === 'cl'
                                ? 'text-slate-900 dark:text-white'
                                : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                                }`}>
                                Chile
                              </span>
                              <span
                                className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${country === 'cl'
                                  ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                  }`}
                              >
                                CLP
                              </span>
                            </div>
                          </div>

                          {country === 'cl' ? (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 shrink-0">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                              </span>
                              <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400">
                                Activo
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors font-bold px-1.5 py-0.5 rounded">
                              Elegir
                            </span>
                          )}
                        </button>

                        {/* Argentina Option */}
                        <button
                          type="button"
                          onClick={() => {
                            setCountry('ar');
                            localStorage.setItem('isv_simulator_country', 'ar');
                            setIsCountryOpen(false);
                          }}
                          className={`btn-reset flex w-full items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer text-left border relative overflow-hidden group ${country === 'ar'
                            ? 'bg-slate-100 dark:bg-slate-800/90 border-slate-300 dark:border-slate-700 shadow-xs'
                            : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-200/80 dark:hover:border-slate-700/60'
                            }`}
                          role="option"
                          aria-selected={country === 'ar'}
                        >
                          <div className="relative shrink-0 flex items-center justify-center">
                            <img
                              src="https://flagcdn.com/w40/ar.png"
                              className="w-5 h-3.5 object-cover rounded-xs border border-slate-300 dark:border-white/20 shadow-xs"
                              alt="Argentina"
                            />
                          </div>

                          <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold transition-colors ${country === 'ar'
                                ? 'text-slate-900 dark:text-white'
                                : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                                }`}>
                                Argentina
                              </span>
                              <span
                                className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${country === 'ar'
                                  ? 'bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                  }`}
                              >
                                ARS
                              </span>
                            </div>
                          </div>

                          {country === 'ar' ? (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 shrink-0">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                              </span>
                              <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400">
                                Activo
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors font-bold px-1.5 py-0.5 rounded">
                              Elegir
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Row 2 in mobile / inline in desktop: TOKEN Button and Active Token Status Badge */}
            <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              <Button
                id="tour-auth-btn"
                variant="primary"
                onClick={() => setIsAuthModalOpen(true)}
                icon={<ShieldCheck className="w-4 h-4" />}
                className="tracking-wider uppercase flex-1 sm:flex-initial"
              >
                TOKEN
              </Button>

              {auth.accessToken && (
                <Tooltip title={t('copyToken')} arrow placement="bottom">
                  <div
                    onClick={() => copyToClipboard(auth.accessToken)}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-emerald-500/3 border border-emerald-500/20 rounded-2xl group cursor-pointer hover:bg-emerald-500/8 hover:border-emerald-500/40 transition-all duration-300 shrink-0"
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
                    <span className={`text-[10px] font-black uppercase tracking-widest ${env === 'prod' ? 'text-rose-500' : env === 'uat' ? 'text-accent' : 'text-emerald-500'
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
                <div className="relative flex items-center justify-center">
                  {/* Subtle soft ambient aura */}
                  {(!loading && auth.accessToken) && (
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 via-blue-600/30 to-indigo-600/20 rounded-full blur-xs opacity-40 group-hover:opacity-70 transition-opacity duration-300 pointer-events-none" />
                  )}

                  <button
                    id="tour-send-btn"
                    onClick={loading ? handleCancel : handleSend}
                    disabled={!loading && !auth.accessToken}
                    style={{ minWidth: '210px', height: '48px' }}
                    className={`btn-reset hidden sm:flex p-[2px] rounded-full transition-all duration-300 select-none relative overflow-hidden group ${loading
                      ? 'shadow-sm cursor-pointer'
                      : !auth.accessToken
                        ? 'opacity-60 cursor-not-allowed'
                        : 'shadow-xs cursor-pointer'
                      }`}
                  >
                    {/* Animated non-linear organic fluid contours (layered, slow abstract motion) */}
                    {loading ? (
                      <div
                        className="absolute -inset-[200%] pointer-events-none"
                        style={{
                          background: 'conic-gradient(from 0deg, #f43f5e, #fda4af, #f43f5e, #9f1239, #f43f5e)',
                          animation: 'spinBorder 2s linear infinite',
                        }}
                      />
                    ) : !auth.accessToken ? (
                      <div className="absolute inset-0 bg-slate-700/60 pointer-events-none" />
                    ) : (
                      <>
                        {/* Primary slow fluid stream (intensifies opacity & glow on hover without moving) */}
                        <div
                          className="absolute -inset-[180%] pointer-events-none opacity-85 group-hover:opacity-100 transition-opacity duration-700 blur-[0.5px] will-change-transform"
                          style={{
                            background: 'conic-gradient(from 45deg, #0284c7 0deg, #38bdf8 55deg, transparent 125deg, #60a5fa 190deg, #818cf8 230deg, #38bdf8 290deg, transparent 330deg, #0284c7 360deg)',
                            animation: 'abstractContourA 8s ease-in-out infinite alternate',
                            transform: 'translateZ(0)',
                          }}
                        />

                        {/* Secondary slow intersecting counter-stream */}
                        <div
                          className="absolute -inset-[180%] pointer-events-none opacity-75 group-hover:opacity-100 transition-opacity duration-700 will-change-transform"
                          style={{
                            background: 'conic-gradient(from 220deg, #38bdf8 0deg, #67e8f9 60deg, transparent 135deg, #06b6d4 210deg, #3b82f6 280deg, transparent 340deg, #38bdf8 360deg)',
                            animation: 'abstractContourB 10.5s ease-in-out infinite alternate',
                            transform: 'translateZ(0)',
                          }}
                        />
                      </>
                    )}

                    {/* Inner core button container */}
                    <div
                      className={`w-full h-full px-6 rounded-full flex items-center justify-center gap-2.5 relative overflow-hidden z-10 ${loading
                        ? 'bg-gradient-to-b from-rose-600 to-red-700 text-white'
                        : !auth.accessToken
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-gradient-to-b from-[#1d4ed8] via-[#2563eb] to-[#1e40af] text-white shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.3)] border-t border-white/30 border-b border-blue-950/60'
                        }`}
                    >
                      {/* Secondary Elegant Hover Gradient (smooth 700ms cross-fade) */}
                      {!loading && auth.accessToken && (
                        <div className="absolute inset-0 bg-gradient-to-b from-[#2563eb] via-[#1d4ed8] to-[#1e3a8a] opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out pointer-events-none" />
                      )}

                      {/* Micro-highlight glint on top edge in hover */}
                      <div className="absolute top-0 inset-x-4 h-[1px] bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                      {/* State 1: Loading / Cancel Content */}
                      <div
                        className={`absolute inset-0 flex items-center justify-center gap-2 transition-opacity duration-300 pointer-events-none z-10 ${
                          loading ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <RefreshCw className={`w-4 h-4 text-white shrink-0 opacity-90 ${loading ? 'animate-spin' : ''}`} />
                        <span className="font-semibold text-[13px] tracking-wide text-white whitespace-nowrap">
                          {isStopping ? 'Deteniendo...' : isFlashRunning ? 'Detener' : t('simCancelBtn')}
                        </span>
                      </div>

                      {/* State 2: Ready / Send Content */}
                      <div
                        className={`absolute inset-0 flex items-center justify-center gap-2.5 transition-opacity duration-300 pointer-events-none z-10 ${
                          !loading ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current text-white shrink-0 drop-shadow-xs transition-opacity duration-300 group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
                        <span className="font-semibold text-[13px] tracking-wide text-white transition-opacity duration-300 whitespace-nowrap">
                          {t('simSendBtn')}
                        </span>
                        {!auth.accessToken && <Lock className="w-3.5 h-3.5 opacity-60 ml-1 shrink-0" />}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Editor + Response view */}
              <div id="tour-request-response" className="grid grid-cols-1 xl:grid-cols-2 divide-y xl:divide-y-0 xl:divide-x divide-accent/5 flex-1 min-h-[580px] h-[580px] max-h-[580px] scroll-mt-24">
                <div className="flex flex-col bg-accent/1 h-full min-h-0">
                  <div className="px-6 h-14 bg-white/5 border-b border-white/5 flex items-center justify-between shrink-0">
                    <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-accent" /> REQUEST BODY (JSON)
                    </span>
                    <Tooltip title={copiedRequest ? (t('copied') || '¡Copiado!') : t('copyRequest')} arrow placement="top">
                      <button
                        onClick={() => copyToClipboard(body, 'request')}
                        aria-label={t('copyRequest')}
                        className={`btn-reset px-3 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-1.5 text-xs font-bold ${copiedRequest
                          ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400 shadow-xs'
                          : 'border-slate-300 dark:border-slate-700 bg-[var(--bg-surface)] hover:bg-slate-100 dark:hover:bg-[#253552] text-slate-700 dark:text-slate-200 hover:text-sky-500 dark:hover:text-sky-400 hover:border-sky-400/60 dark:hover:border-sky-500/50 shadow-xs hover:shadow-sm'
                          }`}
                      >
                        {copiedRequest ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{t('copied') || 'Copiado'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">{t('copy') || 'Copiar'}</span>
                          </>
                        )}
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
                        <div className="flex items-center gap-1.5 bg-[var(--bg-surface)] rounded-xl p-1 border border-slate-300 dark:border-slate-700 shadow-xs">
                          <Tooltip title={copiedResponse ? (t('copied') || '¡Copiado!') : (t('copyResponse') || 'Copiar Respuesta')} arrow placement="top">
                            <button
                              onClick={() => copyToClipboard(JSON.stringify(response, null, 2), 'response')}
                              aria-label="Copiar Respuesta"
                              className={`btn-reset p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${copiedResponse
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'text-slate-600 dark:text-slate-300 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-[#253552]'
                                }`}
                            >
                              {copiedResponse ? <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />}
                            </button>
                          </Tooltip>
                          <div className="w-px h-3.5 bg-slate-300 dark:bg-slate-700" />
                          <Tooltip title={t('clearResponse') || 'Limpiar'} arrow placement="top">
                            <button
                              onClick={handleClearResponse}
                              aria-label="Limpiar Respuesta"
                              className="btn-reset p-1.5 hover:bg-rose-500/10 rounded-lg text-slate-600 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 transition-all cursor-pointer flex items-center justify-center"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </Tooltip>
                        </div>
                        <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">OK</span>
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
        clientId={auth.clientId} setClientId={auth.setClientId}
        clientSecret={auth.clientSecret} setClientSecret={auth.setClientSecret}
        accessToken={auth.accessToken}
        showSecret={auth.showSecret} setShowSecret={auth.setShowSecret}
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
            <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${selectedHistoryItem?.status < 400
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
            <button onClick={() => setShow401Prompt(false)} className="btn-reset flex-1 py-3 rounded-xl border border-accent/10 hover:bg-accent/5 transition-all text-[11px] font-black uppercase tracking-widest text-text-secondary cursor-pointer text-center">
              {t('ignoreBtn')}
            </button>
            <button
              onClick={() => {
                setShow401Prompt(false);
                setIsAuthModalOpen(true);
              }}
              className="btn-reset flex-1 py-3 rounded-xl bg-accent text-white hover:bg-accent-warm transition-all flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest shadow-lg shadow-accent/20 cursor-pointer text-center"
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
              className="btn-reset flex-1 max-w-[130px] py-2.5 rounded-xl border border-slate-700/60 hover:bg-slate-800/60 transition-all text-[10px] font-bold uppercase tracking-wider text-slate-300 cursor-pointer text-center flex justify-center"
            >
              {t('cancel')}
            </button>
            <button
              onClick={confirmExportConfig}
              className="btn-reset flex-1 max-w-[210px] py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition-all flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer text-center"
            >
              <FileUp className="w-3.5 h-3.5" /> {t('exportSecurityConfirmBtn')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Floating Scroll-to-Top Button (Mobile Only) */}
      <div className={`fixed bottom-8 right-6 z-100 transition-all duration-500 transform lg:hidden ${showJumpBtn ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-50 pointer-events-none'
        }`}>
        <Tooltip title={t('simBackToCommands')} arrow placement="left">
          <button
            onClick={scrollToCommands}
            className="btn-reset flex items-center justify-center w-12 h-12 bg-accent text-white rounded-full shadow-[0_10px_25px_-5px_rgba(14,165,233,0.5)] active:scale-90 transition-all border border-white/20 backdrop-blur-sm group"
          >
            <ChevronUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
          </button>
        </Tooltip>
      </div>

      <OnboardingTour run={isTourRunning} onFinish={handleTourFinish} />
    </div>
  );
}
