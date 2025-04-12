import { 
  users, User, InsertUser, 
  address, Address, InsertAddress,
  orders, Order, InsertOrder,
  payments, Payment, InsertPayment,
  UserRole, OrderStatus, PaymentStatus, Carriers, ShipmentTypes, ServiceTypes, PackageTypes
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private addresses: Map<number, Address>;
  private orders: Map<number, Order>;
  private payments: Map<number, Payment>;
  
  currentUserId: number;
  currentAddressId: number;
  currentOrderId: number;
  currentPaymentId: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.addresses = new Map();
    this.orders = new Map();
    this.payments = new Map();
    
    this.currentUserId = 1;
    this.currentAddressId = 1;
    this.currentOrderId = 1;
    this.currentPaymentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Add sample admin user for testing (with scrypt format password)
    this.createUser({
      username: "admin",
      // This is "password" hashed with our scrypt function
      password: "c98d24f4953776ea5a0e7afa2f9e45029f82e7da2e97c241c4bc4092346ab48db8abe0c11ed2e7afdab08c22dae7ccdbb61d85e0c753d002a2e42e555a9a897e.6b71b0aca2e59a9b379ba88c858752f6", 
      email: "admin@smartshippro.com",
      fullName: "Admin User",
      role: UserRole.ADMIN
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  // Address methods
  async createAddress(insertAddress: InsertAddress): Promise<Address> {
    const id = this.currentAddressId++;
    const address: Address = { ...insertAddress, id };
    this.addresses.set(id, address);
    return address;
  }
  
  async getAddress(id: number): Promise<Address | undefined> {
    return this.addresses.get(id);
  }
  
  // Order methods
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const orderNumber = `SS-${String(id).padStart(5, '0')}`;
    const awbNumber = `AWB-${Math.floor(Math.random() * 100000000)}`;
    
    const order: Order = { 
      ...insertOrder, 
      id, 
      orderNumber, 
      awbNumber, 
      createdAt, 
      updatedAt 
    };
    
    this.orders.set(id, order);
    return order;
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    return Array.from(this.orders.values()).find(
      (order) => order.orderNumber === orderNumber,
    );
  }
  
  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }
  
  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId,
    );
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { 
      ...order, 
      status, 
      updatedAt: new Date() 
    };
    
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  // Payment methods
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.currentPaymentId++;
    const createdAt = new Date();
    
    const payment: Payment = { 
      ...insertPayment, 
      id, 
      createdAt 
    };
    
    this.payments.set(id, payment);
    
    // Update order payment status
    const order = await this.getOrder(insertPayment.orderId);
    if (order) {
      // Calculate total paid for this order
      const orderPayments = await this.getPaymentsByOrderId(order.id);
      const totalPaid = orderPayments.reduce((sum, payment) => sum + Number(payment.amount), Number(insertPayment.amount));
      
      let paymentStatus = PaymentStatus.UNPAID;
      if (totalPaid >= Number(order.totalPrice)) {
        paymentStatus = PaymentStatus.PAID;
      } else if (totalPaid > 0) {
        paymentStatus = PaymentStatus.PARTIAL;
      }
      
      const updatedOrder = { 
        ...order, 
        paymentStatus, 
        updatedAt: new Date() 
      };
      
      this.orders.set(order.id, updatedOrder);
    }
    
    return payment;
  }
  
  async getPaymentsByOrderId(orderId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      (payment) => payment.orderId === orderId,
    );
  }
  
  async getPaymentsByUserId(userId: number): Promise<Payment[]> {
    const userOrders = await this.getOrdersByUserId(userId);
    const orderIds = userOrders.map(order => order.id);
    
    return Array.from(this.payments.values()).filter(
      (payment) => orderIds.includes(payment.orderId),
    );
  }
  
  // Dashboard statistics methods
  async getRecentOrders(limit: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
  
  async getOrderStats(): Promise<{ total: number, processing: number, delivered: number, returned: number }> {
    const allOrders = Array.from(this.orders.values());
    
    return {
      total: allOrders.length,
      processing: allOrders.filter(order => order.status === OrderStatus.PROCESSING).length,
      delivered: allOrders.filter(order => order.status === OrderStatus.DELIVERED).length,
      returned: allOrders.filter(order => order.status === OrderStatus.RETURNED).length
    };
  }
  
  async getRevenueStats(): Promise<{ total: number, paid: number, unpaid: number }> {
    const allOrders = Array.from(this.orders.values());
    const totalRevenue = allOrders.reduce((sum, order) => sum + Number(order.totalPrice), 0);
    const paidRevenue = allOrders
      .filter(order => order.paymentStatus === PaymentStatus.PAID)
      .reduce((sum, order) => sum + Number(order.totalPrice), 0);
    
    return {
      total: totalRevenue,
      paid: paidRevenue,
      unpaid: totalRevenue - paidRevenue
    };
  }
  
  async getCarrierDistribution(): Promise<{ carrier: string, count: number }[]> {
    const allOrders = Array.from(this.orders.values());
    const carriers: Record<string, number> = {};
    
    for (const order of allOrders) {
      carriers[order.carrier] = (carriers[order.carrier] || 0) + 1;
    }
    
    return Object.entries(carriers).map(([carrier, count]) => ({ carrier, count }));
  }
}

export const storage = new MemStorage();
