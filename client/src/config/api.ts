
// Default API endpoints
export const API_BASE_URL = 'http://128.199.198.8/api/v1';
export const LOCAL_API_URL = '/api';

// Default to local API until config is loaded
export let USE_EXTERNAL_API = false;
export let ACTIVE_API_URL = LOCAL_API_URL;

// Load configuration from server
async function loadApiConfig() {
  try {
    const response = await fetch('/api/config');
    if (response.ok) {
      const config = await response.json();
      USE_EXTERNAL_API = config.useExternalApi || false;
      
      // Update active API URL based on server configuration
      ACTIVE_API_URL = USE_EXTERNAL_API ? (config.externalApiUrl || API_BASE_URL) : LOCAL_API_URL;
      
      console.log(`[API] Using ${USE_EXTERNAL_API ? 'external' : 'local'} API: ${ACTIVE_API_URL}`);
    } else {
      console.warn("[API] Failed to load API configuration, using defaults");
    }
  } catch (error) {
    console.error("[API] Error loading API configuration:", error);
  }
}

// Load configuration immediately
loadApiConfig();

export const API_ENDPOINTS = {
  // External API endpoints
  LOGIN: '/login',
  USERS: '/users',
  ROLE_PERMISSIONS: '/roles/permissions_by_feature',
  
  // Local API endpoints
  LOCAL_LOGIN: '/login',
  LOCAL_REGISTER: '/register',
  LOCAL_LOGOUT: '/logout',
  LOCAL_USER: '/user'
};
