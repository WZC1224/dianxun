# ADR-0001: 点讯 MVP 架构

## Status

Accepted 2026-08-05

## Decision

- 单仓 Next.js App Router PWA；无独立 API 服务
- 数据经 Route Handlers；前端不持密钥
- Provider 接口 + mock 实现先行；真实源后续 adapter
- 点位 v1：支撑阻力带 + ATR(14)，本地可测、可替换

## Consequences

- 小团队部署成本低；扩 provider 只动 `lib/providers`
- 无下单/无账户系统；合规暴露最小化
- 后续若接交易需新 ADR
