import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'evotrack_demo',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export const initDB = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Connected to MySQL Database');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS agents (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                status ENUM('IDLE', 'BUSY') DEFAULT 'IDLE'
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS orders (
                order_id VARCHAR(255) PRIMARY KEY,
                pickup_lat DECIMAL(10, 8),
                pickup_lng DECIMAL(10, 8),
                dropoff_lat DECIMAL(10, 8),
                dropoff_lng DECIMAL(10, 8),
                status ENUM('PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED') DEFAULT 'PENDING',
                assigned_agent_id INT,
                FOREIGN KEY (assigned_agent_id) REFERENCES agents(id)
            )
        `);

        // Seed some agents if empty
        const [agents]: any = await connection.query('SELECT * FROM agents');
        if (agents.length === 0) {
            await connection.query(`
                INSERT INTO agents (name) VALUES 
                ('Ramesh'), ('Suresh'), ('Mahesh')
            `);
            console.log('🌱 Seeded Agents');
        }

        connection.release();
    } catch (err) {
        console.error('❌ Database Initialization Failed:', err);
    }
};
