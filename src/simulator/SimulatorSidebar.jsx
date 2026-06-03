import React, { useState, useCallback, useEffect } from 'react';
import { ChevronRight, Layers, History, X, Trash2, Play, RefreshCw, Lock, ShieldCheck, Wand2, HelpCircle, XCircle } from 'lucide-react';

import { CONFIG } from './simulator.constants';
import { useLanguage } from '../context/LanguageContext';
import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, FormControl, OutlinedInput, FormHelperText, Typography, Select, MenuItem, Switch, FormControlLabel, Snackbar, Alert } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

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
  const body = parseInt(clean.slice(0, -1), 10);
  if (isNaN(body)) return false;
  let sum = 0;
  let multiplier = 2;
  let tempBody = body;
  while (tempBody > 0) {
    sum += (tempBody % 10) * multiplier;
    tempBody = Math.floor(tempBody / 10);
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const expectedDvVal = 11 - (sum % 11);
  let expectedDv = '';
  if (expectedDvVal === 11) expectedDv = '0';
  else if (expectedDvVal === 10) expectedDv = 'K';
  else expectedDv = String(expectedDvVal);
  return dv === expectedDv;
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
  isFlashRunning,
  isStopping,
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
      }

      onLoadTemplate(JSON.stringify(finalTemplate, null, 2), method.endpoint, id);
    }
  }, [onLoadTemplate]);

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
    } else if (field === 'ticketNumber' || field === 'customId') {
      finalValue = String(rawValue).slice(0, 24);
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

  useEffect(() => {
    try { localStorage.setItem(triadStorageKey, JSON.stringify(savedTriads)); } catch {}
  }, [savedTriads, triadStorageKey]);

  useEffect(() => {
    try { localStorage.setItem(`${triadStorageKey}_selected`, String(selectedTriadIndex)); } catch {}
  }, [selectedTriadIndex, triadStorageKey]);

  useEffect(() => {
    if (selectedTriadIndex >= 0 && savedTriads[selectedTriadIndex]) {
      const t = savedTriads[selectedTriadIndex];
      onSyncParam('idTerminal', t.idTerminal);
      onSyncParam('idSucursal', t.idSucursal);
      onSyncParam('serialNumber', t.serialNumber);
    }
  }, [selectedTriadIndex, savedTriads, onSyncParam]);

  const validateTriad = (triad) => {
    if (!triad.idTerminal || !triad.idSucursal || !triad.serialNumber) return { ok: false, msg: 'ID Terminal, ID Sucursal y Serial Number son requeridos' };
    if (triad.idTerminal.length > 20 || triad.idSucursal.length > 20 || triad.serialNumber.length > 20) return { ok: false, msg: 'Los campos no deben exceder 20 caracteres' };
    return { ok: true };
  };

  const saveCurrentTriad = () => {
    const newTriad = { name: `Triada ${savedTriads.length + 1}`, idTerminal: params.idTerminal || '', idSucursal: params.idSucursal || '', serialNumber: params.serialNumber || '' };
    const res = validateTriad(newTriad);
    if (!res.ok) {
      // map to inline errors when possible
      const errs = {};
      if (res.msg.includes('Terminal')) errs.idTerminal = res.msg;
      if (res.msg.includes('Sucursal')) errs.idSucursal = res.msg;
      if (res.msg.includes('Serial')) errs.serialNumber = res.msg;
      setTriadErrors(errs);
      return window.alert(res.msg);
    }
    const exists = savedTriads.findIndex((t) => t.idTerminal === newTriad.idTerminal && t.idSucursal === newTriad.idSucursal && t.serialNumber === newTriad.serialNumber);
    if (exists !== -1) { setSelectedTriadIndex(exists); return window.alert('Triada ya existe. Seleccionada.'); }
    setSavedTriads((s) => [...s, newTriad]);
    setSelectedTriadIndex(savedTriads.length);
    showSnackbar('Triada creada', 'success');
  };

  const handleDeleteTriad = (index) => {
    const triad = savedTriads[index];
    if (!triad) return;
    if (!window.confirm(`¿Eliminar triada "${triad.name}"?`)) return;
    const arr = savedTriads.filter((_, i) => i !== index);
    setSavedTriads(arr);
    if (selectedTriadIndex === index) setSelectedTriadIndex(-1);
    else if (selectedTriadIndex > index) setSelectedTriadIndex(selectedTriadIndex - 1);
  };

  const openEditTriad = (index) => {
    setEditingTriadIndex(index);
    setEditingTriad(savedTriads[index]);
    setOpenTriadDialog(true);
  };

  const saveEditedTriad = () => {
    const res = validateTriad(editingTriad);
    if (!res.ok) {
      const errs = {};
      if (res.msg.includes('Terminal')) errs.idTerminal = res.msg;
      if (res.msg.includes('Sucursal')) errs.idSucursal = res.msg;
      if (res.msg.includes('Serial')) errs.serialNumber = res.msg;
      setTriadErrors(errs);
      return;
    }
    const dup = savedTriads.findIndex((t, i) => i !== editingTriadIndex && t.idTerminal === editingTriad.idTerminal && t.idSucursal === editingTriad.idSucursal && t.serialNumber === editingTriad.serialNumber);
    if (dup !== -1) return window.alert('La triada modificada coincide con otra existente');
    const copy = [...savedTriads];
    if (editingTriadIndex === -1) copy.push(editingTriad); else copy[editingTriadIndex] = editingTriad;
    setSavedTriads(copy);
    setOpenTriadDialog(false);
    setEditingTriadIndex(-1);
    setTriadErrors({});
    showSnackbar(editingTriadIndex === -1 ? 'Triada creada' : 'Triada guardada', 'success');
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
            className={`relative w-11 h-6 rounded-full focus:outline-none border-2 ${
              value 
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
            (field === 'ticketNumber' || field === 'customId') ? 24 : 
            field === 'employeeId' ? 4 : 
            field === 'authorizationCode' ? 20 :
            field === 'operationId' ? 8 :
            field === 'rutToValidate' ? 12 :
            field === 'idPromo' ? 250 :
            undefined
          }
          className="w-full bg-background border border-accent/10 rounded-xl px-3 py-2.5 outline-none focus:border-accent transition-all font-black text-text-primary text-sm shadow-sm"
        />
        {(field === 'ticketNumber' || field === 'customId') && (
          <div className="flex justify-end text-[10px] font-bold text-text-secondary/60 px-1 mt-0.5">
            {String(value ?? '').length}/24
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
                value={selectedId}
                onChange={(e) => handleCommandChange(e.target.value)}
                disabled={loading}
                displayEmpty
                inputProps={{ 'aria-label': t('simCommand') }}
                sx={{
                  borderRadius: 2,
                  backgroundColor: 'background.paper'
                }}
                renderValue={(val) => {
                  const m = COMMAND_METHODS.find((c) => c.id === val);
                  if (!m) return '';
                  const raw = t(m.label);
                  const cleaned = raw.replace(/\s*\(.*?\)/, '').replace(/parametros.*$/i, '').replace(/cmd.*$/i, '').trim();
                  return <span style={{ fontSize: '0.95rem' }}>{cleaned}</span>;
                }}
              >
                {COMMAND_METHODS.map((m) => {
                  const raw = t(m.label);
                  const cleaned = raw.replace(/\s*\(.*?\)/, '').replace(/parametros.*$/i, '').replace(/cmd.*$/i, '').trim();
                  return (
                    <MenuItem key={m.id} value={m.id} sx={{ fontSize: '0.9rem' }}>
                      {cleaned}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </div>

        {/* Saved Triads Section */}
        <div className="mt-4 tour-triads">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Triadas Guardadas</h4>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => { setOpenTriadDialog(true); setEditingTriadIndex(-1); setEditingTriad({ name: `Triada ${savedTriads.length + 1}`, idTerminal: '', idSucursal: '', serialNumber: '' }); }}
                  variant="outlined"
                  size="small"
                  sx={{ fontWeight: 800, borderRadius: 2, px: 2.5, py: 1 }}
                >
                  CREAR TRIADA
                </Button>
                {/* Removed direct Guardar button per request */}
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
                        setSelectedTriadIndex(idx);
                        onSyncParam('idTerminal', triad.idTerminal);
                        onSyncParam('idSucursal', triad.idSucursal);
                        onSyncParam('serialNumber', triad.serialNumber);
                      }}
                      className={`px-4 py-3 flex items-center gap-3 min-w-[200px] rounded-xl border ${selectedTriadIndex === idx ? 'border-2 border-primary' : 'border-white/5'} cursor-pointer`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black truncate">{triad.name}</p>
                        <p className="text-[9px] text-text-secondary/60 truncate">{triad.serialNumber} · {triad.idSucursal} · {triad.idTerminal}</p>
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
            <div className="py-4 text-center opacity-60">No hay triadas guardadas</div>
          )}
          <Snackbar open={snackOpen} autoHideDuration={2500} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
            <Alert onClose={() => setSnackOpen(false)} severity={snackSeverity} sx={{ width: '100%' }}>
              {snackMsg}
            </Alert>
          </Snackbar>
        </div>

        {/* Triad Edit/Create Dialog (Material UI inputs) */}
        <Dialog open={openTriadDialog} onClose={() => setOpenTriadDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ px: { xs: 3, sm: 4 }, pt: { xs: 3.5, sm: 4 }, pb: 1, fontWeight: 950, fontSize: { xs: '1.2rem', sm: '1.4rem' }, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
            {editingTriadIndex === -1 ? 'Crear Triada' : 'Editar Triada'}
          </DialogTitle>
          <DialogContent sx={{ px: { xs: 3, sm: 4 }, py: 2 }}>
            <Box sx={{ display: 'grid', gap: { xs: 2, sm: 2.5 }, gridTemplateColumns: '1fr', mt: 1.5 }}>
              <FormControl fullWidth error={!!triadErrors.name} variant="outlined">
                <Typography sx={{ fontSize: '10px', fontWeight: 800, mb: 1, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Nombre</Typography>
                <OutlinedInput
                  value={editingTriad.name}
                  onChange={(e) => { setEditingTriad({ ...editingTriad, name: e.target.value }); setTriadErrors({ ...triadErrors, name: undefined }); }}
                  size="small"
                  fullWidth
                  inputProps={{ maxLength: 50 }}
                  sx={{ borderRadius: '12px' }}
                />
                {triadErrors.name && <FormHelperText>{triadErrors.name}</FormHelperText>}
              </FormControl>

              <FormControl fullWidth error={!!triadErrors.idTerminal} variant="outlined">
                <Typography sx={{ fontSize: '10px', fontWeight: 800, mb: 1, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em' }}>ID Terminal</Typography>
                <OutlinedInput
                  value={editingTriad.idTerminal}
                  onChange={(e) => { setEditingTriad({ ...editingTriad, idTerminal: e.target.value.slice(0,20) }); setTriadErrors({ ...triadErrors, idTerminal: undefined }); }}
                  size="small"
                  fullWidth
                  inputProps={{ maxLength: 20 }}
                  sx={{ borderRadius: '12px' }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, px: 0.5 }}>
                  <Typography variant="caption" color={triadErrors.idTerminal ? 'error' : 'text.secondary'} sx={{ fontSize: '11px', fontWeight: 500 }}>
                    {triadErrors.idTerminal || ''}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px', fontWeight: 500, ml: 'auto' }}>
                    {(editingTriad.idTerminal || '').length}/20
                  </Typography>
                </Box>
              </FormControl>

              <FormControl fullWidth error={!!triadErrors.idSucursal} variant="outlined">
                <Typography sx={{ fontSize: '10px', fontWeight: 800, mb: 1, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em' }}>ID Sucursal</Typography>
                <OutlinedInput
                  value={editingTriad.idSucursal}
                  onChange={(e) => { setEditingTriad({ ...editingTriad, idSucursal: e.target.value.slice(0,20) }); setTriadErrors({ ...triadErrors, idSucursal: undefined }); }}
                  size="small"
                  fullWidth
                  inputProps={{ maxLength: 20 }}
                  sx={{ borderRadius: '12px' }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, px: 0.5 }}>
                  <Typography variant="caption" color={triadErrors.idSucursal ? 'error' : 'text.secondary'} sx={{ fontSize: '11px', fontWeight: 500 }}>
                    {triadErrors.idSucursal || ''}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px', fontWeight: 500, ml: 'auto' }}>
                    {(editingTriad.idSucursal || '').length}/20
                  </Typography>
                </Box>
              </FormControl>

              <FormControl fullWidth error={!!triadErrors.serialNumber} variant="outlined">
                <Typography sx={{ fontSize: '10px', fontWeight: 800, mb: 1, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Serial Number</Typography>
                <OutlinedInput
                  value={editingTriad.serialNumber}
                  onChange={(e) => { setEditingTriad({ ...editingTriad, serialNumber: e.target.value.toUpperCase().slice(0,20) }); setTriadErrors({ ...triadErrors, serialNumber: undefined }); }}
                  size="small"
                  fullWidth
                  inputProps={{ maxLength: 20 }}
                  sx={{ borderRadius: '12px', textTransform: 'uppercase' }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, px: 0.5 }}>
                  <Typography variant="caption" color={triadErrors.serialNumber ? 'error' : 'text.secondary'} sx={{ fontSize: '11px', fontWeight: 500 }}>
                    {triadErrors.serialNumber || ''}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px', fontWeight: 500, ml: 'auto' }}>
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
              Cancelar
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
              {editingTriadIndex === -1 ? 'Crear' : 'Guardar'}
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
                    : 'Este comando al igual que el de c2cmode son solo para las versiones 1.0.3 de iOnetech'}
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
          <div className="tour-params">
            <div className="border-t border-accent/5" />
              <div className="grid grid-cols-2 gap-2 mt-4">
                {selected.fields.map(renderField)}
              </div>
          </div>
        )}

        {/* Send Button (Visible ONLY on small screens for mobile UX) */}
          <div className="sm:hidden pt-2">
           <button
            onClick={loading ? onCancel : onSend}
            disabled={!loading && !accessToken}
            className={`w-full py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl text-sm uppercase tracking-widest ${
              loading
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/40 cursor-pointer animate-pulse-gentle'
                : !accessToken 
                  ? 'bg-text-secondary/10 text-text-secondary/40 cursor-not-allowed border border-dashed border-text-secondary/20 grayscale shadow-none' 
                  : 'bg-accent hover:bg-accent-warm text-white glow shadow-accent/20 cursor-pointer'
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{isStopping ? 'DETENIENDO...' : isFlashRunning ? 'DETENER' : t('simCancelBtn')}</span>
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

     

        {/* Token status & Actions */}
        <div className="border-t border-accent/5 pt-6 space-y-3">
          {accessToken ? (
            <div 
              onClick={() => {
                if (window.confirm(t('confirmClearToken'))) {
                  onClearToken();
                }
              }} 
              className="group relative overflow-hidden bg-gradient-to-r from-emerald-500/[0.03] to-emerald-500/[0.08] border border-emerald-500/20 rounded-2xl p-4 transition-all duration-500 hover:shadow-lg hover:shadow-emerald-500/5 hover:border-emerald-500/40 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{t('simTokenActive')}</span>
                </div>
                <div className="p-1.5 bg-rose-500 group-hover:bg-rose-600 rounded-lg text-white transition-all shadow-lg shadow-rose-500/10">
                  <Trash2 className="w-3 h-3" />
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="w-full p-4 bg-accent/[0.03] border border-accent/20 rounded-2xl flex items-center justify-between hover:bg-accent/[0.08] hover:border-accent transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-accent/10 text-accent">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-accent uppercase tracking-widest">
                  {t('simNoToken')}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-accent/40" />
            </button>
          )}

        </div>
      </div>

    </div>
  );
}
