export const API_BASE_URL = import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== ''
  ? import.meta.env.VITE_API_URL 
  : (import.meta.env.DEV ? 'http://localhost:8000' : '');


const DEFAULT_TIMEOUT_MS = 60000;
const RETRY_DELAY_MS = 500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function friendlyError(error, fallback) {
  if (error?.name === 'AbortError') {
    return 'Request timed out. Please try again.';
  }
  if (error?.message) {
    return error.message;
  }
  return fallback || 'MovieMind AI could not complete the request. Please try again.';
}

async function parseErrorResponse(response) {
  try {
    const data = await response.json();
    return data.detail || data.error || response.statusText;
  } catch {
    return response.statusText || `HTTP ${response.status}`;
  }
}

export async function streamEndpoint(path, payload, onChunk, options = {}) {
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
  const fallbackError = options.fallbackError;
  let lastError;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    let receivedAnyChunk = false;

    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(await parseErrorResponse(response));
      }

      if (!response.body) {
        throw new Error('The server returned an empty response.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        if (chunk) {
          receivedAnyChunk = true;
          fullText += chunk;
          onChunk(fullText);
        }
      }

      const finalText = fullText + decoder.decode();
      if (finalText !== fullText) {
        onChunk(finalText);
      }

      if (!finalText.trim()) {
        throw new Error('The server returned an empty response.');
      }

      return finalText;
    } catch (error) {
      lastError = error;
      if (receivedAnyChunk || attempt === 1 || error?.name === 'AbortError') {
        throw new Error(friendlyError(error, fallbackError));
      }
      await sleep(RETRY_DELAY_MS);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error(friendlyError(lastError, fallbackError));
}

export async function fetchJson(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || 15000);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(await parseErrorResponse(response));
    }
    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}
