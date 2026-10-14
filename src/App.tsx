import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { DeviceFrameWrapper } from './components/DeviceFrameWrapper';
import { HeaderBar } from './components/HeaderBar';
import { HomePage } from './components/HomePage';
import { MenuPage } from './components/MenuPage';
import { CartPage } from './components/CartPage';
import { OrdersPage } from './components/OrdersPage';
import { MePage } from './components/MePage';
import { FavPage } from './components/FavPage';
import { GachaPage } from './components/GachaPage';
import { FloatingCart } from './components/FloatingCart';
import { BottomNavBar } from './components/BottomNavBar';
import { ProductDetailPage } from './components/ProductDetailPage';
import { StoreModal } from './components/StoreModal';
import { LoginModal } from './components/LoginModal';
import { NutritionReportModal } from './components/NutritionReportModal';
import { Toast } from './components/Toast';
import { LoadingScreen } from './components/LoadingScreen';

import {
  Dish,
  CartItem,
  OrderMode,
  Store,
  Coupon,
  Order,
  UserProfile
} from './types';
import {
  DISHES,
  STORES,
  INITIAL_COUPONS,
  INITIAL_ORDERS
} from './data/mockData';

export default function App() {
  // Navigation & Mode
  const [activeTab, setActiveTab] = useState<string>('menu');
  const [previousTab, setPreviousTab] = useState<string>('menu');
  const [orderMode, setOrderMode] = useState<OrderMode>('takeout');
  const [currentStore, setCurrentStore] = useState<Store>(STORES[0]);

  // Cart & Orders & Favorites State
  const [cart, setCart] = useState<Record<number, number>>({ 1: 1, 3: 1 });
  const [customDishes, setCustomDishes] = useState<Record<number, Dish>>({});
  const [favorites, setFavorites] = useState<Set<number>>(new Set([1]));
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(INITIAL_COUPONS[0]);

  // User Profile
  const [user, setUser] = useState<UserProfile>({
    name: 'Alex Morgan',
    avatar: '',
    phone: '13888886666',
    isLoggedIn: true,
    level: '黄金会员 LV.2',
    points: 680,
    nextLevelPoints: 1000
  });

  // Selected dish for full-page product detail
  const [selectedDishDetail, setSelectedDishDetail] = useState<Dish | null>(DISHES[0]);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isNutritionReportOpen, setIsNutritionReportOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // 下层在退场淡出期间也保持 inert，避免点击穿透和键盘进入底部导航。
  const [isLoadingOverlayPresent, setIsLoadingOverlayPresent] = useState(true);
  const [isLoadingReplay, setIsLoadingReplay] = useState(false);
  const reduceMotion = useReducedMotion();
  const finishLoading = useCallback(() => setIsLoading(false), []);
  const startLoading = useCallback(() => {
    setIsLoadingReplay(true);
    setIsLoadingOverlayPresent(true);
    setIsLoading(true);
  }, []);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  // Cart Item calculation helpers
  const cartItems: CartItem[] = Object.entries(cart)
    .map(([idStr, qty]) => {
      const numId = Number(idStr);
      const dish = DISHES.find((d) => d.id === numId) || customDishes[numId];
      const quantity = Number(qty);
      if (!dish || quantity <= 0) return null;
      return { dish, quantity };
    })
    .filter((item): item is CartItem => item !== null);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSelectDish = (dish: Dish) => {
    setSelectedDishDetail(dish);
    setIsProductDetailOpen(true);
  };

  const handleCloseProductDetail = () => {
    setIsProductDetailOpen(false);
    if (activeTab === 'product-detail') {
      setActiveTab(previousTab || 'home');
    }
  };

  const handleAddToCart = (dish: Dish, qty: number = 1) => {
    if (!DISHES.some((d) => d.id === dish.id)) {
      setCustomDishes((prev) => ({ ...prev, [dish.id]: dish }));
    }
    setCart((prev) => ({
      ...prev,
      [dish.id]: (prev[dish.id] || 0) + qty
    }));
    showToast(`🛒 已添加【${dish.name}】${qty > 1 ? `×${qty}` : ''}到购物车`);
  };

  const handleBuyNow = (dish: Dish, qty: number = 1) => {
    setCart((prev) => ({
      ...prev,
      [dish.id]: (prev[dish.id] || 0) + qty
    }));
    setIsProductDetailOpen(false);
    showToast(`🛒 已添加【${dish.name}】到购物车，可在微信小程序中结算`);
  };

  const handleOpenCheckout = () => {
    if (cartItems.length === 0) {
      showToast('🛒 购物车还是空的，快去挑选心仪轻食吧');
      return;
    }
    showToast('📱 已同步购物车，结算将在微信小程序中完成');
  };

  const handleRemoveFromCart = (dish: Dish) => {
    setCart((prev) => {
      const next = { ...prev };
      const current = next[dish.id] || 0;
      if (current <= 1) {
        delete next[dish.id];
      } else {
        next[dish.id] = current - 1;
      }
      return next;
    });
  };

  const handleClearCart = () => {
    setCart({});
    showToast('🗑️ 购物车已清空');
  };

  const handleToggleFavorite = (dishId: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(dishId)) {
        next.delete(dishId);
        showToast('已从收藏中移除');
      } else {
        next.add(dishId);
        showToast('❤️ 已加入我的收藏');
      }
      return next;
    });
  };

  const handleReorder = (order: Order) => {
    const newCart: Record<number, number> = {};
    order.items.forEach((item) => {
      newCart[item.dish.id] = item.quantity;
    });
    setCart(newCart);
    setActiveTab('cart');
    showToast('🛒 菜品已重新加入购物车');
  };

  const handleClaimGachaCoupon = (newCoupon: Coupon) => {
    setCoupons((prev) => [newCoupon, ...prev]);
    setSelectedCoupon(newCoupon);
  };

  const handlePaymentSuccess = () => {
    // Generate new order
    const subtotal = cartItems.reduce(
      (acc, item) => acc + item.dish.dealPrice * item.quantity,
      0
    );
    const freeThreshold = 40;
    const deliveryFee = orderMode === 'pickup' ? 0 : subtotal >= freeThreshold ? 0 : 4;
    const packageFee = 2;
    const discount = selectedCoupon ? selectedCoupon.discount : 0;
    const finalTotal = Math.max(0, subtotal + deliveryFee + packageFee - discount);

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNo: `#20260822${Math.floor(100 + Math.random() * 900)}`,
      createdAt: '刚刚',
      mode: orderMode,
      storeName: currentStore.name,
      address:
        orderMode === 'takeout'
          ? '静安寺路 88 号 嘉里中心 2F 208室'
          : `${currentStore.name} 门店自取柜`,
      items: [...cartItems],
      subtotal,
      deliveryFee,
      discount,
      total: finalTotal,
      status: orderMode === 'takeout' ? 'delivering' : 'cooking',
      statusText:
        orderMode === 'takeout'
          ? '后厨已接单，骑手正在路上'
          : '后厨制作中，预计 10 分钟后可取',
      estimatedTime: orderMode === 'takeout' ? '约 25 分钟' : '约 10 分钟'
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCart({});
    setActiveTab('orders');
    showToast('🎉 支付成功！已为您生成点餐订单');
  };

  const handleLoginSuccess = (name: string, phone: string) => {
    setUser({
      name,
      avatar: '',
      phone,
      isLoggedIn: true,
      level: '黄金会员 LV.2',
      points: 800,
      nextLevelPoints: 1000
    });
    showToast(`欢迎回来，${name}！`);
  };

  const handleLogout = () => {
    setUser((prev) => ({
      ...prev,
      isLoggedIn: false,
      name: '游客用户',
      points: 0
    }));
    showToast('已退出登录');
  };

  const favoriteDishesList = DISHES.filter((d) => favorites.has(d.id));
  const popularDishesList = DISHES.filter((d) => d.isPopular);
  const ongoingOrdersCount = orders.filter(
    (o) => o.status === 'delivering' || o.status === 'cooking' || o.status === 'pending'
  ).length;

  return (
    <DeviceFrameWrapper
      bgColor={activeTab === 'gacha' ? 'bg-[#C7F665]' : 'bg-[#F5F6F8]'}
      fitHeight={activeTab === 'gacha'}
    >
      {/* 本地数据品牌开场：透明度衔接，不缩放整个覆盖层，避免四周露出底层边缝。 */}
      <AnimatePresence onExitComplete={() => setIsLoadingOverlayPresent(false)}>
        {isLoading && (
          <motion.div
            key="brand-loading-screen"
            initial={{ opacity: isLoadingReplay ? 0 : 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.12 : 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-[70] overflow-hidden"
          >
            <LoadingScreen onFinish={finishLoading} duration={1800} canSkip />
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="flex-1 w-full min-h-0 flex flex-col relative overflow-hidden"
        inert={isLoadingOverlayPresent ? true : undefined}
        aria-busy={isLoadingOverlayPresent}
      >
      {/* Toast Notification */}
      <Toast message={toastMessage} />

      {/* Top Header Bar for non-home pages (Home page uses full-bleed banner with floating location capsule if needed) */}
      {activeTab !== 'home' && activeTab !== 'menu' && activeTab !== 'me' && activeTab !== 'gacha' && activeTab !== 'product-detail' && !isProductDetailOpen && (
        <div className="flex-shrink-0 z-20 bg-white">
          <HeaderBar
            currentStore={currentStore}
            mode={orderMode}
            onModeChange={setOrderMode}
            onOpenStoreModal={() => setIsStoreModalOpen(true)}
          />
        </div>
      )}

      {/* Main Tab Screen Content */}
      <main className="flex-1 w-full min-h-0 flex flex-col overflow-hidden relative">
        <motion.div
          animate={{
            scale: isProductDetailOpen ? 0.93 : 1,
            y: isProductDetailOpen ? 6 : 0,
            opacity: isProductDetailOpen ? 0.6 : 1,
            borderRadius: isProductDetailOpen ? 20 : 0,
            filter: isProductDetailOpen ? 'brightness(0.92)' : 'brightness(1)'
          }}
          transition={{
            type: 'spring',
            stiffness: 380,
            damping: 32,
            mass: 0.75
          }}
          className="flex-1 w-full min-h-0 flex flex-col overflow-hidden relative origin-top transform-gpu will-change-transform"
        >
          {activeTab === 'home' && (
            <div className="flex-1 min-h-0 overflow-y-auto">
              <HomePage
                onNavigate={setActiveTab}
                onSelectDish={handleSelectDish}
                onAddToCart={handleAddToCart}
                onSetMode={setOrderMode}
                popularDishes={popularDishesList}
                isLoggedIn={user.isLoggedIn}
                user={user}
                onOpenLogin={() => setIsLoginModalOpen(true)}
                onShowToast={showToast}
              />
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <MenuPage
                dishes={DISHES}
                currentStore={currentStore}
                mode={orderMode}
                onModeChange={setOrderMode}
                onOpenStoreModal={() => setIsStoreModalOpen(true)}
                cartQuantities={cart}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart}
                onSelectDish={handleSelectDish}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onShowToast={showToast}
              />
            </div>
          )}

          {activeTab === 'cart' && (
            <div className="flex-1 min-h-0 overflow-y-auto">
              <CartPage
                cartItems={cartItems}
                mode={orderMode}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart}
                onClearCart={handleClearCart}
                onOpenCheckout={handleOpenCheckout}
                onNavigate={setActiveTab}
                selectedCoupon={selectedCoupon}
                onSelectCoupon={setSelectedCoupon}
                coupons={coupons}
                onSelectDish={handleSelectDish}
              />
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="flex-1 min-h-0 overflow-y-auto">
              <OrdersPage
                orders={orders}
                onReorder={handleReorder}
                onShowToast={showToast}
                onNavigate={setActiveTab}
              />
            </div>
          )}

          {activeTab === 'gacha' && (
            <div className="w-full min-h-0 overflow-y-auto bg-[#C7F665]">
              <GachaPage
                onClaimCoupon={handleClaimGachaCoupon}
                onAddToCart={handleAddToCart}
                onNavigate={setActiveTab}
                onShowToast={showToast}
              />
            </div>
          )}

          {activeTab === 'fav' && (
            <div className="flex-1 min-h-0 overflow-y-auto">
              <FavPage
                favoriteDishes={favoriteDishesList}
                onAddToCart={handleAddToCart}
                onRemoveFavorite={handleToggleFavorite}
                onSelectDish={handleSelectDish}
                onNavigate={setActiveTab}
              />
            </div>
          )}

          {activeTab === 'me' && (
            <div className="flex-1 min-h-0 overflow-y-auto">
              <MePage
                user={user}
                ordersCount={orders.length}
                favsCount={favorites.size}
                coupons={coupons}
                onNavigate={setActiveTab}
                onOpenLogin={() => setIsLoginModalOpen(true)}
                onLogout={handleLogout}
                onShowToast={showToast}
                onOpenNutritionReport={() => setIsNutritionReportOpen(true)}
                onTriggerLoading={startLoading}
              />
            </div>
          )}
        </motion.div>

        {/* Expanding Product Detail Overlay Modal with Card-Zoom Spring Physics */}
        <AnimatePresence>
          {isProductDetailOpen && selectedDishDetail && (
            <>
              {/* Dimmed backdrop layer */}
              <motion.div
                key="product-detail-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.26, ease: 'easeOut' }}
                onClick={handleCloseProductDetail}
                className="absolute inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
              />

              <motion.div
                key={`product-detail-modal-${selectedDishDetail.id}`}
                initial={{
                  opacity: 0,
                  scale: 0.86,
                  y: 40,
                  borderRadius: 28,
                  boxShadow: '0 25px 60px -12px rgba(28, 54, 16, 0.4)'
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  borderRadius: 0,
                  boxShadow: '0 0px 0px 0px rgba(0, 0, 0, 0)'
                }}
                exit={{
                  opacity: 0,
                  scale: 0.86,
                  y: 45,
                  borderRadius: 26,
                  boxShadow: '0 15px 35px -10px rgba(28, 54, 16, 0.3)'
                }}
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 32,
                  mass: 0.75
                }}
                className="absolute inset-0 z-50 overflow-hidden bg-[#F4F6F8] flex flex-col origin-center transform-gpu will-change-transform"
              >
                <ProductDetailPage
                  dish={selectedDishDetail}
                  onBack={handleCloseProductDetail}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  isFav={favorites.has(selectedDishDetail.id)}
                  onToggleFav={handleToggleFavorite}
                  onShowToast={showToast}
                  orderMode={orderMode}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Bottom Cart with Upward Expanding Drawer (Only visible on menu/ordering page when detail is not open) */}
      {activeTab === 'menu' && !isProductDetailOpen && (
        <FloatingCart
          cartItems={cartItems}
          onAddToCart={handleAddToCart}
          onRemoveFromCart={handleRemoveFromCart}
          onClearCart={handleClearCart}
          onOpenCheckout={handleOpenCheckout}
          onSelectDish={handleSelectDish}
        />
      )}

      {/* Fixed Bottom Navigation Bar (Hidden when on product detail page) */}
      {!isProductDetailOpen && (
        <BottomNavBar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setIsProductDetailOpen(false);
            setActiveTab(tab);
          }}
          cartCount={totalCartCount}
          ongoingOrdersCount={ongoingOrdersCount}
        />
      )}

      {/* Store Branch Picker Modal */}
      <StoreModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        currentStore={currentStore}
        onSelectStore={(store) => {
          setCurrentStore(store);
          showToast(`已切换至【${store.name}】`);
        }}
      />

      {/* User Login Authorization Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Nutrition Weekly Intake Report Modal */}
      <NutritionReportModal
        isOpen={isNutritionReportOpen}
        onClose={() => setIsNutritionReportOpen(false)}
      />
      </div>
    </DeviceFrameWrapper>
  );
}
