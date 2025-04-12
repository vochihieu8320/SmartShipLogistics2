/**
 * Mock Carrier API Service
 * This file simulates carrier API interactions for demonstration purposes
 */

// Types for our carrier rate API
export interface PackageDimensions {
  length: number;
  width: number;
  height: number;
  weight: number;
  quantity?: number;
}

export interface ShippingAddress {
  name: string;
  company?: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface RateRequest {
  sender: ShippingAddress;
  recipient: ShippingAddress;
  package: PackageDimensions;
  serviceType?: string;
  shipmentType?: string;
}

export interface RateQuote {
  carrier: string;
  service: string;
  deliveryDays: number;
  baseRate: number;
  taxes: number;
  fees: number;
  insurance: number;
  totalRate: number;
  currency: string;
  estimatedDelivery: string;
  deliveryGuarantee?: boolean;
  logo?: string;
}

// Helper to generate consistent but slightly random rates
function generateRate(
  baseAmount: number,
  dimensions: PackageDimensions,
  distance: 'local' | 'domestic' | 'international',
  serviceSpeed: 'economy' | 'standard' | 'express' | 'priority'
): number {
  // Calculate volumetric weight
  const volume = dimensions.length * dimensions.width * dimensions.height;
  const volumetricWeight = volume / 5000; // Standard divisor
  const calculatedWeight = Math.max(dimensions.weight, volumetricWeight);
  
  // Base price factors
  let distanceFactor = distance === 'local' ? 1 : distance === 'domestic' ? 1.5 : 3.5;
  let speedFactor = speedFactors[serviceSpeed];
  
  // Calculate price with some randomness
  let quantity = dimensions.quantity || 1;
  let price = baseAmount * calculatedWeight * distanceFactor * speedFactor * quantity;
  
  // Add slight randomness (±5%)
  const randomFactor = 0.95 + (Math.random() * 0.1);
  price = price * randomFactor;
  
  return parseFloat(price.toFixed(2));
}

// Service speed factors
const speedFactors = {
  economy: 0.8,
  standard: 1.0,
  express: 1.4,
  priority: 1.8
};

// Mock delivery days based on service speed
function getDeliveryDays(serviceSpeed: string): number {
  switch (serviceSpeed) {
    case 'priority':
      return 1;
    case 'express':
      return 2;
    case 'standard':
      return 3 + Math.floor(Math.random() * 2); // 3-4 days
    case 'economy':
      return 5 + Math.floor(Math.random() * 3); // 5-7 days
    default:
      return 3;
  }
}

// Get distance type based on countries
function getDistanceType(sender: ShippingAddress, recipient: ShippingAddress): 'local' | 'domestic' | 'international' {
  if (sender.country !== recipient.country) {
    return 'international';
  }
  
  if (sender.state === recipient.state) {
    return 'local';
  }
  
  return 'domestic';
}

// Calculate estimated delivery date
function getEstimatedDelivery(deliveryDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + deliveryDays);
  return date.toISOString().split('T')[0];
}

// Mock UPS API
export async function getUPSRates(request: RateRequest): Promise<RateQuote[]> {
  const distance = getDistanceType(request.sender, request.recipient);
  const services = ['economy', 'standard', 'express', 'priority'];
  
  return services.map(service => {
    const deliveryDays = getDeliveryDays(service);
    const baseRate = generateRate(2.5, request.package, distance, service as any);
    const taxes = parseFloat((baseRate * 0.08).toFixed(2));
    const fees = parseFloat((baseRate * 0.03).toFixed(2));
    const insurance = parseFloat((baseRate * 0.05).toFixed(2));
    const totalRate = parseFloat((baseRate + taxes + fees + insurance).toFixed(2));
    
    return {
      carrier: 'UPS',
      service: service.charAt(0).toUpperCase() + service.slice(1),
      deliveryDays,
      baseRate,
      taxes,
      fees,
      insurance,
      totalRate,
      currency: 'USD',
      estimatedDelivery: getEstimatedDelivery(deliveryDays),
      deliveryGuarantee: service === 'priority' || service === 'express'
    };
  });
}

// Mock FedEx API
export async function getFedExRates(request: RateRequest): Promise<RateQuote[]> {
  const distance = getDistanceType(request.sender, request.recipient);
  const services = ['economy', 'standard', 'express', 'priority'];
  
  return services.map(service => {
    const deliveryDays = getDeliveryDays(service);
    const baseRate = generateRate(2.6, request.package, distance, service as any);
    const taxes = parseFloat((baseRate * 0.085).toFixed(2));
    const fees = parseFloat((baseRate * 0.025).toFixed(2));
    const insurance = parseFloat((baseRate * 0.04).toFixed(2));
    const totalRate = parseFloat((baseRate + taxes + fees + insurance).toFixed(2));
    
    return {
      carrier: 'FedEx',
      service: service === 'priority' ? 'Priority Overnight' : 
               service === 'express' ? 'Express' :
               service === 'standard' ? 'Ground' : 'Economy',
      deliveryDays,
      baseRate,
      taxes,
      fees,
      insurance,
      totalRate,
      currency: 'USD',
      estimatedDelivery: getEstimatedDelivery(deliveryDays),
      deliveryGuarantee: service === 'priority'
    };
  });
}

