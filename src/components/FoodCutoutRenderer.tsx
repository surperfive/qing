import React from 'react';
import { Dish } from '../types';

interface FoodCutoutRendererProps {
  dish: Dish;
  size: 'regular' | 'large';
  temperature: 'ice' | 'hot';
  beanBase: 'blend' | 'dark' | 'special';
  className?: string;
}

export const FoodCutoutRenderer: React.FC<FoodCutoutRendererProps> = ({
  dish,
  size,
  temperature,
  beanBase,
  className = ''
}) => {
  const isLarge = size === 'large';
  const isHot = temperature === 'hot';
  const name = (dish.name || '').toLowerCase();
  const cat = dish.category;

  // 1. DRINKS (Coffee, Raw Coconut Latte, Shake) - Compact refined size
  if (cat === 'drink') {
    if (isHot) {
      // Hot Paper Cup
      return (
        <div className={`relative flex items-center justify-center filter drop-shadow-[0_8px_14px_rgba(0,0,0,0.35)] select-none ${className}`}>
          <svg
            viewBox="0 0 160 250"
            className={`w-auto transition-all duration-300 ${isLarge ? 'h-[128px]' : 'h-[116px]'}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="hotCupGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#001878" />
                <stop offset="25%" stopColor="#0022AB" />
                <stop offset="70%" stopColor="#002DDE" />
                <stop offset="100%" stopColor="#00166E" />
              </linearGradient>
              <linearGradient id="lidGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E2E8F0" />
                <stop offset="50%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#CBD5E1" />
              </linearGradient>
              <linearGradient id="sleeveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#D97706" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
            </defs>

            {/* Lid */}
            <path d="M 46 22 C 46 16 114 16 114 22 L 122 32 L 38 32 Z" fill="url(#lidGrad)" stroke="#0D1F2D" strokeWidth="2.5" />
            <ellipse cx="80" cy="20" rx="9" ry="3" fill="#64748B" />
            <rect x="74" y="19" width="12" height="2" rx="1" fill="#334155" />
            <rect x="32" y="32" width="96" height="9" rx="4.5" fill="url(#lidGrad)" stroke="#0D1F2D" strokeWidth="2.5" />

            {/* Cup Body */}
            <path d="M 38 41 L 49 224 C 50 230 110 230 111 224 L 122 41 Z" fill="url(#hotCupGrad)" stroke="#0D1F2D" strokeWidth="3" />
            <path d="M 44 45 L 53 218 L 58 218 L 49 45 Z" fill="#FFFFFF" opacity="0.22" />

            {/* Sleeve */}
            <path d="M 41 95 L 45 165 C 56 168 104 168 115 165 L 119 95 C 104 98 56 98 41 95 Z" fill="url(#sleeveGrad)" stroke="#0D1F2D" strokeWidth="2.5" />
            <g transform="translate(64, 112) scale(0.65)">
              <path d="M 12 0 C 14 6 18 10 24 12 C 18 14 14 18 12 24 C 10 18 6 14 0 12 C 6 10 10 6 12 0 Z" fill="#FFFFFF" />
              <path d="M 22 8 C 26 5 32 6 36 10 C 34 16 28 20 22 18 Z" fill="#FFFFFF" opacity="0.9" />
            </g>
            <text x="80" y="152" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="900" letterSpacing="1">
              LUCKIN COFFEE
            </text>

            {/* Steam */}
            <path d="M 68 14 C 64 8 72 4 68 0" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
            <path d="M 80 12 C 76 6 84 3 80 -1" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.95" />
            <path d="M 92 14 C 88 8 96 4 92 0" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
          </svg>
        </div>
      );
    }

    // Iced Drink (Cold Brew / Coconut Latte / Kale Shake)
    const isGreenShake = name.includes('羽衣甘蓝') || name.includes('果昔') || name.includes('酸奶昔');
    const coffeeColorTop = isGreenShake
      ? '#2E7D32'
      : beanBase === 'dark'
      ? '#3A1E11'
      : beanBase === 'special'
      ? '#7C3F18'
      : '#542E18';

    const coffeeColorMid = isGreenShake
      ? '#4CAF50'
      : beanBase === 'dark'
      ? '#5E341C'
      : beanBase === 'special'
      ? '#A25927'
      : '#7A4322';

    return (
      <div className={`relative flex items-center justify-center filter drop-shadow-[0_8px_14px_rgba(0,0,0,0.35)] select-none ${className}`}>
        <svg
          viewBox="0 0 160 250"
          className={`w-auto transition-all duration-300 ${isLarge ? 'h-[132px]' : 'h-[120px]'}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="clearLidGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#E2E8F0" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.7" />
            </linearGradient>

            <linearGradient id="icedDrinkLayers" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={coffeeColorTop} />
              <stop offset="38%" stopColor={coffeeColorMid} />
              <stop offset="54%" stopColor={isGreenShake ? '#81C784' : '#D8A06B'} />
              <stop offset="68%" stopColor={isGreenShake ? '#C8E6C9' : '#F5E4D0'} />
              <stop offset="85%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F0F9FF" />
            </linearGradient>

            <linearGradient id="plasticGloss" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
              <stop offset="15%" stopColor="#FFFFFF" stopOpacity="0.1" />
              <stop offset="85%" stopColor="#FFFFFF" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.3" />
            </linearGradient>

            <linearGradient id="iceCubeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="50%" stopColor={isGreenShake ? '#81C784' : '#F59E0B'} stopOpacity="0.6" />
              <stop offset="100%" stopColor={isGreenShake ? '#2E7D32' : '#78350F'} stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Lid Rim */}
          <rect x="34" y="26" width="92" height="8" rx="4" fill="url(#clearLidGrad)" stroke="#0D1F2D" strokeWidth="2.5" />
          <ellipse cx="80" cy="27" rx="7" ry="2.5" fill="#0D1F2D" opacity="0.4" />
          <path d="M 77 12 L 83 12 L 81 27 L 79 27 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="1" />

          {/* Cup Body */}
          <path d="M 40 34 L 50 220 C 51 227 109 227 110 220 L 120 34 Z" fill="url(#icedDrinkLayers)" stroke="#0D1F2D" strokeWidth="3.2" />

          {/* Floating Ice Cubes */}
          <rect x="64" y="38" width="28" height="22" rx="5" fill="url(#iceCubeGrad)" stroke="#FFFFFF" strokeWidth="1.5" transform="rotate(-8 78 49)" opacity="0.95" />
          <rect x="44" y="42" width="22" height="18" rx="4" fill="url(#iceCubeGrad)" stroke="#FFFFFF" strokeWidth="1.2" transform="rotate(12 55 51)" opacity="0.88" />
          <rect x="92" y="40" width="22" height="20" rx="4" fill="url(#iceCubeGrad)" stroke="#FFFFFF" strokeWidth="1.2" transform="rotate(-15 103 50)" opacity="0.9" />

          {/* Swirling Coconut Milk Waves */}
          <path d="M 43 120 C 60 140 75 110 95 130 C 108 142 114 135 117 128" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity="0.75" fill="none" />
          <path d="M 46 142 C 65 155 85 135 105 150 C 112 155 115 150 115 146" stroke="#FDE68A" strokeWidth="3.5" strokeLinecap="round" opacity="0.6" fill="none" />

          {/* Luckin Deer Logo */}
          <g transform="translate(61, 108) scale(0.78)">
            <circle cx="24" cy="24" r="22" fill="#FFFFFF" opacity="0.15" />
            <path d="M 16 12 C 18 10 24 9 28 14 C 29 15 32 14 34 11 C 36 14 36 18 34 22 C 30 29 25 31 20 33 C 18 34 16 33 16 30 C 16 26 21 24 23 20 C 24 18 22 16 20 16 C 18 16 15 18 14 20 L 12 17 C 13 14 14 13 16 12 Z" fill="#FFFFFF" />
            <path d="M 28 13 C 30 8 35 6 38 6 C 36 9 37 11 35 13 C 34 11 31 11 29 13 Z" fill="#FFFFFF" />
            <text x="24" y="44" textAnchor="middle" fill="#FFFFFF" fontSize="6" fontWeight="900" letterSpacing="0.8">
              luckin coffee
            </text>
          </g>

          {/* Droplets & Specular Gloss */}
          <circle cx="48" cy="80" r="1.8" fill="#FFFFFF" opacity="0.8" />
          <circle cx="112" cy="95" r="1.8" fill="#FFFFFF" opacity="0.8" />
          <circle cx="52" cy="170" r="1.8" fill="#FFFFFF" opacity="0.8" />
          <path d="M 44 38 L 52 216 L 57 216 L 49 38 Z" fill="url(#plasticGloss)" />
          <ellipse cx="80" cy="219" rx="29" ry="3.5" fill="#E0F2FE" opacity="0.8" stroke="#0D1F2D" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }

  // 2. WHOLE WHEAT SANDWICH (全麦三明治)
  if (name.includes('三明治') || name.includes('sandwich')) {
    return (
      <div className={`relative flex items-center justify-center filter drop-shadow-[0_8px_14px_rgba(0,0,0,0.35)] select-none ${className}`}>
        <svg
          viewBox="0 0 220 170"
          className={`w-auto transition-all duration-300 ${isLarge ? 'h-[115px]' : 'h-[102px]'}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Top Bread Slice (Whole Wheat Brown) */}
          <path d="M 30 50 L 190 25 C 196 24 200 28 198 34 L 175 90 C 172 96 166 98 160 97 L 22 66 C 16 64 16 56 22 53 Z" fill="#C4884B" stroke="#0D1F2D" strokeWidth="3.5" />
          <path d="M 38 52 L 184 29 L 168 86 L 28 64 Z" fill="#DFB17B" />
          {/* Grain Seeds on Bread */}
          <circle cx="65" cy="56" r="1.5" fill="#6B4226" />
          <circle cx="95" cy="48" r="1.5" fill="#6B4226" />
          <circle cx="135" cy="42" r="1.5" fill="#6B4226" />

          {/* Crispy Green Lettuce layer */}
          <path d="M 20 70 Q 50 60 80 72 Q 110 58 140 70 Q 170 60 195 72 L 178 88 Q 140 76 110 86 Q 70 76 25 86 Z" fill="#4CAF50" stroke="#0D1F2D" strokeWidth="2.5" />
          <path d="M 24 74 Q 60 66 100 76 Q 140 68 185 76" stroke="#81C784" strokeWidth="2" strokeLinecap="round" />

          {/* Tuna / Salmon Protein Filling */}
          <path d="M 28 85 L 172 85 L 164 105 L 34 105 Z" fill="#E57373" stroke="#0D1F2D" strokeWidth="2.5" />
          <path d="M 40 92 L 160 92" stroke="#FFCDD2" strokeWidth="3" strokeDasharray="6 4" />

          {/* Boiled Egg Slices */}
          <ellipse cx="75" cy="95" rx="14" ry="8" fill="#FFFFFF" stroke="#0D1F2D" strokeWidth="2" />
          <circle cx="75" cy="95" r="5" fill="#FFC107" />
          <ellipse cx="125" cy="95" rx="14" ry="8" fill="#FFFFFF" stroke="#0D1F2D" strokeWidth="2" />
          <circle cx="125" cy="95" r="5" fill="#FFC107" />

          {/* Sliced Pickles / Cucumbers */}
          <ellipse cx="100" cy="104" rx="12" ry="5" fill="#8BC34A" stroke="#0D1F2D" strokeWidth="1.5" />

          {/* Bottom Bread Slice */}
          <path d="M 34 105 L 164 105 C 170 105 174 110 170 116 L 150 148 C 146 154 138 156 132 154 L 38 126 C 32 124 30 116 34 110 Z" fill="#C4884B" stroke="#0D1F2D" strokeWidth="3.5" />
          <path d="M 42 110 L 156 110 L 142 144 L 44 122 Z" fill="#DFB17B" />
        </svg>
      </div>
    );
  }

  // 3. GREEK YOGURT CUP WITH BLUEBERRIES (希腊酸奶杯)
  if (name.includes('酸奶') || name.includes('yogurt')) {
    return (
      <div className={`relative flex items-center justify-center filter drop-shadow-[0_8px_14px_rgba(0,0,0,0.35)] select-none ${className}`}>
        <svg
          viewBox="0 0 170 210"
          className={`w-auto transition-all duration-300 ${isLarge ? 'h-[120px]' : 'h-[108px]'}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Glass Cup Body */}
          <path d="M 35 48 L 50 185 C 52 192 118 192 120 185 L 135 48 Z" fill="#F8FAFC" stroke="#0D1F2D" strokeWidth="3" />
          <path d="M 40 54 L 52 180 C 54 186 116 186 118 180 L 130 54 Z" fill="#FFFFFF" />

          {/* Blueberry Purée Swirl at Bottom */}
          <path d="M 48 140 C 70 160 95 135 122 155 L 118 182 C 100 188 65 188 52 182 Z" fill="#6B21A8" stroke="#0D1F2D" strokeWidth="2" />
          <path d="M 52 155 C 75 168 95 152 116 166" stroke="#9333EA" strokeWidth="3" strokeLinecap="round" />

          {/* Thick Whipped Greek Yogurt Peak */}
          <path d="M 32 50 C 35 25 70 18 85 24 C 100 15 135 24 138 50 Z" fill="#FFFFFF" stroke="#0D1F2D" strokeWidth="3" />
          <path d="M 45 42 C 60 28 80 34 85 45 C 95 30 115 32 125 44" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />

          {/* Fresh Wild Blueberries on Top */}
          <circle cx="65" cy="32" r="9" fill="#3B0764" stroke="#0D1F2D" strokeWidth="2" />
          <circle cx="63" cy="30" r="2.5" fill="#A855F7" />
          <circle cx="88" cy="22" r="10" fill="#2E1065" stroke="#0D1F2D" strokeWidth="2" />
          <circle cx="86" cy="20" r="2.5" fill="#A855F7" />
          <circle cx="108" cy="32" r="9" fill="#3B0764" stroke="#0D1F2D" strokeWidth="2" />
          <circle cx="106" cy="30" r="2.5" fill="#A855F7" />

          {/* Crunchy Granola & Almond Flakes */}
          <ellipse cx="50" cy="48" rx="6" ry="3" fill="#D97706" stroke="#0D1F2D" strokeWidth="1.2" transform="rotate(20 50 48)" />
          <ellipse cx="120" cy="48" rx="6" ry="3" fill="#D97706" stroke="#0D1F2D" strokeWidth="1.2" transform="rotate(-20 120 48)" />
          <ellipse cx="85" cy="48" rx="5" ry="2.5" fill="#F59E0B" stroke="#0D1F2D" strokeWidth="1.2" />

          {/* Mint Leaf Sprig */}
          <path d="M 85 14 C 78 5 88 0 94 6 C 100 12 92 16 85 14 Z" fill="#22C55E" stroke="#0D1F2D" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }

  // 4. TERIYAKI MUSHROOM CHICKEN WARM HOTPOT (暖锅轻食)
  if (cat === 'hot' || name.includes('暖锅') || name.includes('香菇')) {
    return (
      <div className={`relative flex items-center justify-center filter drop-shadow-[0_8px_14px_rgba(0,0,0,0.35)] select-none ${className}`}>
        <svg
          viewBox="0 0 240 180"
          className={`w-auto transition-all duration-300 ${isLarge ? 'h-[115px]' : 'h-[102px]'}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Iron Cast Earthen Skillet Body */}
          <path d="M 26 72 C 30 148 210 148 214 72 Z" fill="#292524" stroke="#0D1F2D" strokeWidth="4" />
          <ellipse cx="120" cy="72" rx="94" ry="32" fill="#44403C" stroke="#0D1F2D" strokeWidth="4" />

          {/* Simmering Teriyaki Broth */}
          <ellipse cx="120" cy="74" rx="86" ry="28" fill="#78350F" />

          {/* Shiitake Mushrooms with Cross Cuts */}
          <g transform="translate(65, 50)">
            <ellipse cx="22" cy="18" rx="18" ry="14" fill="#451A03" stroke="#0D1F2D" strokeWidth="2.5" />
            <path d="M 10 18 L 34 18 M 22 8 L 22 28" stroke="#FDE68A" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          <g transform="translate(135, 52)">
            <ellipse cx="20" cy="16" rx="16" ry="12" fill="#451A03" stroke="#0D1F2D" strokeWidth="2.5" />
            <path d="M 10 16 L 30 16 M 20 8 L 20 24" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Tender Braised Chicken Thigh Bites */}
          <rect x="92" y="66" width="26" height="20" rx="6" fill="#D97706" stroke="#0D1F2D" strokeWidth="2" />
          <rect x="118" y="72" width="24" height="18" rx="6" fill="#B45309" stroke="#0D1F2D" strokeWidth="2" />

          {/* Konjac Knots & Fresh Scallions */}
          <ellipse cx="55" cy="80" rx="12" ry="7" fill="#F5F5F4" stroke="#0D1F2D" strokeWidth="2" />
          <line x1="75" y1="88" x2="95" y2="84" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" />
          <line x1="140" y1="88" x2="160" y2="82" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" />

          {/* Steam Heat Waves */}
          <path d="M 90 40 C 85 28 95 20 90 12" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
          <path d="M 120 36 C 115 22 125 14 120 6" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
          <path d="M 150 40 C 145 28 155 20 150 12" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        </svg>
      </div>
    );
  }

  // 5. BEEF / STEAK BOX (黑椒牛肉盒)
  if (name.includes('牛') || name.includes('beef')) {
    return (
      <div className={`relative flex items-center justify-center filter drop-shadow-[0_8px_14px_rgba(0,0,0,0.35)] select-none ${className}`}>
        <svg
          viewBox="0 0 240 180"
          className={`w-auto transition-all duration-300 ${isLarge ? 'h-[115px]' : 'h-[102px]'}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Bento Bowl / Plate */}
          <path d="M 24 72 C 30 148 210 148 216 72 Z" fill="#1E293B" stroke="#0D1F2D" strokeWidth="4" />
          <ellipse cx="120" cy="72" rx="96" ry="32" fill="#334155" stroke="#0D1F2D" strokeWidth="4" />
          <ellipse cx="120" cy="74" rx="88" ry="28" fill="#1E1B4B" />

          {/* Purple Sweet Potato Mash (Left) */}
          <ellipse cx="68" cy="78" rx="28" ry="18" fill="#7E22CE" stroke="#0D1F2D" strokeWidth="2.5" />
          <ellipse cx="68" cy="76" rx="20" ry="12" fill="#A855F7" />

          {/* Fresh Broccoli Florets (Back Right) */}
          <circle cx="150" cy="62" r="14" fill="#15803D" stroke="#0D1F2D" strokeWidth="2" />
          <circle cx="168" cy="66" r="12" fill="#16A34A" stroke="#0D1F2D" strokeWidth="2" />
          <circle cx="138" cy="70" r="10" fill="#22C55E" stroke="#0D1F2D" strokeWidth="2" />

          {/* Sizzling Grilled Beef Cubes with Sear Marks (Center Front) */}
          <g transform="translate(90, 56)">
            <rect x="0" y="8" width="26" height="22" rx="5" fill="#7F1D1D" stroke="#0D1F2D" strokeWidth="2.5" />
            <line x1="4" y1="14" x2="22" y2="14" stroke="#450A0A" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="4" y1="22" x2="22" y2="22" stroke="#450A0A" strokeWidth="2.5" strokeLinecap="round" />

            <rect x="24" y="16" width="28" height="22" rx="5" fill="#991B1B" stroke="#0D1F2D" strokeWidth="2.5" />
            <line x1="28" y1="22" x2="48" y2="22" stroke="#450A0A" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="28" y1="30" x2="48" y2="30" stroke="#450A0A" strokeWidth="2.5" strokeLinecap="round" />

            <rect x="12" y="0" width="24" height="20" rx="5" fill="#B91C1C" stroke="#0D1F2D" strokeWidth="2.5" />
            <line x1="16" y1="6" x2="32" y2="6" stroke="#450A0A" strokeWidth="2.5" strokeLinecap="round" />
          </g>

          {/* Black Peppercorn Specks on Beef */}
          <circle cx="102" cy="72" r="1.2" fill="#000" />
          <circle cx="108" cy="70" r="1.2" fill="#000" />
          <circle cx="120" cy="80" r="1.2" fill="#000" />
          <circle cx="128" cy="78" r="1.2" fill="#000" />

          {/* Cherry Tomato Half */}
          <circle cx="112" cy="90" r="9" fill="#EF4444" stroke="#0D1F2D" strokeWidth="2" />
          <circle cx="112" cy="90" r="5" fill="#F87171" />
        </svg>
      </div>
    );
  }

  // 6. DEFAULT HEALTHY SALAD & GRAIN BOWL (Avocado Chicken / Shrimp / Pumpkin Bowl)
  return (
    <div className={`relative flex items-center justify-center filter drop-shadow-[0_8px_14px_rgba(0,0,0,0.35)] select-none ${className}`}>
      <svg
        viewBox="0 0 240 180"
        className={`w-auto transition-all duration-300 ${isLarge ? 'h-[115px]' : 'h-[102px]'}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="saladBowlGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="60%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
          <linearGradient id="saladGrainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={beanBase === 'dark' ? '#2A1F1D' : '#8D6E63'} />
            <stop offset="100%" stopColor={beanBase === 'dark' ? '#1A1412' : '#5D4037'} />
          </linearGradient>
        </defs>

        {/* Ceramic Salad Bowl */}
        <path d="M 24 72 C 30 148 210 148 216 72 Z" fill="url(#saladBowlGrad)" stroke="#0D1F2D" strokeWidth="4" />
        <ellipse cx="120" cy="72" rx="96" ry="32" fill="#CBD5E1" stroke="#0D1F2D" strokeWidth="4" />
        <ellipse cx="120" cy="74" rx="88" ry="28" fill="url(#saladGrainGrad)" />

        {/* Fresh Salad Leaves */}
        <path d="M 36 65 C 28 50 48 40 62 48 C 76 56 60 75 42 72 Z" fill="#4CAF50" stroke="#0D1F2D" strokeWidth="2.5" />
        <path d="M 50 48 C 65 32 88 42 85 58 C 82 72 65 65 50 48 Z" fill="#66BB6A" stroke="#0D1F2D" strokeWidth="2.5" />
        <path d="M 68 62 C 78 52 92 56 88 70" stroke="#8E24AA" strokeWidth="3.5" strokeLinecap="round" />

        {/* Avocado Slices (Left) */}
        <g transform="translate(68, 52)">
          <path d="M 12 0 C 22 2 28 14 26 24 C 18 26 8 20 6 12 C 4 6 8 0 12 0 Z" fill="#8BC34A" stroke="#0D1F2D" strokeWidth="2" />
          <ellipse cx="16" cy="12" rx="4" ry="7" fill="#DCEDC8" />
          <path d="M 24 2 C 34 4 40 16 38 26 C 30 28 20 22 18 14 C 16 8 20 2 24 2 Z" fill="#7CB342" stroke="#0D1F2D" strokeWidth="2" />
          <ellipse cx="28" cy="14" rx="4" ry="7" fill="#DCEDC8" />
          <path d="M 36 6 C 46 8 52 20 50 30 C 42 32 32 26 30 18 C 28 12 32 6 36 6 Z" fill="#689F38" stroke="#0D1F2D" strokeWidth="2" />
          <ellipse cx="40" cy="18" rx="4" ry="7" fill="#DCEDC8" />
        </g>

        {/* Roasted Chicken Breast / Salmon Cubes (Right) */}
        <g transform="translate(130, 48)">
          <rect x="4" y="8" width="22" height="18" rx="4" fill="#FF8A65" stroke="#0D1F2D" strokeWidth="2.2" />
          <line x1="8" y1="12" x2="22" y2="12" stroke="#BF360C" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="8" y1="18" x2="22" y2="18" stroke="#BF360C" strokeWidth="1.8" strokeLinecap="round" />

          <rect x="24" y="14" width="24" height="18" rx="4" fill="#FF7043" stroke="#0D1F2D" strokeWidth="2.2" />
          <line x1="28" y1="18" x2="44" y2="18" stroke="#BF360C" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="28" y1="24" x2="44" y2="24" stroke="#BF360C" strokeWidth="1.8" strokeLinecap="round" />

          <rect x="14" y="0" width="20" height="16" rx="4" fill="#FFA726" stroke="#0D1F2D" strokeWidth="2" />
        </g>

        {/* Soft-Boiled Poached Egg (Center) */}
        <ellipse cx="120" cy="78" rx="18" ry="14" fill="#FFFFFF" stroke="#0D1F2D" strokeWidth="2.5" />
        <circle cx="120" cy="78" r="9" fill="#FFB300" stroke="#FF8F00" strokeWidth="1.5" />
        <circle cx="117" cy="75" r="2.5" fill="#FFF8E1" />

        {/* Cherry Tomatoes & Edamame */}
        <circle cx="98" cy="88" r="8" fill="#E53935" stroke="#0D1F2D" strokeWidth="2" />
        <circle cx="98" cy="88" r="5" fill="#EF5350" />
        <circle cx="152" cy="82" r="7.5" fill="#E53935" stroke="#0D1F2D" strokeWidth="2" />
        <circle cx="152" cy="82" r="4.5" fill="#EF5350" />
        <ellipse cx="78" cy="82" rx="4" ry="2.5" fill="#7CB342" stroke="#0D1F2D" strokeWidth="1.2" transform="rotate(-20 78 82)" />
        <ellipse cx="140" cy="88" rx="4" ry="2.5" fill="#7CB342" stroke="#0D1F2D" strokeWidth="1.2" transform="rotate(30 140 88)" />

        {/* Herb Sprig */}
        <path d="M 120 62 C 114 55 120 48 126 52 C 132 56 126 62 120 62 Z" fill="#43A047" stroke="#0D1F2D" strokeWidth="1.5" />
      </svg>
    </div>
  );
};
