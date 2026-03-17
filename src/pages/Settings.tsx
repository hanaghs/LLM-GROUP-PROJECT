import React, { useState } from 'react';
import { useStore } from '../store';
import { Save, LogOut, Upload, ShieldAlert } from 'lucide-react';

export default function Settings() {
  const { user, updateUser, logout } = useStore();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [workspace, setWorkspace] = useState({
    workspaceName: user?.workspaceName || '',
    currency: user?.currency || 'USD',
    timezone: user?.timezone || 'America/Los_Angeles',
  });
  const [notifications, setNotifications] = useState(user?.notifications || {
    email: true,
    invoiceReminders: true,
    overdueAlerts: true,
    meetingReminders: true,
  });
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: user?.twoFactorEnabled || false,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveProfile = () => {
    updateUser(profile);
    alert('Profile saved!');
  };

  const handleSaveWorkspace = () => {
    updateUser(workspace);
    alert('Workspace settings saved!');
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    const newNotifs = { ...notifications, [key]: !notifications[key] };
    setNotifications(newNotifs);
    updateUser({ notifications: newNotifs });
  };

  const handleToggle2FA = () => {
    const new2FA = !security.twoFactorEnabled;
    setSecurity({ ...security, twoFactorEnabled: new2FA });
    updateUser({ twoFactorEnabled: new2FA });
  };

  if (!user) return null;

  return (
    <div className="settings-page">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1>Settings</h1>
          <p>Manage your account settings and preferences.</p>
        </div>
        <button onClick={logout} className="btn btn-secondary">
          <LogOut size={18} />
          Sign out
        </button>
      </div>

      <div className="settings-grid">
        {/* Profile Section */}
        <div className="card settings-card">
          <div className="card-header border-b pb-4 mb-4">
            <h3>Profile</h3>
          </div>
          <div className="settings-content">
            <div className="settings-row">
              <div className="settings-label">
                <strong>Profile Photo</strong>
                <p>Update your avatar</p>
              </div>
              <div className="settings-control flex items-center gap-4">
                <div className="avatar avatar-lg">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <button className="btn btn-secondary btn-sm">
                  <Upload size={16} /> Upload
                </button>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-label">
                <strong>Full Name</strong>
              </div>
              <div className="settings-control">
                <input 
                  type="text" 
                  className="input-field" 
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                />
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-label">
                <strong>Email Address</strong>
              </div>
              <div className="settings-control">
                <input 
                  type="email" 
                  className="input-field" 
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button onClick={handleSaveProfile} className="btn btn-primary">
                <Save size={18} /> Save Profile
              </button>
            </div>
          </div>
        </div>

        {/* Workspace Section */}
        <div className="card settings-card">
          <div className="card-header border-b pb-4 mb-4">
            <h3>Workspace</h3>
          </div>
          <div className="settings-content">
            <div className="settings-row">
              <div className="settings-label">
                <strong>Freelancer Display Name</strong>
              </div>
              <div className="settings-control">
                <input 
                  type="text" 
                  className="input-field" 
                  value={workspace.workspaceName}
                  onChange={(e) => setWorkspace({...workspace, workspaceName: e.target.value})}
                />
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-label">
                <strong>Default Currency</strong>
              </div>
              <div className="settings-control">
                <select 
                  className="input-field"
                  value={workspace.currency}
                  onChange={(e) => setWorkspace({...workspace, currency: e.target.value})}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="VND">VND (₫)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-label">
                <strong>Timezone</strong>
              </div>
              <div className="settings-control">
                <select 
                  className="input-field"
                  value={workspace.timezone}
                  onChange={(e) => setWorkspace({...workspace, timezone: e.target.value})}
                >
                  <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                  <option value="America/New_York">Eastern Time (US & Canada)</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Asia/Ho_Chi_Minh">Ho Chi Minh</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button onClick={handleSaveWorkspace} className="btn btn-primary">
                <Save size={18} /> Save Workspace
              </button>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="card settings-card">
          <div className="card-header border-b pb-4 mb-4">
            <h3>Notifications</h3>
          </div>
          <div className="settings-content">
            <div className="settings-row">
              <div className="settings-label">
                <strong>Email Notifications</strong>
                <p>Receive general updates via email</p>
              </div>
              <div className="settings-control">
                <label className="toggle-switch">
                  <input type="checkbox" checked={notifications.email} onChange={() => toggleNotification('email')} />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
            <div className="settings-row">
              <div className="settings-label">
                <strong>Invoice Payment Reminders</strong>
                <p>Get notified when an invoice is paid</p>
              </div>
              <div className="settings-control">
                <label className="toggle-switch">
                  <input type="checkbox" checked={notifications.invoiceReminders} onChange={() => toggleNotification('invoiceReminders')} />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
            <div className="settings-row">
              <div className="settings-label">
                <strong>Overdue Invoice Alerts</strong>
                <p>Get notified when an invoice is overdue</p>
              </div>
              <div className="settings-control">
                <label className="toggle-switch">
                  <input type="checkbox" checked={notifications.overdueAlerts} onChange={() => toggleNotification('overdueAlerts')} />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
            <div className="settings-row">
              <div className="settings-label">
                <strong>Upcoming Meeting Reminders</strong>
                <p>Get notified 30 minutes before a meeting</p>
              </div>
              <div className="settings-control">
                <label className="toggle-switch">
                  <input type="checkbox" checked={notifications.meetingReminders} onChange={() => toggleNotification('meetingReminders')} />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="card settings-card">
          <div className="card-header border-b pb-4 mb-4">
            <h3>Security</h3>
          </div>
          <div className="settings-content">
            <div className="settings-row">
              <div className="settings-label">
                <strong>Change Password</strong>
              </div>
              <div className="settings-control">
                <div className="flex-col gap-2">
                  <input type="password" placeholder="Current password" className="input-field" value={security.currentPassword} onChange={e => setSecurity({...security, currentPassword: e.target.value})} />
                  <input type="password" placeholder="New password" className="input-field" value={security.newPassword} onChange={e => setSecurity({...security, newPassword: e.target.value})} />
                  <input type="password" placeholder="Confirm new password" className="input-field" value={security.confirmPassword} onChange={e => setSecurity({...security, confirmPassword: e.target.value})} />
                  <button className="btn btn-secondary mt-2">Update Password</button>
                </div>
              </div>
            </div>
            <div className="settings-row">
              <div className="settings-label">
                <strong>Two-Factor Authentication (2FA)</strong>
                <p>Add an extra layer of security to your account</p>
              </div>
              <div className="settings-control">
                <label className="toggle-switch">
                  <input type="checkbox" checked={security.twoFactorEnabled} onChange={handleToggle2FA} />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone Section */}
        <div className="card settings-card border-danger">
          <div className="card-header border-b pb-4 mb-4">
            <h3 className="text-danger flex items-center gap-2"><ShieldAlert size={20} /> Danger Zone</h3>
          </div>
          <div className="settings-content">
            <div className="settings-row">
              <div className="settings-label">
                <strong>Delete Account</strong>
                <p>Permanently delete your account and all of its contents. This action is not reversible.</p>
              </div>
              <div className="settings-control">
                <button onClick={() => setShowDeleteConfirm(true)} className="btn btn-danger">
                  Delete account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Are you absolutely sure?</h2>
            <p className="mt-2 mb-6">This action cannot be undone. This will permanently delete your account, workspace, clients, missions, and invoices from our servers.</p>
            <div className="flex justify-end gap-3">
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => { logout(); setShowDeleteConfirm(false); }}>Yes, delete my account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
