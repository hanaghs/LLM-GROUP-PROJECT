export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  currency: string;
  address: string;
  notes: string;
  createdAt: number;
}

export interface Mission {
  id: string;
  clientId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  cost: number;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  createdAt: number;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  missionId: string;
  clientId: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  remindersSent: number;
  lastReminderDate?: string;
  createdAt: number;
  paidDate?: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string; // ISO string
  time: string; // HH:mm
  clientId: string;
  type: 'call' | 'in-person' | 'video';
  notes: string;
  createdAt: number;
}
