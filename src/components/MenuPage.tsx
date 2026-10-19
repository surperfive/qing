import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dish, CategoryId, OrderMode, Store, FilterState } from '../types';
import { CATEGORIES } from '../data/mockData';
import { CategoryIcon, FlameIcon } from './CategoryIcons';
import { DishImage } from './DishImage';
import { DishTag } from './DishTag';
import { SearchModal } from './SearchModal';
import { MenuBottomDecor } from './MenuBottomDecor';
import {
  Search,
  Heart,
  Plus,
  Minus,
  SlidersHorizontal,
  Flame,
  Ticket,
  X,
  RotateCcw,
  Check,
  MapPin,
  ChevronRight,
  Wifi,
  Battery,
  Bike
} from 'lucide-react';

interface MenuPageProps {
  dishes: Dish[];
  currentStore: Store;
  mode: OrderMode;
  onModeChange: (mode: OrderMode) => void;
  onOpenStoreModal: () => void;
  cartQuantities: Record<number, number>;
  onAddToCart: (dish: Dish) => void;
  onRemoveFromCart: (dish: Dish) => void;
  onSelectDish: (dish: Dish) => void;
  favorites: Set<number>;
  onToggleFavorite: (dishId: number) => void;
  onShowToast: (msg: string) => void;
}

export const INITIAL_FILTER_STATE: FilterState = {
  calorieRange: 'all',
  proteinMin: 0,
  carbsMax: 0,
  fatMax: 0,
  dietary: [],
  excludedIngredients: [],
  temperature: 'all',
  priceRange: 'all',
  onlyDiscount: false,
  onlyPopular: false,
};

