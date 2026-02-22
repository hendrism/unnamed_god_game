# Fallen God — Project Context

## Stack
- React + TypeScript, Vite, Tailwind CSS v4
- Zustand with `persist` middleware (localStorage key: `fallen-god-state`)
- Dev server: `npm run dev` → port 5173
- Deploy: Vercel (auto-deploy on push to `main`)

## Key Files
| File | Role |
|------|------|
| `src/types.ts` | All interfaces: `Upgrade`, `StrengthBonuses`, `ActiveEncounter`, etc. |
| `src/data/upgrades.ts` | All upgrade definitions, tier costs (`T1_COST=18`, `T2_COST=36`, `T3_COST=54`) |
| `src/utils/gameLogic.ts` | `buildUpgradeChoices`, `createEncounter`, `DEFAULT_STRENGTH_BONUSES` |
| `src/store/gameStore.ts` | Zustand store — all game actions, state migrations |
| `src/components/GameView.tsx` | Main game UI, upgrade screen |
| `src/components/EncounterCard.tsx` | Encounter display (pressure bar, consequence bar, turns, reward) |
| `src/components/HelpModal.tsx` | Tutorial/help overlay |

## Architecture Notes

### Upgrade System (Tiered)
- **T1 Fragment** (18 essence): 12 upgrades (5 Strength, 7 World)
- **T2 Aspect** (36 essence): 5 upgrades — resonant-mastery, expanded-vessel, flawless-record, generous-threshold, extended-jurisdiction
- **T3 Dominion** (54 essence): 4 upgrades — sovereign-composure, open-channel, eternal-patience, favorable-providence
- `buildUpgradeChoices()` returns 1 per tier (up to 3 choices shown at end of run)
- Upgrades purchased at end of run only

### StrengthBonuses (in state)
All 11 fields — defaults in `DEFAULT_STRENGTH_BONUSES`:
`strainCostReduction`, `bonusAbilityDraw`, `essenceMultiplier`, `pressureReduction`, `discardRefund`,
`perfectClearEssenceBonus`, `conseqThresholdBonus`, `runLengthBonus`, `turnLimitBonus`, `pressureStartReduction`, `resetStrainOnEncounterStart`

### State Migration Pattern
When adding new fields to `StrengthBonuses`, always merge with defaults in the `rehydrate` block in `gameStore.ts`:
```ts
strengthBonuses: { ...DEFAULT_STRENGTH_BONUSES, ...(s.strengthBonuses as Partial<StrengthBonuses>) }
```
This prevents `undefined` → `NaN` bugs when old localStorage state is missing new fields.

### World Bonuses Application
`applyWorldBonuses(enc, bonuses)` is called immediately after every `createEncounter()` call (3 callsites in gameStore). Mutates the encounter object in place.

### Tailwind Tokens
Custom colors: `text-mythic-gold`, `text-void-purple`, `text-strain-red`

## Design Decisions
- **No GoalsBanner** — removed; EncounterCard is the single source of truth for encounter stats
- **Secondary stats** — only CARRYOVER and HAND shown (not ENCOUNTER or RUN ESSENCE — already in header)
- **HelpModal** — uses `items-start` (not `items-center`) on the flex container so it doesn't clip on small viewports
- **Text in EncounterCard** — no `truncate` or `line-clamp`; all descriptions wrap naturally

## Common Gotchas
- TypeScript strict mode (`noUnusedLocals`) — Vercel build fails on unused imports/vars even if dev compiles fine. Always run `npm run build` before pushing.
- Tailwind v4 — class detection is file-scan based; dynamic class construction (string concatenation) won't be picked up. Use full class names.
