# Android 侧载壳（Capacitor）

WebView 打开 cpolar HTTPS。电脑必须开着：`npm start` + `cpolar http 3000 -region=cn`。

## 当前

- APK：项目根目录 `dianxun-debug.apk`（或 `android/app/build/outputs/apk/debug/app-debug.apk`）
- 壳内 URL：见 `capacitor.config.ts` 的 `server.url`（免费隧道**会变**）

## 手机安装

1. 把 `dianxun-debug.apk` 传到手机（微信/数据线）
2. 允许「未知来源 / 安装未知应用」
3. 安装打开 → 应进点讯

打不开：本机隧道是否在线、URL 是否和壳里一致。

## 隧道 URL 变了以后重打壳

```powershell
# 1) 看 cpolar 日志里的 https://xxxx.r8.cpolar.cn
# 2) 改 capacitor.config.ts 里默认 URL，或：
$env:CAPACITOR_SERVER_URL = "https://新域名.r8.cpolar.cn"
npx cap sync android
cd android
$env:JAVA_HOME = (Get-ChildItem "C:\Program Files\Microsoft\jdk-21*" -Directory | Select-Object -First 1).FullName
.\gradlew.bat assembleDebug
copy app\build\outputs\apk\debug\app-debug.apk ..\dianxun-debug.apk
```

## 本机开服提醒

```powershell
nvm use 22
$env:DATA_MODE = "mock"
npm run start
# 另开窗口：
.\.tools\cpolar\cpolar.exe http 3000 -region=cn
```
