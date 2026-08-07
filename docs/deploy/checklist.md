# 上线清单：点讯 MVP

> 对应 shipping-and-launch 简化版。

## Pre-launch

- [x] `npm run lint` / `npm run typecheck` / `npm run test` / `npm run build` 绿
- [x] `npm run test:e2e` 绿（本机系统 Chrome；CI 用 Chromium）
- [x] GitHub Actions CI（lint/typecheck/unit/build/e2e，`DATA_MODE=mock`）
- [x] 四 Tab 可访问（/ /levels /long-short /calendar）
- [x] live adapters + 失败降级 UI
- [x] 结构化日志：`provider_fallback` / `api_request` + `x-request-id`（ADR-0003）
- [x] 无 secrets 入库（`.env.example` 仅占位）
- [x] 安全响应头
- [x] 免责声明全局 + 点位完整句
- [x] PWA manifest + 品牌图标 + InstallPrompt
- [x] 离线 Banner + 空态重试
- [x] ADR：0001 架构 · 0002 CI · 0003 可观测性

## Go / No-Go（2026-08-06）

| 项 | 状态 |
|----|------|
| 代码质量门（本地） | **GO** |
| CI 文件已就绪 | **GO** |
| 生产主机 / Vercel | **GO** — https://dianxun.vercel.app （`DATA_MODE=live`） |
| Cloudflare Workers（国内试） | **NO-GO** — https://dianxun.wzc1224-dianxun.workers.dev 无代理不通 |
| 本机 + cpolar 隧道 | **GO** — 壳用；本机 `DATA_MODE=live`（域名会变） |
| Android debug 壳 | **GO** — `dianxun-debug.apk`（侧载说明见 `docs/deploy/android-sideload.md`） |
| 域名 HTTPS | **GO**（`*.vercel.app` / `*.workers.dev` 默认证） |
| 外部错误监控（Sentry 等） | **NO-GO**（可选；日志先行） |

**结论：** 公网预览已开（mock）。切 `DATA_MODE=live` 前再冒烟四 Tab + 日志。

## 部署

- [x] 推远端 `git push origin main`
- [ ] 确认 Actions `CI` workflow 绿（本机无 `gh`；浏览器看 Actions）
- [ ] GitHub → Settings → Branches：Require status checks（可选加固）
- [x] Vercel 项目联通（`wzc1224s-projects/dianxun`，已连 GitHub）
- [x] 生产环境变量：`DATA_MODE=live`（2026-08-07 已切并 Redeploy）
- [x] 生产域名 HTTPS：https://dianxun.vercel.app

## 上线后（Vercel 开通时）

- [x] 打开首屏验证四 Tab + Banner 降级文案（mock 见「演示数据」）
- [ ] 搜主机日志：`provider_fallback` / `api_request`
- [ ] 错误监控（可选；新 ADR 选厂商）
- [ ] 回滚：Vercel → 上一部署；或 `git revert` + 再部署
- [ ] 切 live：`vercel env` 改 `DATA_MODE=live` → Redeploy → 再冒烟

## 回滚（当前无生产时）

1. 代码：`git revert <sha>` 或重置未推提交（未 push 才可硬回）
2. 已 push：revert commit → push →（若有）Vercel 自动跟
3. 数据：无 DB；自选仅 `localStorage`，无需迁移回滚

## 已知非阻塞 / 延期

- 解锁/上币仍为相对日程模板，非交易所真 API
- FF 日历易 429 → 缓存/bootstrap + 冷却
- `npm audit` 仍有依赖告警（CI `continue-on-error`）
- 无独立错误监控 / 无生产流量告警
