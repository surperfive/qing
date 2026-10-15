import React from "react";
import { Home, UtensilsCrossed, Sparkles, ReceiptText, Smile } from "lucide-react";

interface BottomNavBarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  cartCount: number;
  ongoingOrdersCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  ongoingOrdersCount = 1
}) => {
  const tabs = [
    { id: "home", label: "首页", icon: Home },
    { id: "menu", label: "点餐", icon: UtensilsCrossed },
    { id: "gacha", label: "今日抽卡", icon: Sparkles },
    { id: "orders", label: "订单", icon: ReceiptText, badge: ongoingOrdersCount > 0 ? ongoingOrdersCount : 1 },
    { id: "me", label: "我的", icon: Smile }
  ];

  return (
    <nav
      aria-label="底部导航"
      className={`${
        activeTab === 'gacha' ? 'relative' : 'absolute bottom-0'
      } inset-x-0 z-40 bg-white/95 backdrop-blur-md rounded-t-[22px] pt-1.5 pb-2 px-2 sm:px-3 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] ${
        activeTab === 'gacha' ? 'border-t border-[#C7F665]/50' : 'border-t border-slate-100'
      } select-none`}
      id="main-bottom-navigation-bar"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className="flex-1 flex flex-col items-center justify-center cursor-pointer select-none transition-transform duration-200 ease-out active:scale-95 group py-0.5"
              id={`nav-tab-${tab.id}`}
            >
              {/* Icon container */}
              <div className="relative flex items-center justify-center w-7 h-7 text-black">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive
                      ? "text-black stroke-[2.4] scale-105"
                      : "text-slate-400 stroke-[1.8] group-hover:scale-105 group-hover:text-slate-700"
                  }`}
                />
                {/* 计数红点：品牌粉 #EC4899 → 正红 #E60012（用户要求「小红点改成正红色」）。
                    全项目只有这一处和 FloatingCart 那处是「小红点」。 */}
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#E60012] text-white text-[10px] font-black flex items-center justify-center shadow-2xs border border-white leading-none">
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10.5px] sm:text-[11px] tracking-tight mt-0.5 leading-tight ${
                  isActive ? "text-black font-black" : "text-slate-500 font-medium group-hover:text-slate-800"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

