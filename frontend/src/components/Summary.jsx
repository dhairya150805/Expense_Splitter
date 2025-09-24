import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Summary({ group = null, refreshKey = 0 }) {
  const [groupIdentifier, setGroupIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [inFlight, setInFlight] = useState(false);

  const load = async (idOrName) => {
    const ident = idOrName || (group ? (group._id || group.groupName) : groupIdentifier);
    if (!ident) return;
    if (inFlight) return; // avoid overlapping requests
    setInFlight(true);
    setLoading(true);
    setError('');
    try {
      const res = await api.groupSummary(ident);
      if (!res || res.message === 'Group not found') {
        setError('Group not found');
        setData(null);
      } else {
        setData(res);
      }
    } catch (err) {
      setError('Failed to load summary');
      setData(null);
    } finally {
      setLoading(false);
      setInFlight(false);
    }
  };

  useEffect(() => {
    if (group) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group?._id, refreshKey]);

  useEffect(() => {
    if (!group) return;
    let timer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        load();
      }
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group?._id]);

  return (
    <div className="card">
      <h3>Expense Summary</h3>
      {!group && (
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="form">
          <div>
            <label>Group (ID or Name)</label>
            <input value={groupIdentifier} onChange={(e) => setGroupIdentifier(e.target.value)} placeholder="e.g., Goa Trip" />
          </div>
          <button className="primary" disabled={loading || !groupIdentifier}>{loading ? 'Loading…' : 'Show Summary'}</button>
        </form>
      )}

      {error && <p className="muted" style={{ marginTop: 8 }}>{error}</p>}

      {data && (
        <div style={{ marginTop: 12 }}>
          <p className="muted">Group: <strong>{data.groupName}</strong></p>
          {data.summary.length === 0 ? (
            <p className="muted">All settled up ✨</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {data.summary.map((row, idx) => (
                <li key={idx} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <strong>{row.debtorName}</strong> owes <strong>{row.creditorName}</strong> ₹{row.amount.toFixed(2)}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
