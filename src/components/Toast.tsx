import React from 'react';
import { Info, CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string | null;
  isSuccess?: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, isSuccess }) => {
  if (!message) return null;

  return (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-gray-900/95 text-white px-4 py-2.5 rounded-full shadow-xl text-xs font-semibold flex items-center gap-2 pointer-events-none z-50 whitespace-nowrap animate-in fade-in slide-in-from-top-3 duration-200">
      {isSuccess ? (
        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
      ) : (
        <Info className="w-4 h-4 text-[#FFD200] shrink-0" />
      )}
      <span className="leading-tight">{message}</span>
    </div>
  );
};
