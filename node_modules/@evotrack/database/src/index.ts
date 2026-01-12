import { Pool } from 'pg';

// Singleton Pool
const pool = new Pool({
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

export const db = {
    query: (text: string, params?: any[]) => pool.query(text, params),
    getClient: () => pool.connect(),
};

// Mock Schema for documentation/planning checks
export const Schema = `
  CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY,
    api_key TEXT NOT NULL,
    domain TEXT
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    vendor_id UUID NOT NULL,
    status TEXT NOT NULL,
    pickup_lat DOUBLE PRECISION,
    pickup_lng DOUBLE PRECISION,
    dropoff_lat DOUBLE PRECISION,
    dropoff_lng DOUBLE PRECISION,
    delivery_agent_id TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS location_history (
    order_id TEXT NOT NULL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    speed DOUBLE PRECISION,
    timestamp BIGINT,
    PRIMARY KEY (order_id, timestamp)
  );
`;
