import { Server } from 'socket.io';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import { createServer } from 'http';
import { EvoRole } from '@evotrack/core';

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: { origin: '*' }
});

const redisSubscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_123';

// --- AUTH MIDDLEWARE ---
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
        if (err) return next(new Error('Authentication error'));
        (socket as any).user = decoded;
        next();
    });
});

io.on('connection', (socket) => {
    const user = (socket as any).user;
    console.log(`User connected: ${user.sub} (${user.role})`);

    // Customer or Vendor subscribes to Order Updates
    if (user.role === EvoRole.CUSTOMER || user.role === EvoRole.VENDOR) {
        if (user.orderId) {
            console.log(`Joining Room: order:${user.orderId}`);
            socket.join(`order:${user.orderId}`);
        }
    }
});

// --- CONSUME REDIS UPDATES ---
redisSubscriber.psubscribe('order:*', (err, count) => {
    if (err) console.error(err);
    console.log(`Subscribed to ${count} channels`);
});

redisSubscriber.on('pmessage', (pattern, channel, message) => {
    // channel = order:ORD_123
    // Message is JSON string of OrderState

    // Broadcast to room
    io.to(channel).emit('update', JSON.parse(message));
});

const PORT = 3002;
httpServer.listen(PORT, () => {
    console.log(`WS Gateway running on ${PORT}`);
});
