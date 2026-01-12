-- Manually run this script in your MySQL Database if tables are missing

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('VENDOR', 'CUSTOMER', 'DELIVERY_AGENT') NOT NULL,
    lat DECIMAL(10, 8),
    lng DECIMAL(10, 8),
    address VARCHAR(255)
);

-- 2. Create Orders Table
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
);

-- 3. Create Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    FOREIGN KEY (vendor_id) REFERENCES users(id)
);

-- 4. Seed Users (If empty)
INSERT IGNORE INTO users (email, password, name, role, lat, lng, address) VALUES 
('vendor@demo.com', '123456', 'Pizza Hut', 'VENDOR', 12.9716, 77.5946, 'Indiranagar'),
('customer@demo.com', '123456', 'Alice', 'CUSTOMER', 12.9352, 77.6245, 'Koramangala'),
('ramesh@demo.com', '123456', 'Ramesh', 'DELIVERY_AGENT', 12.9716, 77.5946, 'Indiranagar'),
('suresh@demo.com', '123456', 'Suresh', 'DELIVERY_AGENT', 12.9352, 77.6245, 'Koramangala');
