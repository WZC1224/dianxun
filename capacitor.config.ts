import type { CapacitorConfig } from "@capacitor/cli";

const SERVER_URL =
  process.env.CAPACITOR_SERVER_URL ?? "https://546b0139.r8.cpolar.cn";

const config: CapacitorConfig = {
  appId: "app.dianxun.shell",
  appName: "点讯",
  webDir: "www",
  server: {
    url: SERVER_URL,
    cleartext: false,
    androidScheme: "https",
    allowNavigation: ["*.cpolar.cn", "*.cpolar.com", "*.r8.cpolar.cn"],
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
