import React, { useState, useEffect, useRef } from 'react';
import { EvoDelivery, SimulationUtils } from 'evotrack-client';

const API_URL = 'http://localhost:4000/api';

export const DeliveryView = ({ user }: { user: any }) => {
    const [agents, setAgents] = useState<any[]>([]);
    const [selectedAgent, setSelectedAgent] = useState<any>(user); // Use logged in user
    const [pendingOrders, setPendingOrders] = useState<any[]>([]);
    const [activeOrder, setActiveOrder] = useState<any>(null);
    const [status, setStatus] = useState('Online');

    const deliverySDK = useRef<EvoDelivery | null>(null);

    /* 1. Load Agents - REMOVED since we have Auth now */


    // 2. Poll for Pending Orders
    useEffect(() => {
        const interval = setInterval(() => {
            if (status === 'Online' && user) {
                fetch(`${API_URL}/orders?role=DELIVERY_AGENT&userId=${user.id}`)
                    .then(res => res.json())
                    .then(setPendingOrders)
                    .catch(err => console.error('Failed to fetch orders:', err));
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [status, user]);

    const login = (agent: any) => {
        setSelectedAgent(agent);
        setStatus('Online');
    };

    const acceptOrder = async (orderId: string) => {
        const res = await fetch(`${API_URL}/orders/${orderId}/accept`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agentId: user.id }) // Use logged in user ID
        });
        const data = await res.json();

        if (data.success) {
            setActiveOrder({ orderId, token: data.deliveryToken });
            setPendingOrders(prev => prev.filter(o => o.order_id !== orderId));

            // Initialize SDK
            deliverySDK.current = new EvoDelivery({
                token: data.deliveryToken,
                ingestUrl: 'http://localhost:3001'
            });
            deliverySDK.current.startTracking();
            setStatus('On Duty (Heading to Pickup)');
        }
    };

    const startSimulation = () => {
        if (!activeOrder || !deliverySDK.current) return;
        setStatus('🚚 Driving...');

        // Simulating path from Indiranagar to Koramangala
        // In a real app, the startTracking() above would pick up real GPS.
        const path = SimulationUtils.generatePath(
            { lat: 12.9716, lng: 77.5946 },
            { lat: 12.9352, lng: 77.6245 },
            60
        );

        // Manually push updates to Ingest API using the token (bypassing browser GPS for demo)
        // Note: In real app, just calling startTracking() is enough.
        // Here we mock because we are on a laptop without GPS movement.
        path.forEach((loc, index) => {
            setTimeout(() => {
                fetch('http://localhost:3001/v1/location', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${activeOrder.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ updates: [loc] })
                });
            }, index * 1000);
        });
    };

    if (!selectedAgent) return <p>Loading Agent Profile...</p>;

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2>👋 Hi, {selectedAgent.name}</h2>
                <span style={{ padding: '5px 10px', background: '#e0ffe0', color: 'green', borderRadius: '15px' }}>{status}</span>
            </header>

            {!activeOrder ? (
                <div>
                    <h3>Available Orders ({pendingOrders.length})</h3>
                    {pendingOrders.length === 0 && <p style={{ color: '#888' }}>Scanning for new orders...</p>}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {pendingOrders.map(order => (
                            <div key={order.order_id} style={{ padding: '20px', border: '1px solid #eee', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <strong>{order.order_id}</strong>
                                    <div style={{ fontSize: '14px', color: '#666' }}>Earnings: ₹85</div>
                                </div>
                                <button
                                    onClick={() => acceptOrder(order.order_id)}
                                    style={{ background: 'black', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}
                                >
                                    Accept
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '40px', border: '2px dashed #ccc', borderRadius: '10px' }}>
                    <h3>📦 Order Active: {activeOrder.orderId}</h3>
                    <p>Navigate to Pickup Location</p>
                    <button
                        onClick={startSimulation}
                        style={{ marginTop: '20px', padding: '15px 30px', fontSize: '18px', background: 'green', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    >
                        ▶️ Start Ride (Simulate)
                    </button>
                </div>
            )}
        </div>
    );
};
