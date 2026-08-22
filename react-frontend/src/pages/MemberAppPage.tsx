import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { MemberBottomNav, MemberScreen } from '../components/member/MemberBottomNav';
import { HomeScreen } from '../components/member/HomeScreen';
import { ClassesScreen } from '../components/member/ClassesScreen';
import { WeightScreen } from '../components/member/WeightScreen';
import { BillingScreen } from '../components/member/BillingScreen';
import { ProfileScreen } from '../components/member/ProfileScreen';
import { ComparePlansBottomSheet } from '../components/member/ComparePlansBottomSheet';
import { AICoachDrawer } from '../components/member/AICoachDrawer';
import { OnboardingWizardModal } from '../components/member/OnboardingWizardModal';
import { MustChangePasswordModal } from '../components/member/MustChangePasswordModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { apiClient } from '../api/client';
import { useToast } from '../context/ToastContext';
import { GymClass, MembershipPlan } from '../types';

export const MemberAppPage: React.FC = () => {
  const { user, membership, payments, bookedClassIds, refreshProfile, isLoading: isAuthLoading } = useAuth();
  const { flashToast } = useToast();

  const [activeScreen, setActiveScreen] = useState<MemberScreen>('home');
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);

  // Modals state
  const [isComparePlansOpen, setIsComparePlansOpen] = useState(false);
  const [isAICoachOpen, setIsAICoachOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Auth Forms state
  const [identifier, setIdentifier] = useState('ahmed1248khan@gmail.com');
  const [password, setPassword] = useState('510226');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  const { login } = useAuth();

  const fetchData = useCallback(async () => {
    try {
      const [resClasses, resPlans] = await Promise.all([
        apiClient.get('/classes'),
        apiClient.get('/membership-plans'),
      ]);
      setClasses(resClasses.data.classes || []);
      setPlans(resPlans.data || []);
    } catch (err: any) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-trigger onboarding popup ONCE for brand new members who have not completed onboarding
  useEffect(() => {
    if (user && user.is_onboarded !== 1 && (!user.height || user.height === 0) && user.must_change_password !== 1) {
      const uId = user.id || user.user_id;
      const hasDismissedLocally = localStorage.getItem(`kinetic_onboarded_${uId}`);
      if (!hasDismissedLocally) {
        setIsOnboardingOpen(true);
      }
    }
  }, [user]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAuth(true);
    let res: any;
    try {
      const formData = new URLSearchParams();
      formData.append('username', identifier.trim().toLowerCase());
      formData.append('password', password);

      res = await apiClient.post('/auth/token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
    } catch (err: any) {
      flashToast(err.response?.data?.detail || 'Invalid login credentials.', 'error');
      setIsSubmittingAuth(false);
      return;
    }

    try {
      login(res.data.access_token, res.data);
      flashToast('Welcome back to KINETIC Gym!');
      refreshProfile();
    } catch (err: any) {
      console.error('Error setting member session:', err);
      flashToast('Error starting member session.', 'error');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  if (isAuthLoading) {
    return <LoadingSpinner fullScreen />;
  }

  // If user is not logged in, render Mobile Auth Screen
  if (!user) {
    return (
      <div className="min-h-screen w-full sm:max-w-md mx-auto p-6 flex flex-col justify-between bg-[#0B0B0C] relative overflow-hidden">
        <div className="text-center pt-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center font-black font-headline text-[#1C1B1C] text-3xl mx-auto mb-4 shadow-xl">
            K
          </div>
          <h1 className="text-3xl font-black font-headline text-on-surface">KINETIC GYM</h1>
          <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-widest mt-1">
            Member Sign In
          </p>
        </div>

        <form onSubmit={handleLoginSubmit} className="glass-card rounded-xl p-6 border border-white/10 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Email or Phone Number
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#19191D] border border-white/10 text-on-surface text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#19191D] border border-white/10 text-on-surface text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmittingAuth}
            className="w-full py-3.5 rounded-full bg-primary text-[#1C1B1C] font-extrabold text-sm uppercase tracking-wider shadow-xl hover:brightness-110 transition-all mt-2 font-headline"
          >
            {isSubmittingAuth ? 'Signing In...' : 'Member Sign In'}
          </button>
        </form>

        <div className="text-center pb-6">
          <p className="text-[11px] text-on-surface-variant max-w-xs mx-auto">
            Account registration and credentials are provided by gym administration. Please contact the front desk if you need access.
          </p>
        </div>
      </div>
    );
  }

  const upcomingClass = classes.find((c) => bookedClassIds.includes(c.id)) || null;

  return (
    <div className="min-h-screen w-full sm:max-w-2xl mx-auto bg-[#0B0B0C] relative px-4 sm:px-6 pt-6">
      {/* Screens */}
      {activeScreen === 'home' && (
        <HomeScreen
          user={user}
          membership={membership}
          upcomingClass={upcomingClass}
          onNavigateBilling={() => setActiveScreen('billing')}
          onRefresh={refreshProfile}
        />
      )}

      {activeScreen === 'classes' && (
        <ClassesScreen
          classes={classes}
          bookedClassIds={bookedClassIds}
          onRefresh={refreshProfile}
        />
      )}

      {activeScreen === 'weight' && (
        <WeightScreen onRefresh={refreshProfile} />
      )}

      {activeScreen === 'billing' && (
        <BillingScreen
          membership={membership}
          plans={plans}
          payments={payments}
          onOpenComparePlans={() => setIsComparePlansOpen(true)}
          onRefresh={refreshProfile}
        />
      )}

      {activeScreen === 'profile' && (
        <ProfileScreen
          user={user}
          onRefresh={refreshProfile}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
        />
      )}

      {/* Bottom Nav */}
      <MemberBottomNav
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        onOpenAICoach={() => setIsAICoachOpen(true)}
      />

      {/* Modals & Drawers */}
      <ComparePlansBottomSheet
        isOpen={isComparePlansOpen}
        onClose={() => setIsComparePlansOpen(false)}
        plans={plans}
      />

      <AICoachDrawer
        isOpen={isAICoachOpen}
        onClose={() => setIsAICoachOpen(false)}
        userName={user.name}
      />

      <OnboardingWizardModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onRefresh={refreshProfile}
      />

      {/* Temporary PIN Must-Change-Password Gate */}
      <MustChangePasswordModal
        isOpen={user.must_change_password === 1}
        onSuccess={refreshProfile}
      />
    </div>
  );
};
