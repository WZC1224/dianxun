# Bottom nav tab indicator slides with transform

Written against: b0aff66

## Evidence chain

- Surface: all tabs · `components/shell/BottomNav.tsx`
- Problem: Active indicator is per-tab color toggle (`bg-live` / transparent), not a sliding bar
- Design evidence: `dianxun-ui.md` Motion「Tab 激活条滑动」; `preflight-coding.md`「Tab 指示条宽度/位移过渡」; motion only `transform` / `opacity`
- Owner: `BottomNav.tsx`
- Scope and affected surfaces: shell on `/`, `/levels`, `/long-short`, `/calendar`
- Uncertainty: none

## Design decision

One shared indicator bar under the 4-col grid, translated by active index (`translateX(n * 100%)` of one cell). Instant jump when `prefers-reduced-motion: reduce`.

## Reuse

- `--live`, `--radius` / existing `rounded-sm`, `h-0.5 w-6`
- Phosphor icons / labels unchanged
- Exemplar: current active color `text-live`

## Changes

1. `components/shell/BottomNav.tsx`
   - Change: Compute `activeIndex` 0–3. Remove per-link indicator spans. Add absolute track under icons/labels with one `bg-live` bar; `style={{ transform: \`translateX(${activeIndex * 100}%)\` }}` with `transition-transform` (or CSS class). Center bar within each 25% cell (e.g. width 1.5rem, left calc).
   - Preserve: 4 labels 快讯|点位|多空|日历; Phosphor; active text/icon fill
   - Verify: switching tabs moves one bar; reduced-motion no transition

2. `app/globals.css` (only if needed)
   - Change: optional `@media (prefers-reduced-motion: reduce)` zeroing `.nav-indicator` transition
   - Preserve: live-dot / flash-row rules

## Scope

- Inherit: all AppShell pages
- Verify: active route detection for `/` vs nested
- Exclude: levels symbol tabs; calendar 7/30 tabs

## Validation

- Product: Click each bottom tab — one teal bar slides
- Interface: 375px and 1280px max-w-lg; reduced-motion
- System: no per-tab duplicate bars
- Repository: open four routes; indicator tracks activeIndex

## Stop conditions

- Stop if product drops bottom nav for another IA.

## Design documentation

- none
