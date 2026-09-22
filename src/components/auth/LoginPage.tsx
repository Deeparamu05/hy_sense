import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Eye, EyeOff, Lock, Mail, Activity, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, error: authError } = useAuth();
  const [email, setEmail] = useState('manager@hysense.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim()) {
      setLocalError('Manager email address is required.');
      return;
    }
    if (!password.trim()) {
      setLocalError('Password is required.');
      return;
    }

    setIsSubmitting(true);
    const success = await login(email.trim(), password.trim());
    setIsSubmitting(false);

    if (!success) {
      // Error handled by AuthContext or set here
    }
  };

  const fillDemoCreds = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('admin123');
    setLocalError(null);
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Subtle Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-200/40 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-sky-200/40 blur-3xl rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-7 h-7 text-amber-600" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-wider text-slate-900 font-mono uppercase">
              HY<span className="text-amber-600">SENSE</span>
            </h1>
          </div>
        </div>
        <p className="text-center text-xs tracking-widest text-slate-500 font-mono uppercase font-bold">
          H₂S Safety Monitoring System
        </p>
        <h2 className="mt-6 text-center text-xl font-bold text-slate-800">
          Manager Login
        </h2>
        <p className="mt-1 text-center text-sm text-slate-500">
          Authorized Safety Officers & Industrial Managers Only
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl border border-slate-200 rounded-3xl sm:px-10">
          {displayError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-sm text-red-800 font-medium">{displayError}</div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Manager Email
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@hysense.com"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-sm transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-sm transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-amber-600 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 animate-spin" />
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Manager Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-600 font-medium mb-3 flex items-center justify-between">
              <span>Quick-Start Demo Accounts:</span>
              <span className="text-amber-800 text-[10px] uppercase tracking-wider font-mono font-bold bg-amber-100 px-2 py-0.5 rounded">Pre-configured</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoCreds('manager@hysense.com')}
                className="text-left p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 text-xs transition-all text-slate-700 hover:text-amber-700 cursor-pointer"
              >
                <div className="font-semibold truncate">Chief Safety Officer</div>
                <div className="text-[11px] text-slate-500 truncate">manager@hysense.com</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemoCreds('plant.lead@hysense.io')}
                className="text-left p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 text-xs transition-all text-slate-700 hover:text-amber-700 cursor-pointer"
              >
                <div className="font-semibold truncate">Plant Manager</div>
                <div className="text-[11px] text-slate-500 truncate">plant.lead@hysense.io</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
