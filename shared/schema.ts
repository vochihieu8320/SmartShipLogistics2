import { pgTable, text, serial, integer, boolean, timestamp, real, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Role Enum
export const UserRole = {
  ADMIN: "admin",
  MANAGER: "manager",
  STAFF: "staff",
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// Order Status Enum
export const OrderStatus = {
  PROCESSING: "processing",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
  RETURNED: "returned",
  CANCELLED: "cancelled",
} as const;

export type OrderStatusType = typeof OrderStatus[keyof typeof OrderStatus];

// Payment Status Enum
export const PaymentStatus = {
  PAID: "paid",
  UNPAID: "unpaid",
  PARTIAL: "partial",
  OVERDUE: "overdue",
} as const;

export type PaymentStatusType = typeof PaymentStatus[keyof typeof PaymentStatus];

// Carrier Enum
export const Carriers = {
  UPS: "UPS",
  FEDEX: "FedEx",
  DHL: "DHL",
  SF_EXPRESS: "SF Express",
} as const;

export type CarrierType = typeof Carriers[keyof typeof Carriers];

// Shipment Type
export const ShipmentTypes = {
  DOMESTIC: "domestic",
  INTERNATIONAL: "international",
} as const;

export type ShipmentType = typeof ShipmentTypes[keyof typeof ShipmentTypes];

// Service Type
export const ServiceTypes = {
  STANDARD: "standard",
  EXPRESS: "express",
  NEXT_DAY: "next_day",
  ECONOMY: "economy",
} as const;

export type ServiceType = typeof ServiceTypes[keyof typeof ServiceTypes];

// Package Type
export const PackageTypes = {
  BOX: "box",
  ENVELOPE: "envelope",
  PALLET: "pallet",
  TUBE: "tube",
} as const;

export type PackageType = typeof PackageTypes[keyof typeof PackageTypes];

// Tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default(UserRole.STAFF),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const address = pgTable("address", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company"),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  streetAddress: text("street_address").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  userId: integer("user_id").notNull(),
  shipmentType: text("shipment_type").notNull(),
  carrier: text("carrier").notNull(),
  serviceType: text("service_type").notNull(),
  shippingDate: timestamp("shipping_date").notNull(),
  status: text("status").notNull().default(OrderStatus.PROCESSING),
  paymentStatus: text("payment_status").notNull().default(PaymentStatus.UNPAID),
  senderId: integer("sender_id").notNull(),
  recipientId: integer("recipient_id").notNull(),
  packageWeight: real("package_weight").notNull(),
  packageLength: real("package_length").notNull(),
  packageWidth: real("package_width").notNull(),
  packageHeight: real("package_height").notNull(),
  packageType: text("package_type").notNull(),
  packageQuantity: integer("package_quantity").notNull().default(1),
  description: text("description"),
  declaredValue: numeric("declared_value"),
  basePrice: numeric("base_price").notNull(),
  insurancePrice: numeric("insurance_price").default("0"),
  additionalFees: numeric("additional_fees").default("0"),
  tax: numeric("tax").default("0"),
  totalPrice: numeric("total_price").notNull(),
  awbNumber: text("awb_number"),
  additionalServices: jsonb("additional_services"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  amount: numeric("amount").notNull(),
  paymentDate: timestamp("payment_date").defaultNow().notNull(),
  paymentMethod: text("payment_method").notNull(),
  reference: text("reference"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod Schemas for Insert/Update
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertAddressSchema = createInsertSchema(address).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  orderNumber: true,
  awbNumber: true
});
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });

// Types for Insert/Select
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type Address = typeof address.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// Extended form schemas with additional validation
export const loginUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginCredentials = z.infer<typeof loginUserSchema>;

// Booking form extended schema
export const bookingFormSchema = z.object({
  shipmentType: z.string(),
  carrier: z.string(),
  serviceType: z.string(),
  shippingDate: z.string(),
  reference: z.string().optional(),
  
  // Sender details
  senderName: z.string().min(1, "Sender name is required"),
  senderCompany: z.string().optional(),
  senderPhone: z.string().min(1, "Sender phone is required"),
  senderEmail: z.string().email("Invalid email format"),
  senderStreetAddress: z.string().min(1, "Street address is required"),
  senderCity: z.string().min(1, "City is required"),
  senderPostalCode: z.string().min(1, "Postal code is required"),
  senderCountry: z.string().min(1, "Country is required"),
  
  // Recipient details
  recipientName: z.string().min(1, "Recipient name is required"),
  recipientCompany: z.string().optional(),
  recipientPhone: z.string().min(1, "Recipient phone is required"),
  recipientEmail: z.string().email("Invalid email format"),
  recipientStreetAddress: z.string().min(1, "Street address is required"),
  recipientCity: z.string().min(1, "City is required"),
  recipientPostalCode: z.string().min(1, "Postal code is required"),
  recipientCountry: z.string().min(1, "Country is required"),
  
  // Package details
  packageWeight: z.number().min(0.01, "Weight must be greater than 0"),
  packageLength: z.number().min(0.1, "Length must be greater than 0"),
  packageWidth: z.number().min(0.1, "Width must be greater than 0"),
  packageHeight: z.number().min(0.1, "Height must be greater than 0"),
  packageType: z.string(),
  packageQuantity: z.number().int().min(1, "At least one package is required"),
  description: z.string().optional(),
  declaredValue: z.number().min(0).optional(),
  
  // Additional services
  insurance: z.boolean().optional(),
  signatureRequired: z.boolean().optional(),
  saturdayDelivery: z.boolean().optional(),
  
  // Terms
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  }),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
