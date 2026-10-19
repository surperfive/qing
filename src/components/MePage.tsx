import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { UserProfile, Coupon } from '../types';
import {
  Settings,
  Star,
  ChevronRight,
  Headphones,
  FileText,
  Store,
  Building2,
  Gift,
  CreditCard,
  ChevronDown,
  Activity,
  MapPin,
  LogOut,
  Share2,
  CircleDot,
  Target
} from 'lucide-react';

/** 与开屏 / 弹窗一致的缓出曲线：起步快、收尾稳，展开收起不“弹” */
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface MePageProps {
  user: UserProfile;
  ordersCount: number;
  favsCount: number;
  coupons: Coupon[];
  onNavigate: (tab: string) => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onShowToast: (msg: string) => void;
  onOpenNutritionReport: () => void;
  onOpenHealthPlan: () => void;
}

/* ============================================================================
   「我的」页 —— 高保真复刻参考图
   ---------------------------------------------------------------------------
   结构（自上而下）：
     ① 青柠头部：圆形黑边头像 / 超大用户名 / 黑底黄星会员胶囊 / 右上角四枚控件
        / 右侧吉祥物位（待补 jpg）+ 手写体 Good Food Better You / 黑色涂鸦
     ② 立省¥35 黑胶囊（压在白卡左上角）+ 白色大圆角资产卡（4 列）
     ③ 我的订单（青柠底大卡）+ 服务中心（白卡）并排
     ④ 我的功能（白卡，圆形青柠底图标 ×5 + 展开全部青柠胶囊）
     ⑤ 邀请好友（黑卡 + NEW 青柠斜标签）
     ⑥ 送礼品卡（白卡，Special 青柠底 / Classic 黑底）
     ⑦ 退出登录

   ⚠️ 插画位：`.mascot-slot` / `.order-art-slot` / `.invite-art-slot`
      三处是参考图里的插画（吉祥物、餐盒、邀请插画），已按参考图尺寸预留空位，
      等用户提供 jpg 后直接塞进去即可，不要用代码画。
   ============================================================================ */

/** 参考图里反复出现的黑色手绘涂鸦短线，用同一枚 SVG 复用 */
const Doodle: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 40 24" className={className} fill="none" aria-hidden="true">
    <path
      d="M4 18 L9 6 M13 20 L16 4 M22 19 L27 7 M31 21 L36 9"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
    />
  </svg>
);

/** 四角星贴纸 */
const Star4: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 0 C12 6 18 12 24 12 C18 12 12 18 12 24 C12 18 6 12 0 12 C6 12 12 6 12 0 Z" />
  </svg>
);

/** 头像左上角的黑色皇冠装饰 */
const Crown: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 26 20" className={className} fill="currentColor" aria-hidden="true">
    <path d="M1 18 L3.5 5 L9.5 11 L13 1.5 L16.5 11 L22.5 5 L25 18 Z" />
  </svg>
);

