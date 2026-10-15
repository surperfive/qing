import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dish, OrderMode } from '../types';
import { FoodCutoutRenderer } from './FoodCutoutRenderer';
import { getDishIngredientMeta } from '../utils/ingredientBackdrops';
import {
  ChevronLeft,
  Heart,
  Plus,
  Minus,
  Sparkles,
  CupSoda,
  Coffee,
  Salad,
  CircleDot,
  Share2,
  ShieldCheck,
  Leaf,
  CheckCircle2,
  Clock,
  Store,
  Award,
  Zap,
  Info,
  Flame,
  Layers,
  X,
  ReceiptText,
  BadgePercent,
  ArrowRight
} from 'lucide-react';

interface ProductDetailPageProps {
  dish: Dish;
  onBack: () => void;
  onAddToCart: (dish: Dish, quantity?: number) => void;
  onBuyNow: (dish: Dish, quantity?: number) => void;
  isFav: boolean;
  onToggleFav: (dishId: number) => void;
  onShowToast: (msg: string) => void;
  orderMode?: OrderMode;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  dish,
  onBack,
  onAddToCart,
  onBuyNow,
  isFav,
  onToggleFav,
  onShowToast,
  orderMode = 'takeout'
}) => {
  // Option state
  const [size, setSize] = useState<'regular' | 'large'>('regular');
  const [temperature, setTemperature] = useState<'ice' | 'hot'>('ice');
  const [beanBase, setBeanBase] = useState<'blend' | 'dark' | 'special'>('blend');
  const [strength, setStrength] = useState<'default' | 'extra'>('default');
  const [sweetness, setSweetness] = useState<'zero' | 'slight' | 'half' | 'regular'>('zero');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'custom' | 'nutrition' | 'reviews'>('custom');
  const [savedTasteToast, setSavedTasteToast] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [showPriceBubble, setShowPriceBubble] = useState<boolean>(false);

  // Reset state on dish change
  useEffect(() => {
    setSize('regular');
    setTemperature(dish.category === 'drink' || dish.category === 'salad' ? 'ice' : 'hot');
    setBeanBase('blend');
    setStrength('default');
    setSweetness('zero');
    setSelectedAddons([]);
    setQuantity(1);
    setActiveTab('custom');
  }, [dish.id]);

  const isDrink = dish.category === 'drink';
  const isSaladOrBowl = dish.category === 'salad' || dish.category === 'bowl';

  // --- 1. DYNAMIC INGREDIENT BACKDROP & PROVENANCE METADATA (匹配食物食材的专属背景与溯源标识) ---
  const ingredientMeta = useMemo(() => getDishIngredientMeta(dish), [dish]);

  // Labels for options matching Luckin/Light food aesthetics
  const sizeLabels = isDrink
    ? {
        regular: { title: '大杯', desc: '约450ml', badge: '' },
        large: { title: '超大杯 +¥3', desc: '约596ml', badge: '限量联名杯·用完即止' }
      }
    : {
        regular: { title: '标准碗', desc: '约450g · 控卡均衡', badge: '' },
        large: { title: '超大碗 +¥5', desc: '约650g · 双倍蛋白', badge: '超值大份·能量加倍' }
      };

  const tempLabels = isDrink
    ? { ice: '冰', hot: '热' }
    : { ice: '常温爽脆', hot: '微温热拌' };

  const beanBaseOptions = isDrink
    ? [
        { id: 'blend', title: '意式拼配', subtitle: '坚果基调 香醇口感', badge: 'IIAC金奖', badgeColor: 'bg-[#C7F665] text-slate-950 font-black' },
        { id: 'dark', title: '深烘拼配', subtitle: '黑巧尾韵 浓郁口感', badge: '咖啡更浓', badgeColor: 'bg-slate-900 text-[#C7F665] font-black' },
        { id: 'special', title: '埃塞金烘', subtitle: '花香可可 浓醇口感', badge: 'IIAC铂金', badgeColor: 'bg-slate-900 text-amber-300 font-black' }
      ]
    : [
        { id: 'blend', title: '三色高原藜麦', subtitle: '慢碳低GI 坚果麦香', badge: '主厨推荐', badgeColor: 'bg-[#C7F665] text-slate-950 font-black' },
        { id: 'dark', title: '高纤黑米荞麦', subtitle: '饱腹控糖 高膳食纤维', badge: '控卡优选', badgeColor: 'bg-slate-900 text-[#C7F665] font-black' },
        { id: 'special', title: '有机羽衣甘蓝', subtitle: '0糖0碳基底 极致生酮', badge: '生酮必选', badgeColor: 'bg-slate-900 text-[#C7F665] font-black' }
      ];

  const strengthLabels = isDrink
    ? { default: '默认浓度', extra: '加单份浓缩 +¥3' }
    : { default: '标准酱汁', extra: '加倍特调油醋汁 +¥3' };

  const sweetnessLabels = isDrink
    ? [
        { id: 'zero', label: '不另外加糖' },
        { id: 'slight', label: '微糖' },
        { id: 'half', label: '半糖' },
        { id: 'regular', label: '标准糖' }
      ]
    : [
        { id: 'zero', label: '酱料单独分装' },
        { id: 'slight', label: '微量轻酱' },
        { id: 'half', label: '标准拌匀' },
        { id: 'regular', label: '浓郁拌匀' }
      ];

  // Category specific add-ons
  const addonList = isDrink
    ? [
        { name: '加份原榨生椰乳', price: 3, kcal: '+32 kcal' },
        { name: '加份阿拉比卡浓缩', price: 3, kcal: '+4 kcal' },
        { name: '换OATLY燕麦奶基底', price: 5, kcal: '+20 kcal' },
        { name: '加份Q弹低卡马蹄爆珠', price: 3, kcal: '+18 kcal' }
      ]
    : [
        { name: '加溏心无菌温泉蛋', price: 3, kcal: '+72 kcal' },
        { name: '加优质厚切牛油果', price: 6, kcal: '+85 kcal' },
        { name: '加低温慢烤牛排粒', price: 8, kcal: '+98 kcal' },
        { name: '加原味焙烤坚果碎', price: 4, kcal: '+45 kcal' }
      ];

  const toggleAddon = (addonName: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonName) ? prev.filter((a) => a !== addonName) : [...prev, addonName]
    );
  };

  const sizePrice = size === 'large' ? (isDrink ? 3 : 5) : 0;
  const strengthPrice = strength === 'extra' ? 3 : 0;
  const addonsPrice = selectedAddons.reduce((sum, addonName) => {
    const matched = addonList.find((a) => a.name === addonName);
    return sum + (matched ? matched.price : 0);
  }, 0);

  const unitExtra = sizePrice + strengthPrice + addonsPrice;
  const unitOriginalPrice = dish.originalPrice + unitExtra;
  const unitDealPrice = dish.dealPrice + unitExtra;
  const totalDealPrice = (unitDealPrice * quantity).toFixed(1);
  const totalOriginalPrice = (unitOriginalPrice * quantity).toFixed(1);

  // Nutritional dynamic calculation
  const calculatedKcal = useMemo(() => {
    let base = dish.kcal;
    if (size === 'large') base = Math.round(base * 1.35);
    if (strength === 'extra') base += 5;
    selectedAddons.forEach((addonName) => {
      const match = addonList.find((a) => a.name === addonName);
      if (match) {
        const num = parseInt(match.kcal.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(num)) base += num;
      }
    });
    return base;
  }, [dish.kcal, size, strength, selectedAddons]);

  // Recipe formula breakdown text (Exact string format like in the screenshot)
  const formulaText = useMemo(() => {
    const dishTitle = dish.name.includes('（') ? dish.name : `${dish.name}（首创）`;
    const sizeName = size === 'large' ? (isDrink ? '+超大杯¥3' : '+超大碗¥5') : (isDrink ? '+大杯¥0' : '+标准碗¥0');
    const tempName = `+${temperature === 'ice' ? '冰' : '热'}¥0`;
    const beanName = `+${beanBaseOptions.find((b) => b.id === beanBase)?.title || ''}¥0`;
    const strengthName = strength === 'extra' ? '+加单份浓缩¥3' : '+默认浓度¥0';
    const sweetName = isDrink
      ? `+${sweetnessLabels.find((s) => s.id === sweetness)?.label || ''}¥0`
      : '';

    const parts = [
      `${dishTitle} ¥${dish.dealPrice}`,
      sizeName,
      tempName,
      beanName,
      strengthName,
      ...(sweetName ? [sweetName] : [])
    ];

    if (selectedAddons.length > 0) {
      selectedAddons.forEach((a) => {
        const item = addonList.find((x) => x.name === a);
        parts.push(`+${a}¥${item?.price || 0}`);
      });
    }

    return parts.join('');
  }, [dish, size, temperature, beanBase, strength, sweetness, selectedAddons]);

  const handleSaveTaste = () => {
    onToggleFav(dish.id);
    setSavedTasteToast(true);
    setTimeout(() => setSavedTasteToast(false), 2000);
  };

  const handleAddAction = () => {
    onAddToCart(dish, quantity);
    onShowToast(`已将 ${quantity} 份【${dish.name}】加入购物车`);
  };

  const handleBuyAction = () => {
    onBuyNow(dish, quantity);
  };

  const handleShare = () => {
    onShowToast(`🔗 已生成「${dish.name}」专属营养分享海报与链接`);
  };

  return (
    <div
      style={{ backgroundColor: ingredientMeta.bgColor || '#26430B' }}
      className="w-full h-full flex flex-col relative select-none overflow-hidden transition-colors duration-500"
    >
      {/* 1. Transparent Floating Top Bar (Matching Navigation) */}
      {/* 图标语言对齐抽卡页：黑底 + 青柠字形（页头 logo 方块、圆形箭头按钮、
          「12 币」胶囊都是这一套）。原来是黑底白字，白字在深色食物照片上
          与青柠底的黑胶囊不成体系。 */}
      <div className="absolute top-0 inset-x-0 z-40 px-3 pt-2.5 pb-2 flex items-center justify-between pointer-events-auto">
        {/* Left Back Arrow Circle */}
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-black/70 hover:bg-black/85 backdrop-blur-md text-[#C7F665] flex items-center justify-center active:scale-95 transition-all duration-200 ease-out shadow-md"
          aria-label="返回"
        >
          <ChevronLeft className="w-4 h-4 stroke-[3]" />
        </button>

        {/* Right Mini-Program Capsule (··· | ⊙) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleShare}
            className="w-8 h-8 rounded-full bg-black/70 hover:bg-black/85 backdrop-blur-md text-[#C7F665] flex items-center justify-center transition-colors shadow-md"
            title="分享"
          >
            <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
          <div className="flex items-center bg-black/70 backdrop-blur-md border border-white/15 rounded-full px-2 py-0.5 text-[#C7F665] shadow-md">
            <span className="text-[12px] font-black px-0.5 tracking-wider leading-none">···</span>
            <span className="w-px h-2.5 bg-[#C7F665]/30 mx-1" />
            <CircleDot className="w-3.5 h-3.5 mx-0.5 text-[#C7F665]" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FIXED TOP HERO BANNER (始终保持原位，滚动时轻微压缩高度使白卡微上移) */}
      {/* ========================================================================= */}
      <div
        style={{ backgroundColor: ingredientMeta.bgColor || '#26430B' }}
        className={`relative w-full flex-shrink-0 overflow-hidden flex items-center justify-center z-10 transition-all duration-300 ease-out ${
          isScrolled ? 'h-[155px]' : 'h-[220px]'
        }`}
      >
        {/* A. DYNAMIC INGREDIENT BACKGROUND (纯色补色背景 + 单一原料食材高级微距静物摄影) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden">
          <img
            key={ingredientMeta.bgImage}
            src={ingredientMeta.bgImage}
            alt={ingredientMeta.bgAlt}
            className="w-full h-full object-cover object-center filter brightness-[0.98] contrast-[1.03] transition-all duration-500 scale-102"
          />
          {/* Minimalist soft studio lighting: subtle top navigation protection and clean complementary studio glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/20 pointer-events-none" />
          <div className="absolute inset-0 bg-black/5 pointer-events-none" />
        </div>

        {/* B. DYNAMIC LUCKIN-STYLE FLOATING BADGES (TOP-LEFT & TOP-RIGHT) */}
        {/* Top-Left Badges: 食材专属溯源标签与排行榜 */}
        <div
          className={`absolute top-12 left-3 z-20 flex flex-col gap-1 pointer-events-none transition-all duration-300 ${
            isScrolled ? 'opacity-75 scale-85 -translate-y-1.5' : 'opacity-100 scale-95 origin-top-left'
          }`}
        >
          {/* 胶囊一律 rounded-full —— 抽卡页没有方角胶囊：
              页头「10款起送」、状态胶囊、全选胶囊全是全圆角。
              配色沿用抽卡页的黑/青柠配对：黑底胶囊里只有青柠字 + 白色/80 的次要字。 */}
          <div className="bg-black/85 text-[#C7F665] px-2 py-0.5 rounded-full text-[9.5px] font-black shadow-md flex items-center gap-1 w-max border border-[#C7F665]/40 tracking-tight backdrop-blur-md">
            <span className="text-[#C7F665] font-black">{ingredientMeta.topBadge1.bold}</span>
            <span className="text-white/85 font-extrabold">{ingredientMeta.topBadge1.text}</span>
          </div>
          <div className="bg-black/85 text-white px-2 py-0.5 rounded-full text-[9.5px] font-black shadow-md flex items-center gap-1 w-max border border-white/20 tracking-tight backdrop-blur-md">
            <span className="text-[#C7F665]">{ingredientMeta.topBadge2.prefix}</span>
            <span className="text-white/85">{ingredientMeta.topBadge2.main}</span>
          </div>
        </div>

        {/* Top-Right Badge: "+3元 可升杯" / "+5元 升级大份" */}
        <div
          className={`absolute top-12 right-3 z-20 pointer-events-none transition-all duration-300 ${
            isScrolled ? 'opacity-80 scale-85 -translate-y-1.5' : 'opacity-100 scale-95 origin-top-right'
          }`}
        >
          <div className="bg-[#C7F665] text-black px-2 py-0.5 rounded-full text-[9.5px] font-black shadow-md flex items-center gap-1 border border-black/15">
            <Sparkles className="w-2.5 h-2.5 text-black" />
            <span>{isDrink ? '+3元 可升杯' : '+5元 升级大碗'}</span>
          </div>
        </div>

        {/* Right Stamp/Seal: 溯源圆章与叶片徽标 */}
        <div
          className={`absolute top-22 right-2.5 z-20 pointer-events-none select-none transition-all duration-300 ${
            isScrolled ? 'opacity-75 scale-75 -translate-y-2' : 'opacity-100 scale-90'
          }`}
        >
          <div className="relative w-12 h-12 rounded-full border-2 border-dashed border-[#C7F665] bg-slate-900/90 backdrop-blur-xs flex flex-col items-center justify-center p-0.5 shadow-md rotate-6">
            <div className="text-[8px] font-black text-white tracking-widest leading-none">
              {ingredientMeta.stampTop}
            </div>
            <div className="text-[10px] font-black text-[#C7F665] tracking-tight leading-none mt-0.5">
              {ingredientMeta.stampBottom}
            </div>
            <Leaf className="w-2.5 h-2.5 text-[#C7F665] absolute -bottom-1 -left-1 transform -rotate-45" />
          </div>
        </div>

        {/* C. DYNAMIC FOREGROUND FOOD/DRINK (纯食物抠图本体，完美比例悬浮) */}
        {/* ⚠️ 父级用 grid + 子级 col-start-1 row-start-1 让新旧插画**叠在同一格**。
            原因见下面 AnimatePresence 的注释：去掉 mode="wait" 后两个 motion.div
            会同时在 DOM 里，用 flex 会被排成左右并排，必须靠 grid 同格叠放。
            不用 absolute inset-0 —— 那会吃掉父级的 pt-6/pb-2，插画位置整体下移约 8px。 */}
        <div
          className={`relative z-10 w-full h-full grid place-items-center pointer-events-none transition-all duration-300 ${
            isScrolled ? 'pt-4 pb-1 scale-85' : 'pt-6 pb-2 scale-100'
          }`}
        >
          {/* ⚠️ 刻意**不用** mode="wait"。
              mode="wait" 是「旧图先退完 0.22s，新图才开始进 0.22s」——
              中间约 0.22s 画面全空，然后新图从下方放大砸出来，用户对这个观感
              的原话就是「下砸」。改成默认的交叉淡化：新旧同时过渡，没有空档；
              位移 y 8->3、缩放 0.88->0.96，只留一点点「换图了」的提示量。 */}
          <AnimatePresence>
            <motion.div
              key={`${dish.id}-${size}-${temperature}-${beanBase}`}
              initial={{ opacity: 0, scale: 0.96, y: 3 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -2 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="col-start-1 row-start-1 flex flex-col items-center justify-center"
            >
              {/* Pure Food Cutout */}
              <FoodCutoutRenderer
                dish={dish}
                size={size}
                temperature={temperature}
                beanBase={beanBase}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. WHITE SHEET CONTAINER: FIXED HEADER + SCROLLABLE OPTIONS (分量规格及以下) */}
      {/* ========================================================================= */}
      <div className="flex-1 min-h-0 bg-white relative z-20 -mt-2.5 rounded-t-[24px] shadow-[0_-8px_20px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden">
        {/* A. Fixed Main Product Title & Meta Header (固定在白色面板顶部，不随规格滚动) */}
        <div
          className={`bg-white rounded-t-[24px] px-4 pt-4 pb-3.5 flex-shrink-0 z-10 transition-shadow duration-200 ${
            isScrolled ? 'border-b border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)]' : ''
          }`}
        >
          {/* Product Title, Subtitle & Heart Save Button */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-black text-slate-900 tracking-tight leading-tight">
                {dish.name} {dish.name.includes('（') ? '' : '（首创）'}
              </h1>
              <p className="text-[11.5px] text-slate-500 font-medium mt-1.5 flex items-center gap-1.5 flex-wrap">
                {ingredientMeta.subTraits.map((trait, idx) => (
                  <React.Fragment key={trait}>
                    {idx > 0 && <span className="text-slate-300">|</span>}
                    <span>{trait}</span>
                  </React.Fragment>
                ))}
              </p>
            </div>

            {/* Save Taste / Favorite (Heart Button)
                外形换成抽卡页页头「食材图鉴」那枚圆形白按钮的语言：
                圆形 + 1px 浅灰描边 + shadow-2xs，收藏后转粉底。
                原来是无底色的裸图标，在白卡上缺少可点按的实体感。 */}
            <button
              onClick={handleSaveTaste}
              className="flex flex-col items-center gap-1 flex-shrink-0 group"
              aria-label={isFav ? "已收藏" : "收藏"}
            >
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200 ease-out active:scale-95 shadow-2xs ${
                  isFav
                    ? 'bg-[#FDD3EA] border-[#FAB7D9]'
                    : 'bg-white border-slate-200/90 group-hover:bg-[#f1f4f8]'
                }`}
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    isFav ? 'text-[#EC4899] fill-[#EC4899]' : 'text-slate-600'
                  }`}
                />
              </span>
              <span className="text-[9.5px] font-bold text-slate-500 whitespace-nowrap">
                {isFav ? '已收藏' : '收藏'}
              </span>
            </button>
          </div>

          {/* Save Toast Notification */}
          {savedTasteToast && (
            <div className="mt-2.5 py-1.5 px-3 bg-slate-900 text-white text-[11px] font-bold rounded-lg flex items-center gap-1.5 animate-in fade-in shadow-md">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{isFav ? '已收藏当前商品！' : '已取消收藏'}</span>
            </div>
          )}
        </div>

        {/* B. SCROLLABLE SPECIFICATIONS (分量规格及以下 - 加大上下与组件间距) */}
        <div
          onScroll={(e) => {
            const scrolled = e.currentTarget.scrollTop > 6;
            if (scrolled !== isScrolled) {
              setIsScrolled(scrolled);
            }
          }}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pt-3 pb-28 space-y-6 bg-white"
        >
          {/* Spec 1: 杯型 / 份量规格 */}
          <div>
            <div className="text-[11.5px] font-bold text-slate-800 mb-2 flex items-center justify-between">
              <span>{isDrink ? '杯型' : '份量规格'}</span>
              <span className="text-[9px] text-slate-400 font-normal">单选</span>
            </div>
            {/* 选项卡统一走抽卡页「食材卡」的语言：
                · 未选中 = bg-[#f7f9fb] + 1px 浅灰边（没有黑边，和抽卡页一致）
                · 选中   = 白底 + ring-2 青柠环（抽卡页选中态用的是外环，不是绿描边）
                · 右上角 = 1.2px 黑描边圆形勾选徽章，选中填青柠 + 黑对勾
                · 图标方块选中时走黑底青柠字（抽卡页 logo 方块 / 圆形箭头按钮同一套）
                角标从「右上浮动」挪到「左上浮动」——右上角已经交给勾选徽章了。 */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Option 1: 大杯 / 标准碗 */}
              <button
                type="button"
                onClick={() => setSize('regular')}
                className={`group relative py-2.5 px-3 rounded-xl text-left flex items-center gap-2.5 transition-all duration-200 ease-out active:scale-[0.98] border ${
                  size === 'regular'
                    ? 'bg-white border-transparent ring-2 ring-[#C7F665] shadow-xs'
                    : 'bg-[#f7f9fb] border-slate-200/90 hover:bg-white hover:border-slate-300 shadow-2xs'
                }`}
              >
                <span
                  className={`absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full border-[1.2px] border-black flex items-center justify-center shrink-0 transition-all ${
                    size === 'regular' ? 'bg-[#C7F665]' : 'bg-white'
                  }`}
                >
                  {size === 'regular' ? (
                    <svg className="w-2 h-2 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                  )}
                </span>
                <motion.div
                  whileHover={{ scale: 1.12, rotate: -4, y: -1 }}
                  whileTap={{ scale: 0.92 }}
                  animate={
                    size === 'regular'
                      ? { scale: [1, 1.16, 1], rotate: [0, -5, 0] }
                      : { scale: 1, rotate: 0, y: 0 }
                  }
                  transition={
                    size === 'regular'
                      ? { duration: 0.32, ease: [0.34, 1.56, 0.64, 1] }
                      : { type: 'spring', stiffness: 450, damping: 20 }
                  }
                  className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center transition-colors shadow-2xs ${
                    size === 'regular'
                      ? 'bg-black text-[#C7F665]'
                      : 'bg-[#f1f4f8] text-slate-500 group-hover:bg-slate-200/80 group-hover:text-slate-800'
                  }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    {isDrink ? <CupSoda className="w-3.5 h-3.5" /> : <Salad className="w-3.5 h-3.5 stroke-[2.2]" />}
                  </motion.div>
                </motion.div>
                <div className="min-w-0">
                  <div className={`text-[11.5px] font-black leading-tight ${size === 'regular' ? 'text-black' : 'text-slate-600'}`}>
                    {sizeLabels.regular.title}
                  </div>
                  <div className={`text-[9.5px] font-medium mt-0.5 leading-tight truncate ${size === 'regular' ? 'text-[#54801A] font-bold' : 'text-slate-400'}`}>
                    {sizeLabels.regular.desc}
                  </div>
                </div>
              </button>

              {/* Option 2: 超大杯 / 超大碗 */}
              <button
                type="button"
                onClick={() => setSize('large')}
                className={`group relative py-2.5 px-3 rounded-xl text-left flex items-center gap-2.5 transition-all duration-200 ease-out active:scale-[0.98] border ${
                  size === 'large'
                    ? 'bg-white border-transparent ring-2 ring-[#C7F665] shadow-xs'
                    : 'bg-[#f7f9fb] border-slate-200/90 hover:bg-white hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* Top-Left Floating Pill Badge — 青柠底黑字，抽卡页「10款起送」同款 */}
                <motion.span
                  whileHover={{ scale: 1.08, y: -1 }}
                  className="absolute -top-2 left-2 px-1.5 py-0.5 bg-[#C7F665] text-black text-[7.5px] font-black rounded-full border border-black/15 shadow-2xs leading-none"
                >
                  {sizeLabels.large.badge}
                </motion.span>

                <span
                  className={`absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full border-[1.2px] border-black flex items-center justify-center shrink-0 transition-all ${
                    size === 'large' ? 'bg-[#C7F665]' : 'bg-white'
                  }`}
                >
                  {size === 'large' ? (
                    <svg className="w-2 h-2 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                  )}
                </span>

                <motion.div
                  whileHover={{ scale: 1.15, rotate: 6, y: -1.5 }}
                  whileTap={{ scale: 0.9 }}
                  animate={
                    size === 'large'
                      ? { scale: [1, 1.2, 1], rotate: [0, 6, 0] }
                      : { scale: 1, rotate: 0, y: 0 }
                  }
                  transition={
                    size === 'large'
                      ? { duration: 0.34, ease: [0.34, 1.56, 0.64, 1] }
                      : { type: 'spring', stiffness: 480, damping: 18 }
                  }
                  className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center transition-colors shadow-2xs ${
                    size === 'large'
                      ? 'bg-black text-[#C7F665]'
                      : 'bg-[#f1f4f8] text-slate-600 group-hover:bg-slate-200/80 group-hover:text-slate-900'
                  }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    {isDrink ? <Coffee className="w-4.5 h-4.5" /> : <Salad className="w-5 h-5 stroke-[2.4]" />}
                  </motion.div>
                </motion.div>
                <div className="min-w-0">
                  <div className={`text-[11.5px] font-black leading-tight ${size === 'large' ? 'text-black' : 'text-slate-600'}`}>
                    {sizeLabels.large.title}
                  </div>
                  <div className={`text-[9.5px] font-medium mt-0.5 leading-tight truncate ${size === 'large' ? 'text-[#54801A] font-bold' : 'text-slate-400'}`}>
                    {sizeLabels.large.desc}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Spec 2: 温度 */}
          <div>
            <div className="text-[11.5px] font-bold text-slate-800 mb-2 flex items-center justify-between">
              <span>温度</span>
              <span className="text-[9px] text-slate-400 font-normal">单选</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setTemperature('ice')}
                className={`relative py-2.5 px-3 rounded-xl text-center text-[11.5px] font-black transition-all duration-200 ease-out active:scale-[0.98] border ${
                  temperature === 'ice'
                    ? 'bg-white border-transparent ring-2 ring-[#C7F665] text-black shadow-xs'
                    : 'bg-[#f7f9fb] border-slate-200/90 text-slate-600 hover:bg-white hover:border-slate-300 shadow-2xs'
                }`}
              >
                {tempLabels.ice}
                <span
                  className={`absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full border-[1.2px] border-black flex items-center justify-center transition-all ${
                    temperature === 'ice' ? 'bg-[#C7F665]' : 'bg-white'
                  }`}
                >
                  {temperature === 'ice' ? (
                    <svg className="w-2 h-2 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                  )}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setTemperature('hot')}
                className={`relative py-2.5 px-3 rounded-xl text-center text-[11.5px] font-black transition-all duration-200 ease-out active:scale-[0.98] border ${
                  temperature === 'hot'
                    ? 'bg-white border-transparent ring-2 ring-[#C7F665] text-black shadow-xs'
                    : 'bg-[#f7f9fb] border-slate-200/90 text-slate-600 hover:bg-white hover:border-slate-300 shadow-2xs'
                }`}
              >
                {tempLabels.hot}
                <span
                  className={`absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full border-[1.2px] border-black flex items-center justify-center transition-all ${
                    temperature === 'hot' ? 'bg-[#C7F665]' : 'bg-white'
                  }`}
                >
                  {temperature === 'hot' ? (
                    <svg className="w-2 h-2 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Spec 3: 咖啡豆 / 主粮基底 */}
          <div>
            <div className="text-[11.5px] font-bold text-slate-800 mb-2 flex items-center justify-between">
              <span>{isDrink ? '咖啡豆' : '主粮基底'}</span>
              <span className="text-[9px] text-slate-400 font-normal">单选</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {beanBaseOptions.map((opt) => {
                const isSelected = beanBase === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setBeanBase(opt.id as any)}
                    className={`relative p-2.5 pt-3.5 rounded-xl text-center flex flex-col items-center justify-between min-h-[56px] transition-all duration-200 ease-out active:scale-[0.98] border ${
                      isSelected
                        ? 'bg-white border-transparent ring-2 ring-[#C7F665] shadow-xs'
                        : 'bg-[#f7f9fb] border-slate-200/90 hover:bg-white hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    {/* Top Floating Badge — 抽卡页的黑/青柠配对：
                        未选中 = 黑底青柠字（页头「12 币」），选中 = 青柠底黑字（「10款起送」） */}
                    <span
                      className={`absolute -top-2 inset-x-0 mx-auto px-1.5 py-0.5 rounded-full text-[7.5px] w-max leading-none transition-all ${
                        isSelected
                          ? 'bg-[#C7F665] text-black font-black border border-black/15 shadow-2xs'
                          : 'bg-black text-[#C7F665] font-black shadow-2xs'
                      }`}
                    >
                      {opt.badge}
                    </span>

                    {/* 右上角圆形勾选徽章（抽卡页食材卡同款） */}
                    <span
                      className={`absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full border-[1.2px] border-black flex items-center justify-center transition-all ${
                        isSelected ? 'bg-[#C7F665]' : 'bg-white'
                      }`}
                    >
                      {isSelected ? (
                        <svg className="w-2 h-2 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                      )}
                    </span>

                    <div className={`font-black text-[11px] mt-0.5 leading-tight ${isSelected ? 'text-black' : 'text-slate-700'}`}>{opt.title}</div>
                    <div className={`text-[8px] mt-0.5 leading-tight line-clamp-1 ${isSelected ? 'text-[#54801A] font-bold' : 'text-slate-400'}`}>
                      {opt.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Spec 4: 咖啡浓度 / 特调酱汁 */}
          <div>
            <div className="text-[11.5px] font-bold text-slate-800 mb-2 flex items-center justify-between">
              <span>{isDrink ? '咖啡浓度' : '特调酱汁'}</span>
              <span className="text-[9px] text-slate-400 font-normal">单选</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setStrength('default')}
                className={`relative py-2.5 px-3 rounded-xl text-center text-[11.5px] font-black transition-all duration-200 ease-out active:scale-[0.98] border ${
                  strength === 'default'
                    ? 'bg-white border-transparent ring-2 ring-[#C7F665] text-black shadow-xs'
                    : 'bg-[#f7f9fb] border-slate-200/90 text-slate-600 hover:bg-white hover:border-slate-300 shadow-2xs'
                }`}
              >
                {strengthLabels.default}
                <span
                  className={`absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full border-[1.2px] border-black flex items-center justify-center transition-all ${
                    strength === 'default' ? 'bg-[#C7F665]' : 'bg-white'
                  }`}
                >
                  {strength === 'default' ? (
                    <svg className="w-2 h-2 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                  )}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setStrength('extra')}
                className={`relative py-2.5 px-3 rounded-xl text-center text-[11.5px] font-black transition-all duration-200 ease-out active:scale-[0.98] border ${
                  strength === 'extra'
                    ? 'bg-white border-transparent ring-2 ring-[#C7F665] text-black shadow-xs'
                    : 'bg-[#f7f9fb] border-slate-200/90 text-slate-600 hover:bg-white hover:border-slate-300 shadow-2xs'
                }`}
              >
                {strengthLabels.extra}
                <span
                  className={`absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full border-[1.2px] border-black flex items-center justify-center transition-all ${
                    strength === 'extra' ? 'bg-[#C7F665]' : 'bg-white'
                  }`}
                >
                  {strength === 'extra' ? (
                    <svg className="w-2 h-2 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Spec 5: 糖度 (仅饮品类展示，食物类不展示酱料拌法) */}
          {isDrink && (
            <div>
              <div className="text-[11.5px] font-bold text-slate-800 mb-2 flex items-center justify-between">
                <span>糖度</span>
                <span className="text-[9px] text-slate-400 font-normal">单选</span>
              </div>
              {/* ⚠️ 原来是 grid-cols-2 sm:grid-cols-4。
                  应用恒渲染在 410px 手机壳里，sm: 看的是**视口**宽度 ——
                  桌面下会变 4 列、卡片只剩 87px，和窄窗口的 2 列是两种观感。
                  统一成 2 列，既和其它文字选项卡一致，也放得下右上角勾选徽章。 */}
              <div className="grid grid-cols-2 gap-2.5">
                {sweetnessLabels.map((s) => {
                  const isSelected = sweetness === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSweetness(s.id as any)}
                      className={`relative py-2.5 px-3 rounded-xl text-center font-black text-[11.5px] transition-all duration-200 ease-out active:scale-[0.98] border ${
                        isSelected
                          ? 'bg-white border-transparent ring-2 ring-[#C7F665] text-black shadow-xs'
                          : 'bg-[#f7f9fb] border-slate-200/90 text-slate-600 hover:bg-white hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      <span className="truncate">{s.label}</span>
                      <span
                        className={`absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full border-[1.2px] border-black flex items-center justify-center transition-all ${
                          isSelected ? 'bg-[#C7F665]' : 'bg-white'
                        }`}
                      >
                        {isSelected ? (
                          <svg className="w-2 h-2 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Spec 6: 个性化加料 (Optional add-ons with animated check and spring) */}
          <div>
            <div className="text-[11.5px] font-bold text-slate-800 mb-2 flex items-center justify-between">
              <span>个性化加料</span>
              <span className="text-[9px] text-slate-400 font-normal">可多选</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {addonList.map((addon) => {
                const isSelected = selectedAddons.includes(addon.name);
                return (
                  <button
                    key={addon.name}
                    type="button"
                    onClick={() => toggleAddon(addon.name)}
                    className={`relative py-2 px-2.5 rounded-xl text-left transition-all duration-200 ease-out active:scale-[0.98] border ${
                      isSelected
                        ? 'bg-white border-transparent ring-2 ring-[#C7F665] shadow-xs'
                        : 'bg-[#f7f9fb] border-slate-200/90 hover:bg-white hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    {/* 勾选徽章改成抽卡页食材卡那枚右上角圆形徽章，
                        替掉原来「标题前一个 6px 小绿点」的写法 —— 那颗点太小、
                        和抽卡页的选择语言也不一致。 */}
                    <div className="flex items-center justify-between gap-1.5">
                      <span className={`text-[11.5px] font-black leading-tight truncate ${isSelected ? 'text-black' : 'text-slate-700'}`}>
                        {addon.name}
                      </span>
                      <span
                        className={`w-3.5 h-3.5 rounded-full border-[1.2px] border-black flex items-center justify-center shrink-0 transition-all ${
                          isSelected ? 'bg-[#C7F665]' : 'bg-white'
                        }`}
                      >
                        {isSelected ? (
                          <svg className="w-2 h-2 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <span className="text-[8.5px] text-slate-400">{addon.kcal}</span>
                      <span className="text-[11.5px] font-black text-slate-700 flex-shrink-0 tracking-normal">
                        +¥{addon.price}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Commitment Badge Footer */}
        <div className="px-4 py-3 flex items-center justify-center gap-4.5 text-[9.5px] text-slate-400 bg-white border-t border-slate-100">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-slate-500" /> 现做现制保障
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-slate-500" /> 快速极速出餐
          </span>
          <span className="flex items-center gap-1">
            <Store className="w-3 h-3 text-slate-500" /> 门店自提/外卖
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BOTTOM STICKY ACTION BAR (1:1 ACCURATE TO LUCKIN COFFEE SCREENSHOT)    */}
      {/* ========================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="absolute bottom-0 inset-x-0 z-50 bg-white/75 backdrop-blur-xl border-t border-white/70 px-4 pt-3 pb-5 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]"
      >
        {/* Row 1: Price & Stepper with Price Analysis Bubble */}
        <div className="relative flex items-center justify-between">
          {/* Price with interactive breakdown trigger */}
          <div className="flex items-center gap-1 tracking-normal">
            <span className="text-[14px] font-bold text-[#E60012]">¥</span>
            <span className="text-[26px] font-black text-[#E60012] tracking-tight leading-none">
              {totalDealPrice}
            </span>
            <span className="text-[10.5px] font-bold text-[#E60012] ml-0.5">首杯价</span>
            <span className="text-[12px] text-slate-400 line-through ml-1">
              ¥{totalOriginalPrice}
            </span>

            {/* Interactive Info/Price Breakdown Button
                换成抽卡页页头「食材图鉴」那枚圆形白按钮（圆 + 浅灰描边 + shadow-2xs），
                原来是无底的裸图标，在毛玻璃底栏上几乎看不见可点区域。 */}
            <button
              type="button"
              id="price-breakdown-trigger"
              onClick={() => setShowPriceBubble((prev) => !prev)}
              className="w-6 h-6 ml-1 rounded-full bg-white border border-slate-200/90 flex items-center justify-center text-slate-600 hover:bg-[#f1f4f8] active:scale-95 transition-all duration-200 ease-out cursor-pointer shadow-2xs"
              title="点击查看价格分析气泡"
              aria-label="查看价格分析"
            >
              <Info className="w-3.5 h-3.5 stroke-[2]" />
            </button>
          </div>

          {/* Interactive Price Analysis Floating Bubble (价格分析气泡) */}
          <AnimatePresence>
            {showPriceBubble && (
              <>
                {/* Backdrop to dismiss on tap outside */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowPriceBubble(false)}
                />

                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.94 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 360 }}
                  className="absolute bottom-[calc(100%+12px)] left-1 z-50 w-[325px] bg-white/98 backdrop-blur-xl text-slate-800 rounded-2xl p-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] border border-slate-200/90"
                >
                  {/* Speech bubble downward pointer pointing to the Info icon */}
                  <div className="absolute -bottom-1.5 left-26 w-3 h-3 bg-white border-r border-b border-slate-200/90 rotate-45" />

                  {/* Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-lg bg-black text-[#C7F665] flex items-center justify-center">
                        <ReceiptText className="w-3 h-3 stroke-[2.5]" />
                      </div>
                      <span className="text-xs font-black text-slate-850 tracking-tight">价格构成分析</span>
                      <span className="text-[10px] text-black font-black bg-[#C7F665] px-1.5 py-0.2 rounded-full border border-black/15">
                        省 ¥{((unitOriginalPrice - unitDealPrice) * quantity).toFixed(1)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPriceBubble(false)}
                      className="w-5 h-5 rounded-full bg-white border border-slate-200/90 hover:bg-[#f1f4f8] active:scale-95 flex items-center justify-center text-slate-500 transition-all duration-200 ease-out cursor-pointer shadow-2xs"
                      aria-label="关闭气泡"
                    >
                      <X className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Calculation Items */}
                  <div className="space-y-1.5 text-[11.5px]">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>基础原价</span>
                      <span className="font-semibold text-slate-900 font-mono">¥{dish.originalPrice.toFixed(1)}</span>
                    </div>

                    {(sizePrice > 0 || strengthPrice > 0 || addonsPrice > 0) && (
                      <div className="flex justify-between items-center text-slate-600">
                        <span className="flex items-center gap-1">
                          定制加价
                          <span className="text-[9.5px] text-slate-400">
                            ({[
                              sizePrice > 0 ? (isDrink ? '超大杯' : '超大碗') : '',
                              strengthPrice > 0 ? (isDrink ? '加浓缩' : '加特调') : '',
                              addonsPrice > 0 ? '加料' : ''
                            ].filter(Boolean).join('+')})
                          </span>
                        </span>
                        <span className="font-semibold text-amber-700 font-mono">
                          +¥{(sizePrice + strengthPrice + addonsPrice).toFixed(1)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-[#E60012] font-medium bg-rose-50/80 px-2 py-1 rounded-lg border border-rose-100">
                      <span className="flex items-center gap-1">
                        <BadgePercent className="w-3 h-3 text-[#E60012]" />
                        首杯 / 会员专享优惠
                      </span>
                      <span className="font-black font-mono">
                        -¥{(unitOriginalPrice - unitDealPrice).toFixed(1)}
                      </span>
                    </div>

                    <div className="pt-1.5 border-t border-slate-100 flex justify-between items-center text-xs">
                      <span className="text-slate-700 font-bold">
                        当前实付 {quantity > 1 ? `(× ${quantity})` : ''}
                      </span>
                      <div className="text-right">
                        <span className="text-[15px] font-black text-[#E60012] font-mono">
                          ¥{totalDealPrice}
                        </span>
                        <span className="text-[10.5px] text-slate-400 line-through ml-1.5 font-mono">
                          ¥{totalOriginalPrice}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer note */}
                  <div className="mt-2 pt-1.5 border-t border-slate-100 text-[9.5px] text-slate-400 flex items-center justify-between">
                    <span>✨ 已自动应用平台最优立减优惠</span>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Stepper with buttons — 抽卡页的圆形按钮语言：
              减号 = 白圆 + 浅灰描边（页头「图鉴」按钮），
              加号 = 纯黑圆 + 青柠字形（页头「12 币」黑胶囊、圆形箭头按钮同款）。
              原来加号用的是 slate-900，抽卡页的黑是纯 #000。 */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-7 h-7 rounded-full bg-white border border-slate-200/90 text-slate-700 flex items-center justify-center disabled:opacity-35 active:scale-95 transition-all duration-200 ease-out hover:bg-[#f1f4f8] shadow-2xs"
            >
              <Minus className="w-3.5 h-3.5 stroke-[2.4]" />
            </button>
            <span className="min-w-[26px] text-center text-base font-black text-slate-950 tracking-tight">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(99, q + 1))}
              className="w-7 h-7 rounded-full bg-black hover:bg-slate-800 text-[#C7F665] flex items-center justify-center active:scale-95 transition-all duration-200 ease-out shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.8]" />
            </button>
          </div>
        </div>

        {/* Row 2: Detailed Formula Breakdown String */}
        <div className="mt-1.5 mb-1 text-[9.5px] text-slate-400 truncate font-mono">
          {formulaText}
        </div>

        {/* Row 3: Dual Action Buttons
            整组换成抽卡页的胶囊按钮语言：
            · 一律 rounded-full（抽卡页没有一个方角按钮：单抽/十连、全选、立即起送全是胶囊）
            · 主行动「立即购买」= 青柠底 + 2px 黑边 + 黑字 + 硬投影 + 黑圆青柠箭头
              —— 这正是抽卡页「全选」胶囊与两个抽卡按钮的写法，
              也符合项目既有的 L1 基线（页级行动 = 青柠底 + 黑边 + 黑字）。
              原来用的是「黑底青柠字」，那是抽卡页页头「12 币」的状态胶囊语言，
              当主行动用会和次要按钮的层级拉不开。
            · 次行动「加入购物车」= 浅灰胶囊 + 深灰字。 */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <button
            type="button"
            onClick={handleAddAction}
            className="w-full py-3 rounded-full bg-[#f1f4f8] hover:bg-[#e6ebf2] active:scale-[0.98] text-slate-900 font-black text-xs transition-all duration-200 ease-out border border-slate-200/90 flex items-center justify-center"
          >
            加入购物车
          </button>
          <button
            type="button"
            onClick={handleBuyAction}
            className="w-full py-3 rounded-full bg-[#C7F665] hover:bg-[#B7EF4B] active:scale-[0.98] text-black font-black text-xs transition-all duration-200 ease-out border-[2px] border-black shadow-[2px_2px_0_#000] flex items-center justify-center gap-1.5"
          >
            立即购买
            <span className="w-4 h-4 rounded-full bg-black flex items-center justify-center shrink-0">
              <ArrowRight className="w-2.5 h-2.5 text-[#C7F665] stroke-[3]" />
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
