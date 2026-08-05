# UI Design: 点讯（v3 — 夜盘终端）

> 2026-08-05 换向。弃 v2 浅色亚盘开盘板。用户选定市场主流 **A · 夜盘终端**。

## Direction

**夜盘终端 · 跟随系统.**  
暗/亮靠 `prefers-color-scheme` 自动切，无手动按钮。同一套组件，CSS 变量换皮。

## Token

### Dark（系统暗色 / 默认）
| Name | Hex |
|------|-----|
| Board | `#0B0F14` |
| Slip | `#151B24` |
| Ink | `#EEF2F7` |
| Mute | `#8B97A8` |
| Live | `#2DD4BF` |
| Long | `#0ECB81` |
| Short | `#F6465D` |
| Rule | `#2A3340` |

### Light（`prefers-color-scheme: light`）
| Name | Hex |
|------|-----|
| Board | `#E8ECF1` |
| Slip | `#FFFFFF` |
| Ink | `#0E1621` |
| Mute | `#5C6B7A` |
| Live | `#0D9488` |
| Long | `#059669` |
| Short | `#DC2626` |
| Rule | `#CFD6DF` |



## Type

- Display：Archivo Black（仅品牌「点讯」）
- Body：IBM Plex Sans
- Data：IBM Plex Mono（价、时间、百分比）

## Screens

壳层三截：
1. **顶栏固定** — 品牌「点讯」+ 当前页标题 + 实时点  
2. **中间滚动** — 仅 `main` 可滚；首页胶带 / 点位币种 / 日历天数 sticky 贴顶  
3. **底栏固定** — 四 Tab，flex 占位（非页面浮层）

免责：`仅供参考 · 非投资建议`


## Motion

1. live 青点缓呼吸  
2. 快讯行轻微入场  
3. Tab 指示条 `translateX`  

`prefers-reduced-motion`：停动画，瞬切。
