# UI Design: 点讯（v2 — 亚盘开盘板）

> 2026-08-05 重置。弃 v1 近黑+金终端皮（偏 AI 默认簇）。  
> taste 适配：`VARIANCE 4 / MOTION 3 / DENSITY 8`。实现清单见 `preflight-coding.md`。

## Direction

**亚盘开盘板 / Asia open board.**  
加密盯盘驾驶舱。材料来自交易所 session board、纸质 pit slip、冷荧光灯下的报价条——不是夜盘黑金终端，不是奶油衬线杂志。

首屏一个构图：品牌「点讯」+ 青绿 live 点位胶带 + 快讯时间线。

## Token

| Name | Hex | Role |
|------|-----|------|
| Board | `#D5DCE6` | 页底（冷灰，非暖奶油） |
| Slip | `#F4F7FB` | 内容条 / 底栏抬起面 |
| Ink | `#0E1621` | 主字 |
| Mute | `#5C6B7A` | 次字 |
| Live | `#0B8F8C` | 品牌强调 / Tab 激活 / live 脉搏 |
| Long | `#1B7F5A` | 多 / 入场 |
| Short | `#C23B3B` | 空 / 止损 |
| Rule | `#B8C2CE` | 分割 |

## Type

- Display：Archivo Black / Bebas 风格紧缩无衬线（仅品牌「点讯」）
- Body：IBM Plex Sans
- Data：IBM Plex Mono（价、点位、时间戳）

禁止 Inter / Roboto / 系统默认堆。

## Signature

**青绿 live 点位胶带**：首页中部一条像交易所 tape 的横条，数字用等宽，左侧极细 live 青点呼吸。全产品只在这里「炫」一下。

## Screens（统一壳）

底栏四项且仅此四项：**快讯 | 点位 | 多空 | 日历**（四屏一致）。  
页脚短句免责：`仅供参考 · 非投资建议`（点位页可加完整句）。  
文案：简体中文。

1. 首页·快讯 — 品牌 + live 胶带 + 快讯轨
2. 点位 — 币种切换 + 入场/止盈/止损大数字
3. 多空 — 多空比条 + 费率一行
4. 日历 — 7天/30天文字筛选 + 按日事件

## Motion（实现）

1. live 青点缓呼吸  
2. 快讯行入场轻微上移淡入  
3. Tab 激活条滑动  

`prefers-reduced-motion`：停呼吸与位移，仅瞬切。

## Brand test

去掉底栏后，首屏仍一眼是「点讯」，不是通用新闻站或 CoinGlass 壳。

## 设计图

`dianxun-home-flash.png` · `dianxun-levels.png` · `dianxun-long-short.png` · `dianxun-calendar.png`
