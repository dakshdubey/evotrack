import express from 'express';
import cors from 'cors';
import { EvoTrack } from '@evotrack/server';
import { initDB, pool } from './db';

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Database
initDB();

// Initialize EvoTrack SDK with Vendor Key
const evo = new EvoTrack({
    apiKey: 'dev_vendor_key',
    endpoint: 'http://localhost:3000' // Local API Gateway
});

// 1. Create Order
app.post('/api/create-delivery', async (req, res) => {
    try {
        const { orderId, pickup, dropoff } = req.body;

        // Create Order via EvoTrack SDK
        const response = await evo.createOrder({
            orderId,
            pickup,
            dropoff
        });

        // Save tokens to MySQL
        await pool.query(
            `INSERT INTO orders (order_id, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, status, customer_token, delivery_token) 
             VALUES (?, ?, ?, ?, ?, 'PENDING', ?, ?)`,
            [orderId, pickup.lat, pickup.lng, dropoff.lat, dropoff.lng, response.tokens.customer, response.tokens.delivery]
        );

        res.json({ success: true, ...response });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 2. List Pending Orders (For Delivery Agents)
app.get('/api/orders/pending', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM orders WHERE status = 'PENDING'");
        res.json(rows);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 3. List Agents
app.get('/api/agents', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM agents");
        res.json(rows);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 4. Accept Order
app.post('/api/orders/:id/accept', async (req, res) => {
    try {
        const { agentId } = req.body;
        const { id } = req.params;

        await pool.query(
            "UPDATE orders SET status = 'ASSIGNED', assigned_agent_id = ? WHERE order_id = ?",
            [agentId, id]
        );

        // Fetch tokens to give to the Agent
        const [rows]: any = await pool.query("SELECT delivery_token FROM orders WHERE order_id = ?", [id]);

        if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });

        res.json({
            success: true,
            deliveryToken: rows[0].delivery_token
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.API_PORT || 4000;
app.listen(PORT, () => {
    console.log(`Demo Backend running on ${PORT}`);
});
