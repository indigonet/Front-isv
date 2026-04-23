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

  // When country changes, load the country-specific stored credentials
  useEffect(() => {
    setClientId(localStorage.getItem(`isv_auth_clientId_${country}`) || DEFAULT_CREDENTIALS.clientId);
    setClientSecret(localStorage.getItem(`isv_auth_clientSecret_${country}`) || DEFAULT_CREDENTIALS.clientSecret);
    setAccessToken(localStorage.getItem(`isv_auth_token_${country}`) || '');
  }, [country, DEFAULT_CREDENTIALS.clientId, DEFAULT_CREDENTIALS.clientSecret]);

  // Auto-save credentials & token (Token only if explicitly needed, but for security we'll skip auto-save now)
  useEffect(() => { localStorage.setItem(`isv_auth_clientId_${country}`,     clientId); },     [clientId, country]);
  useEffect(() => { localStorage.setItem(`isv_auth_clientSecret_${country}`, clientSecret); }, [clientSecret, country]);
  useEffect(() => {
    if (accessToken) {
      localStorage.setItem(`isv_auth_token_${country}`, accessToken);
      // Save timestamp only if it doesn't exist yet (to avoid resetting expiration on every render)
      if (!localStorage.getItem(`isv_auth_token_timestamp_${country}`)) {
        localStorage.setItem(`isv_auth_token_timestamp_${country}`, Date.now().toString());
      }
    } else {
      localStorage.removeItem(`isv_auth_token_${country}`);
      localStorage.removeItem(`isv_auth_token_timestamp_${country}`);
    }
  }, [accessToken, country]);

  // Token Expiration Logic
  useEffect(() => {
    const checkExpiration = () => {
      const storedToken = localStorage.getItem(`isv_auth_token_${country}`);
      const storedTimestamp = localStorage.getItem(`isv_auth_token_timestamp_${country}`);

      if (storedToken && storedTimestamp) {
        const now = Date.now();
        const ageInMs = now - parseInt(storedTimestamp, 10);
        
        // PRODUCTION: 24 hours (24 * 60 * 60 * 1000)
        const EXPIRATION_TIME = 24 * 60 * 60 * 1000; 

        if (ageInMs > EXPIRATION_TIME) {
          console.log(`[Auth] Token for ${country} expired. Clearing...`);
          clearToken();
        }
      }
    };

    // Check immediately and then every 30 seconds
    checkExpiration();
    const interval = setInterval(checkExpiration, 30000);
    return () => clearInterval(interval);
  }, [country]);

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
      const tokenUrl = API_BASE[env] + (endpoint || 'auth');
      let fetchUrl = tokenUrl;
      
      // Transform REAL URL to internal Proxy URL silently for the fetch call (Ghost Proxy)
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

      const res = await fetch(fetchUrl, {
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
        // Explicitly set timestamp on new fetch
        localStorage.setItem(`isv_auth_token_timestamp_${country}`, Date.now().toString());
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
    // actions
    fetchToken,
    clearToken,
  };
}
