import React, { useState, useRef, useEffect } from 'react';
import { EvoCustomer, EvoMap } from '@evotrack/client';

const API_URL = 'http://localhost:4000/api';

export const CustomerView = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [order, setOrder] = useState<any>(null);
    const [status, setStatus] = useState('Ready to Order');

    // SDKs
    const customerSDK = useRef<EvoCustomer | null>(null);
    const mapHelper = useRef<EvoMap | null>(null);

    useEffect(() => {
        if (mapRef.current) {
            const map = new google.maps.Map(mapRef.current, {
                center: { lat: 12.9716, lng: 77.5946 },
                zoom: 13,
            });
            mapHelper.current = new EvoMap(map);
        }
    }, []);

    const createOrder = async () => {
        try {
            const res = await fetch(`${API_URL}/create-delivery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: `ORD_${Date.now()}`,
                    pickup: { lat: 12.9716, lng: 77.5946 },
                    dropoff: { lat: 12.9352, lng: 77.6245 }
                })
            });
            const data = await res.json();
            setOrder(data);
            setStatus(`Order Placed: ${data.orderId}`);

            // Initialize Customer SDK
            if (customerSDK.current) customerSDK.current.disconnect();

            customerSDK.current = new EvoCustomer({
                token: data.tokens.customer,
                wsUrl: 'http://localhost:3002'
            });

            customerSDK.current.subscribe((state) => {
                console.log('Customer Update:', state);
                if (state.currentLocation) {
                    mapHelper.current?.updateLocation(state.currentLocation.lat, state.currentLocation.lng);
                }
                if (state.routePolyline) {
                    mapHelper.current?.updateRoute(state.routePolyline);
                }
                if (state.etaSeconds) {
                    setStatus(`Arriving in ${(state.etaSeconds / 60).toFixed(0)} mins`);
                }
            });

        } catch (err) {
            console.error(err);
            setStatus('Failed to create order');
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
            <div style={{ width: '350px', padding: '20px', background: 'white', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column' }}>
                <h2>🍔 Swiggy Consumer App</h2>
                <div style={{ flex: 1 }}>
                    <p style={{ color: '#666' }}>Creating order from <strong>Indiranagar</strong> to <strong>Koramangala</strong></p>

                    {!order ? (
                        <button
                            onClick={createOrder}
                            style={{ width: '100%', padding: '15px', background: '#fc8019', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
                        >
                            Place Order
                        </button>
                    ) : (
                        <div style={{ marginTop: '20px', padding: '15px', background: '#f0f5ff', borderRadius: '8px' }}>
                            <h3 style={{ margin: '0 0 10px 0', color: '#2962FF' }}>{status}</h3>
                            <p><strong>Order ID:</strong> {order.orderId}</p>
                            <p style={{ fontSize: '12px', color: '#888' }}>Waiting for delivery partner...</p>
                        </div>
                    )}
                </div>
            </div>
            <div ref={mapRef} style={{ flex: 1 }} />
        </div>
    );
};
