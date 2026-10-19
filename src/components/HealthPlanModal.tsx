import React, { useState } from 'react';
import { X, Target, CheckCircle2, Info } from 'lucide-react';
import { CheckBadge } from './CheckBadge';
import { OPTION_CARD_SELECTED, OPTION_CARD_UNSELECTED } from '../tokens';

interface HealthPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

type HealthGoal = 'balanced' | 'fatloss' | 'muscle' | 'lowcarb';
type TasteIntensity = 'light' | 'balanced' | 'rich';
type SpiceLevel = 'none' | 'mild' | 'medium' | 'hot';

interface HealthPlan {
  goal: HealthGoal;
  intensity: TasteIntensity;
  spice: SpiceLevel;
  excludedIngredients: string[];
}

const HEALTH_PLAN_KEY = 'greenbite-health-plan';
const LEGACY_TASTE_KEY = 'greenbite-taste-preferences';

const GOAL_OPTIONS: { id: HealthGoal; label: string; detail: string }[] = [
  { id: 'balanced', label: '均衡营养', detail: '三餐规律 · 不偏科' },
  { id: 'fatloss', label: '减脂塑形', detail: '低脂高纤 · 轻负担' },
  { id: 'muscle', label: '增肌补给', detail: '高蛋白 · 练后补给' },
  { id: 'lowcarb', label: '控糖轻养', detail: '慢碳低GI · 稳定精力' }
];

const INTENSITY_OPTIONS: { id: TasteIntensity; label: string; detail: string }[] = [
  { id: 'light', label: '清爽', detail: '少油少酱' },
  { id: 'balanced', label: '均衡', detail: '风味适中' },
  { id: 'rich', label: '浓郁', detail: '酱香足' }
];

const SPICE_OPTIONS: { id: SpiceLevel; label: string }[] = [
  { id: 'none', label: '不辣' },
  { id: 'mild', label: '微辣' },
  { id: 'medium', label: '中辣' },
  { id: 'hot', label: '特辣' }
];

const EXCLUDED_INGREDIENT_OPTIONS = ['香菜', '葱', '蒜', '洋葱', '花生/坚果', '海鲜'];

const DEFAULT_PLAN: HealthPlan = {
  goal: 'balanced',
  intensity: 'balanced',
  spice: 'none',
  excludedIngredients: []
};

const readHealthPlan = (): HealthPlan => {
  try {
    // 优先读新 key；没有则尝试迁移旧的「口味定制」数据
    const raw =
      window.localStorage.getItem(HEALTH_PLAN_KEY) ??
      window.localStorage.getItem(LEGACY_TASTE_KEY);
    if (!raw) return { ...DEFAULT_PLAN, excludedIngredients: [] };

    const saved = JSON.parse(raw) as Partial<HealthPlan>;
    return {
      goal: GOAL_OPTIONS.some((o) => o.id === saved.goal)
        ? (saved.goal as HealthGoal)
        : DEFAULT_PLAN.goal,
      intensity: INTENSITY_OPTIONS.some((o) => o.id === saved.intensity)
        ? (saved.intensity as TasteIntensity)
        : DEFAULT_PLAN.intensity,
      spice: SPICE_OPTIONS.some((o) => o.id === saved.spice)
        ? (saved.spice as SpiceLevel)
        : DEFAULT_PLAN.spice,
      excludedIngredients: Array.isArray(saved.excludedIngredients)
        ? saved.excludedIngredients.filter(
            (item): item is string =>
              typeof item === 'string' && EXCLUDED_INGREDIENT_OPTIONS.includes(item)
          )
        : []
    };
  } catch {
    return { ...DEFAULT_PLAN, excludedIngredients: [] };
  }
};

/**
 * 健康计划弹窗 —— 2026-10-17 由「我的」页的内嵌口味面板改造而来。
 * 与 StoreModal / NutritionReportModal 同层渲染（App 层），
 * 规避手机壳内 fixed 会被裁剪 / 压不过底部导航的问题。
 */
