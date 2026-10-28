/**
 * TripSwipe IndexedDB Local Image & Smart Gear Cache
 *
 * Provides persistent local client-side storage for:
 * 1. Product image blobs (downloaded once, stored in IndexedDB, served instantly via object URLs)
 * 2. Gemini AI Smart Shop destination curation data (avoids redundant network API calls)
 * 3. AI search results and generated product images
 */

const DB_NAME = 'TripSwipeGearCacheDB';
const DB_VERSION = 1;
const STORE_IMAGES = 'gear_images';
const STORE_SHOP_DATA = 'gear_shop_cache';
const STORE_AI_SEARCH = 'gear_search_cache';

interface CachedImageRecord {
  url: string;
  blob: Blob;
  mimeType: string;
  cachedAt: number;
  sizeBytes: number;
}

interface CachedShopRecord {
  cacheKey: string;
  data: any;
  cachedAt: number;
}

interface CachedSearchRecord {
  queryKey: string;
  products: any[];
  summary: string | null;
  cachedAt: number;
}

// In-memory memory-layer for synchronous 0ms hits during session
const memoryBlobUrlMap = new Map<string, string>();
let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Returns in-memory cached object URL synchronously if already loaded this session (0ms).
 */
export function getMemoryCachedUrl(url: string): string | null {
  if (!url) return null;
  return memoryBlobUrlMap.get(url) || null;
}

/**
 * Initializes and returns the IndexedDB database instance.
 * Gracefully handles private browsing / restricted iframe contexts.
 */
export function openGearDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB is not supported in this environment'));
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Object store for binary image blobs
        if (!db.objectStoreNames.contains(STORE_IMAGES)) {
          db.createObjectStore(STORE_IMAGES, { keyPath: 'url' });
        }

        // Object store for Gemini Smart Shop recommendation payloads
        if (!db.objectStoreNames.contains(STORE_SHOP_DATA)) {
          db.createObjectStore(STORE_SHOP_DATA, { keyPath: 'cacheKey' });
        }

        // Object store for AI search queries & items
        if (!db.objectStoreNames.contains(STORE_AI_SEARCH)) {
          db.createObjectStore(STORE_AI_SEARCH, { keyPath: 'queryKey' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.warn('Failed to open TripSwipe IndexedDB:', request.error);
        reject(request.error);
      };
    } catch (err) {
      console.warn('IndexedDB initialization error:', err);
      reject(err);
    }
  });

  return dbPromise;
}

/**
 * Retrieves a cached image Blob from IndexedDB.
 */
export async function getCachedImageBlob(url: string): Promise<Blob | null> {
  if (!url) return null;
  try {
    const db = await openGearDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_IMAGES, 'readonly');
      const store = tx.objectStore(STORE_IMAGES);
      const req = store.get(url);

      req.onsuccess = () => {
        const record = req.result as CachedImageRecord | undefined;
        if (record && record.blob) {
          resolve(record.blob);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => {
        resolve(null);
      };
    });
  } catch {
    return null;
  }
}

/**
 * Stores an image Blob in IndexedDB.
 */
export async function storeImageBlob(url: string, blob: Blob): Promise<void> {
  if (!url || !blob) return;
  try {
    const db = await openGearDB();
    const record: CachedImageRecord = {
      url,
      blob,
      mimeType: blob.type || 'image/jpeg',
      cachedAt: Date.now(),
      sizeBytes: blob.size,
    };

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_IMAGES, 'readwrite');
      const store = tx.objectStore(STORE_IMAGES);
      const req = store.put(record);

      req.onsuccess = () => {
        // Create an ObjectURL and keep in memory for synchronous re-use
        try {
          const objUrl = URL.createObjectURL(blob);
          memoryBlobUrlMap.set(url, objUrl);
        } catch {
          // ignore object url creation failure
        }
        resolve();
      };

      req.onerror = () => {
        resolve(); // non-fatal
      };
    });
  } catch (err) {
    console.warn('Could not store image in IndexedDB:', err);
  }
}

/**
 * Resolves an image URL through IndexedDB:
 * 1. Returns existing in-memory object URL if already created (0ms).
 * 2. Checks IndexedDB for existing cached blob.
 * 3. If not cached, fetches blob, persists into IndexedDB, and returns object URL.
 */
export async function resolveAndCacheImageUrl(url: string): Promise<string> {
  if (!url) return '';

  // Synchronous memory hit
  if (memoryBlobUrlMap.has(url)) {
    return memoryBlobUrlMap.get(url)!;
  }

  // Already a blob or data URL
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }

  try {
    // Check IndexedDB
    const cachedBlob = await getCachedImageBlob(url);
    if (cachedBlob) {
      const objUrl = URL.createObjectURL(cachedBlob);
      memoryBlobUrlMap.set(url, objUrl);
      return objUrl;
    }

    // Fetch and store in background
    const response = await fetch(url, {
      cache: 'force-cache',
    });

    if (response.ok) {
      const blob = await response.blob();
      await storeImageBlob(url, blob);
      const objUrl = URL.createObjectURL(blob);
      memoryBlobUrlMap.set(url, objUrl);
      return objUrl;
    }
  } catch (e) {
    // If fetching as blob fails (e.g. cross-origin without CORS), fallback to original URL
  }

  return url;
}

