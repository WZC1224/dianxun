# Tasks: 点讯 MVP

## Task 1: 项目骨架与设计 token

**Description:** 初始化 Next.js + TS + Tailwind；建立 CSS 变量；四 Tab 布局壳与全局免责。

**Acceptance criteria:**
- [x] `npm run dev` 可启
- [x] 四 Tab 路由可切换
- [x] 375px / 1280px 可用
- [x] 品牌「点讯」首屏可见

**Verification:** build 通过；手动扫四 Tab  
**Scope:** Medium

## Task 2: 快讯垂直切片

**Acceptance criteria:**
- [x] Mock 可分页；live 华尔街见闻优先，失败 RSS → mock
- [x] 空态/错误态/断网重试
- [x] provider 单测覆盖

**Verification:** `npm run test`；手动刷新列表  
**Scope:** Medium

## Checkpoint A (after 1–2)
- [x] 壳 + 快讯可演示

## Task 3: 点位垂直切片

**Acceptance criteria:**
- [x] BTC ETH SOL BNB XRP 有点位
- [x] 算法单测 ≥ 关键路径
- [x] 免责完整句在点位页
- [x] 本地自选 + 首页胶带

**Verification:** `npm run test` 含 levels；手动切币  
**Scope:** Large

## Checkpoint B (after 3)
- [x] 快讯 + 点位可对外演示

## Task 4: 多空比切片

**Acceptance criteria:**
- [x] 主流币 long/short % 展示（Gate live / mock）
- [x] provider 失败降级 + UI 明示

**Verification:** 手动 + 映射单测  
**Scope:** Medium

## Task 5: 大事日历切片

**Acceptance criteria:**
- [x] 事件类型标签 + 类型筛选
- [x] 7/30 天筛选有效
- [x] 宏观 FF + 相对日程解锁/上币

**Verification:** 手动 + fixture 测  
**Scope:** Medium

## Checkpoint C (after 4–5)
- [x] 四 Tab mock/live 数据齐全

## Task 6: 真实 Provider 占位与 env

**Acceptance criteria:**
- [x] 无密钥入库
- [x] `DATA_MODE=mock|live` 可切
- [x] Binance OHLC + 中文快讯/RSS；失败回 mock + `degraded` Banner

**Verification:** mock/live 各跑一轮  
**Scope:** Medium

## Task 7: PWA 与 e2e smoke

**Acceptance criteria:**
- [x] 可「添加到主屏幕」基本可用（InstallPrompt + SW）
- [x] 品牌图标 192/512/maskable
- [x] e2e 绿
- [x] `npm run build` 绿
- [x] 离线条幅 + 统一空态

**Verification:** `npm run build && npm run test && npm run test:e2e`  
**Scope:** Small–Medium

## Checkpoint D — Definition of Done
- [x] Spec 成功标准勾选；延期项见下
- [x] 无 secrets
- [ ] 用户确认可进入下一迭代（原生壳/会员/推送等）
- [ ] `git push origin main`（本机 GitHub 443 不通时阻塞）

### 显式延期
- 真解锁/上币日历 API（需付费或稳定源 key）
- Vercel 生产部署（按产品决策暂缓）
- 原生壳 / 会员 / 推送（下一迭代）
