export declare const db: {
    query: (text: string, params?: any[]) => Promise<import("pg").QueryResult<any>>;
    getClient: () => Promise<import("pg").PoolClient>;
};
export declare const Schema = "\n  CREATE TABLE IF NOT EXISTS vendors (\n    id UUID PRIMARY KEY,\n    api_key TEXT NOT NULL,\n    domain TEXT\n  );\n\n  CREATE TABLE IF NOT EXISTS orders (\n    id TEXT PRIMARY KEY,\n    vendor_id UUID NOT NULL,\n    status TEXT NOT NULL,\n    pickup_lat DOUBLE PRECISION,\n    pickup_lng DOUBLE PRECISION,\n    dropoff_lat DOUBLE PRECISION,\n    dropoff_lng DOUBLE PRECISION,\n    delivery_agent_id TEXT,\n    created_at TIMESTAMP DEFAULT NOW()\n  );\n\n  CREATE TABLE IF NOT EXISTS location_history (\n    order_id TEXT NOT NULL,\n    lat DOUBLE PRECISION,\n    lng DOUBLE PRECISION,\n    speed DOUBLE PRECISION,\n    timestamp BIGINT,\n    PRIMARY KEY (order_id, timestamp)\n  );\n";
