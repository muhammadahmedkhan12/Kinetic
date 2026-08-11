import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { flashToast } = useToast();

  const [username, setUsername] = useState('admin@kineticgym.com');
  const [password, setPassword] = useState('Admin@123');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new URLSearchParams();
      formData.append('username', username.trim().toLowerCase());
      formData.append('password', password);

      const res = await apiClient.post('/auth/token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (res.data.role !== 'admin') {
        flashToast('Access denied. Account does not have staff admin privileges.', 'error');
        setIsSubmitting(false);
        return;
      }

      login(res.data.access_token, res.data);
      flashToast('Welcome to KINETIC Admin Staff Portal!');
      navigate('/admin/dashboard');
    } catch (err: any) {
      flashToast(err.response?.data?.detail || 'Invalid admin credentials.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0F172A] relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="glass-card relative w-full max-w-md rounded-3xl p-8 border border-white/10 shadow-2xl flex flex-col gap-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-dark to-primary flex items-center justify-center font-black font-display text-slate-900 text-2xl mx-auto mb-3 shadow-lg">
            K
          </div>
          <h1 className="text-2xl font-extrabold font-display text-primary">KINETIC GYM</h1>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Staff Admin Portal Login</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Admin Email or Phone</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-slate-900 font-extrabold text-sm shadow-xl hover:brightness-110 transition-all mt-2"
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In as Administrator'}
          </button>
        </form>
      </div>
    </div>
  );
};
