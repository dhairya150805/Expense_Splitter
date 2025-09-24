import { useState } from 'react'
import './App.css'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import { clearToken, getToken, decodeJwtPayload } from './api'

function App() {
  const [token, setTokenState] = useState(getToken())
  const [userId, setUserId] = useState(() => {
    const t = getToken()
    const payload = t ? decodeJwtPayload(t) : null
    return payload?.id || ''
  })

  const onAuthed = ({ token: t, userId: uid }) => {
    setTokenState(t)
    setUserId(uid || '')
  }

  const logout = () => {
    clearToken()
    setTokenState('')
    setUserId('')
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Expense Splitter</h1>
        <nav className="nav">
          {token && <button className="nav-btn" onClick={logout}>Logout</button>}
        </nav>
      </header>

      <main className="main">
        {!token ? (
          <Auth onAuthed={onAuthed} />
        ) : (
          <Dashboard userId={userId} />
        )}
      </main>

      <footer className="footer">
        <small className="muted">Connected to backend at http://localhost:3000. Create group, add members, add expenses, and view settlement summary.</small>
      </footer>
    </div>
  )
}

export default App
