import { useState, useEffect } from 'react';
import { API_BASE, DEFAULT_CREDENTIALS } from './simulator.constants';

/**
 * Custom hook that encapsulates all auth-token logic for the simulator.
 * Returns token state + actions, keeping SimulatorView lean.
 */
export function useSimulatorAuth({ env, onLog = () => {} }) {
  const [clientId,     setClientId]     = useState(() => localStorage.getItem('isv_auth_clientId')     || DEFAULT_CREDENTIALS.clientId);
  const [clientSecret, setClientSecret] = useState(() => localStorage.getItem('isv_auth_clientSecret') || DEFAULT_CREDENTIALS.clientSecret);
  const [accessToken,  setAccessToken]  = useState(() => localStorage.getItem('isv_auth_token')        || '');
  const [showSecret,   setShowSecret]   = useState(false);
  const [fetching,     setFetching]     = useState(false);

  // Auto-save credentials & token (Token only if explicitly needed, but for security we'll skip auto-save now)
  useEffect(() => { localStorage.setItem('isv_auth_clientId',     clientId); },     [clientId]);
  useEffect(() => { localStorage.setItem('isv_auth_clientSecret', clientSecret); }, [clientSecret]);
  useEffect(() => {
    if (accessToken) {
      localStorage.setItem('isv_auth_token', accessToken);
    } else {
      localStorage.removeItem('isv_auth_token');
    }
  }, [accessToken]);

  const clearToken = () => {
    setAccessToken('');
    localStorage.removeItem('isv_auth_token');
    onLog('Token borrado', 'info');
  };

  const fetchToken = async () => {
    if (!clientId || !clientSecret) {
      onLog('Client ID y Secret son requeridos', 'error');
      return;
    }

    setFetching(true);
    onLog('Obteniendo Token de Acceso...', 'info');

    try {
      const tokenUrl = API_BASE[env] + 'auth';

      const formData = new URLSearchParams();
      formData.append('ClientId',     clientId);
      formData.append('ClientSecret', clientSecret);

      const res = await fetch(tokenUrl, {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    formData.toString(),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      // API returns: { code, status, data: { token, expires_in } }
      const tokenValue = data.data?.token || data.token || data.access_token;

      if (tokenValue) {
        setAccessToken(tokenValue);
        onLog(`✅ Token obtenido (expira en ${data.data?.expires_in ?? '?'}s)`, 'success');
      } else {
        throw new Error('No token in response: ' + JSON.stringify(data));
      }
    } catch (e) {
      onLog(`Error al obtener el token: ${e.message}`, 'error');
    } finally {
      setFetching(false);
    }
  };

  return {
    // state
    clientId, setClientId,
    clientSecret, setClientSecret,
    accessToken,
    showSecret, setShowSecret,
    fetching, setFetching,
    // actions
    fetchToken,
    clearToken,
  };
}
