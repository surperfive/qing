import React from 'react';

interface DishTagProps {
  children: React.ReactNode;
  /** 附加类名（如 mt-1 之类的位置微调） */
  className?: string;
}

/**
 * 菜品标签胶囊 —— 首页「人气当季轻食」卡片与点餐页菜品卡片共用。
 *
 * 2026-10-18 统一：点餐页原来是灰底方角徽章（bg-slate-100 + border），
 * 首页人气卡是浅青柠底全圆胶囊。按用户要求两处统一成首页这套：
 * `#E4F8BC` 浅青柠底 + `#26430B` 深青柠字 + rounded-full。
 * ⚠️ 文字不能用品牌主色 #C7F665（白底对比度仅 1.25:1），深字用 --lime-900。
 */
export const DishTag: React.FC<DishTagProps> = ({ children, className = '' }) => (
  <span
    className={`inline-flex max-w-full shrink-0 items-center gap-0.5 truncate whitespace-nowrap rounded-full bg-[#E4F8BC] px-2 py-[3px] text-[9px] font-bold leading-none text-[#26430B] ${className}`}
  >
    {children}
  </span>
);
