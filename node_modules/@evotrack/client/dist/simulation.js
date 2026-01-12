"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulationUtils = void 0;
class SimulationUtils {
    /**
     * Generates a sequence of LocationUpdates along a path.
     * Simple linear interpolation for demo/testing.
     */
    static generatePath(start, end, durationSeconds) {
        const steps = durationSeconds; // 1 update per second
        const path = [];
        const now = Date.now();
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const lat = start.lat + (end.lat - start.lat) * t;
            const lng = start.lng + (end.lng - start.lng) * t;
            path.push({
                lat,
                lng,
                accuracy: 10,
                speed: 30, // 30 m/s
                heading: 0,
                timestamp: now + (i * 1000)
            });
        }
        return path;
    }
}
exports.SimulationUtils = SimulationUtils;
