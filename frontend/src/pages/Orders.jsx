import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

function Orders() {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [showForm, setShowForm] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: 1 }]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchData = async () => {
    try {
      const [ordersRes, custRes, prodRes] = await Promise.all([
        api.get('/orders/'),
        api.get('/customers/'),
        api.get('/products/')
      ]);
      setOrders(ordersRes.data);
      setCustomers(custRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItem = () => {
    setOrderItems([...orderItems, { product_id: '', quantity: 1 }]);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...orderItems];
    newItems[index][field] = value;
    setOrderItems(newItems);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedItems = orderItems.map(item => ({
        product_id: parseInt(item.product_id),
        quantity: parseInt(item.quantity)
      }));

      await api.post('/orders/', {
        customer_id: parseInt(selectedCustomerId),
        items: formattedItems
      });
      addToast("Order created successfully", "success");

      setShowForm(false);
      setSelectedCustomerId('');
      setOrderItems([{ product_id: '', quantity: 1 }]);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Error creating order', "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to cancel/delete this order? Inventory will be restored.")) {
      try {
        await api.delete(`/orders/${id}`);
        addToast("Order cancelled successfully", "success");
        fetchData();
      } catch (err) {
        addToast("Error deleting order", "error");
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Orders</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={20} /> New Order
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2>Create New Order</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Select Customer</label>
              <select className="form-control" required value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)}>
                <option value="">-- Select Customer --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
              </select>
            </div>

            <div style={{marginTop: '2rem'}}>
              <h3>Order Items</h3>
              {orderItems.map((item, index) => (
                <div key={index} style={{display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-end'}}>
                  <div className="form-group" style={{flex: 1, marginBottom: 0}}>
                    <label>Product</label>
                    <select className="form-control" required value={item.product_id} onChange={e => handleItemChange(index, 'product_id', e.target.value)}>
                      <option value="">-- Select Product --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                          {p.name} (${p.price.toFixed(2)}) - Stock: {p.quantity}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{width: '150px', marginBottom: 0}}>
                    <label>Quantity</label>
                    <input type="number" min="1" className="form-control" required 
                      value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} />
                  </div>
                  {orderItems.length > 1 && (
                    <button type="button" className="btn btn-danger" onClick={() => handleRemoveItem(index)}>Remove</button>
                  )}
                </div>
              ))}
              <button type="button" className="btn" style={{backgroundColor: '#E5E7EB'}} onClick={handleAddItem}>
                + Add Another Item
              </button>
            </div>

            <div style={{marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem'}}>
              <button type="submit" className="btn btn-primary">Place Order</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer ID</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.customer_id}</td>
                  <td>${order.total_amount.toFixed(2)}</td>
                  <td>
                    <span style={{padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: '#FEF3C7', color: '#D97706', fontSize: '0.875rem', fontWeight: 600}}>
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.created_at).toLocaleString()}</td>
                  <td>
                    <button className="btn" style={{backgroundColor: '#E5E7EB', padding: '0.5rem 1rem', marginRight: '0.5rem'}} onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}>
                      {selectedOrder?.id === order.id ? "Hide Details" : "View Details"}
                    </button>
                    <button className="btn btn-danger" style={{padding: '0.5rem 1rem'}} onClick={() => handleDelete(order.id)}>Cancel</button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="card" style={{ marginTop: '1.5rem', backgroundColor: '#F9FAFB' }}>
          <h2>Order Details: #{selectedOrder.id}</h2>
          <p><strong>Customer ID:</strong> {selectedOrder.customer_id}</p>
          <p><strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
          <div className="table-container" style={{ marginTop: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Unit Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.map((item, idx) => {
                  const product = products.find(p => p.id === item.product_id);
                  const productName = product ? product.name : `Product ID: ${item.product_id}`;
                  return (
                    <tr key={idx}>
                      <td>{productName}</td>
                      <td>${item.price_at_time.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td>${(item.price_at_time * item.quantity).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total:</td>
                  <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>${selectedOrder.total_amount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