/**
 * Pre-caches an array of image URLs in the background during idle time.
 */
export function precacheImageUrls(urls: string[]): void {
  if (typeof window === 'undefined' || !urls || urls.length === 0) return;

  const runPrecache = async () => {
    for (const url of urls) {
      if (!url || memoryBlobUrlMap.has(url)) continue;
      try {
        await resolveAndCacheImageUrl(url);
      } catch {
        // continue precaching rest
      }
    }
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => runPrecache(), { timeout: 3000 });
  } else {
    setTimeout(runPrecache, 300);
  }
}

/**
 * Stores AI Smart Shop recommendation data in IndexedDB.
 */
export async function saveAiShopDataToIDB(cacheKey: string, data: any): Promise<void> {
  if (!cacheKey || !data) return;
  try {
    const db = await openGearDB();
    const record: CachedShopRecord = {
      cacheKey,
      data,
      cachedAt: Date.now(),
    };

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_SHOP_DATA, 'readwrite');
      const store = tx.objectStore(STORE_SHOP_DATA);
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch (e) {
    console.warn('saveAiShopDataToIDB error:', e);
  }
}

/**
 * Loads all cached AI Smart Shop recommendations from IndexedDB.
 */
export async function loadAllAiShopDataFromIDB(): Promise<Record<string, any>> {
  try {
    const db = await openGearDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_SHOP_DATA, 'readonly');
      const store = tx.objectStore(STORE_SHOP_DATA);
      const req = store.getAll();

      req.onsuccess = () => {
        const records = (req.result as CachedShopRecord[]) || [];
        const result: Record<string, any> = {};
        for (const rec of records) {
          if (rec.cacheKey && rec.data) {
            result[rec.cacheKey] = rec.data;
          }
        }
        resolve(result);
      };

      req.onerror = () => {
        resolve({});
      };
    });
  } catch {
    return {};
  }
}

/**
 * Saves AI Search query results into IndexedDB.
 */
export async function saveAiSearchToIDB(
  query: string,
  products: any[],
  summary: string | null
): Promise<void> {
  if (!query) return;
  try {
    const db = await openGearDB();
    const record: CachedSearchRecord = {
      queryKey: query.toLowerCase().trim(),
      products,
      summary,
      cachedAt: Date.now(),
    };

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_AI_SEARCH, 'readwrite');
      const store = tx.objectStore(STORE_AI_SEARCH);
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch (e) {
    console.warn('saveAiSearchToIDB error:', e);
  }
}

/**
 * Retrieves AI Search query results from IndexedDB.
 */
export async function loadAiSearchFromIDB(
  query: string
): Promise<{ products: any[]; summary: string | null } | null> {
  if (!query) return null;
  try {
    const db = await openGearDB();
    const cleanKey = query.toLowerCase().trim();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_AI_SEARCH, 'readonly');
      const store = tx.objectStore(STORE_AI_SEARCH);
      const req = store.get(cleanKey);

      req.onsuccess = () => {
        const record = req.result as CachedSearchRecord | undefined;
        if (record && record.products) {
          resolve({ products: record.products, summary: record.summary });
        } else {
          resolve(null);
        }
      };

      req.onerror = () => {
        resolve(null);
      };
    });
  } catch {
    return null;
  }
}

/**
 * Retrieves storage metrics for user transparency.
 */
export async function getGearCacheStats(): Promise<{
  imageCount: number;
  shopCount: number;
  totalBytes: number;
}> {
  try {
    const db = await openGearDB();
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_IMAGES, STORE_SHOP_DATA], 'readonly');
      const imgStore = tx.objectStore(STORE_IMAGES);
      const shopStore = tx.objectStore(STORE_SHOP_DATA);

      let imageCount = 0;
      let totalBytes = 0;
      let shopCount = 0;

      const imgReq = imgStore.openCursor();
      imgReq.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest).result as IDBCursorWithValue | null;
        if (cursor) {
          imageCount++;
          const val = cursor.value as CachedImageRecord;
          if (val && val.sizeBytes) {
            totalBytes += val.sizeBytes;
          }
          cursor.continue();
        } else {
          const shopReq = shopStore.count();
          shopReq.onsuccess = () => {
            shopCount = shopReq.result || 0;
            resolve({ imageCount, shopCount, totalBytes });
          };
          shopReq.onerror = () => {
            resolve({ imageCount, shopCount, totalBytes });
          };
        }
      };

      imgReq.onerror = () => {
        resolve({ imageCount: 0, shopCount: 0, totalBytes: 0 });
      };
    });
  } catch {
    return { imageCount: 0, shopCount: 0, totalBytes: 0 };
  }
}

/**
 * Clears the IndexedDB cache if requested by user.
 */
export async function clearGearCache(): Promise<void> {
  memoryBlobUrlMap.clear();
  try {
    const db = await openGearDB();
    const tx = db.transaction([STORE_IMAGES, STORE_SHOP_DATA, STORE_AI_SEARCH], 'readwrite');
    tx.objectStore(STORE_IMAGES).clear();
    tx.objectStore(STORE_SHOP_DATA).clear();
    tx.objectStore(STORE_AI_SEARCH).clear();
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (e) {
    console.warn('Error clearing gear cache:', e);
  }
}
