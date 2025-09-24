import { useState } from 'react';
import GroupList from './GroupList';
import CreateGroup from './CreateGroup';
import GroupDetail from './GroupDetail';

export default function Dashboard({ userId }) {
  const [openGroup, setOpenGroup] = useState(null);

  if (openGroup) {
    return <GroupDetail userId={userId} groupIdOrName={openGroup._id || openGroup.groupName} onBack={() => setOpenGroup(null)} />
  }

  return (
    <div className="main" style={{ marginTop: 8 }}>
      <div className="card" style={{ padding: '1rem' }}>
        <h2 style={{ marginTop: 0 }}>Dashboard</h2>
        <p className="muted" style={{ marginTop: 4 }}>Browse your groups, open one to add members and expenses, and view real-time summary.</p>
      </div>

      <GroupList userId={userId} onOpen={setOpenGroup} />
      <CreateGroup userId={userId} onCreated={setOpenGroup} />
    </div>
  );
}
