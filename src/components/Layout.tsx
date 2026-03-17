import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, FileText, Calendar, BarChart3, Hexagon } from 'lucide-react';
import { useStore } from '../store';

export const Layout: React.FC = () => {
  const { missions, invoices } = useStore();
  
  const activeMissionsCount = missions.filter(m => m.status === 'active').length;
  const overdueInvoicesCount = invoices.filter(i => i.status === 'overdue').length;

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Hexagon className="icon" size={28} />
          <span>FreelanceHub</span>
        </div>
        
        <nav className="flex-col gap-2">
          <NavLink to="/dashboard" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <div className="nav-label-container">
              <LayoutDashboard size={18} />
              <span className="nav-label">Dashboard</span>
            </div>
          </NavLink>
          
          <NavLink to="/clients" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <div className="nav-label-container">
              <Users size={18} />
              <span className="nav-label">Clients</span>
            </div>
          </NavLink>
          
          <NavLink to="/missions" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <div className="nav-label-container">
              <Briefcase size={18} />
              <span className="nav-label">Missions</span>
            </div>
            {activeMissionsCount > 0 && <span className="nav-badge">{activeMissionsCount}</span>}
          </NavLink>
          
          <NavLink to="/invoices" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <div className="nav-label-container">
              <FileText size={18} />
              <span className="nav-label">Invoices</span>
            </div>
            {overdueInvoicesCount > 0 && (
              <span className="nav-badge" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>
                {overdueInvoicesCount}
              </span>
            )}
          </NavLink>

          <NavLink to="/meetings" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <div className="nav-label-container">
              <Calendar size={18} />
              <span className="nav-label">Meetings</span>
            </div>
          </NavLink>

          <NavLink to="/analytics" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <div className="nav-label-container">
              <BarChart3 size={18} />
              <span className="nav-label">Analytics</span>
            </div>
          </NavLink>
        </nav>
      </aside>
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};
