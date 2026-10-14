import React, { useState } from 'react';
import { Utensils, Salad, Coffee, Sandwich, Sparkles } from 'lucide-react';

interface DishImageProps {
  src: string;
  alt: string;
  className?: string;
  category?: string;
  aspectRatio?: string;
  fallbackBg?: string;
  fallbackIcon?: string;
}

export const DishImage: React.FC<DishImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  category
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getCategoryIcon = () => {
    switch (category) {
      case 'salad':
        return <Salad className="w-8 h-8 text-[#54801A] animate-bounce" />;
      case 'drink':
        return <Coffee className="w-8 h-8 text-sky-600" />;
      case 'snack':
        return <Sandwich className="w-8 h-8 text-[#DB2777]" />;
      default:
        return <Utensils className="w-8 h-8 text-amber-600" />;
    }
  };

  const getCategoryGradient = () => {
    switch (category) {
      case 'salad':
        return 'from-[#E4F8BC] to-[#F2FCE0] text-[#26430B]';
      case 'drink':
        return 'from-sky-100 to-blue-50 text-sky-800';
      case 'snack':
        return 'from-pink-100 to-[#FDD3EA] text-[#BE185D]';
      case 'bowl':
        return 'from-amber-100 to-orange-50 text-amber-800';
      default:
        return 'from-[#F2FCE0] to-[#F2FCE0] text-[#26430B]';
    }
  };

  if (hasError) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center p-2 bg-gradient-to-br ${getCategoryGradient()} text-center select-none`}
      >
        <div className="p-2 rounded-2xl bg-white/80 shadow-xs mb-1">
          {getCategoryIcon()}
        </div>
        <span className="text-[10px] font-extrabold truncate max-w-[90%] opacity-90">
          {alt}
        </span>
        <span className="text-[8px] font-medium opacity-60 flex items-center gap-0.5 mt-0.5">
          <Sparkles className="w-2.5 h-2.5" /> 鲜制轻食
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-slate-100 overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
          <Utensils className="w-5 h-5 text-slate-400 opacity-50" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        className={`${className} transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
};
