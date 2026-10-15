# 项目长期记忆 — remix-greenbite 轻食点餐

详细踩坑过程在 `YYYY-MM-DD.md`，这里只留跨会话必须遵守的约定。

## 视觉语言（改任何 UI 前先读）
主色唯一来源是 `index.css` 的 `--lime-*` 色阶（2026-10-09 统一）：

| 变量 | 值 | 用途 |
|---|---|---|
| `--lime-50` | `#F2FCE0` | 极浅底纹 |
| `--lime-100` | `#E4F8BC` | 浅底纹 / 胶囊底 |
| `--lime-400` | `#C7F665` | **品牌主色**：面 / 填充 / 描边 / 环 |
| `--lime-500` | `#B7EF4B` | hover / 按下 |
| `--lime-700` | `#54801A` | 白底上的强调、选中描边（对白 4.7:1） |
| `--lime-900` | `#26430B` | 青柠底上的文字与图标 |

`#C7F665` 对白对比度仅 1.25:1 —— **只能当面，永远不做白底文字**。白底用 `--lime-700`，青柠底用 `--lime-900`。

粉色阶 `--pink-*`：50 `#FDD3EA` / 100 `#FAB7D9` / 400 `#EC4899` / 500 `#DB2777` / 700 `#BE185D` / 900 `#831843`。
⚠️ **数字价格与「小红点」刻意不入粉色阶**：两者都走**正红 `#E60012`**（2026-10-13 用户要求「改成正红色」），
直接写字面 hex（`text-[#E60012]` / `bg-[#E60012]`），不设变量 —— 与项目其它颜色一致，方便 grep。
**仍保留品牌粉的**：收藏心形、HOT 火焰、「9折限时」徽章、卡片标签、`rose-50/100/200` 浅粉底纹。
⚠️ 别再写 `text-rose-600` / `#E53935` —— 全项目已无这两个值（`FoodCutoutRenderer` 的 `fill="#E53935"`
是插画里的番茄，**不属于价格，不要动**）。

**不参与统一的三类**（自带配色，动了就毁）：
1. 插画/3D：`FoodCloche3D`、`GiftMascotAnimation`、`FoodCutoutRenderer`、`HandshakeStitchIcon`、`CloudSkyBackground`、`utils/ingredientBackdrops`
2. 抽卡光效：`GachaPage` `<style>` 里 `gb-flow-*` / `gb-drift-*` 是**青色**（`#16DCFA`/`#59FCBB`/`#A4F4FD`），在青柠底上要能看见才故意用青，别改绿
3. 稀有度徽章：SSR 金 `#ffb400` / SR 紫 `#b388ff` / R 青柠 `#C7F665`

**描边与投影**：2026-10-09 起四个主页面（首页/点餐/订单/我的）**全面去黑描边**，统一「白卡无边框 + `shadow-xs`」。不要再加 `border-2 border-black`。零模糊硬投影 `shadow-[Npx_Npx_0_#000]` 已弃用。
仍保留黑边：`GachaBurstReveal`（刻意）、`LoadingScreen`、`FavPage`/`FloatingCart`（未处理）。`bg-black` 实心卡是填充不是描边，保留。
反面教材：柔和渐变、低饱和橄榄绿、点阵肌理、呼吸光晕。

**信息层级基线**：L1 页级行动=青柠底+黑边+黑字；L2 状态/选中=**青柠底+黑字**；L3 条目行动（加减号）=浅灰；L4 主要内容=黑/玫红；L5 辅助/未选中=浅灰。
判据：L2 一眼可辨，L5 彻底退让，**中间不设第三种权重**。最常见错误是「未选中态写成深黑」。照片上的叠加标签**不要用青柠**（会被误读成选中），用中性深色蒙版。