// Mock DHL API
export async function getDHLRates(request: RateRequest): Promise<RateQuote[]> {
  const distance = getDistanceType(request.sender, request.recipient);
  const services = ['economy', 'standard', 'express', 'priority'];
  
  return services.map(service => {
    const deliveryDays = getDeliveryDays(service);
    const baseRate = generateRate(2.7, request.package, distance, service as any);
    const taxes = parseFloat((baseRate * 0.09).toFixed(2));
    const fees = parseFloat((baseRate * 0.03).toFixed(2));
    const insurance = parseFloat((baseRate * 0.035).toFixed(2));
    const totalRate = parseFloat((baseRate + taxes + fees + insurance).toFixed(2));
    
    return {
      carrier: 'DHL',
      service: service === 'priority' ? 'Express Worldwide' : 
               service === 'express' ? 'Express Easy' :
               service === 'standard' ? 'Economy Select' : 'Parcel',
      deliveryDays,
      baseRate,
      taxes,
      fees,
      insurance,
      totalRate,
      currency: 'USD',
      estimatedDelivery: getEstimatedDelivery(deliveryDays),
      deliveryGuarantee: service === 'priority' || service === 'express'
    };
  });
}

// Mock SF Express API
export async function getSFExpressRates(request: RateRequest): Promise<RateQuote[]> {
  const distance = getDistanceType(request.sender, request.recipient);
  const services = ['economy', 'standard', 'express', 'priority'];
  
  return services.map(service => {
    const deliveryDays = getDeliveryDays(service);
    const baseRate = generateRate(2.4, request.package, distance, service as any);
    const taxes = parseFloat((baseRate * 0.07).toFixed(2));
    const fees = parseFloat((baseRate * 0.02).toFixed(2));
    const insurance = parseFloat((baseRate * 0.03).toFixed(2));
    const totalRate = parseFloat((baseRate + taxes + fees + insurance).toFixed(2));
    
    return {
      carrier: 'SF Express',
      service: service === 'priority' ? 'SF International Express' : 
               service === 'express' ? 'SF Express' :
               service === 'standard' ? 'SF Standard' : 'SF Economy',
      deliveryDays,
      baseRate,
      taxes,
      fees,
      insurance,
      totalRate,
      currency: 'USD',
      estimatedDelivery: getEstimatedDelivery(deliveryDays),
      deliveryGuarantee: service === 'priority'
    };
  });
}

// Get rates from all carriers
export async function getAllCarrierRates(request: RateRequest): Promise<RateQuote[]> {
  const [upsRates, fedexRates, dhlRates, sfRates] = await Promise.all([
    getUPSRates(request),
    getFedExRates(request),
    getDHLRates(request),
    getSFExpressRates(request)
  ]);
  
  return [...upsRates, ...fedexRates, ...dhlRates, ...sfRates];
}

// Tracking data generation
export interface TrackingEvent {
  status: string;
  location: string;
  timestamp: Date;
  description: string;
}

export function generateMockTrackingInfo(
  trackingNumber: string,
  carrier: string,
  status: string
): TrackingEvent[] {
  const events: TrackingEvent[] = [];
  const now = new Date();
  
  // Order created
  const orderDate = new Date(now);
  orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 10 + 1));
  events.push({
    status: "Order Created",
    location: "Shipping Origin",
    timestamp: orderDate,
    description: "Shipment information received."
  });
  
  // Package received
  const receivedDate = new Date(orderDate);
  receivedDate.setHours(receivedDate.getHours() + Math.floor(Math.random() * 12 + 6));
  events.push({
    status: "Package Received",
    location: "Origin Facility",
    timestamp: receivedDate,
    description: `Package received by ${carrier}.`
  });
  
  // Processing
  const processingDate = new Date(receivedDate);
  processingDate.setHours(processingDate.getHours() + Math.floor(Math.random() * 8 + 2));
  events.push({
    status: "Processing",
    location: "Origin Facility",
    timestamp: processingDate,
    description: "Shipment is being processed."
  });
  
  // In transit events
  if (status === "in_transit" || status === "delivered") {
    const transitDate1 = new Date(processingDate);
    transitDate1.setHours(transitDate1.getHours() + Math.floor(Math.random() * 12 + 6));
    events.push({
      status: "In Transit",
      location: "Transit Facility",
      timestamp: transitDate1,
      description: "Shipment has departed from origin facility."
    });
    
    // Add some random transit events
    const transitLocations = [
      "Regional Distribution Center", 
      "International Gateway", 
      "Customs Clearance", 
      "Destination Distribution Center"
    ];
    
    let lastDate = transitDate1;
    for (let i = 0; i < Math.floor(Math.random() * 3 + 1); i++) {
      const transitDate = new Date(lastDate);
      transitDate.setHours(transitDate.getHours() + Math.floor(Math.random() * 24 + 12));
      
      // Don't add events that would be after the current time
      if (transitDate > now && status !== "delivered") break;
      
      events.push({
        status: "In Transit",
        location: transitLocations[i % transitLocations.length],
        timestamp: transitDate,
        description: "Shipment is in transit to next facility."
      });
      
      lastDate = transitDate;
    }
    
    if (status === "delivered") {
      // Out for delivery
      const outForDeliveryDate = new Date(lastDate);
      outForDeliveryDate.setHours(outForDeliveryDate.getHours() + Math.floor(Math.random() * 12 + 6));
      events.push({
        status: "Out for Delivery",
        location: "Local Delivery Facility",
        timestamp: outForDeliveryDate,
        description: "Shipment is out for delivery."
      });
      
      // Delivered
      const deliveredDate = new Date(outForDeliveryDate);
      deliveredDate.setHours(deliveredDate.getHours() + Math.floor(Math.random() * 8 + 1));
      events.push({
        status: "Delivered",
        location: "Destination Address",
        timestamp: deliveredDate,
        description: "Package has been delivered."
      });
    }
  }
  
  return events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}