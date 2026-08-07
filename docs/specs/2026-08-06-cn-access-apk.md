# Spec: 国内可达 + Android APK 侧载（迭代 2）

**Status:** Phase 2 debug APK 已出；壳指向当前 cpolar  
**Date:** 2026-08-07  
**当前隧道（会变）：** https://546b0139.r8.cpolar.cn  
**APK：** `dianxun-debug.apk`（见 `docs/deploy/android-sideload.md`）

## Assumptions（错了立刻说）

1. Vercel + `*.workers.dev` 国内无代理不通（已实测）→ 停付费云，走白嫖  
2. 可达面 = 开发者 Windows 本机常开 + cpolar HTTP 隧道  
3. APK 仍等「手机无代理能开 HTTPS」之后；隧道免费域名易变，通网验收先于打壳  
4. 不做 iOS / 应用商店 / ICP（本迭代）  
5. `DATA_MODE=mock`  

## Objective

少数朋友能无代理用点讯。先 Web，再 APK。

**成功：**
1. 国内手机浏览器打开隧道 HTTPS，四 Tab 可用  
2.（后置）APK WebView 指向当时稳定 URL  

## Out of scope

- 应用宝 / Play  
- iOS  
- 付费国内云 / 备案（白嫖约束下不做）  
- 永久固定域名（免费隧道不保证）  

## Phase 1 — Cloudflare（已失败）

- 已部署：https://dianxun.wzc1224-dianxun.workers.dev  
- 验收：国内无代理进不去 → **停 APK 依赖此 URL**  

## Phase 1b — 本机 + cpolar（进行中）

见 `docs/deploy/local-tunnel.md`。

- `npm run build` + `DATA_MODE=mock npm start`  
- `cpolar http 3000` → 发 HTTPS  
- 验收：你手机无代理四 Tab  

## Phase 2 — APK（仅 1b 通且 URL 策略说清后）

- Capacitor；`server.url` = 可达 HTTPS  
- 若免费域名天天变：APK 不合适，改口头分享 Web 链接，或再议固定方案  

## Risks

- 本机关机 = 全挂  
- 免费隧道被限速 / 换域 / 封禁  
- 日后要稳：只能回到付费国内云或自有域名  
