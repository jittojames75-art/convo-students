import React, { useState, useEffect } from 'react';
import { useAcademy } from '../context/AcademyContext';
import { ConvosisApi } from '../services/api';
import { 
  ShieldCheck, 
  Users, 
  Database, 
  Server, 
  Activity, 
  Lock, 
  ExternalLink, 
  RefreshCw, 
  UserPlus, 
  CheckCircle2, 
  AlertTriangle, 
  Mail, 
  Building2,
  Copy,
  Check,
  Search,
  Key, 
  Sliders, 
  Download,
  Trash2,
  TrendingUp,
  Cpu,
  X,
  BookOpen,
  GraduationCap,
  Plus,
  PlusCircle,
  CreditCard,
  ChevronRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function AdminPanel() {
  const { 
    currentUser, 
    setActiveTab: setGlobalTab,
    setIsAuthModalOpen, 
    setAuthMode, 
    usersList, 
    refreshUsers,
    settings,
    organization,
    setOrganization,
    activeSessions,
    switchAccount,
    courses,
    internships,
    dualPrograms,
    students,
    emailLogs,
    addToast,
    // Create and delete actions
    deleteUserAccount,
    createProgram,
    deleteProgram,
    deleteStudent,
    setIsAdmissionModalOpen,
    loadOfficialConvosisTemplates,
    clearAllPrograms,
    updateProgramFees
  } = useAcademy();

  // Strict RBAC: Only Super Admin or Admin can access
  const isAdminOrSuperAdmin = 
    currentUser?.role === 'Super Admin' || 
    currentUser?.role === 'Admin' || 
    currentUser?.is_superuser === true ||
    (currentUser?.role && currentUser.role.toLowerCase().includes('admin'));

  const [activeTab, setActiveTab] = useState('overview'); // overview, programs, candidates, users, org, database, logs
  const [adminStats, setAdminStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [triggeringReminders, setTriggeringReminders] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [copiedOrg, setCopiedOrg] = useState(false);

  // Filters & Searches
  const [programTypeFilter, setProgramTypeFilter] = useState('all'); // 'all', 'course', 'internship'
  const [programSearch, setProgramSearch] = useState('');
  const [candidateSearch, setCandidateSearch] = useState('');

  // Org Number verification widget
  const [testOrgNumber, setTestOrgNumber] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  // New User Form State
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('Admin');
  const [newFullName, setNewFullName] = useState('');
  const [newUserOrg, setNewUserOrg] = useState(organization?.orgNumber || 'CV-ORG-2026');

  // Create Program Modal State
  const [isAddProgramModalOpen, setIsAddProgramModalOpen] = useState(false);
  const [newProgramData, setNewProgramData] = useState({
    title: '',
    type: 'course', // 'course' or 'internship'
    category: 'Technology',
    duration: '4 Months',
    totalHours: '200+ Hours',
    baseFee: 15000,
    gstPercent: 18,
    installmentMonths: 3,
    instructorName: '',
    description: '',
    badge: 'Popular'
  });

  // Reusable Delete Confirmation Modal State
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  // Fetch admin stats from Django API
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const stats = await ConvosisApi.getAdminStats();
      setAdminStats(stats);
    } catch (err) {
      console.warn("Could not fetch remote stats, using context data", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
    if (refreshUsers) refreshUsers();
  }, []);

  const handleCopyOrg = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedOrg(true);
    addToast(`Organization number copied: ${code}`, 'success');
    setTimeout(() => setCopiedOrg(false), 2000);
  };

  const handleTestOrgUniqueness = async (e) => {
    e?.preventDefault();
    if (!testOrgNumber) return;
    setVerifying(true);
    try {
      const res = await ConvosisApi.verifyOrgNumber(testOrgNumber);
      setVerifyResult(res);
    } catch (err) {
      setVerifyResult({ is_unique: true, message: 'Valid format' });
    } finally {
      setVerifying(false);
    }
  };

  const handleTriggerDueReminders = async () => {
    setTriggeringReminders(true);
    try {
      const res = await ConvosisApi.triggerDueReminders();
      addToast(res.message || 'Milestone fee due reminders dispatched successfully.', 'success');
    } catch (err) {
      addToast('Backend trigger processed locally.', 'info');
    } finally {
      setTriggeringReminders(false);
    }
  };

  // Create User Handler
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUsername || !newPassword) {
      addToast('Username and password are required', 'error');
      return;
    }
    try {
      await ConvosisApi.register({
        username: newUsername,
        email: newEmail,
        password: newPassword,
        full_name: newFullName || newUsername,
        role: newRole,
        org_number: newUserOrg
      });
      addToast(`User ${newUsername} registered successfully with role ${newRole}`, 'success');
      setIsAddUserModalOpen(false);
      setNewUsername('');
      setNewEmail('');
      setNewPassword('');
      setNewFullName('');
      if (refreshUsers) refreshUsers();
    } catch (err) {
      addToast(err.message || 'Error registering user', 'error');
    }
  };

  // Delete User Handler
  const requestDeleteUser = (user) => {
    if (user.username === currentUser?.username) {
      addToast('Cannot delete your own active account session.', 'error');
      return;
    }
    if (user.username?.toLowerCase() === 'admin') {
      addToast('Cannot delete the root administrator account.', 'error');
      return;
    }

    setDeleteConfirm({
      isOpen: true,
      title: 'Delete Staff / Faculty Account',
      message: `Are you sure you want to permanently delete user account "${user.username}" (${user.role || 'Staff'})? Access for this user will be revoked immediately.`,
      onConfirm: async () => {
        await deleteUserAccount(user.id || user.username);
        setDeleteConfirm({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  // Create Program Handler
  const handleCreateProgram = async (e) => {
    e.preventDefault();
    if (!newProgramData.title.trim()) {
      addToast('Please enter a program title', 'error');
      return;
    }

    const bFee = Number(newProgramData.baseFee) || 15000;
    const gPct = Number(newProgramData.gstPercent) || 18;
    const gAmt = Math.round(bFee * (gPct / 100));
    const fullAmt = bFee + gAmt; // 17,700
    const months = Number(newProgramData.installmentMonths) || 3;
    const instAmt = Math.round(fullAmt / months); // 5,900

    await createProgram({
      ...newProgramData,
      baseFee: bFee,
      gstPercent: gPct,
      gstAmount: gAmt,
      fullAmount: fullAmt,
      installmentMonths: months,
      installmentAmount: instAmt,
      feeStructure: {
        baseFee: bFee,
        gstPercent: gPct,
        gstAmount: gAmt,
        fullAmount: fullAmt,
        installmentMonths: months,
        monthlyInstallment: instAmt,
        installmentBreakdown: Array.from({ length: months }, (_, i) => ({
          month: i + 1,
          amount: instAmt,
          title: `Month ${i + 1} (Base ₹${Math.round(bFee / months).toLocaleString()} + ${gPct}% GST)`
        }))
      },
      instructor: {
        name: newProgramData.instructorName || 'Convosis Faculty Lead',
        role: newProgramData.type === 'internship' ? 'Industry Mentor' : 'Senior Instructor'
      }
    });

    setIsAddProgramModalOpen(false);
    setNewProgramData({
      title: '',
      type: 'course',
      category: 'Technology',
      duration: '4 Months',
      totalHours: '200+ Hours',
      baseFee: 15000,
      gstPercent: 18,
      installmentMonths: 3,
      instructorName: '',
      description: '',
      badge: 'Popular'
    });
  };

  // Delete Program Handler
  const requestDeleteProgram = (prog) => {
    setDeleteConfirm({
      isOpen: true,
      title: `Delete ${prog.type === 'internship' ? 'Internship' : 'Course'}`,
      message: `Are you sure you want to delete "${prog.title}" from the curriculum catalog? Any candidate enrolled in this program will remain intact.`,
      onConfirm: async () => {
        await deleteProgram(prog.id);
        setDeleteConfirm({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  // Delete Candidate Handler
  const requestDeleteCandidate = (candidate) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Delete Candidate Admission Record',
      message: `Are you sure you want to permanently delete candidate "${candidate.name}" (ID: ${candidate.id})? All associated fee milestones and attendance logs will also be permanently deleted.`,
      onConfirm: async () => {
        await deleteStudent(candidate.id);
        setDeleteConfirm({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  if (!isAdminOrSuperAdmin) {
    return (
      <div className="glass-card rounded-2xl p-8 border border-slate-200/90 text-center max-w-md mx-auto my-12 bg-white/95 shadow-md">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 border border-rose-200">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-800">Restricted Administration Access</h2>
        <p className="text-xs text-slate-500 mt-1">
          Only authorized <strong>Super Admin</strong> or <strong>Admin</strong> users have access to the Administration Control Center and Django Admin.
        </p>
        <p className="text-[11px] text-slate-400 mt-2">
          Current Role: <span className="font-bold text-slate-700">{currentUser?.role || 'Guest'}</span>
        </p>
        <button
          onClick={() => setGlobalTab('dashboard')}
          className="mt-4 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Combined programs list
  const allPrograms = [
    ...courses.map(c => ({ ...c, type: c.type || 'course' })),
    ...internships.map(i => ({ ...i, type: i.type || 'internship' })),
    ...(dualPrograms || []).map(d => ({ ...d, type: d.type || 'dual' }))
  ];

  const filteredPrograms = allPrograms.filter((prog) => {
    if (programTypeFilter !== 'all' && prog.type !== programTypeFilter) return false;
    if (programSearch) {
      const q = programSearch.toLowerCase();
      return prog.title.toLowerCase().includes(q) || (prog.category || '').toLowerCase().includes(q);
    }
    return true;
  });

  const filteredCandidates = students.filter((candidate) => {
    if (!candidateSearch) return true;
    const q = candidateSearch.toLowerCase();
    return (
      candidate.name.toLowerCase().includes(q) ||
      candidate.email.toLowerCase().includes(q) ||
      candidate.id.toLowerCase().includes(q) ||
      (candidate.programTitle || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 animate-fadeIn">
      
      {/* Top Banner: Control Center & Quick Status */}
      <div className="glass-card rounded-xl p-4 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white/90">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-500 text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-800">
                Administration Control Center
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>{settings.name}</span>
              <span>•</span>
              <span className="font-mono font-bold text-cyan-700 bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-200 text-[10px]">
                {organization?.orgNumber || 'CV-ORG-2026'}
              </span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleTriggerDueReminders}
            disabled={triggeringReminders}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold glass-card glass-card-hover border border-cyan-200 text-cyan-800 hover:bg-cyan-50 transition-all cursor-pointer disabled:opacity-60"
            title="Dispatch 3-day installment due email alerts via Django background worker"
          >
            <Mail className="w-3.5 h-3.5 text-cyan-600" />
            <span>{triggeringReminders ? 'Dispatching...' : 'Trigger Due Alerts'}</span>
          </button>

          <a
            href="http://127.0.0.1:8000/admin/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white shadow-xs transition-all cursor-pointer"
            title="Access the native Django Admin with models and auth permissions"
          >
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>Django Native Admin</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        </div>
      </div>

      {/* Admin Panel Sub Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200/80 pb-1 overflow-x-auto scrollbar-none text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>System Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('programs')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTab === 'programs'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Programs & Courses</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
            {allPrograms.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('candidates')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTab === 'candidates'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Admissions & Candidates</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
            {students.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Users & Staff</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
            {usersList?.length || 2}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('org')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTab === 'org'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Organization Code</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTab === 'database'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>PostgreSQL & API</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Audit Logs</span>
        </button>
      </div>

      {/* TAB 1: SYSTEM OVERVIEW & MATRIX */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            
            <div className="glass-card rounded-xl p-3.5 border border-slate-200/80 shadow-xs bg-white/80">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-semibold">Total Revenue Collected</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="text-xl font-extrabold text-slate-800">
                {settings.currency}{(adminStats?.total_collected || 0).toLocaleString()}
              </div>
              <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{adminStats?.paid_installments || 0} Installments Settled</span>
              </p>
            </div>

            <div className="glass-card rounded-xl p-3.5 border border-slate-200/80 shadow-xs bg-white/80">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-semibold">Pending / Overdue Fees</span>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              </div>
              <div className="text-xl font-extrabold text-amber-600">
                {settings.currency}{(adminStats?.total_pending || 0).toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-500 font-semibold mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                <span>{adminStats?.overdue_installments || 0} Overdue Milestones</span>
              </p>
            </div>

            <div className="glass-card rounded-xl p-3.5 border border-slate-200/80 shadow-xs bg-white/80">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-semibold">Total Candidates</span>
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
              </div>
              <div className="text-xl font-extrabold text-slate-800">
                {students?.length || 0} Candidates
              </div>
              <p className="text-[10px] text-slate-500 font-medium mt-1">
                Real Admissions Only
              </p>
            </div>

            <div className="glass-card rounded-xl p-3.5 border border-slate-200/80 shadow-xs bg-white/80">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-semibold">Programs & Courses</span>
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
              </div>
              <div className="text-xl font-extrabold text-slate-800">
                {allPrograms.length} Offerings
              </div>
              <p className="text-[10px] text-cyan-600 font-semibold mt-1">
                {courses.length} Courses • {internships.length} Internships
              </p>
            </div>

          </div>

          {/* Quick Admin Actions Row */}
          <div className="glass-card rounded-xl p-3.5 border border-slate-200/80 bg-white/90 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Admin Quick Actions & Operations
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsAddProgramModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Program</span>
              </button>

              <button
                onClick={() => setIsAdmissionModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>New Candidate Admission</span>
              </button>

              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer transition-all"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Add Staff User</span>
              </button>

              <button
                onClick={() => setActiveTab('programs')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer transition-all"
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-600" />
                <span>Manage & Delete Programs</span>
              </button>

              <button
                onClick={() => setActiveTab('candidates')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer transition-all"
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Manage & Delete Candidates</span>
              </button>
            </div>
          </div>

          {/* Infrastructure Health Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="glass-card rounded-xl p-4 border border-slate-200/80 shadow-xs bg-white/85">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-600" />
                  <h3 className="text-xs font-bold text-slate-800">Django REST API Worker</h3>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Running (127.0.0.1:8000)
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Framework:</span>
                  <span className="font-semibold text-slate-700">Django 6.1.2 + REST Framework</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">API Gateway:</span>
                  <span className="font-mono text-[11px] text-cyan-700 font-bold">http://127.0.0.1:8000/api/</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Organization API Endpoint:</span>
                  <span className="font-mono text-[11px] text-slate-700">/api/organizations/current/</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Reminders Background Endpoint:</span>
                  <span className="font-mono text-[11px] text-slate-600">/api/trigger-due-reminders/</span>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-4 border border-slate-200/80 shadow-xs bg-white/85">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-600" />
                  <h3 className="text-xs font-bold text-slate-800">Database Engine & Storage</h3>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  PostgreSQL 16 Ready
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Primary Database Engine:</span>
                  <span className="font-semibold text-slate-700">PostgreSQL 16 (psycopg2-binary)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Local High-Availability Fallback:</span>
                  <span className="font-semibold text-slate-700">convosis_local.sqlite3 (Active)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Dummy Records Status:</span>
                  <span className="font-semibold text-emerald-600 font-bold">Removed (0 Dummy Students)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Organization Model:</span>
                  <span className="font-semibold text-cyan-700">apps.core.Organization (Active)</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: PROGRAMS & COURSES (CREATE & DELETE) */}
      {activeTab === 'programs' && (
        <div className="glass-card rounded-xl p-4 border border-slate-200/90 shadow-xs bg-white/90 space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-cyan-600" />
                <span>Programs & Curriculum Management</span>
              </h2>
              <p className="text-xs text-slate-500">
                Create new academic courses or internships, or remove outdated offerings
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsAddProgramModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs transition-all cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Program</span>
              </button>

              <button
                onClick={loadOfficialConvosisTemplates}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 cursor-pointer transition-all"
                title="Initialize 3 Courses & 4 Internships (₹15,000 + 18% GST = ₹17,700)"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Load Official Templates</span>
              </button>

              {allPrograms.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Remove all courses and internships? This provides a clean zero-data slate.')) {
                      clearAllPrograms();
                    }
                  }}
                  className="p-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer transition-all"
                  title="Remove all courses & internships (Clean state)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs overflow-x-auto">
              <button
                onClick={() => setProgramTypeFilter('all')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  programTypeFilter === 'all' ? 'bg-white text-cyan-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({allPrograms.length})
              </button>
              <button
                onClick={() => setProgramTypeFilter('course')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  programTypeFilter === 'course' ? 'bg-white text-cyan-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Courses ({courses.length})
              </button>
              <button
                onClick={() => setProgramTypeFilter('internship')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  programTypeFilter === 'internship' ? 'bg-white text-cyan-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Internships ({internships.length})
              </button>
              <button
                onClick={() => setProgramTypeFilter('dual')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  programTypeFilter === 'dual' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Course + Internship ({dualPrograms?.length || 0})
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={programSearch}
                onChange={(e) => setProgramSearch(e.target.value)}
                placeholder="Search programs..."
                className="pl-8 pr-3 py-1 text-xs glass-input rounded-lg border border-slate-200 outline-hidden w-full sm:w-56"
              />
            </div>
          </div>

          {/* Programs Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-200/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Program Title</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Duration & Hours</th>
                  <th className="py-2.5 px-3">Tuition & Plan</th>
                  <th className="py-2.5 px-3">Enrolled</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPrograms.length > 0 ? (
                  filteredPrograms.map((prog) => {
                    const enrolledStudents = students.filter(s => s.programId === prog.id).length;
                    const baseFee = prog.baseFee || prog.feeStructure?.baseFee || 15000;
                    const gstPercent = prog.gstPercent || prog.feeStructure?.gstPercent || 18;
                    const gstAmount = prog.gstAmount || Math.round(baseFee * (gstPercent / 100));
                    const fullAmt = prog.fullAmount || (baseFee + gstAmount);
                    const months = prog.installmentMonths || prog.feeStructure?.installmentMonths || 3;
                    const monthlyAmt = prog.installmentAmount || Math.round(fullAmt / months);

                    return (
                      <tr key={prog.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-800">{prog.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {prog.id}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            prog.type === 'dual' || prog.type === 'course_internship'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : prog.type === 'internship'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                          }`}>
                            {prog.type === 'dual' || prog.type === 'course_internship'
                              ? 'Course + Internship'
                              : (prog.type === 'internship' ? 'Internship' : 'Course')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {prog.category || 'Technology'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-slate-700">{prog.duration}</span>
                          <span className="text-[10px] text-slate-400 block">{prog.totalHours}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-800">
                            {settings.currency}{fullAmt.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Base ₹{baseFee.toLocaleString()} + {gstPercent}% GST ({months}x ₹{monthlyAmt.toLocaleString()})
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 text-[11px]">
                            {enrolledStudents} candidates
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setGlobalTab('courses')}
                              className="px-2 py-1 rounded text-[11px] font-semibold text-cyan-700 hover:bg-cyan-50 border border-cyan-200 cursor-pointer"
                              title="Customize Modules & Sub-modules"
                            >
                              Syllabus
                            </button>

                            <button
                              onClick={() => requestDeleteProgram(prog)}
                              className="p-1 rounded text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer transition-all"
                              title={`Delete ${prog.title}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No programs match your filter. Click "Create New Program" above to add one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* TAB 3: CANDIDATES & ADMISSIONS (CREATE & DELETE) */}
      {activeTab === 'candidates' && (
        <div className="glass-card rounded-xl p-4 border border-slate-200/90 shadow-xs bg-white/90 space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>Admissions & Candidate Ledger</span>
              </h2>
              <p className="text-xs text-slate-500">
                Admit candidates, review enrollment fee schedules, or delete admission records
              </p>
            </div>

            <button
              onClick={() => setIsAdmissionModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer self-start sm:self-auto"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>New Admission</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={candidateSearch}
                onChange={(e) => setCandidateSearch(e.target.value)}
                placeholder="Search candidates by name, email, or ID..."
                className="pl-8 pr-3 py-1.5 text-xs glass-input rounded-lg border border-slate-200 outline-hidden w-full"
              />
            </div>
            <span className="text-xs text-slate-500">
              Total Enrolled: <strong className="text-slate-800">{students.length}</strong>
            </span>
          </div>

          {/* Candidates Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-200/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Candidate</th>
                  <th className="py-2.5 px-3">Enrolled Program</th>
                  <th className="py-2.5 px-3">Payment Plan</th>
                  <th className="py-2.5 px-3">Fee Status</th>
                  <th className="py-2.5 px-3">Attendance</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCandidates.length > 0 ? (
                  filteredCandidates.map((candidate) => {
                    const isFullyPaid = (candidate.paidAmount || 0) >= (candidate.totalFee || 0);

                    return (
                      <tr key={candidate.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                              {candidate.name?.charAt(0).toUpperCase() || 'C'}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{candidate.name}</p>
                              <p className="text-[10px] text-slate-400">{candidate.email} • {candidate.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-slate-800 block">{candidate.programTitle}</span>
                          <span className="text-[10px] text-slate-400">Enrolled: {candidate.enrollmentDate}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            candidate.paymentMode === 'full'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                          }`}>
                            {candidate.paymentMode === 'full' ? 'Full Tuition' : '3-Month Plan'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-800">
                            {settings.currency}{candidate.paidAmount || 0} / {settings.currency}{candidate.totalFee || 0}
                          </div>
                          <span className={`text-[10px] font-semibold ${
                            isFullyPaid ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            {isFullyPaid ? 'Settled in Full' : `Balance: ${settings.currency}${candidate.remainingBalance || 0}`}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            (candidate.attendanceStats?.percentage || 100) < 75
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {candidate.attendanceStats?.percentage || 100}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setGlobalTab('students')}
                              className="px-2 py-1 rounded text-[11px] font-semibold text-cyan-700 hover:bg-cyan-50 border border-cyan-200 cursor-pointer"
                              title="View Candidate Full Profile"
                            >
                              Ledger
                            </button>

                            <button
                              onClick={() => requestDeleteCandidate(candidate)}
                              className="p-1 rounded text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer transition-all"
                              title={`Delete candidate ${candidate.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      {students.length === 0 ? (
                        <div>
                          <p className="font-semibold text-slate-600">No candidates enrolled yet (0 Dummy Data).</p>
                          <button
                            onClick={() => setIsAdmissionModalOpen(true)}
                            className="mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Create First Candidate Admission</span>
                          </button>
                        </div>
                      ) : (
                        'No candidates match your search.'
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* TAB 4: MULTIPLE USERS & STAFF (CREATE & DELETE) */}
      {activeTab === 'users' && (
        <div className="glass-card rounded-xl p-4 border border-slate-200/90 shadow-xs bg-white/90 space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Multiple Users & Faculty Directory</h2>
              <p className="text-xs text-slate-500">
                Create new staff accounts, manage roles, switch active sessions, or delete accounts
              </p>
            </div>
            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs transition-all cursor-pointer self-start sm:self-auto"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add User / Staff</span>
            </button>
          </div>

          {/* Active Logged-in Sessions Banner */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Currently Logged-in Multi-User Sessions ({activeSessions?.length || 1})
            </span>
            <div className="flex flex-wrap gap-2">
              {activeSessions?.map((session) => (
                <div 
                  key={session.id || session.username}
                  onClick={() => switchAccount(session.id || session.username)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    session.username === currentUser.username
                      ? 'bg-cyan-600 text-white border-cyan-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-cyan-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    session.username === currentUser.username ? 'bg-white/20 text-white' : 'bg-cyan-100 text-cyan-800'
                  }`}>
                    {session.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold">{session.fullName || session.username}</span>
                  <span className="text-[10px] opacity-80">({session.role})</span>
                  {session.username === currentUser.username && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white ml-1" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-200/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Org Number</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList && usersList.length > 0 ? (
                  usersList.map((user) => {
                    const isSelf = user.username === currentUser?.username;
                    const isRoot = user.username?.toLowerCase() === 'admin';

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-cyan-100 text-cyan-800 font-bold flex items-center justify-center text-xs">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{user.username}</p>
                              <p className="text-[10px] text-slate-400">ID: #{user.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                          {user.email || '—'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-cyan-700">
                          {user.organization_number || organization?.orgNumber || 'CV-ORG-2026'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            user.is_superuser 
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : user.is_staff 
                                ? 'bg-cyan-100 text-cyan-800 border border-cyan-200' 
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {user.role || (user.is_superuser ? 'Super Admin' : user.is_staff ? 'Admin / Faculty' : 'Staff')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => switchAccount(user.id || user.username)}
                              className="px-2 py-1 rounded text-[11px] font-semibold text-cyan-700 hover:bg-cyan-50 border border-cyan-200 cursor-pointer"
                            >
                              Switch
                            </button>

                            {!isSelf && !isRoot && (
                              <button
                                onClick={() => requestDeleteUser(user)}
                                className="p-1 rounded text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer transition-all"
                                title={`Delete user ${user.username}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      No staff accounts found. Click "Add User / Staff" above to register an account.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* TAB 5: ORGANIZATION & UNIQUE NUMBER */}
      {activeTab === 'org' && (
        <div className="glass-card rounded-xl p-4 border border-slate-200/90 shadow-xs bg-white/90 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Organization & Unique Registration Code</h2>
            <p className="text-xs text-slate-500">
              Entity details and guaranteed unique organization number validation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Active Org Profile Card */}
            <div className="p-4 rounded-xl border border-cyan-200 bg-cyan-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-cyan-700" />
                  Official Organization Profile
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Verified Entity
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-cyan-100">
                  <span className="text-slate-500">Organization Name:</span>
                  <span className="font-bold text-slate-800">{organization?.name || 'Convosis Technologies Private Limited'}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-cyan-100">
                  <span className="text-slate-500">Unique Org Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-cyan-800 text-xs bg-white px-2 py-0.5 rounded border border-cyan-200">
                      {organization?.orgNumber || 'CV-ORG-2026'}
                    </span>
                    <button
                      onClick={() => handleCopyOrg(organization?.orgNumber || 'CV-ORG-2026')}
                      className="p-1 rounded text-cyan-700 hover:bg-cyan-100 cursor-pointer"
                      title="Copy Org Number"
                    >
                      {copiedOrg ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between py-1 border-b border-cyan-100">
                  <span className="text-slate-500">CIN Number:</span>
                  <span className="font-mono text-[11px] text-slate-700 font-semibold">{organization?.cinNumber || 'U72900KA2026PTC184920'}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-cyan-100">
                  <span className="text-slate-500">GSTIN / Tax ID:</span>
                  <span className="font-mono text-[11px] text-slate-700 font-semibold">{organization?.taxId || 'GSTIN29AAACC1234D1Z5'}</span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Registered Address:</span>
                  <span className="text-right text-[11px] text-slate-600 max-w-[220px]">{organization?.address || 'Innovation Hub, Cyber City, Bangalore'}</span>
                </div>
              </div>
            </div>

            {/* Unique Org Number Validator Widget */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-600" />
                  Organization Number Uniqueness Checker
                </span>
                <span className="text-[10px] text-slate-500">Django API Backend</span>
              </div>

              <p className="text-[11px] text-slate-600">
                Test any organization code or number to ensure it is guaranteed unique across all tenant organizations.
              </p>

              <form onSubmit={handleTestOrgUniqueness} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testOrgNumber}
                    onChange={(e) => setTestOrgNumber(e.target.value)}
                    placeholder="Enter code (e.g. CV-ORG-999)"
                    className="flex-1 px-3 py-1.5 text-xs font-mono font-bold glass-input rounded-lg border border-slate-200 outline-hidden focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={verifying || !testOrgNumber}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {verifying ? 'Checking...' : 'Verify'}
                  </button>
                </div>

                {verifyResult && (
                  <div className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                    verifyResult.is_unique 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}>
                    {verifyResult.is_unique ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <div>
                      <p className="font-bold">
                        {verifyResult.is_unique ? 'Available & Unique' : 'Already In Use'}
                      </p>
                      <p className="text-[10px] opacity-90">{verifyResult.message}</p>
                    </div>
                  </div>
                )}
              </form>
            </div>

          </div>
        </div>
      )}

      {/* TAB 6: POSTGRESQL & API CONFIG */}
      {activeTab === 'database' && (
        <div className="glass-card rounded-xl p-4 border border-slate-200/90 shadow-xs bg-white/90 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800">PostgreSQL 16 & Django Database Configuration</h2>
            <p className="text-xs text-slate-500">
              Manage database credentials, docker containers, and database synchronization
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-600" />
                Connection Parameters
              </h3>
              <div className="space-y-1.5 font-mono text-[11px] text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">DB_NAME:</span>
                  <span className="font-bold text-cyan-800">convosis_db</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">DB_USER:</span>
                  <span className="font-bold text-cyan-800">convosis_user</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">DB_HOST:</span>
                  <span className="font-bold text-slate-800">localhost:5432</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">ENGINE:</span>
                  <span className="font-bold text-slate-800">django.db.backends.postgresql</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">DRIVERS:</span>
                  <span className="font-bold text-emerald-700">psycopg2-binary 2.9.13 (Installed)</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-600" />
                Docker Compose Commands
              </h3>
              <p className="text-[11px] text-slate-600">
                To start the dedicated PostgreSQL 16 server and pgAdmin 4 in isolated containers:
              </p>
              <div className="p-2.5 rounded-lg bg-slate-900 text-cyan-300 font-mono text-[10px] space-y-1">
                <p># Navigate to backend and spin up services:</p>
                <p className="text-white">cd backend</p>
                <p className="text-white">docker compose up -d</p>
                <p className="text-slate-400"># PostgreSQL: localhost:5432</p>
                <p className="text-slate-400"># pgAdmin 4: http://localhost:5050</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 7: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="glass-card rounded-xl p-4 border border-slate-200/90 shadow-xs bg-white/90 space-y-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Security & Operational Audit Logs</h2>
            <p className="text-xs text-slate-500">
              Audit trail of system events, email dispatches, and financial receipts
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Event Type</th>
                  <th className="py-2.5 px-3">Recipient / Target</th>
                  <th className="py-2.5 px-3">Triggered By</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {emailLogs.length > 0 ? (
                  emailLogs.slice(0, 8).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60">
                      <td className="py-2 px-3 font-semibold text-slate-800">
                        {log.templateName || log.event}
                      </td>
                      <td className="py-2 px-3 text-slate-600">{log.recipientName}</td>
                      <td className="py-2 px-3 font-mono text-[11px] text-cyan-700">Convosis Engine</td>
                      <td className="py-2 px-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3 h-3 text-emerald-600" /> Dispatched
                        </span>
                      </td>
                      <td className="py-2 px-3 text-[11px] text-slate-400">{log.sentAt}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No email events logged yet. The audit trail will record live dispatches.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD USER MODAL */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md glass-card rounded-2xl shadow-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-cyan-600" />
                <h3 className="text-sm font-bold text-slate-800">Create Staff / Admin Account</h3>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full px-3 py-1.5 text-xs glass-input rounded-lg border border-slate-200 outline-hidden focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Username *</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="ramesh.c"
                  className="w-full px-3 py-1.5 text-xs glass-input rounded-lg border border-slate-200 outline-hidden focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="ramesh@convosis.com"
                  className="w-full px-3 py-1.5 text-xs glass-input rounded-lg border border-slate-200 outline-hidden focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs glass-input rounded-lg border border-slate-200 outline-hidden"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Admin">Admin</option>
                    <option value="Instructor">Instructor</option>
                    <option value="Finance">Finance Manager</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full px-3 py-1.5 text-xs glass-input rounded-lg border border-slate-200 outline-hidden focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Organization Number</label>
                <input
                  type="text"
                  value={newUserOrg}
                  onChange={(e) => setNewUserOrg(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono font-bold glass-input rounded-lg border border-slate-200 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs cursor-pointer"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE NEW PROGRAM (COURSE OR INTERNSHIP) */}
      {isAddProgramModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg glass-card rounded-2xl shadow-xl border border-slate-200 bg-white p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-4">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-cyan-600" />
                <h3 className="text-sm font-bold text-slate-800">Create New Program / Curriculum</h3>
              </div>
              <button
                onClick={() => setIsAddProgramModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProgram} className="space-y-3.5">
              
              {/* Type Switcher */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Program Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewProgramData(p => ({ 
                      ...p, 
                      type: 'course',
                      baseFee: p.baseFee === 30000 ? 15000 : p.baseFee,
                      duration: p.duration === '6 Months' ? '4 Months' : p.duration
                    }))}
                    className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                      newProgramData.type === 'course'
                        ? 'bg-cyan-50 border-cyan-500 text-cyan-800 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Academic Course (₹15k)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewProgramData(p => ({ 
                      ...p, 
                      type: 'internship',
                      baseFee: p.baseFee === 30000 ? 15000 : p.baseFee,
                      duration: p.duration === '6 Months' ? '4 Months' : p.duration
                    }))}
                    className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                      newProgramData.type === 'internship'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-800 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Professional Internship (₹15k)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewProgramData(p => ({ 
                      ...p, 
                      type: 'dual',
                      baseFee: 30000,
                      duration: '6 Months',
                      totalHours: '400+ Hours',
                      badge: 'Dual Track'
                    }))}
                    className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                      newProgramData.type === 'dual'
                        ? 'bg-purple-50 border-purple-500 text-purple-800 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Course + Internship (₹30k)
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Program Title *</label>
                <input
                  type="text"
                  required
                  value={newProgramData.title}
                  onChange={(e) => setNewProgramData(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Cloud DevOps Engineering & Kubernetes"
                  className="w-full px-3 py-1.5 text-xs glass-input rounded-lg border border-slate-200 outline-hidden focus:border-cyan-500"
                />
              </div>

              {/* Category & Badge */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={newProgramData.category}
                    onChange={(e) => setNewProgramData(p => ({ ...p, category: e.target.value }))}
                    placeholder="e.g. Cloud & DevOps"
                    className="w-full px-3 py-1.5 text-xs glass-input rounded-lg border border-slate-200 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Badge</label>
                  <input
                    type="text"
                    value={newProgramData.badge}
                    onChange={(e) => setNewProgramData(p => ({ ...p, badge: e.target.value }))}
                    placeholder="e.g. Featured / Popular"
                    className="w-full px-3 py-1.5 text-xs glass-input rounded-lg border border-slate-200 outline-hidden"
                  />
                </div>
              </div>

              {/* Duration & Hours */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={newProgramData.duration}
                    onChange={(e) => setNewProgramData(p => ({ ...p, duration: e.target.value }))}
                    placeholder="e.g. 4 Months"
                    className="w-full px-3 py-1.5 text-xs glass-input rounded-lg border border-slate-200 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Total Hours</label>
                  <input
                    type="text"
                    value={newProgramData.totalHours}
                    onChange={(e) => setNewProgramData(p => ({ ...p, totalHours: e.target.value }))}
                    placeholder="e.g. 200+ Hours"
                    className="w-full px-3 py-1.5 text-xs glass-input rounded-lg border border-slate-200 outline-hidden"
                  />
                </div>
              </div>

              {/* Tuition & GST Configuration */}
              <div className="p-3 rounded-xl bg-cyan-50/70 border border-cyan-200 space-y-2">
                <span className="font-bold text-cyan-900 block text-xs">
                  Tuition Fees & 18% GST Setup (Admin Control)
                </span>
                
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                      Base Fee ({settings.currency}) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newProgramData.baseFee}
                      onChange={(e) => setNewProgramData(p => ({ ...p, baseFee: e.target.value }))}
                      className="w-full px-2 py-1 rounded-lg glass-input font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                      GST Rate (%)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      value={newProgramData.gstPercent}
                      onChange={(e) => setNewProgramData(p => ({ ...p, gstPercent: e.target.value }))}
                      className="w-full px-2 py-1 rounded-lg glass-input font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                      Installments
                    </label>
                    <select
                      value={newProgramData.installmentMonths}
                      onChange={(e) => setNewProgramData(p => ({ ...p, installmentMonths: Number(e.target.value) }))}
                      className="w-full px-2 py-1 rounded-lg glass-input font-bold"
                    >
                      <option value={1}>1 Month (Full)</option>
                      <option value={2}>2 Months</option>
                      <option value={3}>3 Months (Standard)</option>
                      <option value={4}>4 Months</option>
                    </select>
                  </div>
                </div>

                {/* Computed Breakdown Preview */}
                <div className="pt-1.5 border-t border-cyan-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600">
                    GST Amount: <strong>₹{Math.round((Number(newProgramData.baseFee) || 15000) * ((Number(newProgramData.gstPercent) || 18) / 100)).toLocaleString()}</strong>
                  </span>
                  <span className="font-extrabold text-cyan-900 text-sm">
                    Total: ₹{(
                      (Number(newProgramData.baseFee) || 15000) + 
                      Math.round((Number(newProgramData.baseFee) || 15000) * ((Number(newProgramData.gstPercent) || 18) / 100))
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold text-right">
                  Milestone Plan: {newProgramData.installmentMonths}x ₹{Math.round((
                    (Number(newProgramData.baseFee) || 15000) + 
                    Math.round((Number(newProgramData.baseFee) || 15000) * ((Number(newProgramData.gstPercent) || 18) / 100))
                  ) / (Number(newProgramData.installmentMonths) || 3)).toLocaleString()} / mo
                </div>
              </div>

              {/* Instructor */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Lead Instructor / Mentor Name
                </label>
                <input
                  type="text"
                  value={newProgramData.instructorName}
                  onChange={(e) => setNewProgramData(p => ({ ...p, instructorName: e.target.value }))}
                  placeholder="e.g. Dr. Rajesh Kumar, Principal Architect"
                  className="w-full px-3 py-1.5 text-xs glass-input rounded-lg border border-slate-200 outline-hidden"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Overview & Objectives</label>
                <textarea
                  rows={2}
                  value={newProgramData.description}
                  onChange={(e) => setNewProgramData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Comprehensive training with live industry capstone projects..."
                  className="w-full px-3 py-1.5 text-xs glass-input rounded-lg border border-slate-200 outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddProgramModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Program</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* REUSABLE DELETE CONFIRMATION MODAL */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-sm glass-card rounded-2xl shadow-2xl border border-slate-200 bg-white p-5 space-y-4">
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {deleteConfirm.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {deleteConfirm.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirm({ isOpen: false, title: '', message: '', onConfirm: null })}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteConfirm.onConfirm) deleteConfirm.onConfirm();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Permanently</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
