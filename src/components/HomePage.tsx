import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BannerSlider } from './BannerSlider';
import { DishImage } from './DishImage';
import { DishTag } from './DishTag';
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
            className="group relative flex flex-col px-3.5 pt-2.5 pb-1 bg-white rounded-[22px] border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200 ease-out text-left min-h-[125px] overflow-hidden cursor-pointer active:scale-[0.98]"
            id="home-takeout-card"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-1">
                <span className="font-black text-slate-900 text-[22px] leading-none tracking-tight">
                  外卖配送
                </span>
                {/* 箭头改成「黑圆 + 青柠箭头」徽章 —— 参考图里不是裸 chevron，
                    是实心黑圆里的浅色箭头，直径约 15px（真实 px）。 */}
                <span className="w-[18px] h-[18px] rounded-full bg-black flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
                  <ChevronRight className="w-3 h-3 stroke-[3.5] text-[#C7F665]" />
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-none font-medium">安心送达 · 准时保障</p>
            </div>

            {/* 左下角标签（2026-10-18 按参考图加）
                参考图口径（卡 287×205）：胶囊高 24px、底边距卡底 38px（≈18.5% 卡高），
                与标题左对齐；第一个胶囊「实心 + 反色字」，第二个「白底 + 灰字」。
                落到本卡 192×125：高 14（text-[8px] + py-[3px]）、`bottom-5`（20px）。
                ⚠️ 颜色照参考图取样：黑胶囊的字是**青柠**不是白（HOT 实测 #DCF93B、FREE #E1FA35），
                   青柠胶囊底实测 #D1FA0A —— 这里统一收口到品牌 `#C7F665`，与项目「黑胶囊 + 青柠字」的既有写法一致。
                ⚠️ 第二个胶囊是白底，本卡也是白底 → 必须靠 `shadow` 才浮得起来，不能只靠底色。
                ⚠️ 两颗胶囊加起来约 86px，插画左侧在 y 91~105 这带大约从 x 80 起 —— 会有约 20px 重叠。
                   参考图里刚好错开（它卡片更宽），本卡更窄只能压上去；胶囊 z-10 盖在插画上，读起来是「贴纸叠标签」。 */}
            <div className="absolute left-3.5 bottom-[52px] z-10 flex items-center gap-1">
              <span className="rounded-full bg-black px-1.5 py-1 text-[8px] font-black leading-none text-[#C7F665]">
                HOT
              </span>
              <span className="rounded-full bg-white px-1.5 py-1 text-[8px] font-bold leading-none text-slate-600 shadow-[0_1px_3px_rgba(15,23,42,0.14)]">
                美食·饮品
              </span>
            </div>

            {/* 插画（2026-10-18 换素材 + 按参考图重排版）
                参考图口径（卡 287×205）：插画贴右下角、**下沿故意溢出卡片**被 `overflow-hidden` 切掉，
                读起来是「贴纸压出边」。
                换算到本卡 192×125：
                  · 容器 `h-[62px] w-[94px]`、`-bottom-2`（下溢 8px）→ 可见高约 52
                  · 容器宽只是「够宽」，实际宽度由 `object-contain` 按素材比例决定，
                    所以四张卡共用一个尺寸也不会变形。
                实测四张素材的非白内容占画布：宽 77~89%、高 96%，
                所以 content 高度 ≈ 容器高，`object-right-bottom` 保证贴右下不被居中留白。
                ⚠️ **尺寸沿革（三次收小，别再来回试）**：92 → 80 → **62**。
                   92 时被左下角胶囊压住 13px（用户「至少不要被卡片标签挡住」）；
                   80 时刚好相切（胶囊右端 x≈97，外卖卡踏板车左缘 97）；
                   62 是用户「继续缩小」后再收一档，现在让出约 20px 余量。
                ⚠️ 上限约束是**左下角胶囊**，不是副标题：想放大得先改窄胶囊或把插画右移。
                ⚠️ 四张卡共用尺寸，别只缩其中一张 —— 会让两行插画大小不一致。
                三档对照图：`scripts/compare-entry-sizes.mjs 80 70 62` → `outputs/entry-compare/size-compare.png`。
                ⚠️ **描边粗细已归一化（2026-10-19）**：四张素材原描边占画面高 1.74%~3.12%，
                   加上 62/72 两档渲染高，落到屏幕上是 1.25~2.06px（1.65× 差），所以看着不齐。
                   `scripts/normalize-entry-stroke.mjs` 用膨胀/腐蚀把四张统一到 **1.52~1.65px（1.09×）**，
                   产物在 `public/entry-norm/*.png`（导出 4× 渲染高，约 120KB/张，和原 JPG 同量级）。
                   原图 `public/entry-*.jpg` 保留未动，要回退直接改回 `src` 即可。 */}
            <div className="absolute -right-1 bottom-1 h-[62px] w-[94px] z-0 pointer-events-none">
              <img
                src="/entry-norm/entry-takeout.png"
                alt="外卖配送"
                className="w-full h-full object-contain object-right-bottom pointer-events-none group-hover:scale-105 transition-transform"
              />
            </div>
          </button>

          {/* 2. Pickup Card */}
          <button
            onClick={() => {
              onSetMode("pickup");
              onNavigate("menu");
            }}
            className="group relative flex flex-col px-3.5 pt-2.5 pb-1 bg-white rounded-[22px] border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200 ease-out text-left min-h-[125px] overflow-hidden cursor-pointer active:scale-[0.98]"
            id="home-pickup-card"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-1">
                <span className="font-black text-slate-900 text-[22px] leading-none tracking-tight">
                  到店自取
                </span>
                {/* 箭头改成「黑圆 + 青柠箭头」徽章 —— 参考图里不是裸 chevron，
                    是实心黑圆里的浅色箭头，直径约 15px（真实 px）。 */}
                <span className="w-[18px] h-[18px] rounded-full bg-black flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
                  <ChevronRight className="w-3 h-3 stroke-[3.5] text-[#C7F665]" />
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-none font-medium">提前点单 · 到店即取</p>
            </div>

            {/* 左下角标签：FRESH 是青柠底黑字（白卡上更亮），第二颗白底要带 shadow 才浮得起来 */}
            <div className="absolute left-3.5 bottom-[52px] z-10 flex items-center gap-1">
              <span className="rounded-full bg-[#C7F665] px-1.5 py-1 text-[8px] font-black leading-none text-black">
                FRESH
              </span>
              <span className="rounded-full bg-white px-1.5 py-1 text-[8px] font-bold leading-none text-slate-600 shadow-[0_1px_3px_rgba(15,23,42,0.14)]">
                省时·方便
              </span>
            </div>

            {/* 插画：PICK UP 小店，口径同外卖配送卡（容器 94×62，贴右下、下溢 8px） */}
            <div className="absolute -right-1 bottom-1 h-[62px] w-[94px] z-0 pointer-events-none">
              <img
                src="/entry-norm/entry-pickup.png"
                alt="到店自取"
                className="w-full h-full object-contain object-right-bottom pointer-events-none group-hover:scale-105 transition-transform"
              />
            </div>
          </button>

          {/* 3. Benefit Card */}
          <button
            onClick={() => setModalType("benefit")}
            className="group relative flex flex-col px-3.5 pt-2.5 pb-1 bg-white rounded-[22px] border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200 ease-out text-left min-h-[125px] overflow-hidden cursor-pointer active:scale-[0.98]"
            id="home-benefit-card"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-1">
                <span className="font-black text-slate-900 text-[22px] leading-none tracking-tight">
                  福利中心
                </span>
                {/* 箭头改成「黑圆 + 青柠箭头」徽章 —— 参考图里不是裸 chevron，
                    是实心黑圆里的浅色箭头，直径约 15px（真实 px）。 */}
                <span className="w-[18px] h-[18px] rounded-full bg-black flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
                  <ChevronRight className="w-3 h-3 stroke-[3.5] text-[#C7F665]" />
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-none font-medium">点击唤醒 · 天天领红包</p>
            </div>

            {/* 左下角标签：WOW 青柠底黑字 + 白底「超多福利」 */}
            <div className="absolute left-3.5 bottom-[52px] z-10 flex items-center gap-1">
              <span className="rounded-full bg-[#C7F665] px-1.5 py-1 text-[8px] font-black leading-none text-black">
                WOW
              </span>
              <span className="rounded-full bg-white px-1.5 py-1 text-[8px] font-bold leading-none text-slate-600 shadow-[0_1px_3px_rgba(15,23,42,0.14)]">
                超多福利
              </span>
            </div>

            {/* 插画：红包 + 铜钱。
                ⚠️ 原来是 `LoopingVideo`（/893.mp4 循环视频），这次换成静态图 —— 不再有动效。
                ⚠️ 尺寸比上面两张卡大（72 vs 62）：这张素材内容比例只有 1.08（很方），
                   同样的高度下**视觉宽度明显偏窄、看起来更小**，所以按「视觉等大」而不是「数值等大」给。
                   上限：插画上沿不能越过副标题（下沿 y=42），h=72 时上沿 y=49，只剩 7px 余量。 */}
            <div className="absolute -right-1 bottom-1 h-[72px] w-[100px] z-0 pointer-events-none">
              <img
                src="/entry-norm/entry-benefit.png"
                alt="福利中心"
                className="w-full h-full object-contain object-right-bottom pointer-events-none group-hover:scale-105 transition-transform"
              />
            </div>
          </button>

          {/* 4. Gacha Card */}
          <button
            onClick={() => onNavigate("gacha")}
            className="group relative flex flex-col px-3.5 pt-2.5 pb-1 bg-white rounded-[22px] border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200 ease-out text-left min-h-[125px] overflow-hidden cursor-pointer active:scale-[0.98]"
            id="home-gacha-card"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-1">
                <span className="font-black text-slate-900 text-[22px] leading-none tracking-tight">
                  今日抽卡
                </span>
                {/* 箭头改成「黑圆 + 青柠箭头」徽章 —— 参考图里不是裸 chevron，
                    是实心黑圆里的浅色箭头，直径约 15px（真实 px）。 */}
                <span className="w-[18px] h-[18px] rounded-full bg-black flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
                  <ChevronRight className="w-3 h-3 stroke-[3.5] text-[#C7F665]" />
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-none font-medium">翻牌抽免费招牌碗</p>
            </div>

            {/* 左下角标签：FREE 黑底青柠字 + 白底「惊喜多多」 */}
            <div className="absolute left-3.5 bottom-[52px] z-10 flex items-center gap-1">
              <span className="rounded-full bg-black px-1.5 py-1 text-[8px] font-black leading-none text-[#C7F665]">
                FREE
              </span>
              <span className="rounded-full bg-white px-1.5 py-1 text-[8px] font-bold leading-none text-slate-600 shadow-[0_1px_3px_rgba(15,23,42,0.14)]">
                惊喜多多
              </span>
            </div>

            {/* 插画：掀开的餐盖 + 问号牌。
                ⚠️ 原来是 `LoopingVideo`（/891.mp4 循环视频），这次换成静态图 —— 不再有动效。
                ⚠️ 尺寸 72 比上面两张卡（62）大，原因同福利中心：素材内容比例 1.06 偏方，
                   同高度下视觉宽度窄，按「视觉等大」给。 */}
            <div className="absolute -right-1 bottom-1 h-[72px] w-[100px] z-0 pointer-events-none">
              <img
                src="/entry-norm/entry-gacha.png"
                alt="今日抽卡"
                className="w-full h-full object-contain object-right-bottom pointer-events-none group-hover:scale-105 transition-transform"
              />
            </div>
          </button>
        </div>
      </div>

      {/* Section Header: "限时超值福利 LIMITED TIME" - Neon Lime Capsule Bar
          ⚠️ 高度沿革：44 → 72（按参考图 375 设备 66px × 1.093 换算）→ 54 → **46**。
          参考图那档换算出来在 410 壳里偏胖（用户：「降低高度，现在太大了」），
          说明**竖向尺寸不该跟着宽度比例缩放** —— 比例只用于宽度方向的推导。
          2026-10-19 用户再要求「减小这个组件的高度」：54 → 46（-15%）。
          内容跟着收，否则圆徽章会从占条高 59% 涨到 70%、读起来头重脚轻：
            圆徽章 32→28（占 61%）、Flame 18→16、标题 16→15、
            LIMITED TIME 10→9、按钮 24→21（py-1→py-0.5、text-xs→11px）、左右 padding 14→12。
          ⚠️ 46 时圆徽章上下各留 9px；再往下收（42）圆就得跟着到 26，否则会贴边。 */}
      <div className="px-2.5">
        <div className="w-full h-[46px] rounded-full bg-[#C7F665] px-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-[28px] h-[28px] rounded-full bg-gradient-to-tr from-amber-500 to-[#EC4899] flex items-center justify-center text-white shadow-2xs shrink-0">
              <Flame className="w-4 h-4 fill-white text-white" />
            </div>
            <span className="font-black text-black text-[15px] tracking-tight">
              限时超值福利
            </span>
            <span className="text-[9px] font-black italic text-black/65 tracking-wider ml-0.5">
              LIMITED TIME
            </span>
          </div>

          <button
            onClick={() => onNavigate("menu")}
            className="px-3 py-0.5 rounded-full bg-black text-white text-[11px] font-black flex items-center gap-0.5 hover:bg-slate-800 active:scale-95 transition-all duration-200 ease-out cursor-pointer shadow-2xs shrink-0"
          >
            <span>查看更多</span>
            <ChevronRight className="w-3 h-3 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* 2 Benefit Cards Grid: Left (Black Card) & Right (Warm Yellow Card)
          ⚠️ 参考图里没有这两个组件（截图只到「限时福利」+ 分类 tab），
             所以**尺寸没动**，只跟着全局改了左右边距与列间距。
          ⚠️ 2026-10-19 用户要求招牌卡改 **1:1**（原 192×220，比例 0.873）。
             两卡同排 + `items-stretch` → 必须**同时**改，否则被 220 那张撑回去。
             所以两张的 `min-h` 都改成 192，一行就是 192×192 的正方形。
             若哪天只想让招牌卡方、邀请卡留 220：把 grid 改成 `items-start`，
             再分别给 min-h（但两卡底边会错开，慎用）。 */}
      <div className="px-2.5">
        <div className="grid grid-cols-2 gap-x-1.5 gap-y-2 items-stretch">
          {/* Left Black Card: 招牌能量减脂餐
              2026-10-19 用户给了**整张 1:1 成品卡面**（1254×1254，胶囊/标题/碗/涂鸦全在图里），
              要求「内换成这个图 + 卡片尺寸改为 1:1」→ 整张卡就是这张图，不再用 HTML 拼。
              · 卡宽固定 192（两列 390 减 6 gap 的一半），所以 `aspect-square` = 192×192；
              · 素材 1:1 + `object-cover` → 不裁切，比例对得上才不会有黑边；
              · 圆角/裁切由卡负责（素材本身是直角满幅暗底）；
              · `alt` 保留完整文案，读屏仍能读到卖点。
              ⚠️ 素材导出：`node scripts/optimize-image.mjs <源> public/signature-card.jpg 640 88`
                 （640 = 192 × 3 DPR 再留余量；1254 原图直接用会多带 ~200KB）。
              ⚠️ 原来那套 HTML 版（青柠「镇店招牌」胶囊 + 白标题 + 圆形碗 80px + 黄色 EAT CLEAN
                 STAY COOL 涂鸦）已整段注释在下面 —— 那张是**黄字 + 更小的碗**，与这张成品图的
                 青柠字 + 满幅碗不是同一个设计，别拿它当「参考实现」去改这张图。 */}
          <div
            onClick={() => {
              if (popularDishes.length > 0) {
                onSelectDish(popularDishes[0]);
              } else {
                onNavigate("menu");
              }
            }}
            className="cursor-pointer bg-[#111111] rounded-[22px] relative overflow-hidden aspect-square shadow-sm hover:shadow-md transition-all duration-200 ease-out group active:scale-[0.98]"
            id="home-signature-card"
          >
            <img
              src="/signature-card.jpg"
              alt="招牌能量减脂餐 · 高蛋白慢碳 · 营养师科学控卡"
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            />
          </div>

          {/* ── 旧版 HTML 卡面（2026-10-19 被上面那张成品图取代，留作回退）────────
          <div
            className="cursor-pointer bg-[#111111] rounded-[22px] p-3.5 text-white relative overflow-hidden flex flex-col justify-between min-h-[220px] shadow-sm hover:shadow-md transition-all duration-200 ease-out group active:scale-[0.98]"
            id="home-signature-card"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-[#C7F665] text-black text-[11px] font-black tracking-tight">镇店招牌</span>
                <span className="px-2 py-0.5 rounded-full bg-white/15 text-white text-[11px] font-bold backdrop-blur-xs">精选热卖</span>
              </div>
              <h4 className="font-black text-white text-base tracking-tight mt-2 leading-snug">招牌能量减脂餐</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium leading-tight">高蛋白慢碳 · 营养师科学控卡</p>
            </div>
            <div className="flex items-end justify-between mt-2 pt-1">
              <div className="w-22 h-22 rounded-full overflow-hidden border-2 border-white/20 shadow-md flex-shrink-0 bg-slate-800">
                <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80" alt="招牌能量减脂餐" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col items-center justify-center pr-1 select-none pointer-events-none pb-1">
                <svg className="w-5 h-4 text-[#FACC15] fill-current mb-0.5" viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" /></svg>
                <span className="font-black text-[#FACC15] text-xs leading-none tracking-tight transform rotate-2">EAT</span>
                <span className="font-black text-[#FACC15] text-xs leading-none tracking-tight transform -rotate-1 mt-0.5">CLEAN</span>
                <span className="font-black text-[#FACC15] text-xs leading-none tracking-tight transform rotate-1 mt-0.5">STAY</span>
                <span className="font-black text-[#FACC15] text-xs leading-none tracking-tight transform -rotate-2 mt-0.5">COOL!</span>
              </div>
            </div>
          </div>
          ─────────────────────────────────────────────────────────────── */}

          {/* Right Warm Yellow Card: 邀请新人享免单
              2026-10-19 与招牌卡同样处理：用户给了**整张 1:1 成品卡面**（1920×1920，
              「新人免单」橙胶囊 / 0元享 / 标题 / 副标题 / 青柠「立即邀请」按钮 /
              GOOD FRIENDS HEALTHY LIFE! / 皇冠兔吉祥物，全在图里）→ 整张卡就是这张图。
              · 卡宽 192 → `aspect-square` = 192×192，和左边招牌卡对齐成一行正方形；
              · 素材 1:1 + `object-cover` → 不裁切；
              · 圆角由卡负责（素材是直角米黄满幅底）。
              ⚠️ 素材导出：`node scripts/optimize-image.mjs <源> public/invite-card.jpg 640 88`
                 （1920 原图直接进包会多带 ~300KB，640 已够 192×3 DPR）。
              ⚠️ 旧的 HTML 版（橙胶囊 + 标题 + 青柠按钮 + `/mascot_invite.png` 吉祥物）
                 整段注释在下面 —— 那张的吉祥物是**绿色手掌**，这张成品图是**皇冠兔子**，
                 不是同一个角色，别拿旧的当参考。
              ⚠️ 旧版里的「立即邀请」是嵌套 `<button>`（stopPropagation 后再开弹窗）；
                 换成整图后没有内层按钮了，点卡任意位置都走外层 `onClick` → 行为一致。 */}
          <div
            onClick={() => setModalType("invite")}
            className="cursor-pointer bg-[#FFFDF0] rounded-[22px] relative overflow-hidden aspect-square shadow-sm hover:shadow-md transition-all duration-200 ease-out group active:scale-[0.98]"
            id="home-invite-card"
          >
            <img
              src="/invite-card.jpg"
              alt="邀请新人享免单 · 好友首单立享 0 元起"
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            />
          </div>

          {/* ── 旧版 HTML 卡面（2026-10-19 被上面那张成品图取代，留作回退）────────
          <div
            className="cursor-pointer bg-gradient-to-b from-[#FFFDF0] via-[#FFFBE8] to-[#FFF3C4] rounded-[22px] p-3.5 border border-[#FDE68A]/70 relative overflow-hidden flex flex-col justify-between min-h-[192px] shadow-sm hover:shadow-md transition-all duration-200 ease-out group active:scale-[0.98]"
            id="home-invite-card"
          >
            <div className="absolute top-2.5 right-2.5 flex flex-col items-end pointer-events-none select-none z-10 leading-none">
              <span className="font-black text-slate-900 text-[8.5px] tracking-tight">GOOD</span>
              <span className="font-black text-slate-900 text-[8.5px] tracking-tight mt-0.5">FRIENDS</span>
              <span className="font-black text-slate-900 text-[8.5px] tracking-tight mt-0.5">HEALTHY</span>
              <span className="font-black text-slate-900 text-[8.5px] tracking-tight mt-0.5">LIFE!</span>
              <span className="text-slate-900 text-[9px] font-bold mt-0.5">♡</span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-1">
                <span className="px-2 py-0.5 rounded-full bg-[#FF9800] text-white text-[11px] font-black tracking-tight shadow-2xs">新人免单</span>
                <span className="text-xs font-black text-[#FF9800] ml-0.5">0元享</span>
              </div>
              <h4 className="font-black text-slate-900 text-base tracking-tight mt-2 leading-snug">邀请新人享免单</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium leading-tight">好友首单立享 0 元起</p>
              <button className="mt-2.5 px-3 py-1 rounded-full bg-[#C7F665] text-black font-black text-xs inline-flex items-center gap-0.5 shadow-2xs">立即邀请</button>
            </div>
            <div className="absolute -bottom-1 -right-1 w-32 h-28 pointer-events-none select-none overflow-hidden z-0">
              <img src="/mascot_invite.png" alt="邀请新人享免单" className="w-full h-full object-contain object-bottom-right" />
            </div>
          </div>
          ─────────────────────────────────────────────────────────────── */}
        </div>
      </div>

      {/* Popular Menu Dishes Grid
          ⚠️ 参考图截图没滚到这里，基础卡片尺寸跟随全局边距/列间距。
          2026-10-18 按用户参考图最终定稿「白卡 + 青柠 HOT + 黑底 kcal」造型
          （详见 grid 内注释）；中间做过的深色卡版本已被用户否决，勿回退。 */}
      <div className="px-2.5" id="home-popular-dishes-section">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <div className="w-4.5 h-4.5 rounded-full bg-slate-900 text-[#C7F665] flex items-center justify-center shadow-2xs border border-[#C7F665]/30 shrink-0">
              <Sparkles className="w-3 h-3 stroke-[2.2]" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-[15px] tracking-tight whitespace-nowrap">
              人气当季轻食
            </h3>
          </div>
          <button
            onClick={() => onNavigate('menu')}
            className="text-xs text-slate-500 font-bold hover:text-slate-800 flex items-center gap-0.5 whitespace-nowrap transition-colors duration-200 ease-out cursor-pointer active:scale-95"
          >
            <span>全部菜单</span>
            <ChevronRight className="w-3 h-3 stroke-[2]" />
          </button>
        </div>

        {/* Popular Menu Dishes Grid
            2026-10-18 按参考图实测尺寸定稿（参考图单卡裁切放大后量得 190×200）：
            · 图片区 h-[100px]（约占卡高一半），顶部圆角裁剪
            · HOT 是**贴左上角的青柠圆角块**（左/上贴边，右下大圆角），不是悬浮胶囊
            · kcal 是**小圆角黑底块**（rounded-md，非全圆），橙火焰白字
            · 内容区 px-3 pt-3 pb-3；菜名 13px 黑；标签浅灰底全圆胶囊
            · 价格黑色（参考图如此，覆盖正红规范）
            · 加号 28px 青柠圆，**在卡内右下**（不是骑跨边缘）
            ⚠️ 深色卡版本被用户否决过两次返工，勿回退。 */}
        <div className="grid grid-cols-2 gap-x-1.5 gap-y-2">
          {popularDishes.map((dish) => (
            <div
              key={dish.id}
              onClick={() => onSelectDish(dish)}
              className="group relative cursor-pointer bg-white rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 ease-out flex flex-col overflow-hidden text-left active:scale-[0.98]"
            >
              {/* Dish Image */}
              <div className="relative h-24 w-full overflow-hidden bg-slate-100">
                <DishImage
                  src={dish.image}
                  alt={dish.name}
                  category={dish.category}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* HOT：贴左上角的青柠块 */}
                <span className="absolute left-0 top-0 flex items-center gap-1 rounded-br-xl bg-[#C7F665] px-2 py-1 text-[10px] font-black leading-none text-black">
                  HOT
                  <Flame className="h-2.5 w-2.5 fill-black text-black" />
                </span>
                {/* kcal：小圆角黑底块 */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black px-2 py-1 text-[10.5px] font-bold leading-none text-white">
                  <Flame className="h-3 w-3 shrink-0 fill-orange-400 text-orange-400" />
                  <span>{dish.kcal} kcal</span>
                </div>
              </div>

              {/* Dish Body */}
              <div className="flex-1 px-3 pt-2 pb-2.5">
                <h4 className="truncate whitespace-nowrap text-[13px] font-black leading-tight text-slate-900 transition-colors group-hover:text-[#54801A]">
                  {dish.name}
                </h4>
                <p className="mt-0.5 truncate whitespace-nowrap text-[10px] font-medium leading-tight text-slate-400">
                  {dish.subtitle || dish.description}
                </p>

                <div className="mt-1.5 flex items-center gap-1 overflow-hidden whitespace-nowrap">
                  {dish.tags.slice(0, 2).map((tag, idx) => (
                    <DishTag key={idx}>{tag}</DishTag>
                  ))}
                </div>

                <div className="mt-1.5 flex items-baseline gap-0.5 whitespace-nowrap">
                  <span className="text-[10px] font-bold text-[#E60012]">¥</span>
                  <span className="text-[15px] font-black leading-none text-[#E60012]">
                    {dish.dealPrice.toFixed(1)}
                  </span>
                  {dish.originalPrice && (
                    <span className="ml-1 text-[9px] text-slate-400 line-through">
                      ¥{dish.originalPrice}
                    </span>
                  )}
                </div>

                {/* 加号：卡内右下 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectDish(dish);
                  }}
                  className="absolute bottom-2 right-2.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#C7F665] text-black shadow-xs transition-all duration-200 ease-out hover:bg-[#B7EF4B] active:scale-95"
                  aria-label={`查看详情：${dish.name}`}
                >
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                </button>
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
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl overflow-hidden border border-slate-100 text-center"
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
                    className="w-full py-3 rounded-xl bg-slate-900 text-[#C7F665] font-black text-sm hover:bg-black active:scale-[0.98] transition-all duration-200 ease-out flex items-center justify-center gap-1.5 shadow-md border border-[#C7F665]/30"
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
                    className="w-full py-3 rounded-xl bg-[#54801A] text-white font-black text-sm hover:bg-[#26430B] active:scale-[0.98] transition-all duration-200 ease-out flex items-center justify-center gap-1.5 shadow-md"
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
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl overflow-hidden border border-slate-100 text-center"
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
                      : 'bg-slate-900 text-[#C7F665] hover:bg-black active:scale-95 transition-all duration-200 ease-out'
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
                  className="w-full py-3 rounded-xl bg-amber-500 text-white font-black text-sm hover:bg-amber-600 active:scale-[0.98] transition-all duration-200 ease-out flex items-center justify-center gap-1.5 shadow-md"
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
                    className="w-full py-3 rounded-xl bg-amber-300 text-[#831843] font-black text-sm hover:bg-amber-400 active:scale-[0.98] transition-all duration-200 ease-out flex items-center justify-center gap-1.5 shadow-lg"
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
                    className="w-full py-3 rounded-xl bg-white text-[#DB2777] font-black text-sm hover:bg-[#FDD3EA] active:scale-[0.98] transition-all duration-200 ease-out flex items-center justify-center gap-1.5 shadow-lg"
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

