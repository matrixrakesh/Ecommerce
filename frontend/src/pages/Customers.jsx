import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

function Customers() {
  const { addToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [showForm, setShowForm] = useState(false);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers/');
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/customers/', formData);
      addToast("Customer created successfully", "success");
      setFormData({ name: '', email: '', phone: '' });
      setShowForm(false);
      fetchCustomers();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Error creating customer', "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await api.delete(`/customers/${id}`);
        addToast("Customer deleted successfully", "success");
        fetchCustomers();
      } catch (err) {
        addToast("Error deleting customer", "error");
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Customers</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={20} /> Add Customer
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2>Add New Customer</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input type="text" className="form-control" required 
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" className="form-control" required 
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="text" className="form-control" 
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-primary">Save Customer</button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id}>
                  <td>{customer.id}</td>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone || 'N/A'}</td>
                  <td>
                    <button className="btn btn-danger" style={{padding: '0.5rem 1rem'}} onClick={() => handleDelete(customer.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>No customers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Customers;
