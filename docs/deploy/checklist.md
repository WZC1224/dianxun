# 上线清单：点讯 MVP

> 对应 shipping-and-launch 简化版。

## Pre-launch

- [x] `npm run lint` / `npm run test` / `npm run build` 绿
- [x] `npm run test:e2e` 绿（系统 Chrome）
- [x] 四 Tab 可访问（/ /levels /long-short /calendar）
- [x] live adapters + 失败降级 UI
- [x] 无 secrets 入库（`.env.example` 仅占位）
- [x] 安全响应头
- [x] 免责声明全局 + 点位完整句
- [x] PWA manifest + 品牌图标 + InstallPrompt
- [x] 离线 Banner + 空态重试

## 部署

- [ ] 推远端（`main` 本地曾 ahead；GitHub 网络通后再 `git push`）
- [ ] Vercel 项目联通（暂缓）
- [ ] 生产域名 HTTPS（暂缓）

## 上线后

- [ ] 打开首屏验证四 Tab
- [ ] 错误监控（可选）
- [ ] 回滚：Vercel 回上一部署

## 已知非阻塞 / 延期

- 解锁/上币仍为相对日程模板，非交易所真 API
- FF 日历易 429 → 缓存/bootstrap
- `npm audit` 仍有依赖告警
- 无独立错误监控
