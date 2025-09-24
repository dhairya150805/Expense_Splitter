import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Expense({ group = null, defaultGroupIdentifier = '', defaultPayerIdentifier = '', onAdded }) {
  const [groupIdentifier, setGroupIdentifier] = useState(group?._id || group?.groupName || defaultGroupIdentifier);
  const [payerIdentifier, setPayerIdentifier] = useState(defaultPayerIdentifier);
  const [form, setForm] = useState({ amount: '', description: '', expenseDate: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Keep identifiers in sync when props change (group loads asynchronously)
  useEffect(() => {
    if (group) {
      setGroupIdentifier(group._id || group.groupName || '');
    }
  }, [group?._id, group?.groupName]);

  useEffect(() => {
    if (defaultPayerIdentifier) setPayerIdentifier(defaultPayerIdentifier);
  }, [defaultPayerIdentifier]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const payload = {
        groupId: groupIdentifier,
        groupName: groupIdentifier,
        paidBy: payerIdentifier,
        amount: Number(form.amount),
        description: form.description,
        expenseDate: form.expenseDate || undefined,
      };
      const res = await api.addExpense(payload);
      if (res?.message || res?.error) {
        setMsg(res.message || res.error);
      } else {
        setMsg('Expense added');
      }
      setForm({ amount: '', description: '', expenseDate: '' });
      onAdded && onAdded();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Add Expense</h3>
      <form onSubmit={submit} className="form">
        {!group && (
          <div className="grid-2">
            <div>
              <label>Group (ID or Name)</label>
              <input value={groupIdentifier} onChange={(e) => setGroupIdentifier(e.target.value)} placeholder="e.g., Goa Trip or 652..." required />
            </div>
            <div>
              <label>Paid By (Name or Email or ID)</label>
              <input value={payerIdentifier} onChange={(e) => setPayerIdentifier(e.target.value)} placeholder="e.g., John Doe or john@mail.com" required />
            </div>
          </div>
        )}
        {group && (
          <div className="grid-2">
            <div>
              <label>Group</label>
              <input value={`${group.groupName} (${group._id})`} disabled />
            </div>
            <div>
              <label>Paid By (Name or Email or ID)</label>
              <input value={payerIdentifier} onChange={(e) => setPayerIdentifier(e.target.value)} placeholder="e.g., John Doe or john@mail.com" required />
            </div>
          </div>
        )}
        <div className="grid-2">
          <div>
            <label>Amount</label>
            <input type="number" min="0" step="0.01" name="amount" value={form.amount} onChange={handleChange} required />
          </div>
          <div>
            <label>Date</label>
            <input type="date" name="expenseDate" value={form.expenseDate} onChange={handleChange} />
          </div>
        </div>
        <div>
          <label>Description</label>
          <input name="description" value={form.description} onChange={handleChange} placeholder="e.g., Dinner split" />
        </div>
        <button className="primary" disabled={loading || !(group ? true : !!groupIdentifier) || !payerIdentifier}>{loading ? 'Adding…' : 'Add Expense'}</button>
      </form>
      {msg && <p className="muted" style={{ marginTop: 8 }}>{msg}</p>}
    </div>
  );
}
