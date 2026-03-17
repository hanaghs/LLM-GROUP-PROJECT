import React from 'react';
import { useStore } from '../store';
import { Users, Briefcase, DollarSign, AlertCircle, ArrowUpRight, Activity, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, isAfter, subDays } from 'date-fns';

const Dashboard: React.FC = () => {
  const { clients, missions, invoices, meetings } = useStore();

  const activeMissions = missions.filter(m => m.status === 'active').length;
  const totalEarned = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
  const pendingRevenue = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((sum, i) => sum + i.total, 0);

  // Revenue by client
  const clientRevenue = clients.map(c => {
    const paid = invoices.filter(i => i.clientId === c.id && i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
    return { name: c.name.split(' ')[0], value: paid };
  }).sort((a, b) => b.value - a.value).slice(0, 5); // top 5

  const recentInvoices = [...invoices].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3);
  
  const upcomingMeetings = meetings
    .filter(m => isAfter(new Date(m.date), subDays(new Date(), 1)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Unknown';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Here's what's happening with your freelance business today.</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="card" style={{ padding: '1.25rem' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 style={{ color: 'var(--text-secondary)' }}>Total Clients</h3>
            <Users size={20} className="text-brand" />
          </div>
          <p className="mono" style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>{clients.length}</p>
        </div>
        
        <div className="card" style={{ padding: '1.25rem' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 style={{ color: 'var(--text-secondary)' }}>Active Missions</h3>
            <Briefcase size={20} className="text-info" />
          </div>
          <p className="mono" style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>{activeMissions}</p>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 style={{ color: 'var(--text-secondary)' }}>Total Earned</h3>
            <DollarSign size={20} className="text-success" />
          </div>
          <p className="mono" style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>
            ${totalEarned.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </p>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 style={{ color: 'var(--text-secondary)' }}>Pending Revenue</h3>
            <AlertCircle size={20} className="text-warning" />
          </div>
          <p className="mono" style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>
            ${pendingRevenue.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Missions Table - 2 columns */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h3>Recent Missions</h3>
            <Link to="/missions" className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>View All <ArrowUpRight size={14}/></Link>
          </div>
          {missions.length === 0 ? (
            <div className="empty-state">
              <Briefcase className="icon mx-auto" />
              <p>No missions active.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Client</th>
                    <th>Status</th>
                    <th className="text-right">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {missions.slice(0, 4).map(m => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 500 }}>{m.title}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{getClientName(m.clientId)}</td>
                      <td><span className={`badge badge-${m.status === 'completed' ? 'success' : m.status === 'active' ? 'info' : m.status === 'cancelled' ? 'danger' : 'neutral'}`}>{m.status}</span></td>
                      <td className="text-right mono text-brand">${m.cost.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Revenue Chart - 1 column */}
        <div className="card">
          <div className="card-header">
            <h3>Top Clients (Paid)</h3>
            <Link to="/analytics" className="btn btn-ghost" style={{ padding: '0.25rem' }}><Activity size={16}/></Link>
          </div>
          {clientRevenue.length > 0 && clientRevenue.some(c => c.value > 0) ? (
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clientRevenue} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: 'var(--bg-elevated)' }} contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="value" fill="var(--brand-primary)" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="empty-state" style={{ padding: '2rem 1rem' }}><p>No paid invoices yet.</p></div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Activity Feed: Meetings */}
        <div className="card">
          <div className="card-header">
            <h3 className="flex items-center gap-2"><Calendar size={18} className="text-brand" /> Upcoming Meetings</h3>
          </div>
          <div className="flex-col gap-4">
            {upcomingMeetings.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)' }}>No upcoming meetings.</p>
            ) : (
              upcomingMeetings.map(mtg => (
                <div key={mtg.id} className="flex gap-4 p-3" style={{ backgroundColor: 'var(--bg-base)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div className="flex-col items-center justify-center" style={{ minWidth: '60px', borderRight: '1px solid var(--border-color)', paddingRight: '1rem' }}>
                    <span className="mono text-brand" style={{ fontSize: '1.25rem', fontWeight: 500 }}>{format(new Date(mtg.date), 'dd')}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{format(new Date(mtg.date), 'MMM')}</span>
                  </div>
                  <div className="flex-col justify-center">
                    <h4 style={{ margin: 0, fontSize: '0.875rem' }}>{mtg.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {mtg.time} • {getClientName(mtg.clientId)} • <span className="badge badge-neutral" style={{ padding: '0 0.25rem', fontSize: '0.65rem' }}>{mtg.type}</span>
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity Feed: Recent Invoices */}
        <div className="card">
          <div className="card-header">
            <h3 className="flex items-center gap-2"><DollarSign size={18} className="text-success" /> Recent Invoices</h3>
          </div>
          <div className="flex-col gap-3">
            {recentInvoices.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)' }}>No recent invoices.</p>
            ) : (
              recentInvoices.map(inv => (
                <div key={inv.id} className="flex justify-between items-center p-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <div className="mono text-text-primary mb-1">{inv.invoiceNumber}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{getClientName(inv.clientId)}</div>
                  </div>
                  <div className="text-right">
                    <div className="mono text-brand mb-1">${inv.total.toLocaleString()}</div>
                    <span className={`badge badge-${inv.status === 'paid' ? 'success' : inv.status === 'overdue' ? 'danger' : inv.status === 'sent' ? 'warning' : 'neutral'}`} style={{ fontSize: '0.65rem' }}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
