// Cloudflare Pages Function Proxy to bypass CORS issues
// This runs on the Cloudflare server side where CORS is not enforced.

const BASE_URLS = {
  'cl': {
    'dev':  'https://api-dev-getnet-posintegrado.ione.cl/api/postxs/',
    'uat':  'https://api-uat-getnet-posintegrado.ione.cl/api/postxs/',
    'prod': 'https://api-getnet-posintegrado.ione.cl/api/postxs/'
  },
  'ar': {
    'dev':  'https://api-dev.ione-tech.com/api/postxs/',
    'uat':  'https://api-uat.ione-tech.com/api/postxs/',
    'prod': 'https://api.ione-tech.com/api/postxs/'
  }
};

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // URL format expected: /api/{country}/{env}/{endpoint}
  // Example: /api/cl/uat/auth
  const segments = url.pathname.split('/').filter(Boolean); // ["api", "cl", "uat", "auth"]
  
  if (segments[0] !== 'api' || segments.length < 3) {
    return new Response('Invalid Proxy Path', { status: 400 });
  }
  
  const country = segments[1];
  const env     = segments[2];
  const endpoint = segments.slice(3).join('/');

  const base = BASE_URLS[country]?.[env];
  if (!base) {
    return new Response('Environment Not Found', { status: 404 });
  }

  const targetUrl = base + endpoint;
  
  // Clone headers but remove origin-related ones that might conflict
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('origin');
  headers.delete('referer');

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: (request.method !== 'GET' && request.method !== 'HEAD') ? await request.arrayBuffer() : null,
      redirect: 'manual' 
    });

    // Create a new response with the API data but ALLOW our own domain
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    newHeaders.set('Access-Control-Allow-Headers', '*');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  } catch (err) {
    return new Response('Proxy Error: ' + err.message, { status: 500 });
  }
}
