/**
 * Central API Configuration for Maha Seva Dal
 * Resolves to same-origin relative URLs ("") in production behind Nginx reverse-proxy,
 * or explicit VITE_API_URL if configured, and localhost in local development.
 */

const rawApiUrl = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");

export const resolveApiBaseUrl = (
  envUrl: string = rawApiUrl,
  isDev: boolean = Boolean(import.meta.env.DEV)
): string => {
  // 1. If running in browser on a production domain (not localhost / 127.0.0.1),
  // always use relative paths ("") so Nginx proxies /api/ seamlessly without CORS or mixed content.
  if (typeof window !== "undefined" && window.location?.hostname) {
    const host = window.location.hostname.toLowerCase();
    if (host !== "localhost" && host !== "127.0.0.1" && host !== "::1") {
      return "";
    }
  }

  // 2. In production builds, never allow a localhost URL to be used in client browsers
  if (!isDev && envUrl && (envUrl.includes("localhost") || envUrl.includes("127.0.0.1"))) {
    return "";
  }

  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }

  if (isDev) {
    return "http://localhost:5000";
  }

  return "";
};

export const API_BASE_URL = resolveApiBaseUrl();

export const getApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const base = resolveApiBaseUrl();
  return `${base}${cleanEndpoint}`;
};
