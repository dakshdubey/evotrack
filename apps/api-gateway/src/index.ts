import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { CreateOrderSchema, EvoRole, JWTPayload, OrderStatus } from '@evotrack/core';
import { db } from '@evotrack/database';

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_123';

// --- AUTH MIDDLEWARE (Vendor API Key) ---
const verifyVendor = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) return res.status(401).json({ error: 'Missing API Key' });

    // In prod: check against DB cache
    if (apiKey === 'dev_vendor_key') {
        (req as any).vendorId = 'vnd_123';
        return next();
    }
    return res.status(403).json({ error: 'Invalid API Key' });
};

// --- ROUTES ---

// 1. Create Order
app.post('/v1/orders', verifyVendor, async (req, res) => {
    try {
        const body = CreateOrderSchema.parse(req.body);
        const vendorId = (req as any).vendorId;

        // 1. Persist to DB
        const sql = `INSERT INTO orders (id, vendor_id, status, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
        // In real app, await db.query(sql, [...values]);
        console.log(`[DB] Created order ${body.orderId} for vendor ${vendorId}`);

        // 2. Generate Tokens
        const deliveryPayload: JWTPayload = {
            sub: body.orderId, // Subject is order for delivery session
            role: EvoRole.DELIVERY_AGENT,
            orderId: body.orderId,
            vendorId,
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 12) // 12 hours
        };

        const customerPayload: JWTPayload = {
            sub: body.orderId, // Subject is the order they are tracking
            role: EvoRole.CUSTOMER,
            orderId: body.orderId,
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 3) // 3 days
        };

        const deliveryToken = jwt.sign(deliveryPayload, JWT_SECRET);
        const customerToken = jwt.sign(customerPayload, JWT_SECRET);

        res.json({
            orderId: body.orderId,
            status: OrderStatus.PENDING,
            tokens: {
                delivery: deliveryToken,
                customer: customerToken
            }
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Health
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'api-gateway' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
