import React, { useState } from 'react';
import { Smartphone, Monitor, Tablet, Wifi, Battery, Sparkles } from 'lucide-react';

interface DeviceFrameWrapperProps {
  children: React.ReactNode;
  bgColor?: string;
  fitHeight?: boolean;
}

export const DeviceFrameWrapper: React.FC<DeviceFrameWrapperProps> = ({
  children,
  bgColor = 'bg-[#F5F6F8]',
  fitHeight = false
}) => {
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'max' | 'fluid'>('mobile');

  const getContainerWidthClass = () => {
    switch (deviceMode) {
      case 'mobile':
        return fitHeight
          ? 'max-w-[410px] h-auto max-h-[100dvh] sm:h-auto sm:max-h-[844px] my-0 sm:my-4 rounded-none sm:rounded-[36px] shadow-none sm:shadow-2xl border-0 sm:border-[8px] sm:border-slate-800'
          : 'max-w-[410px] h-[100dvh] sm:h-[844px] my-0 sm:my-4 rounded-none sm:rounded-[36px] shadow-none sm:shadow-2xl border-0 sm:border-[8px] sm:border-slate-800';
      case 'max':
        return fitHeight
          ? 'max-w-[480px] h-auto max-h-[100dvh] sm:h-auto sm:max-h-[844px] my-0 sm:my-4 rounded-none sm:rounded-[36px] shadow-none sm:shadow-2xl border-0 sm:border-[8px] sm:border-slate-800'
          : 'max-w-[480px] h-[100dvh] sm:h-[844px] my-0 sm:my-4 rounded-none sm:rounded-[36px] shadow-none sm:shadow-2xl border-0 sm:border-[8px] sm:border-slate-800';
      case 'fluid':
        return fitHeight
          ? 'max-w-2xl h-auto max-h-[100dvh] sm:h-auto sm:max-h-[880px] my-0 sm:my-2 rounded-none sm:rounded-2xl shadow-none sm:shadow-xl border-0'
          : 'max-w-2xl h-[100dvh] sm:h-[880px] my-0 sm:my-2 rounded-none sm:rounded-2xl shadow-none sm:shadow-xl border-0';
    }
  };

  return (
    <div className="min-h-screen bg-[#ECEFF3] flex flex-col items-center justify-start antialiased">
      {/* Main Responsive Shell Container */}
      <div
        className={`w-full ${getContainerWidthClass()} ${bgColor} relative flex flex-col min-h-0 overflow-hidden transition-all duration-300`}
      >
        {/* Dynamic Screen Content */}
        <div className={`flex-1 w-full flex flex-col min-h-0 overflow-hidden ${bgColor} relative`}>{children}</div>
      </div>
    </div>
  );
};
