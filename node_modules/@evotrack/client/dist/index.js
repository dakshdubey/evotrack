"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulationUtils = exports.EvoMap = exports.EvoCustomer = exports.EvoDelivery = void 0;
const socket_io_client_1 = require("socket.io-client");
class EvoDelivery {
    constructor(config) {
        this.buffer = [];
        this.isTracking = false;
        this.token = config.token;
        this.ingestUrl = config.ingestUrl || 'https://ingest.evotrack.io';
    }
    startTracking() {
        if (this.isTracking)
            return;
        this.isTracking = true;
        if (!('geolocation' in navigator)) {
            throw new Error('Geolocation not supported');
        }
        this.watchId = navigator.geolocation.watchPosition((pos) => this.handlePosition(pos), (err) => console.error('Geo Error:', err), { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });
    }
    stopTracking() {
        this.isTracking = false;
        if (this.watchId !== undefined) {
            navigator.geolocation.clearWatch(this.watchId);
        }
    }
    handlePosition(pos) {
        const update = {
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
    async flush() {
        if (this.buffer.length === 0)
            return;
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
        }
        catch (err) {
            console.warn('Failed to send locations, buffering back...', err);
            this.buffer.unshift(...batch); // Retry order
        }
    }
}
exports.EvoDelivery = EvoDelivery;
class EvoCustomer {
    constructor(config) {
        const wsUrl = config.wsUrl || 'https://ws.evotrack.io';
        this.socket = (0, socket_io_client_1.io)(wsUrl, {
            auth: { token: config.token },
            transports: ['websocket']
        });
    }
    subscribe(callback) {
        this.socket.on('update', (state) => {
            callback(state);
        });
    }
    disconnect() {
        this.socket.disconnect();
    }
}
exports.EvoCustomer = EvoCustomer;
var maps_1 = require("./maps");
Object.defineProperty(exports, "EvoMap", { enumerable: true, get: function () { return maps_1.EvoMap; } });
var simulation_1 = require("./simulation");
Object.defineProperty(exports, "SimulationUtils", { enumerable: true, get: function () { return simulation_1.SimulationUtils; } });
