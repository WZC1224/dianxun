# ADR-0002: GitHub Actions 质量门，暂不部署

## Status

Accepted 2026-08-06

## Context

MVP 代码已可本地跑通；`main` 需在每次 push/PR 上自动拦回归。产品决策：**先不接 Vercel**，但缺 CI 时坏提交会静默堆在远端。

## Decision

- 用 GitHub Actions（`.github/workflows/ci.yml`）在 `push`/`pull_request` → `main` 跑质量门
- 门：`lint` → `typecheck` → `vitest` → `next build` → Playwright e2e
- CI 固定 `DATA_MODE=mock`，避免外源 429/墙导致假失败
- e2e 用 Playwright 自带 Chromium；本机仍优先系统 Chrome（CDN 常不通）
- `npm audit --audit-level=high` 记录但不挡合并（已知传递依赖告警，见 checklist）
- **不**在本 workflow 部署预览或生产

## Alternatives Considered

### 仅本地脚本 / 无 CI
- Pros: 零配置
- Cons: 推远端无门；易漂
- Rejected

### CI 内直接 Vercel 部署
- Pros: 预览完整
- Cons: 产品明确暂缓 Vercel；密钥与计费过早
- Rejected（另开 ADR 再启）

### CI 用 `DATA_MODE=live`
- Pros: 更近生产
- Cons: FF/外源不稳 → 红灯噪声
- Rejected；live 冒烟留本地/上线清单

## Consequences

- 合入 `main` 有可重复门；agent/人推前可对齐同一命令
- mock e2e 不覆盖 live 降级路径（单测已锁 resolve）
- 网络通后 push 才真正跑 Actions；branch protection 需在 GitHub UI 手动开「Require status checks」
- 将来接 Vercel：新 ADR 写预览/生产与密钥边界，勿塞进本文件
