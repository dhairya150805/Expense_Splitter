import { useState } from 'react';
import { api, setToken, decodeJwtPayload } from '../api';

export default function Auth({ onAuthed }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ firstname: '', lastname: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      if (mode === 'signup') {
        const { firstname, lastname, email, password } = form;
        const res = await api.signup({ firstname, lastname, email, password });
        setMsg(res.message || 'Signed up');
        setMode('login');
      } else {
        const { email, password } = form;
        const res = await api.login({ email, password });
        setMsg(res.message || 'Logged in');
        if (res.token) {
          setToken(res.token);
          const payload = decodeJwtPayload(res.token);
          onAuthed({ token: res.token, userId: payload?.id || null });
        }
      }
    } catch (err) {
      setMsg('Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="tabs">
        <button className={mode==='login'?'tab active':'tab'} onClick={() => setMode('login')}>Login</button>
        <button className={mode==='signup'?'tab active':'tab'} onClick={() => setMode('signup')}>Sign Up</button>
      </div>

      <form onSubmit={submit} className="form">
        {mode === 'signup' && (
          <div className="grid-2">
            <div>
              <label>First name</label>
              <input name="firstname" value={form.firstname} onChange={handleChange} required />
            </div>
            <div>
              <label>Last name</label>
              <input name="lastname" value={form.lastname} onChange={handleChange} required />
            </div>
          </div>
        )}
        <div>
          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div>
          <label>Password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </div>
        <button type="submit" disabled={loading} className="primary">
          {loading ? 'Please wait…' : (mode === 'signup' ? 'Create account' : 'Login')}
        </button>
      </form>

      {msg && <p className="muted" style={{ marginTop: 8 }}>{msg}</p>}
    </div>
  );
}
