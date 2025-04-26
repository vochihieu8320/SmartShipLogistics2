import { users, type User, type InsertUser, address, orders, payments, type Address, type InsertAddress, type Order, type InsertOrder, type Payment, type InsertPayment } from "@shared/schema";
import { db, pool } from "./db";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { eq, desc, sql } from "drizzle-orm";
import { sessionConfig, storageConfig } from './config';
import createMemoryStore from "memorystore";

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
    // Initialize session store with PostgreSQL using centralized config
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
      tableName: sessionConfig.tableName,
      // PostgreSQL prune configuration
      pruneSessionInterval: 60 * 15 // Prune expired sessions every 15 minutes
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
    
    // For Postgres storage - use Drizzle's query builder
    if (storageConfig.type === 'postgres' && db) {
      return db.select()
        .from(payments)
        .where(sql`${payments.orderId} IN (${sql.join(orderIds, sql`, `)})`)
        .orderBy(desc(payments.createdAt));
    }
    
    // Otherwise return empty array (will be populated in MemStorage implementation)
    return [];
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

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: User[] = [];
  private addresses: Address[] = [];
  private orderList: Order[] = [];
  private paymentList: Payment[] = [];
  sessionStore: session.Store;
  
  private lastUserId = 0;
  private lastAddressId = 0;
  private lastOrderId = 0;
  private lastPaymentId = 0;

  constructor() {
    // Initialize in-memory session store
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async getAllUsers(): Promise<User[]> {
    return [...this.users];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = ++this.lastUserId;
    const createdAt = new Date();
    // Ensure role is always a string (default to 'user' if not provided)
    const role = insertUser.role || 'user';
    const user: User = { 
      id, 
      createdAt, 
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email,
      fullName: insertUser.fullName,
      role: role
    };
    this.users.push(user);
    return user;
  }

  async createAddress(insertAddress: InsertAddress): Promise<Address> {
    const id = ++this.lastAddressId;
    // Ensure company is always string | null (default to null if not provided)
    const company = insertAddress.company || null;
    const address: Address = { 
      id, 
      email: insertAddress.email,
      name: insertAddress.name,
      company,
      phone: insertAddress.phone,
      streetAddress: insertAddress.streetAddress,
      city: insertAddress.city,
      postalCode: insertAddress.postalCode,
      country: insertAddress.country
    };
    this.addresses.push(address);
    return address;
  }

  async getAddress(id: number): Promise<Address | undefined> {
    return this.addresses.find(addr => addr.id === id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = ++this.lastOrderId;
    const createdAt = new Date();
    const updatedAt = createdAt;
    
    // Generate orderNumber and awbNumber
    const orderNumber = `ORD-${Date.now()}-${id}`;
    const awbNumber = `AWB-${Date.now()}-${id}`;
    
    // Use defaults for optional fields
    const status = insertOrder.status || 'processing';
    const paymentStatus = insertOrder.paymentStatus || 'unpaid';
    const packageQuantity = insertOrder.packageQuantity || 1;
    const declaredValue = insertOrder.declaredValue || "0";
    const insurancePrice = insertOrder.insurancePrice || "0";
    const additionalFees = insertOrder.additionalFees || "0";
    const tax = insertOrder.tax || "0";
    const description = insertOrder.description || "";
    const additionalServices = insertOrder.additionalServices || null;
    
    // Create complete order object with all required fields
    const order: Order = {
      id,
      createdAt,
      updatedAt,
      orderNumber,
      awbNumber,
      userId: insertOrder.userId,
      shipmentType: insertOrder.shipmentType,
      carrier: insertOrder.carrier,
      serviceType: insertOrder.serviceType,
      shippingDate: insertOrder.shippingDate,
      status,
      paymentStatus,
      senderId: insertOrder.senderId,
      recipientId: insertOrder.recipientId,
      packageWeight: insertOrder.packageWeight,
      packageLength: insertOrder.packageLength,
      packageWidth: insertOrder.packageWidth,
      packageHeight: insertOrder.packageHeight,
      packageType: insertOrder.packageType,
      packageQuantity,
      description,
      declaredValue,
      basePrice: insertOrder.basePrice,
      insurancePrice,
      additionalFees,
      tax,
      totalPrice: insertOrder.totalPrice,
      additionalServices
    };
    
    this.orderList.push(order);
    return order;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orderList.find(order => order.id === id);
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    return this.orderList.find(order => order.orderNumber === orderNumber);
  }

  async getAllOrders(): Promise<Order[]> {
    return [...this.orderList].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return this.orderList
      .filter(order => order.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = await this.getOrder(id);
    if (!order) return undefined;
    
    order.status = status;
    order.updatedAt = new Date();
    return order;
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = ++this.lastPaymentId;
    const createdAt = new Date();
    
    // Ensure required fields are always present
    const paymentDate = insertPayment.paymentDate || new Date();
    const reference = insertPayment.reference || null;
    
    const payment: Payment = { 
      id, 
      createdAt,
      orderId: insertPayment.orderId,
      amount: insertPayment.amount,
      paymentDate,
      paymentMethod: insertPayment.paymentMethod,
      reference
    };
    
    this.paymentList.push(payment);
    return payment;
  }

  async getPaymentsByOrderId(orderId: number): Promise<Payment[]> {
    return this.paymentList
      .filter(payment => payment.orderId === orderId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPaymentsByUserId(userId: number): Promise<Payment[]> {
    const userOrders = await this.getOrdersByUserId(userId);
    const orderIds = userOrders.map(order => order.id);
    
    return this.paymentList
      .filter(payment => orderIds.includes(payment.orderId))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getRecentOrders(limit: number): Promise<Order[]> {
    return [...this.orderList]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getOrderStats(): Promise<{ total: number, processing: number, delivered: number, returned: number }> {
    const allOrders = this.orderList;
    const total = allOrders.length;
    const processing = allOrders.filter(o => o.status === 'processing').length;
    const delivered = allOrders.filter(o => o.status === 'delivered').length;
    const returned = allOrders.filter(o => o.status === 'returned').length;
    
    return { total, processing, delivered, returned };
  }

  async getRevenueStats(): Promise<{ total: number, paid: number, unpaid: number }> {
    const allOrders = this.orderList;
    
    const total = allOrders.reduce((sum, order) => sum + Number(order.totalPrice), 0);
    const paid = allOrders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, order) => sum + Number(order.totalPrice), 0);
    const unpaid = total - paid;
    
    return { total, paid, unpaid };
  }

  async getCarrierDistribution(): Promise<{ carrier: string, count: number }[]> {
    const allOrders = this.orderList;
    const carrierMap = new Map<string, number>();
    
    allOrders.forEach(order => {
      const count = carrierMap.get(order.carrier) || 0;
      carrierMap.set(order.carrier, count + 1);
    });
    
    return Array.from(carrierMap.entries()).map(([carrier, count]) => ({ carrier, count }));
  }
}

// Create the appropriate storage implementation based on configuration
export const storage = storageConfig.type === 'postgres' && pool && db 
  ? new DatabaseStorage() 
  : new MemStorage();