export const MenuPage: React.FC<MenuPageProps> = ({
  dishes,
  currentStore,
  mode,
  onModeChange,
  onOpenStoreModal,
  cartQuantities,
  onAddToCart,
  onRemoveFromCart,
  onSelectDish,
  favorites,
  onToggleFavorite,
  onShowToast
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER_STATE);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [slideDirection, setSlideDirection] = useState<number>(1);
  const dishesScrollRef = useRef<HTMLDivElement>(null);
  const prevCategoryIndexRef = useRef<number>(0);

  const handleCategoryChange = (newCatId: CategoryId) => {
    const prevIdx = CATEGORIES.findIndex((c) => c.id === activeCategory);
    const newIdx = CATEGORIES.findIndex((c) => c.id === newCatId);
    setSlideDirection(newIdx >= prevIdx ? 1 : -1);
    prevCategoryIndexRef.current = newIdx;
    setActiveCategory(newCatId);

    // Smoothly scroll back to top of dish list
    if (dishesScrollRef.current) {
      dishesScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Count active filter conditions
  const activeFilterCount = useMemo(() => {
    return (
      (filters.calorieRange !== 'all' ? 1 : 0) +
      (filters.proteinMin > 0 ? 1 : 0) +
      (filters.carbsMax > 0 ? 1 : 0) +
      (filters.fatMax > 0 ? 1 : 0) +
      filters.dietary.length +
      filters.excludedIngredients.length +
      (filters.temperature !== 'all' ? 1 : 0) +
      (filters.priceRange !== 'all' ? 1 : 0) +
      (filters.onlyDiscount ? 1 : 0) +
      (filters.onlyPopular ? 1 : 0)
    );
  }, [filters]);

  // Comprehensive multi-attribute filtering logic
  const filteredDishes = useMemo(() => {
    let list = dishes.filter((dish) => {
      // 1. Category (全部展示全部餐品并置顶热卖，分类则展示对应餐品)
      const matchCategory =
        activeCategory === 'all'
          ? true
          : dish.category === activeCategory;
      if (!matchCategory) return false;

      // 2. Search keyword
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const matchSearch =
          dish.name.toLowerCase().includes(q) ||
          dish.description.toLowerCase().includes(q) ||
          dish.tags.some((t) => t.toLowerCase().includes(q)) ||
          String(dish.kcal).includes(q);
        if (!matchSearch) return false;
      }

      // 3. Calorie Range
      if (filters.calorieRange === 'under250' && dish.kcal > 250) return false;
      if (filters.calorieRange === '250to400' && (dish.kcal <= 250 || dish.kcal > 400)) return false;
      if (filters.calorieRange === 'over400' && dish.kcal <= 400) return false;

      // 4. Protein / Carbs / Fat Macros
      if (filters.proteinMin > 0 && dish.protein < filters.proteinMin) return false;
      if (filters.carbsMax > 0 && dish.carbs > filters.carbsMax) return false;
      if (filters.fatMax > 0 && dish.fat > filters.fatMax) return false;

      // 5. Dietary Lifestyle
      if (filters.dietary.includes('vegetarian') && !dish.isVegetarian) return false;
      if (filters.dietary.includes('vegan') && !dish.isVegan) return false;
      if (filters.dietary.includes('sugar_free') && !dish.isSugarFree) return false;
      if (filters.dietary.includes('keto') && !dish.isKeto) return false;
      if (filters.dietary.includes('high_fiber') && !dish.isHighFiber) return false;

      // 6. Excluded Allergens & Ingredients (筛除)
      if (filters.excludedIngredients.length > 0) {
        const hasExcluded = filters.excludedIngredients.some((ex) =>
          dish.allergens?.includes(ex)
        );
        if (hasExcluded) return false;
      }

      // 7. Temperature
      if (filters.temperature === 'hot' && dish.temperature !== 'hot') return false;
      if (filters.temperature === 'cold' && dish.temperature !== 'cold' && dish.temperature !== 'ambient') return false;

      // 8. Price
      if (filters.priceRange === 'under20' && dish.dealPrice >= 20) return false;
      if (filters.priceRange === '20to30' && (dish.dealPrice < 20 || dish.dealPrice > 30)) return false;
      if (filters.priceRange === 'over30' && dish.dealPrice <= 30) return false;

      // 9. Special Deals & Bestsellers
      if (filters.onlyDiscount && dish.dealPrice >= dish.originalPrice) return false;
      if (filters.onlyPopular && !dish.isPopular) return false;

      return true;
    });

    if (activeCategory === 'all') {
      list = [...list].sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
    }

    return list;
  }, [dishes, activeCategory, searchQuery, filters]);

  // Quick filter toggles helper
  const toggleCalorieRange = (range: 'under250' | '250to400' | 'over400') => {
    setFilters((prev) => ({
      ...prev,
      calorieRange: prev.calorieRange === range ? 'all' : range,
    }));
  };

  const toggleDietary = (key: string) => {
    setFilters((prev) => ({
      ...prev,
      dietary: prev.dietary.includes(key)
        ? prev.dietary.filter((d) => d !== key)
        : [...prev.dietary, key],
    }));
  };

  const toggleExclude = (ingredient: string) => {
    setFilters((prev) => ({
      ...prev,
      excludedIngredients: prev.excludedIngredients.includes(ingredient)
        ? prev.excludedIngredients.filter((i) => i !== ingredient)
        : [...prev.excludedIngredients, ingredient],
    }));
  };

  const toggleProtein = () => {
    setFilters((prev) => ({
      ...prev,
      proteinMin: prev.proteinMin >= 25 ? 0 : 25,
    }));
  };

  const toggleHot = () => {
    setFilters((prev) => ({
      ...prev,
      temperature: prev.temperature === 'hot' ? 'all' : 'hot',
    }));
  };

  const toggleCold = () => {
    setFilters((prev) => ({
      ...prev,
      temperature: prev.temperature === 'cold' ? 'all' : 'cold',
    }));
  };

  const toggleDiscount = () => {
    setFilters((prev) => ({
      ...prev,
      onlyDiscount: !prev.onlyDiscount,
    }));
  };

  const togglePopular = () => {
    setFilters((prev) => ({
      ...prev,
      onlyPopular: !prev.onlyPopular,
    }));
  };

  const resetAllFilters = () => {
    setFilters(INITIAL_FILTER_STATE);
    setSearchQuery('');
    setActiveCategory('all');
    onShowToast('🔄 已清空所有筛选');
  };

  return (
    <div className="flex flex-col h-full w-full min-h-0 overflow-hidden bg-[#C7F665] relative">
      {/* Pop-up Modern Mini-Program Search Interface */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        dishes={dishes}
        cartQuantities={cartQuantities}
        onAddToCart={onAddToCart}
        onRemoveFromCart={onRemoveFromCart}
        onSelectDish={(dish) => {
          setIsSearchOpen(false);
          onSelectDish(dish);
        }}
        favorites={favorites}
        onToggleFavorite={onToggleFavorite}
        onShowToast={onShowToast}
        initialQuery={searchQuery}
      />

      {/* Top Header Banner - Pure Vector Artwork Header */}
      <div id="menu-header-banner" className="relative w-full bg-[#C7F665] flex-shrink-0 select-none pt-3.5 pb-0">
        <img
          id="menu-banner-image"
          src="/ordering_header_banner.svg"
          alt="FOOD — GOOD FOOD BETTER MOOD"
          className="w-full h-auto block select-none"
        />
      </div>

      {/* Main Content Container - Aligned right below header banner */}
      <div className="relative z-20 bg-white flex flex-col flex-1 min-h-0 overflow-hidden mt-0 rounded-t-3xl shadow-xs">
        {/* Row 1: Mode Switch (外卖 / 自提) & Search Bar in the SAME ROW - Frosted Matte & Unified Alignment */}
        <div className="flex-shrink-0 z-20 px-3 pt-3 pb-1.5 bg-white rounded-t-3xl flex items-center gap-2">
          {/* Mode Toggle (Takeout / Pickup) Capsule - Aligned h-[34px] & Gray Background */}
          <div className="relative flex items-center h-[34px] bg-slate-100/90 p-0.5 rounded-full border border-slate-200/80 flex-shrink-0 select-none shadow-2xs">
            {/* 选中滑块走绿黑配色：青柠底 + 黑字，与下方热量筛选胶囊同一套语言
                （原来是灰底灰滑块，在白色头部里几乎看不出选中态） */}
            <div
              className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full bg-[#C7F665] shadow-xs transition-transform duration-200 ease-out ${
                mode === 'takeout' ? 'left-0.5 translate-x-0' : 'left-0.5 translate-x-full'
              }`}
            />
            <button
              type="button"
              onClick={() => onModeChange('takeout')}
              className={`relative z-10 h-full flex items-center justify-center px-3 rounded-full text-xs transition-colors whitespace-nowrap ${
                mode === 'takeout' ? 'text-black font-extrabold' : 'text-slate-500 font-bold hover:text-slate-800'
              }`}
            >
              外卖
            </button>
            <button
              type="button"
              onClick={() => onModeChange('pickup')}
              className={`relative z-10 h-full flex items-center justify-center px-3 rounded-full text-xs transition-colors whitespace-nowrap ${
                mode === 'pickup' ? 'text-black font-extrabold' : 'text-slate-500 font-bold hover:text-slate-800'
              }`}
            >
              自提
            </button>
          </div>

          {/* Mini-Program Style Search Entry Capsule - Aligned h-[34px] & Gray Background */}
          <div
            onClick={() => setIsSearchOpen(true)}
            className="relative flex-1 min-w-0 h-[34px] flex items-center justify-between pl-3 pr-1.5 rounded-full bg-slate-100/90 hover:bg-slate-100 border border-slate-200/80 shadow-2xs cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 group-hover:text-slate-600 transition-colors" />
              <span className="text-xs text-slate-400 font-medium truncate">
                {searchQuery ? searchQuery : '搜索轻食名称、热量数值...'}
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-slate-200/90 hover:bg-slate-300 text-slate-700 hover:text-slate-900 text-[11px] font-bold shadow-2xs border border-slate-300/50 transition-all flex-shrink-0 flex items-center justify-center">
              搜索
            </span>
          </div>
        </div>

      {/* Row 2: Simplified Location Bar directly below Search */}
      <div className="flex-shrink-0 z-10 px-3 py-1 bg-white border-b border-slate-100 flex items-center justify-between gap-2 text-xs">
        <button
          onClick={onOpenStoreModal}
          className="flex items-center gap-1 min-w-0 flex-1 text-left group hover:opacity-85 transition-opacity"
          title="点击切换门店"
        >
          <MapPin className="w-3.5 h-3.5 text-slate-900 flex-shrink-0" />
          <span className="font-extrabold text-slate-800 text-xs truncate max-w-[220px]">
            {currentStore.name}
          </span>
          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
            (距您 {currentStore.distance})
          </span>
          <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-slate-700 transition-colors flex-shrink-0" />
        </button>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium flex-shrink-0">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C7F665]" />
          {/* 送达时效是外卖决策的关键信息，从 slate-500 提到深黑加粗 */}
          <span className="text-slate-900 font-bold">{mode === 'takeout' ? '约25分钟送达' : '到店即取'}</span>
          <span className="text-slate-300">|</span>
          <button
            onClick={onOpenStoreModal}
            className="text-slate-800 hover:text-slate-950 font-bold transition-colors"
          >
            切换
          </button>
        </div>
      </div>

      {/* SINGLE ROW FILTER BAR - Strictly One Row (只占一栏，无弹窗) */}
      <div className="flex-shrink-0 z-10 px-3 py-1.5 bg-white border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar whitespace-nowrap text-xs shadow-2xs">
        {/* Reset / All Indicator Button - Styled to match the Search pill */}
        {activeFilterCount > 0 ? (
          <button
            id="filter-all-btn"
            type="button"
            onClick={resetAllFilters}
            /* 有筛选生效时它不再是个普通胶囊，而是"当前筛了几项 + 一键重置"的状态入口，
               所以提到黑绿这一档；未选中态保持浅灰。 */
            className="px-2.5 py-1 rounded-full bg-black hover:bg-slate-800 text-[#C7F665] text-[11px] font-black shadow-2xs active:scale-95 transition-all duration-200 ease-out flex items-center gap-1 flex-shrink-0 cursor-pointer"
            title="清空筛选"
          >
            <RotateCcw className="w-3 h-3 stroke-[2.5]" />
            <span>全部 ({activeFilterCount})</span>
          </button>
        ) : (
          <button
            id="filter-all-btn"
            type="button"
            onClick={resetAllFilters}
            className="px-2.5 py-1 rounded-full bg-slate-200/90 hover:bg-slate-300 text-slate-700 text-[11px] font-bold shadow-2xs border border-slate-300/50 active:scale-95 transition-all duration-200 ease-out flex items-center gap-1 flex-shrink-0 cursor-pointer"
          >
            <span>全部</span>
          </button>
        )}

        {/* Divider */}
        <div className="h-3.5 w-px bg-slate-200 flex-shrink-0" />

        {/* Calorie Range Filters (大卡/热量筛选) */}
        <button
          onClick={() => toggleCalorieRange('under250')}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap flex items-center gap-1 flex-shrink-0 transition-all duration-200 ease-out active:scale-95 cursor-pointer outline-none focus:outline-none focus:ring-0 select-none ${
            filters.calorieRange === 'under250'
              ? 'bg-[#C7F665] text-black border border-transparent font-black shadow-2xs'
              : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200/70 border border-slate-200/50'
          }`}
        >
          <span className="flex items-center gap-1">
            <FlameIcon className="w-3.5 h-3.5 stroke-[2] text-[#EC4899] flex-shrink-0" />
            <span>≤250大卡</span>
          </span>
          {filters.calorieRange === 'under250' && <Check className="w-3 h-3 stroke-[3]" />}
        </button>

        <button
          onClick={() => toggleCalorieRange('250to400')}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap flex items-center gap-1 flex-shrink-0 transition-all duration-200 ease-out active:scale-95 cursor-pointer outline-none focus:outline-none focus:ring-0 select-none ${
            filters.calorieRange === '250to400'
              ? 'bg-[#C7F665] text-black border border-transparent font-black shadow-2xs'
              : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200/70 border border-slate-200/50'
          }`}
        >
          <span className="flex items-center gap-1">
            <FlameIcon className="w-3.5 h-3.5 stroke-[2] text-[#EC4899] flex-shrink-0" />
            <span>250-400大卡</span>
          </span>
          {filters.calorieRange === '250to400' && <Check className="w-3 h-3 stroke-[3]" />}
        </button>

        <button
          onClick={() => toggleCalorieRange('over400')}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap flex items-center gap-1 flex-shrink-0 transition-all duration-200 ease-out active:scale-95 cursor-pointer outline-none focus:outline-none focus:ring-0 select-none ${
            filters.calorieRange === 'over400'
              ? 'bg-[#C7F665] text-black border border-transparent font-black shadow-2xs'
              : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200/70 border border-slate-200/50'
          }`}
        >
          <span className="flex items-center gap-1">
            <FlameIcon className="w-3.5 h-3.5 stroke-[2] text-[#EC4899] flex-shrink-0" />
            <span>&gt;400大卡</span>
          </span>
          {filters.calorieRange === 'over400' && <Check className="w-3 h-3 stroke-[3]" />}
        </button>
      </div>

      {/* Main Two-Column Layout (Left Category Rail + Right Dish List) */}
      <div className="flex flex-1 min-h-0 overflow-hidden bg-[#F5F6F8] relative">
        {/* Left Category Rail - Narrowed slightly for better viewport proportion and dish area space */}
        <div className="w-[116px] bg-white border-r border-slate-200/70 flex flex-col overflow-y-auto no-scrollbar py-2 pb-28 flex-shrink-0 relative">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`relative w-full min-h-[56px] py-2.5 pl-2.5 pr-1 text-left transition-colors duration-150 flex items-center gap-1.5 select-none active:scale-[0.98] ${
                  isActive
                    ? 'text-black'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {/* Smooth sliding active background with rounded right corners and left black bar */}
                {isActive && (
                  <>
                    <motion.div
                      layoutId="activeCategoryBg"
                      className="absolute inset-y-0.5 left-0 right-1 bg-[#C7F665] rounded-r-2xl z-0"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                    <motion.div
                      layoutId="activeCategoryBar"
                      className="absolute left-0 inset-y-0.5 w-1.5 bg-black rounded-r-sm z-10"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  </>
                )}

                {/* Category Graphic Icon - Compact & crisp
                    未选中态刻意压到浅灰：原来图标是纯黑、文字 slate-900，
                    和选中态几乎同权重，青柠底只是"多了个背景"，层级拉不开。 */}
                <div
                  className={`relative z-10 flex-shrink-0 flex items-center justify-center ${
                    isActive ? 'text-black' : 'text-slate-400'
                  }`}
                >
                  <CategoryIcon id={cat.id} className="w-[24px] h-[24px]" isActive={isActive} />
                </div>

                {/* Category Name & Badge */}
                <div className="relative z-10 flex flex-col justify-center min-w-0 flex-1">
                  <span
                    className={`text-[12.5px] tracking-tight whitespace-nowrap leading-tight truncate ${
                      isActive ? 'text-black font-extrabold' : 'text-slate-500 font-semibold'
                    }`}
                  >
                    {cat.name}
                  </span>
                  {cat.badge && (
                    <span className="text-[9px] font-black text-[#EC4899] tracking-wider uppercase leading-none mt-0.5">
                      {cat.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Menu Dishes List - ONLY THIS AREA SCROLLS */}
        <div
          ref={dishesScrollRef}
          className="flex-1 min-h-0 h-full overflow-y-auto p-3 pb-52 bg-transparent overscroll-contain relative z-10"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${activeCategory}-${JSON.stringify(filters)}-${searchQuery ? 's' : 'all'}`}
              initial={{ opacity: 0, y: slideDirection * 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -slideDirection * 20 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-3"
            >
              {filteredDishes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shadow-2xs">
                    <SlidersHorizontal className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-700">没有找到符合条件的轻食菜品</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      尝试放宽部分过敏原筛除、热量或蛋白质限制
                    </p>
                  </div>
                  <button
                    onClick={resetAllFilters}
                    className="px-4 py-1.5 rounded-full bg-slate-900 text-[#C7F665] text-xs font-black shadow-2xs hover:bg-black active:scale-95 transition-all duration-200 ease-out border border-[#C7F665]/30"
                  >
                    重置所有筛选
                  </button>
                </div>
              ) : (
                filteredDishes.map((dish, index) => {
                  const qty = cartQuantities[dish.id] || 0;
                  const isFav = favorites.has(dish.id);

                  return (
                    <motion.div
                      key={dish.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, delay: Math.min(index * 0.025, 0.15) }}
                      onClick={() => onSelectDish(dish)}
                      className="group cursor-pointer p-2.5 rounded-xl bg-white border border-slate-100 shadow-2xs hover:shadow-xs transition-all duration-200 flex gap-2.5 relative items-center active:scale-[0.98]"
                    >
                      {/* Dish Thumbnail */}
                      <div className="relative w-22 h-22 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center">
                        <DishImage
                          src={dish.image}
                          alt={dish.name}
                          category={dish.category}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {dish.temperature === 'hot' && (
                          /* 照片上的叠加标签：原来用 amber-500，是整页唯一的暖色异类。
                             改用中性深色蒙版 —— 不用青柠，否则会被误读成"选中态"。 */
                          <div className="absolute top-1 left-1 px-1 py-0.2 rounded bg-black/80 text-white text-[8px] font-bold">
                            热食
                          </div>
                        )}
                      </div>

                      {/* Dish Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-extrabold text-slate-900 text-[14.5px] leading-snug tracking-tight truncate group-hover:text-[#54801A] transition-colors">
                              {dish.name}
                            </h4>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite(dish.id);
                              }}
                              className={`p-1 rounded-md transition-colors flex-shrink-0 ${
                                isFav ? 'text-[#EC4899]' : 'text-slate-300 hover:text-slate-500'
                              }`}
                              aria-label={isFav ? '取消收藏' : '加入收藏'}
                            >
                              <Heart
                                className={`w-3.5 h-3.5 ${isFav ? 'fill-[#EC4899] stroke-[#EC4899]' : ''}`}
                              />
                            </button>
                          </div>

                          <p className="text-[10px] text-slate-400 font-normal truncate mt-0.5 leading-tight">
                            {dish.subtitle || dish.description}
                          </p>

                          {/* Nutrition & Dietary Badges —— 2026-10-18 统一为首页人气卡同款
                              浅青柠全圆胶囊（DishTag），不再是灰底方角徽章 */}
                          <div className="flex items-center gap-1 mt-1 overflow-hidden">
                            <DishTag>
                              <Flame className="w-2.5 h-2.5 fill-[#26430B] text-[#26430B] flex-shrink-0" />
                              <span>{dish.kcal} kcal</span>
                            </DishTag>
                            {dish.isSugarFree ? (
                              <DishTag>0蔗糖</DishTag>
                            ) : dish.isKeto ? (
                              <DishTag>生酮</DishTag>
                            ) : dish.isVegetarian ? (
                              <DishTag>素食</DishTag>
                            ) : null}
                          </div>
                        </div>

                        {/* Price & Stepper Control */}
                        <div className="flex items-center justify-between mt-1.5 pt-1">
                          <div className="flex items-baseline gap-0.5 min-w-0 leading-none">
                            <span className="text-xs font-bold text-[#E60012]">¥</span>
                            <span className="text-lg font-black text-[#E60012] leading-none">
                              {dish.dealPrice}
                            </span>
                            {dish.originalPrice > dish.dealPrice && (
                              <span className="text-[10.5px] text-slate-300 line-through leading-none ml-1">
                                ¥{dish.originalPrice}
                              </span>
                            )}
                          </div>

                          {/* Stepper (+ / -): completely symmetrical & vertically centered */}
                          <div
                            className="relative flex items-center justify-end h-6 flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <motion.div
                              layout
                              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                              className="flex items-center rounded-full"
                            >
                              <AnimatePresence initial={false}>
                                {qty > 0 && (
                                   <motion.div
                                    key="stepper-track-content"
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: 'auto', opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                                    className="flex items-center overflow-hidden"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => onRemoveFromCart(dish)}
                                      className="w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 flex items-center justify-center transition-all duration-200 ease-out font-bold flex-shrink-0 border-0"
                                      aria-label="减少一份"
                                    >
                                      <Minus className="w-2.5 h-2.5 stroke-[2.5]" />
                                    </button>
                                    <motion.span
                                      key={`qty-${qty}`}
                                      initial={{ scale: 1.2, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      transition={{ duration: 0.15 }}
                                      className="w-5 text-center text-[11.5px] font-black text-slate-800 leading-none flex-shrink-0 tracking-tight"
                                    >
                                      {qty}
                                    </motion.span>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              <button
                                type="button"
                                onClick={() => onAddToCart(dish)}
                                className="w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-black active:scale-95 flex items-center justify-center transition-all duration-200 ease-out font-black flex-shrink-0 border-0 shadow-none"
                                aria-label="增加一份"
                              >
                                <Plus className="w-3 h-3 stroke-[3]" />
                              </button>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Artistic Bottom Background Canvas Matching Design Reference */}
        <MenuBottomDecor />
      </div>
    </div>
  </div>
  );
};

