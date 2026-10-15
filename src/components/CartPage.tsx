import React from 'react';
import { CartItem, Coupon, OrderMode, Dish } from '../types';
import { DishImage } from './DishImage';
import { ShoppingBag, Ticket, Plus, Minus, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';

interface CartPageProps {
  cartItems: CartItem[];
  mode: OrderMode;
  onAddToCart: (dish: CartItem['dish']) => void;
  onRemoveFromCart: (dish: CartItem['dish']) => void;
  onClearCart: () => void;
  onOpenCheckout: () => void;
  onNavigate: (tab: string) => void;
  selectedCoupon: Coupon | null;
  onSelectCoupon: (coupon: Coupon | null) => void;
  coupons: Coupon[];
  onSelectDish?: (dish: Dish) => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  cartItems,
  mode,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  onOpenCheckout,
  onNavigate,
  selectedCoupon,
  coupons,
  onSelectDish
}) => {
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.dish.dealPrice * item.quantity,
    0
  );
  const totalCalories = cartItems.reduce(
    (acc, item) => acc + item.dish.kcal * item.quantity,
    0
  );
  const freeThreshold = 40;
  const needMoreForFree = Math.max(0, freeThreshold - subtotal);
  const deliveryFee = mode === 'pickup' ? 0 : subtotal >= freeThreshold ? 0 : 4;
  const packageFee = cartItems.length > 0 ? 2 : 0;
  const discount = selectedCoupon ? selectedCoupon.discount : 0;
  const finalTotal = Math.max(0, subtotal + deliveryFee + packageFee - discount);

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 mb-4 shadow-sm">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">购物车还是空的</h3>
        <p className="text-sm text-slate-400 mt-1 max-w-xs">
          甄选低脂轻食、减脂能量碗与0卡生椰酸奶昔正在热卖中
        </p>
        <button
          onClick={() => onNavigate('menu')}
          className="mt-6 px-6 py-2.5 rounded-lg bg-slate-900 text-[#C7F665] font-extrabold text-sm shadow-md hover:bg-black active:scale-95 transition-all duration-200 ease-out border border-[#C7F665]/30"
        >
          立即去选餐
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-36">
      {/* Header with Clear Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-extrabold text-slate-900">购物车</h2>
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold">
            共 {cartItems.reduce((a, b) => a + b.quantity, 0)} 件
          </span>
        </div>
        <button
          onClick={onClearCart}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#DB2777] transition-colors font-medium"
        >
          <Trash2 className="w-3.5 h-3.5" />
          清空
        </button>
      </div>

      {/* Free Delivery Bar (Takeout only) */}
      {mode === 'takeout' && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs">
          <div className="flex items-center justify-between mb-1.5 font-bold">
            <span>
              {needMoreForFree === 0
                ? '🎉 已享受满 ¥40 免外卖配送费！'
                : `再买 ¥${needMoreForFree.toFixed(1)} 即可享受免配送费`}
            </span>
            {needMoreForFree > 0 && (
              <button
                onClick={() => onNavigate('menu')}
                className="text-amber-700 font-extrabold hover:underline"
              >
                去凑单 &gt;
              </button>
            )}
          </div>
          <div className="w-full h-1.5 bg-amber-200/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, (subtotal / freeThreshold) * 100)}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Cart Items List */}
      <div className="space-y-2.5">
        {cartItems.map(({ dish, quantity }) => (
          <div
            key={dish.id}
            className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3"
          >
            <div
              onClick={() => onSelectDish && onSelectDish(dish)}
              className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 cursor-pointer hover:opacity-90 active:scale-95 transition-all duration-200 ease-out"
              title="查看商品详情"
            >
              <DishImage
                src={dish.image}
                alt={dish.name}
                category={dish.category}
                className="w-full h-full object-cover"
              />
            </div>
            <div
              onClick={() => onSelectDish && onSelectDish(dish)}
              className="flex-1 min-w-0 cursor-pointer group"
            >
              <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-slate-700 transition-colors">{dish.name}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {dish.kcal} kcal · 单价 ¥{dish.dealPrice}
              </p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xs font-bold text-[#E60012]">¥</span>
                <span className="text-base font-black text-[#E60012]">
                  {(dish.dealPrice * quantity).toFixed(1)}
                </span>
              </div>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onRemoveFromCart(dish)}
                className="w-6.5 h-6.5 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 flex items-center justify-center transition-transform duration-200 ease-out"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-4 text-center text-xs font-bold text-slate-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => onAddToCart(dish)}
                className="w-6.5 h-6.5 rounded-md bg-slate-900 text-[#C7F665] hover:bg-black active:scale-95 flex items-center justify-center shadow-2xs transition-transform duration-200 ease-out border border-[#C7F665]/30 font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Coupon Selector */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ticket className="w-4 h-4 text-[#EC4899]" />
          <span className="text-sm font-bold text-slate-800">轻食优惠券</span>
        </div>
        <div className="flex items-center gap-1">
          {selectedCoupon ? (
            <span className="text-xs font-bold text-[#DB2777] bg-[#FDD3EA] px-2 py-0.5 rounded-md">
              已抵扣 -¥{selectedCoupon.discount}
            </span>
          ) : (
            <span className="text-xs text-slate-400 font-medium">
              {coupons.length} 张可用 &gt;
            </span>
          )}
        </div>
      </div>

      {/* Calories & Nutrition Total Banner */}
      <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs text-slate-800">
        <div className="flex items-center gap-1.5 font-bold">
          <ShieldCheck className="w-4 h-4 text-slate-900" />
          <span>本单健康总热量统计</span>
        </div>
        <span className="font-extrabold text-slate-900 text-sm">
          约 {totalCalories} kcal
        </span>
      </div>

      {/* Price Summary Breakdown */}
      <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-2 text-xs">
        <div className="flex justify-between text-slate-500 font-medium">
          <span>商品小计</span>
          <span>¥{subtotal.toFixed(1)}</span>
        </div>
        <div className="flex justify-between text-slate-500 font-medium">
          <span>环保保温打包费</span>
          <span>¥{packageFee.toFixed(1)}</span>
        </div>
        <div className="flex justify-between text-slate-500 font-medium">
          <span>{mode === 'takeout' ? '外卖配送费' : '门店自取服务费'}</span>
          <span>{deliveryFee === 0 ? '¥0 (已免)' : `¥${deliveryFee.toFixed(1)}`}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-[#E60012] font-bold">
            <span>优惠券抵扣</span>
            <span>-¥{discount.toFixed(1)}</span>
          </div>
        )}
        <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline text-slate-900">
          <span className="font-bold text-sm">合计应付</span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-xs font-bold text-[#E60012]">¥</span>
            <span className="text-2xl font-black text-[#E60012] tracking-tight">
              {finalTotal.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Floating Checkout Bar */}
      <div className="absolute bottom-[72px] inset-x-0 z-30 px-4 max-w-lg mx-auto pointer-events-none">
        <div className="pointer-events-auto flex items-center justify-between p-2.5 pl-4 rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-800">
          <div>
            <span className="text-xs text-slate-400">实付 </span>
            <span className="text-xl font-black text-[#C7F665]">
              ¥{finalTotal.toFixed(1)}
            </span>
          </div>
          <button
            onClick={onOpenCheckout}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#C7F665] hover:bg-[#B7EF4B] text-slate-900 font-black text-sm shadow-md active:scale-95 transition-all duration-200 ease-out"
          >
            <span>去结算</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
