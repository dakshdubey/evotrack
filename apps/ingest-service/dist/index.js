"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ioredis_1 = __importDefault(require("ioredis"));
const core_1 = require("@evotrack/core");
const app = (0, express_1.default)();
app.use(express_1.default.json());
const redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_123';
// --- AUTH MIDDLEWARE (Delivery Token) ---
const verifyDeliveryAgent = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token)
        return res.status(401).json({ error: 'Missing Token' });
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (payload.role !== core_1.EvoRole.DELIVERY_AGENT)
            throw new Error('Invalid Role');
        req.user = payload;
        next();
    }
    catch (err) {
        return res.status(403).json({ error: 'Invalid Token' });
    }
};
// --- INGEST LOGIC ---
app.post('/v1/location', verifyDeliveryAgent, async (req, res) => {
    const { orderId } = req.user;
    const updates = req.body.updates; // Batch of updates
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
    const state = {
        orderId,
        vendorId: req.user.vendorId, // from token
        status: core_1.OrderStatus.IN_TRANSIT,
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