**白描边文字 `.text-stroke-white`（`index.css`）**：用 **8 向 `text-shadow`**，**不要 `-webkit-text-stroke`**（居中描边会吃字形内部，笔画变细）。两档：默认 1.5px（≤11px）/ `-lg` 2px（≥12px）。
只在青柠底/彩色底/插画上有效（`#f7f9fb` 卡片底、`#f1f4f8` 胶囊底上基本看不见）。
**「有效」≠「该加」**：判据 —— **描边只留给「压在插画上」的文字**。实色徽章/胶囊上黑字对比度已够，加描边反而发虚（用户已明确去掉）。
推论：遇到「浅底文字加白描边」的需求，正解通常不是加描边，而是**把文字挪到图片背景上**。

**抽卡页食材卡片定稿**（2026-10-13；价格 15px + 红色为当日二改/三改）：稀有度 11px 无描边 / 菜名 12px lg 描边（`absolute inset-x-0 bottom-0` 压在插画下缘）/ kcal 13px 浅灰胶囊 / 价格 **15px `text-[#E60012]` 裸文字无胶囊、`font-black`**。
· 价格 13px → 15px：用户「价格视觉上比卡路里大一点」。
· 价格 `#54801A`（青柠绿）→ `text-rose-600` → **`text-[#E60012]`**：用户依次要求「价格改成红色」「改成正红色」。
  ⚠️ 白卡上永远不要用品牌主色 `#C7F665` 当文字（对白对比度仅 1.25:1）。
  `#E60012` 对白 4.8:1、对 `#f7f9fb` 卡片底 4.5:1，过 AA。
  ⚠️ `GachaPage` 里其余 `#54801A` 是状态文字/签到按钮，**不是价格，别一起改红**。
· **底部这行的余量实测**（`scripts/probe-price-size.mjs`）：内容宽 100px，最宽一组「180 kcal」胶囊 52.8px +「¥15」20.9px → 13px 余量 26.3px、15px 余量 24.1px、17px 余量 19.8px。
  ⚠️ 旧记录写的「13px 是安全上限 / 内容宽 92px」是保守估计，**已作废**；真正的上限是「别盖过菜名 12px 的层级」。
· 行高由 kcal 胶囊决定（13px + `py-0.5` = 17px），价格 15px 仍在 17px 内 → **这行不变高**，图槽/插画尺寸不受影响（`probe-card-fit.mjs` 复测：插画 38/42px 未裁、列数恒 3）。
菜名搬进图槽后要给图槽加 `max-h-[50%]`，否则被 `flex-1` 吃掉、插画胀大。控制遮挡用图槽 `pb-2`（重叠 15px→7px）；**别用调大 `max-h`** —— 只会放大插画，重叠像素数不变。

### 选择控件 / 按钮的组件 token（2026-10-13 详情页已对齐抽卡页）
商品详情页的组件与按钮已改成**抽卡页的语言**，两边现在共用同一套。改任何选择控件都照这套：

| 用途 | 写法 |
|---|---|
| 选择卡·未选中 | `bg-[#f7f9fb] border-slate-200/90 shadow-2xs`（**无黑边**） |
| 选择卡·选中 | `bg-white border-transparent ring-2 ring-[#C7F665] shadow-xs`（**青柠外环，不是绿描边**） |
| 勾选徽章 | `w-3.5 h-3.5 rounded-full border-[1.2px] border-black`；选中 `bg-[#C7F665]`+黑对勾，未选中 `bg-white`+灰点。位置 `absolute top-1.5 right-1.5`（3 列卡同） |
| 主行动按钮 | `rounded-full bg-[#C7F665] border-[2px] border-black text-black font-black shadow-[2px_2px_0_#000]` + 黑圆青柠箭头（= 抽卡页「全选」胶囊 / 抽卡按钮） |
| 次行动按钮 | `rounded-full bg-[#f1f4f8] border-slate-200/90 text-slate-900` |
| 黑胶囊（数值/状态） | `bg-black` + 青柠字形 + `text-white/80` 次要字（抽卡页页头「12 币」） |
| 小胶囊徽章 | `rounded-full bg-[#C7F665] text-black border-black/15`（「10款起送」） |
| 圆形图标按钮 | `w-7/8 h-7/8 rounded-full bg-white border-slate-200/90 shadow-2xs text-slate-600` |
| 形状 | **胶囊一律 `rounded-full`** —— 抽卡页没有方角胶囊 |

