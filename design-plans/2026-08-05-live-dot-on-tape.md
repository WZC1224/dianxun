# Move live pulse to tape; demote timeline dots

Written against: b0aff66

## Evidence chain

- Surface: `/` · `components/news/FlashHome.tsx`
- Problem: Animated `live-dot` sits beside brand「点讯」; every flash row uses `bg-live` markers. Tape has no live pulse.
- Design evidence: `docs/design/dianxun-ui.md` Signature（胶带左侧 live 青点）; `docs/design/preflight-coding.md`「live 点仅胶带一处」
- Owner: `components/news/FlashHome.tsx`
- Scope and affected surfaces: homepage flash only
- Uncertainty: none

## Design decision

Signature live pulse belongs on the tape's left edge only. Timeline markers stay structural but use `--rule`, not `--live`.

## Reuse

- `.live-dot` in `app/globals.css`
- Tokens: `--live`, `--rule`, `--slip`
- Exemplar: Signature description in `dianxun-ui.md`

## Changes

1. `components/news/FlashHome.tsx`
   - Change: Remove header `live-dot`. Add flex row on tape: left `live-dot` (aria-label 实时) + existing 3-col grid. Timeline node `bg-live` → `bg-rule`.
   - Preserve: Brand display type; tape content; flash-row animation; reduced-motion via `.live-dot`
   - Verify: One pulsing live dot on tape left; timeline dots not teal

## Scope

- Inherit: `/` only
- Verify: Other tabs unchanged
- Exclude: BottomNav motion; levels metric colors

## Validation

- Product: Open `/` — tape left pulses; brand has no dot; flash markers gray/rule
- Interface: empty tape placeholder still shows; reduced-motion stops pulse
- System: no second live-dot elsewhere on home
- Repository: visual check `/` → single live pulse on tape

## Stop conditions

- Stop if design docs move signature off tape.

## Design documentation

- none (already specified in dianxun-ui / preflight)
