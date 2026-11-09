import React, { useState, useEffect, useRef } from 'react';
import { useAcademy } from '../context/AcademyContext';
import AcademyLogo from './AcademyLogo';
import { ConvosisApi } from '../services/api';
import { 
  Search, 
  UserPlus, 
  CreditCard, 
  AlertTriangle,
  SlidersHorizontal,
  Database,
  Building2,
  Copy,
  Check,
  User,
  ShieldCheck,
  LogIn,
  LogOut,
  ChevronDown,
  UserCheck,
  PlusCircle,
  Users
} from 'lucide-react';

export default function Header() {
  const { 
    searchTerm, 
    setSearchTerm, 
    setIsAdmissionModalOpen, 
    setActiveTab, 
    students,
    settings,
    setSettings,
    addToast,
    organization,
    currentUser,
    activeSessions,
    switchAccount,
    logoutAccount,
    logoutAll,
    setIsAuthModalOpen,
    setAuthMode
  } = useAcademy();

  const [apiConnected, setApiConnected] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [copiedOrg, setCopiedOrg] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    ConvosisApi.checkHealth().then((res) => {
      setApiConnected(res.connected);
    });
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const copyOrgNumber = (e) => {
    e?.stopPropagation();
    const code = organization?.orgNumber || 'CV-ORG-2026';
    navigator.clipboard?.writeText(code);
    setCopiedOrg(true);
    addToast(`Organization number copied: ${code}`, 'success');
    setTimeout(() => setCopiedOrg(false), 2000);
  };

  // Alerts
  const overdueCount = students.filter(
    (s) => s.paymentMode === 'installment' && s.installments.some((i) => i.status === 'overdue')
  ).length;

  const lowAttendanceCount = students.filter((s) => s.attendanceStats.percentage < 75).length;
  const totalAlerts = overdueCount + lowAttendanceCount;

  // Strict RBAC: Only Super Admin or Admin can access Admin Panel
  const isAdminOrSuperAdmin = 
    currentUser?.role === 'Super Admin' || 
    currentUser?.role === 'Admin' || 
    currentUser?.is_superuser === true ||
    (currentUser?.role && currentUser.role.toLowerCase().includes('admin'));

  return (
    <header className="sticky top-0 z-40 glass-header border-b border-slate-200/80 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-13 sm:h-14 gap-2 sm:gap-4">
          
          {/* Left: Window Controls + Convosis Logo */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5 pr-2.5 border-r border-slate-200/80 select-none">
              <span className="window-dot window-dot-red" title="Close" />
              <span className="window-dot window-dot-yellow" title="Minimize" />
              <span className="window-dot window-dot-green" title="Expand" />
            </div>

            <AcademyLogo />

            {/* Unique Organization Number Badge */}
            <div 
              onClick={copyOrgNumber}
              className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-50/90 text-cyan-800 border border-cyan-200/90 cursor-pointer hover:bg-cyan-100/90 transition-all shadow-2xs select-none"
              title="Click to copy unique Organization Number"
            >
              <Building2 className="w-3 h-3 text-cyan-600" />
              <span>{organization?.orgNumber || 'CV-ORG-2026'}</span>
              {copiedOrg ? (
                <Check className="w-2.5 h-2.5 text-emerald-600" />
              ) : (
                <Copy className="w-2.5 h-2.5 text-slate-400 opacity-70" />
              )}
            </div>
          </div>

          {/* Center: Search input */}
          <div className="hidden md:flex items-center flex-1 max-w-sm mx-2">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-45 pointer-events-none" />
              <input
                type="text"
                placeholder="Search candidates, courses, receipts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs glass-input outline-hidden font-normal"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs opacity-50 hover:opacity-100"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            
            {/* Django REST API status pill */}
            <div 
              className={`hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-semibold border ${
                apiConnected 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}
              title={apiConnected ? "Django REST + PostgreSQL backend connected (127.0.0.1:8000)" : "Local storage active"}
            >
              <Database className="w-3 h-3 text-cyan-600" />
              <span className={`w-1.5 h-1.5 rounded-full ${apiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span>{apiConnected ? 'API Online' : 'Local'}</span>
            </div>

            {/* New Admission */}
            <button
              onClick={() => setIsAdmissionModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Admission</span>
              <span className="sm:hidden">Enroll</span>
            </button>

            {/* Collect Fee Shortcut */}
            <button
              onClick={() => setActiveTab('fees')}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold glass-card glass-card-hover border transition-all cursor-pointer text-slate-700"
              title="Collect Fee / Installments"
            >
              <CreditCard className="w-3.5 h-3.5 text-cyan-600" />
              <span>Collect Fee</span>
            </button>

            {/* Overdue/Alerts pill */}
            {totalAlerts > 0 && (
              <button
                onClick={() => setActiveTab(overdueCount > 0 ? 'fees' : 'attendance')}
                className="relative flex items-center justify-center p-1.5 rounded-lg glass-card border border-rose-300 text-rose-600 transition-all cursor-pointer"
                title={`${overdueCount} Overdue, ${lowAttendanceCount} Attendance Warnings`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-600 text-[8px] font-bold text-white">
                  {totalAlerts}
                </span>
              </button>
            )}

            {/* Quick Currency Switcher */}
            <div className="flex items-center">
              <select
                value={settings.currency}
                onChange={(e) => {
                  const symbol = e.target.value;
                  const codeMap = { '₹': 'INR', '$': 'USD', '€': 'EUR', '£': 'GBP', 'AED': 'AED' };
                  setSettings(prev => ({ ...prev, currency: symbol, currencyCode: codeMap[symbol] || 'INR' }));
                  addToast(`Active currency: ${symbol} (${codeMap[symbol]})`, 'info');
                }}
                className="px-2 py-1 rounded-lg text-xs font-bold glass-input cursor-pointer text-slate-800 outline-hidden border border-slate-200"
                title="Change Currency"
              >
                <option value="₹">₹ INR</option>
                <option value="$">$ USD</option>
                <option value="€">€ EUR</option>
                <option value="£">£ GBP</option>
                <option value="AED">AED</option>
              </select>
            </div>

            {/* MULTI-USER PROFILE BUTTON WITH DROPDOWN */}
            <div className="relative" ref={dropdownRef}>
              {currentUser ? (
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-lg glass-card glass-card-hover border border-slate-200/90 text-left cursor-pointer transition-all"
                  title="Multi-User Account Switcher"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-600 to-sky-500 text-white font-bold flex items-center justify-center text-[11px] shadow-2xs">
                    {currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden md:block leading-tight pr-1">
                    <p className="text-[11px] font-bold text-slate-800 line-clamp-1">
                      {currentUser.fullName || currentUser.username}
                    </p>
                    <p className="text-[9px] text-cyan-700 font-semibold flex items-center gap-1">
                      <span>{currentUser.role || 'Staff'}</span>
                      {activeSessions?.length > 1 && (
                        <span className="bg-cyan-100 text-cyan-800 px-1 rounded-full text-[8px] font-bold">
                          +{activeSessions.length - 1}
                        </span>
                      )}
                    </p>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setAuthMode('signin'); setIsAuthModalOpen(true); }}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white transition-all cursor-pointer flex items-center gap-1"
                  >
                    <LogIn className="w-3 h-3" />
                    <span>Sign In</span>
                  </button>
                  <button
                    onClick={() => { setAuthMode('signup'); setIsAuthModalOpen(true); }}
                    className="hidden sm:inline-flex px-2 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* Multi-User Dropdown Menu */}
              {profileDropdownOpen && currentUser && (
                <div className="absolute right-0 mt-1.5 w-64 glass-card rounded-xl shadow-xl border border-slate-200/90 py-2 z-50 bg-white/95 backdrop-blur-md animate-fadeIn text-xs">
                  
                  {/* Current Active Account Header */}
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Session</p>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{currentUser.fullName || currentUser.username}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email || `${currentUser.username}@convosis.com`}</p>
                    
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-cyan-100 text-cyan-800">
                        {currentUser.role || 'Super Admin'}
                      </span>
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        {organization?.orgNumber || 'CV-ORG-2026'}
                      </span>
                    </div>
                  </div>

                  {/* MULTIPLE LOGIN USERS - FAST ACCOUNT SWITCHER */}
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <Users className="w-3 h-3 text-cyan-600" /> Switch Logged-in User:
                      </span>
                      <span className="text-[10px] font-bold text-cyan-700">
                        {activeSessions?.length || 1} Active
                      </span>
                    </div>

                    <div className="space-y-1 max-h-36 overflow-y-auto scrollbar-none">
                      {activeSessions?.map((session) => {
                        const isActive = session.username === currentUser.username;
                        return (
                          <div 
                            key={session.id || session.username}
                            onClick={() => { switchAccount(session.id || session.username); }}
                            className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-all ${
                              isActive 
                                ? 'bg-cyan-50 border border-cyan-200' 
                                : 'hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white ${
                                isActive ? 'bg-cyan-600' : 'bg-slate-400'
                              }`}>
                                {session.username?.charAt(0).toUpperCase()}
                              </div>
                              <div className="leading-tight">
                                <p className={`text-[11px] font-semibold ${isActive ? 'text-cyan-900 font-bold' : 'text-slate-800'}`}>
                                  {session.fullName || session.username}
                                </p>
                                <p className="text-[9px] text-slate-400">{session.role}</p>
                              </div>
                            </div>

                            {isActive ? (
                              <Check className="w-3.5 h-3.5 text-cyan-600" />
                            ) : (
                              <button
                                onClick={(e) => { e.stopPropagation(); logoutAccount(session.id || session.username); }}
                                className="text-slate-400 hover:text-rose-500 p-0.5 text-[10px]"
                                title="Sign out this account"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Add Another Account */}
                    <button
                      onClick={() => { setAuthMode('signin'); setIsAuthModalOpen(true); setProfileDropdownOpen(false); }}
                      className="w-full mt-2 py-1.5 px-2 rounded-lg border border-dashed border-slate-300 hover:border-cyan-400 text-cyan-700 hover:bg-cyan-50/50 flex items-center justify-center gap-1.5 text-[11px] font-semibold transition-all cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add Another Account</span>
                    </button>
                  </div>

                  {/* Navigation Links */}
                  <div className="py-1">
                    {isAdminOrSuperAdmin && (
                      <button
                        onClick={() => { setActiveTab('admin_panel'); setProfileDropdownOpen(false); }}
                        className="w-full px-3.5 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 text-left cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
                        <span className="font-semibold">Admin Control Center</span>
                      </button>
                    )}

                    <button
                      onClick={() => { setActiveTab('settings'); setProfileDropdownOpen(false); }}
                      className="w-full px-3.5 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 text-left cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                      <span>Organization Settings</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 my-1" />

                  {/* Sign Out Options */}
                  <div className="px-2 pt-0.5 space-y-1">
                    <button
                      onClick={() => { logoutAccount(currentUser?.id || currentUser?.username); setProfileDropdownOpen(false); }}
                      className="w-full px-2.5 py-1 rounded-md flex items-center gap-2 text-rose-600 hover:bg-rose-50 text-left cursor-pointer font-medium text-[11px]"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out Current Account</span>
                    </button>

                    {activeSessions?.length > 1 && (
                      <button
                        onClick={() => { logoutAll(); setProfileDropdownOpen(false); }}
                        className="w-full px-2.5 py-1 rounded-md flex items-center gap-2 text-slate-500 hover:text-rose-700 hover:bg-rose-50/50 text-left cursor-pointer text-[10px]"
                      >
                        <LogOut className="w-3 h-3 text-slate-400" />
                        <span>Sign Out All {activeSessions.length} Accounts</span>
                      </button>
                    )}
                  </div>

                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
