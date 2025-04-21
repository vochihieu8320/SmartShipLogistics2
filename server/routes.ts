import { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertOrderSchema, insertPaymentSchema, insertAddressSchema } from "@shared/schema";
import { z } from "zod";
import {
  getAllCarrierRates,
  generateMockTrackingInfo,
  RateRequest,
  RateQuote,
  TrackingEvent
} from "./services/carrier-api";

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
      
      // Try to find by order number or AWB number
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
        trackingSteps
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
  
  // API endpoint for listing shipments (mock)
  app.get("/api/v1/shipments", (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}