import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Lock, Mail, ArrowRight, Stethoscope } from 'lucide-react';
import axios from 'axios';
import type { AuthUser } from '../../types';
import { BASE_URL } from '../../utils/Routes';

interface Props {
  onLoginSuccess: (user: AuthUser, token: string) => void;
  theme: 'dark' | 'light';
}

export function AdminLoginPage({ onLoginSuccess, theme }: Props) {
  const [roleMode, setRoleMode] = useState<'super_admin' | 'doctor'>('super_admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isDark = theme === 'dark';

  const handleQuickPreset = (preset: 'super' | 'doctor') => {
    setErrorMsg('');
    if (preset === 'super') {
      setRoleMode('super_admin');
      setEmail('admin@amrutam.com');
      setPassword('admin123');
    } else {
      setRoleMode('doctor');
      setEmail('dr.rajesh1@amrutam.com');
      setPassword('Doctor@123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both Email and Password');
      return;
    }

    setLoading(true);

    try {
      if (roleMode === 'super_admin') {
        if (email.toLowerCase().trim() === 'admin@amrutam.com' && password === 'admin123') {
          const adminUser: AuthUser = {
            id: 'admin_super_1',
            name: 'Super Admin',
            email: 'admin@amrutam.com',
            role: 'super_admin',
          };
          onLoginSuccess(adminUser, 'super_admin_jwt_token_amrutam');
        } else {
          setErrorMsg('Invalid Super Admin email or password. (Default: admin@amrutam.com / admin123)');
        }
      } else {
        const res = await axios.post(`${BASE_URL}/auth/doctor-login`, {
          email: email.toLowerCase().trim(),
          password,
        });

        if (res.data?.success) {
          const { doctor, token } = res.data.data;
          const doctorUser: AuthUser = {
            id: doctor.id,
            name: doctor.name,
            email: doctor.email,
            role: 'doctor',
            specialty: doctor.specialty,
            degree: doctor.degree,
            hospital: doctor.hospital,
            consultationFee: doctor.consultationFee,
            availableSlots: doctor.availableSlots,
          };
          onLoginSuccess(doctorUser, token);
        } else {
          setErrorMsg(res.data?.error || 'Doctor authentication failed');
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to authenticate. Please check backend server.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl transition-all duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mx-auto flex items-center justify-center mb-4">
            <Stethoscope className="w-9 h-9 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Amrutam Portal Login</h1>
          <p className={`text-xs mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Select role and log in to manage consultations & store
          </p>
        </div>

        {/* Role Mode Selector Tabs */}
        <div className={`flex p-1 rounded-2xl mb-6 ${isDark ? 'bg-slate-950 border border-slate-800' : 'bg-slate-100 border border-slate-200'}`}>
          <button
            type="button"
            onClick={() => {
              setRoleMode('super_admin');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
              roleMode === 'super_admin'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}>
            <ShieldCheck className="w-4 h-4" />
            Super Admin
          </button>

          <button
            type="button"
            onClick={() => {
              setRoleMode('doctor');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
              roleMode === 'doctor'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}>
            <UserCheck className="w-4 h-4" />
            Doctor Portal
          </button>
        </div>

        {/* Quick Demo Credentials Helpers */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => handleQuickPreset('super')}
            className={`flex-1 py-2 px-3 rounded-xl border text-[11px] font-semibold transition-all ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}>
            🔑 Admin Credentials
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset('doctor')}
            className={`flex-1 py-2 px-3 rounded-xl border text-[11px] font-semibold transition-all ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}>
            🩺 Dr. Rajesh Login
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 mb-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-xs font-extrabold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {roleMode === 'super_admin' ? 'Super Admin Email' : 'Doctor Email ID'}
            </label>
            <div className={`flex items-center px-4 py-3 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <Mail className="w-4 h-4 text-slate-400 mr-3" />
              <input
                type="email"
                placeholder={roleMode === 'super_admin' ? 'admin@amrutam.com' : 'dr.rajesh1@amrutam.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-transparent text-xs font-bold focus:outline-none ${isDark ? 'text-slate-100' : 'text-slate-900'}`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-extrabold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Password
            </label>
            <div className={`flex items-center px-4 py-3 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <Lock className="w-4 h-4 text-slate-400 mr-3" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-transparent text-xs font-bold focus:outline-none ${isDark ? 'text-slate-100' : 'text-slate-900'}`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2">
            {loading ? (
              <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
            ) : (
              <>
                Login to Portal <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
