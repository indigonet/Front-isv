import { alpha } from '@mui/material/styles';

export const SIM_RADIUS = 12;
export const SIM_DESKTOP_MQ = '(min-width: 1024px)';

export function isSimulatorDesktop() {
  if (typeof window === 'undefined') return true;
  return window.matchMedia(SIM_DESKTOP_MQ).matches;
}

export function simPageBgSx(theme) {
  const dark = theme.palette.mode === 'dark';
  return {
    background: dark ? '#0c0f14' : '#f1f5f9',
  };
}

export function simAmbientOrbs(theme) {
  const dark = theme.palette.mode === 'dark';
  if (!dark) return [];
  return [
    {
      position: 'absolute',
      top: '-8%',
      right: '5%',
      width: 280,
      height: 280,
      borderRadius: '50%',
      background: `radial-gradient(circle, ${alpha('#818cf8', 0.12)} 0%, transparent 70%)`,
      pointerEvents: 'none',
    },
  ];
}

/** Card con buen contraste */
export function simCardSx(theme, extra = {}) {
  const dark = theme.palette.mode === 'dark';

  return {
    borderRadius: `${SIM_RADIUS}px`,
    border: '1px solid',
    borderColor: dark ? alpha('#fff', 0.12) : alpha('#0f172a', 0.1),
    bgcolor: dark ? '#0f1727' : '#ffffff',
    boxShadow: dark
      ? `0 6px 24px -8px ${alpha('#000', 0.6)}`
      : `0 6px 20px -6px ${alpha('#0f172a', 0.12)}`,
    overflow: 'hidden',
    transition: 'border-color 180ms ease, box-shadow 180ms ease',
    '&:hover': {
      borderColor: dark ? alpha('#6366f1', 0.4) : alpha('#6366f1', 0.35),
      boxShadow: dark
        ? `0 12px 36px -12px rgba(99, 102, 241, 0.35)`
        : `0 12px 36px -12px rgba(79, 70, 229, 0.18)`,
    },
    ...extra,
  };
}

export function simSectionHeaderSx(theme) {
  const dark = theme.palette.mode === 'dark';
  return {
    px: { xs: 1.75, lg: 2 },
    py: { xs: 0.9, lg: 1.1 },
    borderBottom: '1px solid',
    borderColor: dark ? alpha('#fff', 0.08) : alpha('#0f172a', 0.08),
    bgcolor: 'transparent',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };
}

export const simContentPad = {
  px: { xs: 2, lg: 2.25 },
  py: { xs: 1.25, lg: 1.5 },
};

export function simScrollbarSx(theme) {
  const dark = theme.palette.mode === 'dark';
  return {
    '&::-webkit-scrollbar': { width: 8, height: 8 },
    '&::-webkit-scrollbar-thumb': {
      background: dark ? alpha('#9ca3ff', 0.18) : alpha('#94a3b8', 0.25),
      borderRadius: 6,
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
  };
}

export function simPaperInteractiveSx(theme) {
  const dark = theme.palette.mode === 'dark';
  return {
    transition: 'border-color 140ms ease, box-shadow 140ms ease',
    cursor: 'pointer',
    '&:hover': {
      borderColor: dark ? alpha('#6366f1', 0.45) : alpha('#6366f1', 0.3),
      boxShadow: dark ? `0 10px 30px -12px rgba(99, 102, 241, 0.35)` : `0 10px 30px -12px rgba(79, 70, 229, 0.18)`,
    },
  };
}

export function simTopBarSx(theme) {
  return {
    ...simCardSx(theme),
    flexShrink: 0,
    mb: { xs: 1.5, lg: 1.5 },
    px: { xs: 1.75, sm: 2.5 },
    py: { xs: 1.25, sm: 1.5 },
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
    alignItems: { xs: 'stretch', sm: 'center' },
    justifyContent: 'space-between',
    gap: { xs: 1.25, sm: 2 },
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(129, 140, 248, 0.12) 0%, rgba(34, 211, 238, 0.08) 100%)'
      : 'linear-gradient(135deg, rgba(129, 140, 248, 0.06) 0%, rgba(34, 211, 238, 0.04) 100%)',
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(129, 140, 248, 0.25)' : 'rgba(129, 140, 248, 0.2)'}`,
  };
}

