import { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertOrderSchema, insertPaymentSchema, insertAddressSchema } from "@shared/schema";
import { z } from "zod";
import { apiConfig } from "./config";
import { apiProxyMiddleware, setupApiProxy } from "./proxy";

// Extend global interface to include our authToken for TypeScript
declare global {
  var authToken: string | undefined;
}

import {
  getAllCarrierRates,
  generateMockTrackingInfo,
  RateRequest,
  RateQuote,
  TrackingEvent
} from "./services/carrier-api";
import { 
  getExternalTracking, 
  callExternalApi,
  loginToExternalApi
} from "./services/external-api";

function isAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Not authenticated" });
}

function isAdmin(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated() && req.user?.role === 'admin') {
    return next();
  }
  return res.status(403).json({ error: "Insufficient permissions" });
}

export function registerRoutes(app: Express): Server {
  // Set up authentication
  setupAuth(app);

  // For debugging purposes
  app.use((req, res, next) => {
    console.log(`[DEBUG] ${req.method} ${req.path}`);
    next();
  });
  
  // Set up API proxy for external API calls
  app.use('/api/external', setupApiProxy);
  app.use('/api/external', apiProxyMiddleware);
  
  // API Configuration endpoint - expose configuration to the client
  app.get("/api/config", (req, res) => {
    // Only expose what the client needs to know
    res.json({
      useExternalApi: apiConfig.useExternalApi,
      externalApiUrl: apiConfig.externalApiUrl,
      // Don't expose sensitive information like API keys
    });
  });
  
  // Public API endpoints for client-facing interface
  
  // Demo tracking data for the demo tracking number
  // IMPORTANT: This specific route MUST come before the general tracking route with parameters
  app.get("/api/tracking/SHIP123456789", async (req, res) => {
    console.log("[DEBUG] Serving demo tracking data");
    
    // Create a realistic sender and recipient
    const sender = {
      id: 1,
      name: "John Smith",
      company: "SmartShip Enterprises",
      street: "100 Main Street",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "USA",
      email: "john@example.com",
      phone: "+1 212-555-1234"
    };
    
    const recipient = {
      id: 2,
      name: "Sarah Johnson",
      company: "Tech Solutions Inc.",
      street: "400 Market Street",
      city: "San Francisco",
      state: "CA",
      postalCode: "94105",
      country: "USA",
      email: "sarah@example.com",
      phone: "+1 415-555-6789"
    };
    
    // Create the tracking steps manually
    const trackingSteps = [
      {
        status: "order_placed",
        location: "New York, NY",
        timestamp: new Date(Date.now() - 86400000 * 3), // 3 days ago
        description: "Order has been placed and payment confirmed"
      },
      {
        status: "pickup_scheduled",
        location: "New York, NY",
        timestamp: new Date(Date.now() - 86400000 * 2.5), // 2.5 days ago
        description: "Pickup has been scheduled from the sender location"
      },
      {
        status: "package_received",
        location: "New York, NY",
        timestamp: new Date(Date.now() - 86400000 * 2), // 2 days ago
        description: "Package has been received at origin facility"
      },
      {
        status: "in_transit",
        location: "Memphis, TN",
        timestamp: new Date(Date.now() - 86400000 * 1), // 1 day ago
        description: "Package is in transit to the destination"
      },
      {
        status: "customs_clearance",
        location: "Memphis, TN",
        timestamp: new Date(Date.now() - 43200000), // 12 hours ago
        description: "Package has cleared customs inspection"
      },
      {
        status: "out_for_delivery",
        location: "San Francisco, CA",
        timestamp: new Date(Date.now() - 14400000), // 4 hours ago
        description: "Package is out for delivery to the recipient"
      }
    ];
    
    // Create the response
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - 3); // 3 days ago
    
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 1); // 1 day from now
    
    res.json({
      trackingNumber: "SHIP123456789",
      awbNumber: "AWB987654321",
      orderNumber: "ORD123456",
      status: "in_transit",
      carrier: "FedEx",
      serviceType: "Express",
      packageWeight: 5.5,
      packageLength: 30,
      packageWidth: 25,
      packageHeight: 20,
      estimatedDelivery,
      sender,
      recipient,
      trackingEvents: trackingSteps
    });
  });
  
  // General tracking API endpoint
  app.get("/api/tracking/:trackingNumber", async (req, res, next) => {
    try {
      const trackingNumber = req.params.trackingNumber;
      
      // Check if we should use the external API
      if (apiConfig.useExternalApi) {
        try {
          console.log('[API] Using external API for tracking:', trackingNumber);
          
          // Get tracking info from external API
          const externalTracking = await getExternalTracking(trackingNumber);
          if (externalTracking && externalTracking.shipmentDetails) {
            return res.json({
              ...externalTracking.shipmentDetails,
              trackingEvents: externalTracking.trackingEvents
            });
          }
        } catch (error) {
          console.error('[API] Error getting external tracking, falling back to local storage:', error);
          // Fall back to local storage if external API fails
        }
      }
      
      console.log('[API] Using local storage for tracking:', trackingNumber);
      
      // Try to find by order number or AWB number from local storage
      const order = await storage.getOrderByNumber(trackingNumber);
      
      if (!order) {
        return res.status(404).json({ error: "Tracking information not found" });
      }
      
      // Get sender and recipient addresses
      const [sender, recipient] = await Promise.all([
        storage.getAddress(order.senderId),
        storage.getAddress(order.recipientId)
      ]);
      
      // Use the improved tracking event generator
      const trackingSteps = generateMockTrackingInfo(
        trackingNumber, 
        order.carrier, 
        order.status
      );
      
      // Calculate estimated delivery date (5 days from order creation for consistent API)
      const orderDate = new Date(order.createdAt);
      const estimatedDelivery = new Date(orderDate);
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);
      
      // Format response
      const response = {
        trackingNumber: trackingNumber,
        awbNumber: order.awbNumber,
        orderNumber: order.orderNumber,
        status: order.status,
        carrier: order.carrier,
        serviceType: order.serviceType,
        packageWeight: order.packageWeight,
        packageLength: order.packageLength,
        packageWidth: order.packageWidth,
        packageHeight: order.packageHeight,
        estimatedDelivery: estimatedDelivery,
        sender,
        recipient,
        trackingEvents: trackingSteps
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  });
  
  // Carrier rate comparison endpoint
  app.post("/api/shipping/rates", async (req, res, next) => {
    try {
      // Validate request body with zod schema
      const rateRequestSchema = z.object({
        sender: z.object({
          name: z.string(),
          company: z.string().optional(),
          street: z.string(),
          street2: z.string().optional(),
          city: z.string(),
          state: z.string(),
          postalCode: z.string(),
          country: z.string(),
          phone: z.string().optional()
        }),
        recipient: z.object({
          name: z.string(),
          company: z.string().optional(),
          street: z.string(),
          street2: z.string().optional(),
          city: z.string(),
          state: z.string(),
          postalCode: z.string(),
          country: z.string(),
          phone: z.string().optional()
        }),
        package: z.object({
          length: z.number(),
          width: z.number(),
          height: z.number(),
          weight: z.number(),
          quantity: z.number().optional()
        }),
        serviceType: z.string().optional(),
        shipmentType: z.string().optional()
      });
      
      const requestData = rateRequestSchema.parse(req.body);
      
      // Get rates from all carriers
      const rates = await getAllCarrierRates(requestData);
      
      // Sort rates by price
      rates.sort((a, b) => a.totalRate - b.totalRate);
      
      res.json({ rates });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      next(error);
    }
  });
  
  // Generate mock tracking number for demonstration
  app.get("/api/demo-tracking", async (req, res, next) => {
    try {
      // Fixed demo tracking number for easy access
      const demoTrackingNumber = "SHIP123456789";
      res.json({
        trackingNumber: demoTrackingNumber,
        message: "Use this tracking number for demonstration"
      });
    } catch (error) {
      next(error);
    }
  });
  
  // API endpoint for listing shipments
  app.get("/api/v1/shipments", async (req, res, next) => {
    try {
      // Get auth token from request header and make it available to the external API call
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        console.log('[DEBUG] Using authorization token from request for shipments list');
        (global as any).authToken = token;
      } else {
        console.log('[DEBUG] No authorization token in request headers');
        delete (global as any).authToken;
        return res.status(401).json({ error: "Authorization required" });
      }
      
      // Check if we should use the external API
      if (apiConfig.useExternalApi) {
        try {
          console.log('[API] Using external API for shipments list');
          
          // Call the external API using our generic function
          const data = await callExternalApi('/shipments', 'GET');
          return res.json(data);
        } catch (error) {
          console.error('[API] Error getting external shipments, falling back to mock data:', error);
          // Fall back to mock data if external API fails
        }
      }
    
      console.log("[DEBUG] Serving mock shipments data");
      // Return mock data as requested
      res.json({
        "success": true,
        "count": 30,
        "shipments": [
          {
            "id": 1,
            "tracking_number": "SHIPS17451448440",
            "status": null,
            "created_at": "2025-04-20T10:27:25.530Z",
            "sender": {
              "name": "Nguyen Van A",
              "city": "Ho Chi Minh City",
              "country": "Việt Nam"
            },
            "receiver": {
              "name": "Li Wei",
              "city": "Singapore",
              "country": "Việt Nam"
            },
            "total_price": null
          },
          {
            "id": 2,
            "tracking_number": "SHIPS17451442345",
            "status": "in_transit",
            "created_at": "2025-04-19T14:35:25.530Z",
            "sender": {
              "name": "Tran Thi B",
              "city": "Ha Noi",
              "country": "Việt Nam"
            },
            "receiver": {
              "name": "John Smith",
              "city": "New York",
              "country": "USA"
            },
            "total_price": 245.50
          },
          {
            "id": 3,
            "tracking_number": "SHIPS17451435687",
            "status": "delivered",
            "created_at": "2025-04-15T08:27:25.530Z",
            "sender": {
              "name": "Le Van C",
              "city": "Da Nang",
              "country": "Việt Nam"
            },
            "receiver": {
              "name": "Maria Garcia",
              "city": "Madrid",
              "country": "Spain"
            },
            "total_price": 312.75
          }
        ]
      });
    } catch (error) {
      next(error);
    }
  });
  
  // User Management API endpoints
  app.get("/api/v1/users", async (req, res, next) => {
    try {
      // Get auth token from request header and make it available to the external API call
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        console.log('[DEBUG] Using authorization token from request for users list');
        (global as any).authToken = token;
      } else {
        console.log('[DEBUG] No authorization token in request headers');
        delete (global as any).authToken;
        return res.status(401).json({ error: "Authorization required" });
      }

      // Check if we should use the external API
      if (apiConfig.useExternalApi) {
        try {
          console.log('[API] Getting users from external API');
          
          // Call the external API using our generic function
          console.log('[API] Calling external API for users list');
          const data = await callExternalApi('/users', 'GET');
          return res.json(data);
        } catch (error) {
          console.error('[API] Error getting users from external API:', error);
          return res.status(500).json({ 
            success: false, 
            message: "Failed to get users from external API" 
          });
        }
      } else {
        // For testing without external API
        console.log('[DEBUG] External API is disabled, returning mock users');
        return res.json({
          success: true,
          users: [
            {
              id: 1,
              email: "admin@example.com",
              name: "Admin User",
              role_name: "admin",
              created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 2,
              email: "manager@example.com",
              name: "Manager User",
              role_name: "manager",
              created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        });
      }
    } catch (error) {
      next(error);
    }
  });

  // Create user API endpoint
  app.post("/api/v1/users", async (req, res, next) => {
    try {
      // Validate request body
      const { email, password, password_confirmation, role_name } = req.body;
      
      if (!email || !password || !password_confirmation || !role_name) {
        return res.status(400).json({ 
          success: false, 
          message: "Email, password, password confirmation, and role name are required" 
        });
      }
      
      // Get auth token from request header and make it available to the external API call
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        console.log('[DEBUG] Using authorization token to create user');
        (global as any).authToken = token;
      } else {
        console.log('[DEBUG] No authorization token in request headers');
        delete (global as any).authToken;
        return res.status(401).json({ error: "Authorization required" });
      }

      // Check if we should use the external API
      if (apiConfig.useExternalApi) {
        try {
          console.log(`[API] Creating user with email: ${email} and role: ${role_name}`);
          
          // Call the external API to create the user
          const data = await callExternalApi('/users', 'POST', req.body);
          return res.status(201).json(data);
        } catch (error) {
          console.error('[API] Error creating user:', error);
          return res.status(500).json({ 
            success: false, 
            message: "Failed to create user via external API" 
          });
        }
      } else {
        // For testing without external API
        console.log('[DEBUG] External API is disabled, returning mock success');
        return res.status(201).json({
          success: true,
          user: {
            id: Date.now(),
            email,
            name: email.split('@')[0],
            role_name,
            created_at: new Date().toISOString()
          }
        });
      }
    } catch (error) {
      next(error);
    }
  });
  
  // External API login endpoint
  app.post("/api/v1/login", async (req, res, next) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      
      // Check if we should use the external API
      if (apiConfig.useExternalApi) {
        try {
          console.log('[API] Using external API for login');
          
          // Call the external API login endpoint
          const loginData = await loginToExternalApi(email, password);
          
          return res.status(200).json(loginData);
        } catch (error) {
          console.error('[API] Error logging in through external API:', error);
          return res.status(401).json({ error: "Invalid credentials" });
        }
      } else {
        console.log('[API] Using local authentication');
        // For local authentication, pass to the next route handler
        next();
      }
    } catch (error) {
      next(error);
    }
  });
  
  // API endpoint for admin orders
  app.get("/api/v1/admin/orders", async (req, res, next) => {
    try {
      // Check if we should use the external API
      if (apiConfig.useExternalApi) {
        try {
          console.log('[API] Using external API for admin orders');
          
          // Call the external API using our generic function
          const data = await callExternalApi('/admin/orders', 'GET');
          return res.json(data);
        } catch (error) {
          console.error('[API] Error getting external admin orders, falling back to mock data:', error);
          // Fall back to mock data if external API fails
        }
      }
      
      console.log("[DEBUG] Serving mock admin orders data");
      // Return mock data for orders management
      res.json({
        "success": true,
        "count": 25,
        "orders": [
          {
            "id": 1,
            "orderNumber": "SHP-10001",
            "awbNumber": "FDX8376541285",
            "userId": 1,
            "status": "delivered",
            "paymentStatus": "paid",
            "description": "Laptop shipment to Chicago office",
            "shipmentType": "Domestic",
            "carrier": "FedEx",
            "serviceType": "Express",
            "packageType": "Box",
            "packageWeight": 5.2,
            "packageLength": 45,
            "packageWidth": 35,
            "packageHeight": 10,
            "shippingDate": "2025-04-10T00:00:00.000Z",
            "senderId": 1,
            "recipientId": 2,
            "packageQuantity": 1,
            "basePrice": "45.00",
            "insurancePrice": "15.00",
            "additionalFees": "5.00",
            "tax": "6.50",
            "totalPrice": "71.50",
            "additionalServices": null,
            "createdAt": "2025-04-09T00:00:00.000Z",
            "updatedAt": "2025-04-11T00:00:00.000Z"
          },
          {
            "id": 2,
            "orderNumber": "SHP-10002",
            "awbNumber": "DHL9823754687",
            "userId": 1,
            "status": "in_transit",
            "paymentStatus": "paid",
            "description": "Marketing materials for conference",
            "shipmentType": "International",
            "carrier": "DHL",
            "serviceType": "Express",
            "packageType": "Box",
            "packageWeight": 8.5,
            "packageLength": 50,
            "packageWidth": 40,
            "packageHeight": 30,
            "shippingDate": "2025-04-15T00:00:00.000Z",
            "senderId": 1,
            "recipientId": 3,
            "packageQuantity": 1,
            "basePrice": "125.00",
            "insurancePrice": "25.00",
            "additionalFees": "15.00",
            "tax": "16.50",
            "totalPrice": "181.50",
            "additionalServices": null,
            "createdAt": "2025-04-14T00:00:00.000Z",
            "updatedAt": "2025-04-16T00:00:00.000Z"
          },
          {
            "id": 3,
            "orderNumber": "SHP-10003",
            "awbNumber": "SFE1234567890",
            "userId": 1,
            "status": "processing",
            "paymentStatus": "unpaid",
            "description": "Product samples to distributor",
            "shipmentType": "International",
            "carrier": "SF Express",
            "serviceType": "Standard",
            "packageType": "Box",
            "packageWeight": 12.3,
            "packageLength": 60,
            "packageWidth": 45,
            "packageHeight": 30,
            "shippingDate": "2025-04-20T00:00:00.000Z",
            "senderId": 1,
            "recipientId": 4,
            "packageQuantity": 2,
            "basePrice": "180.00",
            "insurancePrice": "50.00",
            "additionalFees": "20.00",
            "tax": "25.00",
            "totalPrice": "275.00",
            "additionalServices": null,
            "createdAt": "2025-04-19T00:00:00.000Z",
            "updatedAt": "2025-04-19T00:00:00.000Z"
          }
        ]
      });
    } catch (error) {
      next(error);
    }
  });
  
  // API endpoint for creating shipments
  app.post("/api/v1/shipments", async (req, res, next) => {
    try {
      // Check if we should use the external API
      if (apiConfig.useExternalApi) {
        try {
          console.log('[API] Using external API to create shipment');
          
          // Send auth token in header if available from client request
          const authHeader = req.headers.authorization;
          if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            console.log('[DEBUG] Using authorization token from request for creating shipment');
            (global as any).authToken = token;
          }
          
          // Call the external API using our generic function
          const data = await callExternalApi('/shipments', 'POST', req.body);
          return res.status(201).json(data);
        } catch (error) {
          console.error('[API] Error creating shipment in external API, falling back to mock data:', error);
          // Fall back to mock data if external API fails
        }
      }
      
      console.log("[DEBUG] Creating mock shipment");
      // Return mock response as provided
      res.status(201).json({
        "id": 32,
        "sender_address_id": 33,
        "receiver_address_id": 34,
        "tracking_number": null,
        "status": null,
        "provider_id": 1,
        "provider_service_id": 1,
        "estimated_delivery": null,
        "actual_delivery": null,
        "carrier_account": null,
        "created_at": "2025-04-21T15:22:38.848Z",
        "updated_at": "2025-04-21T15:22:38.848Z",
        "total_price": null,
        "packages": [
            {
                "id": 79,
                "shipment_id": 32,
                "carriage_value": 1200,
                "unit_of_weight": "kg_cm",
                "currency": "USD",
                "type_shipping": "items",
                "packaging": "box",
                "weight_total": 15,
                "volume_weight": 96,
                "created_at": "2025-04-21T15:22:39.045Z",
                "updated_at": "2025-04-21T15:22:39.434Z",
                "items": [
                    {
                        "id": 123,
                        "package_id": 79,
                        "weight": 15,
                        "length": 120,
                        "width": 80,
                        "height": 50,
                        "quantity": 1,
                        "description": "Furniture",
                        "value": 1200,
                        "country_of_origin": "VN",
                        "hs_code": "940350",
                        "package_tracking_number": null,
                        "created_at": "2025-04-21T15:22:39.198Z",
                        "updated_at": "2025-04-21T15:22:39.334Z",
                        "volume_weight": "96.0"
                    }
                ]
            }
        ],
        "sender_address": {
            "id": 33,
            "name": "Le Van C",
            "company": "Furniture Exports",
            "country_id": 1,
            "postal_code": "70000",
            "city": "Ho Chi Minh City",
            "state": "",
            "address1": "789 Cach Mang Thang 8",
            "address2": "District 3",
            "address3": "",
            "phone": "+84918765432",
            "email": "le@example.com",
            "address_type": null,
            "created_at": "2025-04-21T15:22:38.749Z",
            "updated_at": "2025-04-21T15:22:38.749Z"
        },
        "receiver_address": {
            "id": 34,
            "name": "Li Wei",
            "company": "",
            "country_id": 5,
            "postal_code": "018956",
            "city": "Singapore",
            "state": "",
            "address1": "10 Marina Boulevard",
            "address2": "#25-01",
            "address3": "",
            "phone": "+6591234567",
            "email": "li.wei@example.com",
            "address_type": null,
            "created_at": "2025-04-21T15:22:38.800Z",
            "updated_at": "2025-04-21T15:22:38.800Z"
        }
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Removed duplicate endpoint

  // Order endpoints
  app.get("/api/orders", isAuthenticated, async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      
      // If admin or manager, return all orders
      const orders = (userRole === 'admin' || userRole === 'manager') 
        ? await storage.getAllOrders()
        : await storage.getOrdersByUserId(userId!);
      
      res.json(orders);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req, res, next) => {
    try {
      const order = await storage.getOrder(Number(req.params.id));
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // If not admin and order doesn't belong to the user
      if (req.user?.role !== 'admin' && req.user?.role !== 'manager' && order.userId !== req.user?.id) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      
      res.json(order);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/orders", isAuthenticated, async (req, res, next) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      next(error);
    }
  });

  app.patch("/api/orders/:id/status", isAuthenticated, async (req, res, next) => {
    try {
      const orderId = Number(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // Only allow admins and managers to update status
      if (req.user?.role !== 'admin' && req.user?.role !== 'manager') {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      
      const schema = z.object({ status: z.string() });
      const { status } = schema.parse(req.body);
      
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      res.json(updatedOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      next(error);
    }
  });

  // Address endpoints
  app.post("/api/address", isAuthenticated, async (req, res, next) => {
    try {
      const addressData = insertAddressSchema.parse(req.body);
      const address = await storage.createAddress(addressData);
      res.status(201).json(address);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      next(error);
    }
  });

  app.get("/api/address/:id", isAuthenticated, async (req, res, next) => {
    try {
      const address = await storage.getAddress(Number(req.params.id));
      
      if (!address) {
        return res.status(404).json({ error: "Address not found" });
      }
      
      res.json(address);
    } catch (error) {
      next(error);
    }
  });

  // Payment endpoints
  app.post("/api/payments", isAuthenticated, async (req, res, next) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      
      // Verify order exists and the user has permission
      const order = await storage.getOrder(paymentData.orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // Only allow admins, managers, or the order owner to create payments
      if (req.user?.role !== 'admin' && req.user?.role !== 'manager' && order.userId !== req.user?.id) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      
      const payment = await storage.createPayment(paymentData);
      res.status(201).json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      next(error);
    }
  });

  app.get("/api/payments/order/:orderId", isAuthenticated, async (req, res, next) => {
    try {
      const orderId = Number(req.params.orderId);
      
      // Verify order exists and the user has permission
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // Only allow admins, managers, or the order owner to view payments
      if (req.user?.role !== 'admin' && req.user?.role !== 'manager' && order.userId !== req.user?.id) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      
      const payments = await storage.getPaymentsByOrderId(orderId);
      res.json(payments);
    } catch (error) {
      next(error);
    }
  });

  // Dashboard data endpoints
  app.get("/api/dashboard/recent-orders", isAuthenticated, async (req, res, next) => {
    try {
      // Only admins and managers can access dashboard data
      if (req.user?.role !== 'admin' && req.user?.role !== 'manager') {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      
      const limit = Number(req.query.limit) || 5;
      const orders = await storage.getRecentOrders(limit);
      res.json(orders);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/dashboard/stats", isAuthenticated, async (req, res, next) => {
    try {
      // Only admins and managers can access dashboard data
      if (req.user?.role !== 'admin' && req.user?.role !== 'manager') {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      
      const orderStats = await storage.getOrderStats();
      const revenueStats = await storage.getRevenueStats();
      
      res.json({
        orders: orderStats,
        revenue: revenueStats
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/dashboard/carrier-distribution", isAuthenticated, async (req, res, next) => {
    try {
      // Only admins and managers can access dashboard data
      if (req.user?.role !== 'admin' && req.user?.role !== 'manager') {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      
      const carriers = await storage.getCarrierDistribution();
      res.json({ carriers });
    } catch (error) {
      next(error);
    }
  });

  // User management endpoints
  app.get("/api/users", isAdmin, async (req, res, next) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  });

  // API proxy endpoint to handle CORS issues
  app.all("/api/proxy/:path(*)", async (req, res, next) => {
    try {
      const path = req.params.path;
      const method = req.method;
      const body = ['POST', 'PUT', 'PATCH'].includes(method) ? req.body : undefined;
      
      console.log(`[API Proxy] Proxying ${method} request to ${path}`);
      
      // Get auth token from request header
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        console.log('[API Proxy] Using authorization token from request');
        (global as any).authToken = token;
      } else {
        console.log('[API Proxy] No authorization token in request headers');
        delete (global as any).authToken;
      }
      
      try {
        // Call the external API through our server to avoid CORS
        const data = await callExternalApi(`/${path}`, method, body);
        return res.status(200).json(data);
      } catch (error: any) {
        console.error(`[API Proxy] Error calling external API for ${path}:`, error);
        return res.status(500).json({ 
          success: false, 
          message: `Failed to proxy request to external API: ${error?.message || 'Unknown error'}` 
        });
      }
    } catch (error) {
      next(error);
    }
  });
  
  // Role permissions endpoints
  app.get("/api/v1/roles/permissions_by_feature", async (req, res, next) => {
    try {
      // Extract role name from query parameter
      const roleName = req.query.role_name as string;
      console.log(`[DEBUG] Received role permissions request for: ${roleName}`);
      
      if (!roleName) {
        console.log('[DEBUG] No role_name provided in query');
        return res.status(400).json({ error: "role_name query parameter is required" });
      }
      
      // Get auth token from request header and make it available to the external API call
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        console.log(`[DEBUG] Using authorization token from request: ${token.substring(0, 10)}...`);
        // Store in global/thread-local variable to be used by apiCall
        (global as any).authToken = token;
      } else {
        console.log('[DEBUG] No authorization token in request headers');
        delete (global as any).authToken;
      }

      // Check if we should use the external API
      if (apiConfig.useExternalApi) {
        try {
          console.log(`[API] Getting permissions for role: ${roleName} from external API`);
          
          // Call the external API using our generic function
          const data = await callExternalApi(`/roles/permissions_by_feature?role_name=${roleName}`, 'GET');
          console.log(`[API] Successfully retrieved permissions for role: ${roleName}`);
          return res.json(data);
        } catch (error) {
          console.error('[API] Error getting role permissions:', error);
          
          // Return a more comprehensive mock permissions structure for debugging
          console.log('[DEBUG] Returning mock permissions data for debugging');
          
          // Create a more complete mock data structure with multiple modules and features
          const mockModules = {
            "Account Management": {
              module_id: 10,
              features: {
                "Create Account": {
                  feature_id: 17,
                  permissions: [
                    { id: 26, name: "create", action_name: "create" },
                    { id: 27, name: "read", action_name: "read" }
                  ]
                },
                "Admin Settings": {
                  feature_id: 18,
                  permissions: [
                    { id: 28, name: "read", action_name: "read" },
                    { id: 29, name: "update", action_name: "update" }
                  ]
                }
              }
            },
            "Shipment Management": {
              module_id: 11,
              features: {
                "Create Shipment": {
                  feature_id: 19,
                  permissions: [
                    { id: 30, name: "create", action_name: "create" },
                    { id: 31, name: "read", action_name: "read" }
                  ]
                },
                "Update Tracking": {
                  feature_id: 20,
                  permissions: [
                    { id: 32, name: "read", action_name: "read" },
                    { id: 33, name: "update", action_name: "update" }
                  ]
                }
              }
            }
          };
          
          return res.json({
            success: true,
            role: {
              id: roleName === "admin" ? 1 : 
                   roleName === "manager" ? 2 : 
                   roleName === "sales" ? 3 : 
                   roleName === "accounting" ? 4 : 5,
              name: roleName
            },
            modules: mockModules
          });
        }
      } else {
        console.log('[DEBUG] External API is disabled, cannot fetch role permissions');
        return res.status(501).json({ error: "Role permissions feature requires external API" });
      }
    } catch (error) {
      console.error('[DEBUG] Unexpected error in permissions endpoint:', error);
      next(error);
    }
  });

  // Role permissions update endpoint
  app.post("/api/v1/roles/update_permissions", async (req, res, next) => {
    try {
      // Extract role name and permissions from request body
      const { role_name, permissions } = req.body;
      if (!role_name || !permissions) {
        return res.status(400).json({ error: "role_name and permissions are required" });
      }
      
      // Get auth token from request header and make it available to the external API call
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        console.log(`[DEBUG] Using authorization token from request: ${token.substring(0, 10)}...`);
        // Store in global/thread-local variable to be used by apiCall
        (global as any).authToken = token;
      } else {
        console.log('[DEBUG] No authorization token in request headers');
        delete (global as any).authToken;
      }

      // Check if we should use the external API
      if (apiConfig.useExternalApi) {
        try {
          console.log(`[API] Updating permissions for role: ${role_name}`);
          
          // Call the external API using our generic function
          const data = await callExternalApi('/roles/update_permissions', 'POST', req.body);
          return res.json(data);
        } catch (error) {
          console.error('[API] Error updating role permissions:', error);
          return res.status(500).json({ error: "Failed to update role permissions in external API" });
        }
      } else {
        return res.status(501).json({ error: "Role permissions feature requires external API" });
      }
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}