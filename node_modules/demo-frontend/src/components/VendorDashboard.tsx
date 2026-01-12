import React, { useState } from 'react';

const API_URL = 'http://localhost:4000/api';

export const VendorDashboard = ({ user }: { user: any }) => {
    const [orders, setOrders] = useState<any[]>([]);
    const [view, setView] = useState<'ORDERS' | 'PRODUCTS'>('ORDERS');
    const [products, setProducts] = useState<any[]>([]);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', imageUrl: '' });

    // Load Data
    React.useEffect(() => {
        if (view === 'ORDERS') {
            fetch(`${API_URL}/orders?role=VENDOR&userId=${user.id}`)
                .then(res => res.json())
                .then(data => {
                    // Filter for orders that need dispatch (CREATED)
                    setOrders(data.filter((o: any) => o.status === 'CREATED'));
                });
        } else {
            fetch(`${API_URL}/products?vendorId=${user.id}`).then(res => res.json()).then(setProducts);
        }
    }, [view, user.id]);

    const dispatchOrder = async (orderId: string) => {
        try {
            const res = await fetch(`${API_URL}/orders/dispatch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId })
            });
            const data = await res.json();
            if (data.success) {
                alert('Order Dispatched!');
                // Refresh list
                setOrders(orders.filter(o => o.order_id !== orderId));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const addProduct = async () => {
        try {
            const res = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vendorId: user.id,
                    ...newProduct
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('Product Added!');
                setProducts([...products, { ...newProduct, id: data.productId }]);
                setNewProduct({ name: '', price: '', description: '', imageUrl: '' });
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1>🏪 Vendor Portal</h1>
                    <p style={{ color: '#666' }}>{user.name} ({user.email})</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setView('ORDERS')} style={{ padding: '10px 20px', background: view === 'ORDERS' ? 'black' : 'white', color: view === 'ORDERS' ? 'white' : 'black', border: '1px solid black', borderRadius: '5px', cursor: 'pointer' }}>📦 Incoming Orders</button>
                    <button onClick={() => setView('PRODUCTS')} style={{ padding: '10px 20px', background: view === 'PRODUCTS' ? 'black' : 'white', color: view === 'PRODUCTS' ? 'white' : 'black', border: '1px solid black', borderRadius: '5px', cursor: 'pointer' }}>🍔 Menu</button>
                </div>
            </div>

            {view === 'ORDERS' ? (
                <div>
                    <h3>🚀 Incoming Orders</h3>
                    {orders.length === 0 ? <p style={{ color: '#888' }}>No pending orders.</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {orders.map(o => (
                                <div key={o.order_id} style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0' }}>{o.order_id}</h4>
                                        <div style={{ color: '#666', fontSize: '14px' }}>Customer ID: {o.customer_id}</div>
                                        <div style={{ color: '#666', fontSize: '14px' }}>Status: <span style={{ color: 'orange', fontWeight: 'bold' }}>{o.status}</span></div>
                                    </div>
                                    <button
                                        onClick={() => dispatchOrder(o.order_id)}
                                        style={{ padding: '10px 20px', background: '#6200ea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        Dispatch Agent
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ display: 'flex', gap: '30px' }}>
                    <div style={{ flex: 1, padding: '30px', border: '1px solid #ddd', borderRadius: '8px', background: 'white' }}>
                        <h3>➕ Add New Item</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <input placeholder="Item Name (e.g. Pepperoni Pizza)" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
                            <input type="number" placeholder="Price (₹)" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
                            <textarea placeholder="Description" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
                            <input placeholder="Image URL (Optional)" value={newProduct.imageUrl} onChange={e => setNewProduct({ ...newProduct, imageUrl: e.target.value })} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />

                            <button onClick={addProduct} style={{ padding: '12px', background: 'green', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Add Item</button>
                        </div>
                    </div>

                    <div style={{ flex: 1 }}>
                        <h3>📜 Your Menu</h3>
                        {products.length === 0 && <p style={{ color: '#888' }}>No items added yet.</p>}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {products.map(p => (
                                <div key={p.id} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px', background: 'white', display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <strong>{p.name}</strong>
                                        <div style={{ fontSize: '12px', color: '#666' }}>{p.description}</div>
                                    </div>
                                    <div style={{ fontWeight: 'bold' }}>₹{p.price}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
