# 项目长期记忆 — remix-greenbite 轻食点餐

详细踩坑看 `YYYY-MM-DD.md`；这里只留持续有效的约定。改 UI 前先看 `src/index.css`。

## 视觉与组件
- 品牌色唯一来源 `--lime-*`：50 `#F2FCE0`、100 `#E4F8BC`、400 `#C7F665`（只做填充/描边，白底不可当文字）、500 `#B7EF4B`、700 `#54801A`（白底强调）、900 `#26430B`（青柠底文字）。
- 价格与小红点一律正红 `#E60012`。品牌粉留给收藏心形、HOT、折扣徽章、标签、浅粉底。插画/3D、抽卡青色光效、稀有度色（金 `#ffb400`/紫 `#b388ff`/青柠）不参与统一；`FoodCutoutRenderer` 番茄 `#E53935` 属插画别动。
- 首页/点餐/订单/我的：白卡无黑边 + `shadow-xs`，禁黑色硬投影。主行动可用青柠底+黑边+黑字+硬投影。主页面胶囊统一 `rounded-full`。卡片按压 `active:scale-[0.98]`，按钮/胶囊/图标/列表行 `active:scale-95`，过渡 200ms。
- 选择卡共享 `src/tokens.ts` 的 `OPTION_CARD_SELECTED`/`OPTION_CARD_UNSELECTED`，勾选徽章用 `CheckBadge`/`CheckIcon`。选中副标题 `#54801A` 加粗，未选中 `text-slate-400`。
- 白描边字 `.text-stroke-white` 用 8 向 `text-shadow`，只压在插画/彩色底上，不给浅色胶囊加。
- 首页定稿（410 壳）：左右边距 10px；入口卡 192×125，间距 6/8；hero 304；**福利条 46**（沿革 44→72→54→46，内容同比收：圆 28/标题 15/按钮 20.5）；板块间距 12；入口插画容器 `-right-1 bottom-1`，**尺寸按「视觉等大」分两档**：外卖/到店 `h-[62px] w-[94px]`，福利/抽卡 `h-[72px] w-[100px]`（方图给大、扁图给小；素材内容比例 1.38/1.18/1.08/1.06）+ `object-contain object-right-bottom`。入口卡标签：`left-3.5 bottom-[52px] gap-1` + 胶囊 `px-1.5 py-1 text-[8px]`（16px 高，y 57~73，紧接副标题下方，余量 15px），实心那颗黑底青柠字 / 青柠底黑字，第二颗白底必须带 shadow。**入口卡标题 22px**（沿革 18→22）+ 箭头徽章 18px + chevron 12px；22 的上限是「副标题→标签余量 9px」，再大要先挪胶囊（`bottom-[52px]`→`bottom-[48px]`）。`min-h` ≠ 实际高，改后用 `scripts/shot-home-ref.mjs` 实测。宽向可按 375→410 比例，竖向勿盲放。
- 入口插画用 **`public/entry-norm/*.png`（描边归一化产物），不是 `entry-*.jpg`**。四张原图描边占画面高 1.74%~3.12% + 62/72 两档渲染高 → 屏幕上是 1.25~2.06px（1.65×），看着不齐。`scripts/normalize-entry-stroke.mjs` 用膨胀/腐蚀**闭环校准**（穷举 r、用与测量脚本同款算法量一遍）统一到 1.52~1.65px（1.09×），并按 4× 渲染高导出（~120KB/张）。原 JPG 保留未动，回退只需改 `src`。⚠️ 换插画素材后必须重跑此脚本，否则又回到不齐。
- **「招牌减脂餐 + 邀请新人」这一行两张卡都是整张 1:1 成品图**，不是 HTML 拼的：`/signature-card.jpg`、`/invite-card.jpg`，都 `aspect-square` + `object-cover`，192×192。旧 HTML 版注释在各卡下方，**没进过 git，别删**。⚠️ 两卡同排 `items-stretch`，改一张高度必须同时改另一张，否则 `aspect-square` 失效。⚠️ 成品图与旧 HTML 不是同一设计（涂鸦青柠不是黄、吉祥物是皇冠兔不是绿手掌）。素材导出用 `scripts/optimize-image.mjs <源> <输出> 640 88`。
- **「我的」页有且只有一处整卡美术图位（⑤，我的功能下面，整宽 382）**，现在挂 `/me-order-card.jpg`（我的订单·未登录态，1024×572 → 382×213.4，`h-auto w-full`，**禁加 `aspect-`/固定高**，底部「去登录」离下边仅 1.2%）。它历史上换过三次内容（邀请好友 → invite-card.png「我的订单·已登录」→ 现在的未登录态），**编号⑤的注释别再当「邀请好友」读**。`invite-card.png` 与未登录图是同一套设计的两个状态，回退改 `src` 即可。
- ⚠️ **「我的」页同时存在两张「我的订单」**：③ 与服务中心并排的小卡（217.8×132）+ ⑤ 整宽 banner（382×213）。**③ 现在是整卡图 `/me-order-card.jpg`**（未登录态文案），`absolute inset-0 + object-cover`，**禁加 `aspect-`/`p-4`/`h-full` 直挂**（行高由同排服务中心的 132 决定）；⑤ 是 `/invite-banner.png`（邀请好友）。两者文案天然打架（③「去登录」/⑤「您有 2 笔」），是静态卡面图的固有限制。删 ③ 让服务中心占满整行是首选整理方案。
- **两张首页外 banner 的青柠已统一到 `#caf55d`**（③ 我的订单卡面 `/me-order-card.jpg` + ⑤ 邀请好友 `/invite-banner.png`）。⚠️ 注意 `#caf55d` 和品牌 `--lime-400` `#C7F665` **色相几乎一致**（都 ~77°），差别只在明度（0.663 vs 0.682）—— 所以「改成 #caf55d」本质是提亮对齐，不是换色。重建走 `scripts/build-me-banners.mjs [--recolor #caf55d]`（一个脚本同时产出两张：抠白底→改色→包围盒→缩放），**旧脚本 `make-invite-banner.mjs` 已删**。改色用 HSL 相对基准映射，不动单色，层次才不破；⚠️ 色相带必须带 `L_MIN=0.15`，否则邀请好友的黑卡会混进青柠家族把基准带成近黑。

