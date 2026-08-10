import React, { useState, useMemo } from 'react';
import { GymClass } from '../../types';
import { apiClient } from '../../api/client';
import { useToast } from '../../context/ToastContext';

interface ClassesScreenProps {
  classes: GymClass[];
  bookedClassIds: number[];
  onRefresh: () => void;
}

export const ClassesScreen: React.FC<ClassesScreenProps> = ({ classes, bookedClassIds, onRefresh }) => {
  const { flashToast } = useToast();
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);
  const [loadingClassId, setLoadingClassId] = useState<number | null>(null);

  // Generate 7 upcoming dates
  const daysList = useMemo(() => {
    const dates = [];
    const today = new Date();
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push({
        index: i,
        dayAbbr: dayNames[d.getDay()],
        fullDayName: fullDayNames[d.getDay()],
        dateNum: d.getDate(),
        dateStr: d.toISOString().split('T')[0],
      });
    }
    return dates;
  }, []);

  const currentSelectedDay = daysList[selectedDateIndex];

  // Filter classes by matching day name
  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      const dayStr = c.day.toLowerCase();
      if (dayStr.includes('everyday')) return true;
      return dayStr.includes(currentSelectedDay.fullDayName.toLowerCase());
    });
  }, [classes, currentSelectedDay]);

  const handleToggleBooking = async (classId: number, isBooked: boolean) => {
    setLoadingClassId(classId);
    try {
      if (isBooked) {
        await apiClient.post('/classes/cancel-booking', { class_id: classId });
        flashToast('Booking cancelled.');
      } else {
        await apiClient.post('/classes/book', { class_id: classId });
        flashToast('Class booked successfully!');
      }
      onRefresh();
    } catch (err: any) {
      flashToast(err.response?.data?.detail || 'Booking failed.', 'error');
    } finally {
      setLoadingClassId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-24 w-full max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold font-headline text-on-surface">Workout Schedule</h2>
        <p className="text-xs text-on-surface-variant">Select a day to reserve upcoming group fitness sessions.</p>
      </div>

      {/* 7-Day Date Picker Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {daysList.map((d) => {
          const isSelected = selectedDateIndex === d.index;
          return (
            <button
              key={d.index}
              type="button"
              onClick={() => setSelectedDateIndex(d.index)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl min-w-[60px] transition-all ${
                isSelected
                  ? 'bg-primary text-[#1C1B1C] font-bold shadow-lg scale-105 font-headline'
                  : 'glass-card text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="text-[10px] uppercase font-bold tracking-wider">{d.dayAbbr}</span>
              <span className="text-base font-bold font-headline">{d.dateNum}</span>
            </button>
          );
        })}
      </div>

      {/* Class Stream List */}
      <div className="flex flex-col gap-4">
        {filteredClasses.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center text-on-surface-variant text-xs">
            No workouts scheduled for {currentSelectedDay.fullDayName}.
          </div>
        ) : (
          filteredClasses.map((c) => {
            const isBooked = bookedClassIds.includes(c.id);
            const spotsLeft = c.capacity - c.booked_count;
            const isFull = spotsLeft <= 0 && !isBooked;
            const isLoading = loadingClassId === c.id;

            return (
              <div
                key={c.id}
                className="glass-card rounded-xl p-5 border border-white/10 flex items-center justify-between gap-4 relative overflow-hidden group hover:border-primary/40 transition-colors"
              >
                {/* Category Color Indicator Bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />

                <div className="flex-1 pl-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-white/5 text-on-surface-variant text-[10px] font-bold font-headline">
                      {c.time}
                    </span>
                    <span className={`text-[10px] font-bold font-headline ${isFull ? 'text-red-400' : 'text-primary'}`}>
                      {isFull ? 'CLASS FULL' : `${spotsLeft} spots left`}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-on-surface font-headline mb-0.5">{c.name}</h4>
                  <p className="text-xs text-on-surface-variant">Instructor: {c.trainer_name || 'Staff Instructor'}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleBooking(c.id, isBooked)}
                  disabled={isLoading || (isFull && !isBooked)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold font-headline uppercase tracking-wider shadow-md transition-all shrink-0 ${
                    isBooked
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                      : isFull
                      ? 'bg-[#1D2022] text-on-surface-variant cursor-not-allowed border border-white/5'
                      : 'bg-primary text-[#1C1B1C] hover:brightness-110'
                  }`}
                >
                  {isLoading ? '...' : isBooked ? 'Cancel Booking' : isFull ? 'Full' : 'Book Spot'}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
