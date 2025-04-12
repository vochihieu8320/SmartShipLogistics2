import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertAddressSchema, 
  insertOrderSchema, 
  insertPaymentSchema,
  UserRole
} from "@shared/schema";

// Middleware to check for admin role
const isAdmin = (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  if (req.user?.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: "Forbidden - Admin access required" });
  }
  next();
};

// Middleware to check for admin or manager role
const isManagerOrAdmin = (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  if (req.user?.role !== UserRole.ADMIN && req.user?.role !== UserRole.MANAGER) {
    return res.status(403).json({ error: "Forbidden - Manager or Admin access required" });
  }
  next();
};

export function registerRoutes(app: Express): Server {
  // Set up authentication routes
  setupAuth(app);
  
  // Users Management (Admin only)
  app.get("/api/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  
  // Orders API
  app.post("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      // Create sender address
      const senderData = {
        name: req.body.senderName,
        company: req.body.senderCompany,
        phone: req.body.senderPhone,
        email: req.body.senderEmail,
        streetAddress: req.body.senderStreetAddress,
        city: req.body.senderCity,
        postalCode: req.body.senderPostalCode,
        country: req.body.senderCountry
      };
      const parsedSenderData = insertAddressSchema.parse(senderData);
      const sender = await storage.createAddress(parsedSenderData);
      
      // Create recipient address
      const recipientData = {
        name: req.body.recipientName,
        company: req.body.recipientCompany,
        phone: req.body.recipientPhone,
        email: req.body.recipientEmail,
        streetAddress: req.body.recipientStreetAddress,
        city: req.body.recipientCity,
        postalCode: req.body.recipientPostalCode,
        country: req.body.recipientCountry
      };
      const parsedRecipientData = insertAddressSchema.parse(recipientData);
      const recipient = await storage.createAddress(parsedRecipientData);
      
      // Calculate pricing - mock implementation
      const basePrice = Number(req.body.packageWeight) * 10;
      const insurancePrice = req.body.insurance ? (Number(req.body.declaredValue) * 0.05) : 0;
      const additionalFees = (req.body.signatureRequired ? 5 : 0) + (req.body.saturdayDelivery ? 10 : 0);
      const tax = (basePrice + insurancePrice + additionalFees) * 0.1;
      const totalPrice = basePrice + insurancePrice + additionalFees + tax;
      
      // Create additional services object
      const additionalServices = {
        insurance: req.body.insurance || false,
        signatureRequired: req.body.signatureRequired || false,
        saturdayDelivery: req.body.saturdayDelivery || false
      };
      
      // Create order
      const orderData = {
        userId: req.user.id,
        shipmentType: req.body.shipmentType,
        carrier: req.body.carrier,
        serviceType: req.body.serviceType,
        shippingDate: new Date(req.body.shippingDate),
        senderId: sender.id,
        recipientId: recipient.id,
        packageWeight: req.body.packageWeight,
        packageLength: req.body.packageLength,
        packageWidth: req.body.packageWidth,
        packageHeight: req.body.packageHeight,
        packageType: req.body.packageType,
        packageQuantity: req.body.packageQuantity,
        description: req.body.description,
        declaredValue: req.body.declaredValue,
        basePrice,
        insurancePrice,
        additionalFees,
        tax,
        totalPrice,
        additionalServices
      };
      
      const parsedOrderData = insertOrderSchema.parse(orderData);
      const order = await storage.createOrder(parsedOrderData);
      
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(400).json({ error: "Failed to create order", details: error.message });
    }
  });
  
  app.get("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      let orders;
      // Admin and manager can see all orders, staff can only see their own
      if (req.user.role === UserRole.ADMIN || req.user.role === UserRole.MANAGER) {
        orders = await storage.getAllOrders();
      } else {
        orders = await storage.getOrdersByUserId(req.user.id);
      }
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });
  
  app.get("/api/orders/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const order = await storage.getOrder(parseInt(req.params.id));
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // Staff users can only view their own orders
      if (req.user.role === UserRole.STAFF && order.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });
  
  app.patch("/api/orders/:id/status", isManagerOrAdmin, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      if (!updatedOrder) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ error: "Failed to update order status" });
    }
  });
  
  // Payments API
  app.post("/api/payments", isManagerOrAdmin, async (req, res) => {
    try {
      const paymentData = {
        orderId: req.body.orderId,
        amount: req.body.amount,
        paymentDate: req.body.paymentDate ? new Date(req.body.paymentDate) : new Date(),
        paymentMethod: req.body.paymentMethod,
        reference: req.body.reference
      };
      
      const parsedPaymentData = insertPaymentSchema.parse(paymentData);
      const payment = await storage.createPayment(parsedPaymentData);
      
      res.status(201).json(payment);
    } catch (error) {
      res.status(400).json({ error: "Failed to create payment", details: error.message });
    }
  });
  
  app.get("/api/payments/order/:orderId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const orderId = parseInt(req.params.orderId);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // Staff users can only view payments for their own orders
      if (req.user.role === UserRole.STAFF && order.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const payments = await storage.getPaymentsByOrderId(orderId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });
  
  // Dashboard statistics API
  app.get("/api/dashboard/recent-orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const recentOrders = await storage.getRecentOrders(limit);
      
      // Staff users should only see their own orders
      if (req.user.role === UserRole.STAFF) {
        const filteredOrders = recentOrders.filter(order => order.userId === req.user.id);
        return res.json(filteredOrders);
      }
      
      res.json(recentOrders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent orders" });
    }
  });
  
  app.get("/api/dashboard/stats", isManagerOrAdmin, async (req, res) => {
    try {
      const orderStats = await storage.getOrderStats();
      const revenueStats = await storage.getRevenueStats();
      const carrierDistribution = await storage.getCarrierDistribution();
      
      res.json({
        orders: orderStats,
        revenue: revenueStats,
        carriers: carrierDistribution
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard statistics" });
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
