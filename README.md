# 点讯 DianXun

加密快讯 + 交易参考点位 + 多空比 + 大事日历（Next.js PWA）。

## 本地开发

```bash
npm install
npm run dev
```

http://localhost:3000

## 命令

```bash
npm run test
npm run lint
npm run build
npm start
```

## 部署（Vercel 推荐）

1. 代码推 GitHub / GitLab
2. Vercel → New Project → 选本仓库（Root 保持仓库根）
3. Build Command 默认 `next build`；Output `.next`
4. 环境变量（可选）：

| 名 | 说明 |
|----|------|
| `DATA_MODE` | `mock` 默认；接真源再切 `live` |

Node ≥ 20.19（本地 20.12 可用但有引擎告警）。

## 数据

MVP 全 mock。接真实源：`lib/providers/` 替换实现 + 对应 env，不改 UI。

## 文档

- Spec: `docs/specs/2026-08-05-dianxun-spec.md`
- UI: `docs/design/dianxun-ui.md`
- Preflight: `docs/design/preflight-coding.md`
- Review: `docs/reviews/2026-08-05-mvp-review.md`
- Tasks: `tasks/todo.md`
