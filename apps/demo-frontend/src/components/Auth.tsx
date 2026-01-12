import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = 'http://localhost:4000/api';

export const Login = ({ onLogin }: { onLogin: (user: any) => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (data.success) {
                onLogin(data.user);
                // Redirect based on role
                if (data.user.role === 'VENDOR') navigate('/vendor');
                if (data.user.role === 'CUSTOMER') navigate('/customer');
                if (data.user.role === 'DELIVERY_AGENT') navigate('/delivery');
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Login failed');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>👋 Welcome Back</h2>
                {error && <p style={styles.error}>{error}</p>}
                <form onSubmit={handleSubmit} style={styles.form}>
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={styles.input} required />
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={styles.input} required />
                    <button type="submit" style={styles.button}>Login</button>
                </form>
                <p style={{ marginTop: '20px' }}>
                    New here? <Link to="/signup">Create an account</Link>
                </p>
            </div>
        </div>
    );
};

export const Signup = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'CUSTOMER' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                alert('Account created! Please login.');
                navigate('/login');
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Signup failed');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>🚀 Create Account</h2>
                {error && <p style={styles.error}>{error}</p>}
                <form onSubmit={handleSubmit} style={styles.form}>
                    <input type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={styles.input} required />
                    <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={styles.input} required />
                    <input type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={styles.input} required />

                    <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} style={styles.input}>
                        <option value="CUSTOMER">Customer (Order Food)</option>
                        <option value="VENDOR">Vendor (Restaurant)</option>
                        <option value="DELIVERY_AGENT">Delivery Partner</option>
                    </select>

                    <button type="submit" style={styles.button}>Sign Up</button>
                </form>
                <p style={{ marginTop: '20px' }}>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' },
    card: { padding: '40px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '350px', textAlign: 'center' as const },
    form: { display: 'flex', flexDirection: 'column' as const, gap: '15px' },
    input: { padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '16px' },
    button: { padding: '12px', borderRadius: '6px', border: 'none', background: 'black', color: 'white', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' as const },
    error: { color: 'red', marginBottom: '10px' }
};
