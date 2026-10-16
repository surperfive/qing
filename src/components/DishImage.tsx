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
        return <Coffee className="w-8 h-8 text-[#0284C7]" />;
      case 'snack':
        return <Sandwich className="w-8 h-8 text-[#DB2777]" />;
      default:
        return <Utensils className="w-8 h-8 text-[#D97706]" />;
    }
  };

  /**
   * 分类兜底配色（仅菜品图加载失败时显示）。
   * 2026-10-15 统一：原先四个分类混用 hex 常量和 Tailwind 类两种写法，
   * 且 snack 的渐变换了**两个体系**的相近粉 —— `from-pink-100`(#FCCDE8，Tailwind) →
   * `to-[#FDD3EA]`(项目 --pink-50)，肉眼几乎无渐变却跨了两套色。
   * 现在四个分类都是一对明确的 hex，同体系内由浅到深。
   *
   * 四个色系是**分类语义色**，刻意保留区分度（salad=青柠 / drink=蓝 /
   * snack=粉 / bowl=琥珀），不是品牌色板的一部分 —— 改任何一个都会和另一类撞车。
   */
  const getCategoryGradient = () => {
    switch (category) {
      case 'salad':
        return 'from-[#E4F8BC] to-[#F2FCE0] text-[#26430B]';
      case 'drink':
        return 'from-[#E0F2FE] to-[#BAE6FD] text-[#075985]';
      case 'snack':
        return 'from-[#FDD3EA] to-[#FAB7D9] text-[#BE185D]';
      case 'bowl':
        return 'from-[#FEF3C7] to-[#FDE68A] text-[#92400E]';
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
