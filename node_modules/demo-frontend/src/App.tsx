import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login, Signup } from './components/Auth';
import { VendorDashboard } from './components/VendorDashboard';
import { CustomerView } from './components/CustomerView';
import { DeliveryView } from './components/DeliveryView';

function App() {
    const [user, setUser] = useState<any>(null);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login onLogin={setUser} />} />
                <Route path="/signup" element={<Signup />} />

                <Route
                    path="/vendor"
                    element={user?.role === 'VENDOR' ? <VendorDashboard user={user} /> : <Navigate to="/login" />}
                />
                <Route
                    path="/customer"
                    element={user?.role === 'CUSTOMER' ? <CustomerView user={user} /> : <Navigate to="/login" />}
                />
                <Route
                    path="/delivery"
                    element={user?.role === 'DELIVERY_AGENT' ? <DeliveryView user={user} /> : <Navigate to="/login" />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
