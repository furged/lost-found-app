import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// HARDCODED API URL - REPLACE WITH YOUR RENDER BACKEND URL
const API_URL = 'https://lost-found-backend-vwhf.onrender.com/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    type: 'Lost',
    location: '',
    date: new Date().toISOString().split('T')[0],
    contactInfo: ''
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      searchItems();
    } else {
      setFilteredItems(items);
    }
  }, [searchTerm, items]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/items`);
      setItems(response.data);
      setFilteredItems(response.data);
    } catch (err) {
      setError('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const searchItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/items/search?name=${searchTerm}`);
      setFilteredItems(response.data);
    } catch (err) {
      setError('Search failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post(`${API_URL}/items`, formData, axiosConfig);
      setSuccess('Item added successfully');
      setShowAddModal(false);
      setFormData({
        itemName: '',
        description: '',
        type: 'Lost',
        location: '',
        date: new Date().toISOString().split('T')[0],
        contactInfo: ''
      });
      fetchItems();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.put(`${API_URL}/items/${selectedItem._id}`, formData, axiosConfig);
      setSuccess('Item updated successfully');
      setShowEditModal(false);
      setSelectedItem(null);
      fetchItems();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`${API_URL}/items/${id}`, axiosConfig);
        setSuccess('Item deleted successfully');
        fetchItems();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to delete item');
      }
    }
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setFormData({
      itemName: item.itemName,
      description: item.description,
      type: item.type,
      location: item.location,
      date: new Date(item.date).toISOString().split('T')[0],
      contactInfo: item.contactInfo
    });
    setShowEditModal(true);
  };

  return (
    <div>
      <nav className="navbar">
        <h1>Lost & Found System</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span>Welcome, {user.name}</span>
          <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button>
        </div>
      </nav>

      <div className="container">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Items</h2>
            <button onClick={() => setShowAddModal(true)} className="btn btn-success">
              + Add New Item
            </button>
          </div>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Search items by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={searchItems} className="btn">
              Search
            </button>
          </div>

          {loading ? (
            <div className="loading">Loading items...</div>
          ) : (
            <div className="item-grid">
              {filteredItems.map((item) => (
                <div key={item._id} className="item-card">
                  <span className={`item-badge ${item.type === 'Lost' ? 'badge-lost' : 'badge-found'}`}>
                    {item.type}
                  </span>
                  <h3 style={{ marginBottom: '10px', color: '#333' }}>{item.itemName}</h3>
                  <p style={{ marginBottom: '10px', color: '#666' }}>{item.description}</p>
                  <p style={{ marginBottom: '5px' }}><strong>Location:</strong> {item.location}</p>
                  <p style={{ marginBottom: '5px' }}><strong>Date:</strong> {new Date(item.date).toLocaleDateString()}</p>
                  <p style={{ marginBottom: '5px' }}><strong>Contact:</strong> {item.contactInfo}</p>
                  <p style={{ marginBottom: '15px', fontSize: '12px', color: '#999' }}>
                    Posted by: {item.user?.name}
                  </p>
                  
                  {item.user?._id === user._id && (
                    <div className="button-group">
                      <button
                        onClick={() => openEditModal(item)}
                        className="btn btn-warning"
                        style={{ flex: 1 }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="btn btn-danger"
                        style={{ flex: 1 }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {filteredItems.length === 0 && !loading && (
            <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
              No items found
            </p>
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h2 style={{ marginBottom: '20px', color: '#667eea' }}>Add New Item</h2>
            <form onSubmit={handleAddItem}>
              <div className="form-group">
                <label>Item Name</label>
                <input
                  type="text"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Type</label>
                <select name="type" value={formData.type} onChange={handleInputChange} required>
                  <option value="Lost">Lost</option>
                  <option value="Found">Found</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Contact Info</label>
                <input
                  type="text"
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleInputChange}
                  required
                  placeholder="Phone or Email"
                />
              </div>
              
              <div className="button-group">
                <button type="submit" className="btn btn-success" style={{ flex: 1 }} disabled={loading}>
                  {loading ? 'Adding...' : 'Add Item'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-danger"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h2 style={{ marginBottom: '20px', color: '#667eea' }}>Edit Item</h2>
            <form onSubmit={handleEditItem}>
              <div className="form-group">
                <label>Item Name</label>
                <input
                  type="text"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Type</label>
                <select name="type" value={formData.type} onChange={handleInputChange} required>
                  <option value="Lost">Lost</option>
                  <option value="Found">Found</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Contact Info</label>
                <input
                  type="text"
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleInputChange}
                  required
                  placeholder="Phone or Email"
                />
              </div>
              
              <div className="button-group">
                <button type="submit" className="btn btn-success" style={{ flex: 1 }} disabled={loading}>
                  {loading ? 'Updating...' : 'Update Item'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-danger"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;