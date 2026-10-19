import React from 'react';
import * as LucidePackage from 'lucide-react';
import lucideList from './lucide-icons.json';
import { FlameIcon, CategoryIcon } from '../components/CategoryIcons';
import { CheckIcon, CheckBadge } from '../components/CheckBadge';
import { HandshakeStitchIcon } from '../components/HandshakeStitchIcon';
import { RedPacketFuIcon } from '../components/RedPacketFuIcon';
import { PickupStoreIcon } from '../components/PickupStoreIcon';
import { DeliveryScooterIcon } from '../components/DeliveryScooterIcon';

const Lucide = LucidePackage as unknown as Record<
  string,
  React.ComponentType<{ size?: number; strokeWidth?: number; color?: string; absoluteStrokeWidth?: boolean }>
>;

const lucideNames = (lucideList as { name: string; files: string[] }[]).map((i) => i.name);

type CustomIcon = { name: string; sub: string; node: React.ReactNode };

const customIcons: CustomIcon[] = [
  { name: 'FlameIcon', sub: '全部热卖', node: <FlameIcon className="cat-svg" strokeWidth={1.7} /> },
  { name: 'CategoryIcon', sub: '清爽沙拉', node: <CategoryIcon id="salad" className="cat-svg" /> },
  { name: 'CategoryIcon', sub: '主食能量碗', node: <CategoryIcon id="bowl" className="cat-svg" /> },
  { name: 'CategoryIcon', sub: '暖心轻食', node: <CategoryIcon id="hot" className="cat-svg" /> },
  { name: 'CategoryIcon', sub: '低卡鲜饮', node: <CategoryIcon id="drink" className="cat-svg" /> },
  { name: 'CategoryIcon', sub: '蛋白小食', node: <CategoryIcon id="snack" className="cat-svg" /> },
  { name: 'CheckIcon', sub: '对勾', node: <CheckIcon className="cat-svg" /> },
  { name: 'CheckBadge', sub: '选中徽章', node: <CheckBadge selected className="badge-demo" /> },
  { name: 'HandshakeStitchIcon', sub: '握手缝线', node: <HandshakeStitchIcon className="art-full" /> },
  { name: 'RedPacketFuIcon', sub: '红包福字', node: <RedPacketFuIcon className="art-full" /> },
  { name: 'PickupStoreIcon', sub: '到店自取', node: <PickupStoreIcon className="art-full" /> },
  { name: 'DeliveryScooterIcon', sub: '外送配送', node: <DeliveryScooterIcon className="art-full" /> },
];

const assets: { name: string; src: string }[] = [
  { name: '外送下单', src: '/entry-takeout.jpg' },
  { name: '到店自取', src: '/entry-pickup.jpg' },
  { name: '会员福利', src: '/entry-benefit.jpg' },
  { name: '今日抽卡', src: '/entry-gacha.jpg' },
  { name: '安格斯牛排', src: '/ingredients/ing_steak.png' },
  { name: '黑虎虾串', src: '/ingredients/ing_prawn.png' },
  { name: '黑椒鸡胸肉', src: '/ingredients/ing_chicken.png' },
  { name: '高纤嫩豆腐', src: '/ingredients/ing_tofu.png' },
  { name: '溏心水波蛋', src: '/ingredients/ing_egg.png' },
  { name: '藜麦糙米饭', src: '/ingredients/ing_quinoa.png' },
  { name: '羽衣甘蓝', src: '/ingredients/ing_kale.png' },
  { name: '多汁圣女果', src: '/ingredients/ing_tomato.png' },
  { name: '高纤西兰花', src: '/ingredients/ing_broccoli.png' },
  { name: '日式毛豆仁', src: '/ingredients/ing_edamame.png' },
];

export const IconSheet: React.FC = () => {
  const total = lucideNames.length + customIcons.length + assets.length;

  return (
    <div className="sheet">
      <header className="hd">
        <div className="brand">
          <span className="mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="#0b1f17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 3v8a3 3 0 0 0 6 0V3" />
              <path d="M10 11v10" />
              <path d="M17 3c1.6 1.4 2.4 3.1 2.4 5.2 0 1.7-.8 2.8-2.4 3.3V21" />
            </svg>
          </span>
          <span className="brand-txt">
            <span className="brand-name">GreenBite 轻食</span>
            <span className="brand-sub">Design System · Icons</span>
          </span>
        </div>
        <div className="hd-right">
          <span className="chip"><span className="dot lime" />品牌自绘 <b>{customIcons.length}</b></span>
          <span className="chip"><span className="dot" />线性图标 <b>{lucideNames.length}</b></span>
          <span className="chip"><span className="dot blue" />图片素材 <b>{assets.length}</b></span>
        </div>
      </header>

      <div className="title-wrap">
        <h1>
          图标资产 <em>总览</em>
        </h1>
        <p className="lede">
          从项目源码扫描汇总：lucide-react 线性图标取自各组件实际引用，自绘图标来自
          <code> src/components </code> 下的图标组件，图片素材取自 <code>public/</code>。共 {total} 枚。
        </p>
      </div>

      <section className="sec">
        <div className="sec-head">
          <span className="idx">01</span>
          <span className="sec-title">品牌自绘图标</span>
          <span className="sec-count">{customIcons.length}</span>
          <span className="sec-desc">分类导航 / 状态徽章 / 插画图标</span>
        </div>
        <div className="grid custom">
          {customIcons.map((icon, i) => (
            <div className="cell" key={`${icon.name}-${i}`}>
              <div className="art">{icon.node}</div>
              <div className="nm">{icon.name}</div>
              <div className="sub">{icon.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="sec">
        <div className="sec-head">
          <span className="idx">02</span>
          <span className="sec-title">线性图标（lucide-react）</span>
          <span className="sec-count">{lucideNames.length}</span>
          <span className="sec-desc">1.6px 描边 · currentColor</span>
        </div>
        <div className="grid lucide">
          {lucideNames.map((name) => {
            const Icon = Lucide[name];
            if (!Icon) return null;
            return (
              <div className="cell" key={name}>
                <div className="art">
                  <Icon size={40} strokeWidth={1.6} color="#132a21" />
                </div>
                <div className="nm">{name}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="sec">
        <div className="sec-head">
          <span className="idx">03</span>
          <span className="sec-title">图片素材图标</span>
          <span className="sec-count">{assets.length}</span>
          <span className="sec-desc">首页四大入口 / 抽卡食材</span>
        </div>
        <div className="grid assets">
          {assets.map((asset) => (
            <div className="cell" key={asset.src}>
              <div className="art">
                <img src={asset.src} alt={asset.name} />
              </div>
              <div className="nm">{asset.name}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="foot">
        <span>
          扫描范围 <code>src/components/*.tsx</code> · <code>public/</code> · 生成于 2026-10-19
        </span>
        <span>
          GreenBite 轻食 · 图标规范 <code>stroke 1.6 / 圆角端点 / 24×24 网格</code>
        </span>
      </footer>
    </div>
  );
};
