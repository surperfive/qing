import React from 'react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed top-14 inset-x-0 z-50 flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-top-3 duration-200">
      <div className="px-4 py-2.5 rounded-full bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold shadow-xl border border-slate-700/60 max-w-sm text-center">
        {message}
      </div>
    </div>
  );
};
