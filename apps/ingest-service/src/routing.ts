import axios from 'axios';
import { Redis } from 'ioredis';

// Mock response for Google Directions
interface RouteResult {
    polyline: string;
    durationSeconds: number;
    distanceMeters: number;
}

export class RouteService {
    private googleKey: string;
    private cache: Redis;

    constructor(apiKey: string, redisUrl: string) {
        this.googleKey = apiKey;
        this.cache = new Redis(redisUrl);
    }

    /**
     * Calculates route between two points. 
     * Uses Redis to cache routes (Origin/Dest ID or simple lat/lng grid snapping) to reduce Google Costs.
     */
    async getRoute(pickup: { lat: number, lng: number }, dropoff: { lat: number, lng: number }): Promise<RouteResult> {
        // 1. Create Cache Key (Rounding to 4 decimal places ~11m precision to increase cache hits)
        const key = `route:${pickup.lat.toFixed(4)},${pickup.lng.toFixed(4)}:${dropoff.lat.toFixed(4)},${dropoff.lng.toFixed(4)}`;

        // 2. Check Cache
        const cached = await this.cache.get(key);
        if (cached) {
            console.log('Route Cache Hit');
            return JSON.parse(cached);
        }

        // 3. Call Google Directions API
        try {
            // Logic would be:
            // const res = await axios.get('https://maps.googleapis.com/maps/api/directions/json', ...);
            // const polyline = res.data.routes[0].overview_polyline.points;

            // Mocking for this output
            const result: RouteResult = {
                polyline: 'encoded_polyline_string_example',
                durationSeconds: 1200, // 20 mins
                distanceMeters: 5000 // 5km
            };

            // 4. Cache Result (TTL 24 hours for Directions? Maybe less for traffic awareness)
            // For static polyline, cache long. For Traffic ETA, call Distance Matrix API separately.
            await this.cache.setex(key, 86400, JSON.stringify(result));

            return result;
        } catch (err) {
            console.error('Routing Failed', err);
            throw err;
        }
    }

    /**
     * Recalculates ETA based on current location and remaining path.
     */
    async getLiveETA(current: { lat: number, lng: number }, dropoff: { lat: number, lng: number }): Promise<number> {
        // In production: Call Google Distance Matrix API (batched)
        // const res = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', ...);
        return 600; // Mock 10 mins
    }
}
