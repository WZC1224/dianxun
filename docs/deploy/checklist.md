# 上线清单：点讯 MVP

> 对应 shipping-and-launch 简化版。

## Pre-launch

- [x] `npm run lint` 绿
- [x] `npm run test` 绿（6 tests）
- [x] `npm run build` 绿
- [x] 四 Tab 可访问（/levels /long-short /calendar）
- [x] API 冒烟 200
- [x] 无 secrets 入库（`.env.example` 仅占位）
- [x] 安全响应头（X-Frame-Options 等）
- [x] 免责声明全局 + 点位完整句
- [x] PWA manifest + 图标

## 部署

- [ ] 推远端
- [ ] Vercel 项目联通
- [ ] 生产域名 HTTPS

## 上线后

- [ ] 打开首屏验证四 Tab
- [ ] 错误监控（可选接入）
- [ ] 回滚：Vercel 回上一部署

## 已知非阻塞

- 数据全 mock；真实 provider 未接
- 无 e2e / UI 组件测
- `npm audit` 仍有依赖告警
