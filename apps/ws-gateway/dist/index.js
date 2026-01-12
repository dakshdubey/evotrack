"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const ioredis_1 = __importDefault(require("ioredis"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_1 = require("http");
const core_1 = require("@evotrack/core");
const httpServer = (0, http_1.createServer)();
const io = new socket_io_1.Server(httpServer, {
    cors: { origin: '*' }
});
const redisSubscriber = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_123';
// --- AUTH MIDDLEWARE ---
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token)
        return next(new Error('Authentication error'));
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, decoded) => {
        if (err)
            return next(new Error('Authentication error'));
        socket.user = decoded;
        next();
    });
});
io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`User connected: ${user.sub} (${user.role})`);
    // Customer or Vendor subscribes to Order Updates
    if (user.role === core_1.EvoRole.CUSTOMER || user.role === core_1.EvoRole.VENDOR) {
        if (user.orderId) {
            console.log(`Joining Room: order:${user.orderId}`);
            socket.join(`order:${user.orderId}`);
        }
    }
});
// --- CONSUME REDIS UPDATES ---
redisSubscriber.psubscribe('order:*', (err, count) => {
    if (err)
        console.error(err);
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
