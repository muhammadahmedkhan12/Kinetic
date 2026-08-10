import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', fullScreen = false }) => {
  const sizeMap = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeMap[size]} border-[#C5A880]/20 border-t-[#C5A880] rounded-full animate-spin`}
      />
      <span className="text-xs font-semibold tracking-wider text-[#C5A880] uppercase animate-pulse font-headline">
        KINETIC...
      </span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0A0A0B]/95 backdrop-blur-md">
        {spinner}
      </div>
    );
  }

  return spinner;
};
