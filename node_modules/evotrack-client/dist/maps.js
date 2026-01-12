"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvoMap = void 0;
class EvoMap {
    constructor(mapInstance) {
        this.marker = null;
        this.map = mapInstance;
        this.directionsRenderer = new google.maps.DirectionsRenderer({
            map: this.map,
            suppressMarkers: true,
            preserveViewport: true,
            polylineOptions: { strokeColor: '#2962FF', strokeWeight: 5 }
        });
    }
    updateLocation(lat, lng) {
        const pos = new google.maps.LatLng(lat, lng);
        if (!this.marker) {
            this.marker = new google.maps.Marker({
                position: pos,
                map: this.map,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#2962FF',
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: 'white'
                }
            });
        }
        else {
            // Smooth Animation could be done here with requestAnimationFrame
            this.marker.setPosition(pos);
        }
        // Auto-center can be annoying if user is panning, so maybe only on first load
    }
    updateRoute(encodedPolyline) {
        if (!encodedPolyline)
            return;
        // Decode polyline (use @googlemaps/polyline-codec or geometry library)
        this.directionsRenderer.setOptions({
        // In real SDK, we'd need to mock the full DirectionsResult object structure 
        // that DirectionsRenderer expects if we just have a polyline,
        // OR simply draw a new Polyline overlay instead of using DirectionsRenderer.
        // For simplicity:
        });
        // Alternatively, just draw a Polyline:
        const path = google.maps.geometry.encoding.decodePath(encodedPolyline);
        new google.maps.Polyline({
            path,
            map: this.map,
            strokeColor: '#2962FF'
        });
    }
}
exports.EvoMap = EvoMap;
