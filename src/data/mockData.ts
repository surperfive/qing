import { Dish, Category, Store, Coupon, GachaCard, Order, GachaIngredient } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'all', name: '全部热卖', badge: 'HOT' },
  { id: 'salad', name: '清爽沙拉', count: 4 },
  { id: 'bowl', name: '主食能量碗', count: 4 },
  { id: 'hot', name: '暖心轻食', count: 3 },
  { id: 'drink', name: '低卡鲜饮', count: 3 },
  { id: 'snack', name: '蛋白小食', count: 3 }
];

export const DISHES: Dish[] = [
  {
    id: 1,
    name: '牛油果鸡胸沙拉',
    subtitle: '清爽鲜嫩 · 高蛋白控卡',
    description: '甄选鲜嫩低温慢煮鸡胸肉，搭配优质墨西哥牛油果、罗马生菜、樱桃番茄与秘制香草柠檬油醋汁。',
    kcal: 356,
    protein: 34,
    fat: 12,
    carbs: 18,
    price: 32,
    dealPrice: 25.6,
    originalPrice: 32,
    sold: '1.2万+',
    category: 'salad',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    bg: '#DCFCE7',
    color: '#16A34A',
    tags: ['首单立减', '高蛋白', '生酮友好'],
    isPopular: true,
    isLimit: true,
    maxLimit: 2,
    icon: 'salad',
    isKeto: true,
    isSugarFree: true,
    isHighFiber: true,
    temperature: 'cold',
    allergens: []
  },
  {
    id: 3,
    name: '羽衣甘蓝酸奶昔',
    subtitle: '0卡糖配方 · 顺畅排腹',
    description: '鲜采羽衣甘蓝与生椰乳、无糖浓缩希腊酸奶现打，富含丰富叶绿素与活性益生菌。',
    kcal: 198,
    protein: 9,
    fat: 6,
    carbs: 22,
    price: 22,
    dealPrice: 17.6,
    originalPrice: 22,
    sold: '1.5万+',
    category: 'drink',
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80',
    bg: '#E0F2FE',
    color: '#0284C7',
    tags: ['限时立减', '低糖轻盈', '无添加蔗糖'],
    isPopular: false,
    isLimit: true,
    maxLimit: 2,
    icon: 'cup',
    isSugarFree: true,
    isVegetarian: true,
    temperature: 'cold',
    allergens: ['乳制品']
  },
  {
    id: 4,
    name: '金枪鱼三明治',
    subtitle: '双层夹心 · 优质深海高蛋白',
    description: '100%纯全麦吐司，深海油浸金枪鱼肉碎、水煮蛋切片与脆爽酸黄瓜。',
    kcal: 289,
    protein: 26,
    fat: 7,
    carbs: 28,
    price: 26,
    dealPrice: 20.8,
    originalPrice: 26,
    sold: '9300+',
    category: 'snack',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
    bg: '#FDD3EA',
    color: '#DB2777',
    tags: ['限时立减', '高纤维', '随手轻食'],
    isPopular: true,
    isLimit: true,
    maxLimit: 2,
    icon: 'sandwich',
    isHighFiber: true,
    temperature: 'cold',
    allergens: ['海鲜', '麸质']
  },
  {
    id: 7,
    name: '日式照烧鸡肉锅',
    subtitle: '热腾出炉 · 冬春暖胃',
    description: '鲜香去皮鸡腿肉与原木香菇慢炖，配日式昆布高汤与魔芋丝结。',
    kcal: 380,
    protein: 31,
    fat: 9,
    carbs: 24,
    price: 36,
    dealPrice: 29.9,
    originalPrice: 36,
    sold: '5400+',
    category: 'hot',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
    bg: '#FEF3C7',
    color: '#B45309',
    tags: ['暖心热食', '低热量高饱腹'],
    icon: 'flame',
    temperature: 'hot',
    allergens: ['麸质']
  },
  {
    id: 8,
    name: '冷萃燕麦拿铁',
    subtitle: 'Oatly燕麦奶 · 双倍浓缩',
    description: '阿拉比卡精选咖啡豆低温18小时慢速冷萃，融合Oatly咖啡大师燕麦奶。',
    kcal: 120,
    protein: 4,
    fat: 3,
    carbs: 16,
    price: 18,
    dealPrice: 14.4,
    originalPrice: 18,
    sold: '2.1万+',
    category: 'drink',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
    bg: '#F5F3FF',
    color: '#7C3AED',
    tags: ['提神醒脑', '0蔗糖添加'],
    icon: 'cup',
    isSugarFree: true,
    isVegetarian: true,
    isVegan: true,
    temperature: 'cold',
    allergens: ['麸质']
  },
  {
    id: 9,
    name: '希腊酸奶杯',
    subtitle: '新鲜蓝莓 · 坚果麦片',
    description: '传统滤乳清希腊酸奶，质地厚重如冰淇淋，配混合烤坚果与野生蓝莓。',
    kcal: 156,
    protein: 15,
    fat: 5,
    carbs: 12,
    price: 16,
    dealPrice: 12.8,
    originalPrice: 16,
    sold: '1.8万+',
    category: 'snack',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80',
    bg: '#FDD3EA',
    color: '#DB2777',
    tags: ['下午茶无负担', '高蛋白'],
    icon: 'apple',
    isSugarFree: true,
    isVegetarian: true,
    temperature: 'cold',
    allergens: ['乳制品', '坚果']
  }
];

