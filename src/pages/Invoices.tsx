import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, FileText, Download, Check, Send, Edit2, Trash2 } from 'lucide-react';
import type { Invoice, InvoiceItem } from '../types';
import { format, parseISO, isValid } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Invoices: React.FC = () => {
  const { clients, missions, invoices, addInvoice, updateInvoice, deleteInvoice } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const [formData, setFormData] = useState({
    missionId: '', clientId: '', issueDate: new Date().toISOString().split('T')[0], dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0], items: [] as InvoiceItem[], taxRate: 0, status: 'draft' as Invoice['status']
  });

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Unknown Client';
  const getMissionTitle = (id: string) => missions.find(m => m.id === id)?.title || 'Unknown Mission';
  const formatDateSafe = (dStr: string) => { if (!dStr) return ''; const date = parseISO(dStr); return isValid(date) ? format(date, 'MMM d, yyyy') : ''; };

  const handleOpenModal = (invoice?: Invoice) => {
    if (invoice) {
      setEditingInvoice(invoice);
      setFormData({ missionId: invoice.missionId, clientId: invoice.clientId, issueDate: invoice.issueDate, dueDate: invoice.dueDate, items: invoice.items, taxRate: invoice.subtotal ? (invoice.tax / invoice.subtotal) * 100 : 0, status: invoice.status });
    } else {
      setEditingInvoice(null);
      const defaultMission = missions.length > 0 ? missions[0] : null;
      setFormData({ 
        missionId: defaultMission?.id || '', 
        clientId: defaultMission?.clientId || '', 
        issueDate: new Date().toISOString().split('T')[0], 
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0], 
        items: defaultMission ? [{ id: crypto.randomUUID(), description: defaultMission.title, quantity: 1, unitPrice: defaultMission.cost }] : [], 
        taxRate: 0, 
        status: 'draft' 
      });
    }
    setIsModalOpen(true);
  };

  const handleMissionSelect = (mId: string) => {
    const mission = missions.find(m => m.id === mId);
    if (mission) {
      setFormData(p => ({ ...p, missionId: mId, clientId: mission.clientId, items: [{ id: crypto.randomUUID(), description: mission.title, quantity: 1, unitPrice: mission.cost }] }));
    }
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((s, item) => s + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * (formData.taxRate / 100);
    return { subtotal, tax, total: subtotal + tax };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totals = calculateTotals();
    const dataToSave = {
      missionId: formData.missionId, clientId: formData.clientId, issueDate: formData.issueDate, dueDate: formData.dueDate, items: formData.items, status: formData.status, ...totals
    };

    if (editingInvoice) { updateInvoice(editingInvoice.id, dataToSave); } 
    else { addInvoice({ ...dataToSave, remindersSent: 0, invoiceNumber: '' }); }
    setIsModalOpen(false);
  };

  const generatePDF = (invoice: Invoice) => {
    const client = clients.find(c => c.id === invoice.clientId);
    if (!client) return;
    const doc = new jsPDF();
    doc.setFontSize(20); doc.text('INVOICE', 14, 22);
    doc.setFontSize(10); doc.text(`Invoice #: ${invoice.invoiceNumber}`, 14, 30);
    doc.text(`Issue Date: ${formatDateSafe(invoice.issueDate)}`, 14, 35);
    doc.text(`Due Date: ${formatDateSafe(invoice.dueDate)}`, 14, 40);
    doc.setFontSize(12); doc.text('Bill To:', 14, 55);
    doc.setFontSize(10); doc.text(client.name, 14, 62);
    if (client.company) doc.text(client.company, 14, 67);
    
    const tableData = invoice.items.map(i => [i.description, i.quantity.toString(), `$${i.unitPrice.toFixed(2)}`, `$${(i.quantity * i.unitPrice).toFixed(2)}`]);
    autoTable(doc, { startY: 80, head: [['Description', 'Qty', 'Unit Price', 'Total']], body: tableData, theme: 'striped', headStyles: { fillColor: [123, 110, 246] } });
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, 140, finalY);
    doc.text(`Tax: $${invoice.tax.toFixed(2)}`, 140, finalY + 7);
    doc.setFont('helvetica', 'bold'); doc.text(`Total Due: $${invoice.total.toFixed(2)}`, 140, finalY + 15);
    doc.save(`${invoice.invoiceNumber}.pdf`);
  };

  const markAsPaid = (id: string) => updateInvoice(id, { status: 'paid', paidDate: new Date().toISOString() });
  const sendReminder = (id: string) => {
    const i = invoices.find(inv => inv.id === id);
    if (i) updateInvoice(id, { remindersSent: i.remindersSent + 1, lastReminderDate: new Date().toISOString() });
    alert('Reminder logged (simulated email send).');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Invoices</h1>
          <p>Generate invoices and track payments.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()} disabled={missions.length === 0}>
          <Plus size={18} /> Create Invoice
        </button>
      </div>

      {invoices.length === 0 ? (
        <div className="empty-state">
          <FileText className="icon mx-auto" />
          <h3>No invoices yet</h3>
          <p>Complete a mission to create your first invoice.</p>
          <button className="btn btn-primary mt-4" onClick={() => handleOpenModal()} disabled={missions.length === 0}>Create Invoice</button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Client / Mission</th>
                  <th>Dates</th>
                  <th>Status</th>
                  <th className="text-right">Total</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.sort((a,b) => b.createdAt - a.createdAt).map(inv => (
                  <tr key={inv.id}>
                    <td><span className="mono font-semibold text-text-primary">{inv.invoiceNumber}</span></td>
                    <td>
                      <div className="font-medium text-text-primary">{getClientName(inv.clientId)}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>{getMissionTitle(inv.missionId)}</div>
                    </td>
                    <td className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <div>Iss: {formatDateSafe(inv.issueDate)}</div>
                      <div style={{ color: new Date(inv.dueDate) < new Date() && inv.status !== 'paid' ? 'var(--danger)' : 'inherit' }}>Due: {formatDateSafe(inv.dueDate)}</div>
                    </td>
                    <td>
                      <span className={`badge badge-${inv.status === 'paid' ? 'success' : inv.status === 'overdue' ? 'danger' : inv.status === 'sent' ? 'warning' : 'neutral'}`}>
                        {inv.status}
                      </span>
                      {inv.remindersSent > 0 && <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }} title={`Reminders sent: ${inv.remindersSent}`}>({inv.remindersSent} rem)</span>}
                    </td>
                    <td className="text-right mono font-semibold text-brand text-lg">
                      ${inv.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1 items-center">
                        {inv.status !== 'paid' && (
                          <>
                            <button className="btn btn-ghost" title="Mark as Paid" style={{ padding: '0.375rem', color: 'var(--success)' }} onClick={() => markAsPaid(inv.id)}><Check size={16}/></button>
                            <button className="btn btn-ghost" title="Send Reminder" style={{ padding: '0.375rem' }} onClick={() => sendReminder(inv.id)}><Send size={16}/></button>
                          </>
                        )}
                        <button className="btn btn-ghost" title="Download PDF" style={{ padding: '0.375rem' }} onClick={() => generatePDF(inv)}><Download size={16} /></button>
                        <button className="btn btn-ghost" title="Edit" style={{ padding: '0.375rem' }} onClick={() => handleOpenModal(inv)}><Edit2 size={16} /></button>
                        <button className="btn btn-ghost text-danger" title="Delete" style={{ padding: '0.375rem' }} onClick={() => deleteInvoice(inv.id)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <h2 className="mb-6">{editingInvoice ? 'Edit Invoice' : 'Create Invoice'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="input-group">
                  <label className="input-label">Mission *</label>
                  <select required className="input-field" value={formData.missionId} onChange={(e) => handleMissionSelect(e.target.value)}>
                    {missions.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Status *</label>
                  <select required className="input-field" value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value as any }))}>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="input-group">
                  <label className="input-label">Issue Date *</label>
                  <input required type="date" className="input-field" value={formData.issueDate} onChange={e => setFormData(p => ({ ...p, issueDate: e.target.value }))} />
                </div>
                <div className="input-group">
                  <label className="input-label">Due Date *</label>
                  <input required type="date" className="input-field" value={formData.dueDate} onChange={e => setFormData(p => ({ ...p, dueDate: e.target.value }))} />
                </div>
              </div>

              <div className="mt-4 mb-2">
                <h3 className="mb-3">Line Items</h3>
                {formData.items.map((item, i) => (
                  <div key={item.id} className="flex gap-2 mb-2 items-center">
                    <input required type="text" className="input-field" style={{ flex: 1 }} value={item.description} onChange={(e) => { const it = [...formData.items]; it[i].description = e.target.value; setFormData(p => ({ ...p, items: it })); }} placeholder="Description" />
                    <input required type="number" min="1" className="input-field" style={{ width: '80px' }} value={item.quantity} onChange={(e) => { const it = [...formData.items]; it[i].quantity = parseInt(e.target.value) || 0; setFormData(p => ({ ...p, items: it })); }} />
                    <input required type="number" min="0" step="0.01" className="input-field" style={{ width: '100px' }} value={item.unitPrice} onChange={(e) => { const it = [...formData.items]; it[i].unitPrice = parseFloat(e.target.value) || 0; setFormData(p => ({ ...p, items: it })); }} />
                    <div className="mono font-semibold" style={{ width: '80px', textAlign: 'right' }}>${(item.quantity * item.unitPrice).toFixed(2)}</div>
                    <button type="button" className="btn btn-ghost text-danger" style={{ padding: '0.5rem' }} onClick={() => setFormData(p => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }))}><Trash2 size={16} /></button>
                  </div>
                ))}
                <button type="button" className="btn btn-secondary mt-2" onClick={() => setFormData(p => ({ ...p, items: [...p.items, { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 }] }))}>
                  <Plus size={16} /> Add Item
                </button>
              </div>

              <div className="flex justify-end mt-6 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                <div style={{ width: '250px' }}>
                  <div className="flex justify-between mb-2"><span className="text-secondary">Subtotal:</span><span className="mono">${calculateTotals().subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between mb-2 items-center">
                    <span className="text-secondary">Tax (%):</span>
                    <input type="number" min="0" max="100" className="input-field" style={{ width: '80px', padding: '0.25rem 0.5rem' }} value={formData.taxRate} onChange={e => setFormData(p => ({ ...p, taxRate: parseFloat(e.target.value) || 0 }))} />
                  </div>
                  <div className="flex justify-between mb-2"><span className="text-secondary">Tax Amount:</span><span className="mono">${calculateTotals().tax.toFixed(2)}</span></div>
                  <div className="flex justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--border-light)', fontSize: '1.25rem' }}>
                    <span className="font-semibold">Total:</span><span className="mono font-semibold text-brand">${calculateTotals().total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingInvoice ? 'Save Changes' : 'Create Invoice'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
