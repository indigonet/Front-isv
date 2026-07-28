/**
 * Utilities for compressing whiteboard JSON data, generating short project IDs (< 60 chars),
 * and fetching shared projects.
 */

// Helper to generate a random 7-character alphanumeric short ID
export function generateShortId(length = 7) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Creates a shareable project link under 60 characters total.
 * Stores payload in localStorage for local/same-origin access and uploads to dpaste cloud paste API for cross-device sharing.
 * @param {Array} elements - Whiteboard elements array
 * @returns {Promise<{ shortUrl: string, id: string, isCloudSaved: boolean }>}
 */
export async function createShortProject(elements) {
  const jsonStr = JSON.stringify(elements);
  const id = generateShortId(7);
  const baseUrl = window.location.origin + window.location.pathname;

  // 1. Save to local storage for instant same-browser / same-origin access
  try {
    localStorage.setItem(`isv_share_${id}`, jsonStr);
  } catch (err) {
    console.warn("Could not save shared project to localStorage:", err);
  }

  let isCloudSaved = false;

  // 2. Upload to Cloud Paste API (dpaste.org) for cross-device sharing
  try {
    const formData = new URLSearchParams();
    formData.append("content", jsonStr);
    formData.append("format", "json");
    formData.append("expiry_days", "365");

    const res = await fetch("https://dpaste.org/api/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    if (res.ok) {
      const data = await res.json();
      // dpaste returns key (e.g. "AbCdE") or full url
      const cloudKey = data.key || (data.url ? data.url.split("/").pop() : null);
      if (cloudKey) {
        // Save mapping locally as well
        localStorage.setItem(`isv_share_${cloudKey}`, jsonStr);
        const finalUrl = `${baseUrl}#id=${cloudKey}`;
        return {
          shortUrl: finalUrl,
          id: cloudKey,
          isCloudSaved: true,
        };
      }
    }
  } catch (err) {
    console.warn("Cloud storage upload to dpaste failed, using local short ID:", err);
  }

  // 3. Fallback: Try paste.rs if dpaste was unreachable
  try {
    const res = await fetch("https://paste.rs/web", {
      method: "POST",
      body: jsonStr,
    });
    if (res.ok) {
      const pasteUrl = (await res.text()).trim();
      const pasteId = pasteUrl.split("/").pop();
      if (pasteId) {
        localStorage.setItem(`isv_share_${pasteId}`, jsonStr);
        const finalUrl = `${baseUrl}#id=${pasteId}`;
        return {
          shortUrl: finalUrl,
          id: pasteId,
          isCloudSaved: true,
        };
      }
    }
  } catch (err) {
    console.warn("Fallback cloud storage (paste.rs) failed:", err);
  }

  // Return local short URL (guaranteed ~40-45 chars)
  const localShortUrl = `${baseUrl}#id=${id}`;
  return {
    shortUrl: localShortUrl,
    id: id,
    isCloudSaved: isCloudSaved,
  };
}

/**
 * Fetches diagram elements by short ID from localStorage or cloud paste services.
 * @param {string} id - The 6-8 character short ID
 * @returns {Promise<Array|null>}
 */
export async function fetchProjectById(id) {
  if (!id) return null;

  // 1. Try LocalStorage first (instant)
  try {
    const localData = localStorage.getItem(`isv_share_${id}`);
    if (localData) {
      const parsed = JSON.parse(localData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to read project from localStorage:", err);
  }

  // 2. Try dpaste cloud service
  try {
    const res = await fetch(`https://dpaste.org/${id}/raw`);
    if (res.ok) {
      const text = await res.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Cache locally for faster re-open
        try {
          localStorage.setItem(`isv_share_${id}`, text);
        } catch (e) {}
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to fetch project from dpaste.org:", err);
  }

  // 3. Try paste.rs cloud service
  try {
    const res = await fetch(`https://paste.rs/${id}`);
    if (res.ok) {
      const text = await res.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        try {
          localStorage.setItem(`isv_share_${id}`, text);
        } catch (e) {}
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to fetch project from paste.rs:", err);
  }

  return null;
}

/**
 * Compresses a JSON string using Gzip (CompressionStream) if available, returning base64 string with 'gz:' prefix.
 * @param {string} str - Raw JSON string
 * @returns {Promise<string>}
 */
export async function compressData(str) {
  try {
    if (typeof CompressionStream !== "undefined") {
      const stream = new Blob([str]).stream();
      const compressedStream = stream.pipeThrough(new CompressionStream("gzip"));
      const chunks = [];
      const reader = compressedStream.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      const blob = new Blob(chunks);
      const buffer = await blob.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return "gz:" + btoa(binary);
    }
  } catch (err) {
    console.warn("Gzip compression failed:", err);
  }
  return btoa(unescape(encodeURIComponent(str)));
}

/**
 * Decompresses encoded string (handles both 'gz:' Gzip compressed data and legacy btoa strings).
 * @param {string} encodedStr
 * @returns {Promise<string>}
 */
export async function decompressData(encodedStr) {
  if (!encodedStr) return "";

  if (encodedStr.startsWith("gz:")) {
    try {
      const rawBase64 = encodedStr.slice(3);
      const binary = atob(rawBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const stream = new Blob([bytes]);
      const decompressedStream = stream.stream().pipeThrough(new DecompressionStream("gzip"));
      const response = new Response(decompressedStream);
      return await response.text();
    } catch (err) {
      console.error("Gzip decompression error:", err);
    }
  }

  // Fallback / legacy decoding
  try {
    return decodeURIComponent(escape(atob(encodedStr)));
  } catch (err) {
    console.error("Legacy base64 decoding error:", err);
    return "";
  }
}