export const STORES: Store[] = [
  {
    id: 's1',
    name: '静安寺旗舰店',
    address: '上海市静安区南京西路1601号越洋广场B2',
    distance: '966m',
    openTime: '08:30 - 21:30',
    phone: '021-62881234'
  },
  {
    id: 's2',
    name: '陆家嘴国金店',
    address: '上海市浦东新区世纪大道8号IFC商场LG1',
    distance: '2.4km',
    openTime: '09:00 - 22:00',
    phone: '021-68885678'
  },
  {
    id: 's3',
    name: '新天地时尚店',
    address: '上海市黄浦区马当路245号新天地时尚B1',
    distance: '3.1km',
    openTime: '09:30 - 22:00',
    phone: '021-63339999'
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'c1',
    title: '新人首单立减券',
    discount: 8,
    minSpend: 25,
    desc: '全场通用 · 满25元可用',
    validUntil: '2026-09-30',
    tag: '新人专享'
  },
  {
    id: 'c2',
    title: '满减免运费券',
    discount: 5,
    minSpend: 35,
    desc: '外卖专享 · 可抵扣配送费',
    validUntil: '2026-08-31',
    tag: '免运专区'
  },
  {
    id: 'c3',
    title: '轻食下午茶饮品券',
    discount: 6,
    minSpend: 20,
    desc: '仅限饮品与小吃类可用',
    validUntil: '2026-09-15',
    tag: '饮品特惠'
  }
];

export const GACHA_CARDS: GachaCard[] = [
  {
    id: 101,
    name: '【SSR】黑椒谷饲牛排碗 免单券',
    rarity: 'SSR',
    tag: 'SSR · 今日欧皇限定',
    rewardTitle: '免费享用原价 ¥39 谷饲牛排能量碗',
    rewardValue: 39,
    dishRefId: 5,
    bg: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
    accentColor: '#FF6B6B',
    icon: 'crown'
  },
  {
    id: 102,
    name: '【SR】牛油果鸡胸沙拉 5折券',
    rarity: 'SR',
    tag: 'SR · 人气减脂之选',
    rewardTitle: '牛油果鸡胸沙拉 5 折兑换 (立省 ¥16)',
    rewardValue: 16,
    dishRefId: 1,
    bg: 'linear-gradient(135deg, #845EC2, #EC4899)',
    accentColor: '#845EC2',
    icon: 'star'
  },
  {
    id: 103,
    name: '【R】低卡鲜饮无门槛立减 ¥6 券',
    rarity: 'R',
    tag: 'R · 经典日常百搭',
    rewardTitle: '全场低卡饮品无门槛立减 ¥6',
    rewardValue: 6,
    dishRefId: 3,
    bg: 'linear-gradient(135deg, #00C9A7, #4D8076)',
    accentColor: '#00C9A7',
    icon: 'gift'
  }
];

