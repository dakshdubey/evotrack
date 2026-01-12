"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOrderSchema = exports.OrderStatus = exports.JWTPayloadSchema = exports.EvoRole = void 0;
const zod_1 = require("zod");
// --- ROLES & AUTH ---
var EvoRole;
(function (EvoRole) {
    EvoRole["VENDOR"] = "VENDOR";
    EvoRole["DELIVERY_AGENT"] = "DELIVERY_AGENT";
    EvoRole["CUSTOMER"] = "CUSTOMER";
    EvoRole["ADMIN"] = "ADMIN";
})(EvoRole || (exports.EvoRole = EvoRole = {}));
exports.JWTPayloadSchema = zod_1.z.object({
    sub: zod_1.z.string(), // User ID or Order ID
    role: zod_1.z.nativeEnum(EvoRole),
    scope: zod_1.z.array(zod_1.z.string()).optional(),
    orderId: zod_1.z.string().optional(), // For Customer/Agent tokens
    vendorId: zod_1.z.string().optional(),
    exp: zod_1.z.number()
});
// --- ORDER ---
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["ASSIGNED"] = "ASSIGNED";
    OrderStatus["PICKED_UP"] = "PICKED_UP";
    OrderStatus["IN_TRANSIT"] = "IN_TRANSIT";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["CANCELLED"] = "CANCELLED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
// --- API SCHEMAS ---
exports.CreateOrderSchema = zod_1.z.object({
    orderId: zod_1.z.string(),
    pickup: zod_1.z.object({ lat: zod_1.z.number(), lng: zod_1.z.number() }),
    dropoff: zod_1.z.object({ lat: zod_1.z.number(), lng: zod_1.z.number() }),
    metadata: zod_1.z.record(zod_1.z.string()).optional()
});
