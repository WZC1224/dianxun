# Tasks: 点讯 MVP

## Task 1: 项目骨架与设计 token

**Description:** 初始化 Next.js + TS + Tailwind；建立 CSS 变量（墨底、金强调、涨绿跌红）；四 Tab 布局壳与全局免责。

**Acceptance criteria:**
- [x] `npm run dev` 可启
- [x] 四 Tab 路由可切换
- [x] 375px / 1280px 可用
- [x] 品牌「点讯」首屏可见

**Verification:** build 通过；手动扫四 Tab  
**Dependencies:** None  
**Files:** `package.json`, `app/layout.tsx`, `app/(tabs)/**`, `app/globals.css`  
**Scope:** Medium

## Task 2: 快讯垂直切片

**Description:** `NewsProvider` 契约、Mock、Route Handler、快讯列表 UI（来源、相对时间、加载更多）。

**Acceptance criteria:**
- [ ] Mock 至少 20 条可分页
- [ ] 空态/错误态
- [ ] 单元或组件测覆盖列表渲染

**Verification:** `npm run test`；手动刷新列表  
**Dependencies:** Task 1  
**Files:** `lib/providers/news*`, `app/api/news/**`, `components/news/**`  
**Scope:** Medium

## Checkpoint A (after 1–2)
- [ ] 壳 + 快讯可演示

## Task 3: 点位垂直切片

**Description:** OHLC mock、ATR/支撑阻力算法、levels API、点位卡（入场/止盈/止损）。

**Acceptance criteria:**
- [ ] BTC ETH SOL BNB XRP 有点位
- [ ] 算法单测 ≥ 关键路径
- [ ] 免责完整句在点位页

**Verification:** `npm run test` 含 levels；手动切币  
**Dependencies:** Task 1  
**Files:** `lib/levels/**`, `lib/providers/market*`, `app/api/levels/**`, `components/levels/**`  
**Scope:** Large

## Checkpoint B (after 3)
- [ ] 快讯 + 点位可对外演示

## Task 4: 多空比切片

**Description:** `LongShortProvider` + API + 多空条 UI。

**Acceptance criteria:**
- [ ] 主流币 long/short % 展示
- [ ] provider 失败降级文案

**Verification:** 手动 + 映射单测  
**Dependencies:** Task 1  
**Files:** `lib/providers/long-short*`, `app/api/long-short/**`, `components/sentiment/**`  
**Scope:** Medium

## Task 5: 大事日历切片

**Description:** `CalendarProvider` + API + 按日分组 + 7/30 天筛选。

**Acceptance criteria:**
- [ ] 事件类型标签
- [ ] 筛选切换有效

**Verification:** 手动 + fixture 测  
**Dependencies:** Task 1  
**Files:** `lib/providers/calendar*`, `app/api/calendar/**`, `components/calendar/**`  
**Scope:** Medium

## Checkpoint C (after 4–5)
- [ ] 四 Tab mock 数据齐全

## Task 6: 真实 Provider 占位与 env

**Description:** `.env.example`；至少一个真实新闻或行情 adapter 可开关；失败回 mock。

**Acceptance criteria:**
- [x] 无密钥入库
- [x] `DATA_MODE=mock|live` 可切
- [x] Binance OHLC + RSS 快讯；失败回 mock

**Verification:** mock/live 各跑一轮  
**Dependencies:** Tasks 2–5  
**Scope:** Medium

## Task 7: PWA 与 e2e smoke

**Description:** manifest、图标占位、Playwright 四 Tab 导航 smoke。

**Acceptance criteria:**
- [ ] 可「添加到主屏幕」基本可用
- [ ] e2e 绿
- [ ] `npm run build` 绿

**Verification:** `npm run build && npm run test && npm run test:e2e`  
**Dependencies:** Checkpoint C  
**Scope:** Small–Medium

## Checkpoint D — Definition of Done
- [ ] Spec 成功标准全部勾选或显式延期
- [ ] 无 secrets
- [ ] 用户确认可进入下一迭代（原生壳/会员/推送等）
