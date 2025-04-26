import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { dbConfig, validateConfig } from './config';

// Setup websocket for Neon database
neonConfig.webSocketConstructor = ws;

// Validate critical configuration is present
validateConfig();

// Initialize database connection pool with config from environment variables
export const pool = new Pool({
  connectionString: dbConfig.connectionString,
  max: dbConfig.maxConnections,
  idleTimeoutMillis: dbConfig.idleTimeoutMs,
  ssl: dbConfig.ssl ? { rejectUnauthorized: false } : undefined
});

// Initialize and export Drizzle ORM instance
export const db = drizzle({ client: pool, schema });