# 点讯 · 实现 Pre-flight（taste 适配 · 产品壳）

> 来源：`design-taste-frontend` 可迁移规则 + `dianxun-ui.md` v2。  
> 主界面是盯盘 App，**不是**落地页。§13 落地页英雄/eyebrow 配额等不整套硬套。

## Design Read（锁死）

Reading this as: 四 Tab 加密产品壳，中文零售盯盘用户，亚盘开盘板语言，Tailwind tokens + 自有组件（不装 Fluent/Carbon）。

**Dials:** `DESIGN_VARIANCE: 4` · `MOTION_INTENSITY: 3` · `VISUAL_DENSITY: 8`

## Token（唯一调色板）

| Token | Hex | 用途 |
|-------|-----|------|
| `--board` | `#D5DCE6` | 页底 |
| `--slip` | `#F4F7FB` | 抬起面 / 底栏 |
| `--ink` | `#0E1621` | 主字 |
| `--mute` | `#5C6B7A` | 次字 |
| `--live` | `#0B8F8C` | **唯一**强调色（品牌/激活/live） |
| `--long` | `#1B7F5A` | 多 / 入场 |
| `--short` | `#C23B3B` | 空 / 止损 |
| `--rule` | `#B8C2CE` | 分割线 |

禁止第二强调色（蓝 CTA、紫、金并行）。涨跌语义色只用于多空/点位数字，不当品牌色。

## Type

- Display：紧缩无衬线（Archivo Black / 等价），**仅**品牌「点讯」
- Body：IBM Plex Sans（或 next/font 等价）
- Data：IBM Plex Mono（价、点位、时间戳、百分比）
- **禁** Inter 作默认；**禁** Fraunces / Instrument Serif

## 壳层硬约束

1. 底栏 **仅** `快讯 | 点位 | 多空 | 日历`，四屏同一组件，同一图标族（Phosphor 优先，禁手写 SVG）
2. 全局页脚短句：`仅供参考 · 非投资建议`（点位页可加完整免责）
3. UI 文案简体中文；点位条禁 `Key level` / `resistance` 英文
4. 圆角：统一小圆角 **8px**（按钮/条），底栏与页面直角或同 8px，不混 pill
5. 主题：**浅色板锁定**（v2）。暗色另开任务，禁止单屏翻黑

## 布局（密度 8）

- 首页：品牌 → live 点位胶带 → 快讯时间线（一条竖轨 + mono 时间）
- 点位：币种文字 Tab（下划线激活，非 pill）→ 大号 mono 数字 → 思路 → 免责
- 多空：列表 + 绿/红比条，无卡片堆
- 日历：`7天`/`30天` 文字筛选 → 按日分组
- 分割用 `border` / `divide-y`，**默认不用卡片阴影**
- 数字一律 mono

## Motion（强度 3）

允许：
1. live 青点缓呼吸（`prefers-reduced-motion` 时静态）
2. 快讯行 `opacity` + 轻微 `translateY` 入场（一次）
3. Tab 指示条宽度/位移过渡

禁止：滚动劫持、磁吸按钮、无限 shimmer 全页、GSAP pin、自定义鼠标。

只动 `transform` / `opacity`。

## Taste 禁区（实现必过）

- [ ] 零 `—` / `–` 可见文案（用 `-` 或句号）
- [ ] 无 AI 紫渐变 / 外发光 / 玻璃拟态铺满
- [ ] 无三等分等宽功能卡
- [ ] 无 div 假截图堆砌
- [ ] 无 hero 版号 / `01 · Section` 编号眉题
- [ ] 无装饰状态圆点扫街（live 点仅胶带一处）
- [ ] 无 emoji
- [ ] 图标单一家族 + 统一 stroke
- [ ] 空态 / 加载骨架 / 错误态三态齐全
- [ ] 按钮对比度 WCAG AA
- [ ] `min-h-[100dvh]` 壳，不用 `h-screen`

## 栈建议（编码时）

- Next.js App Router + Tailwind v4 + CSS 变量上表
- 交互叶：`motion/react`，慎用；密度屏优先 CSS transition
- 图标：`@phosphor-icons/react`
- 密钥不进前端；数据走 Route Handler

## 交付勾选（合并前）

- [ ] 四 Tab 路由可切，底栏标签一致
- [ ] Token 全部来自 CSS 变量，无散落 hex
- [ ] 点位至少 BTC ETH SOL BNB XRP
- [ ] `npm run lint` / `npm run test` / `npm run build` 绿
- [ ] 对照本文件禁区表再扫一眼 UI 文案

**Stop：** 若产品要改成暗色终端或第二强调色，先改 `dianxun-ui.md` 再动代码。
