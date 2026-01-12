import { CreateOrderRequest, OrderStatus } from '@evotrack/core';
export interface EvoTrackConfig {
    apiKey: string;
    region?: string;
    endpoint?: string;
}
export declare class EvoTrack {
    private client;
    constructor(config: EvoTrackConfig);
    /**
     * Creates a new tracking session/order.
     */
    createOrder(params: CreateOrderRequest): Promise<{
        orderId: string;
        status: OrderStatus;
        tokens: {
            delivery: string;
            customer: string;
        };
    }>;
    verifyWebhook(signature: string, payload: any, secret: string): boolean;
}
