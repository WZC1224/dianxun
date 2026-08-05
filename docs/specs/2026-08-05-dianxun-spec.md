# Spec: 点讯 (DianXun) MVP

## Objective

面向中文零售加密用户的 **新闻快讯 + 交易参考点位 + 多空比 + 大事日历** PWA。

**用户故事**

1. 作为盯盘者，我打开 App 能在首页刷到按时间倒序的加密快讯，并看到主流币简要点位条。
2. 作为交易者，我进入点位页能看到某币的买入/卖出/止盈/止损参考价与更新时间。
3. 作为情绪观察者，我能看到主流币合约多空比。
4. 作为事件驱动交易者，我能看到未来大事日历。

**成功标准（可测）**

- [ ] 四 Tab 均可独立打开且空态/加载/错误态齐全
- [ ] 快讯列表首屏 ≤ 2s（有缓存时）；刷新可拉到新条目（接真实源或 mock 可切换）
- [ ] 点位页至少覆盖 BTC、ETH、SOL、BNB、XRP
- [ ] 每条点位展示：入场参考、止损、止盈、方向提示、算法版本、免责文案
- [ ] 多空比与日历有数据适配层，可换 provider
- [ ] 移动宽度 375px 与桌面 1280px 布局可用
- [ ] 无密钥进仓库；`.env.example` 齐全

## ASSUMPTIONS（已按授权填充）

1. Web/PWA，非原生优先
2. Next.js App Router + TypeScript + Tailwind
3. 服务端聚合第三方 API，前端不直暴露密钥
4. 点位 v1 = 本地/服务端规则引擎（支撑阻力 + ATR），非人工盘
5. 简体中文 UI
6. MVP 无支付、无强制登录
→ 有异议现在改。

## Tech Stack

| Layer | Choice |
|-------|--------|
| App | Next.js 15 (App Router), React 19, TypeScript |
| UI | Tailwind CSS 4, CSS variables design tokens |
| Data fetch | Server Components + Route Handlers |
| Cache | `unstable_cache` / fetch revalidate |
| Test | Vitest + Testing Library；关键 Playwright smoke |
| Lint | ESLint + Prettier |
| Deploy target | Vercel（或任意 Node host） |

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
npm run test
npm run test:e2e
```

## Project Structure

```
apps/web/                 # 或仓库根即 Next app（MVP 单包）
  app/                    # routes
  components/             # UI
  lib/
    providers/            # news / levels / ls-ratio / calendar adapters
    levels/               # 点位算法
    types/
  tests/
docs/
  intent/ ideas/ specs/ design/
tasks/
  plan.md
  todo.md
public/
.env.example
```

## Code Style

```ts
// providers 统一契约 — 好例子
export interface NewsItem {
  id: string;
  title: string;
  summary?: string;
  source: string;
  url?: string;
  publishedAt: string; // ISO
  symbols?: string[];
}

export interface NewsProvider {
  listFlash(params: { limit: number; cursor?: string }): Promise<{
    items: NewsItem[];
    nextCursor?: string;
  }>;
}
```

- 命名：组件 PascalCase；函数 camelCase；类型名词
- Provider 适配错误抛 `ProviderError`，UI 统一错误边界
- 禁止前端硬编码 API key

## Testing Strategy

| Level | What |
|-------|------|
| Unit | 点位算法、provider 响应映射 |
| Component | 快讯列表、点位卡空态/有数据 |
| Contract | mock provider fixtures |
| E2E smoke | 四 Tab 可导航 |

覆盖率：核心 `lib/levels` ≥ 80%；UI 不强制百分比。

## Boundaries

- **Always:** 免责声明；输入校验；测算法再合并；密钥仅 env
- **Ask first:** 换数据商、加登录、加支付、改点位算法对外含义
- **Never:** 承诺收益文案；替用户下单；提交 secrets；为「好看」加无关功能

## Feature Specs

### 1. 快讯

- 倒序时间线；来源标签；相对时间
- 下拉/按钮刷新；分页或无限滚动（MVP：分页「加载更多」）
- Provider 接口；开发默认 `MockNewsProvider`

### 2. 点位

字段：`symbol`, `sideBias`, `entryLow`, `entryHigh`, `takeProfit`, `stopLoss`, `updatedAt`, `method`, `disclaimer`

算法 v1（可替换）：

- 用最近 N 根日/4h OHLC（provider 行情）
- 近高近低作阻力/支撑带 → entry 区间
- ATR(14) × 倍数 → stop / TP

UI：币种切换 + 点位卡 + 「仅供参考」固定条

### 3. 多空比

- 按 symbol 展示 long% / short% / 比值 / 更新时间
- 可选资金费率一行摘要
- `LongShortProvider` 适配

### 4. 大事日历

- 按日分组；类型：宏观 / unlock / listing / 会议 / 其他
- 筛选：7 天 / 30 天
- `CalendarProvider` 适配

### 5. 壳层

- 底栏或侧栏四 Tab
- 品牌名「点讯」首屏可见（非仅 nav 小字）
- 全局免责：页脚短句 + 点位页完整句

## Success Criteria

见 Objective 可测清单。另：Spec / Plan / UI 设计经用户明确批准后再写业务代码。

## Open Questions

1. 生产新闻源最终选哪家（BlockBeats RSS / CryptoPanic / 自建爬虫）？→ MVP mock + 一个真实 adapter 占位。
2. 是否需要推送通知？→ MVP 不做。
3. 品牌英文名是否固定 DianXun？→ 暂定。
