import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { apiClient } from '../../api/client';
import { useToast } from '../../context/ToastContext';

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({ isOpen, onClose, onRefresh }) => {
  const { flashToast } = useToast();
  const [step, setStep] = useState(1);
  const [height, setHeight] = useState(175);
  const [startingWeight, setStartingWeight] = useState(75);
  const [activityLevel, setActivityLevel] = useState('Moderate (3-4 days/week)');
  const [experienceLevel, setExperienceLevel] = useState('Intermediate');
  const [injuries, setInjuries] = useState('None');
  const [goals, setGoals] = useState<string[]>(['Muscle Gain & Hypertrophy']);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const goalOptions = [
    'Weight Loss & Fat Burning',
    'Muscle Gain & Hypertrophy',
    'Strength & Powerlifting',
    'Endurance & Cardio',
    'Flexibility & Mobility',
    'Custom Diet & Nutrition',
  ];

  const toggleGoal = (g: string) => {
    setGoals((prev) =>
      prev.includes(g) ? prev.filter((item) => item !== g) : [...prev, g]
    );
  };

  const handleNext = () => setStep((s) => Math.min(3, s + 1));
  const handlePrev = () => setStep((s) => Math.max(1, s - 1));

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await apiClient.post('/members/me/onboarding', {
        height: Number(height),
        starting_weight: Number(startingWeight),
        activity_level: activityLevel,
        experience_level: experienceLevel,
        injuries: injuries || 'None',
        goals,
      });
      flashToast('Fitness profile onboarded successfully!');
      onClose();
      onRefresh();
    } catch (err: any) {
      flashToast(err.response?.data?.detail || 'Onboarding submission failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Welcome to KINETIC! Onboarding (${step}/3)`}>
      <div className="flex flex-col gap-5">
        {step === 1 && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div>
              <h4 className="text-sm font-bold text-white font-headline">Body Measurements</h4>
              <p className="text-xs text-slate-400">Let's record your starting metrics to calculate BMI & calibrate workout plans.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Height (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary font-headline"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Current Starting Weight (kg)</label>
              <input
                type="number"
                value={startingWeight}
                onChange={(e) => setStartingWeight(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary font-headline"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div>
              <h4 className="text-sm font-bold text-white font-headline">Fitness & Nutrition Goals</h4>
              <p className="text-xs text-slate-400">Select all target areas you want your PULSE AI Coach to focus on.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {goalOptions.map((g) => {
                const isSelected = goals.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGoal(g)}
                    className={`p-3 rounded-xl border text-left text-xs font-bold font-headline transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-primary/10 border-primary text-primary shadow-md'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <span>{g}</span>
                    <span className="material-symbols-outlined text-sm">
                      {isSelected ? 'check_circle' : 'add_circle_outline'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div>
              <h4 className="text-sm font-bold text-white font-headline">Activity & Medical History</h4>
              <p className="text-xs text-slate-400">Specify your activity level and any physical limitations.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Activity Level</label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary font-headline"
              >
                <option value="Sedentary">Sedentary (Little or no exercise)</option>
                <option value="Light (1-2 days/week)">Light (1-2 days/week)</option>
                <option value="Moderate (3-4 days/week)">Moderate (3-4 days/week)</option>
                <option value="Heavy (5+ days/week)">Heavy (5+ days/week)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Fitness Experience</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary font-headline"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Injuries / Physical Restrictions</label>
              <input
                type="text"
                value={injuries}
                onChange={(e) => setInjuries(e.target.value)}
                placeholder="e.g. Lower back pain, shoulder tightness, or None"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 font-headline"
            >
              Back
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 rounded-xl bg-primary text-slate-900 text-xs font-extrabold hover:brightness-110 font-headline uppercase tracking-wider"
            >
              Next Step →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-900 text-xs font-extrabold hover:brightness-110 font-headline uppercase tracking-wider shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  <span>Saving Profile...</span>
                </>
              ) : (
                <span>Complete Onboarding ✓</span>
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
