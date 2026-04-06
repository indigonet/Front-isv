import { useState, useEffect } from 'react';
import { CONFIG } from './simulator.constants';

/**
 * Custom hook that encapsulates all auth-token logic for the simulator.
 * Returns token state + actions, keeping SimulatorView lean.
 */
export function useSimulatorAuth({ env, country = 'cl', onLog = () => {} }) {
  const currentConfig = CONFIG[country];
  const { DEFAULT_CREDENTIALS, API_BASE } = currentConfig;

  const [clientId,     setClientId]     = useState(() => localStorage.getItem(`isv_auth_clientId_${country}`)     || DEFAULT_CREDENTIALS.clientId);
  const [clientSecret, setClientSecret] = useState(() => localStorage.getItem(`isv_auth_clientSecret_${country}`) || DEFAULT_CREDENTIALS.clientSecret);
  const [accessToken,  setAccessToken]  = useState(() => localStorage.getItem(`isv_auth_token_${country}`)        || '');
  const [showSecret,   setShowSecret]   = useState(false);
  const [fetching,     setFetching]     = useState(false);
  const [useProxy,     setUseProxy]     = useState(() => localStorage.getItem('isv_auth_useProxy') === 'true');

  // When country changes, load the country-specific stored credentials
  useEffect(() => {
    setClientId(localStorage.getItem(`isv_auth_clientId_${country}`) || DEFAULT_CREDENTIALS.clientId);
    setClientSecret(localStorage.getItem(`isv_auth_clientSecret_${country}`) || DEFAULT_CREDENTIALS.clientSecret);
    setAccessToken(localStorage.getItem(`isv_auth_token_${country}`) || '');
  }, [country, DEFAULT_CREDENTIALS.clientId, DEFAULT_CREDENTIALS.clientSecret]);

  // Auto-save credentials & token (Token only if explicitly needed, but for security we'll skip auto-save now)
  useEffect(() => { localStorage.setItem(`isv_auth_clientId_${country}`,     clientId); },     [clientId, country]);
  useEffect(() => { localStorage.setItem(`isv_auth_clientSecret_${country}`, clientSecret); }, [clientSecret, country]);
  useEffect(() => { localStorage.setItem('isv_auth_useProxy', useProxy); }, [useProxy]);
  useEffect(() => {
    if (accessToken) {
      localStorage.setItem(`isv_auth_token_${country}`, accessToken);
    } else {
      localStorage.removeItem(`isv_auth_token_${country}`);
    }
  }, [accessToken, country]);

  const clearToken = () => {
    setAccessToken('');
    localStorage.removeItem(`isv_auth_token_${country}`);
    onLog('Token borrado', 'info');
  };

  const fetchToken = async () => {
    if (!clientId || !clientSecret) {
      onLog('Client ID y Secret son requeridos', 'error');
      return;
    }

    const { AUTH_CONFIG } = currentConfig;
    const { endpoint, contentType, payloadKeys } = AUTH_CONFIG;

    setFetching(true);
    onLog(`Obteniendo Token de Acceso (${country.toUpperCase()})...`, 'info');

    try {
      let tokenUrl = API_BASE[env] + (endpoint || 'auth');
      
      // Apply CORS Proxy if enabled
      if (useProxy) {
        tokenUrl = `https://cors-anywhere.herokuapp.com/${tokenUrl}`;
      }
      
      let body;
      let headers = {
        'env': env,
        'country': country,
        'app': 'posintegrado',
        ...AUTH_CONFIG.headers // Merges other headers from config if any
      };

      if (contentType === 'json') {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({
          [payloadKeys.clientId]: clientId.trim(),
          [payloadKeys.clientSecret]: clientSecret.trim()
        });
      } else {
        // Default to form-urlencoded
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        const formData = new URLSearchParams();
        formData.append(payloadKeys.clientId, clientId.trim());
        formData.append(payloadKeys.clientSecret, clientSecret.trim());
        body = formData.toString();
      }

      onLog(`→ POST ${tokenUrl}`, 'info');

      const res = await fetch(tokenUrl, {
        method: 'POST',
        headers,
        body,
      });

      if (!res.ok) {
        let errorData = '';
        try {
          const ct = res.headers.get('content-type');
          errorData = ct?.includes('application/json') ? await res.json() : await res.text();
        } catch (e) {}
        throw new Error(`HTTP ${res.status}: ${typeof errorData === 'object' ? JSON.stringify(errorData) : errorData}`);
      }

      const data = await res.json();
      // API returns: { code, status, data: { token, expires_in } }
      const tokenValue = data.data?.token || data.token || data.access_token;

      if (tokenValue) {
        setAccessToken(tokenValue);
        onLog(`✅ Token obtenido (expira en ${data.data?.expires_in ?? '?'}s)`, 'success');
      } else {
        throw new Error('No se encontró el token en la respuesta: ' + JSON.stringify(data));
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
    useProxy, setUseProxy,
    // actions
    fetchToken,
    clearToken,
  };
}
