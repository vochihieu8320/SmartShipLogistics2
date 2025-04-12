import { db, pool } from "../server/db";
import { users, address, orders, payments } from "../shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function main() {
  console.log("🌱 Seeding database...");

  try {
    // Clean up existing data
    await db.delete(payments);
    await db.delete(orders);
    await db.delete(address);
    await db.delete(users);

    console.log("Deleted existing data");

    // Create admin user
    const [adminUser] = await db.insert(users).values({
      username: "admin",
      password: await hashPassword("admin123"),
      email: "admin@smartship.com",
      fullName: "Admin User",
      role: "admin",
      createdAt: new Date()
    }).returning();
    
    console.log(`Created admin user: ${adminUser.username}`);

    // Create manager user
    const [managerUser] = await db.insert(users).values({
      username: "manager",
      password: await hashPassword("manager123"),
      email: "manager@smartship.com",
      fullName: "Manager User",
      role: "manager",
      createdAt: new Date()
    }).returning();
    
    console.log(`Created manager user: ${managerUser.username}`);

    // Create regular user
    const [regularUser] = await db.insert(users).values({
      username: "user",
      password: await hashPassword("user123"),
      email: "user@example.com",
      fullName: "Regular User",
      role: "user",
      createdAt: new Date()
    }).returning();
    
    console.log(`Created regular user: ${regularUser.username}`);

    // Create sender addresses
    const [senderAddress1] = await db.insert(address).values({
      name: "SmartShip Logistics",
      company: "SmartShip Inc.",
      email: "shipping@smartship.com",
      phone: "+1 (555) 123-4567",
      streetAddress: "123 Shipping Street",
      city: "Logistics City",
      postalCode: "LS1 2AB",
      country: "United States"
    }).returning();
    
    const [senderAddress2] = await db.insert(address).values({
      name: "Regular User",
      email: "user@example.com",
      phone: "+1 (555) 987-6543",
      company: null,
      streetAddress: "456 Sender Drive",
      city: "New York",
      postalCode: "10001",
      country: "United States"
    }).returning();

    console.log(`Created sender addresses`);

    // Create recipient addresses
    const [recipientAddress1] = await db.insert(address).values({
      name: "John Recipient",
      email: "john@example.com",
      phone: "+1 (555) 123-0000",
      company: "Tech Corp",
      streetAddress: "789 Receiver Lane",
      city: "San Francisco",
      postalCode: "94105",
      country: "United States"
    }).returning();
    
    const [recipientAddress2] = await db.insert(address).values({
      name: "Jane Recipient",
      email: "jane@example.com",
      phone: "+1 (555) 555-5555",
      company: null,
      streetAddress: "101 Recipient Avenue",
      city: "Los Angeles",
      postalCode: "90001",
      country: "United States"
    }).returning();
    
    const [recipientAddress3] = await db.insert(address).values({
      name: "Robert Recipient",
      email: "robert@example.com",
      phone: "+1 (555) 777-7777",
      company: "Global Traders Inc.",
      streetAddress: "202 International Blvd",
      city: "Chicago",
      postalCode: "60007",
      country: "United States"
    }).returning();

    console.log(`Created recipient addresses`);

    // Create orders
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Create a delivered order
    const [deliveredOrder] = await db.insert(orders).values({
      orderNumber: "ORD123456",
      awbNumber: "AWB123456",
      userId: regularUser.id,
      shipmentType: "parcel",
      carrier: "fedex",
      serviceType: "express",
      packageType: "medium_box",
      packageWeight: 5.5,
      packageLength: 30,
      packageWidth: 20,
      packageHeight: 15,
      packageQuantity: 1,
      shippingDate: lastWeek,
      status: "delivered",
      paymentStatus: "paid",
      basePrice: "65.50",
      insurancePrice: "5.00",
      additionalFees: "3.00",
      tax: "2.00",
      totalPrice: "75.50",
      senderId: senderAddress2.id,
      recipientId: recipientAddress1.id,
      description: "Electronics parts",
      declaredValue: 500,
      createdAt: lastWeek,
      updatedAt: yesterday
    }).returning();
    
    console.log(`Created delivered order: ${deliveredOrder.orderNumber}`);

    // Create an in-transit order
    const [transitOrder] = await db.insert(orders).values({
      orderNumber: "ORD234567",
      awbNumber: "AWB234567",
      userId: regularUser.id,
      shipmentType: "document",
      carrier: "dhl",
      serviceType: "standard",
      packageType: "envelope",
      packageWeight: 0.5,
      packageLength: 30,
      packageWidth: 21,
      packageHeight: 1,
      packageQuantity: 1,
      shippingDate: yesterday,
      status: "in_transit",
      paymentStatus: "paid",
      basePrice: "20.00",
      insurancePrice: "2.00",
      additionalFees: "1.00",
      tax: "2.00",
      totalPrice: "25.00",
      senderId: senderAddress2.id,
      recipientId: recipientAddress2.id,
      description: "Legal documents",
      declaredValue: 100,
      createdAt: yesterday,
      updatedAt: today
    }).returning();
    
    console.log(`Created in-transit order: ${transitOrder.orderNumber}`);

    // Create a processing order
    const [processingOrder] = await db.insert(orders).values({
      orderNumber: "ORD345678",
      awbNumber: "AWB345678",
      userId: regularUser.id,
      shipmentType: "heavy_freight",
      carrier: "sf_express",
      serviceType: "economy",
      packageType: "pallet",
      packageWeight: 120,
      packageLength: 100,
      packageWidth: 100,
      packageHeight: 100,
      packageQuantity: 1,
      shippingDate: nextWeek,
      status: "processing",
      paymentStatus: "unpaid",
      basePrice: "300.00",
      insurancePrice: "25.00",
      additionalFees: "15.00",
      tax: "10.00",
      totalPrice: "350.00",
      senderId: senderAddress2.id,
      recipientId: recipientAddress3.id,
      description: "Manufacturing equipment",
      declaredValue: 5000,
      createdAt: today,
      updatedAt: today
    }).returning();
    
    console.log(`Created processing order: ${processingOrder.orderNumber}`);

    // Create a few more orders for the admin dashboard
    for (let i = 0; i < 5; i++) {
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30));
      
      const totalPrice = (Math.floor(Math.random() * 500) + 20).toString();
      const basePrice = (Math.floor(parseInt(totalPrice) * 0.8)).toString();
      const insurancePrice = (Math.floor(parseInt(totalPrice) * 0.1)).toString();
      const additionalFees = (Math.floor(parseInt(totalPrice) * 0.05)).toString();
      const tax = (parseInt(totalPrice) - parseInt(basePrice) - parseInt(insurancePrice) - parseInt(additionalFees)).toString();
      
      const [order] = await db.insert(orders).values({
        orderNumber: `ORD${400000 + i}`,
        awbNumber: `AWB${400000 + i}`,
        userId: adminUser.id,
        shipmentType: ["parcel", "document", "heavy_freight"][Math.floor(Math.random() * 3)],
        carrier: ["fedex", "dhl", "sf_express", "ups", "usps"][Math.floor(Math.random() * 5)],
        serviceType: ["standard", "express", "priority", "economy"][Math.floor(Math.random() * 4)],
        packageType: ["envelope", "small_box", "medium_box", "large_box", "pallet"][Math.floor(Math.random() * 5)],
        packageWeight: Math.floor(Math.random() * 100) + 0.5,
        packageLength: Math.floor(Math.random() * 100) + 10,
        packageWidth: Math.floor(Math.random() * 100) + 10,
        packageHeight: Math.floor(Math.random() * 100) + 1,
        packageQuantity: Math.floor(Math.random() * 5) + 1,
        shippingDate: new Date(orderDate),
        status: ["processing", "in_transit", "delivered"][Math.floor(Math.random() * 3)],
        paymentStatus: ["paid", "unpaid"][Math.floor(Math.random() * 2)],
        basePrice,
        insurancePrice, 
        additionalFees,
        tax,
        totalPrice,
        senderId: senderAddress1.id,
        recipientId: [recipientAddress1.id, recipientAddress2.id, recipientAddress3.id][Math.floor(Math.random() * 3)],
        description: ["Electronic parts", "Documents", "Clothing", "Books", "Office supplies"][Math.floor(Math.random() * 5)],
        declaredValue: Math.floor(Math.random() * 1000) + 50,
        createdAt: orderDate,
        updatedAt: orderDate
      }).returning();
      
      console.log(`Created additional order: ${order.orderNumber}`);
    }

    // Create payments
    await db.insert(payments).values({
      orderId: deliveredOrder.id,
      amount: deliveredOrder.totalPrice,
      paymentMethod: "credit_card",
      reference: "PAY123456",
      paymentDate: yesterday,
      createdAt: yesterday
    });

    await db.insert(payments).values({
      orderId: transitOrder.id,
      amount: transitOrder.totalPrice,
      paymentMethod: "paypal",
      reference: "PAY234567",
      paymentDate: yesterday,
      createdAt: yesterday
    });

    console.log("Created payments");
    console.log("✅ Seed completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await pool.end();
  }
}

main();