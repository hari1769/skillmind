import React, { useEffect, useState, useMemo } from 'react';
import {
  LayoutDashboard,
  BrainCircuit,
  Target,
  Route,
  ClipboardCheck,
  ChartNoAxesCombined,
  MessageCircle,
  Workflow,
  Building2,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Clock3,
  Sparkles,
  Plus,
  Send,
  ArrowUpRight,
  Code2,
  BookOpen,
  ShieldCheck,
  Moon,
  Sun,
  Flame,
  AlertCircle,
  Award,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Settings,
  HelpCircle,
  Zap,
  RotateCcw,
  BookMarked,
  Briefcase,
  Users,
  Search,
  Filter,
  Layers,
  Compass,
  Trophy,
  X,
  Lock,
  Unlock,
  Sliders,
  Bell,
  Star
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip
} from 'recharts';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getToken(): string | null {
  return localStorage.getItem('sm_token');
}

async function req(path: string, opts: any = {}) {
  const token = getToken();
  const r = await fetch(API + path, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
    ...opts
  });
  if (!r.ok) {
    const errText = await r.text();
    throw new Error(errText || `HTTP ${r.status}`);
  }
  return r.json();
}

interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface AppProps {
  user: { id: number; name: string; email: string; role: string };
  token: string;
  onLogout: () => void;
}

