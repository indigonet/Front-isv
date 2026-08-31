import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronRight, Layers, History, X, Trash2, Play, Sparkles, RefreshCw, Lock, ShieldCheck, Wand2, HelpCircle, XCircle, Save, CheckCircle2, FileUp, FileDown, Tag, Monitor, Building2, Hash } from 'lucide-react';

import { CONFIG } from './simulator.constants';
import { useLanguage } from '../context/LanguageContext';
import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, FormControl, FormHelperText, Typography, Select, MenuItem, Switch, FormControlLabel, Snackbar, Alert } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

export const parseTriadText = (text) => {
  if (!text || typeof text !== 'string') return null;
  const clean = text.trim();
  if (!clean) return null;

  let name = '';
  let term = '';
  let suc = '';
  let serial = '';

  // 1. JSON format
  if (clean.startsWith('{') && clean.endsWith('}')) {
    try {
      const obj = JSON.parse(clean);
      const data = obj.posTriad || obj;
      term = data.idTerminal || data.terminal || data.terminalId || data.tid || '';
      suc = data.idSucursal || data.sucursal || data.sucursalId || data.mid || data.commerceId || '';
      serial = data.serialNumber || data.serial || data.sn || data.serie || '';
      name = data.name || '';
      if (term || suc || serial) {
        return {
          name: name ? String(name).slice(0, 50) : '',
          idTerminal: String(term).slice(0, 20),
          idSucursal: String(suc).slice(0, 20),
          serialNumber: String(serial).toUpperCase().slice(0, 20)
        };
      }
    } catch { }
  }

  // 2. Labeled / Key-Value Regex Matching (handles arbitrary order, labels with/without colons, dashes, etc.)
  const serialMatch = clean.match(/(?:serial[\s_-]*number|serial[\s_-]*no\.?|serialnumber|serial|s\/n|s\.n\.?|sn|nro\.?[\s_-]*serie|n[uú]mero[\s_-]*de[\s_-]*serie|serie)\s*[:=\t-]?\s*([a-zA-Z0-9_-]+)/i);
  const termMatch = clean.match(/(?:id[\s_-]*terminal|terminal[\s_-]*id|terminal|tid|term)\s*[:=\t-]?\s*([a-zA-Z0-9_-]+)/i);
  const sucMatch = clean.match(/(?:id[\s_-]*sucursal|sucursal[\s_-]*id|sucursal|mid|commerce[\s_-]*id|comercio|suc|branch[\s_-]*id|branch|store[\s_-]*id|store)\s*[:=\t-]?\s*([a-zA-Z0-9_-]+)/i);
  const nameMatch = clean.match(/(?:nombre|name|alias|titulo|title)\s*[:=\t-]?\s*([a-zA-Z0-9_\-\s]{1,40})/i);

  if (serialMatch || termMatch || sucMatch) {
    if (termMatch) term = termMatch[1];
    if (sucMatch) suc = sucMatch[1];
    if (serialMatch) serial = serialMatch[1];
    if (nameMatch) name = nameMatch[1].trim();

    return {
      name: name ? name.slice(0, 50) : '',
      idTerminal: term ? term.slice(0, 20) : '',
      idSucursal: suc ? suc.slice(0, 20) : '',
      serialNumber: serial ? serial.toUpperCase().slice(0, 20) : ''
    };
  }

  // 3. Delimited tokens (tabs from sheets, commas, semicolons, pipes, slashes, or whitespace)
  const lines = clean.split(/[\r\n]+/).map(l => l.trim()).filter(Boolean);
  let tokens = [];
  if (lines.length > 1) {
    tokens = lines;
  } else {
    tokens = clean.split(/[\t;,|\/]+|\s+/).map(s => s.trim()).filter(Boolean);
  }

  if (tokens.length >= 3) {
    term = tokens[0];
    suc = tokens[1];
    serial = tokens[2];
    return {
      name: '',
      idTerminal: term.slice(0, 20),
      idSucursal: suc.slice(0, 20),
      serialNumber: serial.toUpperCase().slice(0, 20)
    };
  } else if (tokens.length === 1) {
    const single = tokens[0];
    if (single.length === 22) {
      term = single.substring(0, 8);
      suc = single.substring(8, 12);
      serial = single.substring(12, 22);
      return {
        name: '',
        idTerminal: term,
        idSucursal: suc,
        serialNumber: serial.toUpperCase()
      };
    }
  }

  return null;
};

const formatRut = (value) => {
  let clean = String(value).replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length > 9) clean = clean.slice(0, 9);
  if (clean.length <= 1) return clean;
  const dv = clean.slice(-1);
  const body = clean.slice(0, -1);
  let formattedBody = '';
  for (let i = body.length - 1, j = 0; i >= 0; i--, j++) {
    if (j > 0 && j % 3 === 0) {
      formattedBody = '.' + formattedBody;
    }
    formattedBody = body[i] + formattedBody;
  }
  return `${formattedBody}-${dv}`;
};

const validateRut = (rut) => {
  if (!rut) return true;
  const clean = String(rut).replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 2) return false;
  const dv = clean.slice(-1);
  const body = clean.slice(0, -1);
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const expectedDv = 11 - (sum % 11);
  const dvChar = expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : String(expectedDv);
  return dv === dvChar;
};

