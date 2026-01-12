import { io, Socket } from 'socket.io-client';
import { GeoPoint, LocationUpdate, OrderState } from '@evotrack/core';

// --- DELIVERY AGENT SDK ---

export interface DeliveryConfig {
    ingestUrl?: string;
    token: string;
    bufferSize?: number;
}

export class EvoDelivery {
    private buffer: LocationUpdate[] = [];
    private token: string;
    private ingestUrl: string;
    private isTracking = false;
    private watchId?: number;

    constructor(config: DeliveryConfig) {
        this.token = config.token;
        this.ingestUrl = config.ingestUrl || 'https://ingest.evotrack.io';
    }

    startTracking() {
        if (this.isTracking) return;
        this.isTracking = true;

        if (!('geolocation' in navigator)) {
            throw new Error('Geolocation not supported');
        }

        this.watchId = navigator.geolocation.watchPosition(
            (pos) => this.handlePosition(pos),
            (err) => console.error('Geo Error:', err),
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    }

    stopTracking() {
        this.isTracking = false;
        if (this.watchId !== undefined) {
            navigator.geolocation.clearWatch(this.watchId);
        }
    }

    private handlePosition(pos: GeolocationPosition) {
        const update: LocationUpdate = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            heading: pos.coords.heading || 0,
            speed: pos.coords.speed || 0,
            timestamp: pos.timestamp
        };

        this.buffer.push(update);
        // Flush if buffer big enough or every X seconds. 
        // Simplified: Flush immediately for now.
        this.flush();
    }

    private async flush() {
        if (this.buffer.length === 0) return;

        const batch = [...this.buffer];
        this.buffer = [];

        try {
            await fetch(`${this.ingestUrl}/v1/location`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ updates: batch })
            });
        } catch (err) {
            console.warn('Failed to send locations, buffering back...', err);
            this.buffer.unshift(...batch); // Retry order
        }
    }
}

// --- CUSTOMER SDK ---

export interface CustomerConfig {
    wsUrl?: string;
    token: string;
}

export class EvoCustomer {
    private socket: Socket;

    constructor(config: CustomerConfig) {
        const wsUrl = config.wsUrl || 'https://ws.evotrack.io';
        this.socket = io(wsUrl, {
            auth: { token: config.token },
            transports: ['websocket']
        });
    }

    subscribe(callback: (state: OrderState) => void) {
        this.socket.on('update', (state: OrderState) => {
            callback(state);
        });
    }

    disconnect() {
        this.socket.disconnect();
    }
}

export { EvoMap } from './maps';
export { SimulationUtils } from './simulation';
