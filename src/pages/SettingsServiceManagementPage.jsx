import React, { useState } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import '../components/Dashboard/Dashboard.css';
import './SettingsServiceManagement.css';

const initialServices = [
  { id: 1, name: 'Engine overheating', category: 'Engine', price: '600 – 1,200 AED', time: '3 – 5 hours' },
  { id: 2, name: 'AC not cooling properly', category: 'Air Conditioning', price: '300 – 700 AED', time: '2 – 4 hours' },
  { id: 3, name: 'Engine oil leaks', category: 'Engine', price: '250 – 450 AED', time: '1 – 2 hours' }
];

const emptyForm = { id: null, name: '', category: '', price: '', time: '' };

const SettingsServiceManagementPage = () => {
  const [services, setServices] = useState(initialServices);
  const [mode, setMode] = useState('list'); // list | add | edit
  const [form, setForm] = useState(emptyForm);

  const startAdd = () => { setForm(emptyForm); setMode('add'); };
  const startEdit = (svc) => { setForm(svc); setMode('edit'); };
  const cancel = () => { setMode('list'); setForm(emptyForm); };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const save = e => {
    e.preventDefault();
    if (mode === 'add') {
      setServices(s => [...s, { ...form, id: Date.now() }]);
    } else if (mode === 'edit') {
      setServices(s => s.map(x => x.id === form.id ? form : x));
    }
    cancel();
  };

  const remove = (id) => {
    if (window.confirm('Delete this service?')) {
      setServices(s => s.filter(x => x.id !== id));
      cancel();
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
              {mode === 'list' && (
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
                      <input name="name" value={form.name} onChange={handleChange} placeholder="e.g., Engine Oil Change" required />
                    </label>
                    <label className="settings-field">
                      <span className="settings-label">Service Category</span>
                      <select name="category" value={form.category} onChange={handleChange} required>
                        <option value="">Select Category</option>
                        <option value="Engine">Engine</option>
                        <option value="Air Conditioning">Air Conditioning</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Diagnostics">Diagnostics</option>
                      </select>
                    </label>
                    <label className="settings-field">
                      <span className="settings-label">Estimated Price (AED)</span>
                      <input name="price" value={form.price} onChange={handleChange} placeholder="e.g., 300 – 500 AED" required />
                    </label>
                    <label className="settings-field">
                      <span className="settings-label">Estimated Time</span>
                      <input name="time" value={form.time} onChange={handleChange} placeholder="e.g., 2 – 3 hours" required />
                    </label>
                  </div>
                  <div className="settings-actions multi">
                    <button type="submit" className="settings-primary-btn">{mode === 'add' ? 'Add Service' : 'Update Service'}</button>
                    {mode === 'edit' && (
                      <button type="button" className="settings-danger-btn" onClick={() => remove(form.id)}>Delete Service</button>
                    )}
                    <button type="button" className="settings-secondary-btn" onClick={cancel}>Cancel</button>
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