⚠️ 抽卡页的**黑底青柠字**是「状态胶囊」语言，**不要拿它当主行动按钮**（详情页原来就是这么错的，
主次层级拉不开）。主行动一律青柠底+黑边+黑字。
⚠️ 硬投影 `shadow-[2px_2px_0_#000]` 只在**青柠主行动按钮**上用；卡片仍走 `shadow-xs/2xs`。
⚠️ 价格与「小红点」统一走正红 `text-[#E60012]` / `bg-[#E60012]`（详见「视觉语言」段）。

### 首页版面比例（2026-10-13 按参考图定稿）
参考图是 **375×666 设备**的截图（941×1672，缩放 2.509）。项目壳宽 410 → **换算系数 1.093**。
⚠️ **比例按 1.093 换算，但卡内字号按绝对值取**（两边卡片内宽几乎相同：169 vs 164）。

| 组件 | 定稿值（410 壳） | 别改回 |
|---|---|---|
| 页面左右边距 | **10px**（`px-2.5`） | 14 |
| 2×2 入口卡 | **192 × 125**，`min-h-[125px]` | 186 × 146 |
| 入口卡列/行间距 | **6 / 8**（`gap-x-1.5 gap-y-2`） | 10 / 10 |
| hero 高 | **304px**（`BannerSlider`，比例 1.35） | 290~310 |
| 限时福利条高 | **54px**（44 → 72 → 54） | 44 / 72 |
| 板块间距 | **12px**（`space-y-3`） | 14 |
| 入口卡内部 | `px-3.5 pt-2.5 pb-1`；标题 18px `leading-none`；副标题 10px；文案块 `relative z-10` | — |
| 入口卡插画 | **`absolute right-0 bottom-0 w-[96px] h-[96px]`（右下角，z-0）**，可见内容 85×87 | 底部居中 `h-[73px]` |
| 入口卡箭头 | **15px 黑圆徽章 + 青柠 chevron** | 裸 chevron |
| 限时福利条内部 | 黑圆 32px / 标题 16px / 「查看更多」胶囊 `px-3.5 py-1 text-xs` | — |

⚠️ **入口卡插画尺寸被「素材内容留白」倒逼**：四个素材的非白内容留白差异极大 ——
   `1b67…png` 上17/下16/左8/右10% · **`edd0…png` 上3.3/下5.7/左6.7/右4.5%** ·
   `893.mp4` 上22.5/下26/左12/右16% · `891.mp4` 上24/下18/左17/右16%。
   「到店自取」几乎撑满画布，所以按它定：96×96 贴右下 → 内容 x101~187 / y31~119（内区 190×123）。
   ⚠️ **别放大到 108 或加负偏移** —— 到店自取/今日抽卡的下沿会被 `overflow-hidden` 裁掉（踩过）。
   ⚠️ 上限由**副标题宽度**决定（约 95px）：内容左边界必须 > 109 → 画布 ≤ 96。想再大先缩文案。
   ⚠️ 校验用 `scripts/probe-home-card-art.mjs`（元素 rect + 留白比例反推内容边界，失败 exit 1）。
      **不要**用「截图非白像素 bbox」量 —— 会把卡片描边/圆角算进去，四张全报「0px 贴边」。
⚠️ **竖向尺寸不要按宽度比例缩放**（2026-10-13 教训）：参考图 375 设备、项目壳 410，
   我把福利条 66×1.093=72 换算过去，用户回「降低高度，现在太大了」。
   → **比例只用于推导宽度方向的量**（边距、卡片宽、间距）；高度/字号这类竖向尺寸
     要单独判断，宁可偏保守。最终取 54。
⚠️ **`min-h` ≠ 实际高**：卡片内容会撑破 `min-h`。改完必须实测（`scripts/shot-home-ref.mjs`
   会打印 cardW/cardH/rowGap/colGap/bannerH/barH），别按公式算完就收工 —— 我算 125、实测 136.5。
