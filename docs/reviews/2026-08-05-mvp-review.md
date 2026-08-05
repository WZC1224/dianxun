# Code Review: 点讯 MVP（2026-08-05）

## Verdict

**Approve with fixes applied.** MVP 提升代码健康；已修必改项。可进下一流程（简化 / git / 上线准备）。

## Five axes

| Axis | Notes |
|------|--------|
| Correctness | 四 Tab + API 与 Spec 对齐；runtime 200；mock 现已确定 |
| Readability | 模块边界清晰；体量可接受 |
| Architecture | Provider 适配方向正确；live 仍占位 |
| Security | 无密钥入库；news cursor/limit 已校验 |
| Performance | 列表分页；无大包动画 |

## Findings（已处理）

1. **Required:** `mockOhlc` 用 `Math.random` → 胶带/点位不一致 → **已改** seeded PRNG  
2. **Required:** tape 路由对同币种抽两次 OHLC → **已改** 单次复用  
3. **Required:** news `limit`/`cursor` 校验弱 → **已改** clamp + cursor 正则  
4. **Required:** 空头仍标「买入区间」→ **已改** 按 `sideBias` 切换文案/色  

## Remaining（非阻塞）

- **Optional:** UI 组件测 / e2e smoke 仍缺  
- **Optional:** `DATA_MODE=live` 真实 adapter 未接  
- **FYI:** `npm audit` 仍有依赖告警；上线前处理  
- **FYI:** 观测（结构化日志）未做  

## Verification（本轮）

- `npm run test` → 6 passed  
- HTTP：`/` `/api/news` `/api/levels/tape` `/api/levels/BTC` `/api/long-short` `/api/calendar` → 200  
- Dev server 仍在 `localhost:3000`
