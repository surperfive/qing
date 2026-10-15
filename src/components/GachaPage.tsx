import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GACHA_INGREDIENTS } from '../data/mockData';
import { GachaIngredient, Coupon, Dish } from '../types';
import { FoodCloche3D } from './FoodCloche3D';
import { GachaBurstReveal } from './GachaBurstReveal';
// 暂未接入：背景目前是内联 img + SVG 波浪层。见文件末尾「未接入的常量」说明。
import { CloudSkyBackground } from './CloudSkyBackground';
import { CheckBadge, CheckIcon } from './CheckBadge';
import { OPTION_CARD_SELECTED, OPTION_CARD_UNSELECTED } from '../tokens';
import { resumeAudio, warmUpAudio } from '../utils/audioContext';
import { ingredientArt } from '../utils/ingredientArt';
import {
  X,
  Sparkles,
  Check,
  Crown,
  Plus,
  RefreshCw,
  Award,
  Info,
  Truck,
  ArrowRight
} from 'lucide-react';

interface GachaPageProps {
  onClaimCoupon?: (coupon: Coupon) => void;
  onAddToCart?: (dish: Dish, qty?: number) => void;
  onNavigate: (tab: string) => void;
  onShowToast: (msg: string) => void;
}

const MIN_DELIVERY_ITEMS = 10;

// Daily Tasks for getting more Gacha coins
const DAILY_TASKS = [
  { id: 'sign', title: '每日签到', reward: '+1 抽卡币', icon: 'calendar', done: false, actionText: '领 1 币' },
  { id: 'browse', title: '浏览特惠', reward: '+1 抽卡币', icon: 'flame', done: false, actionText: '去完成' },
  { id: 'order', title: '完成点单', reward: '+5 抽卡币', icon: 'utensils', done: false, actionText: '去点餐' },
  { id: 'share', title: '好友助力', reward: '+1 抽卡币', icon: 'share', done: false, actionText: '去邀请' },
];

// Drop Rate Specifications
const DROP_RATES = [
  { rarity: 'SSR', title: '深海优质蛋白/牛排', rate: '15%', color: 'from-amber-400 to-yellow-500', border: 'border-amber-300', bg: 'bg-amber-50', text: 'text-amber-800' },
  { rarity: 'SR', title: '牛油果/藜麦/海虾', rate: '35%', color: 'from-purple-500 to-indigo-500', border: 'border-purple-300', bg: 'bg-purple-50', text: 'text-purple-800' },
  { rarity: 'R', title: '鲜蔬配料/低卡主基底', rate: '50%', color: 'from-[#C7F665] to-[#C7F665]', border: 'border-[#C7F665]', bg: 'bg-[#F2FCE0]', text: 'text-[#26430B]' },
];

