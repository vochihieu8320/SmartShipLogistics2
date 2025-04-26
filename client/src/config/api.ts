
// External API endpoint for production
export const API_BASE_URL = 'http://128.199.198.8/api/v1';

// Use the local API for development
export const LOCAL_API_URL = '/api';

// Determine which API to use based on environment or configuration
// For now, we'll use the local API for ease of development
export const ACTIVE_API_URL = LOCAL_API_URL;

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
