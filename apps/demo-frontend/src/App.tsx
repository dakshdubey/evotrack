import React, { useState } from 'react';
import { CustomerView } from './components/CustomerView';
import { DeliveryView } from './components/DeliveryView';

function App() {
    const [role, setRole] = useState<'HOME' | 'CUSTOMER' | 'DELIVERY'>('HOME');

    if (role === 'CUSTOMER') return <CustomerView />;
    if (role === 'DELIVERY') return <DeliveryView />;

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', gap: '20px' }}>
            <h1>EvoTrack Demo Platform</h1>
            <p style={{ color: '#666' }}>Select your experience role:</p>

            <div style={{ display: 'flex', gap: '20px' }}>
                <button
                    onClick={() => setRole('CUSTOMER')}
                    style={{ padding: '20px 40px', fontSize: '18px', background: 'white', border: '2px solid #fc8019', color: '#fc8019', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    🍔 Use Consumer App
                </button>

                <button
                    onClick={() => setRole('DELIVERY')}
                    style={{ padding: '20px 40px', fontSize: '18px', background: 'black', border: '2px solid black', color: 'white', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    🛵 Use Delivery App
                </button>
            </div>
        </div>
    );
}

export default App;
