// Location module for AflaChat Web.
// Provides automatic user location collection:
// 1. Attempts high-accuracy browser GPS geolocation (asking the user politely).
// 2. If the user declines/denies permission, or if GPS is unavailable, automatically
//    falls back to silent IP-based geolocation so the platform still captures regional data.
// 3. Caches location locally to prevent redundant permission popups or API lookups.

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  source: "gps" | "ip" | "cached";
  city?: string;
  region?: string;
  country?: string;
  timestamp: number;
}

const LOCATION_CACHE_KEY = "aflachat_user_location_v1";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/** Get cached location from localStorage if valid */
export function getCachedLocation(): UserLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCATION_CACHE_KEY);
    if (!raw) return null;
    const parsed: UserLocation = JSON.parse(raw);
    if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
      return { ...parsed, source: "cached" };
    }
  } catch {
    // Ignore corrupt cache
  }
  return null;
}

/** Save location to localStorage */
export function saveCachedLocation(loc: UserLocation): void {
  if (typeof window === "undefined") return null as unknown as void;
  try {
    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(loc));
  } catch {
    // Ignore storage quota errors
  }
}

/** Fetch approximate location from free, open IP geolocation APIs (no key needed) */
export async function fetchIpLocation(): Promise<UserLocation> {
  const providers = [
    // Provider 1: ipwho.is (fast, HTTPS, free for client-side queries)
    async () => {
      const res = await fetch("https://ipwho.is/", { signal: AbortSignal.timeout(4000) });
      if (!res.ok) throw new Error("ipwho.is failed");
      const data = await res.json();
      if (data.success === false) throw new Error(data.message || "IP lookup failed");
      return {
        lat: Number(data.latitude),
        lng: Number(data.longitude),
        accuracy: 25000,
        source: "ip" as const,
        city: data.city,
        region: data.region,
        country: data.country,
        timestamp: Date.now(),
      };
    },
    // Provider 2: ipapi.co (reliable backup)
    async () => {
      const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(4000) });
      if (!res.ok) throw new Error("ipapi.co failed");
      const data = await res.json();
      if (data.error) throw new Error(data.reason || "ipapi error");
      return {
        lat: Number(data.latitude),
        lng: Number(data.longitude),
        accuracy: 25000,
        source: "ip" as const,
        city: data.city,
        region: data.region,
        country: data.country_name,
        timestamp: Date.now(),
      };
    },
    // Provider 3: Default fallback to central Tanzania (Dodoma) if all networks fail
    async () => {
      return {
        lat: -6.163,
        lng: 35.7516,
        accuracy: 50000,
        source: "ip" as const,
        city: "Dodoma",
        region: "Dodoma",
        country: "Tanzania",
        timestamp: Date.now(),
      };
    },
  ];

  for (const provider of providers) {
    try {
      const loc = await provider();
      if (!isNaN(loc.lat) && !isNaN(loc.lng)) {
        saveCachedLocation(loc);
        return loc;
      }
    } catch {
      // Try next provider
    }
  }

  // Guaranteed fallback
  const fallback: UserLocation = {
    lat: -6.163,
    lng: 35.7516,
    accuracy: 50000,
    source: "ip",
    city: "Dodoma",
    region: "Dodoma",
    country: "Tanzania",
    timestamp: Date.now(),
  };
  saveCachedLocation(fallback);
  return fallback;
}

/** Request browser GPS geolocation from the user */
export function requestBrowserLocation(timeoutMs = 8000): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: UserLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          source: "gps",
          timestamp: Date.now(),
        };
        saveCachedLocation(loc);
        resolve(loc);
      },
      (err) => {
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 10 * 60 * 1000, // 10 minutes cache
      },
    );
  });
}

/**
 * Main auto-collection entry point:
 * 1. Returns cached location if fresh.
 * 2. Asks for GPS geolocation.
 * 3. If user declines or GPS fails, seamlessly auto-captures IP location.
 */
export async function autoCollectLocation(requestGpsFirst = true): Promise<UserLocation> {
  const cached = getCachedLocation();
  if (cached) return cached;

  if (requestGpsFirst && typeof window !== "undefined" && "geolocation" in navigator) {
    try {
      return await requestBrowserLocation(6000);
    } catch {
      // User declined or GPS timed out -> auto-capture via IP!
    }
  }

  return await fetchIpLocation();
}