export const GACHA_INGREDIENTS: GachaIngredient[] = [

  {
    id: 'ing_steak',
    name: '安格斯牛排',
    category: 'protein',
    categoryName: '优质蛋白',
    rarity: 'SSR',
    kcal: 180,
    protein: 28,
    fat: 7,
    carbs: 0,
    price: 15,
    originalPrice: 28,
    emoji: '🥩',
    tag: 'SSR 极品红肉',
    desc: '原切谷饲安格斯牛肉，高饱腹铁锌充能'
  },
  {
    id: 'ing_prawn',
    name: '黑虎虾串',
    category: 'protein',
    categoryName: '优质蛋白',
    rarity: 'SR',
    kcal: 95,
    protein: 20,
    fat: 1.5,
    carbs: 1,
    price: 9,
    originalPrice: 18,
    emoji: '🦐',
    tag: 'SR 极低脂高蛋白',
    desc: '紧实鲜甜，低脂弹牙'
  },
  {
    id: 'ing_chicken',
    name: '黑椒鸡胸肉',
    category: 'protein',
    categoryName: '优质蛋白',
    rarity: 'SR',
    kcal: 125,
    protein: 26,
    fat: 2,
    carbs: 0,
    price: 8,
    originalPrice: 16,
    emoji: '🍗',
    tag: 'SR 经典刷脂蛋白',
    desc: '65℃恒温慢煮，锁水多汁不干柴'
  },
  {
    id: 'ing_tofu',
    name: '高纤嫩豆腐',
    category: 'protein',
    categoryName: '优质蛋白',
    rarity: 'R',
    kcal: 85,
    protein: 10,
    fat: 4,
    carbs: 3,
    price: 4,
    originalPrice: 10,
    emoji: '🧈',
    tag: 'R 植物蛋白',
    desc: '天然大豆精华，柔嫩爆汁好吸收'
  },
  {
    id: 'ing_egg',
    name: '溏心水波蛋',
    category: 'protein',
    categoryName: '优质蛋白',
    rarity: 'R',
    kcal: 75,
    protein: 7,
    fat: 5,
    carbs: 0.5,
    price: 2,
    originalPrice: 6,
    emoji: '🥚',
    tag: 'R 黄金蛋黄脂香',
    desc: '无菌可生食鸡蛋，蛋黄流心香浓'
  },

  // 2. 主粮基底 (Base),
  {
    id: 'ing_quinoa',
    name: '藜麦糙米饭',
    category: 'base',
    categoryName: '主粮基底',
    rarity: 'SR',
    kcal: 160,
    protein: 4.5,
    fat: 1.8,
    carbs: 32,
    price: 5,
    originalPrice: 12,
    emoji: '🍚',
    tag: 'SR 慢碳稳血糖',
    desc: '富含全谷物膳食纤维，抗饿持重'
  },
  {
    id: 'ing_kale',
    name: '羽衣甘蓝',
    category: 'base',
    categoryName: '主粮基底',
    rarity: 'R',
    kcal: 30,
    protein: 2.5,
    fat: 0.4,
    carbs: 4,
    price: 3,
    originalPrice: 8,
    emoji: '🥬',
    tag: 'R 0卡生酮基底',
    desc: '鲜嫩脆爽，富含维生素与叶绿素'
  },
  {
    id: 'ing_tomato',
    name: '多汁圣女果',
    category: 'topping',
    categoryName: '鲜蔬配料',
    rarity: 'R',
    kcal: 22,
    protein: 1,
    fat: 0.2,
    carbs: 4.5,
    price: 2,
    originalPrice: 6,
    emoji: '🍅',
    tag: 'R 番茄红素',
    desc: '酸甜爽口，解腻多汁'
  },
  {
    id: 'ing_broccoli',
    name: '高纤西兰花',
    category: 'topping',
    categoryName: '鲜蔬配料',
    rarity: 'R',
    kcal: 28,
    protein: 2.8,
    fat: 0.3,
    carbs: 5,
    price: 2,
    originalPrice: 6,
    emoji: '🥦',
    tag: 'R 十字花科超级蔬菜',
    desc: '清甜解腻，维C含量丰富'
  },
  {
    id: 'ing_edamame',
    name: '日式毛豆仁',
    category: 'topping',
    categoryName: '鲜蔬配料',
    rarity: 'R',
    kcal: 65,
    protein: 6,
    fat: 2.5,
    carbs: 5,
    price: 2,
    originalPrice: 6,
    emoji: '🫛',
    tag: 'R 植物蛋白小能手',
    desc: '鲜美香脆，富含大豆异黄酮'
  },

  // 4. 主厨特调酱汁 (Sauce),
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord_101',
    orderNo: '#20260822001',
    createdAt: '今天 12:15',
    mode: 'takeout',
    storeName: '静安寺旗舰店',
    address: '静安寺路 88 号 嘉里中心 2F 208室',
    items: [
      { dish: DISHES[0], quantity: 1 },
      { dish: DISHES[2], quantity: 1 }
    ],
    subtotal: 54,
    deliveryFee: 0,
    discount: 5,
    total: 49,
    status: 'delivering',
    statusText: '骑手配送中 (预计12:45送达)',
    estimatedTime: '约 15 分钟'
  },
  {
    id: 'ord_102',
    orderNo: '#20260820019',
    createdAt: '08-20 18:30',
    mode: 'pickup',
    storeName: '静安寺旗舰店',
    items: [
      { dish: DISHES[1], quantity: 1 }
    ],
    subtotal: 28,
    deliveryFee: 0,
    discount: 0,
    total: 28,
    status: 'completed',
    statusText: '已在门店取餐完成',
    estimatedTime: '已完成'
  }
];

export const BANNER_SLIDES = [
  {
    title: '双人健康轻体能量套餐',
    desc: '能量碗 + 沙拉 + 2杯0卡鲜果饮',
    tag: '特惠仅需 ¥48',
    color: 'from-[#C7F665] to-emerald-600',
    img: '/fresh_life_banner.png',
    isGraphicBanner: true
  },
  {
    title: '黑椒谷饲瘦牛肉轻食盒',
    desc: '精选原切好肉 · 减脂期蛋白质充能',
    tag: '新品 8 折特惠',
    color: 'from-emerald-600 to-teal-700',
    img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: '白灼深海鲜虾沙拉碗',
    desc: '低脂清甜脆爽 · 畅快无负担轻食季',
    tag: '限时首单立减 ¥8',
    color: 'from-amber-600 to-orange-700',
    img: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&w=800&q=80'
  }
];
