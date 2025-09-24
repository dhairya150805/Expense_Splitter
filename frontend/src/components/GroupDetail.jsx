import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import Expense from './Expense';
import Summary from './Summary';

export default function GroupDetail({ userId, groupIdOrName, onBack }) {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [adding, setAdding] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.getGroup(groupIdOrName);
      if (!res || res.message === 'Group not found') {
        setError('Group not found');
        setGroup(null);
      } else {
        setGroup(res);
      }
    } catch (e) {
      setError('Failed to load group');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupIdOrName]);

  const addMember = async (e) => {
    e.preventDefault();
    if (!memberInput.trim() || !group) return;
    setAdding(true);
    try {
      const payload = { groupId: group._id, groupName: group.groupName, user: memberInput, userId: memberInput };
      const res = await api.addMember(payload);
      if (res && res._id) {
        setMemberInput('');
        await load();
        setRefreshKey(x => x + 1);
      }
    } finally {
      setAdding(false);
    }
  };

  const members = useMemo(() => (group?.members || []).map(m => m.name), [group]);

  return (
    <div className="main" style={{ gap: 16 }}>
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0 }}>{group?.groupName || groupIdOrName}</h2>
            <div className="muted" style={{ fontSize: 12 }}>{group?.members?.length || 0} members</div>
          </div>
          <button className="nav-btn" onClick={onBack}>Back</button>
        </div>
      </div>

      <div className="grid-2">
        <div className="card" style={{ padding: '1rem' }}>
          <h3>Members</h3>
          {loading ? (
            <p className="muted">Loading…</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {members.length === 0 && <li className="muted">No members yet</li>}
              {members.map((n, idx) => (
                <li key={idx} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)' }}>{n}</li>
              ))}
            </ul>
          )}

          <form onSubmit={addMember} className="form" style={{ marginTop: 12 }}>
            <div>
              <label>Add member (Name / Email / ID)</label>
              <input value={memberInput} onChange={(e) => setMemberInput(e.target.value)} placeholder="e.g., John Doe or john@mail.com" />
            </div>
            <button className="primary" disabled={adding || !memberInput.trim()}>{adding ? 'Adding…' : 'Add Member'}</button>
          </form>
        </div>

        <Expense group={group} defaultPayerIdentifier={userId} onAdded={() => setRefreshKey(x => x + 1)} />
      </div>

      <Summary group={group} refreshKey={refreshKey} />
    </div>
  );
}
