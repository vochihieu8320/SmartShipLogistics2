// Determine if we're in development or production
const isDev = import.meta.env.DEV;

// In development, use the direct API URL for simplicity
// In production, use the proxy API to avoid CORS issues
export const EXTERNAL_API_URL = isDev
  ? "https://209.97.171.114/api/v1" // Dev: Direct API access
  : "/api/external"; // Prod: Proxy through our server

// For client-side API calls
export const API_BASE_URL = "https://209.97.171.114/api/v1";

export const API_ENDPOINTS = {
  // External API endpoints
  LOGIN: "/login",
  USERS: "/users",
  ROLE_PERMISSIONS: "/roles/permissions_by_feature",
  SHIPMENTS: "/shipments",

  // Local API endpoints
  LOCAL_LOGIN: "/login",
  LOCAL_REGISTER: "/register",
  LOCAL_LOGOUT: "/logout",
  LOCAL_USER: "/user",
};

// For debug logging
console.log("[API] Using proxy for external API calls:", API_BASE_URL);