⚠️ **图片内容 ≠ 画布**：`1b67bdaeb3b2740899ad324d0df7f544.png` 是 1254² 方形，但非白内容只占
画布 81%×66%，`object-contain` 后插画比容器小一圈。要"看起来更大"就加大容器或 scale，
别只加容器高（会顶破卡片）。量法：alpha / 非白 bbox。
⚠️ 参考图没滚到的部分（招牌减脂餐卡、邀请免单卡、人气菜品网格）**尺寸未动**，只跟随全局边距/间距。

**参考图量法（`scripts/`，用系统 Python `D:/python/python.exe` + PIL）**：
`label-home-ref.py`（**青柠色连通域抠卡片 bbox，最有用**）、`bands-home-ref.py`（采样线上的非白连续段）、
`measure-home-card.py`（单卡内部逐行色彩占比，定位标题/副标题/插画）、`grid-home-ref.py`（叠标尺出图）。
对照图 `outputs/home-ref/compare-home.png`、`compare-card.png`。

## 数据与文案
- **默认 Tab 是 `'menu'` 不是 `'home'`**（`App.tsx:39`）。脚本 `goto` 后直接截图截到的是点餐页，要首页先 `click('#nav-tab-home')`。
- **点餐页菜名上限 7 字**（`MenuPage.tsx:561`，容器可用宽 108px、字号 14.5px，7 字=99px），超过被 `truncate`。
- ⚠️ 菜名在 `mockData.ts` 的 `DISHES` 是**全局数据**，改名影响详情页/订单/购物车/搜索，必须同步改硬编码旧名（`SearchModal` 热搜词、`NutritionReportModal` 文案）；排查用 `Grep` 旧名前几个字。

## 技术栈与架构约束
React 19 + TS + Vite 6 + Tailwind v4 + motion/react v12。无路由库，页面切换靠 `App.tsx` 状态。
**全应用渲染在 `DeviceFrameWrapper` 的 410px 手机壳内**（`max-w-[410px] overflow-hidden`）—— 这决定了两条铁律：

1. **`position: fixed` 必须 portal 到 `document.body`**，否则被手机壳裁掉，且 z-index 永远压不过作为 `<main>` 兄弟节点的底部导航（z-40）。
2. **手机壳内不要用 `sm:` / `md:`** —— 它们看视口宽度，与恒为 410px 的壳无关，同一份代码在桌面和窄窗口会变两种布局（真实翻车：抽卡页网格 `grid-cols-2 sm:grid-cols-3`）。
   判据：容器宽度不由视口决定时 `sm:` 就是错的 —— 要么写死、要么容器查询（`container-type: size` + `cqw`，加载屏就是这么做的）。插画同理：**不写固定 px**，用 `h-full w-auto max-w-full object-contain`。

**⚠️ 视口中心 ≠ 手机壳中心**：壳是顶部对齐 + 固定高（宽视口 844px / 窄 100dvh）。**已翻车两次**：
1. `GachaBurstReveal` 锚点写成 `(innerW/2, innerH*0.46)`，视口高 1200 时偏下 145px。
2. 同一文件的**顶部提示胶囊**（「✨ 抽到 N 款食材」）写 `top: calc(50% - 190px)` ——
   覆盖层是 `fixed inset-0`，`50%` 是**视口**高的一半，而结果卡锚在**手机壳**中心。
   实测：视口 700/844/900 时胶囊分别压住稀有度徽章 21.8 / 36.9 / 17.1px，视口 1200 时不重叠但**掉进卡片里**。
   修法：`top: revealAnchor.y - (single ? 190 : 148)`，四档视口恒为 31px 间隙。
   ⚠️ 十连的偏移原来写 208（配 `50%` 用），换参考系后必须同步改成 148，否则间隙从 16px 变 91px。
   校验脚本 `scripts/probe-reveal-pill.mjs`（单抽/十连 × 视口 700/844/900/1200，失败 exit 1）。

