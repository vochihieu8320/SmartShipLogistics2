import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Setup websocket for Neon database
neonConfig.webSocketConstructor = ws;

// Validate environment variable is present
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Initialize database connection pool
const getDatabaseConfig = () => {
  return {
    connectionString: process.env.DATABASE_URL,
  };
};

// Export database connection
export const pool = new Pool(getDatabaseConfig());
export const db = drizzle({ client: pool, schema });