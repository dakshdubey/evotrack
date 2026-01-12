"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvoTrack = void 0;
const axios_1 = __importDefault(require("axios"));
const axios_retry_1 = __importDefault(require("axios-retry"));
const core_1 = require("@evotrack/core");
class EvoTrack {
    constructor(config) {
        const baseURL = config.endpoint || 'https://api.evotrack.io'; // Default prod URL
        this.client = axios_1.default.create({
            baseURL,
            headers: {
                'x-api-key': config.apiKey,
                'Content-Type': 'application/json'
            }
        });
        (0, axios_retry_1.default)(this.client, { retries: 3, retryDelay: axios_retry_1.default.exponentialDelay });
    }
    /**
     * Creates a new tracking session/order.
     */
    async createOrder(params) {
        // Validate locally before sending
        const validated = core_1.CreateOrderSchema.parse(params);
        try {
            const response = await this.client.post('/v1/orders', validated);
            return response.data;
        }
        catch (err) {
            throw new Error(`EvoTrack Error: ${err.response?.data?.error || err.message}`);
        }
    }
    // Webhook Signature Verification logic could go here
    verifyWebhook(signature, payload, secret) {
        // implementation of HMAC verification
        return true;
    }
}
exports.EvoTrack = EvoTrack;
