import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import ConfirmDialog from '../components/common/ConfirmDialog';
import garageServicesService from '../services/garageServices.service';
import '../components/Dashboard/Dashboard.css';
import './SettingsServiceManagement.css';

const emptyForm = { id: null, name: '', category: '', price: '', time: '' };

const SettingsServiceManagementPage = () => {
  const [services, setServices] = useState([]);
  const [mode, setMode] = useState('list'); // list | add | edit
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, serviceId: null, serviceName: '' });

  // Fetch services on mount
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedServices = await garageServicesService.getGarageServices();
      setServices(fetchedServices);
    } catch (err) {

      setError(err.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const startAdd = () => { setForm(emptyForm); setMode('add'); setError(null); };
  const startEdit = (svc) => { setForm(svc); setMode('edit'); setError(null); };
  const cancel = () => { setMode('list'); setForm(emptyForm); setError(null); };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const save = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);

      if (mode === 'add') {
        const newService = await garageServicesService.createService({
          name: form.name,
          category: form.category,
          price: form.price,
          time: form.time
        });
        setServices(s => [newService, ...s]);
      } else if (mode === 'edit') {
        const updatedService = await garageServicesService.updateService(form.id, {
          name: form.name,
          category: form.category,
          price: form.price,
          time: form.time
        });
        setServices(s => s.map(x => x.id === form.id ? updatedService : x));
      }
      
      cancel();
    } catch (err) {

      setError(err.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      setSaving(true);
      setError(null);
      await garageServicesService.deleteService(id);
      setServices(s => s.filter(x => x.id !== id));
      cancel();
    } catch (err) {

      setError(err.message || 'Failed to delete service');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteDialog = (id, name) => {
    setDeleteDialog({ isOpen: true, serviceId: id, serviceName: name });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, serviceId: null, serviceName: '' });
  };

  const handleConfirmDelete = () => {
    if (deleteDialog.serviceId) {
      remove(deleteDialog.serviceId);
    }
  };

  return (
    <div className="dashboard-layout dashboard-tight">
      <Sidebar />
      <div className="dashboard-layout-main">
        <div className="dashboard-layout-content">
          <div className="settings-services-wrapper">
            <div className="settings-card">
              <div className="settings-card-header">
                <span className="bar" aria-hidden="true" />
                <h2>{mode === 'list' ? 'Garage Service Manager' : (mode === 'add' ? 'Add Service' : 'Edit Service')}</h2>
              </div>
              
              {error && (
                <div style={{ padding: '12px', marginBottom: '16px', backgroundColor: '#fee', color: '#c00', borderRadius: '4px' }}>
                  {error}
                </div>
              )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Delete Service"
        message={`Are you sure you want to delete "${deleteDialog.serviceName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

              {loading && mode === 'list' ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                  Loading services...
                </div>
              ) : mode === 'list' && (
                <div className="services-list-view">
                  <div className="list-actions">
                    <button className="settings-primary-btn" onClick={startAdd}>Add Service</button>
                  </div>
                  <div className="services-table-wrapper">
                    <table className="services-table">
                      <thead>
                        <tr>
                          <th scope="col">Service Type</th>
                          <th scope="col">Time</th>
                          <th scope="col">Price</th>
                          <th scope="col">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {services.map(s => (
                          <tr key={s.id}>
                            <td>{s.name}</td>
                            <td>{s.time}</td>
                            <td>{s.price}</td>
                            <td><button className="table-action" onClick={() => startEdit(s)}>Edit</button></td>
                          </tr>
                        ))}
                        {services.length === 0 && (
                          <tr><td colSpan={4} className="empty">No services defined</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {mode !== 'list' && (
                <form className="service-form" onSubmit={save}>
                  <div className="service-form-fields">
                    <label className="settings-field">
                      <span className="settings-label">Service Name</span>
                      <input 
                        name="name" 
                        value={form.name} 
                        onChange={handleChange} 
                        placeholder="e.g., Engine Oil Change" 
                        required 
                        disabled={saving}
                      />
                    </label>
                    <label className="settings-field">
                      <span className="settings-label">Service Category</span>
                      <select 
                        name="category" 
                        value={form.category} 
                        onChange={handleChange} 
                        required
                        disabled={saving}
                      >
                        <option value="">Select Category</option>
                        <option value="Engine">Engine</option>
                        <option value="Air Conditioning">Air Conditioning</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Diagnostics">Diagnostics</option>
                        <option value="Brakes">Brakes</option>
                        <option value="Transmission">Transmission</option>
                        <option value="Suspension">Suspension</option>
                        <option value="Tires">Tires</option>
                        <option value="Battery">Battery</option>
                        <option value="Other">Other</option>
                      </select>
                    </label>
                    <label className="settings-field">
                      <span className="settings-label">Estimated Price (AED)</span>
                      <input 
                        name="price" 
                        value={form.price} 
                        onChange={handleChange} 
                        placeholder="e.g., 300 – 500 AED" 
                        required 
                        disabled={saving}
                      />
                    </label>
                    <label className="settings-field">
                      <span className="settings-label">Estimated Time</span>
                      <input 
                        name="time" 
                        value={form.time} 
                        onChange={handleChange} 
                        placeholder="e.g., 2 – 3 hours" 
                        required 
                        disabled={saving}
                      />
                    </label>
                  </div>
                  <div className="settings-actions multi">
                    <button 
                      type="submit" 
                      className="settings-primary-btn" 
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : (mode === 'add' ? 'Add Service' : 'Update Service')}
                    </button>
                    {mode === 'edit' && (
                      <button 
                        type="button" 
                        className="settings-danger-btn" 
                        onClick={() => openDeleteDialog(form.id, form.name)}
                        disabled={saving}
                      >
                        Delete Service
                      </button>
                    )}
                    <button 
                      type="button" 
                      className="settings-secondary-btn" 
                      onClick={cancel}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsServiceManagementPage;
