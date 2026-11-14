import React, { useState } from 'react';
import { BrainCircuit, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthPageProps {
  onLogin: (user: AuthUser, token: string) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'learner' | 'recruiter'>('learner');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const body = mode === 'login'
        ? { email, password }
        : { name, email, password, role };

      const res = await fetch(API + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Authentication failed');

      localStorage.setItem('sm_token', data.access_token);
      localStorage.setItem('sm_user', JSON.stringify(data.user));
      onLogin(data.user, data.access_token);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  // Demo login shortcuts
  async function demoLogin(demoEmail: string, demoPass: string) {
    setEmail(demoEmail);
    setPassword(demoPass);
    setMode('login');
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: demoPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Demo login failed');
      localStorage.setItem('sm_token', data.access_token);
      localStorage.setItem('sm_user', JSON.stringify(data.user));
      onLogin(data.user, data.access_token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      {/* Left branding panel */}
      <div className="auth-brand">
        <div className="auth-brand-inner">
          <div className="auth-logo">
            <BrainCircuit size={32} />
            <span>SkillMind AI</span>
          </div>
          <h1 className="auth-headline">
            Your AI-powered<br />career companion
          </h1>
          <p className="auth-subline">
            Personalized learning paths, skill gap analysis, and intelligent career matching — all in one platform.
          </p>
          <div className="auth-features">
            {[
              { icon: '🎯', label: 'AI Career Matching' },
              { icon: '🗺️', label: 'Adaptive Roadmaps' },
              { icon: '📊', label: 'Skill Analytics' },
              { icon: '🤖', label: 'AI Mentor Chat' },
            ].map(f => (
              <div key={f.label} className="auth-feature-pill">
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-card">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setError(''); }}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => { setMode('register'); setError(''); }}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'register' && (
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Alex Rivera"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  minLength={2}
                />
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-input-wrap">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder={mode === 'register' ? 'Min 6 characters' : '••••••••'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(v => !v)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div className="form-group">
                <label>I am a…</label>
                <div className="role-select">
                  {(['learner', 'recruiter'] as const).map(r => (
                    <button
                      key={r}
                      type="button"
                      className={`role-btn ${role === r ? 'active' : ''}`}
                      onClick={() => setRole(r)}
                    >
                      {r === 'learner' ? '🎓 Learner' : '💼 Recruiter'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="auth-error">
                ⚠️ {error}
              </div>
            )}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading
                ? <><Loader2 size={16} className="spin" /> Processing…</>
                : mode === 'login' ? 'Sign In →' : 'Create Account →'
              }
            </button>
          </form>

          {/* Demo shortcuts */}
          <div className="auth-demo">
            <div className="auth-demo-label">
              <Sparkles size={13} /> Try a demo account
            </div>
            <div className="auth-demo-btns">
              <button
                className="demo-btn"
                onClick={() => demoLogin('demo@learner.com', 'demo1234')}
                disabled={loading}
              >
                🎓 Demo Learner
              </button>
              <button
                className="demo-btn"
                onClick={() => demoLogin('recruiter@demo.com', 'demo1234')}
                disabled={loading}
              >
                💼 Demo Recruiter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