export default function App({ user, token, onLogout }: AppProps) {
  // Ecosystem driven by user role
  const [portalMode, setPortalMode] = useState<'learner' | 'recruiter'>(
    user.role === 'recruiter' ? 'recruiter' : 'learner'
  );

  // Navigation pages
  const [page, setPage] = useState('Dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  // State from Backend
  const [profile, setProfile] = useState<any>(null);
  const [match, setMatch] = useState<any>(null);
  const [path, setPath] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [runs, setRuns] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [recruiterOverview, setRecruiterOverview] = useState<any>(null);

  // Floating AI Mentor State (Reference 1)
  const [mentorOpen, setMentorOpen] = useState(true);
  const [chat, setChat] = useState<Array<{ role: 'user' | 'assistant'; text: string; time?: string }>>([
    {
      role: 'assistant',
      text: "Hello Alex! I am your AI Mentor. I've mapped your skill profile against target career requirements. Let me know what you'd like to work on today!",
      time: 'Just now'
    }
  ]);
  const [message, setMessage] = useState('');

  // Interactive Quiz State
  const [quizSkill, setQuizSkill] = useState('JavaScript');
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizResult, setQuizResult] = useState<any>(null);
  const [quizActive, setQuizActive] = useState(false);
  const [quizTimeLeft, setQuizTimeLeft] = useState(600);

  // Modals & Panels
  const [selectedSkillModal, setSelectedSkillModal] = useState<any>(null);
  const [selectedRolePreview, setSelectedRolePreview] = useState('Data Scientist');
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({ 1: true, 2: true, 3: true });
  const [journeySubTab, setJourneySubTab] = useState<'Journey' | 'Achievements' | 'Challenges' | 'Toolkit'>('Journey');

  // Job creation modal
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    company: 'TechVanguard AI',
    location: 'Remote',
    salary_range: '$120,000 - $150,000',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    addToast(`Switched to ${theme === 'light' ? 'Dark' : 'Light'} mode`, 'info');
  };

  async function refresh() {
    try {
      const [p, m, road, pr, ag, ro, jb, rec] = await Promise.all([
        req('/profile'),
        req('/career/match'),
        req('/path'),
        req('/progress/summary'),
        req('/agents/runs'),
        req('/roles'),
        req('/jobs').catch(() => []),
        req('/recruiter/overview').catch(() => null)
      ]);
      setProfile(p);
      setMatch(m);
      setPath(road);
      setProgress(pr);
      setRuns(ag);
      setRoles(ro);
      setJobs(jb);
      setRecruiterOverview(rec);
      setError('');
    } catch (e: any) {
      setError('Cannot connect to API at localhost:8000. ' + e.message);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  // Timer for quiz
  useEffect(() => {
    if (!quizActive || quizTimeLeft <= 0) return;
    const timer = setInterval(() => setQuizTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [quizActive, quizTimeLeft]);

  async function act(fn: () => Promise<any>, successMsg?: string) {
    setLoading(true);
    try {
      await fn();
      await refresh();
      if (successMsg) addToast(successMsg, 'success');
    } catch (e: any) {
      setError(e.message);
      addToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function changeGoal(role: string) {
    await act(async () => {
      await req('/career/goal', { method: 'POST', body: JSON.stringify({ role }) });
    }, `Career goal updated to ${role}. Roadmap re-aligned!`);
  }

  async function resetDemo() {
    if (!confirm('Reset demo state to initial baseline?')) return;
    await act(async () => {
      await req('/demo/reset', { method: 'POST' });
    }, 'Demo workspace successfully reset.');
  }

  async function startInteractiveQuiz(skillName: string) {
    setLoading(true);
    setQuizSkill(skillName);
    try {
      const qs = await req(`/assessments/questions/${encodeURIComponent(skillName)}`);
      setQuizQuestions(qs);
      setCurrentQIndex(0);
      setSelectedAnswers({});
      setQuizResult(null);
      setQuizTimeLeft(600);
      setQuizActive(true);
      setPage('Assessments');
      addToast(`Loaded ${skillName} assessment with 10 questions.`, 'info');
    } catch (e: any) {
      addToast('Could not load quiz questions: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function submitQuiz(scorePercent?: number) {
    setLoading(true);
    try {
      let finalScore = scorePercent;
      if (finalScore === undefined) {
        let correctCount = 0;
        quizQuestions.forEach((q, idx) => {
          if (selectedAnswers[idx] === q.correct_answer) {
            correctCount++;
          }
        });
        finalScore = Math.round((correctCount / Math.max(1, quizQuestions.length)) * 100);
      }

      const res = await req(`/assessments/${encodeURIComponent(quizSkill)}/submit`, {
        method: 'POST',
        body: JSON.stringify({ score: finalScore, answers: selectedAnswers })
      });
      setQuizResult(res);
      setQuizActive(false);
      await refresh();

      if (finalScore < 60) {
        addToast(`Score: ${finalScore}%. Evaluator triggered remedial revision items.`, 'warning');
      } else if (finalScore > 85) {
        addToast(`Score: ${finalScore}%! Mastery verified! Redundant items compressed.`, 'success');
      } else {
        addToast(`Score: ${finalScore}%. Assessment results recorded.`, 'success');
      }
    } catch (e: any) {
      addToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function sendChat(customMsg?: string) {
    const textToSend = customMsg || message;
    if (!textToSend.trim()) return;
    setChat(c => [...c, { role: 'user', text: textToSend, time: 'Just now' }]);
    if (!customMsg) setMessage('');
    try {
      const x = await req('/mentor/chat', { method: 'POST', body: JSON.stringify({ message: textToSend }) });
      setChat(c => [...c, { role: 'assistant', text: x.reply, time: 'Just now' }]);
    } catch (e: any) {
      addToast(e.message, 'error');
    }
  }

  async function handleCreateJob() {
    if (!newJob.title.trim()) return;
    await act(async () => {
      await req('/jobs', {
        method: 'POST',
        body: JSON.stringify(newJob)
      });
      setShowCreateJob(false);
      setNewJob({ title: '', company: 'TechVanguard AI', location: 'Remote', salary_range: '$120,000 - $150,000', description: '' });
    }, 'New job opening posted successfully!');
  }

  async function handleAdvanceStage(appId: number, nextStage: string) {
    await act(async () => {
      await req(`/applications/${appId}/stage?stage=${encodeURIComponent(nextStage)}`, {
        method: 'PATCH'
      });
    }, `Candidate advanced to ${nextStage}`);
  }

  const percent = match?.match || 0;

  // Radar chart data for Reference 2: Dimensions
  const radarData = useMemo(() => [
    { subject: 'Engineering Quality', Candidate: 3.8, Benchmark: 3.2, fullMark: 5 },
    { subject: 'Project Completion', Candidate: 4.2, Benchmark: 3.5, fullMark: 5 },
    { subject: 'Depth / Novelty', Candidate: 3.5, Benchmark: 3.0, fullMark: 5 },
    { subject: 'Innovation', Candidate: 3.9, Benchmark: 2.8, fullMark: 5 },
    { subject: 'Communication', Candidate: 3.6, Benchmark: 3.3, fullMark: 5 }
  ], []);

  // Time-series velocity data for Reference 4: Cosmic Forge
  const velocityData = useMemo(() => [
    { name: 'Week 1', velocity: 4, target: 5 },
    { name: 'Week 2', velocity: 8, target: 10 },
    { name: 'Week 3', velocity: 11, target: 15 },
    { name: 'Week 4', velocity: 16, target: 20 },
    { name: 'Week 5', velocity: 22, target: 25 },
    { name: 'Week 6', velocity: 31, target: 30 }
  ], []);

  // Navigation Items
  const learnerNav = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'My Skills', icon: BrainCircuit },
    { name: 'Learning Journey', icon: Route },
    { name: 'Analytics', icon: ChartNoAxesCombined },
    { name: 'Career Match', icon: Target },
    { name: 'Assessments', icon: ClipboardCheck },
    { name: 'Agent Activity', icon: Workflow },
    { name: 'Job Opportunities', icon: Briefcase }
  ];

  const recruiterNav = [
    { name: 'Recruiter Dashboard', icon: LayoutDashboard },
    { name: 'Job Openings', icon: Briefcase },
    { name: 'Applicants & Pipeline', icon: Users },
    { name: 'Candidate Search', icon: Search }
  ];

  const currentNav = portalMode === 'learner' ? learnerNav : recruiterNav;

  return (
    <div className={`app-container ${theme}`}>
      {/* Toast rack */}
      <div className="toast-rack">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card toast-${t.type}`}>
            {t.type === 'success' && <CheckCircle2 size={16} />}
            {t.type === 'warning' && <AlertCircle size={16} />}
            {t.type === 'error' && <AlertCircle size={16} />}
            {t.type === 'info' && <Sparkles size={16} />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Modern Fixed Sidebar (Reference 1 & 4) */}
      <aside className="app-sidebar">
        <div className="brand-header">
          <div className="brand-logo-ring">
            <Zap size={20} className="brand-icon" />
          </div>
          <div className="brand-text">
            <span className="brand-title">SkillMind AI</span>
            <span className="brand-subtitle">LEARN · PROVE · GROW</span>
          </div>
        </div>

        {/* Portal Mode Switcher */}
        <div className="portal-switcher-box">
          <button
            className={`portal-tab ${portalMode === 'learner' ? 'active' : ''}`}
            onClick={() => {
              setPortalMode('learner');
              setPage('Dashboard');
            }}
          >
            Learner
          </button>
          <button
            className={`portal-tab ${portalMode === 'recruiter' ? 'active' : ''}`}
            onClick={() => {
              setPortalMode('recruiter');
              setPage('Recruiter Dashboard');
            }}
          >
            Recruiter / HR
          </button>
        </div>

        <div className="sidebar-group-label">
          {portalMode === 'learner' ? 'STUDENT WORKSPACE' : 'RECRUITMENT OS'}
        </div>

        <nav className="sidebar-nav">
          {currentNav.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={`nav-button ${page === name ? 'active' : ''}`}
              onClick={() => setPage(name)}
            >
              <Icon size={18} />
              <span className="nav-label">{name}</span>
              {page === name && <span className="nav-active-pip" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom-card">
          <div className="user-profile-tile">
            <div className="user-avatar-orb">AR</div>
            <div className="user-details">
              <span className="user-name">Alex Rivera</span>
              <span className="user-tag">
                {portalMode === 'learner' ? profile?.target_role : 'Senior Tech Recruiter'}
              </span>
            </div>
            <span className="live-status-pulse" title="System Online" />
          </div>
          <div className="sidebar-quick-actions">
            <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            </button>
            <button className="theme-toggle-btn" onClick={resetDemo} title="Reset Baseline">
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Execution Surface */}
      <main className="app-main">
        {/* Floating Header */}
        <header className="app-header">
          <div className="header-breadcrumbs">
            <span className="crumb-root">{portalMode === 'learner' ? 'Learner Hub' : 'Recruitment Hub'}</span>
            <ChevronRight size={14} className="crumb-arrow" />
            <span className="crumb-active">{page}</span>
          </div>

          <div className="header-actions">
            {portalMode === 'learner' && (
              <div
                className="career-role-selector-pill"
                onClick={() => setPage('Career Match')}
                title="Click to change target career"
              >
                <span>&gt;_ {profile?.target_role || 'Full Stack Developer'}</span>
                <ChevronDown size={14} />
              </div>
            )}
            <div className="ai-mode-pill">
              <span className="pill-dot" />
              <span>LIVE AI ENGINE</span>
            </div>
            <button className="header-action-btn" onClick={refresh} title="Refresh Data">
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
            </button>
            <button className="header-action-btn theme-action-btn" onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <div className="header-user-avatar">AR</div>
          </div>
        </header>

        {error && (
          <div className="global-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {!profile ? (
          <div className="loading-canvas">
            <BrainCircuit size={48} className="pulse-icon" />
            <h3>Connecting to SkillMind AI Engine...</h3>
            <p>Gathering verified competencies and career prerequisites</p>
          </div>
        ) : (
          <div className="view-content">
            {/* ============================================================== */}
            {/* REFERENCE 1: MAIN DASHBOARD (Traquiva Style)                   */}
            {/* ============================================================== */}
            {portalMode === 'learner' && page === 'Dashboard' && (
              <div className="ref1-dashboard">
                {/* Reference 1 Top Hero Goal Card */}
                <div className="ref1-goal-hero-card">
                  <div className="ref1-goal-left">
                    <div className="ref1-goal-title-row">
                      <h2>{profile.target_role}</h2>
                      <span className="ref1-active-pill">● Active</span>
                    </div>
                    <div className="ref1-goal-meta">
                      <span>{profile.target_role}</span>
                      <span>·</span>
                      <span>Target: Dec 2026</span>
                      <span>·</span>
                      <span className="meta-green">140d left</span>
                    </div>
                    <button className="ref1-btn-continue" onClick={() => setPage('Learning Journey')}>
                      → Continue Learning
                    </button>
                  </div>

                  <div className="ref1-goal-right">
                    <div className="ref1-percent-large">{percent}%</div>
                    <div className="ref1-percent-label">Complete</div>
                  </div>
                </div>

                {/* Reference 1 Curated Industry Trends & News Section */}
                <div className="ref1-trends-section">
                  <div className="ref1-section-header">
                    <div>
                      <h3>Industry Trends & News</h3>
                      <p>Curated for your {profile.target_role} learning path</p>
                    </div>
                    <button className="icon-refresh-small" onClick={refresh}>
                      <RefreshCw size={14} />
                    </button>
                  </div>

                  <div className="ref1-trends-cards-list">
                    <div className="ref1-trend-card" onClick={() => setPage('Learning Journey')}>
                      <div className="trend-content">
                        <h4>Modern Full Stack & React 19 Architecture</h4>
                        <p>Server components, optimistic UI mutations, and state management patterns.</p>
                        <span className="trend-skill-tag">React · Full Stack</span>
                      </div>
                      <span className="trend-type-badge">Course &gt;</span>
                    </div>

                    <div className="ref1-trend-card" onClick={() => startInteractiveQuiz('JavaScript')}>
                      <div className="trend-content">
                        <h4>Advanced JavaScript & Event Loop Mastery</h4>
                        <p>Asynchronous runtime, closures, microtask queues, and performance profiling.</p>
                        <span className="trend-skill-tag">JavaScript · Core</span>
                      </div>
                      <span className="trend-type-badge">Assessment &gt;</span>
                    </div>

                    <div className="ref1-trend-card" onClick={() => setPage('My Skills')}>
                      <div className="trend-content">
                        <h4>High-Throughput Python & FastAPI Microservices</h4>
                        <p>Asynchronous routing, Pydantic v2 schemas, and relational database optimization.</p>
                        <span className="trend-skill-tag">Python · Backend</span>
                      </div>
                      <span className="trend-type-badge">Tutorial &gt;</span>
                    </div>
                  </div>
                </div>

                {/* KPI Metrics Strip */}
                <div className="kpi-grid" style={{ marginTop: '24px' }}>
                  <div className="kpi-card">
                    <span className="kpi-label">WEEKLY TARGET</span>
                    <div className="kpi-metric-row">
                      <span className="kpi-main-number">{profile.weekly_hours}h</span>
                      <span className="kpi-unit">/ week</span>
                    </div>
                    <div className="progress-pulse-pill">
                      <Flame size={14} /> {progress?.drift || 'On Pace'}
                    </div>
                  </div>
                  <div className="kpi-card">
                    <span className="kpi-label">ACTIVE STREAK</span>
                    <div className="kpi-metric-row">
                      <span className="kpi-main-number">20</span>
                      <span className="kpi-unit">days</span>
                    </div>
                    <span className="kpi-footnote">Keep the momentum going!</span>
                  </div>
                  <div className="kpi-card">
                    <span className="kpi-label">VERIFIED PROFICIENCY</span>
                    <div className="kpi-metric-row">
                      <span className="kpi-main-number">{progress?.assessment_average || 82}%</span>
                    </div>
                    <span className="kpi-footnote">Derived from MCQ evaluations</span>
                  </div>
                  <div className="kpi-card">
                    <span className="kpi-label">OPEN OPPORTUNITIES</span>
                    <div className="kpi-metric-row">
                      <span className="kpi-main-number">{jobs.length}</span>
                      <span className="kpi-unit">roles</span>
                    </div>
                    <span className="kpi-footnote">Matched to your verified skills</span>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* REFERENCE 2: SKILL ANALYTICS (Lavender Glass Dimensions Card)   */}
            {/* ============================================================== */}
            {portalMode === 'learner' && page === 'My Skills' && (
              <div className="ref2-skills-page">
                <div className="ref2-container">
                  {/* Floating Translucent Candidate Comparison Card */}
                  <div className="ref2-glass-card">
                    <div className="ref2-stat-line">
                      <span>Project completion</span>
                      <strong>Score 3.8 / 4.0</strong>
                    </div>
                    <div className="ref2-stat-line">
                      <span>Candidate vs. others</span>
                      <strong className="green-stat">↑ 3.8 / 3.2</strong>
                    </div>
                    <div className="ref2-stat-line">
                      <span>Confidence score</span>
                      <strong className="green-stat">↑ 4.2 / 5.0</strong>
                    </div>

                    <div className="ref2-chips-row">
                      <span className="ref2-chip blue-chip">⚡ 5 Signals</span>
                      <span className="ref2-chip orange-chip">📁 12 Artifacts</span>
                      <span className="ref2-chip green-chip">👥 Benchmark Verified</span>
                    </div>
                  </div>

                  {/* Main Dimensions Radar Card */}
                  <div className="ref2-dimensions-card">
                    <div className="dimensions-header">
                      <h2>Dimensions</h2>
                      <span className="dimensions-subtitle">
                        Candidate competency vs Industry Role Benchmark
                      </span>
                    </div>

                    <div className="radar-chart-wrapper">
                      <ResponsiveContainer width="100%" height={340}>
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                          <PolarGrid stroke="#e4e0fb" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#6c6f84', fontSize: 12 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#a0a3b5', fontSize: 10 }} />
                          <Radar
                            name="Candidate"
                            dataKey="Candidate"
                            stroke="#635bff"
                            fill="#8b83ff"
                            fillOpacity={0.55}
                          />
                          <Radar
                            name="Benchmark"
                            dataKey="Benchmark"
                            stroke="#c4b5fd"
                            fill="#ede9fe"
                            fillOpacity={0.3}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Skills Inventory Breakdown */}
                  <div className="ref2-inventory-card">
                    <div className="panel-header">
                      <h3>Verified Skill Inventory ({profile.skills?.length || 0})</h3>
                      <button className="btn-primary" onClick={() => startInteractiveQuiz('JavaScript')}>
                        <ClipboardCheck size={15} /> Verify Skill
                      </button>
                    </div>

                    <div className="skills-list">
                      {profile.skills?.map((s: any) => (
                        <div key={s.skill} className="skill-row-item" onClick={() => setSelectedSkillModal(s)}>
                          <div className="skill-item-info">
                            <div className="skill-name-row">
                              <strong>{s.skill}</strong>
                              <span className="skill-source-tag">
                                {s.source.replace('_', ' ')} · {Math.round((s.confidence || 0.6) * 100)}% conf
                              </span>
                            </div>
                            <div className="skill-bar-wrap">
                              <div
                                className="skill-bar-fill"
                                style={{ width: `${Math.min(100, (s.level / 5) * 100)}%` }}
                              />
                            </div>
                          </div>
                          <div className="skill-score-badge">{s.level.toFixed(1)} / 5.0</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* REFERENCE 3: GAMIFIED LEARNING JOURNEY (Mountain Pathway)      */}
            {/* ============================================================== */}
            {portalMode === 'learner' && page === 'Learning Journey' && (
              <div className="ref3-journey-page">
                {/* Reference 3 Top Sub-Navigation */}
                <div className="ref3-subnav-bar">
                  {(['Journey', 'Achievements', 'Challenges', 'Toolkit'] as const).map(tab => (
                    <button
                      key={tab}
                      className={`ref3-subnav-btn ${journeySubTab === tab ? 'active' : ''}`}
                      onClick={() => setJourneySubTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                  <button className="ref3-subnav-btn-chat" onClick={() => setMentorOpen(true)}>
                    💬 Chat with AI Mentor
                  </button>
                </div>

                {/* Reference 3 Role Selector & Climbing Banner */}
                <div className="ref3-climbing-banner">
                  <div className="climbing-banner-left">
                    <div className="climbing-icon-box">🧗‍♂️</div>
                    <div>
                      <h2>Climbing your future</h2>
                      <p>
                        You're <strong>75% to the summit</strong> for {profile.target_role}. Keep the
                        momentum!
                      </p>
                    </div>
                  </div>

                  <div className="climbing-banner-right">
                    <div className="summit-ring-wrap">
                      <div className="summit-ring-svg">
                        <svg viewBox="0 0 36 36" className="circular-chart-small">
                          <path
                            className="circle-bg"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="circle"
                            strokeDasharray="75, 100"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <span className="summit-ring-text">75%</span>
                      </div>
                      <span className="summit-lbl">TO SUMMIT</span>
                    </div>

                    <div className="streak-box">
                      <div className="streak-title">
                        <Flame size={16} className="fire-icon" /> 20 days streak
                      </div>
                      <span className="streak-desc">Great momentum! Keep it going →</span>
                    </div>
                  </div>
                </div>

                {/* Reference 3 Layout: Left 60% Mountain Canvas + Right 40% Stages List */}
                <div className="ref3-split-layout">
                  {/* Mountain Canvas Illustration */}
                  <div className="ref3-mountain-canvas">
                    <svg className="mountain-svg" viewBox="0 0 600 700" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#c5b8fd" />
                          <stop offset="50%" stopColor="#e9e4ff" />
                          <stop offset="100%" stopColor="#f8f9fc" />
                        </linearGradient>
                        <linearGradient id="mountainGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#5d50bd" />
                          <stop offset="60%" stopColor="#7e72d6" />
                          <stop offset="100%" stopColor="#a399eb" />
                        </linearGradient>
                        <linearGradient id="trailGrad" x1="0" y1="1" x2="1" y2="0">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                          <stop offset="100%" stopColor="#f3f1ff" stopOpacity="0.8" />
                        </linearGradient>
                      </defs>

                      {/* Sky background */}
                      <rect width="600" height="700" fill="url(#skyGrad)" rx="18" />

                      {/* Mountain peaks */}
                      <path d="M 0 700 L 150 250 L 300 120 L 450 320 L 600 700 Z" fill="url(#mountainGrad)" opacity="0.85" />
                      <path d="M 120 700 L 300 180 L 480 700 Z" fill="url(#mountainGrad)" opacity="0.95" />

                      {/* Winding Trail Path */}
                      <path
                        d="M 160 630 C 240 600, 180 520, 260 480 C 340 440, 220 370, 310 320 C 390 280, 270 210, 340 160"
                        fill="none"
                        stroke="url(#trailGrad)"
                        strokeWidth="14"
                        strokeDasharray="6 4"
                      />
                    </svg>

                    {/* Milestone Nodes Overlaid on Trail */}
                    <div className="milestone-node node-1 completed" style={{ bottom: '60px', left: '120px' }}>
                      <Check size={16} />
                      <span className="node-tooltip">1. Assess Core Skills ✓</span>
                    </div>

                    <div className="milestone-node node-2 completed" style={{ bottom: '170px', left: '220px' }}>
                      <Check size={16} />
                      <span className="node-tooltip">2. Build Your Plan ✓</span>
                    </div>

                    <div className="milestone-node node-3 completed" style={{ bottom: '270px', left: '180px' }}>
                      <Check size={16} />
                      <span className="node-tooltip">3. Foundations & CSS ✓</span>
                    </div>

                    <div className="milestone-node node-4 completed" style={{ bottom: '370px', left: '260px' }}>
                      <Check size={16} />
                      <span className="node-tooltip">4. JavaScript Core ✓</span>
                    </div>

                    {/* Active Milestone with Mascot and Tooltip Popup (Reference 3) */}
                    <div className="milestone-node node-5 active-node" style={{ bottom: '480px', left: '300px' }}>
                      <span className="mascot-badge">🦊</span>
                      <div className="active-milestone-popup">
                        <div className="popup-top">
                          <strong>Full Stack Interview Score 75+</strong>
                          <span className="xp-tag">+100 XP</span>
                        </div>
                        <p>Demonstrate React, Node.js, and API competency.</p>
                        <button className="btn-popup-continue" onClick={() => startInteractiveQuiz('React')}>
                          Continue &gt;
                        </button>
                      </div>
                    </div>

                    {/* Summit Reward: Treasure Chest */}
                    <div className="milestone-node node-6 summit-node" style={{ top: '90px', left: '320px' }}>
                      <span className="treasure-chest">🏆</span>
                      <span className="node-tooltip">Summit: Power Career Ready</span>
                    </div>
                  </div>

                  {/* Right Side: Journey Stages List */}
                  <div className="ref3-stages-panel">
                    <div className="stages-panel-header">
                      <h3>Your Journey Stages</h3>
                      <span className="stages-count">4 / 5</span>
                    </div>

                    <div className="stages-list">
                      <div className="stage-card completed">
                        <div className="stage-icon-circle"><Check size={15} /></div>
                        <div className="stage-info">
                          <h4>Assess Career Skills</h4>
                          <p>Gap analysis across Python, SQL, HTML.</p>
                        </div>
                        <span className="stage-xp">+50 XP</span>
                      </div>

                      <div className="stage-card completed">
                        <div className="stage-icon-circle"><Check size={15} /></div>
                        <div className="stage-info">
                          <h4>Build Your Plan</h4>
                          <p>Personalized DAG roadmap generated.</p>
                        </div>
                        <span className="stage-xp">+50 XP</span>
                      </div>

                      <div className="stage-card completed">
                        <div className="stage-icon-circle"><Check size={15} /></div>
                        <div className="stage-info">
                          <h4>Craft Technical Portfolio</h4>
                          <p>Tailor GitHub and project evidence.</p>
                        </div>
                        <span className="stage-xp">+50 XP</span>
                      </div>

                      <div className="stage-card active-stage">
                        <div className="stage-icon-circle active-icon"><Target size={15} /></div>
                        <div className="stage-info">
                          <div className="stage-title-row">
                            <h4>React & Full Stack Milestone</h4>
                            <span className="next-up-pill">Next up</span>
                          </div>
                          <p>Pass MCQ assessment with score above 75%.</p>
                        </div>
                        <span className="stage-xp active-xp">+100 XP</span>
                      </div>

                      <div className="stage-card locked-stage">
                        <div className="stage-icon-circle locked-icon"><Lock size={15} /></div>
                        <div className="stage-info">
                          <h4>Power Career Intro</h4>
                          <p>Unlock direct recruiter matching and intros.</p>
                        </div>
                        <span className="stage-xp locked-xp">+150 XP</span>
                      </div>
                    </div>

                    <div className="summit-reward-callout">
                      <span>🚩 Summit reward — reach the top to unlock your Power Career Chest.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* REFERENCE 4: ANALYTICS DASHBOARD (Cosmic Forge Style)          */}
            {/* ============================================================== */}
            {portalMode === 'learner' && page === 'Analytics' && (
              <div className="ref4-analytics-page">
                {/* Header */}
                <div className="ref4-header">
                  <div>
                    <h2>Overview</h2>
                    <p>Your central hub for learning velocity and skill analytics.</p>
                  </div>
                  <div className="ref4-header-actions">
                    <div className="search-input-box">
                      <Search size={15} />
                      <input placeholder="Search metrics or skills..." />
                    </div>
                    <button className="btn-primary" onClick={() => setPage('Career Match')}>
                      + Set New Goal
                    </button>
                  </div>
                </div>

                {/* 4 KPI Cards with Percentage Indicators and Sparklines */}
                <div className="ref4-kpi-grid">
                  <div className="ref4-card">
                    <span className="ref4-label">Total Skills Identified</span>
                    <div className="ref4-metric-row">
                      <span className="ref4-metric">42</span>
                      <span className="ref4-pill green">+12%</span>
                    </div>
                    <div className="sparkline-container">
                      <svg viewBox="0 0 100 24" className="sparkline-svg">
                        <path d="M0 20 Q 25 15, 50 10 T 100 4" fill="none" stroke="#635bff" strokeWidth="2.5" />
                      </svg>
                    </div>
                  </div>

                  <div className="ref4-card">
                    <span className="ref4-label">Active Learning Hours</span>
                    <div className="ref4-metric-row">
                      <span className="ref4-metric">{progress?.estimated_hours || 38}h</span>
                      <span className="ref4-pill green">+8%</span>
                    </div>
                    <div className="sparkline-container">
                      <svg viewBox="0 0 100 24" className="sparkline-svg">
                        <path d="M0 18 Q 30 18, 60 8 T 100 6" fill="none" stroke="#10b981" strokeWidth="2.5" />
                      </svg>
                    </div>
                  </div>

                  <div className="ref4-card">
                    <span className="ref4-label">Milestones / Week</span>
                    <div className="ref4-metric-row">
                      <span className="ref4-metric">14</span>
                      <span className="ref4-pill green">+3%</span>
                    </div>
                    <div className="sparkline-container">
                      <svg viewBox="0 0 100 24" className="sparkline-svg">
                        <path d="M0 22 Q 35 12, 70 14 T 100 8" fill="none" stroke="#8b83ff" strokeWidth="2.5" />
                      </svg>
                    </div>
                  </div>

                  <div className="ref4-card">
                    <span className="ref4-label">Skill Gap Rate</span>
                    <div className="ref4-metric-row">
                      <span className="ref4-metric">18.4%</span>
                      <span className="ref4-pill red">-2.1%</span>
                    </div>
                    <div className="sparkline-container">
                      <svg viewBox="0 0 100 24" className="sparkline-svg">
                        <path d="M0 6 Q 40 10, 75 16 T 100 20" fill="none" stroke="#f87171" strokeWidth="2.5" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Main Middle Row: Velocity Area Chart + Competency Health */}
                <div className="ref4-middle-grid">
                  <div className="ref4-card area-chart-card">
                    <div className="chart-header-row">
                      <div>
                        <h3>Learning Velocity over time</h3>
                        <p>Cumulative milestones achieved across last 6 weeks</p>
                      </div>
                      <div className="chart-time-filter">
                        <span className="active">30d</span>
                        <span>90d</span>
                        <span>1y</span>
                      </div>
                    </div>

                    <div className="area-chart-container">
                      <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={velocityData}>
                          <defs>
                            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#635bff" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#635bff" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="name" stroke="#a0a3b5" fontSize={11} />
                          <YAxis stroke="#a0a3b5" fontSize={11} />
                          <RechartsTooltip />
                          <Area type="monotone" dataKey="velocity" stroke="#635bff" strokeWidth={3} fillOpacity={1} fill="url(#areaGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Competency Health Bars */}
                  <div className="ref4-card health-card">
                    <h3>Competency Health</h3>
                    <div className="health-bars-list">
                      <div className="health-row">
                        <div className="health-meta">
                          <span>Frontend Engineering</span>
                          <strong>94.2%</strong>
                        </div>
                        <div className="health-bar"><div className="health-fill green" style={{ width: '94.2%' }} /></div>
                      </div>
                      <div className="health-row">
                        <div className="health-meta">
                          <span>Backend & APIs</span>
                          <strong>88.5%</strong>
                        </div>
                        <div className="health-bar"><div className="health-fill purple" style={{ width: '88.5%' }} /></div>
                      </div>
                      <div className="health-row">
                        <div className="health-meta">
                          <span>Databases & SQL</span>
                          <strong>76.1%</strong>
                        </div>
                        <div className="health-bar"><div className="health-fill purple" style={{ width: '76.1%' }} /></div>
                      </div>
                      <div className="health-row">
                        <div className="health-meta">
                          <span>DevOps & Deployment</span>
                          <strong>62.4%</strong>
                        </div>
                        <div className="health-bar"><div className="health-fill amber" style={{ width: '62.4%' }} /></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Recent Milestones & Activity Feed */}
                <div className="ref4-bottom-grid">
                  <div className="ref4-card">
                    <div className="panel-header">
                      <h3>Recent Milestones</h3>
                      <button className="link-button" onClick={() => setPage('Learning Journey')}>View all</button>
                    </div>
                    <div className="deployments-table">
                      <div className="table-row">
                        <span className="dot-live" />
                        <div className="table-info">
                          <strong>JavaScript Algorithms Check</strong>
                          <span>Completed 2 days ago</span>
                        </div>
                        <span className="pill-live">Passed</span>
                      </div>
                      <div className="table-row">
                        <span className="dot-live" />
                        <div className="table-info">
                          <strong>Python FastAPI REST Pipeline</strong>
                          <span>Completed 4 days ago</span>
                        </div>
                        <span className="pill-live">Passed</span>
                      </div>
                      <div className="table-row">
                        <span className="dot-pending" />
                        <div className="table-info">
                          <strong>React State & Reconciliation</strong>
                          <span>In progress</span>
                        </div>
                        <span className="pill-pending">Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="ref4-card">
                    <h3>Multi-Agent System Activity</h3>
                    <div className="activity-feed-list">
                      {runs.slice(0, 4).map(r => (
                        <div className="activity-feed-item" key={r.id}>
                          <span className="activity-bullet" />
                          <div className="activity-text">
                            <strong>{r.agent}</strong> triggered on <em>{r.event.replaceAll('_', ' ')}</em> ({r.duration_ms}ms)
                            <p>{r.output}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* OTHER PAGES: CAREER MATCH, ASSESSMENTS, AGENTS, JOBS           */}
            {/* ============================================================== */}
            {portalMode === 'learner' && page === 'Career Match' && (
              <div className="career-page">
                <div className="page-header">
                  <div>
                    <span className="page-eyebrow">CAREER PATHWAYS</span>
                    <h1>Compare & Select Career Goal</h1>
                    <p>Instant dependency re-ordering upon goal pivot.</p>
                  </div>
                </div>

                <div className="roles-cards-grid">
                  {roles.map((r: any) => (
                    <div
                      key={r.name}
                      className={`role-select-card ${profile.target_role === r.name ? 'selected' : ''}`}
                    >
                      <span className="card-eyebrow">ROLE ARCHETYPE</span>
                      <h3>{r.name}</h3>
                      <p className="role-skill-count">
                        {Object.keys(r.required_skills || {}).length} required core competencies
                      </p>
                      <button
                        className="btn-select-role"
                        onClick={() => changeGoal(r.name)}
                      >
                        {profile.target_role === r.name ? '✓ Current Goal' : 'Adopt as Target Goal'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {portalMode === 'learner' && page === 'Assessments' && (
              <div className="assessments-page">
                {quizActive && quizQuestions.length > 0 ? (
                  <div className="panel-card quiz-active-card">
                    <div className="quiz-header-bar">
                      <span className="quiz-skill-tag">{quizSkill} Skill Check</span>
                      <div className="quiz-timer-chip">
                        <Clock3 size={15} />
                        <span>{Math.floor(quizTimeLeft / 60)}:{String(quizTimeLeft % 60).padStart(2, '0')}</span>
                      </div>
                    </div>

                    <div className="quiz-question-box">
                      <h3>Question {currentQIndex + 1} of {quizQuestions.length}: {quizQuestions[currentQIndex]?.question}</h3>
                      <div className="quiz-options-list">
                        {quizQuestions[currentQIndex]?.options?.map((opt: string) => {
                          const isSelected = selectedAnswers[currentQIndex] === opt;
                          return (
                            <button
                              key={opt}
                              className={`quiz-option-btn ${isSelected ? 'selected' : ''}`}
                              onClick={() => setSelectedAnswers(prev => ({ ...prev, [currentQIndex]: opt }))}
                            >
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="quiz-nav-footer">
                      <button className="btn-ghost" disabled={currentQIndex === 0} onClick={() => setCurrentQIndex(i => i - 1)}>
                        <ChevronLeft size={16} /> Previous
                      </button>
                      {currentQIndex < quizQuestions.length - 1 ? (
                        <button className="btn-primary" onClick={() => setCurrentQIndex(i => i + 1)}>
                          Next <ChevronRight size={16} />
                        </button>
                      ) : (
                        <button className="btn-primary" onClick={() => submitQuiz()}>
                          Submit Assessment
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="assessments-control-grid">
                    <div className="panel-card">
                      <h2>Launch Real MCQ Assessment</h2>
                      <p>Select any core competency to test:</p>
                      <select value={quizSkill} onChange={e => setQuizSkill(e.target.value)} className="input-select" style={{ margin: '14px 0' }}>
                        {['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'CSS', 'Git'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button className="btn-primary full-width" onClick={() => startInteractiveQuiz(quizSkill)}>
                        Start 10-Question Assessment
                      </button>
                    </div>

                    <div className="panel-card">
                      <h2>Adaptive Test Presets</h2>
                      <p>Trigger autonomous multi-agent adaptations in 1 click:</p>
                      <div className="preset-buttons-group">
                        <button className="btn-preset-danger" onClick={() => submitQuiz(42)}>
                          Simulate Failing Quiz (42%) → Evaluator Inserts Remedial Nodes
                        </button>
                        <button className="btn-preset-success" onClick={() => submitQuiz(95)}>
                          Simulate Mastery (95%) → Evaluator Compresses Roadmap
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {portalMode === 'learner' && page === 'Agent Activity' && (
              <div className="agents-page">
                <div className="panel-card">
                  <h2>Multi-Agent Autonomous Telemetry</h2>
                  <div className="runs-timeline-list">
                    {runs.map(r => (
                      <div className="timeline-entry" key={r.id}>
                        <div className="timeline-node-dot" />
                        <div className="timeline-entry-body">
                          <div className="timeline-entry-header">
                            <span className="timeline-agent-name">{r.agent}</span>
                            <span className="timeline-event-name">{r.event.replaceAll('_', ' ')}</span>
                            <span className="timeline-duration">{r.duration_ms}ms</span>
                          </div>
                          <p className="timeline-output">{r.output}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {portalMode === 'learner' && page === 'Job Opportunities' && (
              <div className="jobs-page">
                <div className="page-header">
                  <div>
                    <span className="page-eyebrow">RECRUITMENT ECOSYSTEM</span>
                    <h1>Matched Job Openings</h1>
                    <p>Curated opportunities aligned with your verified competencies.</p>
                  </div>
                </div>

                <div className="jobs-grid">
                  {jobs.map(j => (
                    <div className="panel-card job-card" key={j.id}>
                      <div className="job-top">
                        <div>
                          <h3>{j.title}</h3>
                          <span className="job-company">{j.company} · {j.location}</span>
                        </div>
                        <span className="job-salary">{j.salary_range}</span>
                      </div>
                      <p className="job-desc">{j.description}</p>
                      <div className="job-skills-pills">
                        {Object.keys(j.required_skills || {}).map(s => (
                          <span key={s} className="pill-skill">{s}</span>
                        ))}
                      </div>
                      <button
                        className="btn-primary"
                        style={{ marginTop: '14px' }}
                        onClick={() => addToast(`Application submitted to ${j.company}!`, 'success')}
                      >
                        Apply with Verified Skill DNA
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* RECRUITER / HR PORTAL PAGES                                    */}
            {/* ============================================================== */}
            {portalMode === 'recruiter' && page === 'Recruiter Dashboard' && (
              <div className="recruiter-dashboard">
                <div className="page-header">
                  <div>
                    <span className="page-eyebrow">COMPANY RECRUITMENT PORTAL</span>
                    <h1>Talent Pipeline & Analytics</h1>
                    <p>Verified skill benchmarks, applicants, and candidate matching.</p>
                  </div>
                  <button className="btn-primary" onClick={() => setShowCreateJob(true)}>
                    + Post New Job Opening
                  </button>
                </div>

                <div className="ref4-kpi-grid">
                  <div className="ref4-card">
                    <span className="ref4-label">Active Job Openings</span>
                    <span className="ref4-metric">{recruiterOverview?.total_jobs || jobs.length}</span>
                  </div>
                  <div className="ref4-card">
                    <span className="ref4-label">Total Applicants</span>
                    <span className="ref4-metric">{recruiterOverview?.total_applicants || 3}</span>
                  </div>
                  <div className="ref4-card">
                    <span className="ref4-label">Shortlisted Candidates</span>
                    <span className="ref4-metric">{recruiterOverview?.shortlisted_count || 1}</span>
                  </div>
                  <div className="ref4-card">
                    <span className="ref4-label">Interviews Scheduled</span>
                    <span className="ref4-metric">{recruiterOverview?.interviews_scheduled || 1}</span>
                  </div>
                </div>

                {/* Candidate Pipeline Stages */}
                <div className="panel-card" style={{ marginTop: '20px' }}>
                  <h3>Recruitment Pipeline Visualizer</h3>
                  <div className="pipeline-stages-bar">
                    {['Applied', 'Under Review', 'Shortlisted', 'Assessment', 'Interview', 'Hired'].map(st => (
                      <div className="pipeline-stage-step" key={st}>
                        <span className="step-name">{st}</span>
                        <span className="step-count">{recruiterOverview?.pipeline?.[st] || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Candidate Management Table */}
                <div className="panel-card" style={{ marginTop: '20px' }}>
                  <h3>Active Candidates & AI Match Scores</h3>
                  <div className="candidates-table">
                    <div className="table-header-row">
                      <span>Candidate</span>
                      <span>Email</span>
                      <span>AI Match</span>
                      <span>Current Stage</span>
                      <span>Action</span>
                    </div>

                    {[
                      { id: 1, name: 'Alex Rivera', email: 'demo@learner.com', match: 88, stage: 'Shortlisted' },
                      { id: 2, name: 'Sarah Chen', email: 'sarah.c@mit.edu', match: 92, stage: 'Interview' },
                      { id: 3, name: 'Marcus Vance', email: 'marcus.v@dev.io', match: 71, stage: 'Under Review' }
                    ].map(cand => (
                      <div className="table-data-row" key={cand.id}>
                        <strong>{cand.name}</strong>
                        <span>{cand.email}</span>
                        <span className="match-score-badge">{cand.match}% Fit</span>
                        <span className={`status-pill ${cand.stage.toLowerCase().replace(' ', '-')}`}>{cand.stage}</span>
                        <select
                          value={cand.stage}
                          onChange={e => handleAdvanceStage(cand.id, e.target.value)}
                          className="select-status"
                        >
                          <option value="Applied">Applied</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Assessment">Assessment</option>
                          <option value="Interview">Interview</option>
                          <option value="Hired">Hired</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* FLOATING AI MENTOR (Reference 1 - Traquiva Style)               */}
      {/* ============================================================== */}
      {mentorOpen ? (
        <div className="floating-mentor-dock">
          <div className="floating-mentor-header">
            <div className="mentor-header-left">
              <div className="mentor-header-icon"><BrainCircuit size={18} /></div>
              <div>
                <strong>AI Mentor</strong>
                <span className="mentor-status-sub">Helping you become a {profile?.target_role || 'Developer'}</span>
              </div>
            </div>
            <button className="mentor-minimize-btn" onClick={() => setMentorOpen(false)}>
              <X size={16} />
            </button>
          </div>

          {/* Quick Action Buttons (Reference 1) */}
          <div className="mentor-quick-pills">
            <button onClick={() => sendChat('Analyze my current progress and provide insights')}>
              📊 Analyze My Progress
            </button>
            <button onClick={() => setPage('Career Match')}>
              🎯 Set New Goal
            </button>
            <button onClick={() => sendChat('What are my biggest skill gaps?')}>
              🔍 Find My Skill Gaps
            </button>
          </div>

          {/* Chat Messages */}
          <div className="mentor-messages-scroll">
            {chat.map((c, idx) => (
              <div key={idx} className={`mentor-msg-bubble ${c.role}`}>
                <p>{c.text}</p>
                {c.time && <span className="bubble-time">{c.time}</span>}
              </div>
            ))}
          </div>

          {/* Input Box */}
          <div className="mentor-input-row">
            <input
              placeholder="Ask me anything..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendChat()}
            />
            <button className="mentor-send-btn" onClick={() => sendChat()}>
              <Send size={15} />
            </button>
          </div>
        </div>
      ) : (
        <button className="floating-mentor-launcher" onClick={() => setMentorOpen(true)} title="Open AI Mentor">
          <BrainCircuit size={24} />
          <span className="launcher-badge">AI</span>
        </button>
      )}

      {/* Create Job Modal */}
      {showCreateJob && (
        <div className="modal-backdrop" onClick={() => setShowCreateJob(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Job Opening</h3>
              <button className="close-btn" onClick={() => setShowCreateJob(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Job Title</label>
                <input
                  className="input-text"
                  value={newJob.title}
                  onChange={e => setNewJob({ ...newJob, title: e.target.value })}
                  placeholder="e.g. Senior Full Stack Engineer"
                />
              </div>
              <div className="form-group">
                <label>Salary Range</label>
                <input
                  className="input-text"
                  value={newJob.salary_range}
                  onChange={e => setNewJob({ ...newJob, salary_range: e.target.value })}
                />
              </div>
              <div className="modal-action-row" style={{ marginTop: '16px' }}>
                <button className="btn-primary" onClick={handleCreateJob}>Publish Job Opening</button>
                <button className="btn-ghost" onClick={() => setShowCreateJob(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
