import { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertOrderSchema, insertPaymentSchema, insertAddressSchema } from "@shared/schema";
import { z } from "zod";

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