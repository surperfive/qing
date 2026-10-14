import React from 'react';

interface DeliveryScooterIconProps {
  className?: string;
}

export const DeliveryScooterIcon: React.FC<DeliveryScooterIconProps> = ({
  className = 'w-16 h-16',
}) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <img
        src="/1b67bdaeb3b2740899ad324d0df7f544.png"
        alt="外卖配送"
        className="w-full h-full object-contain pointer-events-none"
        loading="eager"
        decoding="async"
      />
    </div>
  );
};

