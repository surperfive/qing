import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { DishImage } from './DishImage';
import {
  Clock,
  Bike,
  Store,
  CheckCircle2,
  RotateCcw,
  MessageSquare,
  Utensils,
  MapPin,
  Sparkles,
  ChevronRight,
  ReceiptText,
  Truck,
  Bell
} from 'lucide-react';

interface OrdersPageProps {
  orders: Order[];
  onReorder: (order: Order) => void;
  onShowToast: (msg: string) => void;
  onNavigate: (tab: string) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({
  orders,
  onReorder,
  onShowToast,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'ongoing' | 'done'>('all');

  const ongoingOrdersCount = orders.filter(
    (o) => o.status === 'delivering' || o.status === 'cooking' || o.status === 'ready' || o.status === 'pending'
  ).length;

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'ongoing') {
      return order.status === 'delivering' || order.status === 'cooking' || order.status === 'ready' || order.status === 'pending';
    }
    if (activeTab === 'done') {
      return order.status === 'completed';
    }
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'delivering':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-2xs flex-shrink-0 select-none">
            <Truck className="w-3.5 h-3.5 text-black stroke-[2.5]" />
            <span className="text-xs font-black text-black leading-none">配送中</span>
            <ChevronRight className="w-3.5 h-3.5 text-black stroke-[3] -mr-0.5" />
          </div>
        );
      case 'cooking':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-2xs flex-shrink-0 select-none">
            <Clock className="w-3.5 h-3.5 text-black stroke-[2.5]" />
            <span className="text-xs font-black text-black leading-none">制作中</span>
            <ChevronRight className="w-3.5 h-3.5 text-black stroke-[3] -mr-0.5" />
          </div>
        );
      case 'ready':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-2xs flex-shrink-0 select-none">
            <Store className="w-3.5 h-3.5 text-black stroke-[2.5]" />
            <span className="text-xs font-black text-black leading-none">待取餐</span>
            <ChevronRight className="w-3.5 h-3.5 text-black stroke-[3] -mr-0.5" />
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-2xs flex-shrink-0 select-none">
            <CheckCircle2 className="w-3.5 h-3.5 text-black stroke-[2.5]" />
            <span className="text-xs font-black text-black leading-none">已完成</span>
            <ChevronRight className="w-3.5 h-3.5 text-black stroke-[3] -mr-0.5" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-full bg-[#F4F6F9] text-slate-900 pb-28 select-none">
      {/* 1. Immersive Top Brand Header Area with Energetic Neon Lime Gradient */}
      <div className="relative bg-gradient-to-b from-[#C7F665] via-[#C7F665]/50 to-[#F4F6F9] pt-4 px-4 pb-4 overflow-hidden">
        {/* Subtle Watermark in Top-Right */}
        <div className="absolute right-2 top-3 w-28 h-28 opacity-15 pointer-events-none text-black">
          <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
            <path d="M50 15 C45 8, 30 10, 32 24 C33 32, 42 35, 48 38 C42 45, 30 52, 30 68 C30 82, 42 90, 50 90 C58 90, 70 82, 70 68 C70 52, 58 45, 52 38 C58 35, 67 32, 68 24 C70 10, 55 8, 50 15 Z" />
            <circle cx="38" cy="20" r="4" fill="currentColor" />
          </svg>
        </div>

        {/* Top Title Row & Fast Actions */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-black tracking-tight">我的点餐订单</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-black text-[#C7F665] text-[11px] font-black shadow-2xs">
              {orders.length} 笔
            </span>
          </div>

          <button
            type="button"
            onClick={() => onShowToast('🧾 电子发票助手：支持多单合并开票与数电发票')}
            className="flex items-center gap-1 bg-black text-white px-3 py-1 rounded-full text-xs font-black shadow-2xs hover:bg-black/80 active:scale-95 transition-all duration-200 ease-out"
          >
            <ReceiptText className="w-3.5 h-3.5 text-[#C7F665]" />
            <span>发票服务</span>
          </button>
        </div>

        {/* Filter Tab Buttons with High-Contrast Bold Theme */}
        <div className="flex items-center gap-2 mt-3.5 relative z-10">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1 ${
              activeTab === 'all'
                ? 'bg-black text-[#C7F665] shadow-xs scale-[1.02]'
                : 'bg-white text-slate-800 border-[1.5px] border-slate-200 hover:border-slate-300'
            }`}
          >
            全部订单
            <span className={`text-[10px] ml-0.5 ${activeTab === 'all' ? 'text-[#C7F665]' : 'text-slate-500'}`}>
              ({orders.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ongoing')}
            className={`px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1 ${
              activeTab === 'ongoing'
                ? 'bg-black text-[#C7F665] shadow-xs scale-[1.02]'
                : 'bg-white text-slate-800 border-[1.5px] border-slate-200 hover:border-slate-300'
            }`}
          >
            进行中
            {ongoingOrdersCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#C7F665] inline-block animate-pulse ml-0.5" />
            )}
            <span className={`text-[10px] ml-0.5 ${activeTab === 'ongoing' ? 'text-[#C7F665]' : 'text-slate-500'}`}>
              ({ongoingOrdersCount})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('done')}
            className={`px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1 ${
              activeTab === 'done'
                ? 'bg-black text-[#C7F665] shadow-xs scale-[1.02]'
                : 'bg-white text-slate-800 border-[1.5px] border-slate-200 hover:border-slate-300'
            }`}
          >
            历史完成
            <span className={`text-[10px] ml-0.5 ${activeTab === 'done' ? 'text-[#C7F665]' : 'text-slate-500'}`}>
              ({orders.length - ongoingOrdersCount})
            </span>
          </button>
        </div>
      </div>

      {/* 2. Orders Content List Area */}
      <div className="px-4 space-y-3.5 mt-1">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-[24px] p-8 text-center shadow-xs flex flex-col items-center justify-center my-4">
            <div className="w-18 h-18 rounded-[20px] bg-[#C7F665] flex items-center justify-center text-black mb-3 shadow-none">
              <Utensils className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-black">暂无相关订单记录</h3>
            <p className="text-xs text-slate-600 font-bold mt-1 max-w-xs">
              新鲜时蔬低卡轻食，今日点单满减优惠券已到账 🥗
            </p>
            <button
              onClick={() => onNavigate('menu')}
              className="mt-5 px-6 py-2.5 rounded-full bg-black hover:bg-black/90 text-[#C7F665] text-xs font-black shadow-none active:scale-95 transition-all duration-200 ease-out flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C7F665]" />
              <span>去选一单美味</span>
            </button>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isOngoing = order.status === 'delivering' || order.status === 'cooking' || order.status === 'ready';
            const totalItemsCount = order.items.reduce((s, i) => s + i.quantity, 0);

            return (
              <div
                key={order.id}
                className="bg-white rounded-[26px] p-3.5 shadow-xs space-y-3 hover:shadow-md transition-all duration-200 relative overflow-hidden"
              >
                {/* Top Lime-Green Ambient Gradient Wash - Exactly Matching Reference Image */}
                <div className="absolute top-0 inset-x-0 h-22 bg-gradient-to-b from-[#C7F665] via-[#E4F8BC]/75 to-transparent pointer-events-none z-0" />

                {/* 1. Order Card Header: Courier Silhouette, Store Name, Mode Tag & Status Badge */}
                <div className="flex items-center justify-between relative z-10 pt-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {/* Delivery Scooter Silhouette Icon */}
                    <svg
                      viewBox="0 0 28 20"
                      className="w-5.5 h-4.5 text-black flex-shrink-0"
                      fill="currentColor"
                    >
                      <circle cx="13.5" cy="4" r="2.8" />
                      <path d="M7.5 9.5c0-1.1.9-2 2-2h3.5c1.1 0 2 .9 2 2v4.5h-7.5V9.5z" />
                      <path
                        d="M14 7l4.5 2.2M16.5 7l2.2 4.5 2.3 4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                      <path
                        d="M5 16h16"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M5.5 12a3.8 3.8 0 100 7.6 3.8 3.8 0 000-7.6zm0 2a1.8 1.8 0 100 3.6 1.8 1.8 0 000-3.6z"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M21 12a3.8 3.8 0 100 7.6 3.8 3.8 0 000-7.6zm0 2a1.8 1.8 0 100 3.6 1.8 1.8 0 000-3.6z"
                      />
                    </svg>

                    <span className="font-black text-black text-[15px] tracking-tight truncate">
                      {order.storeName}
                    </span>
                    <span className="text-[13px] font-extrabold text-[#54801A] whitespace-nowrap ml-0.5">
                      ({order.mode === 'takeout' ? '外卖' : '自提'})
                    </span>
                  </div>

                  {getStatusBadge(order.status)}
                </div>

                {/* 2. Order Dish Thumbnails, Name, Subtitle & Highlighted Price */}
                <div className="flex items-center gap-3 relative z-10 pt-0.5">
                  {/* Dish photo container - wide rounded rectangle with black border */}
                  <div className="w-[84px] h-[58px] rounded-[16px] border border-slate-200 overflow-hidden flex-shrink-0 bg-white relative flex shadow-2xs">
                    {order.items.length > 1 ? (
                      <>
                        <div className="w-1/2 h-full overflow-hidden border-r border-black/10">
                          <DishImage
                            src={order.items[0].dish.image}
                            alt={order.items[0].dish.name}
                            category={order.items[0].dish.category}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="w-1/2 h-full overflow-hidden">
                          <DishImage
                            src={order.items[1].dish.image}
                            alt={order.items[1].dish.name}
                            category={order.items[1].dish.category}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </>
                    ) : (
                      <DishImage
                        src={order.items[0]?.dish.image}
                        alt={order.items[0]?.dish.name}
                        category={order.items[0]?.dish.category}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Dish Title & Meta */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-black text-black truncate leading-tight tracking-tight">
                      {order.items.map((i) => `${i.dish.name} ×${i.quantity}`).join(' + ')}
                    </p>
                    <p className="text-[11px] text-[#8a92a0] font-bold mt-1 tracking-tight">
                      {order.createdAt.includes('下午') || order.createdAt.includes('上午')
                        ? order.createdAt
                        : `${order.createdAt} 下午`}{' '}
                      · 共 {totalItemsCount} 件
                    </p>
                  </div>

                  {/* Price with Cute Lime Highlight & Sprout */}
                  <div className="flex items-end gap-1.5 flex-shrink-0 pb-0.5">
                    <div className="flex flex-col items-center justify-end leading-none">
                      <svg viewBox="0 0 20 16" className="w-3.5 h-3 text-[#54801A] mb-0.5" fill="currentColor">
                        <path d="M10 13c0-3.5 2-6 7-6 0 4.5-3 7-7 6z" />
                        <path d="M10 13c0-3-1.8-5-6-5 0 3.8 2.5 6 6 5z" />
                        <path d="M10 13v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      <span className="text-[10px] text-slate-500 font-bold leading-none">实付</span>
                    </div>
                    <div className="relative flex items-baseline leading-none">
                      {/* Lime green highlighter underline stroke */}
                      <span className="absolute -bottom-0.5 -left-1 -right-1 h-2 bg-[#C7F665] rounded-xs -rotate-1 z-0 pointer-events-none" />
                      <span className="relative z-10 text-xs font-black text-black mr-0.5">¥</span>
                      <span className="relative z-10 text-[23px] font-black text-black tracking-tight">
                        {order.total.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Status Notice Banner - Soft Lime Tint with Clock & Chevron */}
                <div
                  className={`py-2.5 px-3 rounded-[14px] flex items-center justify-between text-xs transition-colors relative z-10 ${
                    order.status === 'delivering'
                      ? 'bg-[#E4F8BC] text-black font-black'
                      : order.status === 'cooking'
                      ? 'bg-[#fef9c3] text-black font-black'
                      : order.status === 'ready'
                      ? 'bg-[#E4F8BC] text-black font-black'
                      : 'bg-[#f4f7fa] text-slate-800 font-bold'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Clock className="w-3.5 h-3.5 text-black stroke-[2.4] flex-shrink-0" />
                    <span className="truncate text-xs font-black text-black leading-none">
                      {order.statusText}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5 flex-shrink-0 ml-2">
                    <span className="text-xs font-black text-black whitespace-nowrap leading-none">
                      {order.estimatedTime}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-black stroke-[3]" />
                  </div>
                </div>

                {/* 4. Action Buttons Row - Exact Match to Reference Image */}
                <div className="flex items-center gap-2 pt-0.5 relative z-10">
                  {order.status === 'delivering' && (
                    <button
                      onClick={() => onShowToast('🛵 骑手正在全速派送中，预计 10 分钟内送达！')}
                      className="flex-1 h-9 px-3 rounded-full bg-white border border-slate-200 flex items-center justify-center gap-1.5 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all duration-200 ease-out cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-black fill-black flex-shrink-0" />
                      <span className="text-xs font-black text-black whitespace-nowrap">
                        查看骑手位置
                      </span>
                    </button>
                  )}

                  {order.status !== 'completed' && (
                    <button
                      onClick={() => onShowToast('⚡ 已为您向门店加急催单，后厨正在优先制作！')}
                      className="h-9 px-3.5 sm:px-4 rounded-full bg-[#fef075] flex items-center justify-center gap-1.5 shadow-2xs hover:bg-[#faea5a] active:scale-95 transition-all duration-200 ease-out cursor-pointer"
                    >
                      <Bell className="w-3.5 h-3.5 text-black fill-black flex-shrink-0" />
                      <span className="text-xs font-black text-black whitespace-nowrap">
                        加急催单
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => onReorder(order)}
                    className="h-9 px-4 rounded-full bg-black flex items-center justify-center gap-1.5 shadow-xs hover:bg-black/90 active:scale-95 transition-all duration-200 ease-out cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#C7F665] stroke-[2.8] flex-shrink-0" />
                    <span className="text-xs font-black text-[#C7F665] whitespace-nowrap">
                      再来一单
                    </span>
                  </button>

                  {order.status === 'completed' && (
                    <button
                      onClick={() => onShowToast('⭐ 感谢评价！已赠送 50 会员积分')}
                      className="flex-1 h-9 px-3.5 rounded-full border border-slate-200 bg-white text-black text-xs font-black hover:bg-slate-50 active:scale-95 transition-all duration-200 ease-out shadow-2xs flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>去评价</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