## 架构约束
- React 19 + TS + Vite 6 + Tailwind v4 + motion/react v12；无路由，`App.tsx` 状态切页，默认 tab `menu`。
- 页面都在 410px 手机壳内。fixed 覆盖层必须 portal 到 `body`；壳内禁用 `sm:`/`md:`。`overflow:hidden` 会毁后代 sticky，改 `overflow-clip`。
- fixed 用视口坐标；相对手机壳定位要先测滚动容器矩形存锚点，不能混用 `50%`/`vh` 假设壳中心。
- 音频走 `src/utils/audioContext.ts` 单例。`FoodCloche3D` 只能刚体变换，禁 `scaleX/skewY`；改动画时长要同步 `GachaPage` 覆盖层接管延迟（2000ms）。

## 数据与验证
- 菜名在 `src/mockData.ts` 的 `DISHES` 是全局数据，改名要同步硬编码旧名。点餐页菜名最多 7 字。
- 抽卡食材图唯一映射在 `src/utils/ingredientArt.ts`，素材 `public/ingredients/*.png`，食材库 3 列。
- 端口 5173（无 strictPort 可能顺延）；脚本从 `scripts/_base.mjs` 取地址，`BASE_URL` 可覆盖。
- 校验脚本：`verify-loading.mjs`、`probe-card-fit.mjs`、`probe-sticky-header.mjs`、`probe-reveal-pill.mjs`、`scan-feedback.mjs`、`verify-flow.mjs`。本机 Playwright：`channel:'chrome'`、`waitUntil:'commit'`+等选择器、拦截 Google 字体。
- 不要引用已删除的 `MenuCouponBar.tsx`、`NutritionModal.tsx`、`GachaIngredientIcons.tsx`（详见 `UNUSED-FILES-REPORT.md`）。
