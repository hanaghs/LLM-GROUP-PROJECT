import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, Users, Edit2, Trash2, Mail, Phone, MapPin, ChevronRight, Briefcase, Calendar } from 'lucide-react';
import type { Client } from '../types';
import { format } from 'date-fns';

const Clients: React.FC = () => {
  const { clients, addClient, updateClient, deleteClient, missions, invoices, meetings } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState({
    name: '', company: '', email: '', phone: '', address: '', currency: 'USD', notes: ''
  });

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({ name: client.name, company: client.company, email: client.email, phone: client.phone, address: client.address, currency: client.currency || 'USD', notes: client.notes });
    } else {
      setEditingClient(null);
      setFormData({ name: '', company: '', email: '', phone: '', address: '', currency: 'USD', notes: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      updateClient(editingClient.id, formData);
      if (selectedClient?.id === editingClient.id) {
        setSelectedClient({ ...editingClient, ...formData });
      }
    } else {
      addClient(formData);
    }
    setIsModalOpen(false);
  };

  const clientMissions = selectedClient ? missions.filter(m => m.clientId === selectedClient.id) : [];
  const clientInvoices = selectedClient ? invoices.filter(i => i.clientId === selectedClient.id) : [];
  const clientMeetings = selectedClient ? meetings.filter(m => m.clientId === selectedClient.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];
  const totalRevenue = clientInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="flex gap-6" style={{ height: 'calc(100vh - 5rem)' }}>
      {/* Left: Client List */}
      <div className="flex-col" style={{ flex: selectedClient ? '1' : '100%', transition: 'var(--transition)' }}>
        <div className="page-header">
          <div>
            <h1>Clients</h1>
            <p>Manage your client directory.</p>
          </div>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} /> Add Client
          </button>
        </div>

        {clients.length === 0 ? (
          <div className="empty-state">
            <Users className="icon mx-auto" />
            <h3>No clients yet</h3>
            <p>Add your first client to start tracking missions.</p>
            <button className="btn btn-primary mt-4" onClick={() => handleOpenModal()}>Add Client</button>
          </div>
        ) : (
          <div className={`grid gap-4 ${selectedClient ? 'grid-cols-1' : 'grid-cols-3'}`}>
            {clients.map(client => (
              <div 
                key={client.id} 
                className={`card flex items-center justify-between cursor-pointer ${selectedClient?.id === client.id ? 'active' : ''}`}
                style={{ cursor: 'pointer', padding: '1rem', borderColor: selectedClient?.id === client.id ? 'var(--brand-primary)' : 'var(--border-color)' }}
                onClick={() => setSelectedClient(client)}
              >
                <div className="flex items-center gap-3">
                  <div className="avatar avatar-lg">{getInitials(client.name)}</div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem' }}>{client.name}</h3>
                    <p style={{ margin: 0, fontSize: '0.875rem' }}>{client.company}</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-secondary" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Client Detail Panel */}
      {selectedClient && (
        <div className="flex-col" style={{ width: '400px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', overflowY: 'auto' }}>
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="avatar avatar-lg" style={{ width: '56px', height: '56px', fontSize: '1.5rem' }}>{getInitials(selectedClient.name)}</div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{selectedClient.name}</h2>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{selectedClient.company}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-secondary" style={{ padding: '0.375rem' }} onClick={() => handleOpenModal(selectedClient)}><Edit2 size={16} /></button>
              <button className="btn btn-secondary" style={{ padding: '0.375rem', color: 'var(--danger)' }} onClick={() => { deleteClient(selectedClient.id); setSelectedClient(null); }}><Trash2 size={16} /></button>
            </div>
          </div>

          <div className="flex-col gap-3 mb-6" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {selectedClient.email && <div className="flex items-center gap-2"><Mail size={16} /> <a href={`mailto:${selectedClient.email}`} style={{ color: 'var(--text-primary)' }}>{selectedClient.email}</a></div>}
            {selectedClient.phone && <div className="flex items-center gap-2"><Phone size={16} /> <span style={{ color: 'var(--text-primary)' }}>{selectedClient.phone}</span></div>}
            {selectedClient.address && <div className="flex items-center gap-2"><MapPin size={16} /> <span style={{ color: 'var(--text-primary)' }}>{selectedClient.address}</span></div>}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
             <div className="card" style={{ padding: '1rem' }}>
              <h4 style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Total Earned</h4>
              <p className="mono" style={{ fontSize: '1.25rem', color: 'var(--success)', margin: 0 }}>${totalRevenue.toLocaleString()}</p>
             </div>
             <div className="card" style={{ padding: '1rem' }}>
              <h4 style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Active Missions</h4>
              <p className="mono" style={{ fontSize: '1.25rem', color: 'var(--info)', margin: 0 }}>{clientMissions.filter(m => m.status === 'active').length}</p>
             </div>
          </div>

          {selectedClient.notes && (
            <div className="mb-6">
              <h4 className="mb-2" style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Notes</h4>
              <div style={{ backgroundColor: 'var(--bg-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                {selectedClient.notes}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h4 className="flex items-center gap-2 mb-3" style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}><Briefcase size={16}/> Missions</h4>
            {clientMissions.length === 0 ? <p className="text-secondary" style={{ fontSize: '0.875rem' }}>No missions yet.</p> : (
              <div className="flex-col gap-2">
                {clientMissions.map(m => (
                  <div key={m.id} className="flex justify-between items-center" style={{ padding: '0.5rem', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '0.875rem' }}>{m.title}</span>
                    <span className={`badge badge-${m.status === 'completed' ? 'success' : m.status === 'active' ? 'info' : 'neutral'}`}>{m.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="flex items-center gap-2 mb-3" style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}><Calendar size={16}/> Recent Meetings</h4>
            {clientMeetings.length === 0 ? <p className="text-secondary" style={{ fontSize: '0.875rem' }}>No meetings yet.</p> : (
              <div className="flex-col gap-2">
                {clientMeetings.map(m => (
                  <div key={m.id} className="flex-col gap-1" style={{ padding: '0.75rem', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                    <div className="flex justify-between">
                      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{m.title}</span>
                      <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{format(new Date(m.date), 'MMM d')} at {m.time}</span>
                    </div>
                    {m.notes && <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, marginTop: '0.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{m.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="mb-6">{editingClient ? 'Edit Client' : 'Add New Client'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Full Name *</label>
                <input required type="text" className="input-field" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Jane Doe" />
              </div>
              <div className="input-group">
                <label className="input-label">Company Name</label>
                <input type="text" className="input-field" value={formData.company} onChange={e => setFormData(p => ({ ...p, company: e.target.value }))} placeholder="Acme Corp" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="input-group">
                  <label className="input-label">Email</label>
                  <input type="email" className="input-field" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="jane@example.com" />
                </div>
                <div className="input-group">
                  <label className="input-label">Phone</label>
                  <input type="tel" className="input-field" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} placeholder="+1 234 567 890" />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Billing Currency</label>
                <select className="input-field" value={formData.currency} onChange={e => setFormData(p => ({ ...p, currency: e.target.value }))}>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div className="input-group mb-6">
                <label className="input-label">Notes</label>
                <textarea className="input-field" rows={3} value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} placeholder="Specific requirements..." />
              </div>
              <div className="flex justify-between mt-6">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingClient ? 'Save Changes' : 'Create Client'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
