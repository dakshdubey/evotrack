import { LocationUpdate } from '@evotrack/core';
export declare class SimulationUtils {
    /**
     * Generates a sequence of LocationUpdates along a path.
     * Simple linear interpolation for demo/testing.
     */
    static generatePath(start: {
        lat: number;
        lng: number;
    }, end: {
        lat: number;
        lng: number;
    }, durationSeconds: number): LocationUpdate[];
}