规则：fixed 覆盖层 portal 到 body 用**视口**坐标，但**布局锚点与相对间距**一律用**手机壳**坐标 —— 从 `#gacha-page-root` 往上找第一个 `overflowY: auto|scroll` 的祖先取矩形。锚点必须在动画开始前测一次存 state（不能惰性初始化，也不能挂载后随便 setState）。
**判据**：只要一段定位里同时出现 `50%`（或 `vh`）和「相对某元素」的意图，就是踩坑了 —— 一律换成显式像素偏移。

**⚠️ `position: sticky` 会被祖先 `overflow: hidden` 干掉** —— `overflow: hidden` 会创建滚动容器，sticky 粘在那个从不滚动的容器上=没粘。修法：改 `overflow-clip`（裁剪一样但不创建滚动容器）。`#gacha-page-root`（`GachaPage.tsx:640`）踩过，验证脚本 `scripts/probe-sticky-header.mjs`。与 fixed 必须 portal 是同一类坑。

## 加载屏（`LoadingScreen.tsx` + `index.css` 的 `.brand-loader`）
- **配色绿黑**：整屏 `--lime-400` 青柠底 + 纯黑字/黑胶囊。**不要白底**（第一版被打回）。白色只留给餐碗和 logo；「跳过」/状态胶囊黑底青柠字，FRESH 贴纸同，星芒改黑，左上角黑色涂鸦斜线（我的页头部同款）→ ⚠️ `header` 的 `padding-top` 是 **46px**。碗=白填充+4px 黑描边（插画语言，不算 UI 描边）。**无硬投影**。
- ⚠️ 已知未解：整屏 100% 青柠，小程序从没有这么大纯色面积（我的页头部只占 ~20%）。要改需加白色内容卡，但那方向被打回过，先问。
- 不做假进度条；动画走 **CSS keyframes** 只动 `transform`/`opacity`（**不要 `setInterval` 每 30ms 刷 state**）；循环 keyframe 首尾同姿态且 `opacity:0`；响应式用容器查询不用 `vw`；`prefers-reduced-motion` 下关全部动画。
- `App.tsx` 侧：下层包 `inert` + `aria-busy`，退场淡出期间**保持 inert**（`onExitComplete` 才解除）；退场只做 `opacity`，**不要 `scale`**（露边缝）。**不要自动聚焦「跳过」按钮**（会点亮焦点环），聚焦容器。
- 验证：`scripts/verify-loading.mjs`、`shot-loading.mjs`、`probe-palette.mjs`；对比图 `outputs/loader-palette/compare.png`。

## 餐盖掀盖动画（`FoodCloche3D.tsx`）
- **只能刚体变换**：不要 `rotate()` 硬转（像贴纸转歪），不要 `scaleX/skewY`（轮廓压扁，用户：「不要产生形变」）。
- `transformBox` 用 `'view-box'` + 用户坐标 `transformOrigin`（`fill-box` 语义不同，不能用）。
- 当前定稿：纯刚体三段式（扑腾蓄势→掀开→回稳）共 **1.4s**；`transformOrigin: '78px 216px'`；扑腾 `rotate: [0,-3.5,0,-7,0,-11,0,-3,-12,-8]`（振幅递增，每次砸回 0），掀开段才给 `y`；待机呼吸纯位移不旋转。
- ⚠️ `GachaPage.tsx` 覆盖层接管延迟（2000ms）**必须 ≥ 餐盖动画总时长**，改时长要同步改。
- 调参用 `scripts/sweep-persp.mjs`（冻结 rAF 覆写 transform，一次 6 组对照）。
- 改文件前先读文件内关于 AudioContext 与轴心的注释（记了完整失败过程）。
- 「投影正确」≠「观感可接受」：收到「透视不对」先分清是透视问题还是形状变形，两者解法相反。

## 开发服务器 & 关键 id
端口 **5173**（`vite.config.ts`；原 3000 与用户另一应用冲突，2026-10-08 改）。未开 `strictPort`，占用时自动顺延。
脚本**不写死端口**，从 `scripts/_base.mjs` 导入 `BASE`；临时覆盖用 `BASE_URL=...`。

