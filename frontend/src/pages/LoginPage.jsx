import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Home, Lock, Mail, AlertCircle, Sparkles, User, ShieldCheck, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      // Redirect based on role or original redirect
      if (redirect && redirect !== '/') {
        navigate(redirect);
      } else if (res.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (res.user.role === 'agent') {
        navigate('/agent/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Quick Demo Login Helper
  const handleQuickDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
              <Home className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">
              Saapade<span className="text-emerald-600">Lodge</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign In to Your Account
          </h2>
          <p className="text-xs text-slate-500">
            Access your saved favorites, property dashboard, or inquiry inbox.
          </p>
        </div>

        {/* Demo Accounts Quick-Fill Box */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>1-Click Demo Accounts (Academic Review)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('student@student.gaposa.edu.ng', 'Student123!')}
              className="px-2.5 py-2 rounded-xl bg-white border border-emerald-200 hover:border-emerald-600 text-[11px] font-semibold text-slate-800 flex flex-col items-center gap-1 shadow-xs transition"
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('adebayo@gatewayrealty.ng', 'Agent123!')}
              className="px-2.5 py-2 rounded-xl bg-white border border-emerald-200 hover:border-emerald-600 text-[11px] font-semibold text-slate-800 flex flex-col items-center gap-1 shadow-xs transition"
            >
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <span>Agent</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('admin@saapadeaccommodation.ng', 'Admin123!')}
              className="px-2.5 py-2 rounded-xl bg-white border border-emerald-200 hover:border-emerald-600 text-[11px] font-semibold text-slate-800 flex flex-col items-center gap-1 shadow-xs transition"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gaposa.edu.ng"
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Registration Links */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center space-y-2 text-xs text-slate-500">
            <p>
              Don't have an account yet?{' '}
              <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-700">
                Student Sign Up
              </Link>
            </p>
            <p>
              Property Owner or Manager?{' '}
              <Link to="/agent-register" className="font-bold text-emerald-600 hover:text-emerald-700">
                Register as an Agent
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
