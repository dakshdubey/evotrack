"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const server_1 = require("@evotrack/server");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Initialize EvoTrack SDK with Vendor Key
const evo = new server_1.EvoTrack({
    apiKey: 'dev_vendor_key',
    endpoint: 'http://localhost:3000' // Local API Gateway
});
// Setup SQLite DB
const db = new sqlite3_1.default.Database('./demo_orders.db');
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS orders (order_id TEXT, customer_token TEXT, delivery_token TEXT, status TEXT)");
});
app.post('/api/create-delivery', async (req, res) => {
    try {
        const { orderId, pickup, dropoff } = req.body;
        // 1. Create Order via EvoTrack SDK
        const response = await evo.createOrder({
            orderId,
            pickup,
            dropoff
        });
        // 2. Save tokens to our own DB
        db.run(`INSERT INTO orders VALUES (?, ?, ?, ?)`, [orderId, response.tokens.customer, response.tokens.delivery, "PENDING"], (err) => {
            if (err)
                throw err;
        });
        // 3. Return tokens to our client (Delivery App/Customer App)
        res.json({
            success: true,
            ...response
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
app.get('/api/orders', (req, res) => {
    db.all("SELECT * FROM orders", (err, rows) => {
        if (err)
            return res.status(500).json(err);
        res.json(rows);
    });
});
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Demo Backend running on ${PORT}`);
});