| id | 说明 |
|---|---|
| `#nav-tab-gacha` / `#nav-tab-home` | 底部导航（文案是「今日抽卡」，用文本选择器易失配） |
| `#btn-gacha-single` / `#btn-gacha-ten` | 单抽 / 十连 |
| `#cloche-lifting-dome` | 餐盖穹顶 |
| `#cloche-and-plate-group` | 盘子+餐盖整组 |
| `#plate-revealed-delicacy` | 盘内光核 |
| `#gacha-burst-overlay` | 抽卡爆裂揭示覆盖层 |

食材库网格无 id，卡片是 `.grid` 下带 `aspect-square` 的直接子节点。

## 抽卡食材插画（2026-10-13 位图化）
- 10 款食材插画是 `public/ingredients/*.png`（320×320 透明）。
- **id → 地址的唯一映射在 `src/utils/ingredientArt.ts`**，别再在 `GachaPage`/`GachaBurstReveal` 各写一份 switch。
- 源图 1254×1254（2×5、纯白底），`scripts/split-gacha-ingredients.py` 用**连通域**拆分（不能均匀网格切，第 3、4 个连在一起）；去背景**不能用全局白阈值**（豆腐/蛋清会被掏空），须先 `binary_fill_holes` 再取连通域。
- 图是正方形，`object-contain` 按短边缩放。渲染点尺寸：食材库卡片 `h-full w-auto max-w-full`、单抽大卡 104×104、十连小卡 28×28、图鉴弹窗 `w-7 h-7 sm:w-8 sm:h-8`（弹窗在 portal 内，此处 sm: 无碍）。
- 食材库走 **3 列**网格（卡片 106~114px、图槽 43~51px），校验脚本 `scripts/probe-card-fit.mjs`。

## 验证脚本（`scripts/`）
`_base.mjs`（BASE 地址）、`probe-cloche-open.mjs`（rAF 采样 + PerformanceObserver，以点击为基准报掉帧/longtask）、`probe-ajar.mjs`（冻结 rAF 量餐盖姿态）、`record-open.mjs`（录屏 + `ffmpeg -sseof` 尾截）、`shot-loading.mjs`/`record-loading.mjs`、`shot-app.mjs`（逐 Tab 截图）、`verify-flow.mjs`（端到端单抽/十连）、`probe-card-fit.mjs`、`probe-sticky-header.mjs`、`sweep-persp.mjs`。

### ⚠️ 本机 playwright 的坑
1. **不能用 `waitUntil: 'domcontentloaded'`** —— 本机 Vite dev 某模块请求会 hang，`goto` 30s 超时。用 `waitUntil: 'commit'` + `waitForSelector('#nav-tab-gacha', { timeout: 60000 })`。
2. **`page.screenshot()` 卡在 "waiting for fonts to load"** —— 建 context 后 `ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort())`。
3. 单视口完整流程约 20s，多视口脚本用 `run_in_background` 跑（易撞 Bash 120s 超时）。
4. 本机没装 playwright 自带浏览器，用系统 Chrome：`chromium.launch({ channel: 'chrome' })`（截图够用）。录屏需 `npx playwright install ffmpeg`（已装）；系统 ffmpeg 在 `C:/Program Files/ffmpeg/bin/ffmpeg.exe`（不在 PATH，脚本里做了探测）。
5. 录屏裁切偏移用场景检测校准，别猜：`ffmpeg -i raw.webm -vf "select='gt(scene,0.02)',showinfo" -f null -`。

## 其他高频坑
1. **`page.screenshot()` 单次可达 3 秒**，`waitForTimeout` 卡动画帧完全不可靠 —— 抓中间帧要冻结 rAF 或录屏抽帧。
2. **音频统一走 `src/utils/audioContext.ts` 单例**，不要在组件里 `new AudioContext()`（首次构造阻塞主线程约 230ms，且不 close 会耗尽 Chrome 每页约 6 个配额）。

