import { Dish } from '../types';

export interface IngredientMeta {
  bgImage: string;
  bgAlt: string;
  bgColor: string;
  topBadge1: { bold: string; text: string };
  topBadge2: { prefix: string; main: string };
  stampTop: string;
  stampBottom: string;
  subTraits: string[];
}

/**
 * Maps any dish and its specific ingredients to a matching clean solid/complementary studio backdrop photo
 * featuring a single hero raw ingredient (single halved avocado, single coconut half, single golden wheat ear, etc.)
 * with generous negative space for a luxury high-end commercial aesthetic.
 */
export function getDishIngredientMeta(dish: Dish): IngredientMeta {
  const name = dish.name || '';
  const desc = dish.description || '';
  const subtitle = dish.subtitle || '';
  const allText = `${name} ${desc} ${subtitle}`.toLowerCase();

  // 1. 牛油果 / Avocado (纯色补色纯净背景 + 单颗极简切开墨西哥哈斯牛油果，留白高级感)
  if (allText.includes('牛油果') || allText.includes('avocado')) {
    return {
      bgImage: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=1200&q=85',
      bgAlt: 'Single fresh organic Hass avocado on clean pastel complementary background with negative space',
      bgColor: '#203a1c',
      topBadge1: { bold: '好评榜', text: 'NO.1' },
      topBadge2: { prefix: '鲜食专属', main: '墨西哥哈斯牛油果' },
      stampTop: '鲜食',
      stampBottom: '首创',
      subTraits: ['墨西哥优质哈斯牛油果', '低温慢煮高蛋白', '每日鲜切现拌锁鲜']
    };
  }

  // 2. 生椰 / 椰乳 / 椰子 / Coconut (纯色极简静物台面 + 单只切开原只生椰子，高纯净度)
  if (allText.includes('椰') || allText.includes('coconut')) {
    return {
      bgImage: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=85',
      bgAlt: 'Single raw fresh halved coconut on clean solid studio background',
      bgColor: '#17361e',
      topBadge1: { bold: '人气推荐', text: 'NO.1' },
      topBadge2: { prefix: '鲜食专属', main: '印尼生椰岛直采' },
      stampTop: '鲜食',
      stampBottom: '首创',
      subTraits: ['专属生态生椰果园', '清爽甘甜', '1H冷榨锁鲜']
    };
  }

  // 3. 咖啡 / 燕麦拿铁 / 拿铁 / Coffee / Oat Milk (极简暖色纯净背景 + 单支新鲜咖啡豆/极简燕麦原粒)
  if (allText.includes('燕麦') || allText.includes('咖啡') || allText.includes('拿铁') || allText.includes('冷萃')) {
    return {
      bgImage: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=1200&q=85',
      bgAlt: 'Minimalist single raw coffee beans on clean solid complementary background',
      bgColor: '#2c1e14',
      topBadge1: { bold: '冷萃特调', text: 'TOP.1' },
      topBadge2: { prefix: '大师专属', main: 'OATLY咖啡大师燕麦' },
      stampTop: '冷萃',
      stampBottom: '慢萃',
      subTraits: ['18小时低温慢速冷萃', 'Oatly燕麦大师奶', '0蔗糖浓郁坚果尾韵']
    };
  }

  // 4. 南瓜 / 藜麦 / 谷物 / Pumpkin / Quinoa (极简纯色背景 + 单颗饱满有机贝贝小南瓜，留白通透)
  if (allText.includes('南瓜') || allText.includes('藜麦') || allText.includes('pumpkin')) {
    return {
      bgImage: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=1200&q=85',
      bgAlt: 'Single fresh organic baby pumpkin on solid minimalist complementary backdrop',
      bgColor: '#3d250d',
      topBadge1: { bold: '慢碳饱腹', text: 'NO.1' },
      topBadge2: { prefix: '高原直采', main: '现烤贝贝南瓜·三色藜麦' },
      stampTop: '轻食',
      stampBottom: '首创',
      subTraits: ['三色高原慢碳藜麦', '现烤贝贝小南瓜', '高膳食纤维加倍']
    };
  }

  // 5. 三明治 / 全麦吐司 / 金枪鱼 / Sandwich / Wheat (纯色亚麻静物背景 + 单支金黄天然全麦麦穗)
  if (allText.includes('三明治') || allText.includes('全麦') || allText.includes('吐司') || allText.includes('sandwich')) {
    return {
      bgImage: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=1200&q=85',
      bgAlt: 'Single golden wheat stalk on clean minimalist studio background',
      bgColor: '#332717',
      topBadge1: { bold: '随手轻食', text: 'TOP.1' },
      topBadge2: { prefix: '原粮烘焙', main: '100%全麦原粮吐司' },
      stampTop: '手工',
      stampBottom: '现制',
      subTraits: ['100%纯全麦吐司', '深海高蛋白金枪鱼', '双层饱满健康夹心']
    };
  }

  // 6. 牛肉 / 牛排 / 黑椒 / Beef (暗调极简纯色岩板背景 + 单支鲜采有机迷迭香草)
  if (allText.includes('牛') || allText.includes('beef') || allText.includes('黑椒')) {
    return {
      bgImage: 'https://images.unsplash.com/photo-1514944298352-7b2434a9463b?auto=format&fit=crop&w=1200&q=85',
      bgAlt: 'Single fresh rosemary sprig on clean minimalist slate background',
      bgColor: '#241712',
      topBadge1: { bold: '燃脂增肌', text: 'NO.1' },
      topBadge2: { prefix: '原切直供', main: '澳洲谷饲精选牛肉' },
      stampTop: '原切',
      stampBottom: '直供',
      subTraits: ['澳洲谷饲原切牛霖肉', '现磨香浓黑胡椒', '低温炙烤鲜嫩锁汁']
    };
  }

  // 7. 虾 / 彩椒 / 海鲜 / Shrimp (清爽纯色纯净底色 + 单只鲜活厄瓜多尔白虾原料)
  if (allText.includes('虾') || allText.includes('shrimp') || allText.includes('海鲜') || allText.includes('彩椒')) {
    return {
      bgImage: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=1200&q=85',
      bgAlt: 'Single fresh raw king prawn on clean complementary studio surface',
      bgColor: '#142a33',
      topBadge1: { bold: '高钙低脂', text: 'NO.1' },
      topBadge2: { prefix: '深海鲜捞', main: '厄瓜多尔白虾·三色甜椒' },
      stampTop: '深海',
      stampBottom: '鲜捞',
      subTraits: ['厄瓜多尔白虾现剥现灼', '鲜脆三色甜椒粒', '香草白葡萄酒汁']
    };
  }

  // 8. 暖锅 / 香菇 / 菌菇 / Hotpot / Mushroom (纯色深木色背景 + 单颗鲜摘原木野生花菇)
  if (allText.includes('暖锅') || allText.includes('香菇') || allText.includes('蘑菇') || dish.category === 'hot') {
    return {
      bgImage: 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?auto=format&fit=crop&w=1200&q=85',
      bgAlt: 'Single fresh organic shiitake mushroom on clean minimalist complementary surface',
      bgColor: '#272216',
      topBadge1: { bold: '暖心暖胃', text: 'NO.1' },
      topBadge2: { prefix: '鲜菇现炖', main: '原木花菇·昆布慢熬' },
      stampTop: '暖心',
      stampBottom: '现炖',
      subTraits: ['原木鲜采优质香菇', '去皮鲜嫩多汁鸡腿肉', '日式昆布高汤慢炖']
    };
  }

  // 9. 酸奶 / 蓝莓 / 浆果 / Yogurt / Berry (纯净极简纯色背景 + 单株高山新鲜野生蓝莓带叶原料)
  if (allText.includes('酸奶') || allText.includes('蓝莓') || allText.includes('yogurt') || allText.includes('berry')) {
    return {
      bgImage: 'https://images.unsplash.com/photo-1563746098251-d35aef196e83?auto=format&fit=crop&w=1200&q=85',
      bgAlt: 'Single fresh blueberry sprig with leaf on clean minimalist complementary background',
      bgColor: '#161c2d',
      topBadge1: { bold: '高蛋白甜点', text: 'NO.1' },
      topBadge2: { prefix: '高山鲜摘', main: '野生蓝莓·纯正希腊酸奶' },
      stampTop: '纯正',
      stampBottom: '希腊',
      subTraits: ['传统滤乳清浓醇质地', '高山新鲜野生蓝莓', '低温轻烤坚果碎']
    };
  }

  // 10. Default Salad/Bowl (清新纯净纯色底 + 单片带露有机水培脆生菜叶，极简高级)
  if (dish.category === 'salad' || dish.category === 'bowl') {
    return {
      bgImage: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=1200&q=85',
      bgAlt: 'Single fresh crisp organic lettuce leaf on minimalist complementary solid background',
      bgColor: '#1d3417',
      topBadge1: { bold: '主厨推荐', text: 'TOP.1' },
      topBadge2: { prefix: '农场直采', main: '有机罗马生菜·特调轻酱' },
      stampTop: '鲜食',
      stampBottom: '首创',
      subTraits: ['有机认证无公害蔬菜', '优质高蛋白搭配', '每日现拌特调油醋汁']
    };
  }

  // 11. General Drink Fallback
  if (dish.category === 'drink') {
    return {
      bgImage: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=85',
      bgAlt: 'Single fresh raw ingredient on clean complementary studio background',
      bgColor: '#17361e',
      topBadge1: { bold: '低卡鲜饮', text: 'NO.1' },
      topBadge2: { prefix: '现调锁鲜', main: '0卡糖轻盈配方' },
      stampTop: '鲜食',
      stampBottom: '首创',
      subTraits: ['0蔗糖低卡轻负担', '现调制锁鲜出杯', '清爽甘甜回味无穷']
    };
  }

  // 12. General Fallback
  return {
    bgImage: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=1200&q=85',
    bgAlt: 'Single fresh raw ingredient on minimalist complementary studio background',
    bgColor: '#203a1c',
    topBadge1: { bold: '品质严选', text: 'NO.1' },
    topBadge2: { prefix: '源头直采', main: '高品质健康轻食' },
    stampTop: '鲜食',
    stampBottom: '优选',
    subTraits: ['甄选优质原料', '健康控卡配比', '现做现出保障']
  };
}