export const MePage: React.FC<MePageProps> = ({
  user,
  ordersCount,
  favsCount,
  coupons,
  onNavigate,
  onOpenLogin,
  onLogout,
  onShowToast,
  onOpenNutritionReport,
  onOpenHealthPlan
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const reduceMotion = useReducedMotion();

  /** 资产卡四列数据，按参考图顺序 */
  const assets = [
    {
      value: user.isLoggedIn ? coupons.length : 0,
      unit: '张',
      label: '优惠券',
      onClick: () => {
        if (!user.isLoggedIn) onOpenLogin();
        else onShowToast(`🎟️ 您当前拥有 ${coupons.length} 张可用优惠券`);
      }
    },
    {
      value: user.isLoggedIn ? 2 : 0,
      unit: '张',
      label: '咖啡卡券',
      onClick: () => onShowToast('☕ 咖啡卡券专区：已开通全国门店通用饮品兑换')
    },
    {
      value: user.isLoggedIn ? 1 : 0,
      unit: '张',
      label: '好运卡',
      onClick: () => onNavigate('gacha')
    },
    {
      value: 0,
      unit: '元',
      label: '余额',
      onClick: () => onShowToast(`💰 当前账户余额：¥${user.isLoggedIn ? '0.00' : '0'} 元`)
    }
  ];

  /** 「我的功能」主区 5 项 —— 参考图：圆形青柠底 + 黑色线性图标 */
  const features = [
    { icon: Store, label: '招商加盟', toast: '🏢 招商加盟专线：021-8888-6666（全国轻食连锁合作）' },
    { icon: Building2, label: '租赁合作', toast: '💼 场地租赁与企业团餐：支持园区专柜/智能无人柜入驻' },
    { icon: Gift, label: '兑换优惠', toast: '🎁 口令兑换：输入您的优惠兑换码即可领取轻食礼包' },
    { icon: CreditCard, label: '礼品卡', toast: '💳 电子礼品卡：全国轻食与现磨咖啡通兑包' }
  ];

  /** 「我的功能」展开区 */
  const moreFeatures = [
    { icon: Activity, label: '营养档案', action: onOpenNutritionReport },
    { icon: MapPin, label: '地址管理', toast: '📍 配送地址管理：上海市静安区南京西路1601号越洋广场' },
    { icon: FileText, label: '隐私协议', toast: '📜 平台隐私政策与服务协议已生效' }
  ];

  return (
    <div className="w-full min-h-full bg-[#F4F6F9] text-slate-900 pb-28 select-none">
      {/* ═══════════════ ① 青柠头部 ═══════════════ */}
      <div className="relative overflow-hidden bg-[#C7F665] px-4 pt-3 pb-12">
        {/* 左上角黑色涂鸦 */}
        <Doodle className="absolute left-2 top-1.5 w-10 h-6 text-black" />
        {/* 右上角四角星 */}
        <Star4 className="absolute right-[152px] top-[86px] w-3.5 h-3.5 text-black" />

        {/* 吉祥物插画位（待补 jpg，参考图约 150×120） */}
        <div className="mascot-slot absolute right-0 top-[54px] h-[110px] w-[140px]" />

        {/* 手写体标语 —— 参考图里是写在吉祥物身上的 */}
        <div className="pointer-events-none absolute right-[58px] top-[68px] w-[80px]">
          <p className="text-[11px] font-black italic leading-[1.15] text-black">
            Good Food
            <br />
            Better You .
          </p>
        </div>

        {/* 顶部控件条：齿轮 / 4.9分 / ··· / 相机 */}
        <div className="relative z-10 flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onShowToast('⚙️ 设置中心：消息通知与隐私设置已更新')}
            className="flex h-7.5 w-7.5 items-center justify-center rounded-full bg-black text-white shadow-2xs transition-all duration-200 ease-out hover:bg-black/80 active:scale-95"
            title="设置"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>

          <div className="flex items-center gap-1 rounded-full bg-black px-2.5 py-1 shadow-2xs">
            <Star className="h-3 w-3 fill-[#FFD24A] text-[#FFD24A]" />
            <span className="text-[11px] font-black text-white">4.9分</span>
          </div>

          <div className="flex items-center rounded-full bg-black px-2.5 py-1 shadow-2xs">
            <span className="px-0.5 text-[12px] font-black leading-none text-white">···</span>
            <span className="mx-1.5 h-3 w-px bg-white/30" />
            <CircleDot className="mx-0.5 h-3.5 w-3.5 text-[#C7F665]" />
          </div>
        </div>

        {/* 用户行：圆形黑边头像 + 用户名 + 会员胶囊 + 副标题 */}
        <div
          onClick={user.isLoggedIn ? undefined : onOpenLogin}
          className={`relative z-10 mt-1.5 flex items-start gap-3 ${
            !user.isLoggedIn ? 'cursor-pointer group' : ''
          }`}
        >
          {/* 圆形头像：白色粗环 + 细黑外圈 + 左上角皇冠（参考图样式） */}
          <div className="relative h-[72px] w-[72px] flex-shrink-0 rounded-full border border-black/70 bg-white p-[3px] shadow-2xs">
            <Crown className="absolute -left-1.5 -top-3 z-10 h-4 w-5.5 rotate-[-8deg] text-black" />
            <div className="h-full w-full overflow-hidden rounded-full bg-black">
              {user.isLoggedIn ? (
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center">
                  <div className="mt-1 flex w-9 justify-between px-0.5">
                    <span className="h-3 w-2.5 -rotate-12 rounded-t-full bg-[#C7F665]" />
                    <span className="h-3 w-2.5 rotate-12 rounded-t-full bg-[#C7F665]" />
                  </div>
                  <div className="mt-1 flex items-center gap-1 rounded-lg bg-zinc-900 px-2 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C7F665]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C7F665]" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1 pr-[100px] pt-0.5">
            <h1 className="truncate text-[25px] font-black leading-none tracking-[-0.02em] text-black">
              {user.isLoggedIn ? user.name : '登录 / 注册'}
            </h1>

            {user.isLoggedIn && (
              <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-black px-2.5 py-[3px] shadow-2xs">
                <Star className="h-3 w-3 fill-[#FFD24A] text-[#FFD24A]" />
                <span className="text-[11.5px] font-black leading-none text-white">{user.level}</span>
              </div>
            )}

            {/* 副标题 + 黑色手绘下划线（下划线宽度跟着文字，不撑满容器） */}
            <div className="relative mt-1.5 inline-block">
              <p className="whitespace-nowrap text-[12px] font-black leading-tight text-black">
                {user.isLoggedIn
                  ? `健康轻食探索第 42 天 · 尾号 ${user.phone.slice(-4)}`
                  : '开启元气营养轻食生活 🥗'}
              </p>
              <svg
                viewBox="0 0 120 6"
                className="absolute -bottom-1 left-0 h-1.5 w-full text-black"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M1 4 C22 1.5 44 5 66 2.5 C86 0.5 104 4.5 119 2"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {!user.isLoggedIn && (
          <button
            type="button"
            onClick={onOpenLogin}
            className="relative z-10 mt-3 rounded-full bg-black px-4 py-1.5 text-xs font-black text-[#C7F665] shadow-xs transition-all duration-200 ease-out hover:bg-black/90 active:scale-95"
          >
            去登录
          </button>
        )}
      </div>

      {/* ═══════════════ ② 资产卡 ═══════════════ */}
      <div className="relative z-20 -mt-9 px-3.5">
        <div className="relative">
          {/* 立省¥35：黑胶囊压在白卡左上角 */}
          <span className="absolute -top-2.5 left-3 z-10 inline-block rounded-full bg-black px-2.5 py-1 text-[10px] font-black leading-none text-white shadow-2xs">
            {user.isLoggedIn ? '立省¥35' : '登录领券'}
          </span>

          <div className="flex items-stretch rounded-[26px] bg-white px-1.5 pt-3.5 pb-3 shadow-xs">
            {assets.map((a, i) => (
              <React.Fragment key={a.label}>
                {i > 0 && <span className="my-1 w-px shrink-0 self-stretch bg-slate-200/80" />}
                <button
                  type="button"
                  onClick={a.onClick}
                  className="group flex flex-1 cursor-pointer flex-col items-center justify-end active:scale-95 transition-all duration-200 ease-out"
                >
                  <div className="text-[27px] font-black leading-none tracking-[-0.02em] text-black">
                    {a.value}
                    <span className="ml-0.5 text-[11.5px] font-black text-black">{a.unit}</span>
                  </div>
                  <span className="mt-1 text-[12.5px] font-black text-black">{a.label}</span>
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════ 主内容 ═══════════════ */}
      <div className="relative z-20 mt-3.5 space-y-3.5 px-3.5">
        {/* ③ 我的订单 + 服务中心 */}
        <div className="grid grid-cols-12 gap-3">
          {/* 我的订单 —— 整张卡面图（青柠底 + 大标题 + 副标题 + 黑色「去登录」胶囊 + 3D 剪贴板，全在图里）
              ⚠️ 尺寸：卡是 `col-span-7` = 217.8 宽；同排「服务中心」内容自然高 132，靠 grid 默认的
                 `items-stretch` 把这张卡也撑到 132。所以**不能用 `aspect-`**（会和 132 打架），
                 图片用 `absolute inset-0` + `object-cover` 铺满，让卡高始终跟随服务中心。
              ⚠️ 素材 1024×572（比例 1.79），卡 217.8×132（1.65）→ cover 按高度铺满，
                 左右各裁 9.25px（3.9%）：标题左边缘落在距卡左 14.2px（旧版 padding 是 16，几乎一致），
                 剪贴板右边缘只被裁 0.4%（0.9px），肉眼不可见。**别再改成 object-contain**，
                 素材青柠 #B4F31C 和品牌 #C7F665 不同，留边会露出两条色差带。
              ⚠️ 卡 bg 特意写成素材同色 #B4F31C，只为圆角抗锯齿时缝隙不露白/露品牌青柠。
              ⚠️ 素材是**未登录态**文案（登录后获取订单信息 / 去登录），而页面默认是已登录，
                 所以这张卡不再随 `user.isLoggedIn` 变文案 —— 静态图的固有限制。
              ⚠️ 旧 HTML 版（青柠底 + 17px 标题 + 副标题 + 黑胶囊按钮 + 涂鸦 + `.order-art-slot`
                 餐盒插画位）注释在下方，**没进过 git，别删**；回退就是把这段换回去。 */}
          <div
            onClick={() => {
              if (!user.isLoggedIn) onOpenLogin();
              else onNavigate('orders');
            }}
            className="relative col-span-7 cursor-pointer overflow-hidden rounded-[24px] bg-[#B4F31C] shadow-xs transition-all duration-200 hover:shadow-md active:scale-[0.98]"
          >
            <img
              src="/me-order-card.jpg"
              alt={
                user.isLoggedIn
                  ? `我的订单 · ${ordersCount > 0 ? `您有 ${ordersCount} 笔轻食订单` : '暂无进行中订单'}`
                  : '我的订单 · 登录后获取订单信息'
              }
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          {/*
          ── 旧版 HTML 卡面（青柠底 + 标题 + 副标题 + 黑胶囊按钮 + 涂鸦 + 餐盒插画位）──
          <div
            onClick={() => {
              if (!user.isLoggedIn) onOpenLogin();
              else onNavigate('orders');
            }}
            className="relative col-span-7 flex cursor-pointer flex-col justify-between overflow-hidden rounded-[24px] bg-[#C7F665] p-4 shadow-xs transition-all duration-200 hover:shadow-md active:scale-[0.98]"
          >
            <Doodle className="absolute right-3 bottom-3 w-7 h-4 text-black/70" />

            <div className="relative z-10">
              <div className="flex items-center text-[17px] font-black leading-none text-black">
                <span>我的订单</span>
                <ChevronRight className="h-4.5 w-4.5 stroke-[3.2]" />
              </div>
              <p className="mt-2 max-w-[120px] text-[11.5px] font-bold leading-tight text-black/75">
                {user.isLoggedIn
                  ? ordersCount > 0
                    ? `您有 ${ordersCount} 笔轻食订单`
                    : '暂无进行中订单'
                  : '登录后获取订单信息'}
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!user.isLoggedIn) onOpenLogin();
                else onNavigate('orders');
              }}
              className="relative z-10 mt-4 flex w-fit items-center gap-0.5 rounded-full bg-black px-3.5 py-2 text-[11.5px] font-black text-white transition-all duration-200 ease-out active:scale-95"
            >
              <span>{user.isLoggedIn ? '查看订单' : '去登录'}</span>
              <ChevronRight className="h-3.5 w-3.5 stroke-[3]" />
            </button>

            <div className="order-art-slot absolute bottom-1 right-1 h-[76px] w-[104px]" />
          </div>
          ── 旧版结束 ──
          */}

          {/* 服务中心 —— 白卡 */}
          <div className="relative col-span-5 flex flex-col rounded-[24px] bg-white p-4 shadow-xs">
            <Star4 className="absolute right-3 top-3 h-3.5 w-3.5 text-[#C7F665]" />
            <div className="flex items-center text-[15px] font-black leading-none text-black">
              <span>服务中心</span>
              <ChevronRight className="h-4 w-4 stroke-[3]" />
            </div>

            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={() => onShowToast('🎧 在线客服已连接（工作时间 08:00 - 22:30）')}
                className="group flex w-full items-center justify-between text-[12px] font-bold text-black transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C7F665] text-black">
                    <Headphones className="h-[15px] w-[15px] stroke-[2.4]" />
                  </span>
                  <span>客服中心</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 stroke-[2.8] text-slate-300 group-hover:text-black" />
              </button>

              <button
                type="button"
                onClick={() => onShowToast('🧾 电子发票开具：支持按月自动开票与数电发票')}
                className="group flex w-full items-center justify-between text-[12px] font-bold text-black transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C7F665] text-black">
                    <FileText className="h-[15px] w-[15px] stroke-[2.4]" />
                  </span>
                  <span>发票管理</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 stroke-[2.8] text-slate-300 group-hover:text-black" />
              </button>
            </div>
          </div>
        </div>

        {/* ④ 我的功能 */}
        <div className="rounded-[24px] bg-white p-4 shadow-xs">
          <div className="mb-3.5 flex items-center justify-between">
            <h3 className="text-[17px] font-black leading-none text-black">我的功能</h3>
            <motion.button
              type="button"
              layout
              whileTap={{ scale: 0.95 }}
              transition={{ duration: reduceMotion ? 0 : 0.3, ease: EASE_OUT }}
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              aria-controls="me-more-features"
              className="flex items-center gap-0.5 overflow-hidden rounded-full bg-[#C7F665] px-3 py-1.5 text-[11px] font-black text-black transition-colors duration-200 ease-out"
            >
              <span className="whitespace-nowrap">{isExpanded ? '收起' : '展开全部'}</span>
              <motion.span
                className="flex"
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.3, ease: EASE_OUT }}
              >
                <ChevronDown className="h-3.5 w-3.5 stroke-[3]" />
              </motion.span>
            </motion.button>
          </div>

          {/* 圆形青柠底图标 */}
          <div className="grid grid-cols-5 gap-1 text-center">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.label}
                  type="button"
                  onClick={() => onShowToast(f.toast)}
                  className="group flex cursor-pointer flex-col items-center py-1 active:scale-95 transition-all duration-200 ease-out"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#C7F665] text-black transition-all duration-200 ease-out group-hover:scale-105 group-active:scale-95">
                    <Icon className="h-5 w-5 stroke-[2.2]" />
                  </div>
                  <span className="mt-1.5 text-[11px] font-black text-black">{f.label}</span>
                </button>
              );
            })}

            {/* 健康计划（弹窗，组件在 App 层渲染） */}
            <button
              type="button"
              onClick={onOpenHealthPlan}
              className="group flex cursor-pointer flex-col items-center py-1 active:scale-95 transition-all duration-200 ease-out"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#C7F665] text-black transition-all duration-200 ease-out group-hover:scale-105 group-active:scale-95">
                <Target className="h-5 w-5 stroke-[2.2]" />
              </div>
              <span className="mt-1.5 text-[11px] font-black text-black">健康计划</span>
            </button>
          </div>

          {/* 展开区 —— 高度 0→auto 缓动，内部图标错峰上浮，收起时同步回收 */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                key="more-features"
                id="me-more-features"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  height: { duration: reduceMotion ? 0 : 0.42, ease: EASE_OUT },
                  opacity: { duration: reduceMotion ? 0 : 0.24, ease: 'easeOut' },
                }}
                className="overflow-hidden"
              >
                <div className="mt-3 grid grid-cols-5 gap-1 border-t border-slate-100 pt-3 text-center">
                  {moreFeatures.map((f, index) => {
                    const Icon = f.icon;
                    return (
                      <motion.button
                        key={f.label}
                        type="button"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: reduceMotion ? 0 : 0.32,
                          delay: reduceMotion ? 0 : 0.06 + index * 0.05,
                          ease: EASE_OUT,
                        }}
                        onClick={() =>
                          f.action ? f.action() : onShowToast(f.toast as string)
                        }
                        className="group flex cursor-pointer flex-col items-center py-1 active:scale-95 transition-all duration-200 ease-out"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#C7F665] text-black transition-all duration-200 ease-out group-hover:scale-105 group-active:scale-95">
                          <Icon className="h-5 w-5 stroke-[2.2]" />
                        </div>
                        <span className="mt-1.5 text-[11px] font-black text-black">{f.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ⑤ 邀请好友 —— 2026-10-19 换成用户给的「邀请好友 得 9.9元」banner
            沿革：黑卡 + NEW 斜标签 + `invite-art-slot` 空插画位
                 → 2026-10-15 `/invite-card.png`（那张画的其实是「我的订单·您有 2 笔」）
                 → 2026-10-19 `/invite-banner.png`（现在这张，才是真的邀请好友）
            ⚠️ 为什么是**透明底 PNG** 而不是裁好边就完事：
               素材 1024×447 里黑卡只有 991×190，但**吉祥物的耳朵/皇冠高出卡片上边缘 54px**，
               NEW 斜标签也向左探出卡片 14px，两者都压在白底上。按卡片裁 → 皇冠被削平；
               按内容裁 → 卡片上方留白边，而页面底色是 #F4F6F8，白边一眼可见。
               所以 `scripts/make-invite-banner.mjs` 从四边 flood fill 把白底抠透明（阈值 240，
               只清外部，卡内的白字/高光不受影响），再按内容包围盒导出 764×186。
            ⚠️ 容器**不能加 `overflow-hidden` / `rounded-[24px]` / `shadow-xs`**：
               会把出界的吉祥物裁掉，`shadow-xs` 还会画出一个矩形阴影（形状对不上）。
               卡片自身的圆角已经烘在图里（≈7.6px 渲染值，比页面其它卡的 24px 方一点，
               这是素材固有色，要统一得重绘素材）。
            ⚠️ 382 宽卡位里渲染成 382×93（黑卡本体约 72 高）。吉祥物向上出界约 21px，
               和上面「我的功能」的 14px 间距会有约 7px 重叠 —— DOM 顺序在后，会盖在上层，看着是压叠效果。
            `public/invite-card.png` 保留未删，回退改 src 即可。 */}
        <div
          onClick={() => onShowToast('🎉 邀请链接已复制，好友首单立享 9.9 元新人特权！')}
          className="cursor-pointer select-none transition-all duration-200 active:scale-[0.98]"
        >
          <img
            src="/invite-banner.png"
            alt="邀请好友 得 9.9 元 · 新朋友首餐享专属福利"
            className="block h-auto w-full"
            draggable={false}
          />
        </div>

        {/* ⑥ 送礼品卡 */}
        <div className="rounded-[24px] bg-white p-4 shadow-xs">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[17px] font-black leading-none text-black">送礼品卡</h3>
            <button
              type="button"
              onClick={() => onShowToast('🎁 礼品卡商城：支持微信一键赠礼与企业大额采购')}
              className="flex items-center text-[11.5px] font-bold text-slate-500 transition-colors hover:text-black"
            >
              <span>查看全部</span>
              <ChevronRight className="h-3.5 w-3.5 stroke-[2.8]" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Special —— 青柠底 */}
            <div
              onClick={() => onShowToast('💝 已选择【元气轻享卡·¥50】，可直接赠送好友！')}
              className="group flex cursor-pointer flex-col items-center active:scale-95 transition-all duration-200 ease-out"
            >
              <div className="relative flex aspect-16/10 w-full flex-col justify-between overflow-hidden rounded-[18px] bg-gradient-to-br from-[#E4F8BC] via-[#C7F665] to-[#B7EF4B] p-2.5 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
                <div className="z-10 flex items-start justify-between">
                  <span className="rounded-md bg-white px-2 py-0.5 text-[9px] font-black text-black">
                    Special
                  </span>
                  <Star4 className="h-3.5 w-3.5 text-black/70" />
                </div>
                <div className="z-10 my-auto flex items-center justify-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-black">
                    <Gift className="h-4.5 w-4.5 stroke-[2.2]" />
                  </div>
                </div>
                <div className="z-10 flex items-end justify-between text-[9px]">
                  <span className="font-black text-black">Fresh Light</span>
                  <span className="font-black text-black">¥50 面值</span>
                </div>
              </div>
              <span className="mt-1.5 text-[12px] font-black text-black">元气轻享卡</span>
            </div>

            {/* Classic —— 黑底 */}
            <div
              onClick={() => onShowToast('☕ 已选择【心动特饮卡·¥100】，可直接赠送好友！')}
              className="group flex cursor-pointer flex-col items-center active:scale-95 transition-all duration-200 ease-out"
            >
              <div className="relative flex aspect-16/10 w-full flex-col justify-between overflow-hidden rounded-[18px] bg-black p-2.5 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
                <div className="z-10 flex items-start justify-between">
                  <span className="rounded-md bg-[#C7F665] px-2 py-0.5 text-[9px] font-black text-black">
                    Classic
                  </span>
                  <Share2 className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="z-10 my-auto flex items-center justify-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-[#C7F665]">
                    <Gift className="h-4.5 w-4.5 stroke-[2.2]" />
                  </div>
                </div>
                <div className="z-10 flex items-end justify-between text-[9px]">
                  <span className="font-bold text-white">Fresh Light</span>
                  <span className="font-black text-[#C7F665]">¥100 面值</span>
                </div>
              </div>
              <span className="mt-1.5 text-[12px] font-black text-black">心动特饮卡</span>
            </div>
          </div>
        </div>

        {/* ⑦ 退出登录 */}
        {user.isLoggedIn && (
          <div className="pt-1">
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center justify-center gap-1.5 rounded-full bg-white py-3 text-xs font-black text-black transition-all duration-200 ease-out hover:bg-black hover:text-[#C7F665] active:scale-[0.98]"
            >
              <LogOut className="h-4 w-4 stroke-[2.5]" />
              <span>退出登录 / 切换账号</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
