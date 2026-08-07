# 本机 + 免费隧道（国内试开）

Vercel / Cloudflare `workers.dev` 国内无代理不通。临时方案：这台电脑跑点讯 + **cpolar**（国内友好免费隧道）。

## 限制（先认）

- 电脑休眠 / 关机 / 断网 → 朋友全挂  
- 免费隧道域名会变（重开隧道常换 URL）→ APK 先别打，等稳定再壳  
- 仅给少数熟人试  

## 一次准备

1. 注册 [cpolar](https://www.cpolar.com/)，控制台拿 **authtoken**  
2. 本机装 CLI（官网下载 Windows 版），登录：

```bash
cpolar authtoken <你的token>
```

3. 项目目录（Node ≥ 22）：

```bash
nvm use 22
cd C:\Users\16067\Desktop\NEWS-APP
npm run build
```

## 每次开服（两窗口）

窗口 A — 生产模式本地起（mock）：

```bash
set DATA_MODE=mock
npm run start
```

默认 `http://127.0.0.1:3000`。

窗口 B — 隧道（免费档必须国内区，别用默认 us）：

```bash
.\.tools\cpolar\cpolar.exe http 3000 -region=cn
```

终端会打出 `https://xxxx.cpolar.cn`（或同类）。**把这个 HTTPS 发给朋友**，手机无代理打开。

## 验收

- [ ] 你手机无代理打开隧道 URL  
- [ ] 四 Tab：快讯 / 点位 / 多空 / 日历  
- [ ] 电脑保持亮起或关休眠  

通了再谈 APK（`server.url` = 当时稳定 HTTPS；免费档域名常变，APK 会跟着废）。

## 关掉

Ctrl+C 停 `cpolar` 和 `npm start`。