/** Card con color especial para comandos */
export function simCommandCardSx(theme, extra = {}) {
  const dark = theme.palette.mode === 'dark';

  return {
    // Tamaño predefinido para que todos los paneles de comando queden a la par
    minWidth: { xs: '100%', sm: 360 },
    minHeight: 520,
    borderRadius: `${SIM_RADIUS}px`,
    border: '1px solid',
    borderColor: dark ? alpha('#6366f1', 0.3) : alpha('#6366f1', 0.2),
    bgcolor: dark ? alpha('#6366f1', 0.08) : alpha('#6366f1', 0.04),
    boxShadow: dark
      ? '0 6px 22px -8px rgba(99, 102, 241, 0.28)'
      : '0 6px 20px -8px rgba(99, 102, 241, 0.12)',
    overflow: 'hidden',
    transition: 'border-color 160ms ease, box-shadow 160ms ease',
    '&:hover': {
      borderColor: dark ? alpha('#6366f1', 0.5) : alpha('#6366f1', 0.4),
      boxShadow: dark ? '0 14px 40px -12px rgba(99, 102, 241, 0.45)' : '0 14px 40px -12px rgba(79, 70, 229, 0.22)',
    },
    ...extra,
  };
}

/** Card con color especial para historial */
export function simHistoryCardSx(theme, extra = {}) {
  const dark = theme.palette.mode === 'dark';

  return {
    borderRadius: `${SIM_RADIUS}px`,
    border: '1px solid',
    borderColor: dark ? alpha('#06b6d4', 0.3) : alpha('#06b6d4', 0.2),
    bgcolor: dark ? alpha('#06b6d4', 0.08) : alpha('#06b6d4', 0.04),
    boxShadow: dark
      ? '0 2px 16px -4px rgba(6, 182, 212, 0.3)'
      : '0 2px 12px -4px rgba(6, 182, 212, 0.15)',
    overflow: 'hidden',
    ...extra,
  };
}

/** Panel request/response sin fondo de color */
export function simCodePanelSx(theme, type = 'request') {
  const dark = theme.palette.mode === 'dark';
  const isResponse = type === 'response';

  return {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    flex: 1,
    bgcolor: 'transparent',
    borderBottom: {
      xs: !isResponse ? '1px solid' : 'none',
      xl: 'none',
    },
    borderRight: {
      xl: isResponse ? 'none' : '1px solid',
    },
    borderColor: dark ? alpha('#fff', 0.08) : alpha('#0f172a', 0.08),
  };
}

export function simCodeTextSx(theme, type = 'request') {
  const dark = theme.palette.mode === 'dark';
  return {
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontSize: { xs: '0.78rem', sm: '0.8rem', lg: '0.8125rem' },
    fontWeight: 500,
    lineHeight: 1.6,
    color: type === 'response'
      ? dark
        ? '#7dd3fc'
        : '#0369a1'
      : dark
        ? '#86efac'
        : '#15803d',
    m: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  };
}

export function simSectionLabelSx(theme, accent = 'default') {
  const dark = theme.palette.mode === 'dark';
  const colors = {
    request: dark ? '#86efac' : '#15803d',
    response: dark ? '#7dd3fc' : '#0369a1',
    default: theme.palette.text.secondary,
  };
  return {
    fontWeight: 600,
    fontSize: { xs: '0.8rem', lg: '0.8125rem' },
    letterSpacing: '0.01em',
    color: colors[accent] || colors.default,
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
  };
}

export function simActionBtnSx(variant, { disabled } = {}) {
  const base = {
    color: '#fff',
    borderRadius: '12px',
    fontWeight: 600,
    fontSize: { xs: '0.8rem', sm: '0.75rem' },
    letterSpacing: '0.01em',
    textTransform: 'none',
    border: 'none',
    minHeight: { xs: 44, sm: 40 },
    transition: 'box-shadow 160ms ease, background 160ms ease',
    cursor: 'pointer',
    '&:hover': { boxShadow: '0 8px 24px -8px rgba(0,0,0,0.12)' },
    '&.Mui-disabled': {
      opacity: 0.5,
      color: 'rgba(255,255,255,0.9)',
      background: '#64748b',
    },
  };

  const variants = {
    country: {
      background: 'linear-gradient(135deg, #6d28d9 0%, #6366f1 100%)',
      boxShadow: '0 3px 12px -2px rgba(99, 102, 241, 0.4)',
    },
    token: {
      background: 'linear-gradient(135deg, #0891b2 0%, #0ea5e9 100%)',
      boxShadow: '0 3px 12px -2px rgba(14, 165, 233, 0.35)',
    },
    send: {
      background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      boxShadow: '0 3px 12px -2px rgba(16, 185, 129, 0.4)',
    },
    sendCancel: {
      background: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
      boxShadow: '0 3px 12px -2px rgba(244, 63, 94, 0.35)',
    },
  };

  return { ...base, ...variants[variant] };
}
