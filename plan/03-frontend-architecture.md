# 03 - FRONTEND ARCHITECTURE (REACT 19 + VITE)

## Table of Contents
1. [Overview](#overview)
2. [Existing Frontend Structure](#existing-frontend-structure)
3. [Component Architecture](#component-architecture)
4. [Routing Structure](#routing-structure)
5. [State Management](#state-management)
6. [API Integration](#api-integration)
7. [UI Component Library](#ui-component-library)
8. [New Pages to Implement](#new-pages-to-implement)
9. [Component List](#component-list)
10. [Related Documents](#related-documents)

---

## Overview

This document defines the React 19 + Vite frontend architecture for the V-Vortex Platform.

### Current Tech Stack

- **React**: 19.2.0
- **Vite**: 7.2.4
- **React Router**: 7.10.1
- **Supabase JS**: 2.87.1
- **ExcelJS**: 4.3.0
- **React Compiler**: 1.0.0

### Architecture Principles

1. **Component-Driven**: Reusable, composable components
2. **Route-Based Code Splitting**: Lazy load pages
3. **Type Safety**: PropTypes or TypeScript
4. **Performance**: React Compiler + memoization
5. **Responsive**: Mobile-first design

---

## Existing Frontend Structure

### Current Directory Structure

```
src/
├── components/
│   ├── BuildTeam.jsx          # Team building interface
│   ├── PageTransition.jsx     # Page transition effects
│   ├── Preloader.jsx          # Loading screen
│   ├── VortexBackground.jsx   # Animated background
│   └── VortexCanvas.jsx       # Canvas animation
├── pages/
│   ├── home.jsx              # Landing page
│   ├── login.jsx             # Login page
│   ├── register.jsx          # Registration page
│   ├── otp.jsx               # OTP verification
│   ├── dashboard.jsx         # Team leader dashboard
│   ├── member.jsx            # Team member dashboard
│   └── admin.jsx              # Admin dashboard
├── utils/
│   ├── authRouting.js        # Authentication routing logic
│   └── supabaseClient.js     # Supabase client instance
├── styles/                   # CSS files per page
└── index.css                # Global styles
```

---

## Component Architecture

### Component Hierarchy

```
App
├── VortexBackground
├── Preloader
├── AuthProvider
│   ├── PublicRoutes
│   │   ├── Home
│   │   ├── Login
│   │   ├── Register
│   │   ├── OTP
│   │   └── PublicPages...
│   └── ProtectedRoutes
│       ├── TeamDashboard
│       │   ├── Sidebar
│       │   ├── Overview
│       │   ├── TeamManagement
│       │   ├── ProblemStatementSelection
│       │   ├── Submissions (Ideathon, Reviews)
│       │   └── Scores
│       ├── MemberDashboard
│       ├── JudgeDashboard
│       └── AdminDashboard
└── NotificationsPanel
```

---

## Routing Structure

### Complete Route Map

```javascript
// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/domains" element={<Domains />} />
          <Route path="/problem-statements" element={<ProblemStatementsCatalog />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/sponsors" element={<Sponsors />} />
          <Route path="/speakers" element={<Speakers />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/leaderboard" element={<PublicLeaderboard />} />
          <Route path="/results" element={<Results />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/otp" element={<OTP />} />

          {/* Team Leader Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute role="team_leader">
              <TeamDashboard />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardOverview />} />
            <Route path="team" element={<TeamManagement />} />
            <Route path="select-ps" element={<ProblemStatementSelection />} />
            <Route path="ideathon" element={<IdeathonSubmission />} />
            <Route path="review1" element={<ReviewSubmission round={1} />} />
            <Route path="review2" element={<ReviewSubmission round={2} />} />
            <Route path="review3" element={<ReviewSubmission round={3} />} />
            <Route path="scores" element={<Scores />} />
          </Route>

          {/* Team Member Routes */}
          <Route path="/member" element={
            <ProtectedRoute role="team_member">
              <MemberDashboard />
            </ProtectedRoute>
          } />

          {/* Judge Routes */}
          <Route path="/judge" element={
            <ProtectedRoute role="judge">
              <JudgeDashboard />
            </ProtectedRoute>
          }>
            <Route index element={<JudgeOverview />} />
            <Route path="evaluations/:round" element={<JudgeEvaluations />} />
            <Route path="score/:teamId" element={<ScoreTeam />} />
            <Route path="briefing" element={<JudgeBriefing />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }>
            <Route index element={<AdminOverview />} />
            <Route path="teams" element={<AdminTeams />} />
            <Route path="judges" element={<AdminJudges />} />
            <Route path="problem-statements" element={<AdminProblemStatements />} />
            <Route path="evaluations" element={<AdminEvaluations />} />
            <Route path="phases" element={<AdminPhases />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="export" element={<AdminExport />} />
          </Route>

          {/* Finals Routes */}
          <Route path="/finals/shark-tank" element={
            <ProtectedRoute role="judge">
              <SharkTank />
            </ProtectedRoute>
          } />
          <Route path="/finals/bug-bounty" element={
            <ProtectedRoute role="team_leader">
              <BugBounty />
            </ProtectedRoute>
          } />

          {/* Catch All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <NotificationsPanel />
      </AuthProvider>
    </BrowserRouter>
  );
}
```

---

## State Management

### Context Providers

#### `AuthProvider` - Authentication State

```javascript
// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      fetchUserRole(session?.user?.id);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        await fetchUserRole(session?.user?.id);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId) => {
    if (!userId) {
      setRole(null);
      setLoading(false);
      return;
    }

    // Fetch from user_profiles or teams
    const { data } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', userId)
      .single();

    setRole(data?.role || null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ session, user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

#### `EventContext` - Current Event State

```javascript
// src/contexts/EventContext.jsx
const EventContext = createContext();

export function EventProvider({ children }) {
  const [event, setEvent] = useState(null);
  const [phase, setPhase] = useState(null);
  const [deadlines, setDeadlines] = useState({});

  useEffect(() => {
    fetchEventConfig();
  }, []);

  const fetchEventConfig = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('is_published', true)
      .single();

    setEvent(data);
    setPhase(data?.current_phase);
    setDeadlines({
      registration: data?.registration_end,
      ideathon: data?.ideathon_end,
      review1: data?.hackathon_review1_end,
      review2: data?.hackathon_review2_end,
      review3: data?.hackathon_review3_end,
    });
  };

  return (
    <EventContext.Provider value={{ event, phase, deadlines }}>
      {children}
    </EventContext.Provider>
  );
}

export const useEvent = () => useContext(EventContext);
```

#### `NotificationContext` - Notifications

```javascript
// src/contexts/NotificationContext.jsx
const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async (userId) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    setNotifications(data);
    setUnreadCount(data?.filter(n => !n.is_read).length || 0);
  };

  const markAsRead = async (notificationId) => {
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      fetchNotifications,
      markAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
```

---

## API Integration

### Service Layer

```javascript
// src/services/api.js
import { supabase } from '../utils/supabaseClient';

// Team Services
export const teamService = {
  getMyTeam: async () => {
    const { data, error } = await supabase
      .from('teams')
      .select('*, team_members(*)')
      .eq('leader_email', session.user.email)
      .single();
    return { data, error };
  },

  selectProblemStatement: async (psId) => {
    const { data, error } = await supabase.functions.invoke('select-ps', {
      body: { problem_statement_id: psId }
    });
    return { data, error };
  },

  submitIdeathon: async (submission) => {
    const { data, error } = await supabase.functions.invoke('submit-ideathon', {
      body: submission
    });
    return { data, error };
  },

  submitReview: async (round, submission) => {
    const { data, error } = await supabase.functions.invoke('submit-review', {
      body: { round, ...submission }
    });
    return { data, error };
  },
};

// Problem Statement Services
export const psService = {
  getAvailability: async (domainId) => {
    const { data, error } = await supabase.functions.invoke('get-ps-availability', {
      body: { domain_id: domainId }
    });
    return { data, error };
  },

  getMyPS: async (teamId) => {
    const { data, error } = await supabase
      .from('teams')
      .select('problem_statements(*)')
      .eq('id', teamId)
      .single();
    return { data, error };
  },
};

// Judge Services
export const judgeService = {
  getAssignedTeams: async (round) => {
    const { data, error } = await supabase
      .from('judge_assignments')
      .select('teams(*), problem_statements(*)')
      .eq('judge_id', judgeId)
      .eq('round', round);
    return { data, error };
  },

  submitScore: async (scoreData) => {
    const { data, error } = await supabase.functions.invoke('submit-score', {
      body: scoreData
    });
    return { data, error };
  },
};

// Admin Services
export const adminService = {
  getTeams: async (filters) => {
    const { data, error } = await supabase
      .from('teams')
      .select('*, team_members(*), problem_statements(*)')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  verifyPayment: async (teamId, status) => {
    const { data, error } = await supabase.functions.invoke('admin-verify-payment', {
      body: { team_id: teamId, status }
    });
    return { data, error };
  },

  assignJudge: async (judgeId, teamIds, round) => {
    const { data, error } = await supabase.functions.invoke('admin-assign-judge', {
      body: { judge_id: judgeId, team_ids: teamIds, round }
    });
    return { data, error };
  },

  changePhase: async (newPhase) => {
    const { data, error } = await supabase.functions.invoke('admin-change-phase', {
      body: { new_phase: newPhase }
    });
    return { data, error };
  },

  exportData: async (exportType, format) => {
    const { data, error } = await supabase.functions.invoke('admin-export-data', {
      body: { export_type: exportType, format }
    });
    return { data, error };
  },
};
```

---

## UI Component Library

### Base Components

```javascript
// src/components/ui/Button.jsx
export function Button({ children, variant = 'primary', disabled, ...props }) {
  const variants = {
    primary: 'bg-cyan-500 hover:bg-cyan-600',
    secondary: 'bg-purple-500 hover:bg-purple-600',
    danger: 'bg-red-500 hover:bg-red-600',
    ghost: 'bg-transparent hover:bg-white/10'
  };

  return (
    <button
      className={`px-4 py-2 rounded font-medium transition-colors ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

// src/components/ui/Input.jsx
export function Input({ label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      <input
        className={`px-3 py-2 rounded border bg-white/5 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${error ? 'border-red-500' : 'border-white/20'}`}
        {...props}
      />
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  );
}

// src/components/ui/Modal.jsx
export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// src/components/ui/Card.jsx
export function Card({ children, className }) {
  return (
    <div className={`bg-white/5 border border-white/10 rounded-lg p-6 ${className}`}>
      {children}
    </div>
  );
}

// src/components/ui/Badge.jsx
export function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-gray-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-cyan-500'
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}
```

---

## New Pages to Implement

### Public Pages

#### `ProblemStatementsCatalog` - PS Marketplace (Read-Only)

```javascript
// src/pages/public/ProblemStatementsCatalog.jsx
export function ProblemStatementsCatalog() {
  const { event } = useEvent();
  const [problemStatements, setProblemStatements] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState(null);

  useEffect(() => {
    fetchProblemStatements();
  }, [selectedDomain]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Problem Statements</h1>

      {/* Domain Filter */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setSelectedDomain(null)}>All</button>
        {domains.map(domain => (
          <button key={domain.id} onClick={() => setSelectedDomain(domain.id)}>
            {domain.name}
          </button>
        ))}
      </div>

      {/* PS Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {problemStatements.map(ps => (
          <Card key={ps.id}>
            <Badge variant={ps.current_teams >= ps.max_teams ? 'danger' : 'success'}>
              {ps.max_teams - ps.current_teams} slots left
            </Badge>
            <h3 className="text-xl font-bold">{ps.title}</h3>
            <p className="text-gray-400">{ps.domain_name}</p>
            <p className="mt-2">{ps.description}</p>
            <p className="text-sm text-cyan-500 mt-2">By {ps.organization}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### Team Dashboard Pages

#### `ProblemStatementSelection` - FCFS PS Selection

```javascript
// src/pages/team/ProblemStatementSelection.jsx
export function ProblemStatementSelection() {
  const { user } = useAuth();
  const [availability, setAvailability] = useState([]);
  const [selectedPS, setSelectedPS] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelectPS = async (psId) => {
    setLoading(true);
    const { data, error } = await teamService.selectProblemStatement(psId);

    if (error) {
      if (error.code === 'PS_FULL') {
        alert('This PS is no longer available. Please choose another.');
      }
    } else {
      alert('Problem statement selected successfully!');
      setSelectedPS(psId);
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Select Problem Statement</h1>

      {availability.map(ps => (
        <Card key={ps.id} className={ps.slots_remaining === 0 ? 'opacity-50' : ''}>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold">{ps.title}</h3>
              <Badge variant={
                ps.availability_status === 'available' ? 'success' :
                ps.availability_status === 'limited' ? 'warning' : 'danger'
              }>
                {ps.slots_remaining} / {ps.max_teams} slots
              </Badge>
            </div>
            <Button
              onClick={() => handleSelectPS(ps.id)}
              disabled={ps.slots_remaining === 0 || loading}
            >
              Select
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

#### `IdeathonSubmission` - Round 1 Submission

```javascript
// src/pages/team/IdeathonSubmission.jsx
export function IdeathonSubmission() {
  const { deadlines } = useEvent();
  const [submission, setSubmission] = useState({ url: '', type: 'upload' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    const { data, error } = await teamService.submitIdeathon(submission);
    if (!error) {
      setSubmitted(true);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Ideathon Submission</h1>
        <Countdown deadline={deadlines.ideathon} />
      </div>

      {submitted ? (
        <Card>
          <p className="text-green-500">✓ Submitted at {new Date().toLocaleString()}</p>
        </Card>
      ) : (
        <Card>
          <Input
            label="Submission URL (PPT/PDF or Drive Link)"
            value={submission.url}
            onChange={(e) => setSubmission({ ...submission, url: e.target.value })}
            placeholder="https://docs.google.com/presentation/..."
          />
          <Button onClick={handleSubmit} className="mt-4">Submit Ideathon</Button>
        </Card>
      )}
    </div>
  );
}
```

### Judge Dashboard Pages

#### `JudgeEvaluations` - Score Teams

```javascript
// src/pages/judge/JudgeEvaluations.jsx
export function JudgeEvaluations() {
  const { round } = useParams();
  const [teams, setTeams] = useState([]);
  const [currentTeam, setCurrentTeam] = useState(null);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{round.toUpperCase()} Evaluations</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Team List */}
        <div className="lg:col-span-1">
          {teams.map(team => (
            <Card
              key={team.id}
              onClick={() => setCurrentTeam(team)}
              className={currentTeam?.id === team.id ? 'border-cyan-500' : ''}
            >
              <h3>{team.team_name}</h3>
              <p>{team.problem_statement}</p>
            </Card>
          ))}
        </div>

        {/* Scoring Interface */}
        <div className="lg:col-span-2">
          {currentTeam && <ScoringForm team={currentTeam} round={round} />}
        </div>
      </div>
    </div>
  );
}

// src/components/judge/ScoringForm.jsx
function ScoringForm({ team, round }) {
  const [scores, setScores] = useState({});
  const [comments, setComments] = useState('');
  const [isDraft, setIsDraft] = useState(true);

  const handleSubmit = async (isFinal) => {
    const { error } = await judgeService.submitScore({
      team_id: team.id,
      round,
      scores,
      comments,
      is_final_submit: isFinal
    });

    if (!error && isFinal) {
      alert('Score submitted and locked!');
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-4">{team.team_name}</h2>
      <p className="mb-4">{team.problem_statement}</p>

      {/* Scoring Categories based on round */}
      {round === 'ideathon' && (
        <>
          <Input type="number" label="Innovation (0-50)" min="0" max="50"
            onChange={(e) => setScores({ ...scores, innovation_score: Number(e.target.value) })} />
          <Input type="number" label="Implementation (0-50)" min="0" max="50"
            onChange={(e) => setScores({ ...scores, implementation_score: Number(e.target.value) })} />
          <Input type="number" label="Presentation (0-50)" min="0" max="50"
            onChange={(e) => setScores({ ...scores, presentation_score: Number(e.target.value) })} />
          <Input type="number" label="Impact (0-50)" min="0" max="50"
            onChange={(e) => setScores({ ...scores, impact_score: Number(e.target.value) })} />
        </>
      )}

      <textarea
        className="w-full p-3 rounded bg-white/5 border border-white/20 mt-4"
        rows="4"
        placeholder="Judge comments..."
        value={comments}
        onChange={(e) => setComments(e.target.value)}
      />

      <div className="flex gap-4 mt-6">
        <Button onClick={() => handleSubmit(false)}>Save Draft</Button>
        <Button variant="primary" onClick={() => handleSubmit(true)}>Final Submit</Button>
      </div>
    </Card>
  );
}
```

### Admin Dashboard Pages

#### `AdminPhases` - Phase Control

```javascript
// src/pages/admin/AdminPhases.jsx
export function AdminPhases() {
  const { event } = useEvent();
  const [newPhase, setNewPhase] = useState('');

  const handleChangePhase = async () => {
    const { error } = await adminService.changePhase(newPhase);
    if (!error) {
      alert(`Phase changed to ${newPhase}`);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Phase Management</h1>

      <Card>
        <h2 className="text-xl mb-4">Current Phase: {event?.current_phase}</h2>

        <select
          className="w-full p-2 rounded bg-white/5 border border-white/20"
          value={newPhase}
          onChange={(e) => setNewPhase(e.target.value)}
        >
          <option value="">Select new phase...</option>
          <option value="ideathon">Ideathon</option>
          <option value="hackathon">Hackathon</option>
          <option value="finals">Finals</option>
          <option value="archive">Archive</option>
        </select>

        <Button onClick={handleChangePhase} className="mt-4">Change Phase</Button>
      </Card>
    </div>
  );
}
```

---

## Component List

### Layout Components
| Component | Description |
|-----------|-------------|
| `VortexBackground` | Animated vortex background |
| `PageTransition` | Page transition effects |
| `Preloader` | Loading screen |
| `Sidebar` | Dashboard navigation |
| `Navbar` | Top navigation bar |
| `Footer` | Page footer |

### UI Components
| Component | Description |
|-----------|-------------|
| `Button` | Reusable button with variants |
| `Input` | Text input with validation |
| `Modal` | Modal dialog |
| `Card` | Content card |
| `Badge` | Status badge |
| `Countdown` | Countdown timer |
| `ProgressBar` | Progress indicator |
| `Dropdown` | Dropdown menu |
| `Tabs` | Tab navigation |
| `Table` | Data table |
| `Avatar` | User avatar |
| `Toast` | Notification toast |

### Form Components
| Component | Description |
|-----------|-------------|
| `Form` | Form container |
| `FormField` | Form field wrapper |
| `FileUpload` | File upload input |
| `MultiSelect` | Multi-select dropdown |
| `DatePicker` | Date picker |
| `RadioGroup` | Radio button group |
| `Checkbox` | Checkbox input |

### Domain Components
| Component | Description |
|-----------|-------------|
| `TeamCard` | Team information card |
| `PSCard` | Problem statement card |
| `Scorecard` | Score display |
| `LeaderboardTable` | Leaderboard table |
| `SubmissionCard` | Submission status card |
| `EvaluationForm` | Judge evaluation form |
| `PhaseIndicator` | Current phase indicator |

---

## Related Documents

| Document | Description |
|----------|-------------|
| [`00-overview.md`](./00-overview.md) | System architecture |
| [`05-feature-breakdown.md`](./05-feature-breakdown.md) | Feature implementation details |
| [`04-auth-rbac.md`](./04-auth-rbac.md) | Authentication and authorization |

---

**Next**: Read [`04-auth-rbac.md`](./04-auth-rbac.md) for authentication design.
