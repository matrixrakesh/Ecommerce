import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Package, Users, ShoppingCart, TrendingUp } from 'lucide-react';

function Dashboard() {
  const [stats, setStats] = useState({ products: 0, customers: 0, orders: 0, revenue: 0 });
  const [lowStockProducts, setLowStockProducts] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [prodRes, custRes, orderRes] = await Promise.all([
          api.get('/products/'),
          api.get('/customers/'),
          api.get('/orders/')
        ]);
        
        const totalRevenue = orderRes.data.reduce((acc, order) => acc + order.total_amount, 0);

        setStats({
          products: prodRes.data.length,
          customers: custRes.data.length,
          orders: orderRes.data.length,
          revenue: totalRevenue
        });

        const lowStock = prodRes.data.filter(p => p.quantity < 10);
        setLowStockProducts(lowStock);
      } catch (err) {
        console.error("Failed to load stats", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
      </div>

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon"><Package size={24} /></div>
          <div className="stat-info">
            <h3>Total Products</h3>
            <p>{stats.products}</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon"><Users size={24} /></div>
          <div className="stat-info">
            <h3>Total Customers</h3>
            <p>{stats.customers}</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon"><ShoppingCart size={24} /></div>
          <div className="stat-info">
            <h3>Total Orders</h3>
            <p>{stats.orders}</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon"><TrendingUp size={24} /></div>
          <div className="stat-info">
            <h3>Total Revenue</h3>
            <p>${stats.revenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <h2>Welcome to the Inventory & Order Management System</h2>
          <p>Use the sidebar to navigate between Products, Customers, and Orders.</p>
        </div>

        <div className="card">
          <h2 style={{color: 'var(--danger)'}}>Low Stock Alerts (Under 10 units)</h2>
          {lowStockProducts.length === 0 ? (
            <p>All products are sufficiently stocked!</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map(p => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.sku}</td>
                      <td style={{color: 'var(--danger)', fontWeight: 'bold'}}>{p.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
