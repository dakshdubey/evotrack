import express from 'express';
import jwt from 'jsonwebtoken';
import Redis from 'ioredis';
import { EvoRole, LocationUpdate, OrderState, OrderStatus } from '@evotrack/core';

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_123';

// --- AUTH MIDDLEWARE (Delivery Token) ---
const verifyDeliveryAgent = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Missing Token' });

    try {
        const payload = jwt.verify(token, JWT_SECRET) as any;
        if (payload.role !== EvoRole.DELIVERY_AGENT) throw new Error('Invalid Role');
        (req as any).user = payload;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid Token' });
    }
};

// --- INGEST LOGIC ---
app.post('/v1/location', verifyDeliveryAgent, async (req, res) => {
    const { orderId } = (req as any).user;
    const updates: LocationUpdate[] = req.body.updates; // Batch of updates

    if (!updates || !Array.isArray(updates)) {
        return res.status(400).send('Invalid payload');
    }

    // Process latest update
    const latest = updates[updates.length - 1];

    // 1. Anti-Spoofing & Validation (Simplified)
    // Check max speed > 100km/h -> reject
    if (latest.speed && latest.speed > 50) { // 50 m/s ~ 180km/h
        console.warn(`[Spoofing] Speed too high for order ${orderId}: ${latest.speed}`);
        // return res.status(400).send('Rejected: Speed > Max'); // Optional: soft reject
    }

    // 2. State Calculation (ETA, Distance) - delegated to worker or calculated here?
    // For latency, we calculate ETA here or push raw event.
    // We'll update Redis State.

    const state: Partial<OrderState> = {
        orderId,
        vendorId: (req as any).user.vendorId, // from token
        status: OrderStatus.IN_TRANSIT,
        currentLocation: { lat: latest.lat, lng: latest.lng },
        lastUpdated: Date.now()
    };

    // 3. Publish to Redis (Fanout)
    const channel = `order:${orderId}`;
    await redis.publish(channel, JSON.stringify(state));

    // 4. Persist to Stream/DB (Async)
    await redis.xadd('stream:locations', '*', 'orderId', orderId, 'json', JSON.stringify(updates));

    res.send({ success: true });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Ingest Service running on ${PORT}`);
});
