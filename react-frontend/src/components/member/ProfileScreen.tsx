import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { Modal } from '../common/Modal';
import { apiClient } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

interface ProfileScreenProps {
  user: User | null;
  onRefresh: () => void;
  onOpenOnboarding: () => void;
}

const parseGoals = (goalsInput: any): string[] => {
  if (!goalsInput) return [];
  if (Array.isArray(goalsInput)) return goalsInput;
  if (typeof goalsInput === 'string') {
    try {
      const parsed = JSON.parse(goalsInput);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [goalsInput];
    }
  }
  return [];
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onRefresh, onOpenOnboarding }) => {
  const { flashToast } = useToast();
  const { logout } = useAuth();

  // Modals state
  const [isEditPersonalOpen, setIsEditPersonalOpen] = useState(false);
  const [isHeightBmiOpen, setIsHeightBmiOpen] = useState(false);
  const [isGoalsOpen, setIsGoalsOpen] = useState(false);
  const [isChangePwOpen, setIsChangePwOpen] = useState(false);

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [age, setAge] = useState<number>(user?.age || 25);
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [height, setHeight] = useState(user?.height || 175);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(parseGoals(user?.goals));

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');

  // Sync state when user prop updates
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAge(user.age || 25);
      setGender(user.gender || 'Male');
      setHeight(user.height || 175);
      setSelectedGoals(parseGoals(user.goals));
    }
  }, [user]);

  if (!user) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center text-on-surface-variant text-xs">
        Loading member profile...
      </div>
    );
  }

  const userGoals = parseGoals(user.goals);

  // BMI Evaluation
  const heightM = (user.height || 175) / 100.0;
  const bmiScore = user.height ? (75 / (heightM * heightM)).toFixed(1) : '22.5';

  const getBmiBadge = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
    if (bmi < 25.0) return { label: 'Normal weight', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    if (bmi < 30.0) return { label: 'Overweight', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    return { label: 'Obese', color: 'bg-red-500/10 text-red-400 border-red-500/30' };
  };

  const bmiBadge = getBmiBadge(parseFloat(bmiScore));

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.patch('/members/me', { name, phone, age: Number(age), gender });
      flashToast('Personal details updated!');
      setIsEditPersonalOpen(false);
      onRefresh();
    } catch (err: any) {
      flashToast(err.response?.data?.detail || 'Update failed.', 'error');
    }
  };

  const handleSaveHeight = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.patch('/members/me', { height: Number(height) });
      flashToast('Height & BMI metric updated!');
      setIsHeightBmiOpen(false);
      onRefresh();
    } catch (err: any) {
      flashToast(err.response?.data?.detail || 'Update failed.', 'error');
    }
  };

  const handleSaveGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.patch('/members/me', { goals: selectedGoals });
      flashToast('Fitness goals updated!');
      setIsGoalsOpen(false);
      onRefresh();
    } catch (err: any) {
      flashToast(err.response?.data?.detail || 'Update failed.', 'error');
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/members/me/change-password', {
        current_password: currentPw,
        new_password: newPw,
      });
      flashToast('Password updated successfully!');
      setIsChangePwOpen(false);
      setCurrentPw('');
      setNewPw('');
      onRefresh();
    } catch (err: any) {
      flashToast(err.response?.data?.detail || 'Password change failed.', 'error');
    }
  };

  const goalOptions = [
    'Weight Loss & Fat Burning',
    'Muscle Gain & Hypertrophy',
    'Strength & Powerlifting',
    'Endurance & Cardio',
    'Flexibility & Mobility',
    'Custom Diet & Nutrition',
  ];

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-28 w-full max-w-2xl mx-auto">
      {/* 1. Hero Header Section (Clean Avatar, No Edit Icon) */}
      <section className="flex flex-col items-center justify-center space-y-3 pt-2">
        <div className="w-28 h-28 rounded-full p-1 border-2 border-primary overflow-hidden gold-glow bg-[#121214] flex items-center justify-center">
          <span className="text-4xl font-extrabold text-primary font-headline">
            {user.name ? user.name[0].toUpperCase() : 'K'}
          </span>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-on-surface font-headline tracking-tight">{user.name}</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">{user.email}</p>
        </div>
      </section>

      {/* 2. Personal Details Bento Stat Cards */}
      <section className="space-y-2">
        <h3 className="text-[11px] font-bold text-on-surface-variant px-1 uppercase tracking-widest font-headline">
          Personal Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-headline">Age</span>
            <span className="text-2xl font-extrabold text-on-surface font-headline mt-1">{user.age || 25} yrs</span>
          </div>

          <div className="glass-card rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-headline">Gender</span>
            <span className="text-2xl font-extrabold text-on-surface font-headline mt-1">{user.gender || 'Male'}</span>
          </div>

          <div className="glass-card rounded-2xl p-4 flex flex-col space-y-1 col-span-2">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-headline">Phone Number</span>
            <span className="text-sm font-semibold text-on-surface">{user.phone || 'Not Set'}</span>
          </div>
        </div>
      </section>

      {/* 3. Body Metrics & Fitness Goals Section (Clean Modal Triggers) */}
      <section className="space-y-2">
        <h3 className="text-[11px] font-bold text-on-surface-variant px-1 uppercase tracking-widest font-headline">
          Body Metrics & Fitness Goals
        </h3>
        <div className="glass-card rounded-2xl overflow-hidden divide-y divide-white/5">
          <button
            type="button"
            onClick={() => setIsHeightBmiOpen(true)}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 active:bg-white/10 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <span className="material-symbols-outlined text-primary">straighten</span>
              <span className="text-sm font-medium text-on-surface font-headline">Height & BMI Index</span>
            </div>
            <span className="material-symbols-outlined text-primary">chevron_right</span>
          </button>

          <button
            type="button"
            onClick={() => setIsGoalsOpen(true)}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 active:bg-white/10 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <span className="material-symbols-outlined text-primary">target</span>
              <span className="text-sm font-medium text-on-surface font-headline">Onboarded Fitness Goals</span>
            </div>
            <span className="material-symbols-outlined text-primary">chevron_right</span>
          </button>
        </div>
      </section>

      {/* 4. Preferences & Security Section */}
      <section className="space-y-2">
        <h3 className="text-[11px] font-bold text-on-surface-variant px-1 uppercase tracking-widest font-headline">
          Preferences & Security
        </h3>
        <div className="glass-card rounded-2xl overflow-hidden divide-y divide-white/5">
          <button
            type="button"
            onClick={() => setIsEditPersonalOpen(true)}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 active:bg-white/10 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <span className="material-symbols-outlined text-primary">manage_accounts</span>
              <span className="text-sm font-medium text-on-surface">Edit Personal Details</span>
            </div>
            <span className="material-symbols-outlined text-primary">chevron_right</span>
          </button>

          <button
            type="button"
            onClick={() => setIsChangePwOpen(true)}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 active:bg-white/10 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <span className="material-symbols-outlined text-primary">lock</span>
              <span className="text-sm font-medium text-on-surface font-headline">Change Account Password</span>
            </div>
            <span className="material-symbols-outlined text-primary">chevron_right</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 active:bg-white/10 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <span className="material-symbols-outlined text-red-400">logout</span>
              <span className="text-sm font-medium text-red-400 font-headline">Sign Out</span>
            </div>
          </button>
        </div>
      </section>

      {/* Modal 1: Edit Personal Details */}
      <Modal isOpen={isEditPersonalOpen} onClose={() => setIsEditPersonalOpen(false)} title="Edit Personal Information">
        <form onSubmit={handleSavePersonal} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#19191D] border border-white/10 text-on-surface text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#19191D] border border-white/10 text-on-surface text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-[#19191D] border border-white/10 text-on-surface text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#19191D] border border-white/10 text-on-surface text-sm focus:outline-none focus:border-primary"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-full bg-primary text-[#111415] font-extrabold text-sm uppercase tracking-wider shadow-lg hover:brightness-110 transition-all font-headline mt-2"
          >
            Save Personal Details
          </button>
        </form>
      </Modal>

      {/* Modal 2: Height & BMI Index View + Edit */}
      <Modal isOpen={isHeightBmiOpen} onClose={() => setIsHeightBmiOpen(false)} title="Height & BMI Index">
        <form onSubmit={handleSaveHeight} className="flex flex-col gap-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#1D2022] border border-white/5 mb-2">
            <div>
              <span className="text-xs text-on-surface-variant">Height: <strong className="text-on-surface font-headline">{user.height || 175} cm</strong></span>
              <h4 className="text-2xl font-extrabold text-primary font-headline mt-0.5">BMI Score: {bmiScore}</h4>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-headline border ${bmiBadge.color}`}>
              {bmiBadge.label}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Update Height (cm)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-[#19191D] border border-white/10 text-on-surface text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-full bg-primary text-[#111415] font-extrabold text-sm uppercase tracking-wider shadow-lg hover:brightness-110 transition-all font-headline mt-2"
          >
            Save Height & Recalculate BMI
          </button>
        </form>
      </Modal>

      {/* Modal 3: Onboarded Fitness Goals View + Edit */}
      <Modal isOpen={isGoalsOpen} onClose={() => setIsGoalsOpen(false)} title="Onboarded Fitness Goals">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant uppercase tracking-wider font-headline font-bold">Active Goals</span>
            <button
              type="button"
              onClick={() => {
                setIsGoalsOpen(false);
                onOpenOnboarding();
              }}
              className="px-3 py-1 rounded-xl bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider hover:bg-primary/30 transition-colors font-headline"
            >
              Run Wizard 🪄
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-2">
            {userGoals.length === 0 ? (
              <p className="text-xs text-on-surface-variant">No fitness goals selected.</p>
            ) : (
              userGoals.map((g, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider font-headline"
                >
                  {g}
                </span>
              ))
            )}
          </div>

          <form onSubmit={handleSaveGoals} className="flex flex-col gap-3 pt-2 border-t border-white/10">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Modify Selected Goals</span>
            {goalOptions.map((g, idx) => {
              const isChecked = selectedGoals.includes(g);
              return (
                <div
                  key={idx}
                  onClick={() => toggleGoal(g)}
                  className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between text-xs font-bold transition-all ${
                    isChecked
                      ? 'bg-primary/20 border-primary text-primary font-headline'
                      : 'bg-[#1D2022] border-white/10 text-on-surface-variant hover:border-white/20'
                  }`}
                >
                  <span>{g}</span>
                  <span className="material-symbols-outlined text-lg">
                    {isChecked ? 'check_box' : 'check_box_outline_blank'}
                  </span>
                </div>
              );
            })}
            <button
              type="button"
              onClick={handleSaveGoals}
              className="w-full py-3 rounded-full bg-primary text-[#111415] font-extrabold text-sm uppercase tracking-wider shadow-lg hover:brightness-110 transition-all font-headline mt-2"
            >
              Save Goals Selection
            </button>
          </form>
        </div>
      </Modal>

      {/* Modal 4: Change Password */}
      <Modal isOpen={isChangePwOpen} onClose={() => setIsChangePwOpen(false)} title="Change Password">
        <form onSubmit={handleChangePasswordSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Current Password</label>
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#19191D] border border-white/10 text-on-surface text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">New Password</label>
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#19191D] border border-white/10 text-on-surface text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-full bg-primary text-[#111415] font-extrabold text-sm uppercase tracking-wider shadow-lg hover:brightness-110 transition-all font-headline mt-2"
          >
            Update Password
          </button>
        </form>
      </Modal>
    </div>
  );
};
