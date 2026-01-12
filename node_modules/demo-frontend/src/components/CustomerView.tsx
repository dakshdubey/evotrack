import React, { useState, useRef, useEffect } from 'react';
import { EvoCustomer, EvoMap } from 'evotrack-client';

const API_URL = 'http://localhost:4000/api';

export const CustomerView = ({ user }: { user?: any }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [order, setOrder] = useState<any>(null);
    const [status, setStatus] = useState('Select a Vendor');
    const [vendors, setVendors] = useState<any[]>([]);
    const [selectedVendor, setSelectedVendor] = useState<any>(null);

    // SDKs
    const customerSDK = useRef<EvoCustomer | null>(null);
    const mapHelper = useRef<EvoMap | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Load Vendors
        fetch(`${API_URL}/vendors`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch vendors');
                return res.json();
            })
            .then(data => {
                setVendors(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError('Could not load restaurants. Is Backend running?');
                setLoading(false);
            });

        if (mapRef.current) {
            const map = new google.maps.Map(mapRef.current, {
                center: { lat: 12.9716, lng: 77.5946 },
                zoom: 12,
            });
            mapHelper.current = new EvoMap(map);

            // Mark User Location
            if (user?.lat && user?.lng) {
                new google.maps.Marker({
                    position: { lat: user.lat, lng: user.lng },
                    map: map,
                    title: "My Location",
                    icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                });
                map.setCenter({ lat: user.lat, lng: user.lng });
            }
        }
    }, [user]);

    const placeOrder = async () => {
        if (!selectedVendor) return;
        try {
            const res = await fetch(`${API_URL}/orders/place`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: user.id || 2, // Default to Alice if no user
                    vendorId: selectedVendor.id,
                    products: [] // Future: Add products
                })
            });
            const data = await res.json();
            if (data.success) {
                setOrder({ orderId: data.orderId });
                setStatus('Waiting for Vendor to Dispatch...');
                alert('Order Placed! Waiting for Vendor to Dispatch.');

                // Poll for status or connect SDK (Simplified for now, expecting SDK connect on Dispatch)
                // Real app would poll /api/orders/:id until status becomes PENDING/ASSIGNED to get Start Token
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
            <div style={{ width: '350px', padding: '20px', background: 'white', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column' }}>
                <h2>🍔 Swiggy Consumer App</h2>
                {user && <p><strong>Hi, {user.name}</strong> <br /><span style={{ fontSize: '12px', color: '#666' }}>{user.address}</span></p>}

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {!order ? (
                        <>
                            <h3>Select Restaurant</h3>
                            {loading && <p>Loading restaurants...</p>}
                            {error && <p style={{ color: 'red' }}>{error}</p>}

                            {!loading && !error && vendors.length === 0 && <p>No restaurants found.</p>}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {vendors.map(v => (
                                    <div
                                        key={v.id}
                                        onClick={() => setSelectedVendor(v)}
                                        style={{
                                            padding: '15px',
                                            border: selectedVendor?.id === v.id ? '2px solid orange' : '1px solid #eee',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            background: selectedVendor?.id === v.id ? '#fff3e0' : 'white'
                                        }}
                                    >
                                        <strong>{v.name}</strong>
                                        <div style={{ fontSize: '12px', color: '#666' }}>{v.address}</div>
                                    </div>
                                ))}
                            </div>

                            {selectedVendor && (
                                <button
                                    onClick={placeOrder}
                                    style={{ marginTop: '20px', width: '100%', padding: '15px', background: '#fc8019', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
                                >
                                    Order from {selectedVendor.name}
                                </button>
                            )}
                        </>
                    ) : (
                        <div style={{ marginTop: '20px', padding: '15px', background: '#f0f5ff', borderRadius: '8px' }}>
                            <h3 style={{ margin: '0 0 10px 0', color: '#2962FF' }}>{status}</h3>
                            <p><strong>Order ID:</strong> {order.orderId}</p>
                            <p style={{ fontSize: '12px', color: '#888' }}>Live tracking will start once dispatched.</p>
                        </div>
                    )}
                </div>
            </div>
            <div ref={mapRef} style={{ flex: 1 }} />
        </div>
    );
};
