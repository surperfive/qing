import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BannerSlider } from './BannerSlider';
import { DishImage } from './DishImage';
import { GiftMascotAnimation } from './GiftMascotAnimation';
import { HandshakeStitchIcon } from './HandshakeStitchIcon';
import { RedPacketFuIcon } from './RedPacketFuIcon';
import { PickupStoreIcon } from './PickupStoreIcon';
import { DeliveryScooterIcon } from './DeliveryScooterIcon';
import { LoopingVideo } from './LoopingVideo';
import { Dish, OrderMode, UserProfile } from '../types';
import {
  Bike,
  Store as StoreIcon,
  Gift,
  Sparkles,
  Plus,
  Flame,
  ChevronRight,
  Zap,
  ShoppingBag,
  LogIn,
  Crown,
  Users,
  Ticket,
  X,
  Check,
  Copy,
  Share2
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (tab: string) => void;
  onSelectDish: (dish: Dish) => void;
  onAddToCart: (dish: Dish) => void;
  onSetMode: (mode: OrderMode) => void;
  popularDishes: Dish[];
  isLoggedIn: boolean;
  user?: UserProfile;
  onOpenLogin: () => void;
  onShowToast: (msg: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectDish,
  onAddToCart,
  onSetMode,
  popularDishes,
  isLoggedIn,
  user,
  onOpenLogin,
  onShowToast
}) => {
  // In-app Modal Popup States
  const [modalType, setModalType] = useState<'benefit' | 'invite' | 'redpacket' | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [benefitClaimed, setBenefitClaimed] = useState(false);
  const [redPacketClaimed, setRedPacketClaimed] = useState(false);

  const handleCopyInviteCode = () => {
    navigator.clipboard?.writeText('SLIM888');
    setCopiedCode(true);
    onShowToast('📋 邀请口令 [SLIM888] 已复制到剪贴板！');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleClaimBenefits = () => {
    setBenefitClaimed(true);
    onShowToast('🎉 恭喜！¥25 福利大礼包已全部存入您的券包');
  };

  const handleClaimRedPacket = () => {
    setRedPacketClaimed(true);
    onShowToast('🧧 恭喜！¥15 专属轻食立减金已存入券包');
  };
  return (
    /* 版面节奏对齐参考图（scripts/measure-home-ref*.py 实测）：
       参考图为 375×666 设备，本应用壳宽 410 → 缩放系数 1.093。
       左右边距 8.5 → 10px；板块间距 11 → 12px。
       ⚠️ 下面所有尺寸一律**不挂 sm:** —— 应用恒在 410px 手机壳里，
          sm: 看的是视口宽度，只会制造「桌面/窄窗两种观感」。 */
    <div className="space-y-3 pb-28">
      {/* Full-Bleed Top Header Banner - Completely visible without any component overlay */}
      <div className="w-full relative">
        <BannerSlider onBannerClick={() => onNavigate('menu')} />
      </div>

      {/* 4-Quadrant Entry 2x2 Distinct Cards - High-Fidelity Replication */}
      <div className="px-2.5">
        <div className="grid grid-cols-2 gap-x-1.5 gap-y-2">
          {/* 1. Takeout Card */}
          <button
            onClick={() => {
              onSetMode("takeout");
              onNavigate("menu");
            }}
            className="group relative flex flex-col px-3.5 pt-2.5 pb-1 bg-white rounded-[22px] border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition-all text-left min-h-[125px] overflow-hidden cursor-pointer"
            id="home-takeout-card"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-1">
                <span className="font-black text-slate-900 text-[18px] leading-none tracking-tight">
                  外卖配送
                </span>
                {/* 箭头改成「黑圆 + 青柠箭头」徽章 —— 参考图里不是裸 chevron，
                    是实心黑圆里的浅色箭头，直径约 15px（真实 px）。 */}
                <span className="w-[15px] h-[15px] rounded-full bg-black flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
                  <ChevronRight className="w-2.5 h-2.5 stroke-[3.5] text-[#C7F665]" />
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-none font-medium">安心送达 · 准时保障</p>
            </div>

            {/* 插画：从「底部居中、独立一行 h-[73px]」改成**绝对定位到右下角并放大**。
                ⚠️ 尺寸是被「内容留白」倒逼出来的，不是随手定的。四个素材的非白内容占比实测：
                  外卖配送 上17.1/下16.1/左8.3/右9.7%  ·  到店自取 **上3.3/下5.7/左6.7/右4.5%**
                  福利中心 上22.5/下26.0/左12.3/右15.6%  ·  今日抽卡 上24.2/下18.1/左16.9/右15.6%
                最紧的是「到店自取」，所以按它算：画布 96×96、贴右下角 →
                内容落在 x 100~186 / y 30~118，全部在卡片内（内区 190×123），**不裁切**。
                可见内容 85×87，比原来的 65×66 大 31%。
                ⚠️ 别把画布放大回 108 或加负偏移 —— 到店自取的下沿会立刻被 overflow-hidden 切掉。
                ⚠️ 左侧文案宽度（副标题约 95px）必须小于内容左边界 100px，否则会压到插画上。 */}
            <div className="absolute right-0 bottom-0 w-[96px] h-[96px] z-0 pointer-events-none">
              <img
                src="/1b67bdaeb3b2740899ad324d0df7f544.png"
                alt="外卖配送"
                className="w-full h-full object-contain pointer-events-none group-hover:scale-105 transition-transform"
              />
            </div>
          </button>

          {/* 2. Pickup Card */}
          <button
            onClick={() => {
              onSetMode("pickup");
              onNavigate("menu");
            }}
            className="group relative flex flex-col px-3.5 pt-2.5 pb-1 bg-white rounded-[22px] border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition-all text-left min-h-[125px] overflow-hidden cursor-pointer"
            id="home-pickup-card"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-1">
                <span className="font-black text-slate-900 text-[18px] leading-none tracking-tight">
                  到店自取
                </span>
                {/* 箭头改成「黑圆 + 青柠箭头」徽章 —— 参考图里不是裸 chevron，
                    是实心黑圆里的浅色箭头，直径约 15px（真实 px）。 */}
                <span className="w-[15px] h-[15px] rounded-full bg-black flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
                  <ChevronRight className="w-2.5 h-2.5 stroke-[3.5] text-[#C7F665]" />
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-none font-medium">提前点单 · 到店即取</p>
            </div>

            {/* High-definition Graphic with embedded GOOD FOOD HERE! hanging tag */}
            <div className="absolute right-0 bottom-0 w-[96px] h-[96px] z-0 pointer-events-none">
              <img
                src="/edd0acc180bfd09016dd25d86701cc17.png"
                alt="到店自取"
                className="w-full h-full object-contain pointer-events-none group-hover:scale-105 transition-transform"
              />
            </div>
          </button>

          {/* 3. Benefit Card */}
          <button
            onClick={() => setModalType("benefit")}
            className="group relative flex flex-col px-3.5 pt-2.5 pb-1 bg-white rounded-[22px] border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition-all text-left min-h-[125px] overflow-hidden cursor-pointer"
            id="home-benefit-card"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-1">
                <span className="font-black text-slate-900 text-[18px] leading-none tracking-tight">
                  福利中心
                </span>
                {/* 箭头改成「黑圆 + 青柠箭头」徽章 —— 参考图里不是裸 chevron，
                    是实心黑圆里的浅色箭头，直径约 15px（真实 px）。 */}
                <span className="w-[15px] h-[15px] rounded-full bg-black flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
                  <ChevronRight className="w-2.5 h-2.5 stroke-[3.5] text-[#C7F665]" />
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-none font-medium">点击唤醒 · 天天领红包</p>
            </div>

            {/* High-definition 3D Gift Video with embedded doodles */}
            <div className="absolute right-0 bottom-0 w-[96px] h-[96px] z-0 pointer-events-none">
              <LoopingVideo
                src="/893.mp4"
                className="w-full h-full object-contain pointer-events-none group-hover:scale-105 transition-transform"
              />
            </div>
          </button>

          {/* 4. Gacha Card */}
          <button
            onClick={() => onNavigate("gacha")}
            className="group relative flex flex-col px-3.5 pt-2.5 pb-1 bg-white rounded-[22px] border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition-all text-left min-h-[125px] overflow-hidden cursor-pointer"
            id="home-gacha-card"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-1">
                <span className="font-black text-slate-900 text-[18px] leading-none tracking-tight">
                  今日抽卡
                </span>
                {/* 箭头改成「黑圆 + 青柠箭头」徽章 —— 参考图里不是裸 chevron，
                    是实心黑圆里的浅色箭头，直径约 15px（真实 px）。 */}
                <span className="w-[15px] h-[15px] rounded-full bg-black flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
                  <ChevronRight className="w-2.5 h-2.5 stroke-[3.5] text-[#C7F665]" />
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-none font-medium">翻牌抽免费招牌碗</p>
            </div>

            {/* High-definition Gacha Cloche Video with embedded LUCKY DAY! */}
            <div className="absolute right-0 bottom-0 w-[96px] h-[96px] z-0 pointer-events-none">
              <LoopingVideo
                src="/891.mp4"
                className="w-full h-full object-contain pointer-events-none group-hover:scale-105 transition-transform"
              />
            </div>
          </button>
        </div>
      </div>

      {/* Section Header: "限时超值福利 LIMITED TIME" - Neon Lime Capsule Bar
          ⚠️ 高度沿革：44 → 72（按参考图 375 设备 66px × 1.093 换算）→ **54**。
          参考图那档换算出来在 410 壳里偏胖（用户：「降低高度，现在太大了」），
          说明**竖向尺寸不该跟着宽度比例缩放** —— 比例只用于宽度方向的推导。
          内容同步收了半档：黑圆 34→32、标题 17→16、胶囊 py-1.5→py-1。 */}
      <div className="px-2.5">
        <div className="w-full h-[54px] rounded-full bg-[#C7F665] px-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-[#EC4899] flex items-center justify-center text-white shadow-2xs shrink-0">
              <Flame className="w-4.5 h-4.5 fill-white text-white" />
            </div>
            <span className="font-black text-black text-[16px] tracking-tight">
              限时超值福利
            </span>
            <span className="text-[10px] font-black italic text-black/65 tracking-wider ml-1">
              LIMITED TIME
            </span>
          </div>

          <button
            onClick={() => onNavigate("menu")}
            className="px-3.5 py-1 rounded-full bg-black text-white text-xs font-black flex items-center gap-0.5 hover:bg-slate-800 active:scale-95 transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <span>查看更多</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* 2 Benefit Cards Grid: Left (Black Card) & Right (Warm Yellow Card)
          ⚠️ 参考图里没有这两个组件（截图只到「限时福利」+ 分类 tab），
             所以**尺寸没动**，只跟着全局改了左右边距与列间距。 */}
      <div className="px-2.5">
        <div className="grid grid-cols-2 gap-x-1.5 gap-y-2 items-stretch">
          {/* Left Black Card: 招牌能量减脂餐 */}
          <div
            onClick={() => {
              if (popularDishes.length > 0) {
                onSelectDish(popularDishes[0]);
              } else {
                onNavigate("menu");
              }
            }}
            className="cursor-pointer bg-[#111111] rounded-[22px] p-3 sm:p-3.5 text-white relative overflow-hidden flex flex-col justify-between min-h-[200px] sm:min-h-[220px] shadow-sm hover:shadow-md transition-all group"
            id="home-signature-card"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-[#C7F665] text-black text-[10px] sm:text-[11px] font-black tracking-tight">
                  镇店招牌
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/15 text-white text-[10px] sm:text-[11px] font-bold backdrop-blur-xs">
                  精选热卖
                </span>
              </div>
              <h4 className="font-black text-white text-[15px] sm:text-base tracking-tight mt-2 leading-snug group-hover:text-[#C7F665] transition-colors">
                招牌能量减脂餐
              </h4>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 font-medium leading-tight">
                高蛋白慢碳 · 营养师科学控卡
              </p>
            </div>

            {/* Bottom Graphic: Bowl on left, yellow handwritten doodle on right */}
            <div className="flex items-end justify-between mt-2 pt-1">
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden border-2 border-white/20 shadow-md flex-shrink-0 bg-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
                  alt="招牌能量减脂餐"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                />
              </div>

              <div className="flex flex-col items-center justify-center pr-1 select-none pointer-events-none pb-1">
                {/* 3-pointed crown doodle */}
                <svg className="w-5 h-4 text-[#FACC15] fill-current mb-0.5" viewBox="0 0 24 24">
                  <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                </svg>
                <span className="font-black text-[#FACC15] text-[11px] sm:text-xs leading-none tracking-tight transform rotate-2">
                  EAT
                </span>
                <span className="font-black text-[#FACC15] text-[11px] sm:text-xs leading-none tracking-tight transform -rotate-1 mt-0.5">
                  CLEAN
                </span>
                <span className="font-black text-[#FACC15] text-[11px] sm:text-xs leading-none tracking-tight transform rotate-1 mt-0.5">
                  STAY
                </span>
                <span className="font-black text-[#FACC15] text-[11px] sm:text-xs leading-none tracking-tight transform -rotate-2 mt-0.5">
                  COOL!
                </span>
              </div>
            </div>
          </div>

          {/* Right Warm Yellow Card: 邀请新人享免单 */}
          <div
            onClick={() => setModalType("invite")}
            className="cursor-pointer bg-gradient-to-b from-[#FFFDF0] via-[#FFFBE8] to-[#FFF3C4] rounded-[22px] p-3 sm:p-3.5 border border-[#FDE68A]/70 relative overflow-hidden flex flex-col justify-between min-h-[200px] sm:min-h-[220px] shadow-sm hover:shadow-md transition-all group"
            id="home-invite-card"
          >
            {/* Top right handwritten doodle */}
            <div className="absolute top-2.5 right-2.5 flex flex-col items-end pointer-events-none select-none z-10 leading-none">
              <span className="font-black text-slate-900 text-[8.5px] tracking-tight">GOOD</span>
              <span className="font-black text-slate-900 text-[8.5px] tracking-tight mt-0.5">FRIENDS</span>
              <span className="font-black text-slate-900 text-[8.5px] tracking-tight mt-0.5">HEALTHY</span>
              <span className="font-black text-slate-900 text-[8.5px] tracking-tight mt-0.5">LIFE!</span>
              <span className="text-slate-900 text-[9px] font-bold mt-0.5">♡</span>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-1">
                <span className="px-2 py-0.5 rounded-full bg-[#FF9800] text-white text-[10px] sm:text-[11px] font-black tracking-tight shadow-2xs">
                  新人免单
                </span>
                <span className="text-[11px] sm:text-xs font-black text-[#FF9800] ml-0.5">
                  0元享
                </span>
              </div>
              <h4 className="font-black text-slate-900 text-[15px] sm:text-base tracking-tight mt-2 leading-snug">
                邀请新人享免单
              </h4>
              <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 font-medium leading-tight">
                好友首单立享 0 元起
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModalType("invite");
                }}
                className="mt-2.5 px-3 py-1 rounded-full bg-[#C7F665] hover:bg-[#C7F665] text-black font-black text-xs inline-flex items-center gap-0.5 shadow-2xs cursor-pointer active:scale-95 transition-all"
              >
                <span>立即邀请</span>
                <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>

            {/* Bottom-right mascot character with blue companion */}
            <div className="absolute -bottom-1 -right-1 w-28 h-26 sm:w-32 sm:h-28 pointer-events-none select-none overflow-hidden z-0">
              <img
                src="/mascot_invite.png"
                alt="邀请新人享免单"
                className="w-full h-full object-contain object-bottom-right drop-shadow-xs group-hover:scale-105 transition-transform"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Popular Menu Dishes Grid - Clean Modern Cards
          ⚠️ 参考图截图没滚到这里，卡片尺寸未动，只跟随全局边距/列间距。 */}
      <div className="px-2.5" id="home-popular-dishes-section">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <div className="w-4.5 h-4.5 rounded-full bg-slate-900 text-[#C7F665] flex items-center justify-center shadow-2xs border border-[#C7F665]/30 shrink-0">
              <Sparkles className="w-3 h-3 stroke-[2.2]" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-[15px] tracking-tight whitespace-nowrap">
              人气当季轻食
            </h3>
          </div>
          <button
            onClick={() => onNavigate('menu')}
            className="text-[11px] sm:text-xs text-slate-500 font-bold hover:text-slate-800 flex items-center gap-0.5 whitespace-nowrap transition-colors cursor-pointer"
          >
            <span>全部菜单</span>
            <ChevronRight className="w-3 h-3 stroke-[2]" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-1.5 gap-y-2">
          {popularDishes.map((dish) => (
            <div
              key={dish.id}
              onClick={() => onSelectDish(dish)}
              className="group cursor-pointer bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden text-left"
            >
              {/* Dish Image */}
              <div className="relative h-28 sm:h-30 w-full overflow-hidden bg-slate-100">
                <DishImage
                  src={dish.image}
                  alt={dish.name}
                  category={dish.category}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-[#EC4899]/90 backdrop-blur-xs text-white text-[9px] font-black shadow-2xs whitespace-nowrap leading-none">
                  HOT🔥
                </span>
                <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold flex items-center gap-0.5 whitespace-nowrap leading-none">
                  <Flame className="w-2.5 h-2.5 text-orange-400 fill-orange-400 shrink-0" />
                  <span>{dish.kcal} kcal</span>
                </div>
              </div>

              {/* Dish Body */}
              <div className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between">
                <div className="min-w-0">
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-[13px] leading-tight truncate whitespace-nowrap group-hover:text-[#54801A] transition-colors">
                    {dish.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium truncate whitespace-nowrap leading-tight">
                    {dish.subtitle || dish.description}
                  </p>

                  <div className="flex items-center gap-1 mt-1.5 overflow-hidden whitespace-nowrap">
                    {dish.tags.slice(0, 2).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded bg-[#C7F665]/15 text-[#26430B] text-[9px] font-bold border border-[#C7F665]/30 truncate whitespace-nowrap shrink-0 max-w-full leading-none"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100">
                  <div className="flex items-baseline gap-0.5 whitespace-nowrap min-w-0">
                    <span className="text-[10px] font-bold text-[#E60012]">¥</span>
                    <span className="text-sm sm:text-[15px] font-black text-[#E60012] leading-none">
                      {dish.dealPrice.toFixed(1)}
                    </span>
                    {dish.originalPrice && (
                      <span className="text-[9px] text-slate-400 line-through ml-0.5 whitespace-nowrap">
                        ¥{dish.originalPrice}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDish(dish);
                    }}
                    className="w-6 h-6 rounded-full bg-slate-900 hover:bg-black active:scale-95 text-[#C7F665] flex items-center justify-center shadow-xs transition-all border border-[#C7F665]/30 shrink-0 cursor-pointer"
                    aria-label={`查看详情：${dish.name}`}
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* In-App Animated Modal Popups */}
      <AnimatePresence>
        {/* 1. Benefit Center / Surprise Gift Box In-App Modal */}
        {modalType === 'benefit' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden border border-slate-100 text-center"
            >
              {/* Close Button */}
              <button
                onClick={() => setModalType(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header Visual Animation */}
              <div className="flex justify-center -mt-2 mb-2">
                <div className="w-28 h-28 flex items-center justify-center relative">
                  <LoopingVideo
                    src="/893.mp4"
                    className="w-28 h-28 object-contain"
                  />
                </div>
              </div>

              <div className="space-y-1 mb-4">
                <span className="px-2.5 py-0.5 rounded-full bg-[#FDD3EA] text-[#DB2777] text-xs font-black border border-[#FAB7D9]">
                  元气轻食 · 会员福利礼盒
                </span>
                <h3 className="text-lg font-black text-slate-900 pt-1">
                  恭喜获得 ¥25 专享轻食礼包
                </h3>
                <p className="text-xs text-slate-500">今日专属特权券已准备就绪，随时开启美味</p>
              </div>

              {/* Coupon Pack List */}
              <div className="space-y-2 mb-5 text-left">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FDD3EA]/80 border border-[#FAB7D9]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-[#EC4899] text-white flex flex-col items-center justify-center font-black leading-tight flex-shrink-0">
                      <span className="text-sm">¥10</span>
                      <span className="text-[8px] font-normal">无门槛</span>
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xs text-slate-800">全品类无门槛立减券</h5>
                      <p className="text-[10px] text-slate-500 mt-0.5">自取 / 外卖均可使用 · 7天有效</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-black text-[#DB2777] px-2 py-0.5 rounded-full bg-[#FAB7D9]/70">
                    专属
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F2FCE0]/80 border border-[#E4F8BC]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-[#54801A] text-white flex flex-col items-center justify-center font-black leading-tight flex-shrink-0">
                      <span className="text-xs">8.8折</span>
                      <span className="text-[8px] font-normal">能量碗</span>
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xs text-slate-800">招牌能量碗专享折扣券</h5>
                      <p className="text-[10px] text-slate-500 mt-0.5">最高可减 ¥15 · 随时可用</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-black text-[#54801A] px-2 py-0.5 rounded-full bg-[#E4F8BC]/70">
                    热推
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/80 border border-amber-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex flex-col items-center justify-center font-black leading-tight flex-shrink-0">
                      <span className="text-xs">免邮</span>
                      <span className="text-[8px] font-normal">外卖券</span>
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xs text-slate-800">外卖安心免配送费券</h5>
                      <p className="text-[10px] text-slate-500 mt-0.5">满 ¥30 即可抵扣配送费</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-black text-amber-700 px-2 py-0.5 rounded-full bg-amber-100/70">
                    省心
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {!benefitClaimed ? (
                  <button
                    onClick={handleClaimBenefits}
                    className="w-full py-3 rounded-xl bg-slate-900 text-[#C7F665] font-black text-sm hover:bg-black active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-md border border-[#C7F665]/30"
                  >
                    <Gift className="w-4 h-4" />
                    <span>一键全部领取到券包</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setModalType(null);
                      onNavigate('menu');
                    }}
                    className="w-full py-3 rounded-xl bg-[#54801A] text-white font-black text-sm hover:bg-[#26430B] active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>已存入券包，立即去点单</span>
                  </button>
                )}

                <button
                  onClick={() => setModalType(null)}
                  className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  暂不需要，返回首页
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 2. Invite Friends / 0 Yuan Free Meal In-App Modal */}
        {modalType === 'invite' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden border border-slate-100 text-center"
            >
              {/* Close Button */}
              <button
                onClick={() => setModalType(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Graphic Header */}
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-center mb-3 shadow-inner">
                <img
                  src="/853c20910e5626627b9b82adf81b1c68.png"
                  alt="邀请免单"
                  className="w-12 h-12 object-contain"
                />
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-black">
                邀请好友 · 双方同享好礼
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1 mb-1">
                邀请新人享 0 元免单
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                好友通过您的专属口令下单，好友首单立减，您可获得免费招牌能量碗！
              </p>

              {/* Invite Code Box */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 mb-4 flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 font-bold block">我的专属邀请口令</span>
                  <span className="text-base font-black text-slate-900 tracking-wider">SLIM888</span>
                </div>
                <button
                  onClick={handleCopyInviteCode}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
                    copiedCode
                      ? 'bg-[#54801A] text-white'
                      : 'bg-slate-900 text-[#C7F665] hover:bg-black active:scale-95'
                  }`}
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? '已复制' : '复制口令'}</span>
                </button>
              </div>

              {/* Steps */}
              <div className="grid grid-cols-3 gap-2 text-center mb-5">
                <div className="p-2 rounded-xl bg-amber-50/50 border border-amber-100/60">
                  <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-black text-[10px] flex items-center justify-center mx-auto mb-1">
                    1
                  </span>
                  <p className="text-[10px] font-bold text-slate-700">发送邀请口令</p>
                </div>
                <div className="p-2 rounded-xl bg-amber-50/50 border border-amber-100/60">
                  <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-black text-[10px] flex items-center justify-center mx-auto mb-1">
                    2
                  </span>
                  <p className="text-[10px] font-bold text-slate-700">好友领取首单</p>
                </div>
                <div className="p-2 rounded-xl bg-amber-50/50 border border-amber-100/60">
                  <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-black text-[10px] flex items-center justify-center mx-auto mb-1">
                    3
                  </span>
                  <p className="text-[10px] font-bold text-slate-700">获得免单大奖</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleCopyInviteCode}
                  className="w-full py-3 rounded-xl bg-amber-500 text-white font-black text-sm hover:bg-amber-600 active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Share2 className="w-4 h-4" />
                  <span>立即分享邀请好友</span>
                </button>
                <button
                  onClick={() => setModalType(null)}
                  className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  关闭
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 3. Daily Red Packet / Lucky Draw In-App Modal */}
        {modalType === 'redpacket' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-gradient-to-b from-[#EC4899] to-red-600 rounded-3xl p-6 shadow-2xl overflow-hidden border border-[#EC4899] text-center text-white"
            >
              {/* Close Button */}
              <button
                onClick={() => setModalType(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Mascot Red Packet Graphic */}
              <div className="w-20 h-20 mx-auto flex items-center justify-center mb-2 animate-bounce">
                <RedPacketFuIcon className="w-20 h-20" />
              </div>

              <span className="px-3 py-0.5 rounded-full bg-amber-300 text-[#831843] text-xs font-black shadow-xs">
                天天领红包 · 每日签到
              </span>
              <h3 className="text-xl font-black mt-2 mb-1">
                轻食能量红包已开启
              </h3>
              <p className="text-xs text-[#FAB7D9] mb-5">营养师推荐餐品专享，立省开吃！</p>

              {/* Red Packet Amount Card */}
              <div className="bg-white rounded-2xl p-4 text-slate-900 shadow-lg mb-5 text-left border border-[#FAB7D9]">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-black text-[#E60012]">¥15.0</span>
                    <span className="text-xs text-slate-400 ml-1">满 ¥38 可用</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-[#FDD3EA] text-[#DB2777] text-[10px] font-black border border-[#FAB7D9]">
                    今日专享
                  </span>
                </div>
                <h5 className="font-extrabold text-xs text-slate-800 mt-2">
                  健康能量餐通用抵扣金
                </h5>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  全场所有减脂沙拉、慢碳能量碗、鲜榨轻饮均可使用
                </p>
              </div>

              {/* Action */}
              <div className="space-y-2">
                {!redPacketClaimed ? (
                  <button
                    onClick={handleClaimRedPacket}
                    className="w-full py-3 rounded-xl bg-amber-300 text-[#831843] font-black text-sm hover:bg-amber-400 active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-lg"
                  >
                    <Gift className="w-4 h-4" />
                    <span>立即存入我的券包</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setModalType(null);
                      onNavigate('menu');
                    }}
                    className="w-full py-3 rounded-xl bg-white text-[#DB2777] font-black text-sm hover:bg-[#FDD3EA] active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-lg"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>已放入券包，去点餐抵扣</span>
                  </button>
                )}

                <button
                  onClick={() => setModalType(null)}
                  className="w-full py-2 text-xs font-bold text-[#FAB7D9] hover:text-white transition-colors"
                >
                  关闭
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

