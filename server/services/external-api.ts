/**
 * External API Service
 * 
 * This module handles all the communication with the external API.
 * It provides the necessary methods to fetch data from the API endpoints.
 */

import fetch from 'node-fetch';
import { apiConfig } from '../config';
import { RateRequest, RateQuote, TrackingEvent } from './carrier-api';

// Helper to handle API responses and errors
async function apiCall<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
  // Construct the full URL to the API endpoint
  const url = `${apiConfig.externalApiUrl}${endpoint}`;
  
  // Configure request options
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      // Add the API key if available
      ...(apiConfig.apiKey ? { 'Authorization': `Bearer ${apiConfig.apiKey}` } : {})
    }
  };
  
  // Add the request body for POST/PUT/PATCH requests
  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    options.body = JSON.stringify(body);
  }
  
  console.log(`[API] Calling external API: ${method} ${url}`);
  
  try {
    const response = await fetch(url, options);
    
    // Check if the response is successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] Error from external API: ${response.status} ${errorText}`);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    // Parse and return the response data
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error('[API] Error calling external API:', error);
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