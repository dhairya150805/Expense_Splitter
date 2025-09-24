import { useState } from 'react';
import { api } from '../api';

export default function CreateGroup({ userId, onCreated }) {
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const res = await api.createGroup({ groupName, userId });
      if (res && res._id) {
        setMsg('Group created');
        setGroupName('');
        onCreated && onCreated(res);
      } else {
        setMsg(res?.message || 'Failed to create group');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Create Group</h3>
      <form onSubmit={submit} className="form">
        <div>
          <label>Group name</label>
          <input value={groupName} onChange={(e) => setGroupName(e.target.value)} required />
        </div>
        <button className="primary" disabled={loading}>{loading ? 'Creating…' : 'Create'}</button>
      </form>
      {msg && <p className="muted" style={{ marginTop: 8 }}>{msg}</p>}
    </div>
  );
}
