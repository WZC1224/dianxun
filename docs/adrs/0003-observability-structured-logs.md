# ADR-0003: 可观测性 — 结构化日志先行，APM 延后

## Status

Accepted 2026-08-06

## Context

live 路径会降级 mock；运维需回答：是否降级、哪个上游、接口多慢。产品暂缓 Vercel，上线清单写「错误监控可选」。不能上全套 APM 却也不能继续散文 `console.error`。

## Decision

On-call 问题（本阶段）：
1. 哪个 domain 因上游失败降级？
2. 失败原因（HTTP/网络文案，非堆栈灌库）？
3. 各 `/api/*` 耗时与 `dataSource`/`degraded`？

实现：
- `lib/observability/log.ts`：JSON 一行一事件；剥 `token`/`secret` 等键
- 事件：`provider_fallback`、`api_request`
- API：`x-request-id` 入/出；`durationMs` + route + status
- **不做**：Sentry / OpenTelemetry / Prometheus（部署后再开 ADR）
- **不做**：用户告警 pager（无生产流量）

## Alternatives Considered

### 继续散文 console
- Rejected：不可查询、难相关

### 立即接 Sentry
- Pros: 堆栈聚合
- Cons: 新外部依赖 + 密钥；未部署
- Rejected

## Consequences

- Vercel/主机日志可 grep `provider_fallback` / `api_request`
- UI Banner 仍是用户侧降级信号；日志是服务侧
- 上线后若要错误监控：新 ADR 选厂商，把同一 `event` 字段映射过去
