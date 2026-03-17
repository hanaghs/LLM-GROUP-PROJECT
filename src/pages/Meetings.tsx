import React, { useState } from 'react';
import { useStore } from '../store';
import { ChevronLeft, ChevronRight, Plus, Video, Phone, Users, MapPin, Calendar } from 'lucide-react';
import type { Meeting } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, parseISO, isValid } from 'date-fns';

const Meetings: React.FC = () => {
  const { clients, meetings, addMeeting } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '', date: format(new Date(), 'yyyy-MM-dd'), time: '10:00', clientId: '', type: 'video' as Meeting['type'], notes: ''
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const selectedDayMeetings = meetings
    .filter(m => {
      const d = parseISO(m.date);
      return isValid(d) && isSameDay(d, selectedDate);
    })
    .sort((a, b) => a.time.localeCompare(b.time));

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleOpenModal = () => {
    setFormData({ title: '', date: format(selectedDate, 'yyyy-MM-dd'), time: '10:00', clientId: clients.length > 0 ? clients[0].id : '', type: 'video', notes: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMeeting(formData);
    setIsModalOpen(false);
  };

  const getClientColor = (clientId: string) => {
    // Generate a consistent hex color based on clientId string
    let hash = 0;
    for (let i = 0; i < clientId.length; i++) { hash = clientId.charCodeAt(i) + ((hash << 5) - hash); }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  };

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Unknown';

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video size={14} />;
      case 'call': return <Phone size={14} />;
      case 'in-person': return <MapPin size={14} />;
      default: return <Users size={14} />;
    }
  };

  return (
    <div className="flex gap-6" style={{ height: 'calc(100vh - 5rem)' }}>
      {/* Left: Calendar */}
      <div className="flex-col" style={{ flex: '1', minWidth: 0 }}>
        <div className="page-header mb-4">
          <div>
            <h1>Meetings & Notes</h1>
            <p>Schedule syncs and log meeting notes.</p>
          </div>
        </div>

        <div className="card" style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{format(currentDate, 'MMMM yyyy')}</h2>
            <div className="flex gap-2">
              <button className="btn btn-secondary" style={{ padding: '0.375rem' }} onClick={handlePrevMonth}><ChevronLeft size={20} /></button>
              <button className="btn btn-secondary" style={{ padding: '0.375rem' }} onClick={handleNextMonth}><ChevronRight size={20} /></button>
            </div>
          </div>

          <div className="calendar-grid" style={{ flex: 1 }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="calendar-day-header">{day}</div>
            ))}
            
            {calendarDays.map(day => {
              const dayMeetings = meetings.filter(m => { const d = parseISO(m.date); return isValid(d) && isSameDay(d, day); });
              return (
                <div 
                  key={day.toString()} 
                  className={`calendar-cell ${!isSameMonth(day, monthStart) ? 'dimmed' : ''} ${isSameDay(day, selectedDate) ? 'active' : ''}`}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className="calendar-date">{format(day, 'd')}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {dayMeetings.map(m => (
                      <span key={m.id} className="meeting-dot" style={{ backgroundColor: getClientColor(m.clientId) }} title={m.title} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: Selected Day Details */}
      <div className="flex-col" style={{ width: '400px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', overflowY: 'auto' }}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{format(selectedDate, 'EEEE')}</h2>
            <p className="mono" style={{ color: 'var(--brand-primary)', margin: 0 }}>{format(selectedDate, 'MMM d, yyyy')}</p>
          </div>
          <button className="btn btn-primary" style={{ padding: '0.5rem' }} onClick={handleOpenModal} disabled={clients.length === 0}><Plus size={16}/></button>
        </div>

        {clients.length === 0 && <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Add clients before scheduling meetings.</p>}

        {selectedDayMeetings.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem 1rem' }}>
            <Calendar className="icon mx-auto" style={{ width: 32, height: 32 }} />
            <p style={{ margin: 0 }}>No meetings scheduled for this day.</p>
          </div>
        ) : (
          <div className="flex-col gap-4">
            {selectedDayMeetings.map(mtg => (
              <div key={mtg.id} className="card" style={{ padding: '1rem', border: '1px solid var(--border-light)' }}>
                <div className="flex justify-between items-start mb-2">
                  <h3 style={{ fontSize: '1rem', margin: 0 }}>{mtg.title}</h3>
                  <span className="mono" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{mtg.time}</span>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <div className="avatar avatar-sm" style={{ backgroundColor: getClientColor(mtg.clientId), color: '#fff' }}>
                    {getClientName(mtg.clientId).substring(0,1)}
                  </div>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{getClientName(mtg.clientId)}</span>
                  <span className="badge badge-neutral flex items-center gap-1" style={{ fontSize: '0.65rem' }}>
                    {getTypeIcon(mtg.type)} {mtg.type}
                  </span>
                </div>

                {mtg.notes && (
                  <div style={{ backgroundColor: 'var(--bg-elevated)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>
                    {mtg.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="mb-6">Add Meeting</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Meeting Title *</label>
                <input required type="text" className="input-field" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Sync Call" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="input-group">
                  <label className="input-label">Date *</label>
                  <input required type="date" className="input-field" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div className="input-group">
                  <label className="input-label">Time *</label>
                  <input required type="time" className="input-field" value={formData.time} onChange={e => setFormData(p => ({ ...p, time: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="input-group">
                  <label className="input-label">Client *</label>
                  <select required className="input-field" value={formData.clientId} onChange={e => setFormData(p => ({ ...p, clientId: e.target.value }))}>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Type *</label>
                  <select required className="input-field" value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value as any }))}>
                    <option value="video">Video Call</option>
                    <option value="call">Phone Call</option>
                    <option value="in-person">In Person</option>
                  </select>
                </div>
              </div>

              <div className="input-group mb-6">
                <label className="input-label">Meeting Notes</label>
                <textarea className="input-field" rows={4} value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} placeholder="Agenda or notes..." />
              </div>
              
              <div className="flex justify-between mt-6">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Schedule Meeting</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meetings;
