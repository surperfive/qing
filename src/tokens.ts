/**
 * 全项目共用的 className 常量。
 *
 * 2026-10-15 抽取：这些串原本在 `ProductDetailPage.tsx` 里各复制了 9 份、
 * `GachaPage.tsx` 里还有 1 份，改一处要翻 10 个地方。
 * 这里只放**卡片外观（chrome）**；文字色由各调用方自行拼，
 * 因为不是每处都需要（规格卡要 text-black，加料行不要）。
 */

/** 选择卡·选中：白底 + 青柠外环（不是绿描边，是 ring） */
export const OPTION_CARD_SELECTED = 'bg-white border-transparent ring-2 ring-[#C7F665] shadow-xs';

/** 选择卡·未选中：浅灰底 + 浅灰描边 */
export const OPTION_CARD_UNSELECTED =
  'bg-[#f7f9fb] border-slate-200/90 hover:bg-white hover:border-slate-300 shadow-2xs';
