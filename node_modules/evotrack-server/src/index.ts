import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { CreateOrderRequest, CreateOrderSchema, OrderStatus } from '@evotrack/core';

export interface EvoTrackConfig {
    apiKey: string;
    region?: string;
    endpoint?: string;
}

export class EvoTrack {
    private client: AxiosInstance;

    constructor(config: EvoTrackConfig) {
        const baseURL = config.endpoint || 'https://api.evotrack.io'; // Default prod URL
        this.client = axios.create({
            baseURL,
            headers: {
                'x-api-key': config.apiKey,
                'Content-Type': 'application/json'
            }
        });

        axiosRetry(this.client, { retries: 3, retryDelay: axiosRetry.exponentialDelay });
    }

    /**
     * Creates a new tracking session/order.
     */
    async createOrder(params: CreateOrderRequest) {
        // Validate locally before sending
        const validated = CreateOrderSchema.parse(params);

        try {
            const response = await this.client.post('/v1/orders', validated);
            return response.data as {
                orderId: string;
                status: OrderStatus;
                tokens: { delivery: string; customer: string; };
            };
        } catch (err: any) {
            throw new Error(`EvoTrack Error: ${err.response?.data?.error || err.message}`);
        }
    }

    // Webhook Signature Verification logic could go here
    verifyWebhook(signature: string, payload: any, secret: string): boolean {
        // implementation of HMAC verification
        return true;
    }
}
