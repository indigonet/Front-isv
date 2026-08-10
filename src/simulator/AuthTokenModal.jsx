import React, { useEffect, useRef } from 'react';
import { Braces, ShieldCheck, UserCheck, Key, Eye, EyeOff, Lock, X } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Dialog, DialogTitle, DialogContent, Box, Typography, Select, MenuItem, FormControl, OutlinedInput, InputAdornment, IconButton, Button, CircularProgress } from '@mui/material';
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
  const prevAccessToken = useRef(accessToken);
  const recaptchaRef = useRef();

  // Auto-close on successful token fetch
  useEffect(() => {
    if (!prevAccessToken.current && accessToken && isOpen) {
      onClose();
    }
    prevAccessToken.current = accessToken;
  }, [accessToken, isOpen, onClose]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
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
      {/* Title Header */}
      <DialogTitle sx={{ px: { xs: 2.5, sm: 3.5 }, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 1, sm: 2 } }}>
          <Typography sx={{ fontWeight: 950, textTransform: 'uppercase', fontSize: { xs: '1rem', sm: '1.2rem' }, letterSpacing: '-0.01em', color: 'text.primary' }}>
            {t('tokenConfigBtn')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 0.5, borderRadius: '8px', border: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
            <img 
              src={`https://flagcdn.com/w20/${country}.png`} 
              alt={country} 
              style={{ width: '16px', height: 'auto', borderRadius: '2px', display: 'block' }}
            />
            <Typography sx={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: country === 'cl' ? '#6366f1' : '#0ea5e9' }}>
              {country === 'cl' ? 'Chile' : 'Argentina'}
            </Typography>
          </Box>
        </Box>
        <IconButton 
          onClick={onClose} 
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
          aria-label={t('token.closeModal')}
        >
          <X size={18} />
        </IconButton>
      </DialogTitle>

      {/* Content Body */}
      <DialogContent sx={{ px: { xs: 2.5, sm: 3.5 }, py: 2.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' }, gap: 3 }}>
          {/* Column 1: Credentials */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Environment selection */}
            <FormControl fullWidth variant="outlined">
              <Typography sx={{ fontSize: '10px', fontWeight: 800, mb: 0.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {t('simEnv')}
              </Typography>
              <Select
                value={env === 'prod' ? 'uat' : env}
                onChange={(e) => {
                  const newEnv = e.target.value;
                  if (accessToken && !window.confirm(t('confirmClearToken'))) return;
                  if (accessToken) clearToken();
                  onEnvChange(newEnv);
                }}
                size="small"
                sx={{ 
                  borderRadius: '12px', 
                  bgcolor: 'background.paper',
                  fontWeight: 800,
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: env === 'prod' ? 'error.main' : env === 'uat' ? 'primary.main' : 'success.main'
                }}
              >
                <MenuItem value="dev" sx={{ fontSize: '13px', fontWeight: 700 }}>{t('token.envDev')}</MenuItem>
                <MenuItem value="uat" sx={{ fontSize: '13px', fontWeight: 700 }}>{t('token.envUat')}</MenuItem>
              </Select>
            </FormControl>

            {/* Client ID */}
            <FormControl fullWidth>
              <Typography sx={{ fontSize: '10px', fontWeight: 800, mb: 0.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {t('clientIdLabel')}
              </Typography>
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-background border border-accent/20 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-all shadow-inner group">
                <UserCheck size={16} className="text-text-secondary/50 group-focus-within:text-accent transition-colors shrink-0" />
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="Client ID"
                  style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                  className="no-focus-glow w-full bg-transparent border-none outline-none ring-0 focus:outline-none focus:ring-0 focus:border-none shadow-none focus:shadow-none font-mono text-xs sm:text-sm font-semibold text-text-primary placeholder:text-text-secondary/30"
                />
              </div>
            </FormControl>

            {/* Client Secret */}
            <FormControl fullWidth>
              <Typography sx={{ fontSize: '10px', fontWeight: 800, mb: 0.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {t('clientSecretLabel')}
              </Typography>
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-background border border-accent/20 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-all shadow-inner group">
                <Key size={16} className="text-text-secondary/50 group-focus-within:text-accent transition-colors shrink-0" />
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder="••••••••"
                  style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                  className="no-focus-glow w-full bg-transparent border-none outline-none ring-0 focus:outline-none focus:ring-0 focus:border-none shadow-none focus:shadow-none font-mono text-xs sm:text-sm font-semibold text-text-primary placeholder:text-text-secondary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="btn-reset p-1 text-text-secondary/40 hover:text-accent transition-colors cursor-pointer shrink-0"
                >
                  {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </FormControl>

            {/* Google ReCAPTCHA Invisible */}
            <ReCAPTCHA
              ref={recaptchaRef}
              size="invisible"
              sitekey={(import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI").trim()}
            />

            {/* Get token button */}
            <Button
              variant="contained"
              disabled={fetching || !clientId?.trim() || !clientSecret?.trim()}
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
              sx={{
                py: 1.25,
                borderRadius: '12px',
                fontWeight: 900,
                fontSize: '0.85rem',
                textTransform: 'none',
                mt: 0.5,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: (theme) => `0 8px 20px -4px ${theme.palette.mode === 'dark' ? 'rgba(99,102,241,0.4)' : 'rgba(79,70,229,0.3)'}`,
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                  : 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                color: '#ffffff',
                '&:hover': {
                  filter: 'brightness(1.15)',
                  boxShadow: (theme) => `0 12px 24px -4px ${theme.palette.mode === 'dark' ? 'rgba(99,102,241,0.5)' : 'rgba(79,70,229,0.45)'}`,
                },
                '&:active': {
                  transform: 'scale(0.98)',
                },
                '&.Mui-disabled': {
                  background: (theme) => fetching
                    ? (theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)')
                    : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'),
                  color: (theme) => fetching
                    ? '#ffffff'
                    : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'),
                  opacity: fetching ? 0.8 : 1,
                  boxShadow: 'none',
                }
              }}
            >
              {fetching ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CircularProgress size={16} color="inherit" />
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ffffff' }}>{t('fetchingToken')}</Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Braces size={16} />
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ffffff' }}>{t('fetchTokenBtn')}</Typography>
                </Box>
              )}
            </Button>
          </Box>

          {/* Column 2: Token Status */}
          <Box
            sx={{
              borderRadius: '16px',
              p: 2.5,
              border: '1px solid',
              borderColor: accessToken ? 'rgba(16,185,129,0.2)' : 'rgba(14,165,233,0.2)',
              bgcolor: accessToken ? 'rgba(16,185,129,0.04)' : 'rgba(14,165,233,0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              minHeight: { xs: '160px', md: 'auto' },
              gap: 2
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {/* Status indicator */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: accessToken ? '#10b981' : 'text.disabled',
                    boxShadow: accessToken ? '0 0 10px rgba(16,185,129,0.6)' : 'none',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(0.95)', opacity: 0.5 },
                      '50%': { transform: 'scale(1.05)', opacity: 1 },
                      '100%': { transform: 'scale(0.95)', opacity: 0.5 }
                    },
                    animation: accessToken ? 'pulse 2s infinite ease-in-out' : 'none'
                  }}
                />
                <Typography
                  sx={{
                    fontSize: '11px',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: accessToken ? '#10b981' : 'text.secondary',
                    opacity: accessToken ? 1 : 0.6
                  }}
                >
                  {accessToken ? t('tokenActive') : t('tokenMissing')}
                </Typography>
              </Box>

              {/* Token value or empty state */}
              {accessToken ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box
                    className="professional-scrollbar"
                    sx={{
                      p: 2,
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: '12px',
                      wordBreak: 'break-all',
                      fontFamily: 'monospace',
                      fontSize: '10px',
                      color: '#10b981',
                      fontWeight: 700,
                      maxHeight: '160px',
                      overflowY: 'scroll'
                    }}
                  >
                    {accessToken}
                  </Box>
                  <Typography sx={{ fontSize: '10px', color: 'text.secondary', fontWeight: 500, pl: 0.5 }}>
                    {t('tokenInfo')}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 2.5, gap: 1.5, opacity: 0.5 }}>
                  <ShieldCheck size={32} style={{ color: 'text.secondary', margin: '0 auto' }} />
                  <Typography sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', color: 'text.secondary' }}>
                    {t('tokenGuide')}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Clear button */}
            {accessToken && (
              <Button
                onClick={clearToken}
                variant="outlined"
                color="error"
                fullWidth
                sx={{
                  borderRadius: '10px',
                  py: 1,
                  fontWeight: 900,
                  fontSize: '9px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  borderWidth: '1.5px',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderWidth: '1.5px',
                    bgcolor: 'rgba(239, 68, 68, 0.08)'
                  },
                  '&:active': {
                    transform: 'scale(0.98)'
                  }
                }}
              >
                {t('simClearBtn')}
              </Button>
            )}
          </Box>
        </Box>

        {/* Privacy Note */}
        <Box sx={{ pt: 2, mt: 2.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5, opacity: 0.7 }}>
          <Box sx={{ p: 0.75, bgcolor: 'rgba(16,185,129,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', shrink: 0 }}>
            <Lock size={15} style={{ color: '#10b981' }} />
          </Box>
          <Typography sx={{ fontSize: '10.5px', color: 'text.secondary', fontWeight: 500 }}>
            {t('token.privacyNote')}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