export default function SimulatorSidebar({
  selectedId,
  country = 'cl',
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
  sendSuccess,
  isFlashRunning,
  isStopping,
  flashCount,
  setFlashCount,
  flashBaseAmount,
  setFlashBaseAmount,
  flashAltAmount,
  setFlashAltAmount,
  flashAltThreshold,
  setFlashAltThreshold,
  isAmountStatic,
  setIsAmountStatic,
  isTicketStatic,
  setIsTicketStatic,
}) {
  const { t } = useLanguage();

  const currentConfig = CONFIG[country] || CONFIG.cl;
  const COMMAND_METHODS = currentConfig.COMMAND_METHODS;
  const FIELD_CONFIG = currentConfig.FIELD_CONFIG;

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
      } else if (id === 'sale_ar') {
        const randomAmt = Math.floor(Math.random() * (85000 - 1500 + 1) + 1500) * 100;
        const randomTip = Math.floor(Math.random() * (2500 - 0 + 1) + 0) * 100;
        finalTemplate.amount = randomAmt;
        finalTemplate.tip = randomTip;
      }

      onLoadTemplate(JSON.stringify(finalTemplate, null, 2), method.endpoint, id);
    }
  }, [COMMAND_METHODS, onLoadTemplate]);

  const formatCurrency = (num) => {
    if (!num && num !== 0) return '';
    const isAr = country === 'ar';
    const val = isAr ? num / 100 : num;
    return new Intl.NumberFormat(isAr ? 'es-AR' : 'es-CL', {
      style: 'currency',
      currency: isAr ? 'ARS' : 'CLP',
      minimumFractionDigits: isAr ? 2 : 0,
      maximumFractionDigits: isAr ? 2 : 0
    }).format(val);
  };

  const parseCurrency = (str) => {
    if (!str) return 0;
    const isAr = country === 'ar';
    // Remove symbols and separators
    const digitsOnly = str.replace(/[^0-9]/g, '');
    let val = parseInt(digitsOnly, 10) || 0;
    return val;
  };

  const handleParamChange = useCallback((field, rawValue) => {
    let finalValue = rawValue;
    if (field === 'amount' || field === 'tip') {
      const parsed = parseCurrency(String(rawValue));
      finalValue = field === 'amount' ? Math.min(parsed, 999999999) : parsed;
    } else if (field === 'serialNumber') {
      finalValue = String(rawValue).toUpperCase().slice(0, 20);
    } else if (field === 'ticketNumber') {
      finalValue = String(rawValue).slice(0, 24);
    } else if (field === 'customId') {
      finalValue = String(rawValue).slice(0, 25);
    } else if (field === 'webhook') {
      finalValue = String(rawValue);
    } else if (field === 'employeeId') {
      const digitsOnly = String(rawValue).replace(/[^0-9]/g, '').slice(0, 4);
      finalValue = digitsOnly === '' ? '' : Number(digitsOnly);
    } else if (field === 'authorizationCode') {
      finalValue = String(rawValue).slice(0, 20);
    } else if (field === 'operationId') {
      const digitsOnly = String(rawValue).replace(/[^0-9]/g, '').slice(0, 8);
      const numVal = digitsOnly === '' ? '' : Number(digitsOnly);
      finalValue = numVal === '' ? '' : Math.min(numVal, 99999999);
    } else if (field === 'rutToValidate') {
      finalValue = formatRut(rawValue);
    } else if (field === 'idPromo') {
      finalValue = String(rawValue).slice(0, 250);
    } else if (typeof rawValue !== 'boolean' && FIELD_CONFIG[field]?.type === 'number') {
      finalValue = rawValue === '' ? '' : Number(rawValue);
    }
    onSyncParam(field, finalValue);
  }, [onSyncParam, FIELD_CONFIG]);

  // --- Triads (saved terminal sets) state & persistence
  const triadStorageKey = `isv_saved_triads_${country}_${env}`;
  const [savedTriads, setSavedTriads] = useState(() => {
    try {
      const raw = localStorage.getItem(triadStorageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [selectedTriadIndex, setSelectedTriadIndex] = useState(() => {
    try {
      const raw = localStorage.getItem(`${triadStorageKey}_selected`);
      return raw !== null ? parseInt(raw, 10) : -1;
    } catch {
      return -1;
    }
  });

  const updateSavedTriads = (newTriads) => {
    setSavedTriads(newTriads);
    try {
      localStorage.setItem(triadStorageKey, JSON.stringify(newTriads));
    } catch { }
  };

  const updateSelectedTriadIndex = (newIndex) => {
    setSelectedTriadIndex(newIndex);
    try {
      localStorage.setItem(`${triadStorageKey}_selected`, String(newIndex));
    } catch { }
  };

  // Sync state when country or environment changes
  useEffect(() => {
    try {
      const raw = localStorage.getItem(triadStorageKey);
      setSavedTriads(raw ? JSON.parse(raw) : []);
    } catch {
      setSavedTriads([]);
    }
    try {
      const raw = localStorage.getItem(`${triadStorageKey}_selected`);
      setSelectedTriadIndex(raw !== null ? parseInt(raw, 10) : -1);
    } catch {
      setSelectedTriadIndex(-1);
    }
  }, [triadStorageKey]);

  const [openTriadDialog, setOpenTriadDialog] = useState(false);
  const [editingTriadIndex, setEditingTriadIndex] = useState(-1);
  const [editingTriad, setEditingTriad] = useState({ name: '', idTerminal: '', idSucursal: '', serialNumber: '' });
  const [triadErrors, setTriadErrors] = useState({});
  const [expandedTriadIndex, setExpandedTriadIndex] = useState(-1);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const [snackSeverity, setSnackSeverity] = useState('success');

  const showSnackbar = (msg, severity = 'success') => {
    setSnackMsg(msg);
    setSnackSeverity(severity);
    setSnackOpen(true);
  };
  const [copiedField, setCopiedField] = useState('');

  // ── Export / Import Full Configuration File (JSON) ────────────────
  const fileInputRef = useRef(null);

  const handleExportConfig = () => {
    try {
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
        savedTriads: savedTriads || [],
        simulatorSettings: {
          flashCount,
          flashBaseAmount,
          flashAltAmount,
          flashAltThreshold,
          isAmountStatic,
          isTicketStatic,
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

      showSnackbar(t('configExported') || 'Configuración exportada exitosamente', 'success');
    } catch (error) {
      console.error('Export Error:', error);
      showSnackbar('Error al exportar la configuración', 'error');
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
          }
          if (data.credentials.clientSecret) {
            localStorage.setItem(`isv_auth_clientSecret_${country}`, data.credentials.clientSecret);
          }
        }

        // 2. Saved Triads
        if (Array.isArray(data.savedTriads)) {
          updateSavedTriads(data.savedTriads);
        }

        // 3. Current POS Triad
        if (data.posTriad) {
          const { idTerminal, idSucursal, serialNumber } = data.posTriad;
          if (idTerminal) onSyncParam('idTerminal', idTerminal);
          if (idSucursal) onSyncParam('idSucursal', idSucursal);
          if (serialNumber) onSyncParam('serialNumber', serialNumber);
        }

        // 4. Simulator Settings
        if (data.simulatorSettings) {
          const s = data.simulatorSettings;
          if (s.flashCount !== undefined && setFlashCount) setFlashCount(s.flashCount);
          if (s.flashBaseAmount !== undefined && setFlashBaseAmount) setFlashBaseAmount(s.flashBaseAmount);
          if (s.flashAltAmount !== undefined && setFlashAltAmount) setFlashAltAmount(s.flashAltAmount);
          if (s.flashAltThreshold !== undefined && setFlashAltThreshold) setFlashAltThreshold(s.flashAltThreshold);
          if (s.isAmountStatic !== undefined && setIsAmountStatic) setIsAmountStatic(s.isAmountStatic);
          if (s.isTicketStatic !== undefined && setIsTicketStatic) setIsTicketStatic(s.isTicketStatic);
        }

        showSnackbar(t('configImported') || '¡Configuración e historial de tríadas importados con éxito!', 'success');
      } catch (err) {
        console.error('Import Error:', err);
        showSnackbar('Error al importar archivo. Verifique el formato JSON.', 'error');
      }
    };

    reader.readAsText(file);
  };

  useEffect(() => {
    if (selectedTriadIndex >= 0 && savedTriads[selectedTriadIndex]) {
      const t = savedTriads[selectedTriadIndex];
      onSyncParam('idTerminal', t.idTerminal);
      onSyncParam('idSucursal', t.idSucursal);
      onSyncParam('serialNumber', t.serialNumber);
    }
  }, [selectedTriadIndex, savedTriads, onSyncParam]);

  const validateTriad = (triad) => {
    const errors = {};
    const name = String(triad.name || '').trim();
    const idTerminal = String(triad.idTerminal || '').trim();
    const idSucursal = String(triad.idSucursal || '').trim();
    const serialNumber = String(triad.serialNumber || '').trim();

    if (!name) {
      errors.name = t('triad.nameRequired') || 'El nombre es requerido';
    }
    if (!idTerminal) {
      errors.idTerminal = t('triad.terminalRequired') || 'ID Terminal es requerido';
    } else if (idTerminal.length > 20) {
      errors.idTerminal = t('triad.maxLength') || 'Límite de 20 caracteres';
    }

    if (!idSucursal) {
      errors.idSucursal = t('triad.sucursalRequired') || 'ID Sucursal es requerido';
    } else if (idSucursal.length > 20) {
      errors.idSucursal = t('triad.maxLength') || 'Límite de 20 caracteres';
    }

    if (!serialNumber) {
      errors.serialNumber = t('triad.serialRequired') || 'Serial Number es requerido';
    } else if (serialNumber.length > 20) {
      errors.serialNumber = t('triad.maxLength') || 'Límite de 20 caracteres';
    }

    return {
      ok: Object.keys(errors).length === 0,
      errors
    };
  };

  const saveCurrentTriad = () => {
    const newTriad = {
      name: `Triada ${savedTriads.length + 1}`,
      idTerminal: String(params.idTerminal || ''),
      idSucursal: String(params.idSucursal || ''),
      serialNumber: String(params.serialNumber || '')
    };
    const res = validateTriad(newTriad);
    if (!res.ok) {
      setTriadErrors(res.errors);
      const msg = Object.values(res.errors).join('\n');
      return window.alert(msg);
    }
    const exists = savedTriads.findIndex((t) => String(t.idTerminal) === newTriad.idTerminal && String(t.idSucursal) === newTriad.idSucursal && String(t.serialNumber) === newTriad.serialNumber);
    if (exists !== -1) { updateSelectedTriadIndex(exists); return window.alert(t('triad.exists')); }
    updateSavedTriads([...savedTriads, newTriad]);
    updateSelectedTriadIndex(savedTriads.length);
    showSnackbar(t('triad.created'), 'success');
  };

  const handleDeleteTriad = (index) => {
    const triad = savedTriads[index];
    if (!triad) return;
    if (!window.confirm(t('triad.confirmDelete').replace('{name}', triad.name))) return;
    const arr = savedTriads.filter((_, i) => i !== index);
    updateSavedTriads(arr);
    if (selectedTriadIndex === index) updateSelectedTriadIndex(-1);
    else if (selectedTriadIndex > index) updateSelectedTriadIndex(selectedTriadIndex - 1);
  };

  const openEditTriad = (index) => {
    setTriadErrors({});
    setEditingTriadIndex(index);
    setEditingTriad(savedTriads[index]);
    setOpenTriadDialog(true);
  };

  const saveEditedTriad = () => {
    const cleanedTriad = {
      name: String(editingTriad.name || ''),
      idTerminal: String(editingTriad.idTerminal || ''),
      idSucursal: String(editingTriad.idSucursal || ''),
      serialNumber: String(editingTriad.serialNumber || '')
    };
    const res = validateTriad(cleanedTriad);
    if (!res.ok) {
      setTriadErrors(res.errors);
      return;
    }
    const dup = savedTriads.findIndex((t, i) => i !== editingTriadIndex && String(t.idTerminal) === cleanedTriad.idTerminal && String(t.idSucursal) === cleanedTriad.idSucursal && String(t.serialNumber) === cleanedTriad.serialNumber);
    if (dup !== -1) return window.alert(t('triad.duplicate'));
    const copy = [...savedTriads];
    if (editingTriadIndex === -1) copy.push(cleanedTriad); else copy[editingTriadIndex] = cleanedTriad;
    updateSavedTriads(copy);
    setOpenTriadDialog(false);
    setEditingTriadIndex(-1);
    setTriadErrors({});
    showSnackbar(editingTriadIndex === -1 ? t('triad.created') : t('triad.saved'), 'success');
  };

  const applyParsedTriad = (parsed) => {
    if (!parsed) return false;
    setEditingTriad(prev => ({
      name: parsed.name ? parsed.name : prev.name,
      idTerminal: parsed.idTerminal !== undefined && parsed.idTerminal !== '' ? parsed.idTerminal : prev.idTerminal,
      idSucursal: parsed.idSucursal !== undefined && parsed.idSucursal !== '' ? parsed.idSucursal : prev.idSucursal,
      serialNumber: parsed.serialNumber !== undefined && parsed.serialNumber !== '' ? parsed.serialNumber : prev.serialNumber,
    }));
    setTriadErrors(prev => ({
      ...prev,
      ...(parsed.idTerminal ? { idTerminal: undefined } : {}),
      ...(parsed.idSucursal ? { idSucursal: undefined } : {}),
      ...(parsed.serialNumber ? { serialNumber: undefined } : {}),
      ...(parsed.name ? { name: undefined } : {}),
    }));
    showSnackbar(t('triad.pasteSuccess') || 'Tríada autocompletada con éxito', 'success');
    return true;
  };

  const handlePasteAutocomplete = (text) => {
    if (!text) {
      showSnackbar(t('triad.pasteError') || 'No se encontraron datos en el portapapeles', 'error');
      return;
    }
    const parsed = parseTriadText(text);
    if (parsed && (parsed.idTerminal || parsed.idSucursal || parsed.serialNumber)) {
      applyParsedTriad(parsed);
    } else {
      showSnackbar(t('triad.pasteError') || 'Formato de portapapeles no reconocido', 'error');
    }
  };

  const handleInputPaste = (e) => {
    const text = e.clipboardData?.getData('text');
    if (text) {
      const parsed = parseTriadText(text);
      if (parsed && (parsed.idTerminal || parsed.idSucursal || parsed.serialNumber)) {
        e.preventDefault();
        applyParsedTriad(parsed);
      }
    }
  };

  const handleSaveWrittenTriad = () => {
    const term = String(params.idTerminal || '');
    const suc = String(params.idSucursal || '');
    const serial = String(params.serialNumber || '');

    const name = window.prompt(t('triad.promptName') || 'Ingrese un nombre para la tríada:', `Triada ${savedTriads.length + 1}`);
    if (name === null) return; // cancelled
    const finalName = name.trim() || `Triada ${savedTriads.length + 1}`;

    const newTriad = {
      name: finalName,
      idTerminal: term,
      idSucursal: suc,
      serialNumber: serial
    };

    const res = validateTriad(newTriad);
    if (!res.ok) {
      const msg = Object.values(res.errors).join('\n');
      return window.alert(msg);
    }

    const exists = savedTriads.findIndex((t) => String(t.idTerminal) === newTriad.idTerminal && String(t.idSucursal) === newTriad.idSucursal && String(t.serialNumber) === newTriad.serialNumber);
    if (exists !== -1) {
      updateSelectedTriadIndex(exists);
      return window.alert(t('triad.exists') || 'La tríada ya existe.');
    }

    updateSavedTriads([...savedTriads, newTriad]);
    updateSelectedTriadIndex(savedTriads.length);
    showSnackbar(t('triad.created') || 'Tríada creada', 'success');
  };

  // ── Render one input field based on its FIELD_CONFIG type ──────────────────
  const renderField = (field) => {
    const cfg = FIELD_CONFIG[field];
    if (!cfg) return null;
    const value = params[field] ?? (cfg.type === 'toggle' ? false : '');

    if (cfg.type === 'toggle') {
      // Use MUI Switch for printOnPos and c2cMode for a professional static control
      if (field === 'printOnPos' || field === 'c2cMode') {
        return (
          <div key={field} className="col-span-2 px-3 py-1.5 bg-background border border-accent/10 rounded-xl flex items-center justify-between">
            <span className="text-[10px] font-black text-text-secondary tracking-widest uppercase">
              {field === 'c2cMode' ? (value ? t('simDesatendido') : t('simAtendido')) : t(cfg.label)}
            </span>
            <Switch
              checked={Boolean(value)}
              onChange={(e) => handleParamChange(field, e.target.checked)}
              color="primary"
              size="medium"
            />
          </div>
        );
      }

      // Fallback for other toggles: static style without translate/scale movements
      return (
        <label
          key={field}
          className={`col-span-2 flex items-center justify-between p-3 bg-background border border-accent/10 rounded-xl select-none`}
        >
          <span className={`text-[10px] font-black text-text-secondary tracking-widest ${field !== 'idPromo' ? 'uppercase' : ''}`}>
            {t(cfg.label)}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={Boolean(value)}
            onClick={() => handleParamChange(field, !value)}
            className={`btn-reset relative w-11 h-6 rounded-full focus:outline-none border-2 ${value
              ? 'border-accent/60 shadow-sm'
              : 'border-text-secondary/20'
              }`}
            style={{
              backgroundColor: value ? 'rgb(51, 65, 85)' : 'rgb(229, 231, 235)'
            }}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm`} />
          </button>
        </label>
      );
    }

    if (field === 'saleType') {
      return (
        <label
          key={field}
          className={`block space-y-1.5 ${cfg.span === 2 ? 'col-span-2' : ''}`}
        >
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black text-text-secondary tracking-widest leading-none uppercase">
              {t(cfg.label)}
            </span>
          </div>
          <select
            value={value}
            onChange={(e) => handleParamChange(field, Number(e.target.value))}
            className="w-full bg-background border border-accent/10 rounded-xl px-3 py-2.5 outline-none focus:border-accent transition-all font-black text-text-primary text-sm shadow-sm cursor-pointer"
          >
            <option value={1} className="bg-card text-text-primary">1 - Compra Afecta</option>
            <option value={2} className="bg-card text-text-primary">2 - Factura Afecta</option>
            <option value={3} className="bg-card text-text-primary">3 - Compra Exenta</option>
            <option value={4} className="bg-card text-text-primary">4 - Factura Exenta</option>
            <option value={5} className="bg-card text-text-primary">5 - Recaudación Afecta</option>
            <option value={6} className="bg-card text-text-primary">6 - Recaudación Exenta</option>
          </select>
        </label>
      );
    }

    if (field === 'paymentCategory') {
      return (
        <label
          key={field}
          className={`block space-y-1.5 ${cfg.span === 2 ? 'col-span-2' : ''}`}
        >
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black text-text-secondary tracking-widest leading-none uppercase">
              {t(cfg.label)}
            </span>
          </div>
          <select
            value={value}
            onChange={(e) => handleParamChange(field, e.target.value)}
            className="w-full bg-background border border-accent/10 rounded-xl px-3 py-2.5 outline-none focus:border-accent transition-all font-black text-text-primary text-sm shadow-sm cursor-pointer"
          >
            <option value="" className="bg-card text-text-primary">{t('paymentCategory.none')}</option>
            <option value="FOOD_BENEFIT" className="bg-card text-text-primary">FOOD_BENEFIT</option>
          </select>
        </label>
      );
    }

    return (
      <label
        key={field}
        className={`block space-y-1.5 ${cfg.span === 2 ? 'col-span-2' : ''}`}
      >
        <div className="flex items-center justify-between px-1">
          <span className={`text-[10px] font-black text-text-secondary tracking-widest leading-none ${field !== 'idPromo' ? 'uppercase' : ''}`}>
            {t(cfg.label)}
          </span>
        </div>
        <input
          type={(field === 'amount' || field === 'tip') ? 'text' : (field === 'employeeId' || field === 'operationId' || field === 'rutToValidate') ? 'text' : cfg.type}
          value={(field === 'amount' || field === 'tip') ? formatCurrency(value) : value}
          onChange={(e) => handleParamChange(field, e.target.value)}
          maxLength={
            field === 'serialNumber' ? 20 :
              field === 'customId' ? 25 :
                field === 'ticketNumber' ? 24 :
                  field === 'employeeId' ? 4 :
                    field === 'authorizationCode' ? 20 :
                      field === 'operationId' ? 8 :
                        field === 'rutToValidate' ? 12 :
                          field === 'idPromo' ? 250 :
                            undefined
          }
          className="w-full bg-background border border-accent/10 rounded-xl px-3 py-2.5 outline-none focus:border-accent transition-all font-black text-text-primary text-sm shadow-sm"
        />
        {field === 'amount' && (
          <label className="flex items-center gap-1.5 px-1 mt-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAmountStatic}
              onChange={(e) => setIsAmountStatic(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span className="text-[9px] font-bold text-text-secondary/80 uppercase tracking-wider cursor-pointer">
              {t('field.amountStatic')}
            </span>
          </label>
        )}
        {field === 'ticketNumber' && (
          <label className="flex items-center gap-1.5 px-1 mt-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isTicketStatic}
              onChange={(e) => setIsTicketStatic(e.target.checked)}
              className="w-3.5 h-3.5 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-[9px] font-bold text-text-secondary/80 uppercase tracking-wider">
              {t('field.ticketStatic')}
            </span>
          </label>
        )}
        {field === 'ticketNumber' && (
          <div className="flex justify-end text-[10px] font-bold text-text-secondary/60 px-1 mt-0.5">
            {String(value ?? '').length}/24
          </div>
        )}
        {field === 'customId' && (
          <div className="flex justify-end text-[10px] font-bold text-text-secondary/60 px-1 mt-0.5">
            {String(value ?? '').length}/25
          </div>
        )}
        {field === 'rutToValidate' && value && !validateRut(value) && (
          <div className="text-[10px] font-bold text-rose-500 px-1 mt-0.5">
            {t('invalidRut')}
          </div>
        )}
      </label>
    );
  };

  const renderFlashParams = () => {
    if (selectedId !== 'flash_sale') return null;
    return (
      <>
        {/* Cantidad de Ventas */}
        <label className="block space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black text-text-secondary tracking-widest leading-none uppercase">
              {t('field.flashCount')}
            </span>
          </div>
          <input
            type="number"
            value={flashCount}
            onChange={(e) => {
              const val = e.target.value === '' ? '' : Math.max(1, Number(e.target.value));
              setFlashCount(val);
            }}
            className="w-full bg-background border border-accent/10 rounded-xl px-3 py-2.5 outline-none focus:border-accent transition-all font-black text-text-primary text-sm shadow-sm"
          />
        </label>

        {/* A partir de qué venta */}
        <label className="block space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black text-text-secondary tracking-widest leading-none uppercase">
              {t('field.flashAltThreshold')}
            </span>
          </div>
          <input
            type="number"
            value={flashAltThreshold}
            onChange={(e) => {
              const val = e.target.value === '' ? '' : Math.max(1, Number(e.target.value));
              setFlashAltThreshold(val);
            }}
            className="w-full bg-background border border-accent/10 rounded-xl px-3 py-2.5 outline-none focus:border-accent transition-all font-black text-text-primary text-sm shadow-sm"
          />
        </label>

        {/* Monto Base */}
        <label className="block space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black text-text-secondary tracking-widest leading-none uppercase">
              {t('field.flashBaseAmount')}
            </span>
          </div>
          <input
            type="text"
            value={formatCurrency(flashBaseAmount)}
            onChange={(e) => {
              const parsed = parseCurrency(e.target.value);
              setFlashBaseAmount(parsed);
            }}
            className="w-full bg-background border border-accent/10 rounded-xl px-3 py-2.5 outline-none focus:border-accent transition-all font-black text-text-primary text-sm shadow-sm"
          />
          <label className="flex items-center gap-1.5 px-1 mt-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAmountStatic}
              onChange={(e) => setIsAmountStatic(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span className="text-[9px] font-bold text-text-secondary/80 cursor-pointer uppercase tracking-wider">
              {t('field.amountStatic')}
            </span>
          </label>
        </label>

        {/* Monto Alternativo */}
        <label className="block space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black text-text-secondary tracking-widest leading-none uppercase">
              {t('field.flashAltAmount')}
            </span>
          </div>
          <input
            type="text"
            value={formatCurrency(flashAltAmount)}
            onChange={(e) => {
              const parsed = parseCurrency(e.target.value);
              setFlashAltAmount(parsed);
            }}
            className="w-full bg-background border border-accent/10 rounded-xl px-3 py-2.5 outline-none focus:border-accent transition-all font-black text-text-primary text-sm shadow-sm"
          />
        </label>
      </>
    );
  };

  const renderDynamicFields = () => {
    const triadKeys = ['idTerminal', 'idSucursal', 'serialNumber'];

    if (selectedId === 'flash_sale') {
      const remainingFields = selected.fields.filter(f => !triadKeys.includes(f) && f !== 'amount');
      return (
        <>
          {triadKeys.filter(f => selected.fields.includes(f)).map(renderField)}
          {renderFlashParams()}
          {remainingFields.map(renderField)}
        </>
      );
    }

    return selected.fields.map(renderField);
  };

  return (
    <div className="lg:col-span-4 space-y-6">

      {/* ── Main card ── */}
      <div className="bg-card rounded-[1rem] border border-accent/10 p-4 sm:p-6 lg:p-8 shadow-xl space-y-6">

        {/* Command selector */}
        <div className="space-y-4 tour-command-selector">
          <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
            {t('simCommand')}
          </h3>

          <div>
            <FormControl fullWidth variant="outlined" margin="dense">
              <Select
                value={COMMAND_METHODS.some((m) => m.id === selectedId) ? selectedId : (COMMAND_METHODS[0]?.id || '')}
                onChange={(e) => handleCommandChange(e.target.value)}
                disabled={loading}
                displayEmpty
                inputProps={{ 'aria-label': t('simCommand') }}
                sx={{
                  borderRadius: '16px',
                  backgroundColor: 'background.paper',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'rgba(99, 102, 241, 0.6)',
                  },
                  '&.Mui-focused': {
                    borderColor: '#6366f1',
                    boxShadow: '0 0 18px rgba(99, 102, 241, 0.35)',
                  }
                }}
                renderValue={(val) => {
                  const m = COMMAND_METHODS.find((c) => c.id === val);
                  if (!m) return '';
                  const raw = t(m.label);
                  const cleaned = raw.replace(/\s*\(.*?\)/, '').replace(/parametros.*$/i, '').replace(/cmd.*$/i, '').trim();
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>{cleaned}</span>
                    </Box>
                  );
                }}
              >
                {COMMAND_METHODS.map((m) => {
                  const raw = t(m.label);
                  const cleaned = raw.replace(/\s*\(.*?\)/, '').replace(/parametros.*$/i, '').replace(/cmd.*$/i, '').trim();
                  return (
                    <MenuItem key={m.id} value={m.id} sx={{ fontSize: '0.9rem', fontWeight: 700, borderRadius: '10px', my: 0.5, mx: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <span>{cleaned}</span>
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </div>
        </div>

        {/* Saved Triads Section */}
        <div className="mt-4 tour-triads">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{t('triad.title')}</h4>
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Save Written Triad Icon Button */}
              <Tooltip title={t('triad.saveAction') || "Guardar Tríada Escrita"} arrow placement="top">
                <button
                  type="button"
                  onClick={handleSaveWrittenTriad}
                  style={{ backgroundColor: 'transparent', boxShadow: 'none' }}
                  className="btn-reset p-1.5 !bg-transparent hover:!bg-indigo-500/10 text-text-secondary/80 hover:text-indigo-500 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 border border-indigo-500/25 hover:border-indigo-500/50 outline-none"
                  aria-label="Guardar Tríada Escrita"
                >
                  <Save className="w-3.5 h-3.5 text-indigo-500" />
                </button>
              </Tooltip>
              <Button
                onClick={() => { setTriadErrors({}); setOpenTriadDialog(true); setEditingTriadIndex(-1); setEditingTriad({ name: `Triada ${savedTriads.length + 1}`, idTerminal: '', idSucursal: '', serialNumber: '' }); }}
                variant="outlined"
                size="small"
                sx={{ fontWeight: 800, borderRadius: 2, px: 2, py: 0.5, fontSize: '0.75rem' }}
              >
                {t('triad.createBtn')}
              </Button>
            </div>
          </div>

          {savedTriads.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto py-2">
              {savedTriads.map((triad, idx) => (
                <Tooltip
                  key={idx}
                  title={<div style={{ whiteSpace: 'normal', fontSize: 13 }}>
                    <div style={{ marginBottom: 4, fontWeight: 800, fontSize: 14, borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 4 }}>{triad.name}</div>
                    <div><strong>S/N:</strong> {triad.serialNumber}</div>
                    <div><strong>ID Sucursal:</strong> {triad.idSucursal}</div>
                    <div><strong>ID Terminal:</strong> {triad.idTerminal}</div>
                  </div>}
                  placement="top"
                  arrow
                >
                  <div
                    onClick={() => {
                      updateSelectedTriadIndex(idx);
                      onSyncParam('idTerminal', triad.idTerminal);
                      onSyncParam('idSucursal', triad.idSucursal);
                      onSyncParam('serialNumber', triad.serialNumber);
                    }}
                    className={`px-4 py-3 flex items-center gap-3 min-w-[200px] rounded-xl border ${selectedTriadIndex === idx ? 'border-2 border-primary' : 'border-white/5'} cursor-pointer`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-black truncate ${selectedTriadIndex === idx ? '!text-black dark:!text-white' : 'text-text-primary'}`}>
                        {triad.name}
                      </p>
                      <p className={`text-[9px] truncate ${selectedTriadIndex === idx ? '!text-black/90 font-bold dark:!text-white/80' : 'text-text-secondary/60'}`}>
                        {triad.serialNumber} · {triad.idSucursal} · {triad.idTerminal}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Tooltip title={t('edit')}>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); openEditTriad(idx); }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('delete')}>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeleteTriad(idx); }} color="error">
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                </Tooltip>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center opacity-60">{t('triad.noTriads')}</div>
          )}
          <Snackbar open={snackOpen} autoHideDuration={2500} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
            <Alert onClose={() => setSnackOpen(false)} severity={snackSeverity} sx={{ width: '100%' }}>
              {snackMsg}
            </Alert>
          </Snackbar>
        </div>

        <Dialog
          open={openTriadDialog}
          onClose={() => setOpenTriadDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              backgroundColor: 'background.paper',
              backgroundImage: 'none',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }
          }}
        >
          <DialogTitle sx={{ px: { xs: 3, sm: 4 }, pt: { xs: 3, sm: 3.5 }, pb: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Layers className="w-5 h-5 text-indigo-500" />
              <Typography sx={{ fontWeight: 950, textTransform: 'uppercase', fontSize: { xs: '1.1rem', sm: '1.25rem' }, letterSpacing: '-0.02em', color: 'text.primary' }}>
                {editingTriadIndex === -1 ? t('triad.createTitle') : t('triad.editTitle')}
              </Typography>
            </Box>
            <div className="flex items-center gap-1.5">
              <Tooltip title={t('triad.pasteTooltip') || "Pegado Especial (Autocompletar Tríada)"} arrow>
                <IconButton
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      handlePasteAutocomplete(text);
                    } catch {
                      showSnackbar('No se pudo acceder al portapapeles', 'error');
                    }
                  }}
                  color="primary"
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '10px',
                    p: 1,
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      transform: 'scale(1.05)',
                    }
                  }}
                >
                  <Wand2 className="w-4.5 h-4.5 text-indigo-500" />
                </IconButton>
              </Tooltip>
              <IconButton
                onClick={() => setOpenTriadDialog(false)}
                size="small"
                sx={{
                  color: 'text.secondary',
                  p: 1,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    color: 'error.main',
                    transform: 'rotate(90deg)',
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <X size={18} />
              </IconButton>
            </div>
          </DialogTitle>
          <DialogContent sx={{ px: { xs: 3, sm: 4 }, py: 3 }}>
            <Box sx={{ display: 'grid', gap: { xs: 2, sm: 2.5 }, gridTemplateColumns: '1fr', mt: 1 }}>

              {/* Nombre */}
              <FormControl fullWidth error={!!triadErrors.name}>
                <Typography sx={{ fontSize: '10px', fontWeight: 800, mb: 0.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {t('triad.nameLabel')}
                </Typography>
                <div className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-background border ${triadErrors.name ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-accent/20 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20'} transition-all shadow-inner group`}>
                  <Tag size={16} className={`shrink-0 transition-colors ${triadErrors.name ? 'text-rose-500' : 'text-text-secondary/50 group-focus-within:text-accent'}`} />
                  <input
                    type="text"
                    value={editingTriad.name}
                    onChange={(e) => { setEditingTriad({ ...editingTriad, name: e.target.value }); setTriadErrors({ ...triadErrors, name: undefined }); }}
                    placeholder="Ej. Triada Principal"
                    maxLength={50}
                    style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                    className="no-focus-glow w-full bg-transparent border-none outline-none ring-0 focus:outline-none focus:ring-0 focus:border-none shadow-none focus:shadow-none text-xs sm:text-sm font-semibold text-text-primary placeholder:text-text-secondary/30"
                  />
                </div>
                {triadErrors.name && (
                  <Typography variant="caption" sx={{ color: 'error.main', fontSize: '11px', fontWeight: 500, mt: 0.5, px: 0.5 }}>
                    {triadErrors.name}
                  </Typography>
                )}
              </FormControl>

              {/* ID Terminal */}
              <FormControl fullWidth error={!!triadErrors.idTerminal}>
                <Typography sx={{ fontSize: '10px', fontWeight: 800, mb: 0.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  ID Terminal
                </Typography>
                <div className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-background border ${triadErrors.idTerminal ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-accent/20 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20'} transition-all shadow-inner group`}>
                  <Monitor size={16} className={`shrink-0 transition-colors ${triadErrors.idTerminal ? 'text-rose-500' : 'text-text-secondary/50 group-focus-within:text-accent'}`} />
                  <input
                    type="text"
                    value={editingTriad.idTerminal}
                    onPaste={handleInputPaste}
                    onChange={(e) => { setEditingTriad({ ...editingTriad, idTerminal: e.target.value.slice(0, 20) }); setTriadErrors({ ...triadErrors, idTerminal: undefined }); }}
                    placeholder=""
                    maxLength={20}
                    style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                    className="no-focus-glow w-full bg-transparent border-none outline-none ring-0 focus:outline-none focus:ring-0 focus:border-none shadow-none focus:shadow-none font-mono text-xs sm:text-sm font-semibold text-text-primary placeholder:text-text-secondary/30"
                  />
                </div>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, px: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'error.main', fontSize: '11px', fontWeight: 500 }}>
                    {triadErrors.idTerminal || ''}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11px', fontWeight: 500, ml: 'auto' }}>
                    {(editingTriad.idTerminal || '').length}/20
                  </Typography>
                </Box>
              </FormControl>

              {/* ID Sucursal */}
              <FormControl fullWidth error={!!triadErrors.idSucursal}>
                <Typography sx={{ fontSize: '10px', fontWeight: 800, mb: 0.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  ID Sucursal
                </Typography>
                <div className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-background border ${triadErrors.idSucursal ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-accent/20 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20'} transition-all shadow-inner group`}>
                  <Building2 size={16} className={`shrink-0 transition-colors ${triadErrors.idSucursal ? 'text-rose-500' : 'text-text-secondary/50 group-focus-within:text-accent'}`} />
                  <input
                    type="text"
                    value={editingTriad.idSucursal}
                    onPaste={handleInputPaste}
                    onChange={(e) => { setEditingTriad({ ...editingTriad, idSucursal: e.target.value.slice(0, 20) }); setTriadErrors({ ...triadErrors, idSucursal: undefined }); }}
                    placeholder=""
                    maxLength={20}
                    style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                    className="no-focus-glow w-full bg-transparent border-none outline-none ring-0 focus:outline-none focus:ring-0 focus:border-none shadow-none focus:shadow-none font-mono text-xs sm:text-sm font-semibold text-text-primary placeholder:text-text-secondary/30"
                  />
                </div>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, px: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'error.main', fontSize: '11px', fontWeight: 500 }}>
                    {triadErrors.idSucursal || ''}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11px', fontWeight: 500, ml: 'auto' }}>
                    {(editingTriad.idSucursal || '').length}/20
                  </Typography>
                </Box>
              </FormControl>

              {/* Serial Number */}
              <FormControl fullWidth error={!!triadErrors.serialNumber}>
                <Typography sx={{ fontSize: '10px', fontWeight: 800, mb: 0.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Serial Number
                </Typography>
                <div className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-background border ${triadErrors.serialNumber ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-accent/20 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20'} transition-all shadow-inner group`}>
                  <Hash size={16} className={`shrink-0 transition-colors ${triadErrors.serialNumber ? 'text-rose-500' : 'text-text-secondary/50 group-focus-within:text-accent'}`} />
                  <input
                    type="text"
                    value={editingTriad.serialNumber}
                    onPaste={handleInputPaste}
                    onChange={(e) => { setEditingTriad({ ...editingTriad, serialNumber: e.target.value.toUpperCase().slice(0, 20) }); setTriadErrors({ ...triadErrors, serialNumber: undefined }); }}
                    placeholder=""
                    maxLength={20}
                    style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                    className="no-focus-glow w-full bg-transparent border-none outline-none ring-0 focus:outline-none focus:ring-0 focus:border-none shadow-none focus:shadow-none font-mono text-xs sm:text-sm font-semibold uppercase text-text-primary placeholder:text-text-secondary/30"
                  />
                </div>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, px: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'error.main', fontSize: '11px', fontWeight: 500 }}>
                    {triadErrors.serialNumber || ''}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11px', fontWeight: 500, ml: 'auto' }}>
                    {(editingTriad.serialNumber || '').length}/20
                  </Typography>
                </Box>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: { xs: 3, sm: 4 }, pb: { xs: 3.5, sm: 4 }, pt: 2, gap: 1.5 }}>
            <Button
              onClick={() => setOpenTriadDialog(false)}
              variant="outlined"
              color="inherit"
              sx={{
                px: 3.5,
                py: 1.25,
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.85rem',
                textTransform: 'none',
                borderColor: 'divider',
                '&:hover': {
                  backgroundColor: 'action.hover',
                  borderColor: 'text.secondary',
                }
              }}
            >
              {t('triad.cancelBtn')}
            </Button>
            <Button
              variant="contained"
              onClick={() => { saveEditedTriad(); }}
              sx={{
                px: 4.5,
                py: 1.25,
                borderRadius: '12px',
                fontWeight: 900,
                fontSize: '0.85rem',
                textTransform: 'none',
                boxShadow: (theme) => `0 8px 20px -4px ${theme.palette.mode === 'dark' ? 'rgba(99,102,241,0.4)' : 'rgba(79,70,229,0.3)'}`,
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                  : 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                color: '#ffffff',
                '&:hover': {
                  filter: 'brightness(1.1)',
                  boxShadow: (theme) => `0 12px 24px -4px ${theme.palette.mode === 'dark' ? 'rgba(99,102,241,0.5)' : 'rgba(79,70,229,0.45)'}`,
                }
              }}
            >
              {editingTriadIndex === -1 ? t('triad.createAction') : t('triad.saveAction')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Command card */}
        <div className={`p-2 rounded-2xl ${selected.bg} border border-white/5 flex items-center gap-4 animate-in fade-in duration-200 tour-command-card`}>
          <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm shrink-0">
            <Icon className={`w-5 h-5 ${selected.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-black tracking-tight ${selected.color} uppercase leading-tight`}>
              {t(selected.label)}
            </p>
            <p className="text-[9px] text-text-secondary/60 font-bold mt-0.5">
              /{selected.endpoint?.toUpperCase() || 'UNKNOWN'} · CMD {selected.template?.command ?? '—'}
            </p>
          </div>

          {(selected.id === 'sale_promo' || selected.id === 'c2c_mode' || selected.id === 'bioauth') && (
            <Tooltip
              title={
                t('simVersionNotice') && t('simVersionNotice') !== 'simVersionNotice'
                  ? t('simVersionNotice')
                  : 'Este comando al igual que el de c2cmode son solo para las versiones 1.0.3 de iOnetech'
              }
              arrow
              placement="top"
            >
              <div
                style={{ backgroundColor: 'transparent', boxShadow: 'none' }}
                className="p-1.5 bg-transparent text-accent/70 hover:text-accent rounded-lg flex items-center justify-center cursor-help shrink-0"
                aria-label="Información de versión"
              >
                <HelpCircle className="w-4 h-4" />
              </div>
            </Tooltip>
          )}
          {selected.fields.length > 0 && (
            <span className={`text-[9px] font-bold px-2 py-1 rounded-lg bg-white/10 ${selected.color} uppercase tracking-widest shrink-0 hidden md:flex items-center gap-1.5`}>
              <span className="opacity-50">{selected.fields.length}</span>
              <span>{t('simParamsCount')}</span>
            </span>
          )}
        </div>

        {/* Dynamic params */}
        {selected.fields.length > 0 && (
          <div className="tour-params">
            <div className="border-t border-accent/5" />
            <div className="grid grid-cols-2 gap-2 mt-4">
              {renderDynamicFields()}
            </div>
          </div>
        )}

        {/* Send Button (Visible ONLY on small screens for mobile UX) */}
        <div className="sm:hidden pt-2">
          <div className="relative flex items-center justify-center w-full">
            {/* Subtle soft ambient aura */}
            {(!loading && accessToken) && (
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 via-blue-600/30 to-indigo-600/20 rounded-full blur-xs opacity-40 group-hover:opacity-70 transition-opacity duration-300 pointer-events-none" />
            )}

            <button
              id="tour-mobile-send-btn"
              onClick={loading ? onCancel : onSend}
              disabled={!loading && !accessToken}
              style={{ height: '48px' }}
              className={`btn-reset w-full p-[2px] rounded-full transition-all duration-300 select-none relative overflow-hidden group ${loading
                ? 'shadow-sm cursor-pointer'
                : !accessToken
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
              ) : !accessToken ? (
                <div className="absolute inset-0 bg-slate-700/60 pointer-events-none" />
              ) : (
                <>
                  {/* Primary slow fluid stream */}
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
                  : !accessToken
                    ? 'bg-slate-800 text-slate-400'
                    : 'bg-gradient-to-b from-[#1d4ed8] via-[#2563eb] to-[#1e40af] text-white shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.3)] border-t border-white/30 border-b border-blue-950/60'
                  }`}
              >
                {/* Secondary Elegant Hover Gradient (smooth 700ms cross-fade) */}
                {!loading && accessToken && (
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
                  {!accessToken && <Lock className="w-3.5 h-3.5 opacity-60 ml-1 shrink-0" />}
                </div>
              </div>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
