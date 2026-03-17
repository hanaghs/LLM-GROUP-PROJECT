import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Briefcase, FileText, Calendar, BarChart3, 
  Hexagon, Search, Plus, Settings as SettingsIcon 
} from 'lucide-react';
import { useStore } from '../store';

export const Layout: React.FC = () => {
  const { missions, invoices, user } = useStore();
  const navigate = useNavigate();
  
  const activeMissionsCount = missions.filter(m => m.status === 'active').length;
  const overdueInvoicesCount = invoices.filter(i => i.status === 'overdue').length;

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="app-layout">
      <header className="top-nav">
        {/* Upper Strip */}
        <div className="top-nav-upper">
          <div className="nav-logo">
            <Hexagon className="icon" size={28} />
            <span>FreelanceHub</span>
          </div>
          
          <div className="nav-actions">
            <button className="btn btn-ghost btn-icon" aria-label="Search">
              <Search size={20} />
            </button>
            
            <button className="btn btn-primary" onClick={() => navigate('/missions')}>
              <Plus size={18} />
              <span className="hidden-sm">New Mission</span>
            </button>

            <div className="avatar nav-avatar">
              {getInitials(user?.name)}
            </div>
          </div>
        </div>

        {/* Lower Strip (Tabs) */}
        <div className="top-nav-tabs">
          <NavLink to="/dashboard" className={({isActive}) => `tab-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            <span className="tab-label">Dashboard</span>
          </NavLink>
          
          <NavLink to="/clients" className={({isActive}) => `tab-item ${isActive ? 'active' : ''}`}>
            <Users size={18} />
            <span className="tab-label">Clients</span>
          </NavLink>
          
          <NavLink to="/missions" className={({isActive}) => `tab-item ${isActive ? 'active' : ''}`}>
            <Briefcase size={18} />
            <span className="tab-label">Missions</span>
            {activeMissionsCount > 0 && <span className="tab-badge badge-primary">{activeMissionsCount}</span>}
          </NavLink>
          
          <NavLink to="/invoices" className={({isActive}) => `tab-item ${isActive ? 'active' : ''}`}>
            <FileText size={18} />
            <span className="tab-label">Invoices</span>
            {overdueInvoicesCount > 0 && <span className="tab-badge badge-danger">{overdueInvoicesCount}</span>}
          </NavLink>

          <NavLink to="/meetings" className={({isActive}) => `tab-item ${isActive ? 'active' : ''}`}>
            <Calendar size={18} />
            <span className="tab-label">Meetings</span>
          </NavLink>

          <NavLink to="/analytics" className={({isActive}) => `tab-item ${isActive ? 'active' : ''}`}>
            <BarChart3 size={18} />
            <span className="tab-label">Analytics</span>
          </NavLink>

          <NavLink to="/settings" className={({isActive}) => `tab-item ${isActive ? 'active' : ''}`}>
            <SettingsIcon size={18} />
            <span className="tab-label">Settings</span>
          </NavLink>
        </div>
      </header>
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};
