import React from 'react';
import { useStore } from '../store';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import { format, parseISO, isValid } from 'date-fns';
import { Activity } from 'lucide-react';

const Analytics: React.FC = () => {
  const { invoices, missions, clients } = useStore();

  // 1. Monthly Revenue Trend (Paid invoices)
  const paidInvoices = invoices.filter(i => i.status === 'paid' && i.paidDate);
  const revenueByMonthMap = new Map<string, number>();

  paidInvoices.forEach(inv => {
    if (inv.paidDate) {
      const date = parseISO(inv.paidDate);
      if (isValid(date)) {
        const month = format(date, 'MMM yyyy');
        revenueByMonthMap.set(month, (revenueByMonthMap.get(month) || 0) + inv.total);
      }
    }
  });

  const revenueTrendData = Array.from(revenueByMonthMap, ([month, revenue]) => ({ month, revenue })).reverse();

  // 2. Mission Status Distribution
  const missionStatusCounts = {
    planning: 0,
    active: 0,
    completed: 0,
    cancelled: 0
  };
  missions.forEach(m => missionStatusCounts[m.status]++);

  const missionStatusData = [
    { name: 'Planning', value: missionStatusCounts.planning, color: 'var(--text-secondary)' },
    { name: 'Active', value: missionStatusCounts.active, color: 'var(--info)' },
    { name: 'Completed', value: missionStatusCounts.completed, color: 'var(--success)' },
    { name: 'Cancelled', value: missionStatusCounts.cancelled, color: 'var(--danger)' },
  ].filter(d => d.value > 0);

  // 3. Client Revenue (Horizontal Bar)
  const clientRevenue = clients.map(c => {
    const paid = invoices.filter(i => i.clientId === c.id && i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
    return { name: c.name, value: paid };
  }).sort((a, b) => b.value - a.value).filter(c => c.value > 0);

  // Custom Tooltip for dark mode
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>{label}</p>
          <p className="mono" style={{ margin: 0, color: payload[0].color || 'var(--text-primary)', fontWeight: 600 }}>
            {payload[0].name === 'revenue' || payload[0].name === 'value' ? '$' : ''}{payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Analytics</h1>
          <p>Key metrics and performance trends.</p>
        </div>
      </div>

      {invoices.length === 0 && missions.length === 0 ? (
        <div className="empty-state">
          <Activity className="icon mx-auto" />
          <h3>No data yet</h3>
          <p>Complete missions and get paid to see your analytics grow.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          
          {/* Revenue Trend Line Chart */}
          <div className="card" style={{ gridColumn: 'span 2' }}>
            <h3 className="mb-4 text-secondary">Monthly Revenue (Paid)</h3>
            {revenueTrendData.length > 0 ? (
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                    <XAxis dataKey="month" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="revenue" stroke="var(--success)" strokeWidth={3} dot={{ r: 4, fill: 'var(--bg-base)', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '2rem 0' }}>No paid revenue data to display.</p>
            )}
          </div>

          {/* Revenue by Client Horizontal Bar */}
          <div className="card">
            <h3 className="mb-4 text-secondary">Revenue by Client</h3>
            {clientRevenue.length > 0 ? (
              <div style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clientRevenue} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} width={100} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-elevated)' }} />
                    <Bar dataKey="value" fill="var(--brand-primary)" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '2rem 0' }}>No client revenue yet.</p>
            )}
          </div>

          {/* Mission Status Donut Chart */}
          <div className="card">
            <h3 className="mb-4 text-secondary">Mission Status</h3>
            {missionStatusData.length > 0 ? (
              <div style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={missionStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {missionStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '2rem 0' }}>No missions tracked.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