export const GachaPage: React.FC<GachaPageProps> = ({
  onAddToCart,
  onNavigate,
  onShowToast
}) => {
  // Skip animation toggle
  const [skipAnimation, setSkipAnimation] = useState(false);

  // User Gacha Token balance
  const [tokens, setTokens] = useState(12);

  // Daily check-in status (only 1 coin per day)
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [isClocheOpen, setIsClocheOpen] = useState(false);
  const [drawRarity, setDrawRarity] = useState<'SSR' | 'SR' | 'R' | null>(null);
  const [drawnIngredients, setDrawnIngredients] = useState<GachaIngredient[]>([]);
  const [lastDrawMode, setLastDrawMode] = useState<'single' | 'ten'>('single');
  // 「9折限时」徽章是否已停止促销动效（用户至少抽过一次十连抽后就不再打扰）。
  // ⚠️ 不能复用 lastDrawMode 判据：它初始值就是 'single'，
  // 拿它当"是否抽过十连抽"会在进页面时误判为已用过。
  const [hasUsedTenDraw, setHasUsedTenDraw] = useState(false);
  // 食材横向滑动队列的当前页索引（分页圆点指示用）。
  // 每次开弹窗重置到 0 —— 否则上次滑到第 5 个，重新打开会停在那儿。

  // Modals
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showGetTokensModal, setShowGetTokensModal] = useState(false);
  const [showDeliverySuccessModal, setShowDeliverySuccessModal] = useState(false);

  /* ==========================================================================
     抽卡爆裂揭示覆盖层（GachaBurstReveal）状态
     --------------------------------------------------------------------------
     旧流程：抽卡 → 餐盖掀开 → 1350ms 后只弹一个 toast，**没有任何结果展示**。
     新流程：抽卡 → 餐盖掀开 → 光点从餐盘爆裂飞出 → 消散 → 食材原地揭示
             → 飞入下方「食材库」网格。

     ⚠️ revealOrigin 用 useState 而非 ref：覆盖层需要这个坐标做定位，
     而 ref 变化不会触发重渲染 —— 首次抽卡时覆盖层会拿到 null 而直接不渲染。
     ========================================================================== */
  const [revealActive, setRevealActive] = useState(false);
  const [revealItems, setRevealItems] = useState<GachaIngredient[]>([]);
  const [revealMode, setRevealMode] = useState<'single' | 'ten'>('single');
  const [revealOrigin, setRevealOrigin] = useState<{ x: number; y: number } | null>(null);

  // 食材库网格卡片的 DOM 引用：飞行落点靠它反查屏幕坐标。
  // key = 食材 id（含分类筛选时未渲染的卡片，所以查不到时要能优雅降级）。
  const pantryCardRefs = useRef<Map<string, HTMLElement | null>>(new Map());

  /* resolvePantryTarget 的函数引用必须恒定（见 GachaBurstReveal 里
     「resolveTargetRect / onComplete 刻意不进依赖」那段注释），
     所以 pantry / revealItems 用 ref 透传最新值，不写进 useCallback 依赖。
     pantryRef 在 pantry 状态声明之后才赋值（见下方）。 */
  const revealItemsRef = useRef<GachaIngredient[]>([]);
  revealItemsRef.current = revealItems;

  /**
   * 求某个食材在食材库网格里的落点（**视口坐标**）。
   *
   * ⚠️ 入库顺序是「**新食材插到最前面，已有食材整体后移**」（见 mergePantry），
   * 所以未来顺序 = [...本次新抽到的, ...已有]，而新食材在动画播完前**还没入库**，
   * DOM 里查不到它的卡片 —— 必须按未来索引去反查/外推，否则新食材会拿不到落点、
   * 只能原地淡出（这正是「单抽飞不进第一格」的原因）。
   *
   * 返回 null 的情况（调用方需原地淡出，不能飞向错误坐标）：
   *   ① 分类筛选把卡片藏了，或卡片未渲染完成；
   *   ② 未来索引超出已有卡片范围且几何不可靠（无法安全外推）。
   */
  const resolvePantryTarget = useCallback(
    (ingredientId: string): { x: number; y: number } | null => {
      const existingIds = pantryRef.current.map((p) => p.id);

      // 收集已渲染卡片的矩形（DOM 顺序 = pantry 顺序）
      const rects: DOMRect[] = [];
      for (const id of existingIds) {
        const el = pantryCardRefs.current.get(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) rects.push(r);
      }
      if (rects.length === 0) return null;
      // 渲染不全（分类筛选生效）时，索引与几何都对不上，只服务已有食材
      const geometryReliable = rects.length === existingIds.length;

      // 本次新抽到、且尚未入库的食材（保持抽到的顺序，去重）
      const owned = new Set(existingIds);
      const freshIds: string[] = [];
      const seen = new Set<string>();
      for (const it of revealItemsRef.current) {
        if (owned.has(it.id) || seen.has(it.id)) continue;
        seen.add(it.id);
        freshIds.push(it.id);
      }

      const futureIdx = [...freshIds, ...existingIds].indexOf(ingredientId);
      if (futureIdx < 0) return null;

      // ① 该未来格子已经有卡片 → 直接用它现在的真实坐标
      const hit = rects[futureIdx];
      if (hit) return { x: hit.left + hit.width / 2, y: hit.top + hit.height / 2 };

      // ② 超出已有卡片 → 用已有卡片的几何外推格子位置
      if (!geometryReliable) return null;
      const first = rects[0];
      const cellW = first.width;
      const cellH = first.height;
      let cols = 1;
      for (let i = 1; i < rects.length; i++) {
        if (Math.abs(rects[i].top - first.top) < 2) cols++;
        else break;
      }
      const gapX = cols > 1 ? rects[1].left - first.left - cellW : 0;
      const gapY = rects.length > cols ? rects[cols].top - first.top - cellH : 0;
      const col = futureIdx % cols;
      const row = Math.floor(futureIdx / cols);
      return {
        x: first.left + col * (cellW + gapX) + cellW / 2,
        y: first.top + row * (cellH + gapY) + cellH / 2
      };
    },
    []
  );

  /**
   * 入库合并：**新食材插到最前面**（保持抽到的顺序），已有食材整体后移一位。
   * 已拥有的食材不重复插入，但用最新数据覆盖（价格/描述可能变过）。
   */
  const mergePantry = useCallback(
    (prev: GachaIngredient[], incoming: GachaIngredient[]): GachaIngredient[] => {
      const owned = new Set(prev.map((p) => p.id));
      const fresh: GachaIngredient[] = [];
      const seen = new Set<string>();
      for (const it of incoming) {
        if (owned.has(it.id) || seen.has(it.id)) continue;
        seen.add(it.id);
        fresh.push(it);
      }
      const byId = new Map(incoming.map((i) => [i.id, i]));
      return [...fresh, ...prev.map((p) => byId.get(p.id) ?? p)];
    },
    []
  );

  /**
   * 把「食材库」滚进视野，让飞行落点落在屏幕中部，而不是贴着底部导航。
   *
   * 为什么要滚：食材库在长页面的下半部分，网格第一行本来就在 y≈550，
   * 第二行 y≈840 几乎压着底部导航，第 3 行往下完全在折叠线以下 ——
   * 十连的落点算得再准，也落在看不见或很难看的位置。
   *
   * 时机：**覆盖层亮起时**（t=2000ms）调用。此时暗底已经铺上，滚动不刺眼；
   * 而飞行落点要到 +1250ms（十连）/ +620ms（单抽）才测量，滚动有充足时间稳定。
   * 滚完的目标位置：网格第一行落在滚动容器可视区顶部往下 120px 处。
   */
  const scrollPantryIntoView = useCallback(() => {
    const grid = document.querySelector('#unified-pantry-big-card .grid') as HTMLElement | null;
    const firstCard = grid?.firstElementChild as HTMLElement | null;
    if (!firstCard) return;

    // 往上找最近的可滚动祖先（应用整个页面渲染在 DeviceFrameWrapper 的手机壳内，
    // 滚动的不是 window 而是壳里的内容容器）
    let scroller: HTMLElement | null = firstCard.parentElement;
    while (scroller && scroller !== document.body) {
      const oy = getComputedStyle(scroller).overflowY;
      if ((oy === 'auto' || oy === 'scroll') && scroller.scrollHeight > scroller.clientHeight) break;
      scroller = scroller.parentElement;
    }
    if (!scroller || scroller === document.body) return;

    const delta = firstCard.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 120;
    if (Math.abs(delta) < 8) return;
    scroller.scrollTo({ top: scroller.scrollTop + delta, behavior: 'smooth' });
  }, []);

  /**
   * 抽卡时把餐盘位置换算成覆盖层起爆点（**视口坐标**）。
   * 优先用 3D 餐盖容器；它不在 DOM 里时退到抽卡按钮组，
   * 最后兜底到视口中心偏上 —— 保证覆盖层永远有坐标可用。
   */
  const measureRevealOrigin = useCallback((): { x: number; y: number } => {
    const candidates = ['#gacha-food-cloche-container', '#gacha-action-buttons-group'];
    for (const sel of candidates) {
      const el = document.querySelector(sel) as HTMLElement | null;
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      // 起爆点取餐盘中心稍偏下 —— 光点是"从盘子里飞出来"，
      // 取正中心会让光点看起来从餐盖顶上冒出，语义不对。
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.62 };
    }
    return { x: window.innerWidth / 2, y: window.innerHeight * 0.4 };
  }, []);

  // Press-down tactile click animation state for draw buttons
  const [pressedButton, setPressedButton] = useState<'single' | 'ten' | null>(null);

  // 空闲预热共享音频上下文（幂等）。本页有按压音、餐盖有水晶音，都要用同一个上下文。
  useEffect(() => {
    warmUpAudio();
  }, []);

  // Tactile audio & haptic feedback for press down animation
  const playPressSound = (type: 'single' | 'ten') => {
    try {
      /* 复用全局单例，不再自己 new。
         原来这里每次按下都 new AudioContext()：首次构造会阻塞主线程约 230ms
         （正好砸在掀盖动画起跑那一帧），而且从不 close() → 抽几次就把
         Chrome 每页约 6 个的上限用满，之后音效直接失效。
         详见 src/utils/audioContext.ts 的踩坑记录。 */
      const ctx = resumeAudio();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type === 'single' ? 'triangle' : 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(type === 'single' ? 360 : 280, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.05);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
      if ('vibrate' in navigator) {
        navigator.vibrate?.(type === 'ten' ? [15, 20, 15] : 12);
      }
    } catch {
      // Soft audio fallback if blocked by browser policy
    }
  };



  // User's accumulated pantry of ingredients from Gacha.
  // 初始 3 款直接引用 GACHA_INGREDIENTS 里的条目，不手写副本。
  // 旧实现手写了一份同 id 的数据，和奖池定义已经漂移（番茄 price 3 vs 2、
  // protein 1.1 vs 1、carbs 4.8 vs 4.5），玩家抽到番茄后 map.set 会用奖池版本
  // 覆盖，表现为卡片价格从 ¥3 悄悄跳成 ¥2。
  //
  // ⚠️ 这三个 id 必须都存在于奖池中。奖池曾精简为 10 款（SSR1/SR3/R6），
  // 原本的 ing_salmon（三文鱼）已被移出奖池，若这里继续引用，
  // .find() 会返回 undefined 被 .filter 掉 —— 初始只剩 2 款，且不会报错。
  // 现改为 ing_steak（保留的唯一 SSR），三个 id 都在奖池内。
  const [pantry, setPantry] = useState<GachaIngredient[]>(() =>
    (['ing_tomato', 'ing_kale', 'ing_steak'] as const)
      .map((id) => GACHA_INGREDIENTS.find((g) => g.id === id))
      .filter((g): g is GachaIngredient => Boolean(g))
  );

  /* 食材库当前顺序的 ref 镜像 —— 给 resolvePantryTarget 用（函数引用必须恒定，
     所以不能把 pantry 写进它的 useCallback 依赖，见该函数上方的注释）。 */
  const pantryRef = useRef<GachaIngredient[]>(pantry);
  pantryRef.current = pantry;

  // Selected ingredients inside user's active customized meal bowl (starts empty: 0 selected)
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<Set<string>>(
    new Set<string>()
  );

  // Category filter for pantry list in the long page
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'protein' | 'base' | 'topping' | 'sauce'>('all');

  /* 只在「抽卡入库重排」的那一瞬间打开 layout 动画。
     ⚠️ 不能常开 —— 分类切换时卡片进出场是纯 opacity 交叉淡化，
     叠上 layout 会让移动中的卡片横穿正在淡出的卡片，实测重叠+拉伸变形很严重
     （见 scripts/probe-category-switch.mjs 抓到的 mid.png）。 */
  const [reorderAnim, setReorderAnim] = useState(false);

  // Check how many of the 10 target ingredients are collected
  const collectedCount = pantry.length;
  const isDeliveryGoalMet = collectedCount >= MIN_DELIVERY_ITEMS;

  // Render Ingredient Visual in progress slots
  const renderIngredientVisual = (id: string, name: string, iconClass?: string) => {
    // 默认尺寸给「食材图鉴」弹窗里 w-9 h-9 的方框用；正方形插画可以吃满。
    const cls = iconClass || "w-8 h-8";
    // 奖池 10 款现在都有插画（public/ingredients/*.png），映射统一收在
    // utils/ingredientArt —— 这里不再各写一份 switch，否则「飞进去的」
    // 和「格子里的」会漂移。
    const art = ingredientArt(id);
    if (art) {
      return (
        <img
          src={art}
          alt={name}
          draggable={false}
          className={`${cls} object-contain select-none`}
        />
      );
    }
    // emoji 兜底：只服务已移出奖池的旧 id（旧 localStorage 里可能还留着）。
    // 优先从 pantry 取（已入库），其次从奖池取，最后才用通用沙拉 emoji。
    // ⚠️ 不能只查 pantry —— 刚抽到、尚未写入 pantry 的那一帧会掉到 🥗，
    // 导致食材图标闪一下再变回来。
    return (
      <span className="text-lg select-none leading-none">
        {pantry.find((i) => i.id === id)?.emoji ??
          GACHA_INGREDIENTS.find((g) => g.id === id)?.emoji ??
          '🥗'}
      </span>
    );
  };

  /**
   * 按稀有度权重抽单种食材。
   * 权重与 DROP_RATES 展示的 15% / 35% / 50% 严格一致（改这里必须同步改 DROP_RATES）。
   * 同稀有度内优先给未收集的，避免玩家卡在同一种上——但不改变稀有度分布。
   */
  const drawSingle = (): GachaIngredient => {
    const rand = Math.random();
    let rarity: 'SSR' | 'SR' | 'R' = 'R';
    if (rand < 0.15) rarity = 'SSR';
    else if (rand < 0.5) rarity = 'SR';

    const pool = GACHA_INGREDIENTS.filter((i) => i.rarity === rarity);
    const uncollected = pool.filter((i) => !pantry.some((p) => p.id === i.id));
    const from = uncollected.length > 0 ? uncollected : pool;
    return from[Math.floor(Math.random() * from.length)];
  };

  /**
   * 抽卡结果提示文案。区分「新获得」与「重复」——
   * 十连抽在未收集不足 10 种时会用已拥有的补齐，这时不该谎报「获得 10 种」。
   */
  const buildGainText = (items: GachaIngredient[]) => {
    const fresh = items.filter((i) => !pantry.some((p) => p.id === i.id)).length;
    const dup = items.length - fresh;
    if (dup === 0) return `获得 ${fresh} 种新鲜食材！`;
    if (fresh === 0) return `抽到 ${dup} 种已收集食材（已自动转化）！`;
    return `新获 ${fresh} 种，${dup} 种重复已转化！`;
  };

  // Handle Single / Ten Pull
  const handleSummon = (mode: 'single' | 'ten') => {
    if (isDrawing) return;

    const cost = mode === 'single' ? 1 : 9;
    if (tokens < cost) {
      setShowGetTokensModal(true);
      onShowToast('🪙 抽卡币不足，每日签到可领 1 币');
      return;
    }

    setTokens((prev) => prev - cost);
    setLastDrawMode(mode);
    // 首次十连抽成功后停掉「9折限时」徽章的促销动效 —— 优惠既已到手，
    // 没必要继续在界面上反复推销。只在首次时 set（已是 true 时 React 会跳过重渲染）。
    if (mode === 'ten') setHasUsedTenDraw(true);

    let newItems: GachaIngredient[] = [];
    if (mode === 'single') {
      // 稀有度完全交给 drawSingle 决定。
      // 旧实现在这里有 75% 概率直接从未收集池随机取，完全绕过稀有度判定，
      // 导致界面展示的掉率严重失真（SSR 实际远高于 15%）。「优先未收集」的诉求
      // 已下沉到 drawSingle 内部（同稀有度内优先），不再需要这里的旁路。
      newItems = [drawSingle()];
    } else {
      /**
       * 十连抽：不重复地给 10 种食材。
       * 旧实现用 Map<id> 去重后取前 10 个，池子顺序是 [...uncollected, ...CATALOG]，
       * 一旦未收集不足 10 种，后面就会塞入已拥有的食材——玩家花 9 币看到 3 张新卡
       * 剩下全是重复，且凑不满 10 种，直接卡住「满 10 款起送」。
       * 现在：先洗牌未收集池，不足 10 种时用已拥有的补齐并允许重复（游戏惯例：重复会转化）。
       */
      const uncollected = GACHA_INGREDIENTS.filter((g) => !pantry.some((p) => p.id === g.id));
      const owned = GACHA_INGREDIENTS.filter((g) => pantry.some((p) => p.id === g.id));

      // Fisher-Yates 洗牌，让十连抽真的是随机的（原来直接取数组前 10 个，等于固定顺序）
      const shuffle = <T,>(arr: T[]): T[] => {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      };

      const picked = shuffle(uncollected).slice(0, 10);
      // 不足 10 种时用已拥有的补齐（允许重复），保证结果永远是 10 项
      if (picked.length < 10) {
        const need = 10 - picked.length;
        picked.push(...shuffle(owned).slice(0, need));
        // 极端兜底：catalog 为空时不可能走到这里，但避免 picked 少于 10 导致 UI 显示异常
        while (picked.length < 10) picked.push(drawSingle());
      }
      newItems = picked;
    }

    /* 结果顺序：**新食材优先，重复（已拥有）的排后面**。
       ⚠️ 必须在 setRevealItems 之前排好 —— 覆盖层里 10 张结果卡的排列和
       「飞向食材库」的落点是同一个数组按 idx 一一对应的（GachaBurstReveal
       里 `flyTargets[idx]`），两处必须同源，不能只排其中一处。
       用稳定排序（ES2019 起 Array#sort 保证稳定），同档内保留抽到的随机顺序。
       这里比较的 pantry 是**抽卡前**的快照 —— 新食材要等动画播完才入库，
       所以此刻 pantry 里有的就是"重复"。 */
    const isOwned = (it: GachaIngredient) => (pantry.some((p) => p.id === it.id) ? 1 : 0);
    newItems = [...newItems].sort((a, b) => isOwned(a) - isOwned(b));

    const highestRarity = newItems.some((i) => i.rarity === 'SSR')
      ? 'SSR'
      : newItems.some((i) => i.rarity === 'SR')
      ? 'SR'
      : 'R';
    setDrawRarity(highestRarity);
    setIsDrawing(true);
    setIsClocheOpen(true);

    if (skipAnimation) {
      setTimeout(() => {
        setPantry((prev) => mergePantry(prev, newItems));

        setSelectedIngredientIds((prev) => {
          const next = new Set(prev);
          newItems.forEach((item) => next.add(item.id));
          return next;
        });

        setIsDrawing(false);
        setIsClocheOpen(false); // 抽完把餐盖盖回去（跳过动画分支）
        setDrawnIngredients(newItems);
        onShowToast(
          `🎉 揭开餐盖！${buildGainText(newItems)}已入库并加入清单`
        );
      }, 650);
      return;
    }

    setTimeout(() => {
      setIsDrawing(false);
      setDrawnIngredients(newItems);

      /* 覆盖层接管结果展示 —— 入库与勾选**推迟到动画播完**再做。
         为什么不能像旧实现那样在这里就入库：
         飞行落点靠 getBoundingClientRect 反查卡片位置，而入库会立刻往网格里
         插入新卡片，网格重排 → 后测到的坐标全部偏移，食材会飞到隔壁格子上。
         顺序必须是：测量 → 飞行 → 入库（见 handleRevealComplete）。 */
      if (skipAnimation) return;

      setRevealItems(newItems);
      setRevealMode(mode);
      setRevealOrigin(measureRevealOrigin());
      setRevealActive(true);
      // 暗底铺上后立刻把食材库滚进视野，让飞行的落点落在屏幕中部
      scrollPantryIntoView();
      /* ⚠️ 这个延迟必须 ≥ 餐盖动画的总时长，否则扑腾到一半就被覆盖层盖住。
         餐盖现在是三段式：扑腾蓄势 0.52s + 掀开 0.88s = 1.4s（见 FoodCloche3D 的 duration）。
         这里给 2.0s，留约 0.6s 让玩家看清掀开后的状态。
         改餐盖时长时**必须同步改这里**。 */
    }, 2000);
  };

  /**
   * 覆盖层动画播完（食材已飞入网格）→ 正式入库 + 勾选。
   * ⚠️ 必须在覆盖层退场后调用，否则入库引起的网格重排会让飞行落点错位。
   */
  const handleRevealComplete = useCallback(() => {
    setRevealActive(false);
    /* 覆盖层退场的同一帧把餐盖盖回去。
       为什么放在这里而不是 setIsDrawing(false) 那一步（1350ms）：
       餐盖在 0–1350ms 是「已掀开、盘内光可见」的展示窗口，那段时间必须保持掀开；
       覆盖层退场才是整段演出的终点。 */
    setIsClocheOpen(false);
    // 入库重排：打开 layout 动画让已有食材"整体后移一位"是滑动而不是硬跳
    setReorderAnim(true);
    setPantry((prev) => mergePantry(prev, revealItems));
    setSelectedIngredientIds((prev) => {
      const next = new Set(prev);
      revealItems.forEach((item) => next.add(item.id));
      return next;
    });
    onShowToast(buildGainText(revealItems) + '已飞入食材库');
    window.setTimeout(() => setReorderAnim(false), 520);
  }, [revealItems, mergePantry, onShowToast]);

  // Toggle ingredient in custom meal bowl (allows selecting or deselecting freely with 0 minimum restriction)
  const handleToggleIngredient = (id: string) => {
    if (selectedIngredientIds.has(id)) {
      setSelectedIngredientIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      setSelectedIngredientIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    }
  };

  // Quick actions: clear all or select all
  const handleClearAllSelections = () => {
    setSelectedIngredientIds(new Set());
    onShowToast('已清空已选食材');
  };

  const handleSelectAllPantry = () => {
    setSelectedIngredientIds(new Set(pantry.map((p) => p.id)));
    onShowToast(`已全选食材 (${pantry.length}款)`);
  };

  // Nutrition calculations for custom bowl
  const selectedIngredients = pantry.filter((i) => selectedIngredientIds.has(i.id));
  const totalKcal = selectedIngredients.reduce((sum, item) => sum + item.kcal, 0);
  const totalProtein = selectedIngredients.reduce((sum, item) => sum + item.protein, 0);
  const totalFat = selectedIngredients.reduce((sum, item) => sum + item.fat, 0);
  const totalCarbs = selectedIngredients.reduce((sum, item) => sum + item.carbs, 0);
  const totalPrice = selectedIngredients.length === 0 ? 0 : Math.max(28, selectedIngredients.reduce((sum, item) => sum + item.price, 0));
  const totalOriginalPrice = selectedIngredients.length === 0 ? 0 : Math.max(48, selectedIngredients.reduce((sum, item) => sum + item.originalPrice, 0));

  // Dimensional balance linking for custom bowl customization
  const baseSelected = selectedIngredients.filter((i) => i.category === 'base');
  const proteinSelected = selectedIngredients.filter((i) => i.category === 'protein');
  const toppingSelected = selectedIngredients.filter((i) => i.category === 'topping');
  const sauceSelected = selectedIngredients.filter((i) => i.category === 'sauce');

  const dimensionStatus = [
    { key: 'base' as const, label: '主粮基底', icon: '🌾', count: baseSelected.length, items: baseSelected },
    { key: 'protein' as const, label: '优质蛋白', icon: '🥩', count: proteinSelected.length, items: proteinSelected },
    { key: 'topping' as const, label: '鲜蔬配料', icon: '🥗', count: toppingSelected.length, items: toppingSelected },
    { key: 'sauce' as const, label: '低卡酱汁', icon: '🥣', count: sauceSelected.length, items: sauceSelected },
  ];

  const completedDimensionCount = dimensionStatus.filter((d) => d.count > 0).length;
  // 10-Item minimum delivery threshold state
  const selectedCount = selectedIngredients.length;
  const isDeliveryThresholdMet = selectedCount >= 10;
  // Progress percentage (0 to 100%) linked directly to user's 10-item delivery target
  const deliveryProgressPercent = Math.min(100, Math.round((selectedCount / 10) * 100));

  // Dynamic recommendation text: concise and single-line
  const getDynamicRecommendation = () => {
    if (selectedCount === 0) {
      return '点击卡片勾选食材，集满 10 款即可起送';
    }
    if (selectedCount < 10) {
      return `已选 ${selectedCount}/10 款，抽卡可快速获取更多食材`;
    }
    return `已达标 10 款起送，可直接加入购物车`;
  };

  // Add custom bowl to cart (requires 10 items to deliver)
  const handleAddCustomMealToCart = () => {
    if (selectedIngredients.length < 10) {
      onShowToast(`满 10 款起送，还差 ${10 - selectedIngredients.length} 款食材`);
      return;
    }

    const customDish: Dish = {
      id: 999000 + Math.floor(Math.random() * 999),
      name: `🥗 盲盒定制 · 十鲜能量碗 (${selectedIngredients.length}款拼配)`,
      subtitle: `${selectedIngredients.map((i) => i.name).slice(0, 3).join('、')}等${selectedIngredients.length}款食材`,
      description: `【盲盒专属定制】包含：${selectedIngredients.map((i) => i.name).join('、')}。总热量 ${totalKcal} kcal，高蛋白 ${totalProtein.toFixed(1)}g。`,
      kcal: totalKcal,
      protein: Math.round(totalProtein),
      fat: Math.round(totalFat),
      carbs: Math.round(totalCarbs),
      price: totalPrice,
      dealPrice: totalPrice,
      originalPrice: totalOriginalPrice,
      sold: '100% 独一无二',
      category: 'bowl',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      bg: 'bg-[#F2FCE0]',
      color: 'text-[#54801A]',
      tags: selectedIngredients.map((i) => i.name),
      icon: 'bowl'
    };

    onAddToCart?.(customDish, 1);
    onShowToast(`已成功将专属定制十鲜能量碗加入购物车！`);
  };

  // Claim free delivery when threshold reached
  const handleClaimFreeDelivery = () => {
    if (pantry.length < MIN_DELIVERY_ITEMS) {
      onShowToast(`还差 ${MIN_DELIVERY_ITEMS - pantry.length} 款即可达成 10 款免单配送！`);
      return;
    }
    setShowDeliverySuccessModal(true);
  };

  return (
    <div className="relative bg-[#C7F665] overflow-clip" id="gacha-page-root">
      {/* STICKY COMPACT HEADER */}
      <header className="sticky top-0 z-40 bg-white/50 backdrop-blur-md border-b border-white/60 px-4 py-2">
        <div className="max-w-xl md:max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-black text-[#C7F665] flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-[#C7F665]" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h1 className="font-black text-slate-900 text-base leading-tight tracking-tight">
                  抽卡集食材
                </h1>
                <span className="px-1.5 py-0.2 rounded-full bg-[#C7F665] text-black text-[9px] font-black border border-black/10">
                  10款起送
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-tight">
                揭盖即得珍稀食材 · 随心拼配免单送达
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowGetTokensModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black text-white font-extrabold text-xs shadow-xs hover:bg-slate-800 transition-colors duration-200 ease-out cursor-pointer active:scale-95"
              id="btn-header-tokens"
            >
              <Crown className="w-3 h-3 text-[#C7F665] fill-[#C7F665] shrink-0" />
              <span className="text-[#C7F665]">{tokens}</span>
              <span className="text-[10px] text-white/80 font-normal">币</span>
              <Plus className="w-2.5 h-2.5 text-[#C7F665] ml-0.5" />
            </button>

            <button
              onClick={() => setShowChecklistModal(true)}
              className="w-7 h-7 rounded-full bg-white/80 hover:bg-white border border-slate-200/80 flex items-center justify-center text-slate-700 transition-colors duration-200 ease-out cursor-pointer shadow-2xs active:scale-95"
              id="btn-header-info"
              title="食材图鉴与掉率"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="max-w-xl md:max-w-2xl mx-auto px-4 pt-1 space-y-3 relative z-10">
        {/* Unified Top & Pantry Interactive Zone with Background extending exactly to the bottom line */}
        <div className="relative -mx-3 -mx-4 px-4 pt-0 pb-12 overflow-hidden">
          {/* Lime backdrop that covers all the way down to below the status panel */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            {/* Top sky & graphic background */}
            <div className="absolute inset-x-0 top-0 h-[480px]">
              <img
                src="/online_9f52938bdc.png"
                alt=""
                className="w-full h-full object-cover object-top opacity-90"
                draggable={false}
              />
            </div>
            {/* Continuous lime wash gradient filling behind buttons, cards and status box */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#C7F665]/50 to-[#C7F665]" />

            {/* Bottom Wave Transition & Right Smiley Face - Positioned right at the user's blue line */}
            <div className="absolute bottom-0 inset-x-0 h-20 pointer-events-none overflow-hidden">
              {/* Layer 1: Soft Translucent Lime Background Wave */}
              <svg
                viewBox="0 0 400 80"
                className="absolute inset-x-0 bottom-0 w-full h-full"
                preserveAspectRatio="none"
              >
                <path
                  d="M 0 52 C 50 35, 110 38, 170 54 C 230 68, 300 48, 360 22 C 380 12, 395 6, 400 3 L 400 80 L 0 80 Z"
                  fill="#C7F665"
                  opacity="0.55"
                />
              </svg>

              {/* Layer 2: Main Vibrant Lime Wave */}
              <svg
                viewBox="0 0 400 80"
                className="absolute inset-x-0 bottom-0 w-full h-full"
                preserveAspectRatio="none"
              >
                <path
                  d="M 0 16 C 5 28, 25 58, 65 52 C 105 46, 140 60, 205 60 C 265 60, 315 56, 350 32 C 375 14, 390 4, 400 0 L 400 80 L 0 80 Z"
                  fill="#C7F665"
                />
              </svg>

              {/* Layer 3: Black Smiley Face on the right side slope */}
              <div className="absolute right-6 bottom-4 pointer-events-none select-none z-10 rotate-[8deg]">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 32 32"
                  fill="none"
                  className="w-7 h-7"
                >
                  <ellipse
                    cx="9"
                    cy="10"
                    rx="2.6"
                    ry="3.6"
                    fill="#000000"
                    transform="rotate(6 9 10)"
                  />
                  <ellipse
                    cx="21"
                    cy="8.5"
                    rx="2.6"
                    ry="3.6"
                    fill="#000000"
                    transform="rotate(10 21 8.5)"
                  />
                  <path
                    d="M 6.5 17.5 C 9.5 24.5, 20.5 24.5, 24.5 16.5"
                    stroke="#000000"
                    strokeWidth="3.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 23 15 C 24.8 16.2, 26 18, 26.5 19.5"
                    stroke="#000000"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* 1. GACHA MAIN STAGE HERO BANNER (今日抽卡头图) */}
          <section
            className="relative w-full flex flex-col items-center justify-center pt-1 pb-0 z-10"
            id="gacha-main-stage-card"
          >
            <div
              className="w-full relative flex items-center justify-center pb-0"
              id="gacha-hero-banner-container"
            >
              {/* 头图浮动：幅度 6 → 2.5px、周期 3.6 → 5.2s。
                  原幅度偏大 —— 餐盖是 absolute 定位叠在头图上的，头图一晃，
                  餐盖与背景的相对位置就会肉眼可见地「漂」，显得贴不稳。
                  2.5px 在 520~600px 高的图上约 0.5%，只留一点呼吸感。 */}
              <motion.img
                src="/Gemini_Generated_Image_mspigdmspigdmspi.png"
                alt="今日抽卡头图"
                animate={{ y: [0, -2.5, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 5.2,
                  ease: 'easeInOut'
                }}
                className="w-full h-auto max-h-[600px] object-contain select-none drop-shadow-lg scale-[1.10] transform-gpu mt-5 transition-all will-change-transform"
                draggable={false}
              />

              {/* 3D 矢量餐盖：主舞台核心交互组件（点击或抽卡均会优雅掀开餐盖） */}
              <div
                className="absolute right-[3%] bottom-[-6%] w-[70%] max-w-[520px] z-20"
              >
                <FoodCloche3D
                  isDrawing={isDrawing}
                  isOpen={isClocheOpen}
                  onTap={() => {
                    if (isDrawing) return;
                    if (isClocheOpen) {
                      setIsClocheOpen(false);
                    } else {
                      handleSummon('single');
                    }
                  }}
                  drawRarity={drawRarity}
                  drawMode={lastDrawMode}
                  className="w-full h-auto scale-[1.30] origin-center cursor-pointer pointer-events-auto"
                />
              </div>
            </div>
          </section>

          {/* 2. CIRCLED AREA: 抽卡操作区与食材库配送定制 - 精确对齐用户在截图画线处（餐盖下方舒适间距） */}
          <section
            className="relative px-0 z-30 mt-3.5"
            id="unified-pantry-collection-section"
          >
          {/* ACTION BUTTONS: Single Summon & Ten Summon (Complete Native SVG Replicas from User Specification) */}
          <div
            className="w-full relative z-20 py-1 px-0.5 overflow-visible select-none"
            id="gacha-action-buttons-group"
          >
            {/* Native SVG Banner 1:1 Pixel-Perfect from Specification */}
            <svg
              id="draw-buttons-banner"
              className="w-full h-auto block overflow-visible select-none"
              viewBox="0 0 810 241"
              preserveAspectRatio="xMidYMid meet"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-labelledby="db-title db-desc"
              style={{
                opacity: isDrawing ? 0.6 : 1,
                transition: 'opacity 0.2s ease-in-out'
              }}
            >
              <title id="db-title">单抽 / 十连抽 按钮组</title>
              <desc id="db-desc">并排两个抽卡按钮：左侧亮柠檬绿「单抽 / 1 抽卡币」，黑色描边加黑色投影，右端一个黑圆内嵌柠檬绿右箭头；右侧蓝绿渐变填充「十连抽 / 9 抽卡币」（黑边），右下沿随按钮透视略向下倾斜，右端一个黑圆内嵌蓝绿右箭头；十连抽按钮右上方一枚粉色「9 折限时」气泡徽章。背景纯白。</desc>

              <defs>
                <style>{`
                  .t { font-family: "PingFang SC","HarmonyOS Sans SC","Noto Sans SC","Source Han Sans SC","Microsoft YaHei","Heiti SC","WenQuanYi Micro Hei",system-ui,sans-serif; fill: #0A0A0A; }
                  .t-h { font-weight: 900; }
                  .t-w { fill: #FFFFFF; }
                  .t-c { text-anchor: middle; }
                  .ic { fill: none; stroke: #0A0A0A; stroke-linecap: round; stroke-linejoin: round; }

                  /* ---------- 按钮组：呼吸感浮动（v4 重做，取代 v2/v3 的正弦晃动） ----------

                     ⚠️ v2/v3 为什么只是"机械平移"而不是"呼吸"：
                     那三个 keyframes（x / y / r）全是 0% → 50% → 100% 的对称正弦
                     配 ease-in-out —— 等价于三个完美谐波，任何时刻的位移都可预测，
                     所以眼睛读到的是"在平移"，而不是"在呼吸"。

                     真实呼吸有三个特征，v2/v3 一个都没做到：
                       ① **非对称节奏** —— 吸得快、呼得慢，顶/底各有一小段停顿。
                          对称正弦做不到，这是机械感的主要来源。
                       ② **尺度胀缩** —— 胸腔起伏伴随 size 变化。v2/v3 完全没有 scale，
                          所以只有"平移"没有"呼吸"。
                       ③ **多谐波不规则** —— 真实运动没有单一周期。

                     本版做法：
                       - 关键帧从 3 点改为 5 点，用百分比显式控制"吸/顶停/呼/底停"占比：
                           0% 底 -> 30% 顶(吸,30%) -> 42% 顶(停) -> 84% 底(呼,42%) -> 100% 底
                         吸 30% / 呼 42%，一快一慢，才有生命感。
                       - 新增 scale 呼吸：这是"胀缩"，单靠位移给不了。
                       - 纵向与 scale 同周期同相位（必须同步，否则"涨大时上浮"会错位，
                         看起来像在抖而不是在呼吸）。
                       - cubic-bezier(0.32, 0.02, 0.4, 1) 手工塑形：吸气段加速、呼气段
                         减速更柔，形成"先 brisk 后 relaxation"的曲线，而非匀速。

                     ------------------------------------------------------------
                     v5 改动（用户反馈"动画明显一点"）：**提速为主，幅度为辅**。

                     根因是周期太慢，不是幅度太小：
                       v4 的 6.5s 周期 = **9.2 次/分**，而成人静息呼吸是
                       **12~16 次/分（3.75~5 秒/周期）** —— 原值比静息还慢近三成，
                       所以盯着看只觉得"微微在动"，说不上呼吸。
                       提到 4.4s = 13.6 次/分，正落在静息区间中部。

                     ⚠️ 关键：提速是**唯一无约束**的增强手段。
                       幅度受点击热区硬约束（顶出热区就点空），且过大会显得
                       "漂""不稳"；周期则完全自由，且提速同时让吸/呼两段各自
                       缩短，节奏感更清晰 —— 效果放大而风险为零。

                     幅度只做适度配合（占用 4.23 -> 5.78 单位，热区余量仍有 3.62）。

                     三层周期 4.4 / 5.9 / 7.9s 两两非整数倍。
                     小数周期在数学上**永不重合**（不像整数周期会有最小公倍数），
                     叠加后极长时间内不产生可察觉的循环节律。

                     ⚠️ 为什么加 scale 是安全的（已核算）：
                     CSS 规范把 transform 拆为 translate → rotate → scale → transform
                     四个独立属性按序应用。本元素上只有 translate/rotate/rotate，
                     静态缩放在**子元素 #btn-scale 的 SVG transform 属性**上，
                     两者作用在不同元素、互不干扰。
                     （scale 挂不到 #btn-scale 上 —— 那是静态 SVG 属性，无法做 CSS 动画。）

                     ⚠️ 幅度依然克制：位移总幅度控制在 ~4 单位内
                     （360px 屏宽下约 1.6px），远小于热区余量，不影响点击命中。

                     ⚠️ 挂在 #btn-sway 上（整组一起呼吸），不挂单个按钮 ——
                     若两个按钮各自胀缩，间距会跟着变，看起来像在挤压变形。

                     ⚠️ 注意：本段位于 style 的模板字符串内，注释中【不可用反引号】，
                     否则会提前终止模板字符串、导致编译报 TS1005。
                     ⚠️ rotate 必须显式给 transform-origin 绕组中心，
                     否则默认绕 SVG 原点 (0,0) 旋转，整组会被甩出画面。 */

                  /* 纵向：非对称呼吸。吸 30%(快) -> 顶停 12% -> 呼 42%(慢) -> 底停 16% */
                  @keyframes gb-sway-y {
                    0%   { translate: 0 0px; }
                    30%  { translate: 0 -3.6px; }
                    42%  { translate: 0 -3.6px; }
                    84%  { translate: 0 0px; }
                    100% { translate: 0 0px; }
                  }
                  /* 尺度：与纵向同相呼吸（涨到顶时缩放最大），1.5% 幅度 */
                  @keyframes gb-breath {
                    0%   { scale: 1; }
                    30%  { scale: 1.015; }
                    42%  { scale: 1.015; }
                    84%  { scale: 1; }
                    100% { scale: 1; }
                  }
                  /* 横向：保留轻微漂移作"生命感"底噪，周期与纵向错开 */
                  @keyframes gb-sway-x {
                    0%,100% { translate: -0.85px 0; }
                    50%      { translate: 0.85px 0; }
                  }
                  /* 微旋转：同样非对称，幅度压小避免"摇晃"感 */
                  @keyframes gb-sway-r {
                    0%   { rotate: 0deg; }
                    30%  { rotate: -0.13deg; }
                    42%  { rotate: -0.13deg; }
                    84%  { rotate: 0deg; }
                    100% { rotate: 0deg; }
                  }
                  #btn-sway {
                    transform-origin: 405px 120.5px;
                    animation:
                      /* 纵向与 scale 同周期同相位 —— 两者必须同步，否则"涨大时上浮"
                         会错位，看起来像在抖而不是在呼吸。
                         4.4s = 13.6 次/分，落在成人静息呼吸 12~16 次/分区间中部；
                         v4 的 6.5s 只有 9.2 次/分，比静息慢近三成，所以不够明显。 */
                      gb-sway-y 4.4s cubic-bezier(0.32, 0.02, 0.4, 1) infinite,
                      gb-breath 4.4s cubic-bezier(0.32, 0.02, 0.4, 1) infinite,
                      gb-sway-x 5.9s ease-in-out infinite,
                      gb-sway-r 7.9s cubic-bezier(0.4, 0.05, 0.3, 1) infinite;
                  }

                  /* ---------- 「9折限时」徽章：促销呼吸脉动（v5 新增） ----------
                     目标：让静止的徽章变成视觉焦点，但只做"配角级"的克制动效。

                     为什么之前没有动效也能被看到：粉色 #EC4899 在蓝绿按钮上
                     色相跨度极大，对比强烈。问题不在"不够显眼"，而在
                     **静止的东西不会吸引视线** —— 人的视觉系统对运动敏感，
                     对静态高对比只会"看到"而不会"注意到"。

                     三条设计约束（与按钮组呼吸严格区分开）：
                       ① **独立周期 3.7s** —— 按钮组是 4.4s，这里用 3.7s 错开。
                          若同步，促销信息会与整体节奏绑死，失去"跳出来"的特质。
                       ② **幅度更小**（1.8px vs 按钮组 3.6px）—— 徽章是配角，
                          不该和主按钮抢视觉权重。
                       ③ **scale 幅度更大**（3.5% vs 按钮组 1.5%）—— 徽章本体小，
                          相对幅度小就看不出在胀缩；放大比例才能在克制位移下
                          仍可感知。这与"幅度更小"看似矛盾，实则各管一件事：
                          translate 管"它会不会乱晃"，scale 管"它有没有在呼吸"。

                     ⚠️ 实现关键：脉动必须用 CSS **独立属性** translate/scale，
                     不能用 transform 属性 ——
                     #badge-discount 的内联 style.transform 已被按下反馈
                     （translateY(11.5px) scale(0.96)）独占。若两者都用 transform，
                     会互相覆盖，按下时呼吸就断了。
                     规范应用顺序 translate → rotate → scale → transform，
                     独立属性与 transform 是**叠加**关系，两者可共存。
                     transformOrigin 已有 710px 45.5px（为下压设的），脉动复用。

                     ⚠️ 非对称节奏：吸 34% / 停 14% / 呼 40% / 停 12%，
                     与按钮组同一套方法（正弦会读成"在平移"而非"在呼吸"）。 */
                  @keyframes gb-badge-float {
                    0%   { translate: 0 0px; }
                    34%  { translate: 0 -1.8px; }
                    48%  { translate: 0 -1.8px; }
                    88%  { translate: 0 0px; }
                    100% { translate: 0 0px; }
                  }
                  @keyframes gb-badge-pulse {
                    0%   { scale: 1; }
                    34%  { scale: 1.035; }
                    48%  { scale: 1.035; }
                    88%  { scale: 1; }
                    100% { scale: 1; }
                  }
                  /* hasUsedTenDraw 为 true 时（用户已用过十连抽）停止促销动效。
                     徽章本体保留（优惠信息仍有价值），只是不再动 —— 不打扰。 */
                  #badge-discount.gb-badge-live {
                    animation:
                      gb-badge-float 3.7s cubic-bezier(0.32, 0.02, 0.4, 1) infinite,
                      gb-badge-pulse 3.7s cubic-bezier(0.32, 0.02, 0.4, 1) infinite;
                  }

                  /* ---------- 十连抽：色彩流动 + 呼吸 + 扫光 ----------
                     全部用 CSS 实现（非 SMIL），好处：
                     1) 可被 prefers-reduced-motion 统一关闭；
                     2) 不与按钮自身的 transform 过渡冲突；
                     3) stop-color / stop-offset 都是标准可动画的 CSS 属性。 */

                  /* ============================================================
                     十连抽 · 鲜亮流动系统（3 层 + 扫光）
                     --------------------------------------------------------
                     配色依据：用户指定参考 draw-buttons-banner.html
                     参考版实测：#22D3EE / #2DD4BF / #5EEAD4
                       H 170.6~187.9（跨度 17.4°） L 50.4~64.3  S 66~86
                     特征是 **Tailwind 400 档的高明度青蓝绿**，鲜亮通透。

                     ⚠️ 中间踩过的坑（别再压深）：
                     曾把明度压到 30~53%（#0891B2/#0D9488/#059669 等 600 档）想
                     "压出深度"，结果整体发闷、不鲜亮，用户明确否决。
                     **这个按钮的基调就是鲜亮，深度只能靠高光和扫光去做，不能压暗。**

                     ------------------------------------------------------------
                     v3 改动（用户反馈"变化不够明显"）：把幅度和速度都提上来。
                     根因不是层数不够，而是**跳变幅度太小**：
                       旧版每个色标只在【相邻两色】之间摆动（色相跳 15~18°），
                       stop-offset 位移仅 0.18~0.30 —— 整条色带几乎原地呼吸，
                       所以物理上只能呈现"微微变"。
                     新版三条措施：
                       ① 色标在**色带两端**之间跳（色相跳 41~47°，约 2.5 倍）
                       ② stop-offset 位移 0.18~0.30 → 0.30~0.55（约 2 倍）
                       ③ 周期 9/11/13s → 5.5/7/8.5s，整体提速约 40%
                       另加 ④ 增亮：主色带明度上限 80.4 → 85.1，并加入
                          #99F6E4 / #BBF7D0 / #A5F3FC 三个 200 档高亮色。
                          色相跨度 35.6° → 46.9°。

                     ⚠️⚠️ hue-rotate 方向只能是负方向（青 -> 绿），绝不能转正：
                     蓝色天然暗，往正方向转会让对比度崩塌。实测 #22D3EE
                     转 +35° 后黑字对比度从 10.96 暴跌到 **3.61**（大字阈值边缘）；
                     转 -35° 反而升到 12.93。所以振幅只往 -32° 走。
                     ------------------------------------------------------------

                     v4 改动（用户反馈"更鲜艳一点"）：只提饱和度，**明度一点不动**。
                     ⚠️ 「鲜艳」和「鲜亮」是两个不同维度，别混：
                       鲜亮 = 明度高（v3 做的）；鲜艳 = 彩度高（本版做的）。
                     诊断：v3 配色饱和度已有 71.6~93.5（并不低），但明度 53.3~85.1
                     偏高 —— 这是 Tailwind 200/300 档的固有特征，**pastel 化、
                     柔和但发闷、不艳**。所以提彩度是唯一正确的方向。
                     ⚠️ 绝不能靠压明度来提艳（曾这么干过，用户否决）：
                       压暗 = 闷，压亮 = 淡，只有加彩度才既艳又通透。
                     做法：保持每个色标的 H 与 L 完全不变，只把 S 抬到 >= 92
                     （底层 >= 96）。实测 S 均值 81.8 → 92.3，
                     而 L 均值 71.6 一位未动 —— 鲜艳度提升来自彩度而非亮度。
                     反直觉的是**对比度反而变好**：全相位最坏 10.96 → **11.49**，
                     因为青绿高饱和本身就比 pastel 更亮。鲜艳与可读性不冲突。
                     ============================================================ */

                  /* ---------- 底层：饱和度涌流（提亮 + 高彩度，不压暗） ---------- */
                  @keyframes gb-flow-deep-1 {
                    0%,100% { stop-color: #16DCFA; stop-offset: 0; }
                    50%     { stop-color: #59FCBB; stop-offset: 0.34; }
                  }
                  @keyframes gb-flow-deep-2 {
                    0%,100% { stop-color: #59FCBB; stop-offset: 0.42; }
                    50%     { stop-color: #A4F4FD; stop-offset: 0.58; }
                  }
                  @keyframes gb-flow-deep-3 {
                    0%,100% { stop-color: #A4F4FD; stop-offset: 0.78; }
                    50%     { stop-color: #16DCFA; stop-offset: 1; }
                  }
                  #g-multi-deep stop:nth-of-type(1) { animation: gb-flow-deep-1 5.5s ease-in-out infinite; }
                  #g-multi-deep stop:nth-of-type(2) { animation: gb-flow-deep-2 7s   ease-in-out infinite; }
                  #g-multi-deep stop:nth-of-type(3) { animation: gb-flow-deep-3 8.5s ease-in-out infinite; }

                  /* ---------- 中层：主色带（6 色标，H 跨 46.9°，L 53~85，S>=92） ----------
                     关键：每个色标都跨越【整条色带】往复（两端互跳），
                     而不是像旧版只在相邻色之间小步挪 —— 这是"变化明显"的来源。
                     周期 5.5 / 7 / 8.5s 互质，提速 40% 后仍不产生可察觉的循环节律。 */
                  @keyframes gb-drift-1 {
                    0%,100% { stop-color: #1BD8F5; stop-offset: 0; }
                    33%     { stop-color: #B6FCCF; stop-offset: 0.22; }
                    66%     { stop-color: #50F8DD; stop-offset: 0.06; }
                  }
                  @keyframes gb-drift-2 {
                    0%,100% { stop-color: #50F8DD; stop-offset: 0.26; }
                    33%     { stop-color: #A5F3FC; stop-offset: 0.50; }
                    66%     { stop-color: #5DF8BB; stop-offset: 0.18; }
                  }
                  @keyframes gb-drift-3 {
                    0%,100% { stop-color: #5DF8BB; stop-offset: 0.52; }
                    33%     { stop-color: #1BD8F5; stop-offset: 0.30; }
                    66%     { stop-color: #94FBE7; stop-offset: 0.62; }
                  }
                  @keyframes gb-drift-4 {
                    0%,100% { stop-color: #94FBE7; stop-offset: 0.74; }
                    33%     { stop-color: #50F8DD; stop-offset: 0.50; }
                    66%     { stop-color: #B6FCCF; stop-offset: 0.88; }
                  }
                  @keyframes gb-drift-5 {
                    0%,100% { stop-color: #B6FCCF; stop-offset: 0.92; }
                    33%     { stop-color: #A5F3FC; stop-opacity: 0.9; stop-offset: 0.74; }
                    66%     { stop-color: #5DF8BB; stop-opacity: 1;  stop-offset: 0.98; }
                  }
                  @keyframes gb-drift-6 {
                    0%,100% { stop-color: #A5F3FC; stop-offset: 1; }
                    33%     { stop-color: #B6FCCF; stop-opacity: 0.94; stop-offset: 0.84; }
                    66%     { stop-color: #94FBE7; stop-opacity: 1;    stop-offset: 1; }
                  }
                  #g-multi-ring stop:nth-of-type(1) { animation: gb-drift-1 5.5s ease-in-out infinite; }
                  #g-multi-ring stop:nth-of-type(2) { animation: gb-drift-2 7s   ease-in-out infinite; }
                  #g-multi-ring stop:nth-of-type(3) { animation: gb-drift-3 8.5s ease-in-out infinite; }
                  #g-multi-ring stop:nth-of-type(4) { animation: gb-drift-4 5.5s ease-in-out infinite; }
                  #g-multi-ring stop:nth-of-type(5) { animation: gb-drift-5 7s   ease-in-out infinite; }
                  #g-multi-ring stop:nth-of-type(6) { animation: gb-drift-6 8.5s ease-in-out infinite; }

                  /* ---------- 表层：色相环流（整条色带旋转 hue） ----------
                     振幅从 -18° 加到 -32°，周期 15s → 9s，「不断渐变」的观感最直接。
                     ⚠️ 只允许负方向：转正（青->蓝）会因蓝色天然暗而使对比度崩塌。
                     v4：saturate 峰值 1.2 → 1.12。配色本身已 S>=92，再乘 1.2 会
                     大量撞上 S=100 上限被截断，该层等于失效；1.12 能保住"彩度
                     呼吸"的可感知度，又不会把颜色推成荧光。 */
                  @keyframes gb-hue-cycle {
                    0%   { filter: hue-rotate(0deg)   saturate(1); }
                    50%  { filter: hue-rotate(-32deg) saturate(1.12); }
                    100% { filter: hue-rotate(0deg)   saturate(1); }
                  }
                  #btn-multi .gb-breathe-target { animation: gb-hue-cycle 9s ease-in-out infinite; }

                  /* ---------- 高光：扫光带（周期性掠过表面） ----------
                     4.6s → 3.2s，随整体提速同步加快。 */
                  @keyframes gb-sheen-sweep {
                    0%   { transform: translateX(-150px); opacity: 0; }
                    12%  { opacity: 1; }
                    55%  { transform: translateX(220px); opacity: 1; }
                    68%  { opacity: 0; }
                    100% { transform: translateX(220px); opacity: 0; }
                  }
                  .gb-sheen-sweep { animation: gb-sheen-sweep 3.2s cubic-bezier(0.42, 0, 0.5, 1) infinite; }

                  @media (prefers-reduced-motion: reduce) {
                    #g-multi-deep stop,
                    #g-multi-ring stop,
                    #btn-multi .gb-breathe-target,
                    .gb-sheen-sweep,
                    #btn-sway,
                    #badge-discount.gb-badge-live { animation: none; }
                  }
                `}</style>
                {/* 9折限时徽章粉色：实测几乎为平色 (251,32,155)，仅极轻微渐变 */}
                <linearGradient id="g-pink" x1="0" y1="0" x2="0.25" y2="1">
                  <stop offset="0" stopColor="#EC4899" />
                  <stop offset="1" stopColor="#DB2777" />
                </linearGradient>
                {/* 1 抽卡币皇冠：偏浅的柠檬绿 */}
                <linearGradient id="g-crown-pale" x1="0" y1="0" x2="0.4" y2="1">
                  <stop offset="0" stopColor="#E4F8BC" />
                  <stop offset="0.5" stopColor="#C7F665" />
                  <stop offset="1" stopColor="#C7F665" />
                </linearGradient>
                {/* 十连抽按钮填充 · 中层主色带（6 色标，H 跨 46.9°，L 53.3~85.1）
                     以参考 draw-buttons-banner.html 的 #22D3EE/#2DD4BF/#5EEAD4 为基调，
                     去掉偏暗的 #2DD4BF，改用同明度但更亮的 #99F6E4 承接，
                     尾部再接 #BBF7D0 浅薄荷与 #A5F3FC 亮天青 —— 全部 200~400 档。
                     6 个色标（而非 5 个）是为了让色带更细分，流动时颗粒感更细密。

                     ⚠️ v4 提彩：色相与明度【完全不变】，只把饱和度抬到 >= 92
                       （Tailwind 200/300 档高饱和版）。明度一位未动是刻意的 ——
                       压暗会闷、压亮会淡，加彩度才既艳又通透。
                     黑字对比度最坏 11.49（AA 阈值 4.5），比提彩前 10.96 更好。
                     动画由上方 <style> 的 CSS keyframes 驱动 stop-color / stop-offset，
                     可被 prefers-reduced-motion 统一关闭。 */}
                <linearGradient id="g-multi-ring" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0"    stopColor="#1BD8F5" />
                  <stop offset="0.2"  stopColor="#50F8DD" />
                  <stop offset="0.4"  stopColor="#5DF8BB" />
                  <stop offset="0.62" stopColor="#94FBE7" />
                  <stop offset="0.82" stopColor="#B6FCCF" />
                  <stop offset="1"    stopColor="#A5F3FC" />
                </linearGradient>
                {/* 十连抽按钮填充 · 底层饱和涌流（与主色带同色系，错峰流动制造纵深）。
                     底层彩度更高（S>=96），压在最下面不直接可读，只负责垫出浓度。 */}
                <linearGradient id="g-multi-deep" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0"    stopColor="#16DCFA" />
                  <stop offset="0.45" stopColor="#59FCBB" />
                  <stop offset="1"    stopColor="#A4F4FD" />
                </linearGradient>
                {/* 十连抽按钮填充 · 顶部高光（近白青，琉璃通透感）。
                     峰值不透明度 0.9 → 0.95、峰值色再提亮到 #D9FCFF，
                     配合提速后的扫光，上缘的"玻璃反光"更亮更锐。
                     高光刻意保持低彩度（近白）：高光一艳就像塑料发光，不像玻璃。 */}
                <linearGradient id="g-multi-lite" x1="0" y1="0" x2="0.6" y2="1">
                  <stop offset="0"    stopColor="#D9FCFF" stopOpacity="0.95" />
                  <stop offset="0.45" stopColor="#B6FCCF" stopOpacity="0.38" />
                  <stop offset="1"    stopColor="#E4F8BC" stopOpacity="0" />
                </linearGradient>
                {/* 表面高光带：一道柔和白色斜光横向扫过按钮，制造"液体/琉璃"质感。
                     峰值不透明度 0.34 → 0.5，提速后光带更亮更锐，与鲜亮配色同调。
                     裁剪由调用处的 clipPath（clip-multi-face，复用面路径）负责，
                     保证光不溢出到黑边外。扫光位移由 CSS .gb-sheen-sweep 驱动。 */}
                <linearGradient id="g-multi-sheen" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0"    stopColor="#FFFFFF" stopOpacity="0" />
                  <stop offset="0.45" stopColor="#FFFFFF" stopOpacity="0.5" />
                  <stop offset="0.55" stopColor="#FFFFFF" stopOpacity="0.5" />
                  <stop offset="1"    stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>
                {/* 面路径裁剪，供高光层使用（与 btn-multi-face 完全同一条 d） */}
                <clipPath id="clip-multi-face">
                  <path d="M493,56 H731 A55,55 0 0 1 786,111 V150.1 A65,54.5 0 0 1 721,204.6 L499,195.7 A70,58.5 0 0 1 429,137.2 V120 A64,64 0 0 1 493,56 Z" />
                </clipPath>
                {/* 按钮右下投影 */}
                <filter id="f-btn-shadow" x="-14%" y="-14%" width="128%" height="136%">
                  <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.18" />
                </filter>
                {/* 胶囊皇冠（细高，实测 23×21） */}
                <g id="ic-crown-lime">
                  <path d="M-12,11 L-12,-6 L-6,0 L0,-11 L6,0 L12,-6 L12,11 Z" fill="#C7F665" />
                </g>
                {/* 1 抽卡币 皇冠：偏浅的柠檬绿 */}
                <g id="ic-crown-pale">
                  <path d="M-12,11 L-12,-6 L-6,0 L0,-11 L6,0 L12,-6 L12,11 Z" fill="url(#g-crown-pale)" />
                </g>
                {/* 9折限时徽章上的皇冠：黄色描边 */}
                <g id="ic-crown-yellow">
                  <path d="M-16,10 L-16,-6 L-9,0 L0,-12 L9,0 L16,-6 L16,10 Z" fill="#F2EC20" stroke="#E8B400" strokeWidth="2" strokeLinejoin="round" />
                </g>
              </defs>

              {/* ---- 外层：晃动感（CSS 独立变换属性）----
                   与内层缩放【必须分属两个元素】。原因：CSS 的 transform-origin
                   会同时作用于同一元素上的 translate / rotate / scale 和
                   transform 属性。若把晃动和缩放放同一元素，为了让 rotate 绕组中心
                   而设 transform-origin，会连带把缩放中心推到 viewBox 的某个角上，
                   整组歪掉。分层后两者彻底隔离。 */}
              <g id="btn-sway">
              {/* 内层：整组放大 1.05，固定绕 viewBox 中心 (405,120.5)，
                   因此放大后仍然中心对齐，不会向左上角偏移。

                   对配平的影响已核算：单抽内容净缩放 0.92×1.087=1.0，×1.05 后 1.05；
                   十连抽同步变 1.05 —— 两者同比放大，「标题严格等大」的关系不变，
                   黑边厚度 5.1/6.4/16.1 → 5.35/6.72/16.91（更敦实，与放大自洽）。

                   最后那个 -124.8 是修正【垂直偏心】（不是 120.5）：
                   原始视觉主体 y 19.0..230.6，中心 124.8，比 viewBox 中心 120.5
                   低 4.3 —— 这是原始设计就有的隐性偏心（上间隙 19.0 / 下间隙 10.4）。
                   放大 1.05 后偏心放大为 13.9 / 4.9，下边缘余量只剩 4.9，
                   叠上纵向晃动后最坏情况仅剩 2.1 单位余量。
                   改用 -124.8 后上下间隙对称（8.7 / 10.2，差 1.5），
                   余量 5.9 单位、宽 2.8 倍，纵向晃动才敢放到 ±2.8。
                   SVG 是 h-auto 自适应高度，页面上看不出位移。

                   ⚠️ 这里第二个 translate 的 Y 值必须填【内容自身中心 124.8】，
                   不能填 viewBox 中心 120.5 —— 展开后
                   y_final = 120.5 + 1.05*(y - 该值)，填 120.5 会残余 0.7 偏心。
                   水平方向不受此值影响（x_final = 405 + 1.05*(x - 405)）。 */}
              <g id="btn-scale" transform="translate(405 120.5) scale(1.05) translate(-405 -124.8)">
                {/* ==========================================================
                     02 左按钮（亮柠檬绿）
                     实测：底座 20..412 × 51..226（倾斜 -4.2°，圆角 r≈68）
                           黑描边左右上约 6px、下方约 17px（厚底）

                     视觉配平：原尺寸 392 宽 + -4.2° 旋转，斜置后包围盒涨到 403.8，
                     比右侧十连抽（370 宽、无旋转）明显更重。

                     做法：外层 scale 0.92 收窄底座；内层 cap 反向 scale 1/0.92≈1.087
                     抵消缩小，让标题、箭头、胶囊回到原始视觉尺寸——否则 58px 标题
                     会缩到 53.4px，比十连抽小 4.6px 看起来不协调。

                     ⚠️ translateX 由 +6.4 改为 -11.76：原来那个 +6.4 是"右移补间隙"，
                     它把整组推得偏右（实测包围盒中心 417.6，viewBox 理想中心 405，
                     偏右 12.6px，左内边距 35.2 / 右 10.0）。
                     现按视觉主体（两按钮 + 徽章，不含 shadow）重新解算居中量：
                     x 17.0..793.0，中心 405.0，左右内边距各 17.0，**差 0.00**。
                     shadow 右缘仍会超出 viewBox 约 7px，属正常（柔和投影，视觉不突兀）。
                     ========================================================== */}
                <g
                  id="btn-single"
                  transform="rotate(-4.2 196.5 137)"
                  style={{
                    transform: pressedButton === 'single'
                      ? 'translateX(-11.76px) rotate(-4.2deg) translateY(2.5px) scale(0.911)'
                      : 'translateX(-11.76px) rotate(-4.2deg) translateY(0px) scale(0.92)',
                    transformOrigin: '196.5px 137px',
                    transition: pressedButton === 'single' ? 'transform 0.06s ease-out' : 'transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                >
                  <g filter="url(#f-btn-shadow)">
                    <rect
                      id="btn-single-base"
                      x="20"
                      y="51"
                      width="392"
                      height="175"
                      rx="68"
                      fill="#0A0A0A"
                      style={{
                        opacity: pressedButton === 'single' ? 0.95 : 1,
                        transition: 'opacity 0.08s ease-out'
                      }}
                    />
                  </g>

                  {/* Button Cap: Face, Text, Arrow & Pill physically presses DOWN into the dark base
                       scale(1.087) 抵消外层 0.92，保持文字与图标原始视觉尺寸。
                       注意：绿色「面」必须留在 cap 外层跟随底座一起缩放，否则面宽 381
                       会超过缩后底座 360.6，黑边被吃掉。 */}
                  <g
                    id="btn-single-cap"
                    style={{
                      transform: pressedButton === 'single' ? 'translate(0px, 9.5px)' : 'translate(0px, 0px)',
                      transition: pressedButton === 'single' ? 'transform 0.06s cubic-bezier(0.1, 0.9, 0.2, 1)' : 'transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                  >
                    {/* 面：比底座内缩 6px（下方 17px），实测纯平色 #C7F665 */}
                    <rect id="btn-single-face" x="25.5" y="58" width="381" height="150.5" rx="62" fill="#C7F665" />

                    {/* 内容层：反向缩放抵消外层 0.92，使标题 / 箭头 / 胶囊维持原始视觉尺寸。
                         原点取 230.7 而非几何中心，是让箭头圆右侧内缩 = 31px，
                         与十连抽的 31px 完全一致（跟随中心缩放时只有 16.3px，箭头会贴边）。 */}
                    <g
                      id="btn-single-content"
                      style={{
                        transform: 'scale(1.087)',
                        transformOrigin: '230.7px 133px'
                      }}
                    >
                      {/* 主标题（左按钮）：基线 y=133，字体设置与右按钮标题完全一致。
                           ⚠️ 字距不要再为了「和十连抽等宽」拉大：原 60 已接近一个字宽（58），
                           「单」「抽」被拉散到判读困难。24 时字距/字宽 ≈ 0.41，收紧且仍透气。

                           x=97 是配合字距 24 重新配平的结果：标题宽由 176 收窄到 140 后，
                           若沿用旧起点 70，会比下方胶囊（70..264，中心 167）窄 54px，
                           左端对齐会让右侧塌一块，视觉上「明显靠左」（左右边距 44.5 / 81）。
                           改为与胶囊中心对齐：70 → 97（+27），标题中心 167 = 胶囊中心 167，
                           左右边距收敛到 71.5 / 54，标题与胶囊构成稳定的居中文本列。
                           两者仍承担不同角色，不要改回左对齐，也不要再向右压。 */}
                      <text id="txt-single" className="t t-h" x="97" y="133" stroke="#0A0A0A" strokeWidth="1.6" strokeLinejoin="round"
                            fontSize="58" letterSpacing="24">单抽</text>

                      {/* 右侧圆形箭头按钮（实测圆心 332.5,126.5 半径 42） */}
                      <circle id="single-arrow-circle" cx="333" cy="136.5" r="42" fill="#0A0A0A" />
                      <path id="single-arrow" d="M313,136.5 H351 M335,122.5 L351,136.5 L335,150.5"
                            fill="none" stroke="#C7F665" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />

                      {/* 1 抽卡币 胶囊（实测 70..264 × 151..191） */}
                      <rect id="single-coin-pill" x="70" y="151" width="194" height="40" rx="20" fill="#0A0A0A" />
                      <g id="single-coin-crown" transform="translate(112,169.5)">
                        <use href="#ic-crown-pale" />
                      </g>
                      <text id="txt-single-coin" className="t t-w t-h" x="133.5" y="177"
                            fontSize="24" textLength="98" lengthAdjust="spacingAndGlyphs">1 抽卡币</text>
                    </g>
                  </g>
                </g>

                {/* ==========================================================
                     03 右按钮（蓝绿渐变填充 + 黑边）
                     实测轮廓：上沿 y=50（水平）、左沿 x=423、右沿 x=793、下沿向右下倾斜 2.9°
                     四角半径各不相同：左上 64 / 右上 60 / 右下 72 / 左下 76
                     ========================================================== */}
                <g
                  id="btn-multi"
                  style={{
                    transform: pressedButton === 'ten' ? 'translateY(2.5px) scale(0.99)' : 'translateY(0px) scale(1)',
                    transformOrigin: '610px 137px',
                    transition: pressedButton === 'ten' ? 'transform 0.06s ease-out' : 'transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                >
                  <path id="btn-multi-shadow"
                        d="M494,57 H740 A60,60 0 0 1 800,117 V157.1 A72,72 0 0 1 728,229.1 L506,220.2 A76,76 0 0 1 430,144.2 V121 A64,64 0 0 1 494,57 Z"
                        fill="#0A0A0A" opacity="0.16" />
                  {/* 底座（黑边）：与单抽同一结构（黑底座 + 彩色面），
                      黑边左右上约 6px、下方约 17.5px（厚底），与单抽对称 */}
                  <path id="btn-multi-base"
                        d="M487,50 H733 A60,60 0 0 1 793,110 V150.1 A72,72 0 0 1 721,222.1 L499,213.2 A76,76 0 0 1 423,137.2 V114 A64,64 0 0 1 487,50 Z"
                        fill="#0A0A0A" />

                  {/* Button Cap: Dark Face, Title, Arrow & Pill physically presses DOWN into the neon lime base */}
                  <g
                    id="btn-multi-cap"
                    style={{
                      transform: pressedButton === 'ten' ? 'translate(0px, 9.5px)' : 'translate(0px, 0px)',
                      transition: pressedButton === 'ten' ? 'transform 0.06s cubic-bezier(0.1, 0.9, 0.2, 1)' : 'transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                  >
                    {/* 面：三层渐变叠加（饱和→主色带→高光），构成鲜亮通透的蓝绿流光。
                        左右上内缩 6px、底部内缩 17.5px，黑底座在下方露出 = 厚底，与单抽对称。
                        底部圆角用椭圆弧 rx/ry 分别控制水平与垂直内缩量。

                        三层用同一条 d 叠放，顺序不可调换：
                          ① g-multi-deep  底层饱和涌流（同色系高彩度，垫出彩度）
                          ② g-multi-ring  中层主色带（5 色标，H 跨 35.6° / L 50~80，主体流动）
                          ③ g-multi-lite  顶部高光（近白青，琉璃通透感）
                        gb-breathe-target 挂在整组上做 hue-rotate 环流。
                        下两层各带独立周期（9/11/13s）错拍流动，叠加后无循环节律。

                        ⚠️ 中层**不加 opacity**。上一版底层是深色，需靠 opacity 0.92 让它
                        透出来，结果整体压暗发闷；现在底层本身就是鲜亮饱和色，
                        中层必须不透明，否则底色泛上来会冲淡鲜亮感。 */}
                    <g id="btn-multi-face" className="gb-breathe-target">
                      <path
                        d="M493,56 H731 A55,55 0 0 1 786,111 V150.1 A65,54.5 0 0 1 721,204.6 L499,195.7 A70,58.5 0 0 1 429,137.2 V120 A64,64 0 0 1 493,56 Z"
                        fill="url(#g-multi-deep)"
                      />
                      <path
                        d="M493,56 H731 A55,55 0 0 1 786,111 V150.1 A65,54.5 0 0 1 721,204.6 L499,195.7 A70,58.5 0 0 1 429,137.2 V120 A64,64 0 0 1 493,56 Z"
                        fill="url(#g-multi-ring)"
                      />
                      <path
                        d="M493,56 H731 A55,55 0 0 1 786,111 V150.1 A65,54.5 0 0 1 721,204.6 L499,195.7 A70,58.5 0 0 1 429,137.2 V120 A64,64 0 0 1 493,56 Z"
                        fill="url(#g-multi-lite)"
                      />
                    </g>

                    {/* 流动高光：白色斜光带循环扫过按钮面，裁剪在面内不溢出黑边。
                        放在标题下层，光带掠过文字底部但不遮挡字形可读性。 */}
                    <g clipPath="url(#clip-multi-face)" pointerEvents="none">
                      <rect
                        id="btn-multi-sheen"
                        className="gb-sheen-sweep"
                        x="400"
                        y="40"
                        width="420"
                        height="180"
                        fill="url(#g-multi-sheen)"
                      />
                    </g>

                    {/* 主标题：十连抽（黑字，蓝绿填充底上可读；字体与单抽完全一致） */}
                    <text id="txt-multi" className="t t-h" x="466" y="133" stroke="#0A0A0A" strokeWidth="1.6" strokeLinejoin="round"
                          fontSize="58" textLength="175" lengthAdjust="spacingAndGlyphs">十连抽</text>

                    {/* 右侧圆形箭头按钮（黑圆 + 蓝绿箭头，与单抽的黑圆+柠檬绿箭头对称）。
                         箭头色随 v4 主色带同步提彩：#5EEAD4 -> #50F8DD。
                         黑底上更艳反而更清晰（对比度 13.38 -> 14.91）。 */}
                    <circle id="multi-arrow-circle" cx="716" cy="133" r="39" fill="#0A0A0A" />
                    <path id="multi-arrow" d="M697,133 H735 M718,119 L735,133 L718,147"
                          fill="none" stroke="#50F8DD" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />

                    {/* 9 抽卡币 胶囊（实测 466..648 × 147..183） */}
                    <rect id="multi-coin-pill" x="466" y="147" width="183" height="37" rx="18.5" fill="#2E2E2E" />
                    <g id="multi-coin-crown" transform="translate(506,165) scale(0.96)">
                      <use href="#ic-crown-lime" />
                    </g>
                    <text id="txt-multi-coin" className="t t-w t-h" x="526" y="175"
                          fontSize="25" textLength="99" lengthAdjust="spacingAndGlyphs">9 抽卡币</text>
                  </g>
                </g>

                {/* ==========================================================
                     04 9 折限时 粉色气泡徽章
                     整体倾斜 -3.5°（右上高、左下低，与两个按钮同向），随十连抽一同弹性下压
                     ========================================================== */}
                <g
                  id="badge-discount"
                  className={hasUsedTenDraw ? '' : 'gb-badge-live'}
                  style={{
                    transform: pressedButton === 'ten' ? 'translateY(11.5px) scale(0.96)' : 'translateY(0px) scale(1)',
                    transformOrigin: '710px 45.5px',
                    transition: pressedButton === 'ten' ? 'transform 0.06s cubic-bezier(0.1, 0.9, 0.2, 1)' : 'transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                >
                  <g id="badge-body" transform="rotate(-3.5 710 45.5)">
                    <path id="badge-bubble"
                          d="M658,22 H763 A23.5,23.5 0 0 1 763,69 H686 L668,75 L678,69 H658 A23.5,23.5 0 0 1 658,22 Z"
                          fill="url(#g-pink)" stroke="#FFFFFF" strokeWidth="6" strokeLinejoin="round" />
                    <g id="badge-crown" transform="translate(655,41) scale(0.66)">
                      <use href="#ic-crown-yellow" />
                    </g>
                    <text id="txt-discount" className="t t-w t-h" x="674" y="54" fontSize="24" letterSpacing="0">9折限时</text>
                  </g>
                </g>
              </g>
              </g>
            </svg>

            {/* 1. Single Summon Interactive HTML Button */}
            <button
              onClick={() => handleSummon('single')}
              onPointerDown={() => {
                if (isDrawing) return;
                setPressedButton('single');
                playPressSound('single');
              }}
              onPointerUp={() => setPressedButton(null)}
              onPointerLeave={() => setPressedButton(null)}
              onPointerCancel={() => setPressedButton(null)}
              disabled={isDrawing}
              aria-label="单抽 1 抽卡币"
              title="单抽 (1 抽卡币)"
              id="btn-gacha-single"
              className="absolute top-0 left-0 w-[49.5%] h-full cursor-pointer bg-transparent border-0 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none active:outline-none select-none z-10 disabled:cursor-not-allowed group"
              style={{ outline: 'none', WebkitTapHighlightColor: 'transparent' }}
            />

            {/* 2. Ten-Fold Summon Interactive HTML Button */}
            <button
              onClick={() => handleSummon('ten')}
              onPointerDown={() => {
                if (isDrawing) return;
                setPressedButton('ten');
                playPressSound('ten');
              }}
              onPointerUp={() => setPressedButton(null)}
              onPointerLeave={() => setPressedButton(null)}
              onPointerCancel={() => setPressedButton(null)}
              disabled={isDrawing}
              aria-label="十连抽 9 抽卡币 9折限时"
              title="十连抽 (9 抽卡币)"
              id="btn-gacha-ten"
              className="absolute top-0 right-0 w-[49.5%] h-full cursor-pointer bg-transparent border-0 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none active:outline-none select-none z-10 disabled:cursor-not-allowed group"
              style={{ outline: 'none', WebkitTapHighlightColor: 'transparent' }}
            />
          </div>

          {/* Bottom Surface with Skip Animation */}
          <div className="py-2 px-2 flex items-center justify-center relative z-10 mb-2">
            <label
              onClick={() => setSkipAnimation(!skipAnimation)}
              className="flex items-center gap-1.5 cursor-pointer text-black hover:opacity-80 select-none text-xs font-black active:scale-95 transition-all duration-200 ease-out"
              id="skip-animation-toggle"
            >
              <div
                className={`w-4 h-4 rounded-md border-2 border-black transition-all flex items-center justify-center ${
                  skipAnimation
                    ? 'bg-[#C7F665] text-black shadow-[1px_1px_0_#000]'
                    : 'bg-white'
                }`}
              >
                {skipAnimation && <Check className="w-3 h-3 stroke-[3.5]" />}
              </div>
              <span>跳过动画</span>
            </label>
          </div>

          {/* UNIFIED PANTRY COLLECTION BIG CARD (分类、食材网格与配送定制统一大卡片) */}
          <div
            /* 去掉黑描边：卡片浮在青柠底上，白底本身已有足够分离度，
               再加黑粗边会变成「黑加绿」的廉价观感（用户已多次指出）。 */
            /* ⚠️ 不要 sm: 变体：视口 >640px 时 p-4 会把网格挤窄 8px，
               而手机壳宽度是恒定的 410px，这个断点只会制造「桌面/窄窗两种观感」。 */
            className="w-full bg-white rounded-[24px] p-3 shadow-sm relative z-10 select-none flex flex-col"
            id="unified-pantry-big-card"
          >
            {/* Category Tabs & Select-All Row (Balanced proportion, natural width fitting tabs snugly, right-aligned select-all) */}
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 select-none">
              {/* Left Capsule Pill Track: 全部, 蛋白, 蔬底, 配料 (Snug, compact pill container matching original proportion) */}
              <div className="inline-flex items-center bg-[#f1f4f8] rounded-full p-1 border border-slate-200/80 gap-0.5 shrink-0">
                {(
                  [
                    { key: 'all', label: '全部' },
                    { key: 'protein', label: '蛋白' },
                    { key: 'base', label: '蔬底' },
                  ] as const
                ).map((cat) => {
                  const isActive = activeCategoryFilter === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setActiveCategoryFilter(cat.key)}
                      className={`relative px-4 py-1.5 rounded-full text-sm font-black transition-all duration-200 ease-out cursor-pointer whitespace-nowrap leading-none active:scale-95 ${
                        isActive
                          ? 'bg-black text-white shadow-xs border-[2px] border-[#C7F665]'
                          : 'text-[#475467] hover:text-black bg-transparent'
                      }`}
                    >
                      {/* Gloss top arc for active pill */}
                      {isActive && (
                        <span className="absolute top-[2px] left-2 right-2 h-[4px] rounded-full bg-white/35 pointer-events-none" />
                      )}
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Right Side: Neon Lime Pill with "全选" + Checkmark Icon */}
              <div className="relative shrink-0 flex items-center">
                <button
                  onClick={() => {
                    if (selectedIngredients.length === pantry.length) {
                      handleClearAllSelections();
                    } else {
                      handleSelectAllPantry();
                    }
                  }}
                  className="relative flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#C7F665] hover:bg-[#B7EF4B] active:scale-95 transition-all duration-200 ease-out text-black font-black text-sm cursor-pointer border-[2px] border-black shadow-[1px_1px_0_#000]"
                  title={selectedIngredients.length === pantry.length ? "取消全选" : "全选全部食材"}
                  id="btn-category-select-all-pill"
                >
                  <span>{selectedIngredients.length === pantry.length ? '取消全选' : '全选'}</span>
                  {/* Black Circular Checkmark Badge with Gloss Highlight */}
                  <span className="relative w-4.5 h-4.5 rounded-full bg-black flex items-center justify-center shrink-0">
                    <CheckIcon className="w-3 h-3 text-[#C7F665]" />
                    {/* Gloss accent */}
                    <span className="absolute top-[1.5px] right-[2px] w-1 h-1 rounded-full bg-white/70 pointer-events-none" />
                  </span>
                </button>
              </div>
            </div>

            {/* 食材网格：分类切换动画
                ------------------------------------------------------------
                经过 4 轮实测调优，最终方案是**去掉 layout 位移，改纯淡入淡出**。
                这里记录完整排查过程与实测数据，避免后人误改回 layout：

                【最初的问题】三处动画参数冲突
                  ① mode="popLayout" 把退场卡片设 position:absolute，
                     但它仍参与 layout 测量 -> 新旧卡片瞬态重叠。
                  ② exit 的 scale 与 layout 抢同一条 transform 通道。
                  ③ transition 只有 duration，layout 位移与 opacity 共用 0.15s，
                     实测「全部 -> 蔬底」单帧跳变 93.7px（≈620px/s），肉眼是「窜」。

                【修完①②③后仍剩真重叠】—— 这才是决定性的一步
                  实测「蔬底 -> 全部」仍有 4 帧矩形相交，**最深 167px**。
                  输出坐标定位到具体一对：羽衣甘蓝(x39) <-> 多汁圣女果(x39)，
                  随后羽衣甘蓝 x 从 39 跳到 129（3 帧横跨 90px）。

                  根因：**layout 位移的路径会横穿同列其他卡片**。
                  网格筛选本质是「换一批内容」，不是「移动同一批物体」——
                  用位移动画表达这个语义不对，横穿是必然结果，不是 bug。
                  → 去掉 layout，卡片改为「原地淡入 + 微缩放 + 轻微上浮」。
                     零位移 = 零重叠，这是唯一能彻底解决的路子。

                【最终方案：纯渐隐渐出（crossfade）】
                  入场: opacity 0->1，0.22s easeOut，延迟 0.03s
                  退场: opacity 1->0，0.16s easeIn
                  **只驱动 opacity，不带 scale / y**。
                  理由：网格筛选本质是「换一批内容」，任何位移都会让卡片在
                  网格里横穿同列其他卡片（实测最深重叠 167px）；
                  纯透明度过渡的路径恒等于原位，结构上不可能重叠。
                  0.03s 延迟让淡出先走一点、淡入再接力，视觉上不闪烁。

                  注：不用 popLayout —— 既然无位移，退场卡片留在流里
                  自然淡出即可，绝对定位反而会引发布局跳动。

                交互反馈（whileHover 上浮 / whileTap 缩小）不属于切换动画，
                保留原样，缩放与淡入淡出走不同属性互不干扰。

                卡片保留 will-change-transform 提升合成层，减少重绘掉帧。 */}
            {/* ⚠️ 列数不能用 sm: 断点。
                应用恒渲染在 410px 手机壳里，而 sm: 看的是**视口**宽度：
                视口 >640px 时 3 列 -> 卡片只剩 99px，图片却还是 sm 的 86px，
                图高占卡片 87%，把菜名和 kcal/价格行挤变形（桌面浏览器上的实际观感）。
                视口 <640px 时又变 2 列 -> 卡片 176px，一屏只放得下 4 个，太散。
                这里改成固定 3 列：410px 下卡片约 119px，两种窗口宽度观感一致。 */}
            <div className="grid grid-cols-3 gap-2.5 mb-2.5">
              <AnimatePresence initial={false}>
                {pantry
                  .filter((item) => activeCategoryFilter === 'all' || item.category === activeCategoryFilter)
                  .map((item) => {
                    const isSelected = selectedIngredientIds.has(item.id);
                    return (
                      <motion.div
                        /* 入库重排动画：新食材插到最前面，已有食材整体后移一位。
                           没有 layout 的话这一步是硬跳，卡片会"瞬移"；
                           这里让 Framer 用 FLIP 把位移补成滑动。
                           ⚠️ 只在 reorderAnim 期间开启，且用 "position" 只动位移 ——
                           常开 + 全量 layout 会破坏分类切换的交叉淡化（卡片重叠+拉伸）。 */
                        layout={reorderAnim ? 'position' : false}
                        /* 分类切换：纯渐隐渐出（crossfade）
                           只驱动 opacity，刻意不带 scale / y 位移 —— 任何位移都会让
                           卡片在网格里"横穿"同列其他卡片，制造瞬态重叠（实测最深 167px）。
                           纯透明度过渡的路径恒等于原位，结构上不可能重叠。
                           节奏沿用调优值：淡出 0.16s + 淡入延迟 0.03s + 淡入 0.22s。 */
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { duration: 0.22, ease: 'easeOut', delay: 0.03 } }}
                        exit={{ opacity: 0, transition: { duration: 0.16, ease: 'easeIn' } }}
                        /* 交互反馈不属于切换动画，保留缩放/上浮手感 */
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        key={item.id}
                        /* 爆裂揭示的食材飞行落点靠这个 ref 反查屏幕坐标 */
                        ref={(el) => {
                          if (el) pantryCardRefs.current.set(item.id, el as HTMLElement);
                          else pantryCardRefs.current.delete(item.id);
                        }}
                        onClick={() => handleToggleIngredient(item.id)}
                        /* ⚠️ 卡片内部一律不要 sm: 变体。
                           应用恒在 410px 手机壳里，sm: 看的是视口宽度 —— 桌面下
                           padding 8px / badge 20px / 菜名 11px 全部变大，把中间留给
                           插画的高度压到只剩 29px，50px 的图直接被 overflow-hidden 裁掉。
                           统一用移动端尺寸后，中间图槽稳定在 ~54px，插画能完整显示。 */
                        className={`aspect-square w-full rounded-[16px] cursor-pointer relative flex flex-col justify-between p-1.5 select-none border will-change-transform active:scale-[0.98] transition-all duration-200 ease-out ${
                          isSelected
                            /* 选中态：只保留外层青柠环，不要内层黑边。
                               仍保留 1px 透明边框占位，否则与未选中态之间会跳 1px 版。 */
                            ? 'bg-white border-transparent shadow-xs ring-2 ring-[#C7F665]'
                            : OPTION_CARD_UNSELECTED
                        }`}
                      >
                        {/* Top Row: Rarity Tag (Left) & Selection Checkmark Badge (Right) */}
                        <div className="w-full flex items-center justify-between z-10">
                          {/* Rarity Badge - no border, snug compact outer box matching text with gentle rounded corners */}
                          <div
                            className={`relative px-1.5 py-0.5 min-w-[18px] h-4.5 rounded-[7px] flex items-center justify-center shrink-0 ${
                              item.rarity === 'SSR'
                                ? 'bg-[#ffb400]'
                                : item.rarity === 'SR'
                                ? 'bg-[#b388ff]'
                                : 'bg-[#C7F665]'
                            }`}
                          >
                            {/* 稀有度徽章不加白描边（用户指定：卡片里只有食材名字带描边）。
                                徽章本身已经是青柠/金/紫实色底，黑字对比度足够。 */}
                            <span className="font-black text-black text-[11px] leading-none tracking-tight">
                              {item.rarity}
                            </span>
                          </div>

                          {/* Top-Right Circular Checkmark Badge with thick black outline */}
                          <CheckBadge selected={isSelected} />
                        </div>

                        {/* Center Food Visual: Clean 3D illustration comfortably scaled without overflow */}
                        {/* pb-2（8px）是给菜名让出的「专用下边距」：
                            插画 h-full 量的是**内容盒**高度，所以这 8px 会直接从插画高度里扣掉
                            （46 -> 38px），插画整体上移，与菜名的重叠从 15px 降到 7px。
                            想让遮挡更少就加大这个值，想更少留白就减小 —— 只调这一处。 */}
                        <div className="w-full flex-1 min-h-0 max-h-[50%] relative flex items-center justify-center my-0.5 pb-2 overflow-hidden">
                          {/* 插画是正方形（320×320，内容 300px 居中），object-contain 按短边缩放。
                              尺寸用 h-full w-auto 吃满图槽，不写固定 px ——
                              图槽高度随卡片宽度变（106px 卡片 -> 槽 43px；114px -> 槽 51px），
                              固定值必有一边被裁。
                              max-h-[50%] 把图槽锁在卡片内高的一半：菜名从下面的流里搬进来之后，
                              少了一行的高度会被 flex-1 全吃掉，图会凭空胀大 —— 这里卡住上限。 */}
                          {renderIngredientVisual(item.id, item.name, "h-full w-auto max-w-full object-contain")}

                          {/* 菜名压在插画下缘，不再排在卡片底部。两个原因：
                              ① 白描边只有落在插画这种彩色背景上才看得见，
                                 排回近白卡片底（#f7f9fb）上等于白加；
                              ② 用户明确要求「适当挡住食材」，压在图上才有贴纸感。
                              字号 10px -> 12px，描边同步换 lg 版（2px）。 */}
                          <h4 className="absolute inset-x-0 bottom-0 z-10 font-black text-black text-[12px] leading-tight text-center whitespace-nowrap overflow-hidden text-ellipsis tracking-tight text-stroke-white-lg pointer-events-none">
                            {item.name}
                          </h4>
                        </div>

                        {/* Bottom Nutrition & Price Row (Compact pill-shaped containers matching reference) */}
                        <div className="w-full flex items-center justify-between gap-1 z-10">
                          {/* Kcal Pill: Light blue-grey background with soft bold text */}
                          <div className="px-1 py-0.5 rounded-full bg-[#f1f4f8] flex items-center justify-center shrink-0">
                            <span className="font-bold text-[#475467] text-[13px] tracking-tighter whitespace-nowrap leading-none">
                              {item.kcal} kcal
                            </span>
                          </div>

                          {/* Price: 裸数字，无胶囊底。
                              颜色沿革：--lime-700 (#54801A) → text-rose-600 → **#E60012（正红）**。
                              用户要求「价格改成正红色」，全项目价格红统一为 #E60012，
                              与底部导航/悬浮购物车的计数红点同一套红。
                              ⚠️ 白卡上永远不要用品牌主色 #C7F665 当文字（对白对比度仅 1.25:1）。
                              #E60012 对白 4.8:1、对 #f7f9fb 卡片底 4.5:1，过 AA；
                              比 rose-600 (#E11D48) 更「正」，比 #E53935 / #FF0000 对比度更好。

                              字号 13px -> 15px（用户要求「价格视觉上比卡路里大一点」）。
                              实测依据（scripts/probe-price-size.mjs，410px 手机壳、3 列）：
                              这一行内容宽 100px，最宽的一组「180 kcal」胶囊 52.8px + 「¥15」20.9px，
                              13px 时余量 26.3px；放大到 15px 后价格占 24.1px，余量仍有 23px。
                              ⚠️ 行高由 kcal 胶囊决定（13px 字 + py-0.5 = 17px），价格 15px 的
                              15px 行高仍在 17px 以内 —— 这一行**不会变高**，图槽和插画尺寸不受影响。
                              再往上加到 17px 也放得下（余量 19.8px），只是会盖过菜名 12px 的层级。 */}
                          <div className="shrink-0 flex items-center justify-center">
                            <span className="font-black text-[#E60012] text-[15px] leading-none tracking-tight whitespace-nowrap">
                              ¥{item.price}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </AnimatePresence>
            </div>

            {/* Delivery & Custom Bowl Status Panel: Clean Text/Controls Layout without outer shell */}
            <div className="w-full px-1 py-1.5 select-none flex flex-col justify-center">
              {/* Top Area (between top border and divider line): Left has Title + Subtitle, Right has vertically centered Delivery button */}
              <div className="flex items-center justify-between gap-2">
                {/* Left Column: Title + Status Pill in row 1, Subtitle in row 2 */}
                <div className="flex flex-col min-w-0 justify-center">
                  <div className="flex items-center gap-1.5 min-w-0 flex-nowrap">
                    <h3 className="font-black text-black text-[15px] tracking-tight leading-none whitespace-nowrap shrink-0">
                      {selectedCount === 0 ? '未勾选食材' : `已勾选 ${selectedCount} 款食材`}
                    </h3>
                    {/* Status Pill */}
                    <div
                      className="px-2.5 py-0.5 rounded-full flex items-center justify-center bg-[#C7F665] text-black shrink-0 whitespace-nowrap"
                    >
                      <span className="font-black text-[12px] tracking-tight leading-none whitespace-nowrap">
                        {isDeliveryThresholdMet ? '已满起送' : `差${10 - selectedCount}款`}
                      </span>
                    </div>
                  </div>

                  {/* Subtitle explanation text */}
                  <p className="text-[#64748b] font-medium text-[11px] tracking-tight mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
                    点击食材，自由搭配定制
                  </p>
                </div>

                {/* Right Side: Delivery Pill Button centered vertically between top and bottom divider */}
                <div className="shrink-0 flex items-center self-center">
                  <button
                    onClick={handleAddCustomMealToCart}
                    disabled={!isDeliveryThresholdMet}
                    className={`px-5 py-2.5 rounded-full flex items-center gap-2 font-black text-[14px] tracking-tight transition-all select-none ${
                      isDeliveryThresholdMet
                        ? 'bg-[#C7F665] hover:bg-[#B7EF4B] text-black cursor-pointer shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 ease-out'
                        : 'bg-[#94a3b8] text-white cursor-not-allowed opacity-95 shadow-xs'
                    }`}
                    id="btn-pantry-delivery-threshold"
                  >
                    <svg
                      className="w-4.5 h-4.5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="1" y="3" width="15" height="13" rx="2" />
                      <polygon points="16 8 20 8 23 11 23 16 16 8" />
                      <circle cx="5.5" cy="18.5" r="2.5" />
                      <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                    <span className="whitespace-nowrap font-black">
                      {isDeliveryThresholdMet ? '立即起送' : '满 10 款起送'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        </div>
      </div>


      {/* OVERLAY: 抽卡爆裂揭示（餐盘飞出光点 → 光芒消散 → 食材飞入食材库） */}
      <GachaBurstReveal
        active={revealActive}
        items={revealItems}
        mode={revealMode}
        origin={revealOrigin}
        resolveTargetRect={resolvePantryTarget}
        onComplete={handleRevealComplete}
      />

      {/* MODAL: Full 10 Ingredients Encyclopedia / Checklist Modal */}
      <AnimatePresence>
        {showChecklistModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-slate-100 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#C7F665]/20 text-[#26430B] flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">盲盒食材奖池</h3>
                    <p className="text-xs text-slate-400">
                      全 {GACHA_INGREDIENTS.length} 款食材 · 已收集 {pantry.length} 款 · 满 10 款免费起送
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChecklistModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer active:scale-95 transition-all duration-200 ease-out"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Full Catalog List — 展示全部奖池，不做截断。
                  旧实现 slice(0, 10) 只显示前 10 种，而后 10 种（竹节玉米/西兰花/毛豆/
                  白芝麻/松露/辣椒/油醋汁等）玩家永远无法查看，「已收录全品类」名不副实。
                  isOwned 只按 id 判定；旧实现额外写了 `i === 0 && ing.id === 'ing_steak'`
                  的硬编码兜底，会在未真正拥有时谎报「已收集」，已移除。 */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 py-1">
                {GACHA_INGREDIENTS.map((ing) => {
                  const isOwned = pantry.some((p) => p.id === ing.id);
                  return (
                    <div
                      key={ing.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                        isOwned ? 'bg-[#F2FCE0]/60 border-[#C7F665]/80' : 'bg-slate-50 border-slate-100 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-2xs border border-slate-100">
                          {renderIngredientVisual(ing.id, ing.name)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-slate-900 text-sm">{ing.name}</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
                              {ing.rarity}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{ing.desc}</p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        {isOwned ? (
                          <span className="text-xs font-black text-[#54801A] flex items-center gap-0.5">
                            <Check className="w-3.5 h-3.5" /> 已收集
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-slate-400">待解锁</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setShowChecklistModal(false)}
                className="w-full mt-3 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm cursor-pointer active:scale-95 transition-all duration-200 ease-out"
              >
                我知道了
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Get More Gacha Tokens / Daily Check-in */}
      <AnimatePresence>
        {showGetTokensModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-100 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 border border-amber-200/60">
                <Crown className="w-6 h-6 fill-amber-500 text-amber-500" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">获取抽卡币</h3>
              <p className="text-xs text-slate-400 mt-0.5 mb-3.5">
                当前剩余: <strong className="text-slate-900 font-extrabold">{tokens}</strong> 币
              </p>

              <div className="space-y-2 mb-3.5 text-left">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <span>每日签到</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">每日限1次</span>
                    </div>
                    <div className="text-[11px] text-[#54801A] font-semibold">+1 抽卡币</div>
                  </div>
                  <button
                    disabled={hasCheckedInToday}
                    onClick={() => {
                      if (hasCheckedInToday) {
                        onShowToast('今日已签到');
                        return;
                      }
                      setTokens((prev) => prev + 1);
                      setHasCheckedInToday(true);
                      onShowToast('🎉 签到成功！已获得 1 枚抽卡币');
                      setShowGetTokensModal(false);
                    }}
                    className={`px-3 py-1 rounded-full font-extrabold text-xs transition-all shadow-2xs ${
                      hasCheckedInToday
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300/60'
                        : 'bg-gradient-to-r from-[#54801A] to-[#54801A] text-white hover:brightness-105 cursor-pointer active:scale-95 transition-all duration-200 ease-out'
                    }`}
                  >
                    {hasCheckedInToday ? '已签到' : '领 1 币'}
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-xs">好友助力</div>
                    <div className="text-[11px] text-slate-500">+1 抽卡币</div>
                  </div>
                  <button
                    onClick={() => {
                      setTokens((prev) => prev + 1);
                      onShowToast('🎉 分享成功！已获得 +1 抽卡币');
                      setShowGetTokensModal(false);
                    }}
                    className="px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs cursor-pointer active:scale-95 transition-all duration-200 ease-out"
                  >
                    去分享
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowGetTokensModal(false)}
                className="w-full py-2 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold text-xs cursor-pointer active:scale-95 transition-all duration-200 ease-out"
              >
                关闭
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Delivery Reward Success Claimed */}
      <AnimatePresence>
        {showDeliverySuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-100 text-center relative"
            >
              <button
                onClick={() => setShowDeliverySuccessModal(false)}
                className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors duration-200 ease-out cursor-pointer active:scale-95"
                id="btn-close-delivery-modal"
                title="关闭"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 rounded-full bg-[#F2FCE0] text-[#26430B] flex items-center justify-center mx-auto mb-2 border border-[#C7F665]/60">
                <Truck className="w-6 h-6 text-[#54801A]" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">🎉 达成 10 款起送！</h3>
              <p className="text-xs text-slate-500 mt-1.5 mb-4 leading-relaxed">
                已集齐 10 款食材，专属免费配送订单已生成，后厨现制中。
              </p>
              <button
                onClick={() => {
                  setShowDeliverySuccessModal(false);
                  onNavigate('orders');
                  onShowToast('🚚 免单配送订单已生成！正在极速配送中');
                }}
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#54801A] to-[#54801A] text-white font-extrabold text-sm shadow-xs cursor-pointer active:scale-95 transition-all duration-200 ease-out"
              >
                查看订单
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================
          未接入的常量与逻辑（自查发现，未删除，保留供后续接入）
          ------------------------------------------------------------
          1. DROP_RATES / DAILY_TASKS — 定义完整但页面未渲染。
             DROP_RATES 的 15/35/50 现已是 drawSingle 的真实权重（改权重需同步改这里），
             但玩家在图鉴弹窗里看不到掉率说明。
          2. onClaimCoupon — Props 里声明了，本组件既不接收也不调用。
             满 10 款时走的是 handleAddCustomMealToCart（下单）而非领券。
          3. handleClaimFreeDelivery + showDeliverySuccessModal — 已实现完整的
             「达成 10 款免单配送」弹窗，但没有任何入口调用它，目前是死代码。
             触发点应该在勾选满 10 款时的配送按钮上。
          4. dimensionStatus / completedDimensionCount / deliveryProgressPercent /
             getDynamicRecommendation / collectedCount / isDeliveryGoalMet —
             「四维均衡」与「进度百分比」的计算都已写好，但 UI 里没有对应展示。
          5. CloudSkyBackground — 已 import 未使用，背景目前是内联 img + SVG 波浪。
          ============================================================ */}
    </div>
  );
};

/* ============================================================================
   结果弹窗专用装饰组件（结果弹窗高保真复刻用）
   ---------------------------------------------------------------------------
   参考图是「手账 / doodle」风格：白卡 + 粗黑描边 + 硬斜投影 + 手绘涂鸦线条。
   这些元素全是纯装饰，用固定 viewBox 的内联 SVG 绘制 —— 不引入图片资源，
   任意缩放都清晰，且能用 CSS 变量跟随主题色。
   ========================================================================== */
