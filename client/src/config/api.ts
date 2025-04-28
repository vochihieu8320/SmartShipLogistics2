// API Base URLs
export const EXTERNAL_API_URL = "https://209.97.171.114/api/v1";
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
