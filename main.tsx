import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AuthPage from './AuthPage';
import './style.css';

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

function Root() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('sm_token');
    const storedUser  = localStorage.getItem('sm_user');
    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch { /* ignore bad data */ }
    }
    setChecking(false);
  }, []);

  function handleLogin(u: AuthUser, t: string) {
    setUser(u);
    setToken(t);
  }

  function handleLogout() {
    localStorage.removeItem('sm_token');
    localStorage.removeItem('sm_user');
    setUser(null);
    setToken(null);
  }

  if (checking) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user || !token) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return <App user={user} token={token} onLogout={handleLogout} />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
