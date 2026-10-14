import React from 'react';

interface PickupStoreIconProps {
  className?: string;
}

export const PickupStoreIcon: React.FC<PickupStoreIconProps> = ({ className = 'w-16 h-16' }) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <img
        src="/edd0acc180bfd09016dd25d86701cc17.png"
        alt="到店自取"
        className="w-full h-full object-contain pointer-events-none"
        loading="eager"
        decoding="async"
      />
    </div>
  );
};

