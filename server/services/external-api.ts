/**
 * External API Service
 * 
 * This module handles all the communication with the external API.
 * It provides the necessary methods to fetch data from the API endpoints.
 */

import fetch from 'node-fetch';
import { apiConfig } from '../config';
import { RateRequest, RateQuote, TrackingEvent } from './carrier-api';

// Extend global interface to include our authToken
declare global {
  var authToken: string | undefined;
}

/**
 * Helper to make API calls to the external API
 * @param endpoint - The API endpoint path (without the base URL)
 * @param method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param body - Request body for POST/PUT/PATCH requests
 * @returns Promise with the API response
 */
async function apiCall<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
  // Construct the full URL to the API endpoint
  const url = `${apiConfig.externalApiUrl}${endpoint}`;
  
  // Check if we have a token in the request (thread-local storage)
  const token = global.authToken || apiConfig.apiKey;
  
  if (!token && endpoint === '/users') {
    console.log(`[API] WARNING: No authentication token available for users endpoint`);
  }
  
  console.log(`[API] Calling external API: ${method} ${url}`);
  console.log(`[API] Auth token available: ${!!token}`);
  
  // Configure request options
  const options: any = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  // Add authorization if we have a token
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
    console.log(`[API] Using token for authorization: ${token.substring(0, 10)}...`);
  }
  
  // Add the request body for POST/PUT/PATCH requests
  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    options.body = JSON.stringify(body);
    console.log(`[API] Request body:`, JSON.stringify(body).substring(0, 200));
  }
  
  try {
    console.log(`[API] Sending request to ${url} with headers:`, options.headers);
    
    // Add special handling for HTTPS URLs without valid certificates 
    // and handle CORS issues by proxying the request through our server
    if (url.startsWith('https://209.97.171.114') || url.startsWith('https://128.199.198.8')) {
      console.log('[API] Using special handling for HTTPS API calls to avoid CORS issues');
      options.agent = new (require('https').Agent)({
        rejectUnauthorized: false // Allow self-signed certificates
      });
    }
    
    const response = await fetch(url, options);
    
    // Check if the response is successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] Error from external API: ${response.status} ${errorText}`);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    // Parse and return the response data
    const data = await response.json();
    console.log(`[API] Successful response from ${endpoint}:`, 
      JSON.stringify(data).substring(0, 200) + (JSON.stringify(data).length > 200 ? '...' : ''));
    return data as T;
  } catch (error) {
    console.error('[API] Error calling external API:', error);
    throw error;
  }
}

/**
 * Generic function to call any external API endpoint
 * Use this when you need to call an endpoint that doesn't have a specific function
 * @param endpoint - The API endpoint path (without the base URL)
 * @param method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param body - Request body for POST/PUT/PATCH requests
 * @returns Promise with the API response
 */
export async function callExternalApi<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
  // Log the specific API call for debugging
  console.log(`[API] Calling external API: ${method} ${endpoint}`);
  
  // Special handling for users endpoint
  if (endpoint === '/users' && method === 'GET') {
    console.log('[API] Getting users list from external API');
  }
  
  try {
    const result = await apiCall<T>(endpoint, method, body);
    console.log(`[API] Successfully called ${endpoint}`);
    return result;
  } catch (error) {
    console.error(`[API] Error calling ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Get shipping rate quotes from the external API
 */
export async function getExternalRates(request: RateRequest): Promise<RateQuote[]> {
  try {
    // Transform the request to match the external API format if needed
    const apiRequest = {
      sender_address: {
        name: request.sender.name,
        company: request.sender.company,
        street: request.sender.street,
        street2: request.sender.street2,
        city: request.sender.city,
        state: request.sender.state,
        postal_code: request.sender.postalCode,
        country: request.sender.country,
        phone: request.sender.phone
      },
      receiver_address: {
        name: request.recipient.name,
        company: request.recipient.company,
        street: request.recipient.street,
        street2: request.recipient.street2,
        city: request.recipient.city,
        state: request.recipient.state,
        postal_code: request.recipient.postalCode,
        country: request.recipient.country,
        phone: request.recipient.phone
      },
      package_details: {
        length: request.package.length,
        width: request.package.width,
        height: request.package.height,
        weight: request.package.weight,
        quantity: request.package.quantity || 1
      },
      service_type: request.serviceType,
      shipment_type: request.shipmentType
    };
    
    // Call the external API
    const response = await apiCall<any>('/shipping/rates', 'POST', apiRequest);
    
    // Transform the response to match our internal format
    if (response && response.rates && Array.isArray(response.rates)) {
      return response.rates.map((rate: any) => ({
        carrier: rate.carrier,
        service: rate.service,
        deliveryDays: rate.delivery_days,
        baseRate: rate.base_rate,
        taxes: rate.taxes,
        fees: rate.fees,
        insurance: rate.insurance,
        totalRate: rate.total_rate,
        currency: rate.currency || 'USD',
        estimatedDelivery: rate.estimated_delivery,
        deliveryGuarantee: rate.delivery_guarantee
      }));
    }
    
    return [];
  } catch (error) {
    console.error('[API] Error getting external rates:', error);
    throw error;
  }
}

/**
 * Get tracking information from the external API
 */
export async function getExternalTracking(trackingNumber: string): Promise<{
  trackingEvents: TrackingEvent[],
  shipmentDetails: any
}> {
  try {
    // Call the external API
    const response = await apiCall<any>(`/tracking/${trackingNumber}`);
    
    // Transform tracking events to match our internal format
    const trackingEvents = response.tracking_events?.map((event: any) => ({
      status: event.status,
      location: event.location,
      timestamp: new Date(event.timestamp),
      description: event.description
    })) || [];
    
    return {
      trackingEvents,
      shipmentDetails: response
    };
  } catch (error) {
    console.error('[API] Error getting external tracking:', error);
    throw error;
  }
}

/**
 * Login to the external API
 * @param email User email
 * @param password User password
 * @returns Auth token and user info
 */
export async function loginToExternalApi(email: string, password: string): Promise<{
  token: string,
  user_id: number,
  email: string
}> {
  try {
    return await apiCall<any>('/login', 'POST', { email, password });
  } catch (error) {
    console.error('[API] Error logging in to external API:', error);
    throw error;
  }
}