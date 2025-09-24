// Simple API helper using direct backend URL (no proxy)
// Provides: signup, login, createGroup, addMember, addExpense, groupSummary

const API_BASE = 'http://localhost:3000';

export const getToken = () => localStorage.getItem('token');
export const setToken = (t) => localStorage.setItem('token', t);
export const clearToken = () => localStorage.removeItem('token');

export function decodeJwtPayload(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded || null;
  } catch (_) {
    return null;
  }
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  // backend returns json always
  const data = await res.json().catch(() => ({}));
  return data;
}

export const api = {
  // Auth
  signup: (payload) => request('/auth/signup', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  // Group
  createGroup: (payload) => request('/group/addgroup', { method: 'POST', body: payload, auth: true }),
  addMember: (payload) => request('/group/addmember', { method: 'POST', body: payload, auth: true }),
  listGroups: (member) => request(member ? `/group?member=${encodeURIComponent(member)}` : '/group', { method: 'GET', auth: true }),
  getGroup: (idOrName) => request(`/group/${encodeURIComponent(idOrName)}`, { method: 'GET', auth: true }),
  groupSummary: (idOrName) => request(`/group/${encodeURIComponent(idOrName)}/summary`, { method: 'GET', auth: true }),
  // Expense
  addExpense: (payload) => request('/expense/addexpense', { method: 'POST', body: payload, auth: true }),
};
