"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDB = exports.pool = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.pool = promise_1.default.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'evotrack_demo',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
const initDB = async () => {
    try {
        const connection = await exports.pool.getConnection();
        console.log('✅ Connected to MySQL Database');
        // DROP tables for clean schema update (Demo only)
        // Drop in reverse order of dependencies
        await connection.query('DROP TABLE IF EXISTS products');
        await connection.query('DROP TABLE IF EXISTS orders');
        await connection.query('DROP TABLE IF EXISTS users');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                role ENUM('VENDOR', 'CUSTOMER', 'DELIVERY_AGENT') NOT NULL,
                lat DECIMAL(10, 8),
                lng DECIMAL(10, 8),
                address VARCHAR(255)
            )
        `);
        await connection.query(`
            CREATE TABLE IF NOT EXISTS orders (
                order_id VARCHAR(255) PRIMARY KEY,
                vendor_id INT,
                customer_id INT,
                pickup_lat DECIMAL(10, 8),
                pickup_lng DECIMAL(10, 8),
                dropoff_lat DECIMAL(10, 8),
                dropoff_lng DECIMAL(10, 8),
                status ENUM('CREATED', 'PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED') DEFAULT 'CREATED',
                assigned_agent_id INT,
                customer_token TEXT,
                delivery_token TEXT,
                FOREIGN KEY (vendor_id) REFERENCES users(id),
                FOREIGN KEY (assigned_agent_id) REFERENCES users(id)
            )
        `);
        await connection.query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                vendor_id INT,
                name VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                description TEXT,
                image_url VARCHAR(255),
                FOREIGN KEY (vendor_id) REFERENCES users(id)
            )
        `);
        // Seed Default Users
        const [users] = await connection.query('SELECT * FROM users');
        if (users.length === 0) {
            await connection.query(`
                INSERT INTO users (email, password, name, role, lat, lng, address) VALUES
                ('vendor@demo.com', '123456', 'Pizza Hut', 'VENDOR', 12.9716, 77.5946, 'Indiranagar'),
                ('customer@demo.com', '123456', 'Alice', 'CUSTOMER', 12.9352, 77.6245, 'Koramangala'),
                ('ramesh@demo.com', '123456', 'Ramesh', 'DELIVERY_AGENT', 12.9716, 77.5946, 'Indiranagar'),
                ('suresh@demo.com', '123456', 'Suresh', 'DELIVERY_AGENT', 12.9352, 77.6245, 'Koramangala')
            `);
            console.log('🌱 Seeded Users with Locations');
        }
        connection.release();
    }
    catch (err) {
        console.error('❌ Database Initialization Failed:', err);
    }
};
exports.initDB = initDB;
