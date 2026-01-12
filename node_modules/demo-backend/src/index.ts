import express from 'express';
import cors from 'cors';
import { EvoTrack } from 'evotrack-server';
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

// 1. Auth: Signup
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password, name, role } = req.body;
        // Simple duplicate check
        const [existing]: any = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if (existing.length > 0) return res.status(400).json({ error: 'Email already exists' });

        const [result]: any = await pool.query(
            "INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)",
            [email, password, name, role]
        );
        res.json({ success: true, userId: result.insertId });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Auth: Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows]: any = await pool.query("SELECT * FROM users WHERE email = ? AND password = ?", [email, password]);

        if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const user = rows[0];
        res.json({
            success: true,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Place Order (Customer)
app.post('/api/orders/place', async (req, res) => {
    try {
        const { customerId, vendorId, products } = req.body;
        const orderId = `ORD_${Date.now()}`;

        // Fetch Locations
        const [users]: any = await pool.query("SELECT id, lat, lng FROM users WHERE id IN (?, ?)", [customerId, vendorId]);
        const customer = users.find((u: any) => u.id === customerId);
        const vendor = users.find((u: any) => u.id === vendorId);

        if (!customer || !vendor) return res.status(404).json({ error: 'User not found' });

        await pool.query(
            `INSERT INTO orders (order_id, vendor_id, customer_id, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'CREATED')`,
            [orderId, vendorId, customerId, vendor.lat, vendor.lng, customer.lat, customer.lng]
        );

        res.json({ success: true, orderId });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Dispatch Order (Vendor)
app.post('/api/orders/dispatch', async (req, res) => {
    try {
        const { orderId } = req.body;
        const [orders]: any = await pool.query("SELECT * FROM orders WHERE order_id = ?", [orderId]);
        if (orders.length === 0) return res.status(404).json({ error: 'Order not found' });
        const order = orders[0];

        // For demo: Generate mock tokens (in production, this would call EvoTrack SDK)
        const mockCustomerToken = `CUST_${orderId}_${Date.now()}`;
        const mockDeliveryToken = `DELV_${orderId}_${Date.now()}`;

        // Update Status & Tokens
        await pool.query(
            "UPDATE orders SET status = 'PENDING', customer_token = ?, delivery_token = ? WHERE order_id = ?",
            [mockCustomerToken, mockDeliveryToken, orderId]
        );

        console.log(`✅ Order ${orderId} dispatched to delivery agents`);
        res.json({ success: true });
    } catch (err: any) {
        console.error('❌ Dispatch Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// 4. List Orders (Role Based)
app.get('/api/orders', async (req, res) => {
    try {
        const { role, userId } = req.query;
        let query = "SELECT * FROM orders";
        let params: any[] = [];

        if (role === 'DELIVERY_AGENT') {
            // Agents see Pending + Assigned to them
            query += " WHERE status = 'PENDING' OR assigned_agent_id = ?";
            params.push(userId);
        } else if (role === 'VENDOR') {
            query += " WHERE vendor_id = ?";
            params.push(userId);
        } else if (role === 'CUSTOMER') {
            // In a real app, logic would link order to customer via phone/email match
            query += " WHERE 1=1";
        }

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 5. List Agents (For assignment if needed, or internal)
app.get('/api/agents', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT id, name, email FROM users WHERE role = 'DELIVERY_AGENT'");
        res.json(rows);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 6. Accept Order (Delivery Agent)
app.post('/api/orders/:id/accept', async (req, res) => {
    try {
        const { agentId } = req.body;
        const { id } = req.params;

        await pool.query(
            "UPDATE orders SET status = 'ASSIGNED', assigned_agent_id = ? WHERE order_id = ?",
            [agentId, id]
        );

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

// 7. Add Product (Vendor)
app.post('/api/products', async (req, res) => {
    try {
        const { vendorId, name, price, description, imageUrl } = req.body;
        const [result]: any = await pool.query(
            "INSERT INTO products (vendor_id, name, price, description, image_url) VALUES (?, ?, ?, ?, ?)",
            [vendorId, name, price, description, imageUrl]
        );
        res.json({ success: true, productId: result.insertId });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 8. List Products
app.get('/api/products', async (req, res) => {
    try {
        const { vendorId } = req.query;
        let query = "SELECT * FROM products";
        let params: any[] = [];

        if (vendorId) {
            query += " WHERE vendor_id = ?";
            params.push(vendorId);
        }

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 9. List Vendors
app.get('/api/vendors', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT id, name, address FROM users WHERE role = 'VENDOR'");
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Demo Backend running on ${PORT}`);
});
