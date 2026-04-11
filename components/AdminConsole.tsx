/**
 * Admin Console Component
 * 
 * Central administration panel for managing the entire platform
 * Features:
 * - User management (students, teachers, parents)
 * - Content quality monitoring
 * - System analytics
 * - Configuration settings
 */

import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { analyticsService } from '../services/analyticsService';
import { getQuestionBankStats, getPoorlyPerformingQuestionsFromFirebase } from '../services/questionPerformance';
import { useToast } from './Toast';
import { auth, firebaseAuthService } from '../services/firebaseAuthService';
import { contentQualityService, ContentFeedback } from '../services/contentQualityService';
import {
  AdminPlatformSettings,
  getAdminPlatformSettings,
  saveAdminPlatformSettings,
} from '../services/settingsService';
import { UserProfile } from '../types';
import CloudBankMonitor from './CloudBankMonitor';

interface SystemStats {
  totalUsers: number;
  activeToday: number;
  totalQuizzes: number;
  avgAccuracy: number;
  totalQuestions: number;
  questionsWithData: number;
}

interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: string;
  lastActive: string;
  status: 'active' | 'inactive';
}

type AdminView = 'dashboard' | 'users' | 'content' | 'analytics' | 'settings';

interface AdminConsoleProps {
  onClose?: () => void;
  onOpenQuestionQuality?: () => void;
  onOpenCurriculumCoverage?: () => void;
  initialView?: AdminView;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({ onClose, onOpenQuestionQuality, onOpenCurriculumCoverage, initialView = 'dashboard' }) => {
  const { user } = useUser();
  const [activeView, setActiveView] = useState<AdminView>(initialView);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    activeToday: 0,
    totalQuizzes: 0,
    avgAccuracy: 0,
    totalQuestions: 0,
    questionsWithData: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemStats();
  }, []);

  useEffect(() => {
    setActiveView(initialView);
  }, [initialView]);

  const loadSystemStats = async () => {
    setLoading(true);
    try {
      // Get question bank stats
      const qStats = await getQuestionBankStats();
      
      // Get analytics summary
      const analyticsSummary = analyticsService.getSummary();
      
      setSystemStats({
        totalUsers: 0, // Would come from Firebase
        activeToday: 0,
        totalQuizzes: analyticsSummary.totalQuizzes,
        avgAccuracy: analyticsSummary.overallAccuracy,
        totalQuestions: qStats.totalQuestions,
        questionsWithData: qStats.questionsWithPerformanceData,
      });
    } catch (error) {
      console.error('Error loading system stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const navGroups: { label: string; items: { id: AdminView; label: string; icon: string }[] }[] = [
    {
      label: 'Overview',
      items: [{ id: 'dashboard', label: 'Dashboard', icon: '📊' }],
    },
    {
      label: 'Quality',
      items: [
        { id: 'content', label: 'Content Quality', icon: '📚' },
        { id: 'analytics', label: 'Platform Analytics', icon: '📈' },
      ],
    },
    {
      label: 'Platform',
      items: [
        { id: 'users', label: 'User Management', icon: '👥' },
        { id: 'settings', label: 'Settings', icon: '⚙️' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">🛡️ Admin Console</h1>
            <p className="text-gray-400">Platform Management & Monitoring</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              Logged in as: <span className="text-white font-medium">{user?.name}</span>
            </span>
            {onClose && (
              <button
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                Exit Admin
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 flex gap-6">
        {/* Sidebar Navigation */}
        <div className="w-64 flex-shrink-0">
          <nav className="bg-white rounded-xl shadow-sm p-3 sticky top-4 space-y-4">
            {navGroups.map(group => (
              <div key={group.label}>
                <p className="px-3 mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveView(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors border ${
                        activeView === item.id
                          ? 'bg-indigo-50 text-indigo-700 font-semibold border-indigo-200 shadow-sm'
                          : 'text-gray-600 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeView === 'dashboard' && (
            <DashboardView
              stats={systemStats}
              loading={loading}
              onNavigate={setActiveView}
              onOpenQuestionQuality={onOpenQuestionQuality}
            />
          )}
          {activeView === 'users' && <UserManagementView />}
          {activeView === 'content' && (
            <ContentQualityView
              onOpenQuestionQuality={onOpenQuestionQuality}
              onOpenCurriculumCoverage={onOpenCurriculumCoverage}
            />
          )}
          {activeView === 'analytics' && <PlatformAnalyticsView />}
          {activeView === 'settings' && <SettingsView />}
        </div>
      </div>
    </div>
  );
};

// Dashboard Overview
const DashboardView: React.FC<{
  stats: SystemStats;
  loading: boolean;
  onNavigate: (view: AdminView) => void;
  onOpenQuestionQuality?: () => void;
}> = ({ stats, loading, onNavigate, onOpenQuestionQuality }) => {
  const { showToast } = useToast();
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [claimsError, setClaimsError] = useState<string | null>(null);
  const [tokenClaims, setTokenClaims] = useState<Record<string, any> | null>(null);
  const [tokenUser, setTokenUser] = useState<{ uid: string; email: string } | null>(null);

  const loadClaims = async (forceRefresh: boolean) => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      setTokenUser(null);
      setTokenClaims(null);
      setClaimsError('Not logged in');
      return;
    }

    setClaimsLoading(true);
    setClaimsError(null);
    try {
      const tokenResult = await firebaseUser.getIdTokenResult(forceRefresh);
      setTokenUser({ uid: firebaseUser.uid, email: (firebaseUser.email || '').toLowerCase() });
      setTokenClaims(tokenResult.claims || {});
    } catch (e: any) {
      setClaimsError(e?.message || 'Failed to load token claims');
      showToast('error', e?.message || 'Failed to load token claims');
    } finally {
      setClaimsLoading(false);
    }
  };

  useEffect(() => {
    loadClaims(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statCards = [
    { label: 'Total Questions', value: stats.totalQuestions, icon: '❓', color: 'bg-blue-500' },
    { label: 'Questions with Data', value: stats.questionsWithData, icon: '📊', color: 'bg-green-500' },
    { label: 'Total Quizzes', value: stats.totalQuizzes, icon: '📝', color: 'bg-purple-500' },
    { label: 'Avg Accuracy', value: `${stats.avgAccuracy}%`, icon: '🎯', color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">System Overview</h2>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading system stats...</p>
        </div>
      ) : (
        <>
          {/* Decision Summary */}
          <div className="bg-gradient-to-r from-gray-900 to-indigo-900 rounded-xl shadow-sm p-6 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-indigo-200 font-bold mb-1">Admin priority</p>
                <h3 className="text-2xl font-bold">Review content health before changing platform settings</h3>
                <p className="text-sm text-indigo-100 mt-2">
                  Question performance is the most actionable area right now. User lists and wider analytics will become useful once platform data is connected.
                </p>
              </div>
              <button
                onClick={onOpenQuestionQuality}
                className="bg-white text-indigo-900 px-5 py-3 rounded-lg hover:bg-indigo-50 transition-colors font-bold"
              >
                Open Quality Review
              </button>
            </div>
          </div>

          {/* Session Claims */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Session Claims</h3>
                <p className="text-sm text-gray-500">Use this to confirm your admin/teacher claims are active.</p>
              </div>
              <button
                onClick={() => loadClaims(true)}
                disabled={claimsLoading}
                className="bg-gray-900 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                {claimsLoading ? 'Refreshing…' : 'Refresh Claims'}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500">User</p>
                <p className="text-sm font-medium text-gray-800 truncate">{tokenUser?.email || '—'}</p>
                <p className="text-xs text-gray-500 mt-1 truncate">UID: {tokenUser?.uid || '—'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500">Admin</p>
                <p className={`text-sm font-semibold ${tokenClaims?.admin ? 'text-green-700' : 'text-gray-700'}`}>
                  {tokenClaims?.admin ? 'true' : 'false'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Required to use role tool</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500">Teacher</p>
                <p className={`text-sm font-semibold ${tokenClaims?.teacher ? 'text-green-700' : 'text-gray-700'}`}>
                  {tokenClaims?.teacher ? 'true' : 'false'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Optional</p>
              </div>
            </div>

            {claimsError && (
              <p className="mt-3 text-sm text-red-600">{claimsError}</p>
            )}

            <details className="mt-4">
              <summary className="text-sm text-gray-700 cursor-pointer">View raw claims</summary>
              <pre className="mt-2 text-xs bg-gray-50 rounded-lg p-3 overflow-auto">
                {JSON.stringify(tokenClaims || {}, null, 2)}
              </pre>
            </details>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-2xl text-white mb-3`}>
                  {stat.icon}
                </div>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <QuickActionButton icon="📚" label="Review Content" onClick={() => onNavigate('content')} />
              <QuickActionButton icon="👥" label="Manage Roles" onClick={() => onNavigate('users')} />
              <QuickActionButton icon="📊" label="View Analytics" onClick={() => onNavigate('analytics')} />
              <QuickActionButton icon="🔧" label="System Settings" onClick={() => onNavigate('settings')} />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent System Activity</h3>
            <div className="text-center py-8 text-gray-500 border border-dashed border-gray-200 rounded-xl bg-gray-50">
              <p className="font-semibold text-gray-700">No system events recorded yet</p>
              <p className="text-sm">When admin actions, role changes, or content reviews are logged, the latest events will appear here.</p>
              <button
                onClick={() => onNavigate('content')}
                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
              >
                Review Content Health
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const QuickActionButton: React.FC<{ icon: string; label: string; onClick: () => void }> = ({
  icon,
  label,
  onClick,
}) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
  >
    <span className="text-xl">{icon}</span>
    <span className="text-sm font-medium text-gray-700">{label}</span>
  </button>
);

// User Management View
const UserManagementView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const { showToast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [manageEmail, setManageEmail] = useState('');
  const [manageRoles, setManageRoles] = useState<Record<'student' | 'parent' | 'teacher' | 'admin', boolean>>({
    student: true,
    parent: false,
    teacher: false,
    admin: false,
  });
  const [savingRoles, setSavingRoles] = useState(false);

  const loadUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const results = await firebaseAuthService.searchUsers(searchQuery.trim());
      setUsers(results);
      if (results.length === 0) {
        setUsersError(null);
      }
    } catch (e: any) {
      const message = e?.message || 'Could not load the user directory';
      setUsersError(message);
      showToast('error', message);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredUsers = users.filter((candidate) => {
    if (roleFilter === 'all') return true;
    return candidate.role === roleFilter || candidate.roles?.includes(roleFilter as any);
  });

  const submitRoleUpdate = async () => {
    const email = manageEmail.trim().toLowerCase();
    if (!email) {
      showToast('error', 'Enter an email address');
      return;
    }

    const roles = (Object.keys(manageRoles) as Array<keyof typeof manageRoles>)
      .filter((r) => manageRoles[r]);

    if (roles.length === 0) {
      showToast('error', 'Select at least one role');
      return;
    }

    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      showToast('error', 'You must be logged in');
      return;
    }

    setSavingRoles(true);
    try {
      const token = await firebaseUser.getIdToken();
      const resp = await fetch('/api/admin/set-user-roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, roles }),
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        showToast('error', data?.error || 'Failed to update roles');
        return;
      }

      showToast('success', 'Roles updated. User must sign out/in.');
    } catch (e: any) {
      showToast('error', e?.message || 'Failed to update roles');
    } finally {
      setSavingRoles(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <button disabled className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg cursor-not-allowed font-semibold">
          Add User After Signup
        </button>
      </div>

      {/* Admin-only Role Management */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Role Management</h3>
          <p className="text-sm text-gray-500">Set roles for a user by email (admin-only).</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="email"
            placeholder="user@example.com"
            value={manageEmail}
            onChange={(e) => setManageEmail(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            onClick={submitRoleUpdate}
            disabled={savingRoles}
            className="bg-indigo-600 disabled:bg-indigo-300 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {savingRoles ? 'Updating…' : 'Update Roles'}
          </button>
        </div>

        <div className="flex flex-wrap gap-4">
          {(Object.keys(manageRoles) as Array<keyof typeof manageRoles>).map((r) => (
            <label key={r} className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={manageRoles[r]}
                onChange={(e) => setManageRoles((prev) => ({ ...prev, [r]: e.target.checked }))}
                className="h-4 w-4"
              />
              <span className="capitalize">{r}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search users by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter') void loadUsers();
          }}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Roles</option>
          <option value="student">Students</option>
          <option value="teacher">Teachers</option>
          <option value="parent">Parents</option>
          <option value="admin">Admins</option>
        </select>
        <button
          onClick={() => loadUsers()}
          disabled={usersLoading}
          className="bg-gray-900 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
        >
          {usersLoading ? 'Searching…' : 'Search Directory'}
        </button>
      </div>

      {/* User List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {usersLoading ? (
          <div className="p-8 text-center text-gray-500">Loading user directory…</div>
        ) : usersError ? (
          <div className="p-6 text-center text-gray-500">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Directory access needs admin permission</h3>
            <p className="text-sm max-w-lg mx-auto">
              Role changes are still available above by email. The searchable directory will appear when the signed-in account has an admin claim and Firestore allows user reads.
            </p>
            <p className="text-xs text-red-600 mt-3">{usersError}</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="divide-y">
            {filteredUsers.map((candidate) => (
              <div key={candidate.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-800">{candidate.name || 'Unnamed user'}</p>
                  <p className="text-sm text-gray-500">{candidate.id}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(candidate.roles?.length ? candidate.roles : [candidate.role]).map((role) => (
                    <span key={role} className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold capitalize">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <div className="text-5xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No users found</h3>
            <p className="text-sm">
              Try a different name search. Role changes are available above by email even when the directory is empty.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Content Quality View
const ContentQualityView: React.FC<{
  onOpenQuestionQuality?: () => void;
  onOpenCurriculumCoverage?: () => void;
}> = ({
  onOpenQuestionQuality,
  onOpenCurriculumCoverage,
}) => {
  const { showToast } = useToast();
  const [pendingFeedback, setPendingFeedback] = useState<ContentFeedback[]>(() => contentQualityService.getPendingFeedback());
  const [questionStats, setQuestionStats] = useState<{ totalQuestions: number; questionsWithPerformanceData: number } | null>(null);
  const [poorQuestionCount, setPoorQuestionCount] = useState<number | null>(null);

  const refreshModerationQueue = () => {
    setPendingFeedback(contentQualityService.getPendingFeedback());
  };

  useEffect(() => {
    let cancelled = false;
    getQuestionBankStats()
      .then((stats) => {
        if (!cancelled) setQuestionStats(stats);
      })
      .catch(() => {
        if (!cancelled) setQuestionStats(null);
      });

    getPoorlyPerformingQuestionsFromFirebase()
      .then((questions) => {
        if (!cancelled) setPoorQuestionCount(questions.length);
      })
      .catch(() => {
        if (!cancelled) setPoorQuestionCount(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const resolveFeedback = (feedbackId: string) => {
    contentQualityService.resolveFeedback(feedbackId);
    refreshModerationQueue();
    showToast('success', 'Feedback marked resolved');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Content Quality</h2>

      <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-orange-600 font-bold mb-1">Needs attention</p>
            <h3 className="text-xl font-bold text-gray-800">Review question performance first</h3>
            <p className="text-sm text-gray-600 mt-1">
              Content quality has the clearest admin action today. Moderation and question-bank management stay quiet until flagged items or editable records are available.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                {poorQuestionCount === null ? 'Question review loading' : `${poorQuestionCount} weak questions`}
              </span>
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full">
                {pendingFeedback.length} moderation item{pendingFeedback.length === 1 ? '' : 's'}
              </span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                {questionStats ? `${questionStats.totalQuestions} bank questions` : 'Bank stats loading'}
              </span>
            </div>
          </div>
          <button
            onClick={onOpenQuestionQuality}
            disabled={!onOpenQuestionQuality}
            className="bg-orange-600 disabled:bg-orange-300 text-white px-5 py-3 rounded-lg hover:bg-orange-700 transition-colors font-bold"
          >
            Review Questions
          </button>
        </div>
      </div>

      {/* Cloud Bank Monitor - Full Width */}
      <CloudBankMonitor />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Question Quality Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:col-span-2 border border-purple-200 ring-4 ring-purple-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
              📊
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Question Quality Dashboard</h3>
              <p className="text-sm text-gray-500">Primary action: find questions that need review</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            View detailed analytics on question performance, identify poorly performing questions,
            and track overall content quality.
          </p>
          <button
            onClick={onOpenQuestionQuality}
            disabled={!onOpenQuestionQuality}
            className="w-full bg-purple-600 disabled:bg-purple-300 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Open Question Quality Dashboard
          </button>
        </div>

        {/* Curriculum Coverage Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
              📚
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Curriculum Coverage</h3>
              <p className="text-sm text-gray-500">Track content completeness</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Review which curriculum areas are covered and identify gaps in content.
          </p>
          <button
            onClick={onOpenCurriculumCoverage}
            disabled={!onOpenCurriculumCoverage}
            className="w-full bg-blue-600 disabled:bg-blue-300 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Curriculum Coverage
          </button>
        </div>

        {/* Content Moderation Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-2xl">
              🛡️
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Content Moderation</h3>
              <p className="text-sm text-gray-500">Review flagged content</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            {pendingFeedback.length > 0
              ? `${pendingFeedback.length} flagged item${pendingFeedback.length === 1 ? '' : 's'} need admin review.`
              : 'No flagged content is waiting right now. This queue will open when learner feedback or validation checks flag an item.'}
          </p>
          {pendingFeedback.length > 0 ? (
            <div className="space-y-3">
              {pendingFeedback.slice(0, 4).map((feedback) => (
                <div key={feedback.id} className="border border-orange-100 bg-orange-50 rounded-lg p-3">
                  <p className="text-sm font-semibold text-gray-800">
                    {feedback.contentId} · {feedback.reason || feedback.type}
                  </p>
                  {feedback.message && <p className="text-xs text-gray-600 mt-1">{feedback.message}</p>}
                  <button
                    onClick={() => resolveFeedback(feedback.id)}
                    className="mt-3 bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 text-sm font-semibold"
                  >
                    Mark Resolved
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <button disabled className="w-full bg-orange-100 text-orange-700 py-2 rounded-lg cursor-not-allowed font-medium">
              No Flagged Content
            </button>
          )}
        </div>

        {/* Question Bank Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
              📝
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Question Bank</h3>
              <p className="text-sm text-gray-500">Manage question database</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            {questionStats
              ? `${questionStats.totalQuestions} questions are available, with ${questionStats.questionsWithPerformanceData} carrying performance data. Use quality review for the actionable queue until direct editing is connected.`
              : 'Loading question-bank statistics. Direct editing still needs a management endpoint before records can be safely changed here.'}
          </p>
          <button
            onClick={onOpenQuestionQuality}
            disabled={!onOpenQuestionQuality}
            className="w-full bg-green-600 disabled:bg-green-100 disabled:text-green-700 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Review Bank Performance
          </button>
        </div>
      </div>
    </div>
  );
};

// Platform Analytics View
const PlatformAnalyticsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Platform Analytics</h2>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📈</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No platform-wide dataset connected yet</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Learning analytics from quizzes are available locally. Wider engagement, outcomes, and usage reports should appear here once the analytics pipeline is connected.
          </p>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="text-4xl mb-2">📊</div>
          <h4 className="font-medium text-gray-800">Usage Reports</h4>
          <p className="text-sm text-gray-500">Daily, weekly, monthly trends</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="text-4xl mb-2">🎓</div>
          <h4 className="font-medium text-gray-800">Learning Outcomes</h4>
          <p className="text-sm text-gray-500">Progress & achievement data</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="text-4xl mb-2">🌍</div>
          <h4 className="font-medium text-gray-800">Geographic Data</h4>
          <p className="text-sm text-gray-500">Regional usage patterns</p>
        </div>
      </div>
    </div>
  );
};

// Settings View
const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<AdminPlatformSettings>(() => getAdminPlatformSettings());
  const [saveMessage, setSaveMessage] = useState('');

  const updateSetting = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaveMessage('');
  };

  const handleSave = () => {
    const saved = saveAdminPlatformSettings(settings);
    setSettings(saved);
    setSaveMessage('Settings saved on this device.');
    window.setTimeout(() => setSaveMessage(''), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Grouped controls with clear ownership and save feedback.</p>
        </div>
        <div className="flex items-center gap-3">
          {saveMessage && <span className="text-sm font-semibold text-green-700">{saveMessage}</span>}
          <button
            onClick={handleSave}
            className="bg-indigo-600 text-white px-5 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-bold"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800">Platform</h3>
          <p className="text-sm text-gray-500 mb-4">Core product identity and availability.</p>
          <div className="space-y-4">
            <SettingRow
              label="Platform Name"
              description="The name displayed across the platform"
              type="text"
              value={settings.platformName}
              onChange={(value) => updateSetting('platformName', value as string)}
            />
            <SettingRow
              label="Maintenance Mode"
              description="Disable access for non-admin users"
              type="toggle"
              value={settings.maintenanceMode}
              onChange={(value) => updateSetting('maintenanceMode', value as boolean)}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800">Rewards</h3>
          <p className="text-sm text-gray-500 mb-4">Motivation rules for games, points, and learner momentum.</p>
          <div className="space-y-4">
            <SettingRow
              label="Questions to Unlock Games"
              description="Correct answers needed to unlock mini games"
              type="number"
              value={settings.questionsToUnlockGames}
              onChange={(value) => updateSetting('questionsToUnlockGames', Number(value))}
            />
            <SettingRow
              label="Points per Correct Answer"
              description="XP earned for each correct answer"
              type="number"
              value={settings.pointsPerCorrectAnswer}
              onChange={(value) => updateSetting('pointsPerCorrectAnswer', Number(value))}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800">AI</h3>
          <p className="text-sm text-gray-500 mb-4">Controls for generated questions and minimum quality gates.</p>
          <div className="space-y-4">
            <SettingRow
              label="Enable AI Questions"
              description="Allow AI to generate questions when needed"
              type="toggle"
              value={settings.enableAIQuestions}
              onChange={(value) => updateSetting('enableAIQuestions', value as boolean)}
            />
            <SettingRow
              label="Quality Threshold"
              description="Minimum quality score for AI questions (0-100)"
              type="number"
              value={settings.qualityThreshold}
              onChange={(value) => updateSetting('qualityThreshold', Number(value))}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800">Safety</h3>
          <p className="text-sm text-gray-500 mb-4">Moderation and review defaults for learner-facing content.</p>
          <div className="space-y-4">
            <SettingRow
              label="Content Review Queue"
              description="Route flagged generated content into an admin review queue"
              type="toggle"
              value={settings.safetyReviewEnabled}
              onChange={(value) => updateSetting('safetyReviewEnabled', value as boolean)}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800">Access</h3>
          <p className="text-sm text-gray-500 mb-4">Role and account-management controls.</p>
          <div className="space-y-4">
            <SettingRow
              label="Admin-only Role Changes"
              description="Require admin claims before role updates are accepted"
              type="toggle"
              value={settings.adminOnlyRoleChanges}
              onChange={(value) => updateSetting('adminOnlyRoleChanges', value as boolean)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingRow: React.FC<{
  label: string;
  description: string;
  type: 'text' | 'number' | 'toggle';
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
}> = ({ label, description, type, value, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b last:border-0">
    <div>
      <p className="font-medium text-gray-800">{label}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    {type === 'toggle' ? (
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-colors ${
          value ? 'bg-green-500' : 'bg-gray-300'
        }`}
        aria-pressed={Boolean(value)}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
            value ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        />
      </button>
    ) : (
      <input
        type={type}
        value={String(value)}
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        className="w-40 px-3 py-2 border rounded-lg text-right"
      />
    )}
  </div>
);

export default AdminConsole;
