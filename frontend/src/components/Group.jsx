import { useState } from 'react';
import { api } from '../api';

export default function Group({ userId, onGroupChange }) {
  const [groupName, setGroupName] = useState('');
  const [groupIdentifier, setGroupIdentifier] = useState(''); // id or name
  const [memberUserIdentifier, setMemberUserIdentifier] = useState(''); // id, email, or full name
  const [msg, setMsg] = useState('');
  const [creating, setCreating] = useState(false);
  const [adding, setAdding] = useState(false);

  const create = async (e) => {
    e.preventDefault();
    setCreating(true);
    setMsg('');
    try {
      const res = await api.createGroup({ groupName, userId });
      if (res && res._id) {
        setGroupIdentifier(res._id);
        onGroupChange?.(res._id);
        setMsg(`Group created: ${res.groupName}`);
      } else {
        setMsg(res?.message || 'Failed to create group');
      }
    } finally {
      setCreating(false);
    }
  };

  const addMember = async (e) => {
    e.preventDefault();
    setAdding(true);
    setMsg('');
    try {
      // backend accepts groupId or groupName, and user or userId
      const payload = { };
      if (groupIdentifier && groupIdentifier.trim()) {
        // Try to detect if looks like ObjectId; but backend is flexible, send both to be safe
        payload.groupId = groupIdentifier;
        payload.groupName = groupIdentifier;
      }
      if (memberUserIdentifier && memberUserIdentifier.trim()) {
        payload.user = memberUserIdentifier; // name/email/id
        payload.userId = memberUserIdentifier;
      }
      const res = await api.addMember(payload);
      if (res && res._id) {
        onGroupChange?.(res._id);
        setMsg('Member added');
      } else {
        setMsg(res || 'Failed to add member');
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="grid-2">
      <div className="card">
        <h3>Create Group</h3>
        <form onSubmit={create} className="form">
          <div>
            <label>Group name</label>
            <input value={groupName} onChange={(e) => setGroupName(e.target.value)} required />
          </div>
          <button className="primary" disabled={creating}>{creating ? 'Creating…' : 'Create'}</button>
        </form>
      </div>

      <div className="card">
        <h3>Add Member</h3>
        <form onSubmit={addMember} className="form">
          <div>
            <label>Group (ID or Name)</label>
            <input value={groupIdentifier} onChange={(e) => setGroupIdentifier(e.target.value)} placeholder="e.g., Goa Trip or 652..." required />
          </div>
          <div>
            <label>Member (Name or Email or ID)</label>
            <input value={memberUserIdentifier} onChange={(e) => setMemberUserIdentifier(e.target.value)} placeholder="e.g., John Doe or john@mail.com" required />
          </div>
          <button className="primary" disabled={adding}>{adding ? 'Adding…' : 'Add Member'}</button>
        </form>
      </div>

      {msg && <p className="muted" style={{ gridColumn: '1 / -1' }}>{msg}</p>}
    </div>
  );
}
