import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, Briefcase, Calendar, DollarSign, Edit2, Trash2 } from 'lucide-react';
import type { Mission } from '../types';
import { format, parseISO, isValid } from 'date-fns';

const Missions: React.FC = () => {
  const { clients, missions, addMission, updateMission, deleteMission } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);

  const [formData, setFormData] = useState({
    clientId: '', title: '', description: '', startDate: '', endDate: '', cost: 0, status: 'planning' as Mission['status']
  });

  const handleOpenModal = (mission?: Mission) => {
    if (mission) {
      setEditingMission(mission);
      setFormData({ clientId: mission.clientId, title: mission.title, description: mission.description, startDate: mission.startDate, endDate: mission.endDate, cost: mission.cost, status: mission.status });
    } else {
      setEditingMission(null);
      setFormData({ clientId: clients.length > 0 ? clients[0].id : '', title: '', description: '', startDate: new Date().toISOString().split('T')[0], endDate: '', cost: 0, status: 'planning' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMission) { updateMission(editingMission.id, formData); } 
    else { addMission(formData); }
    setIsModalOpen(false);
  };

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Unknown Client';
  const formatDateSafe = (dStr: string) => {
    if (!dStr) return '';
    const date = parseISO(dStr);
    return isValid(date) ? format(date, 'MMM d, yyyy') : '';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Missions</h1>
          <p>Track your active projects and deliverables.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()} disabled={clients.length === 0}>
          <Plus size={18} /> Add Mission
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="empty-state">
          <Briefcase className="icon mx-auto" />
          <h3>No clients found</h3>
          <p>You need to add a client before creating a mission.</p>
        </div>
      ) : missions.length === 0 ? (
        <div className="empty-state">
          <Briefcase className="icon mx-auto" />
          <h3>No missions yet</h3>
          <p>Create your first mission to start tracking your work.</p>
          <button className="btn btn-primary mt-4" onClick={() => handleOpenModal()}>Create Mission</button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {missions.map(mission => (
            <div key={mission.id} className="card flex-col justify-between" style={{ padding: '1.25rem' }}>
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 style={{ fontSize: '1.125rem', margin: 0 }}>{mission.title}</h3>
                    <p style={{ fontSize: '0.875rem', margin: 0, color: 'var(--brand-primary)' }}>{getClientName(mission.clientId)}</p>
                  </div>
                  <div className="flex gap-1">
                    <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={() => handleOpenModal(mission)}><Edit2 size={16} /></button>
                    <button className="btn btn-ghost text-danger" style={{ padding: '0.25rem' }} onClick={() => deleteMission(mission.id)}><Trash2 size={16} /></button>
                  </div>
                </div>

                <div className="mb-4">
                  <span className={`badge badge-${mission.status === 'completed' ? 'success' : mission.status === 'active' ? 'info' : mission.status === 'cancelled' ? 'danger' : 'warning'}`}>
                    {mission.status}
                  </span>
                </div>
                
                <div className="flex-col gap-2 mb-4" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><Calendar size={14} /> Start</div>
                    <span className="mono">{formatDateSafe(mission.startDate)}</span>
                  </div>
                  {mission.endDate && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><Calendar size={14} /> End</div>
                      <span className="mono">{formatDateSafe(mission.endDate)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                    <div className="flex items-center gap-2"><DollarSign size={14} /> Value</div>
                    <span className="mono font-semibold">${mission.cost.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="mb-6">{editingMission ? 'Edit Mission' : 'Create Mission'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Client *</label>
                <select required className="input-field" value={formData.clientId} onChange={e => setFormData(p => ({ ...p, clientId: e.target.value }))}>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Mission Title *</label>
                <input required type="text" className="input-field" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Website Redesign" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="input-group">
                  <label className="input-label">Start Date *</label>
                  <input required type="date" className="input-field" value={formData.startDate} onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))} />
                </div>
                <div className="input-group">
                  <label className="input-label">Due Date</label>
                  <input type="date" className="input-field" value={formData.endDate} onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="input-group">
                  <label className="input-label">Value ($) *</label>
                  <input required type="number" min="0" step="0.01" className="input-field" value={formData.cost} onChange={e => setFormData(p => ({ ...p, cost: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div className="input-group">
                  <label className="input-label">Status *</label>
                  <select required className="input-field" value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value as any }))}>
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="input-group mb-6">
                <label className="input-label">Description / Scope</label>
                <textarea className="input-field" rows={3} value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Scope details..." />
              </div>
              <div className="flex justify-between mt-6">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingMission ? 'Save Changes' : 'Create Mission'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Missions;
