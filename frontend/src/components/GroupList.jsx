import { useEffect, useState } from 'react';
import { api } from '../api';

export default function GroupList({ userId, onOpen }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.listGroups(userId);
        if (mounted) setGroups(Array.isArray(res) ? res : []);
      } catch (e) {
        if (mounted) setError('Failed to load groups');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, [userId]);

  return (
    <div className="card">
      <h3>Your Groups</h3>
      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
          {groups.length === 0 && <li className="muted">No groups yet. Create one below.</li>}
          {groups.map(g => (
            <li key={g._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', padding: '8px 0' }}>
              <div>
                <strong>{g.groupName}</strong>
                <div className="muted" style={{ fontSize: 12 }}>{g.members?.length || 0} members</div>
              </div>
              <button className="nav-btn" onClick={() => onOpen(g)}>
                Open
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
