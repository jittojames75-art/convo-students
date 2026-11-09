import React, { useState } from 'react';
import { useAcademy } from '../context/AcademyContext';
import { ConvosisApi } from '../services/api';
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
  KeyRound,
  ShieldCheck,
  Check,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function LoginPage() {
  const { login, register, organization } = useAcademy();

  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Admin');
  const [orgNumber, setOrgNumber] = useState(organization?.orgNumber || 'CV-ORG-2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orgValidation, setOrgValidation] = useState(null);

  const handleVerifyOrg = async (code) => {
    if (!code) return;
    try {
      const res = await ConvosisApi.verifyOrgNumber(code);
      setOrgValidation({
        isUnique: res.is_unique,
        message: res.message
      });
    } catch {
      setOrgValidation({ isUnique: true, message: 'Valid format' });
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
        org_number: orgNumber
      });
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center items-center p-4 bg-slate-50/60 overflow-hidden select-none">
      
      {/* Background Minimal Light Ambient Orbs */}
      <div className="orb bg-gradient-to-tr from-cyan-200/30 to-teal-100/40 top-[-100px] left-[-100px] w-[500px] h-[500px]" />
      <div className="orb bg-gradient-to-br from-sky-200/30 to-cyan-100/45 bottom-[-100px] right-[-100px] w-[550px] h-[550px]" />
      <div className="orb bg-gradient-to-r from-blue-100/25 to-teal-100/30 top-[40%] left-[30%] w-[380px] h-[380px]" />

      <div className="w-full max-w-md relative z-10 animate-fadeIn">
        
        {/* Main Card */}
        <div className="glass-card rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden p-6 sm:p-8 bg-white/95 backdrop-blur-md">
          
          {/* Top Logo & Branding */}
          <div className="flex flex-col items-center text-center mb-6">
            <img 
              src="/assets/convosis-logo-full.png" 
              alt="CONVOSIS" 
              className="h-10 sm:h-11 w-auto object-contain mix-blend-multiply mb-1.5"
            />
            <p className="text-xs font-semibold text-slate-600">
              Convosis Technologies Private Limited
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono font-bold text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
              <Building2 className="w-3 h-3 text-cyan-600" />
              <span>Organization: {organization?.orgNumber || 'CV-ORG-2026'}</span>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex p-1 bg-slate-100/90 rounded-xl mb-5 border border-slate-200/70">
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMsg(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-cyan-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMsg(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-cyan-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-3.5">
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
                    placeholder="Enter your username or email"
                    className="w-full pl-8 pr-3 py-2 text-xs glass-input rounded-lg border border-slate-200 outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-medium"
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
                    className="w-full pl-8 pr-9 py-2 text-xs glass-input rounded-lg border border-slate-200 outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
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

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Organization Number
                </label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={orgNumber}
                    onChange={(e) => setOrgNumber(e.target.value)}
                    placeholder="Enter organization number (e.g. CV-ORG-2026)"
                    className="w-full pl-8 pr-3 py-1.5 text-xs font-mono font-bold glass-input rounded-lg border border-slate-200 outline-hidden focus:border-cyan-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-2 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Convosis Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* SIGN UP FORM */
            <form onSubmit={handleSignUp} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full pl-8 pr-3 py-1.5 text-xs glass-input rounded-lg border border-slate-200 outline-hidden focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ramesh.c"
                    className="w-full px-2.5 py-1.5 text-xs glass-input rounded-lg border border-slate-200 outline-hidden focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs glass-input rounded-lg border border-slate-200 outline-hidden"
                  >
                    <option value="Admin">Administrator</option>
                    <option value="Instructor">Instructor / Faculty</option>
                    <option value="Finance">Finance Manager</option>
                    <option value="Candidate">Candidate / Intern</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ramesh@convosis.com"
                    className="w-full pl-8 pr-3 py-1.5 text-xs glass-input rounded-lg border border-slate-200 outline-hidden focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Unique Organization Number */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Unique Organization Number *
                  </label>
                  <button
                    type="button"
                    onClick={generateUniqueOrgCode}
                    className="text-[10px] text-cyan-700 hover:text-cyan-900 flex items-center gap-1 font-semibold cursor-pointer"
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
                    placeholder="CV-ORG-2026"
                    className="w-full pl-8 pr-3 py-1.5 text-xs font-mono font-bold glass-input rounded-lg border border-slate-200 outline-hidden focus:border-cyan-500"
                  />
                </div>
                {orgValidation && (
                  <p className={`text-[10px] mt-0.5 ${orgValidation.isUnique ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {orgValidation.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
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
                    <span>Create Account & Enter Portal</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-400 mt-4">
          &copy; {new Date().getFullYear()} Convosis Technologies Private Limited • Minimal Light Edition
        </p>

      </div>
    </div>
  );
}

