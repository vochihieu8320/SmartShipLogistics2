import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { storageConfig, validateConfig } from './config';

// Validate critical configuration is present
validateConfig();

// Setup Postgres connection only if we're using it
export let pool: Pool | undefined = undefined;
export let db: any = undefined;

// Only initialize PostgreSQL if it's configured
if (storageConfig.type === 'postgres' && storageConfig.connectionString) {
  // Setup websocket for Neon database
  neonConfig.webSocketConstructor = ws;
  
  // Initialize database connection pool with config from environment variables
  pool = new Pool({
    connectionString: storageConfig.connectionString,
    max: storageConfig.maxConnections,
    idleTimeoutMillis: storageConfig.idleTimeoutMs,
    ssl: storageConfig.ssl ? { rejectUnauthorized: false } : undefined
  });
  
  // Initialize Drizzle ORM instance
  db = drizzle({ client: pool, schema });
}