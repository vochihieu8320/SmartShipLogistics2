import { users, type User, type InsertUser, address, orders, payments, type Address, type InsertAddress, type Order, type InsertOrder, type Payment, type InsertPayment } from "@shared/schema";
import { db } from "./db";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { eq, desc } from "drizzle-orm";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Address methods
  createAddress(address: InsertAddress): Promise<Address>;
  getAddress(id: number): Promise<Address | undefined>;
  
  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Payment methods
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByOrderId(orderId: number): Promise<Payment[]>;
  getPaymentsByUserId(userId: number): Promise<Payment[]>;

  // Dashboard data
  getRecentOrders(limit: number): Promise<Order[]>;
  getOrderStats(): Promise<{ total: number, processing: number, delivered: number, returned: number }>;
  getRevenueStats(): Promise<{ total: number, paid: number, unpaid: number }>;
  getCarrierDistribution(): Promise<{ carrier: string, count: number }[]>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Initialize session store with PostgreSQL
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      // Use tableName from env var if available, otherwise use default
      tableName: process.env.SESSION_TABLE_NAME || 'session'
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createAddress(insertAddress: InsertAddress): Promise<Address> {
    const [addressRecord] = await db.insert(address).values(insertAddress).returning();
    return addressRecord;
  }

  async getAddress(id: number): Promise<Address | undefined> {
    const [addressRecord] = await db.select().from(address).where(eq(address.id, id));
    return addressRecord;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
    return order;
  }

  async getAllOrders(): Promise<Order[]> {
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(insertPayment).returning();
    return payment;
  }

  async getPaymentsByOrderId(orderId: number): Promise<Payment[]> {
    return db.select().from(payments).where(eq(payments.orderId, orderId)).orderBy(desc(payments.createdAt));
  }

  async getPaymentsByUserId(userId: number): Promise<Payment[]> {
    const userOrders = await this.getOrdersByUserId(userId);
    const orderIds = userOrders.map(order => order.id);
    
    if (orderIds.length === 0) return [];
    
    return db.select()
      .from(payments)
      .where(payments.orderId.in(orderIds))
      .orderBy(desc(payments.createdAt));
  }

  async getRecentOrders(limit: number): Promise<Order[]> {
    return db.select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(limit);
  }

  async getOrderStats(): Promise<{ total: number, processing: number, delivered: number, returned: number }> {
    const allOrders = await this.getAllOrders();
    const total = allOrders.length;
    const processing = allOrders.filter(o => o.status === 'processing').length;
    const delivered = allOrders.filter(o => o.status === 'delivered').length;
    const returned = allOrders.filter(o => o.status === 'returned').length;
    
    return { total, processing, delivered, returned };
  }

  async getRevenueStats(): Promise<{ total: number, paid: number, unpaid: number }> {
    const allOrders = await this.getAllOrders();
    
    const total = allOrders.reduce((sum, order) => sum + Number(order.totalPrice), 0);
    const paid = allOrders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, order) => sum + Number(order.totalPrice), 0);
    const unpaid = total - paid;
    
    return { total, paid, unpaid };
  }

  async getCarrierDistribution(): Promise<{ carrier: string, count: number }[]> {
    const allOrders = await this.getAllOrders();
    const carrierMap = new Map<string, number>();
    
    allOrders.forEach(order => {
      const count = carrierMap.get(order.carrier) || 0;
      carrierMap.set(order.carrier, count + 1);
    });
    
    return Array.from(carrierMap.entries()).map(([carrier, count]) => ({ carrier, count }));
  }
}

export const storage = new DatabaseStorage();