## 文件清理（2026-10-14）
项目**原先没有 git**。清理前先 `git init` + 首次提交建了快照 **`b506996`**（含当时全部 492 个文件）。
回滚：`git checkout HEAD -- <路径>`。

**已删（约 33M，都走了回收站，脚本 `scripts/scan-unused.mjs` 可复现扫描）**：
- `dist/`（`npm run build` 可再生）
- 3 个零引用组件：`MenuCouponBar.tsx`、`NutritionModal.tsx`、**`GachaIngredientIcons.tsx`**
  ⚠️ 后面写文档/改插画时**别再引用这三个文件**，它们已经不存在了。
- 8 个根目录重复文件（`public/` 有逐字节相同副本；实测 **Vite 优先服务 `public/`**，
  根目录副本根本不会被用到 —— 判断依据：`curl -I /891.mp4` 的 Content-Length 等于 public 那份）
- 16 个 `public/` 零引用素材、`.backup-src*`、`assets/`、`bun.lock`、`build_svg_part*.py`

**⚠️ `.git` 现在有 89M** —— 因为首次提交把 `probe-out/`(59M) + `outputs/`(20.5M) 的图片也收进去了，
而 `.gitignore` 没排除它们。若之后要删这两个产出目录，记得同步重建仓库，
否则那 80M 会永远留在 `.git` 里（`git gc` 也清不掉，blob 仍被 commit 引用）。

**仍可删（详见根目录 `UNUSED-FILES-REPORT.md`）**：
`probe-out/` 59M + `outputs/` 20.5M（验证产出，可重跑脚本再生）、
未使用的 npm 依赖 `@google/genai`(12M)/`express`/`dotenv`/`autoprefixer`/`esbuild`、
`metadata.json` + `.env.example`（Google AI Studio 脚手架，代码 0 引用）。

**⚠️ Windows 下往回收站删文件**：`Add-Type` 和 COM 都被安全策略拦。
可用的写法是直接调 `[Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile($p,'OnlyErrorDialogs','SendToRecycleBin')`
（不需要 Add-Type，PS 5.1 自带）。
它会**删成功后抛一个虚假异常「无法找到指定文件」**，别被误导 ——
验证文件真进了回收站的办法：写个 50M 文件测 `df` 可用空间，删除后空间**没被释放**即证明进了回收站。

## 按压态与选中态规范（2026-10-15 全站统一）

**按压缩放全站只有两档**，别引入第三种：

| 元素类型 | 写法 |
|---|---|
| 按钮 / 胶囊 / 图标 / 列表行 / 文字链 | `active:scale-95` |
| 卡片 / 面板 / 整块可点区域 | `active:scale-[0.98]` |

过渡一律 `transition-{all|colors|transform} duration-200 ease-out`。
判据脚本 `scripts/scan-feedback.mjs`（找「有 cursor-pointer 但整行无 active:」的）。

⚠️ **`duration-300` 是内容动画专用**（轮播 / 餐盖 / 吉祥物），别把它当成按压反馈改短 ——
按压态与 300ms **零重叠**，改错地方会毁掉抽卡动画节奏。

⚠️ **下面 7 处故意没有按压态**，别当漏改补上：
`FloatingCart:109`(黑遮罩) / `CartPage:136`+`FloatingCart:139/185/201/215`(group 容器，子元素已有 hover)
/ `BannerSlider:34`(轮播 slide) / `GachaPage:812`(餐盖主视觉) / `MenuPage:309`(搜索输入框)
/ `GiftMascotAnimation:33`+`MePage:193`(条件类名是 flag 不是元素)

**选中态视觉语言**（`ProductDetailPage` / `GachaPage` 的规格、加料、食材卡）：
选中副标题用 `#54801A`（`--lime-700`，白底 4.7:1）+ `font-bold`；
未选中 `text-slate-400`。**不是品牌主色 `#C7F665`**（对白仅 1.25:1）。
校验图 `outputs/detail-subtitle/`，脚本 `scripts/shot-detail-subtitle.mjs`。