export const HealthPlanModal: React.FC<HealthPlanModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [plan, setPlan] = useState<HealthPlan>(readHealthPlan);

  if (!isOpen) return null;

  const toggleExcludedIngredient = (ingredient: string) => {
    setPlan((current) => ({
      ...current,
      excludedIngredients: current.excludedIngredients.includes(ingredient)
        ? current.excludedIngredients.filter((item) => item !== ingredient)
        : [...current.excludedIngredients, ingredient]
    }));
  };

  const handleSave = () => {
    try {
      window.localStorage.setItem(HEALTH_PLAN_KEY, JSON.stringify(plan));
      onShowToast('健康计划已保存');
      onClose();
    } catch {
      onShowToast('暂时无法保存计划，请稍后重试');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="健康计划"
        className="flex max-h-[85vh] w-full max-w-md flex-col overflow-y-auto rounded-[24px] bg-white shadow-2xl animate-in slide-in-from-bottom-5 duration-300"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C7F665] text-black">
              <Target className="h-4 w-4 stroke-[2.5]" />
            </span>
            <h3 className="text-base font-black text-black">健康计划</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:text-black active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <p className="flex items-start gap-1.5 rounded-xl bg-[#f7f9fb] p-3 text-[11px] leading-relaxed text-slate-600">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#54801A]" />
            <span>设定你的健康目标和口味偏好，我们会据此为你推荐合适的轻食搭配。偏好保存在本机，随时可回来调整。</span>
          </p>

          {/* 计划目标（单选） */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-[12px] font-black text-black">计划目标</h4>
              <span className="text-[10px] text-slate-400">单选</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {GOAL_OPTIONS.map((option) => {
                const selected = plan.goal === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setPlan((current) => ({ ...current, goal: option.id }))}
                    className={`flex min-h-[64px] flex-col items-start justify-center rounded-2xl border px-3 py-2.5 text-left transition-all duration-200 ease-out active:scale-95 ${
                      selected
                        ? `${OPTION_CARD_SELECTED} text-black`
                        : `${OPTION_CARD_UNSELECTED} text-slate-600`
                    }`}
                  >
                    <div className="flex w-full items-center justify-between gap-1">
                      <span className="text-[11.5px] font-black">{option.label}</span>
                      {selected && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#54801A]" />}
                    </div>
                    <span
                      className={`mt-0.5 text-[9.5px] ${
                        selected ? 'font-bold text-[#54801A]' : 'text-slate-400'
                      }`}
                    >
                      {option.detail}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 口味浓淡 */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-[12px] font-black text-black">口味浓淡</h4>
              <span className="text-[10px] text-slate-400">按喜好选择</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {INTENSITY_OPTIONS.map((option) => {
                const selected = plan.intensity === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setPlan((current) => ({ ...current, intensity: option.id }))}
                    className={`relative flex min-h-[58px] flex-col items-center justify-center rounded-2xl border px-2 py-2 transition-all duration-200 ease-out active:scale-95 ${
                      selected
                        ? `${OPTION_CARD_SELECTED} text-black`
                        : `${OPTION_CARD_UNSELECTED} text-slate-600`
                    }`}
                  >
                    <span className="text-[11px] font-black">{option.label}</span>
                    <span
                      className={`mt-0.5 text-[9px] ${
                        selected ? 'font-bold text-[#54801A]' : 'text-slate-400'
                      }`}
                    >
                      {option.detail}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 辣度 */}
          <div>
            <h4 className="mb-2 text-[12px] font-black text-black">辣度偏好</h4>
            <div className="flex gap-1.5 rounded-full bg-white p-1 shadow-2xs ring-1 ring-slate-200/90">
              {SPICE_OPTIONS.map((option) => {
                const selected = plan.spice === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setPlan((current) => ({ ...current, spice: option.id }))}
                    className={`min-w-0 flex-1 rounded-full px-1.5 py-2 text-[10px] font-black transition-all duration-200 ease-out active:scale-95 ${
                      selected
                        ? 'bg-[#C7F665] text-black shadow-2xs'
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 忌口食材 */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <h4 className="text-[12px] font-black text-black">不想加入的食材</h4>
              <span className="text-[9px] text-slate-400">可多选</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {EXCLUDED_INGREDIENT_OPTIONS.map((ingredient) => {
                const selected = plan.excludedIngredients.includes(ingredient);
                return (
                  <button
                    key={ingredient}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleExcludedIngredient(ingredient)}
                    className={`flex min-h-[38px] items-center justify-between gap-1 rounded-full border px-2.5 transition-all duration-200 ease-out active:scale-95 ${
                      selected
                        ? `${OPTION_CARD_SELECTED} text-black`
                        : `${OPTION_CARD_UNSELECTED} text-slate-600`
                    }`}
                  >
                    <span className="truncate text-[10px] font-bold">{ingredient}</span>
                    <CheckBadge selected={selected} className="h-3.5 w-3.5 shrink-0" />
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[9px] leading-relaxed text-slate-400">
              过敏食材请在下单时额外备注，以便门店确认。
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="flex w-full items-center justify-center gap-1.5 rounded-full border-[2px] border-black bg-[#C7F665] py-2.5 text-[12px] font-black text-black shadow-[2px_2px_0_#000] transition-all duration-200 ease-out active:scale-95"
          >
            <Target className="h-3.5 w-3.5 stroke-[2.5]" />
            保存健康计划
          </button>
        </div>
      </div>
    </div>
  );
};
