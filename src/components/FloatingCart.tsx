import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem, Dish } from '../types';
import { Trash2, Plus, Minus, Check } from 'lucide-react';
import { DishImage } from './DishImage';

interface FloatingCartProps {
  cartItems: CartItem[];
  onAddToCart: (dish: Dish) => void;
  onRemoveFromCart: (dish: Dish) => void;
  onClearCart: () => void;
  onOpenCheckout: () => void;
  onSelectDish?: (dish: Dish) => void;
}

export const FloatingCart: React.FC<FloatingCartProps> = ({
  cartItems,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  onOpenCheckout,
  onSelectDish
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  // Track selected item IDs in cart (all checked by default)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Initialize/keep selected IDs in sync with cart items
  const effectiveSelectedIds = React.useMemo(() => {
    if (selectedIds.size === 0 && cartItems.length > 0) {
      return new Set(cartItems.map((it) => it.dish.id));
    }
    // Filter out items that are no longer in cart
    const currentItemIds = new Set(cartItems.map((it) => it.dish.id));
    const nextSet = new Set<number>();
    selectedIds.forEach((id) => {
      if (currentItemIds.has(id)) nextSet.add(id);
    });
    return nextSet.size === 0 && cartItems.length > 0
      ? new Set(cartItems.map((it) => it.dish.id))
      : nextSet;
  }, [selectedIds, cartItems]);

  const allSelected =
    cartItems.length > 0 && cartItems.every((it) => effectiveSelectedIds.has(it.dish.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cartItems.map((it) => it.dish.id)));
    }
  };

  const toggleSelectItem = (id: number) => {
    const next = new Set(effectiveSelectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const subtotal = cartItems.reduce((acc, item) => {
    if (effectiveSelectedIds.has(item.dish.id)) {
      return acc + item.dish.dealPrice * item.quantity;
    }
    return acc;
  }, 0);

  const originalSubtotal = cartItems.reduce((acc, item) => {
    if (effectiveSelectedIds.has(item.dish.id)) {
      return acc + (item.dish.originalPrice || item.dish.price) * item.quantity;
    }
    return acc;
  }, 0);

  if (totalCount === 0) return null;

  // Helper to generate specs subtitle like "大杯/冰/少少甜/奇兰乌龙"
  const getDishSpecs = (dish: Dish) => {
    if (dish.category === 'drink') {
      return '大杯/冰/少少甜/现萃原叶';
    }
    if (dish.category === 'salad' || dish.category === 'bowl') {
      return '标准碗/三色藜麦/特调油醋汁/轻卡';
    }
    if (dish.category === 'hot') {
      return '现炖暖锅/原木花菇/昆布高汤/标准份';
    }
    return '全麦烘焙/现烤锁鲜/标准份';
  };

  return (
    <>
      {/* 1. Gentle Dimming Overlay on Screen (整体界面除购物车组件外轻微变暗) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="cart-backdrop-dim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={() => setIsExpanded(false)}
            className="absolute inset-0 z-40 bg-black/35 backdrop-blur-[1px] cursor-pointer"
          />
        )}
      </AnimatePresence>

      {/* 2. Main Upward Expanding Cart Component */}
      <div className="absolute bottom-[66px] sm:bottom-[70px] inset-x-3 sm:inset-x-4 z-45 pointer-events-none">
        <motion.div
          layout
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className={`pointer-events-auto w-full bg-white text-slate-900 shadow-[0_10px_28px_rgba(0,0,0,0.16)] border-2 border-black overflow-hidden flex flex-col relative ${
            isExpanded ? 'rounded-3xl' : 'rounded-full'
          }`}
        >
          {/* A. Upward Accordion Content */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                key="cart-expanded-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden border-b-2 border-black flex flex-col bg-[#FAFAFA]"
              >
                {/* Header: Select All + Count & Clear Cart Button */}
                <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="flex items-center gap-2 text-left group cursor-pointer"
                  >
                    <div
                      className={`w-4.5 h-4.5 rounded-full flex items-center justify-center transition-all ${
                        allSelected
                          ? 'bg-[#C7F665] border-2 border-black text-black shadow-2xs'
                          : 'border-2 border-slate-300 bg-white'
                      }`}
                    >
                      {allSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-xs font-black text-slate-900">
                      已选商品 ({effectiveSelectedIds.size}/{cartItems.length})
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClearCart();
                      setIsExpanded(false);
                    }}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#EC4899] transition-colors font-bold cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>清空购物车</span>
                  </button>
                </div>

                {/* List of Cart Items */}
                <div className="max-h-56 overflow-y-auto p-2.5 space-y-2 no-scrollbar divide-y divide-slate-100 bg-white">
                  {cartItems.map((item) => {
                    const isSelected = effectiveSelectedIds.has(item.dish.id);
                    const specs = getDishSpecs(item.dish);

                    return (
                      <div
                        key={item.dish.id}
                        className={`pt-2 first:pt-0 flex items-center gap-2.5 transition-opacity ${
                          isSelected ? 'opacity-100' : 'opacity-40'
                        }`}
                      >
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={() => toggleSelectItem(item.dish.id)}
                          className="flex-shrink-0 cursor-pointer"
                        >
                          <div
                            className={`w-4.5 h-4.5 rounded-full flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-[#C7F665] border-2 border-black text-black shadow-2xs'
                                : 'border-2 border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-2.8 h-2.8 stroke-[3]" />}
                          </div>
                        </button>

                        {/* Dish Mini Thumbnail */}
                        <div
                          onClick={() => onSelectDish?.(item.dish)}
                          className="w-11 h-11 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 cursor-pointer border border-slate-200"
                        >
                          <DishImage
                            src={item.dish.image}
                            alt={item.dish.name}
                            category={item.dish.category}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Dish Details */}
                        <div className="flex-1 min-w-0 pr-1">
                          <h4
                            onClick={() => onSelectDish?.(item.dish)}
                            className="font-black text-xs sm:text-sm text-slate-900 truncate leading-tight cursor-pointer hover:text-[#54801A]"
                          >
                            {item.dish.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-tight truncate">
                            {specs}
                          </p>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-[11px] font-black text-[#FF1458]">¥</span>
                            <span className="text-sm font-black text-[#DB2777]">
                              {item.dish.dealPrice}
                            </span>
                            {item.dish.originalPrice && item.dish.originalPrice > item.dish.dealPrice && (
                              <span className="text-[11px] text-slate-400 line-through">
                                ¥{item.dish.originalPrice}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Stepper: [-] QTY [+] */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => onRemoveFromCart(item.dish)}
                            className="w-5 h-5 rounded-full border border-slate-300 bg-white text-slate-700 hover:border-slate-500 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="text-xs sm:text-sm font-black text-slate-900 w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onAddToCart(item.dish)}
                            className="w-5 h-5 rounded-full bg-[#C7F665] border border-black text-black hover:bg-[#B7EF4B] active:scale-95 flex items-center justify-center transition-all cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* B. Integrated Bottom Bar */}
          <div
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full cursor-pointer flex items-center justify-between p-1.5 pl-3 select-none"
          >
            {/* Left: Mascot Bag Icon & Total Price */}
            <div className="flex items-center gap-2.5">
              {/* Cute Lime Green Mascot Bag with smiling face */}
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-2xl bg-[#C7F665] border-2 border-black flex flex-col items-center justify-center shadow-sm relative transform hover:scale-105 transition-transform">
                  {/* Bag handles */}
                  <div className="absolute -top-1.5 w-3.5 h-2 rounded-t-full border-2 border-black bg-transparent" />
                  {/* Cute face */}
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className="w-1 h-1 rounded-full bg-black" />
                    <div className="w-1 h-1 rounded-full bg-black" />
                  </div>
                  {/* Smiling mouth */}
                  <div className="w-2 h-0.5 rounded-b-full border-b-2 border-x border-black" />
                </div>
                {/* Quantity Badge */}
                <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-[#E60012] text-white text-[9.5px] font-black flex items-center justify-center shadow-xs border border-white leading-none">
                  {totalCount}
                </span>
              </div>

              {/* Price Line */}
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs sm:text-[13px] text-black font-extrabold">预计到手</span>
                  <span className="text-xs sm:text-sm text-[#FF1458] font-black ml-0.5">¥</span>
                  <span className="text-lg sm:text-xl font-black text-[#DB2777] leading-none">
                    {subtotal.toFixed(1)}
                  </span>
                  {originalSubtotal > subtotal && (
                    <span className="text-[11px] text-slate-400 line-through ml-1">
                      ¥{originalSubtotal.toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 font-medium leading-none mt-0.5 flex items-center gap-0.5">
                  <span>{isExpanded ? '点击收起明细' : '点击查看已选商品'}</span>
                  <span className="text-slate-400">&gt;</span>
                </div>
              </div>
            </div>

            {/* Right: "去结算" Checkout CTA Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenCheckout();
              }}
              className="px-5 py-2 rounded-full bg-[#C7F665] hover:bg-[#B7EF4B] active:scale-95 text-black text-xs sm:text-sm font-black shadow-xs transition-all flex items-center gap-1.5 flex-shrink-0 border-2 border-black cursor-pointer"
            >
              <span>去结算</span>
              <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[9px] font-black leading-none">&gt;</span>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
};
