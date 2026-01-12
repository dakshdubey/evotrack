"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const core_1 = require("@evotrack/core");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_123';
// --- AUTH MIDDLEWARE (Vendor API Key) ---
const verifyVendor = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey)
        return res.status(401).json({ error: 'Missing API Key' });
    // In prod: check against DB cache
    if (apiKey === 'dev_vendor_key') {
        req.vendorId = 'vnd_123';
        return next();
    }
    return res.status(403).json({ error: 'Invalid API Key' });
};
// --- ROUTES ---
// 1. Create Order
app.post('/v1/orders', verifyVendor, async (req, res) => {
    try {
        const body = core_1.CreateOrderSchema.parse(req.body);
        const vendorId = req.vendorId;
        // 1. Persist to DB
        const sql = `INSERT INTO orders (id, vendor_id, status, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
        // In real app, await db.query(sql, [...values]);
        console.log(`[DB] Created order ${body.orderId} for vendor ${vendorId}`);
        // 2. Generate Tokens
        const deliveryPayload = {
            sub: body.orderId, // Subject is order for delivery session
            role: core_1.EvoRole.DELIVERY_AGENT,
            orderId: body.orderId,
            vendorId,
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 12) // 12 hours
        };
        const customerPayload = {
            sub: body.orderId, // Subject is the order they are tracking
            role: core_1.EvoRole.CUSTOMER,
            orderId: body.orderId,
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 3) // 3 days
        };
        const deliveryToken = jsonwebtoken_1.default.sign(deliveryPayload, JWT_SECRET);
        const customerToken = jsonwebtoken_1.default.sign(customerPayload, JWT_SECRET);
        res.json({
            orderId: body.orderId,
            status: core_1.OrderStatus.PENDING,
            tokens: {
                delivery: deliveryToken,
                customer: customerToken
            }
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
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
