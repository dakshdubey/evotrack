import { z } from 'zod';
export declare enum EvoRole {
    VENDOR = "VENDOR",
    DELIVERY_AGENT = "DELIVERY_AGENT",
    CUSTOMER = "CUSTOMER",
    ADMIN = "ADMIN"
}
export declare const JWTPayloadSchema: z.ZodObject<{
    sub: z.ZodString;
    role: z.ZodNativeEnum<typeof EvoRole>;
    scope: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    orderId: z.ZodOptional<z.ZodString>;
    vendorId: z.ZodOptional<z.ZodString>;
    exp: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    sub: string;
    role: EvoRole;
    exp: number;
    scope?: string[] | undefined;
    orderId?: string | undefined;
    vendorId?: string | undefined;
}, {
    sub: string;
    role: EvoRole;
    exp: number;
    scope?: string[] | undefined;
    orderId?: string | undefined;
    vendorId?: string | undefined;
}>;
export type JWTPayload = z.infer<typeof JWTPayloadSchema>;
export interface GeoPoint {
    lat: number;
    lng: number;
}
export interface LocationUpdate {
    lat: number;
    lng: number;
    accuracy: number;
    speed: number;
    heading: number;
    timestamp: number;
    batteryLevel?: number;
}
export declare enum OrderStatus {
    PENDING = "PENDING",
    ASSIGNED = "ASSIGNED",
    PICKED_UP = "PICKED_UP",
    IN_TRANSIT = "IN_TRANSIT",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED"
}
export interface OrderState {
    orderId: string;
    vendorId: string;
    status: OrderStatus;
    currentLocation?: GeoPoint;
    routePolyline?: string;
    etaSeconds?: number;
    distanceRemainingMeters?: number;
    lastUpdated: number;
}
export declare const CreateOrderSchema: z.ZodObject<{
    orderId: z.ZodString;
    pickup: z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        lat: number;
        lng: number;
    }, {
        lat: number;
        lng: number;
    }>;
    dropoff: z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        lat: number;
        lng: number;
    }, {
        lat: number;
        lng: number;
    }>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    orderId: string;
    pickup: {
        lat: number;
        lng: number;
    };
    dropoff: {
        lat: number;
        lng: number;
    };
    metadata?: Record<string, string> | undefined;
}, {
    orderId: string;
    pickup: {
        lat: number;
        lng: number;
    };
    dropoff: {
        lat: number;
        lng: number;
    };
    metadata?: Record<string, string> | undefined;
}>;
export type CreateOrderRequest = z.infer<typeof CreateOrderSchema>;
export interface DeliverySession {
    sessionId: string;
    orderId: string;
    agentId: string;
    startTime: number;
}
