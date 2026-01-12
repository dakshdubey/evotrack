import { OrderState } from '@evotrack/core';
export interface DeliveryConfig {
    ingestUrl?: string;
    token: string;
    bufferSize?: number;
}
export declare class EvoDelivery {
    private buffer;
    private token;
    private ingestUrl;
    private isTracking;
    private watchId?;
    constructor(config: DeliveryConfig);
    startTracking(): void;
    stopTracking(): void;
    private handlePosition;
    private flush;
}
export interface CustomerConfig {
    wsUrl?: string;
    token: string;
}
export declare class EvoCustomer {
    private socket;
    constructor(config: CustomerConfig);
    subscribe(callback: (state: OrderState) => void): void;
    disconnect(): void;
}
export { EvoMap } from './maps';
export { SimulationUtils } from './simulation';
