# 剩余可删除清单

> 更新时间：2026-10-14 22:2x · 扫描脚本 `scripts/scan-unused.mjs`（只读）
> **⚠️ 本清单仍是报告，我没有删除任何文件。**

## 已完成（上一轮，共约 33 M）

| 档 | 内容 | 结果 |
|---|---|---|
| 1 | `dist/`（构建产物） | ✅ 已删 |
| 2 | 3 个零引用组件（`MenuCouponBar` / `NutritionModal` / `GachaIngredientIcons`） | ✅ 已删 |
| 3 | 8 个根目录重复文件 | ✅ 已删 |
| 4+5 | 16 个 `public/` 未引用素材 | ✅ 已删 |
| 5 | `.backup-src/`、`.backup-src2/`、`assets/`、`bun.lock`、`build_svg_part*.py` | ✅ 已删 |

**回滚方式**：`git checkout HEAD -- <路径>`（快照 commit `b506996`）；文件也在回收站里。

---

## 还能删的（按「值不值得删」排序）

### A. 验证产出目录 — **79.6 M** ⭐ 最大头

| 体积 | 路径 | 内容 |
|---|---|---|
| **59.1 M** | `probe-out/` | 历次 `probe-*.mjs` 的过程调试产物 |
| **20.5 M** | `outputs/` | 历次 `shot-*.mjs` 的对照图 |

`probe-out/` 内部（前几名）：

| 体积 | 子目录 |
|---|---|
| 29 M | `ten-draw/` —— 十连抽逐帧 100+ 张 png，纯调试用 |
| 4.9 M | `gacha-size/` |
| 2.5 M | `single-draw/` |
| 2.2 M | `card-fit/` |
| 2.0 M | `persp/` |
| 1.9 M | `app/`（逐 Tab 截图） |
| 1.8 M | `me-ref/` |
| 1.7 M | `video/` |

`outputs/` 内部：

| 体积 | 子目录 | 建议 |
|---|---|---|
| 7.2 M | `home-ref/` | 首页版面（含带标尺参考图，**体积大但有用**） |
| 2.8 M | `red-unify/` | 正红改造 |
| 2.6 M | `reveal-pill/` | 抽卡揭示修复 |
| 2.6 M | `detail-ui/` | 详情页改造 |
| 1.5 M | `gacha-card-size/` | 抽卡卡片尺寸 |
| 1.2 M | `ten-draw-anchor/` | 十连锚点 |
| 其余 | `loading/`、`detail-swap/`、`loader-palette/`、`menu-hierarchy/`、`card-price/`、`gacha-header/`、`mode-toggle/` + 3 个散 png | 旧任务，可整删 |

**建议**：`probe-out/` 整个删（纯过程产物，重跑脚本可再生）；
`outputs/` 只留最近 4 组（`home-ref` / `red-unify` / `reveal-pill` / `detail-ui`），其余删。

### B. 跨目录重复文件 — **约 3.0 M**

| 体积 | 重复组 |
|---|---|
| 538 K × 3 | `outputs/gacha-card-size/menu-after.png` = `probe-out/menu-name/menu-mid.png` = `menu-top.png` |
| 389 K × 2 | `outputs/detail-swap/detail-after.png` = `probe-out/detail-swap/detail-after.png` |
| 370 K × 2 | `outputs/red-unify/04-detail.png` = `05-detail.png` |
| 365 K × 2 | `outputs/detail-ui/02-detail-large.png` = `03-detail-bottom.png` |
| 276 K × 2 | `outputs/sticky-header-after.png` = `probe-out/sticky-header/a-clip.png` |
| 142 K × 2 | `outputs/loading/timeline.png` = `probe-out/loading-video/timeline.png` |
| 119 K × 2 | `outputs/gacha-card-size/cards-zoom.png` = `probe-out/card-fit/zoom-price.png` |
| 96 K × 2 | `outputs/loader-palette/loader.png` = `outputs/loading/mobile-650.png` |
| 68 K × 2 | `outputs/loading/brand-loader.mp4` = `probe-out/loading-video/loading.mp4` |
| 20 K × 4<br>21 K × 4 | `probe-out/calorie-chips/` 8 张候选图（两组各 4 张内容相同） |

