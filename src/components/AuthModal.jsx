import React, { useState } from 'react';
import { useAcademy } from '../context/AcademyContext';
import { ConvosisApi } from '../services/api';
import AcademyLogo from './AcademyLogo';
import { 
  User, 
  Mail, 
  Lock, 
  Building2, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  KeyRound,
  Users,
  RefreshCw,
  X
} from 'lucide-react';

export default function AuthModal() {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    authMode, 
    setAuthMode, 
    login, 
    register, 
    currentUser,
    organization
  } = useAcademy();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Admin');
  const [orgNumber, setOrgNumber] = useState(organization?.orgNumber || 'CV-ORG-2026');
  const [isNewOrg, setIsNewOrg] = useState(false);
  const [newOrgName, setNewOrgName] = useState('Convosis Technologies Private Limited');
  const [orgValidation, setOrgValidation] = useState(null); // { checking: bool, isUnique: bool, message: string }
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleVerifyOrg = async (code) => {
    if (!code) return;
    setOrgValidation({ checking: true });
    try {
      const res = await ConvosisApi.verifyOrgNumber(code);
      setOrgValidation({
        checking: false,
        isUnique: res.is_unique,
        exists: res.exists,
        message: res.message
      });
    } catch {
      setOrgValidation({ checking: false, isUnique: true, message: 'Valid format' });
    }
  };

  const generateUniqueOrgCode = () => {
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const newCode = `CV-ORG-${randomHex}`;
    setOrgNumber(newCode);
    handleVerifyOrg(newCode);
  };

  const handleSignIn = async (e) => {
    e?.preventDefault();
    if (!username || !password) {
      setErrorMsg('Please enter both username and password.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      await login(username, password, orgNumber);
      setIsAuthModalOpen(false);
      setUsername('');
      setPassword('');
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e?.preventDefault();
    if (!username || !password || !email) {
      setErrorMsg('Please fill in all required fields (username, email, password).');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      await register({
        username,
        email,
        password,
        full_name: fullName || username,
        role,
        org_number: orgNumber,
        org_name: newOrgName
      });
      setIsAuthModalOpen(false);
      setUsername('');
      setPassword('');
      setEmail('');
      setFullName('');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div 
        className="relative w-full max-w-md glass-card rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden p-6 sm:p-7 bg-white/95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Branding & Logo */}
        <div className="flex flex-col items-center text-center mb-4">
          <AcademyLogo />
          <div className="mt-1 flex items-center gap-1.5 text-[11px] font-mono text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
            <Building2 className="w-3 h-3 text-cyan-600" />
            <span>Org: {organization?.orgNumber || 'CV-ORG-2026'}</span>
          </div>
        </div>

        {/* Mode Switcher Pills (Sign In vs Sign Up) */}
        <div className="flex p-1 bg-slate-100/90 rounded-xl mb-4 border border-slate-200/70">
          <button
            type="button"
            onClick={() => { setAuthMode('signin'); setErrorMsg(''); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              authMode === 'signin'
                ? 'bg-white text-cyan-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In (Multiple Users)
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('signup'); setErrorMsg(''); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              authMode === 'signup'
                ? 'bg-white text-cyan-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register User
          </button>
        </div>

        {/* Error notification banner */}
        {errorMsg && (
          <div className="mb-3.5 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* SIGN IN FORM */}
        {authMode === 'signin' ? (
          <form onSubmit={handleSignIn} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Username or Email Address
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin, jitto, or your-name"
                  className="w-full pl-8 pr-3 py-1.5 text-xs glass-input rounded-lg border border-slate-200 outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-700">
                  Password
                </label>
                <span className="text-[10px] text-cyan-600 hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-8 pr-9 py-1.5 text-xs glass-input rounded-lg border border-slate-200 outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Organization Number */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Unique Organization Number
              </label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={orgNumber}
                  onChange={(e) => setOrgNumber(e.target.value)}
                  placeholder="CV-ORG-2026"
                  className="w-full pl-8 pr-3 py-1.5 text-xs font-mono font-bold glass-input rounded-lg border border-slate-200 outline-hidden focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* SIGN UP FORM */
          <form onSubmit={handleSignUp} className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Anand Kumar"
                  className="w-full pl-8 pr-3 py-1.5 text-xs glass-input rounded-lg border border-slate-200 outline-hidden focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="anand.k"
                  className="w-full px-2.5 py-1.5 text-xs glass-input rounded-lg border border-slate-200 outline-hidden focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs glass-input rounded-lg border border-slate-200 outline-hidden"
                >
                  <option value="Admin">Admin</option>
                  <option value="Instructor">Faculty / Instructor</option>
                  <option value="Finance">Finance Officer</option>
                  <option value="Candidate">Student / Candidate</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="anand@convosis.com"
                  className="w-full pl-8 pr-3 py-1.5 text-xs glass-input rounded-lg border border-slate-200 outline-hidden focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Organization Number with Unique Validator */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="block text-[11px] font-bold text-slate-700">
                  Unique Organization Number *
                </label>
                <button
                  type="button"
                  onClick={generateUniqueOrgCode}
                  className="text-[10px] text-cyan-700 hover:text-cyan-900 flex items-center gap-1 font-semibold cursor-pointer"
                  title="Generate random unique organization code"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>Generate New</span>
                </button>
              </div>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={orgNumber}
                  onChange={(e) => {
                    const val = e.target.value;
                    setOrgNumber(val);
                    handleVerifyOrg(val);
                  }}
                  placeholder="e.g. CV-ORG-2026"
                  className="w-full pl-8 pr-20 py-1.5 text-xs font-mono font-bold glass-input rounded-lg border border-slate-200 outline-hidden focus:border-cyan-500"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-cyan-100 text-cyan-800">
                  Unique Key
                </span>
              </div>
              {orgValidation && (
                <p className={`text-[10px] mt-0.5 ${orgValidation.isUnique ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {orgValidation.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-8 pr-9 py-1.5 text-xs glass-input rounded-lg border border-slate-200 outline-hidden focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Join Organization</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
