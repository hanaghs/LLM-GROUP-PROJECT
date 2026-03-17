import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Client, Mission, Invoice, Meeting, User } from '../types';

interface StoreState {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  
  clients: Client[];
  missions: Mission[];
  invoices: Invoice[];
  meetings: Meeting[];
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addMission: (mission: Omit<Mission, 'id' | 'createdAt'>) => void;
  updateMission: (id: string, data: Partial<Mission>) => void;
  deleteMission: (id: string) => void;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => void;
  updateInvoice: (id: string, data: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  addMeeting: (meeting: Omit<Meeting, 'id' | 'createdAt'>) => void;
  updateMeeting: (id: string, data: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;
}

const StoreContext = createContext<StoreState>({} as StoreState);
export const useStore = () => useContext(StoreContext);

const LOCAL_KEY = 'freelance-crm-v4';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setIsAuthenticated(data.isAuthenticated || false);
      setUser(data.user || null);
      setClients(data.clients || []);
      setMissions(data.missions || []);
      setInvoices(data.invoices || []);
      setMeetings(data.meetings || []);
    } else {
      // Mock Data Initialization for v3 (Dark Theme SaaS)
      const now = new Date();
      
      const mClients: Client[] = [
        { id: 'c-1', name: 'Alex Johnson', email: 'alex@techflow.io', phone: '+1 555 019 2834', company: 'TechFlow', currency: 'USD', address: 'San Francisco, CA', notes: 'Prefers Slack', createdAt: Date.now() - 30 * 86400000 },
        { id: 'c-2', name: 'Sarah Chen', email: 'schen@horizon.com', phone: '+1 555 982 1102', company: 'Horizon Media', currency: 'USD', address: 'Austin, TX', notes: 'Net 30 terms', createdAt: Date.now() - 15 * 86400000 },
        { id: 'c-3', name: 'Marcus Weaver', email: 'marcus@weavery.co', phone: '+44 20 7123 4567', company: 'Weavery Co', currency: 'GBP', address: 'London, UK', notes: 'Strict brand guidelines', createdAt: Date.now() - 5 * 86400000 }
      ];
      
      const mMissions: Mission[] = [
        { id: 'm-1', clientId: 'c-1', title: 'Q3 Landing Page', description: 'Design + Dev', startDate: new Date(now.getTime() - 20 * 86400000).toISOString().split('T')[0], endDate: new Date(now.getTime() - 2 * 86400000).toISOString().split('T')[0], cost: 3500, status: 'completed', createdAt: Date.now() - 20 * 86400000 },
        { id: 'm-2', clientId: 'c-2', title: 'Brand Refresh', description: 'Complete visual identity', startDate: new Date(now.getTime() - 5 * 86400000).toISOString().split('T')[0], endDate: new Date(now.getTime() + 15 * 86400000).toISOString().split('T')[0], cost: 8000, status: 'active', createdAt: Date.now() - 5 * 86400000 },
        { id: 'm-3', clientId: 'c-3', title: 'E-commerce Proto', description: 'Figma wireframes', startDate: new Date(now.getTime() - 10 * 86400000).toISOString().split('T')[0], endDate: new Date(now.getTime() + 5 * 86400000).toISOString().split('T')[0], cost: 5500, status: 'active', createdAt: Date.now() - 12 * 86400000 },
        { id: 'm-4', clientId: 'c-2', title: 'Social Templates', description: '15 Reusable templates', startDate: new Date(now.getTime() + 20 * 86400000).toISOString().split('T')[0], endDate: new Date(now.getTime() + 35 * 86400000).toISOString().split('T')[0], cost: 1200, status: 'planning', createdAt: Date.now() - 2 * 86400000 }
      ];

      const mInvoices: Invoice[] = [
        { id: 'i-1', invoiceNumber: 'INV-1001', missionId: 'm-1', clientId: 'c-1', issueDate: new Date(now.getTime() - 1 * 86400000).toISOString().split('T')[0], dueDate: new Date(now.getTime() + 14 * 86400000).toISOString().split('T')[0], items: [{ id: 'it-1', description: 'Web Design', quantity: 1, unitPrice: 3500 }], subtotal: 3500, tax: 0, total: 3500, status: 'sent', remindersSent: 1, lastReminderDate: now.toISOString(), createdAt: Date.now() - 86400000 },
        { id: 'i-2', invoiceNumber: 'INV-1000', missionId: 'm-1', clientId: 'c-1', issueDate: new Date(now.getTime() - 45 * 86400000).toISOString().split('T')[0], dueDate: new Date(now.getTime() - 15 * 86400000).toISOString().split('T')[0], items: [{ id: 'it-2', description: 'Initial Strategy', quantity: 1, unitPrice: 1650 }], subtotal: 1650, tax: 0, total: 1650, status: 'paid', remindersSent: 0, paidDate: new Date(now.getTime() - 16 * 86400000).toISOString(), createdAt: Date.now() - 45 * 86400000 },
        { id: 'i-3', invoiceNumber: 'INV-0999', missionId: 'm-3', clientId: 'c-3', issueDate: new Date(now.getTime() - 35 * 86400000).toISOString().split('T')[0], dueDate: new Date(now.getTime() - 20 * 86400000).toISOString().split('T')[0], items: [{ id: 'it-3', description: 'Deposit', quantity: 1, unitPrice: 2750 }], subtotal: 2750, tax: 0, total: 2750, status: 'overdue', remindersSent: 2, lastReminderDate: new Date(now.getTime() - 2 * 86400000).toISOString(), createdAt: Date.now() - 35 * 86400000 }
      ];

      const mMeetings: Meeting[] = [
        { id: 'mt-1', title: 'Kickoff Call', date: now.toISOString().split('T')[0], time: '10:00', clientId: 'c-2', type: 'video', notes: 'Discuss brand direction.\nAction items:\n- Review competitor analysis\n- Finalize color palette', createdAt: Date.now() },
        { id: 'mt-2', title: 'Design Review', date: new Date(now.getTime() + 2 * 86400000).toISOString().split('T')[0], time: '14:30', clientId: 'c-3', type: 'video', notes: 'Present initial wireframes for checkout flow.', createdAt: Date.now() - 86400000 }
      ];

      setClients(mClients);
      setMissions(mMissions);
      setInvoices(mInvoices);
      setMeetings(mMeetings);
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady) {
      localStorage.setItem(LOCAL_KEY, JSON.stringify({ isAuthenticated, user, clients, missions, invoices, meetings }));
    }
  }, [isAuthenticated, user, clients, missions, invoices, meetings, isReady]);

  // Auth Helpers
  const login = (email: string) => {
    setIsAuthenticated(true);
    setUser({
      id: 'u-1',
      name: 'Alex Developer',
      email: email,
      workspaceName: 'Alex.Dev',
      currency: 'USD',
      timezone: 'America/Los_Angeles',
      notifications: {
        email: true,
        invoiceReminders: true,
        overdueAlerts: true,
        meetingReminders: true
      },
      twoFactorEnabled: false
    });
  };
  
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };
  
  const updateUser = (data: Partial<User>) => setUser(p => p ? { ...p, ...data } : null);

  // Helpers
  const addClient = (data: Omit<Client, 'id' | 'createdAt'>) => setClients(p => [...p, { ...data, id: crypto.randomUUID(), createdAt: Date.now() }]);
  const updateClient = (id: string, data: Partial<Client>) => setClients(p => p.map(c => c.id === id ? { ...c, ...data } : c));
  const deleteClient = (id: string) => setClients(p => p.filter(c => c.id !== id));

  const addMission = (data: Omit<Mission, 'id' | 'createdAt'>) => setMissions(p => [...p, { ...data, id: crypto.randomUUID(), createdAt: Date.now() }]);
  const updateMission = (id: string, data: Partial<Mission>) => setMissions(p => p.map(m => m.id === id ? { ...m, ...data } : m));
  const deleteMission = (id: string) => setMissions(p => p.filter(m => m.id !== id));

  const addInvoice = (data: Omit<Invoice, 'id' | 'createdAt'>) => {
    // Auto increment logic loosely
    const num = `INV-${1000 + invoices.length + 1}`;
    setInvoices(p => [...p, { ...data, id: crypto.randomUUID(), invoiceNumber: num, createdAt: Date.now() }]);
  };
  const updateInvoice = (id: string, data: Partial<Invoice>) => setInvoices(p => p.map(i => i.id === id ? { ...i, ...data } : i));
  const deleteInvoice = (id: string) => setInvoices(p => p.filter(i => i.id !== id));

  const addMeeting = (data: Omit<Meeting, 'id' | 'createdAt'>) => setMeetings(p => [...p, { ...data, id: crypto.randomUUID(), createdAt: Date.now() }]);
  const updateMeeting = (id: string, data: Partial<Meeting>) => setMeetings(p => p.map(m => m.id === id ? { ...m, ...data } : m));
  const deleteMeeting = (id: string) => setMeetings(p => p.filter(m => m.id !== id));

  if (!isReady) return null;

  return (
    <StoreContext.Provider value={{
      isAuthenticated, user, login, logout, updateUser,
      clients, missions, invoices, meetings,
      addClient, updateClient, deleteClient,
      addMission, updateMission, deleteMission,
      addInvoice, updateInvoice, deleteInvoice,
      addMeeting, updateMeeting, deleteMeeting
    }}>
      {children}
    </StoreContext.Provider>
  );
};