**建议**：A 档删掉后，这一档大部分自然消失。

### C. `.git` — **89 M** ⚠️ 慎重

上一轮我为了安全建的快照，里面 **80 M 是 `probe-out/` + `outputs/` 的图片 blob**
（`.gitignore` 没排除这两个目录，`git ls-files` 里有 179 + 59 个产出文件）。

**如果你删了 A 档，`.git` 里那 80 M 会变成永远清不掉的死重量**（`git gc` 也没用，blob 还被 commit 引用着）。

处理方式（三选一）：
1. 把 `probe-out/`、`outputs/` 加进 `.gitignore`，然后**重建仓库**（`rm -rf .git && git init && git add -A && git commit`）→ 新 `.git` 会降到 ~9 M
2. 保留现状不管（多占 89 M）
3. 连 `.git` 一起删（**会失去唯一的回滚手段**，不建议）

### D. 未使用的 npm 依赖 — **约 12.4 M**（需重装依赖）

| 包 | node_modules 占用 | 引用处 |
|---|---|---|
| `@google/genai` | **12 M** | 0 处（AI Studio 遗留） |
| `express` | 253 K | 0 处（没有 `server.js`，纯前端） |
| `dotenv` | 132 K | 0 处 |
| `autoprefixer` | — | 0 处（Tailwind v4 用 Lightning CSS，不需要它） |
| `esbuild` | — | 0 处（vite 自带） |

**做法**：从 `package.json` 删掉这几项 → `npm install`（会顺带清掉 node_modules 里的包）。
⚠️ 删完要跑一次 `npm run build` 确认没坏。

### E. 根目录散件 — **约 3 K**

| 路径 | 说明 |
|---|---|
| `.cleanup-log.txt` | 我上一轮删文件用的临时日志，**应该删** |
| `.vite/` | dev 缓存，删了下次启动慢 1 秒 |
| `metadata.json` | Google AI Studio 平台元数据，本地运行不需要 |
| `.env.example` | AI Studio 模板（`GEMINI_API_KEY`），代码里 0 处引用 |
| `UNUSED-FILES-REPORT.md` | 本报告，你自己决定留不留 |

**保留**：`gacha-ingredients.md`、`README.md`、`package.json`、`tsconfig.json`、`index.html`、`vite.config.ts`、`.gitignore`、`.workbuddy-ai/`

### F. 一次性调查脚本（`scripts/`）— 128 K，**不建议删**

体积可忽略。`scripts/` 里确实有一批一次性的（下划线前缀的 `_analyze_ingredients.py`、
`_check_ingredients.py`、`_tmp-hold.mjs`，以及 `shot-me-bottom.mjs`、`shot-calorie-chips.mjs`、
`compare-flame-colors.mjs` 等），但**其中多数在 `MEMORY.md` 里被记作现役工具**
（如 `sweep-persp.mjs`、`probe-flap.mjs`、`probe-idle.mjs`、`probe-persp.mjs`），
删了下次调参要重写。收益 0、风险不小，**建议全部保留**。

---

## 汇总

| 档 | 体积 | 风险 |
|---|---|---|
| A 验证产出目录 | 79.6 M | 低（可重跑脚本再生，但生成不了"当时那一版"） |
| B 重复文件 | 3.0 M | 极低（A 删完自然消失） |
| C `.git` 重建 | 回收 80 M | 中（需先确认不再需要回滚） |
| D 未使用依赖 | 12.4 M | 低（需重装 + 回归构建） |
| E 根目录散件 | ~3 K | 极低 |
| **合计** | **≈ 175 M** | |

清完之后项目会从 **402 M → 约 130 M**（含 node_modules）。
