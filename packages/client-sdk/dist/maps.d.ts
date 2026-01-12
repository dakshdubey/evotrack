export declare class EvoMap {
    private map;
    private marker;
    private directionsRenderer;
    constructor(mapInstance: google.maps.Map);
    updateLocation(lat: number, lng: number): void;
    updateRoute(encodedPolyline: string): void;
}
