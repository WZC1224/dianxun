# Intent: 点讯 (DianXun)

> Confirmed via interview + user-authorized market fill (2026-08-05).

- **Outcome:** 零售加密交易者在一个 App 里同时看快讯、交易参考点位、多空比、大事日历。
- **User:** 中文区零售加密用户（盯盘 / 短线为主），非机构。
- **Why now:** 市场工具碎片化——律动/Tree 管快讯，CoinGlass 管多空，日历另开；点位散落信号群。合一降低切换成本。
- **Success:** 日活用户打开后 30 秒内完成「扫快讯 + 看至少 1 个主流币点位」；周留存证明点位页被反复打开。
- **Constraint:** 小团队 MVP——Web/PWA 优先（可装桌面/手机），真实第三方数据可插拔；不做撮合/下单。
- **Out of scope:** 自动交易、托管资金、跟单跟单社区、完整 K 线终端、法币出入金。

## Market-filled defaults (user authorized)

| Gap | Fill |
|-----|------|
| 核心钩子 | 点位差异化；快讯驱动 DAU（对标律动首页习惯） |
| 点位来源 | v1 规则化技术参考（支撑/阻力 + ATR 止损止盈），标注「非投资建议」 |
| 端 | Next.js PWA，移动优先响应式 |
| 语言 | 简体中文优先 |
| 币种 | BTC / ETH / SOL / BNB / XRP 等 Top 主流，可扩展 |
| 多空比 | 接入交易所聚合数据源（CoinGlass 类 API） |
| 大事日历 | 宏观 + 加密 unlock / 上币 / 会议（CoinMarketCal 类） |
| 账号 | MVP：游客可用；可选邮箱/钱包登录仅保自选 |
| 变现 | MVP 免费；预留会员位，不做支付 |

Yes / no / refine?（你已授权补齐；默认按此推进，有异议直接改。）
