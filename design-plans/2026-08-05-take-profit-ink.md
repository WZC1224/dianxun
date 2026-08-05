# Take-profit uses ink, not live

Written against: b0aff66

## Evidence chain

- Surface: `/levels` · `components/levels/LevelsPanel.tsx`
- Problem: 止盈 Metric uses `tone="live"` / `text-live`, treating brand accent as trade semantic color
- Design evidence: Token roles in `dianxun-ui.md` / `preflight-coding.md` — Live = 品牌/激活/live 脉搏; Long/Short = 多空与入场止损
- Owner: `LevelsPanel` Metric
- Scope and affected surfaces: `/levels` only
- Uncertainty: none — correction is ink (neutral data), not inventing a new accent

## Design decision

止盈 is reference data, not brand chrome. Color it `text-ink`. Keep 入场 long/short and 止损 short.

## Reuse

- Existing `text-ink` / Metric pattern
- Exemplar: same Metric component; change tone only

## Changes

1. `components/levels/LevelsPanel.tsx`
   - Change: Extend Metric `tone` with `"ink"` OR pass ink classes for 止盈. Prefer `tone="ink"` → `text-ink`. Set 止盈 to `tone="ink"`.
   - Preserve: entry long/short; stop short; layout; disclaimer
   - Verify: 止盈 labels/numbers ink; 止盈 not teal

## Scope

- Inherit: `/levels`
- Verify: home tape live accent unchanged
- Exclude: calendar day `text-live` headers (separate; not selected)

## Validation

- Product: Open `/levels` — 止盈 is ink; 止损 short; entry long or short by bias
- Interface: BTC/ETH tabs; loading/error unchanged
- System: `--live` not used for take-profit
- Repository: grep LevelsPanel for takeProfit tone → ink

## Stop conditions

- Stop if design later assigns a dedicated TP token (then use that token instead).

## Design documentation

- Optional: note in preflight「止盈用 ink」if executor wants; not required for merge
