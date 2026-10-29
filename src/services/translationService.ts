import { SupportedLanguage, CORE_DICTIONARY } from '@/i18n/languages';

const TRANSLATION_CACHE_KEY = 'translation_cache';

// In-memory cache for O(1) sync lookups: key = `${sourceLang}:${targetLang}:${sourceText}`
const memoryCache = new Map<string, string>();
let cacheHydrated = false;

/**
 * Hydrate cache from localStorage safely (browser only)
 */
function hydrateCache(): void {
  if (cacheHydrated || typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(TRANSLATION_CACHE_KEY);
    if (raw) {
      const parsed: Record<string, string> = JSON.parse(raw);
      for (const [key, val] of Object.entries(parsed)) {
        if (typeof val === 'string') {
          memoryCache.set(key, val);
        }
      }
    }
    cacheHydrated = true;
  } catch (err) {
    console.warn('[translationService] Failed to parse translation cache:', err);
    cacheHydrated = true;
  }
}

/**
 * Persist cache entry to localStorage safely
 */
function persistEntry(key: string, val: string): void {
  if (typeof window === 'undefined') return;
  try {
    memoryCache.set(key, val);
    const raw = localStorage.getItem(TRANSLATION_CACHE_KEY);
    const current: Record<string, string> = raw ? JSON.parse(raw) : {};
    current[key] = val;
    // Cap cache at 2000 entries to avoid exceeding quota
    const keys = Object.keys(current);
    if (keys.length > 2000) {
      delete current[keys[0]];
    }
    localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(current));
  } catch (err) {
    console.warn('[translationService] Failed to write to localStorage:', err);
  }
}

/**
 * Search static CORE_DICTIONARY for matching text if available
 */
function findInDictionary(text: string, targetLang: SupportedLanguage, sourceLang: SupportedLanguage): string | null {
  const sourceDict = CORE_DICTIONARY[sourceLang];
  const targetDict = CORE_DICTIONARY[targetLang];
  if (!sourceDict || !targetDict) return null;

  const normalized = text.trim().toLowerCase();

  // 1. Direct key match
  if (targetDict[text]) return targetDict[text];

  // 2. Direct value match
  for (const [k, v] of Object.entries(sourceDict)) {
    if (v.trim().toLowerCase() === normalized) {
      if (targetDict[k]) return targetDict[k];
    }
  }

  return null;
}

/**
 * Fetch from Google Translate GTX API
 */
async function fetchGoogleGTX(text: string, sourceLang: string, targetLang: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(
    sourceLang
  )}&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Google GTX returned status ${response.status}`);
  }

  const data = await response.json();
  if (Array.isArray(data) && Array.isArray(data[0])) {
    const combined = data[0]
      .map((item: unknown) => (Array.isArray(item) && typeof item[0] === 'string' ? item[0] : ''))
      .join('');
    if (combined && combined.trim().length > 0) {
      return combined;
    }
  }

  throw new Error('Unexpected Google GTX response format');
}

/**
 * Fetch from MyMemory API as fallback
 */
async function fetchMyMemory(text: string, sourceLang: string, targetLang: string): Promise<string> {
  const langpair = `${sourceLang}|${targetLang}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(
    langpair
  )}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`MyMemory returned status ${response.status}`);
  }

  const data = await response.json();
  const translated = data?.responseData?.translatedText;
  if (typeof translated === 'string' && translated.trim().length > 0 && !translated.startsWith('MYMEMORY WARNING:')) {
    return translated;
  }

  throw new Error('Invalid MyMemory response');
}

/**
 * Central translation helper: translateText
 * Uses 4-tier pipeline:
 * 1. Target === Source check (instant)
 * 2. In-memory / localStorage cache (instant)
 * 3. Static CORE_DICTIONARY lookup (instant, zero-network)
 * 4. Free translation APIs (Google GTX -> MyMemory fallback)
 * 5. Fallback Graceful: returns original text without throwing
 */
export async function translateText(
  text: string,
  targetLang: SupportedLanguage,
  sourceLang: SupportedLanguage = 'en'
): Promise<string> {
  if (!text || text.trim() === '') return text;
  if (targetLang === sourceLang) return text;

  hydrateCache();

  const cacheKey = `${sourceLang}:${targetLang}:${text.trim()}`;

  // 1. Check in-memory cache
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey)!;
  }

  // 2. Check static dictionary
  const dictMatch = findInDictionary(text, targetLang, sourceLang);
  if (dictMatch) {
    persistEntry(cacheKey, dictMatch);
    return dictMatch;
  }

  // 3. Network call: Google GTX -> MyMemory
  try {
    const result = await fetchGoogleGTX(text, sourceLang, targetLang);
    persistEntry(cacheKey, result);
    return result;
  } catch (gtxErr) {
    // Attempt fallback to MyMemory
    try {
      const fallbackResult = await fetchMyMemory(text, sourceLang, targetLang);
      persistEntry(cacheKey, fallbackResult);
      return fallbackResult;
    } catch (myMemoryErr) {
      // Graceful offline fallback: return original text
      console.warn(`[translationService] Both APIs failed for "${text}". Falling back to original.`, {
        gtxErr,
        myMemoryErr
      });
      return text;
    }
  }
}

/**
 * Translate multiple texts in parallel with deduplication
 */
export async function translateBatch(
  texts: string[],
  targetLang: SupportedLanguage,
  sourceLang: SupportedLanguage = 'en'
): Promise<Record<string, string>> {
  if (targetLang === sourceLang) {
    const identity: Record<string, string> = {};
    for (const t of texts) identity[t] = t;
    return identity;
  }

  const unique = Array.from(new Set(texts.filter((t) => t && t.trim() !== '')));
  const results: Record<string, string> = {};

  await Promise.all(
    unique.map(async (str) => {
      try {
        const translated = await translateText(str, targetLang, sourceLang);
        results[str] = translated;
      } catch {
        results[str] = str;
      }
    })
  );

  return results;
}

/**
 * Clear cached translations
 */
export function clearTranslationCache(): void {
  memoryCache.clear();
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(TRANSLATION_CACHE_KEY);
    } catch {}
  }
}

/**
 * Get cache statistics
 */
export function getTranslationCacheStats(): { count: number } {
  hydrateCache();
  return { count: memoryCache.size };
}

