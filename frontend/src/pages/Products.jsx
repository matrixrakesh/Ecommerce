import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

function Products() {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ name: '', sku: '', description: '', price: '', quantity: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products/');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        sku: formData.sku,
        description: formData.description,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity)
      };

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        addToast("Product updated successfully", "success");
      } else {
        await api.post('/products/', payload);
        addToast("Product created successfully", "success");
      }
      
      resetForm();
      fetchProducts();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Error saving product', "error");
    }
  };

  const resetForm = () => {
    setFormData({ name: '', sku: '', description: '', price: '', quantity: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      price: product.price,
      quantity: product.quantity
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.delete(`/products/${id}`);
        addToast("Product deleted successfully", "success");
        fetchProducts();
      } catch (err) {
        addToast("Error deleting product", "error");
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          <Plus size={20} /> Add Product
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input type="text" className="form-control" required 
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>SKU/Code</label>
              <input type="text" className="form-control" required 
                value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input type="text" className="form-control" 
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Price ($)</label>
              <input type="number" step="0.01" className="form-control" required 
                value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Initial Quantity</label>
              <input type="number" className="form-control" required 
                value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
            </div>
            <div className="form-group" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary">{editingId ? "Update Product" : "Save Product"}</button>
              <button type="button" className="btn" style={{backgroundColor: '#E5E7EB'}} onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>SKU</th>
                <th>Name</th>
                <th>Description</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.sku}</td>
                  <td>{product.name}</td>
                  <td>{product.description}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>
                    <span style={{color: product.quantity < 10 ? 'var(--danger)' : 'var(--success)', fontWeight: 'bold'}}>
                      {product.quantity}
                    </span>
                  </td>
                  <td>
                    <button className="btn" style={{backgroundColor: '#E5E7EB', padding: '0.5rem 1rem', marginRight: '0.5rem'}} onClick={() => handleEdit(product)}>Edit</button>
                    <button className="btn btn-danger" style={{padding: '0.5rem 1rem'}} onClick={() => handleDelete(product.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="7" style={{textAlign: 'center', padding: '2rem'}}>No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Products;
