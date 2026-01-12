import { z } from 'zod';

// --- ROLES & AUTH ---
export enum EvoRole {
    VENDOR = 'VENDOR',
    DELIVERY_AGENT = 'DELIVERY_AGENT',
    CUSTOMER = 'CUSTOMER',
    ADMIN = 'ADMIN'
}

export const JWTPayloadSchema = z.object({
    sub: z.string(), // User ID or Order ID
    role: z.nativeEnum(EvoRole),
    scope: z.array(z.string()).optional(),
    orderId: z.string().optional(), // For Customer/Agent tokens
    vendorId: z.string().optional(),
    exp: z.number()
});

export type JWTPayload = z.infer<typeof JWTPayloadSchema>;

// --- LOCATION ---
export interface GeoPoint {
    lat: number;
    lng: number;
}

export interface LocationUpdate {
    lat: number;
    lng: number;
    accuracy: number;
    speed: number; // m/s
    heading: number;
    timestamp: number; // ms since epoch
    batteryLevel?: number;
}

// --- ORDER ---
export enum OrderStatus {
    PENDING = 'PENDING',
    ASSIGNED = 'ASSIGNED',
    PICKED_UP = 'PICKED_UP',
    IN_TRANSIT = 'IN_TRANSIT',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED'
}

export interface OrderState {
    orderId: string;
    vendorId: string;
    status: OrderStatus;
    currentLocation?: GeoPoint;
    routePolyline?: string; // Encoded polyline
    etaSeconds?: number;
    distanceRemainingMeters?: number;
    lastUpdated: number;
}

// --- API SCHEMAS ---
export const CreateOrderSchema = z.object({
    orderId: z.string(),
    pickup: z.object({ lat: z.number(), lng: z.number() }),
    dropoff: z.object({ lat: z.number(), lng: z.number() }),
    metadata: z.record(z.string()).optional()
});

export type CreateOrderRequest = z.infer<typeof CreateOrderSchema>;

export interface DeliverySession {
    sessionId: string;
    orderId: string;
    agentId: string;
    startTime: number;
}
