# Fallen God

> *"You are a fallen god making obviously correct decisions that, for some reason, keep causing problems."*

A browser-based roguelite card game about divine intervention, consequence management, and the gap between intention and outcome. You play as a diminished god working through a series of crises — not because you doubt yourself, but because the mortals clearly need help.

**Play it:** Deployed on Vercel, auto-deploys from `main`.

---

## How the Game Works

### The Core Loop

Each **run** is a sequence of **3–5 encounters** (crises in your domain). For each encounter you cast abilities to reduce **Pressure** to zero before your turn limit runs out. When the run ends, you collect **Essence** and spend it on permanent **Upgrades** that carry into future runs.

The game is not about winning every encounter cleanly. It's about managing the debt your interventions create.

---

### Resources

**Essence** — Your currency. Gained at the end of each encounter based on how cleanly you resolved it. Spent between runs to purchase permanent upgrades.

**Strain** — Divine exhaustion. Starts at 0, cap is 20 (upgradeable). Every ability costs strain to cast. As strain climbs, your casts become sloppier:
- **Low** (<45% of cap): No penalty
- **Medium** (45–80%): +5 Consequence per cast
- **High** (80–99%): +8 Consequence, −1 Essence per cast
- **Critical** (100%): +12 Consequence, −1 Essence per cast

Strain drops by 4 when an encounter ends. It carries between encounters, so managing it across a run matters.

**Pressure** — The threat level of each encounter. Starts at 20–60+ depending on the crisis. Reduced by casting abilities. Some encounters regenerate pressure each turn. When pressure hits 0, the encounter ends.

**Consequence** — Collateral damage from your interventions. Builds as you cast. Each encounter has a **threshold** (35–70). Exceeding it triggers penalties: +2 Strain, −1 Essence, but your next cast becomes free (the cosmos flinching open). High consequence at encounter end becomes **carryover instability** that raises the starting pressure of the next encounter.

---

### A Run, Step by Step

**1. Menu** — Choose a Doctrine (your passive for this run):
- **Dominion**: Force-based. Pressure abilities cost 1 less Strain.
- **Revelation**: Crowd-based. Essence-focused abilities gain +1 Pressure and +1 Essence.

**2. Draft** — Pick 1 of 3 abilities to add to your starting arsenal. A forecast shows upcoming encounter types to guide your choice.

**3. Encounter (repeating)**
- The encounter card shows: Pressure remaining, Consequence meter vs threshold, turns left, encounter modifier.
- Select an ability to see a preview: strain cost, pressure delta, consequence delta, essence delta, synergy notes, warnings.
- Confirm to cast.
- Every 2 casts: a **Boon phase** triggers — optionally draft another ability fragment.
- When pressure hits 0 or turns run out, the encounter resolves.
- Resolution outcome (Perfect / Partial / Minimal / Catastrophic) determines essence gained and carryover added.

**4. Petition** (after 2 encounters) — Pim presents 3 encounter options; you choose which crisis to face next.

**5. Upgrade** — After the final encounter, 3 upgrade choices appear (one per tier). Spend essence or skip.

**6. Return to Menu** — Essence bank and upgrades persist. Everything else resets.

---

### Abilities

14 abilities across 3 categories:

| Category | Character | Tradeoffs |
|----------|-----------|-----------|
| **Smite** | Force, authority | High pressure reduction, medium consequence |
| **Manifest** | Followers, devotion | Medium pressure, high consequence, essence generation |
| **Twist** | Reality fracture | Low pressure, unpredictable consequence, special effects |

Abilities are not a fixed deck — you build your arsenal over the run through draft and boon phases. Casting the same ability repeatedly escalates its pressure cost (+1 per 2 uses), so variety is rewarded.

**Synergies** — 12 chained pairs reward sequencing. Examples:
- Manifest → Smite: Smite gains no consequence
- Smite → Twist: next ability costs 0 strain (free cast — the most powerful synergy)
- Condemn → Absolve: −4 consequence, +1 essence
- Ordain → Coerce: +3 pressure

Upgrades can multiply synergy value (Resonant Chains + Resonant Mastery = +3 essence per synergy triggered).

---

### Encounters

9 encounter types, each with distinct stats:

| Encounter | Flavor | Notable Mechanic |
|-----------|--------|-----------------|
| Shrine Collapse | The crowd calls it symbolism. | Low pressure, high threshold |
| Tempest Above the Harbor | Your priests insist this is a blessing. | Pressure regen each cast |
| Heretical Uprising | Admirable confidence. | High pressure, moderate turns |
| The Sanctioned Drought | The village will understand once the paperwork clears. | High consequence threshold |
| Harvest Blight | You call it data. | Short turns, fast escalation |
| Unanswered Prayers | Someone will call this neglect. | Essence-starved, long encounter |
| Surplus of Miracles | Nobody is coping well. | Moderate everything, moderate nothing |
| The Reasonable Philosopher | Several coherent questions. This cannot go unanswered. | Low pressure, high consequence |
| Unsolicited Geological Opinion | You did not ask. You remain unimpressed. | Very high pressure, volcano |

Each encounter rolls a random **modifier** that adjusts ability values for that crisis (e.g., *Stormsurge* makes Smite cost more strain; *Sacred Site* makes Manifest more effective). A 45% chance makes an encounter **Urgent** — higher starting pressure, fewer turns.

---

### Upgrades

Permanent progression bought between runs. 21 total across 3 tiers:

**T1 Fragment** (18 Essence) — 12 upgrades
- 5 Strength upgrades (personal power: strain reduction, essence bonuses, max strain, carryover decay, synergy value)
- 7 World upgrades (encounter frequency weights — make certain encounter types appear more often)

**T2 Aspect** (36 Essence) — 5 upgrades
- Resonant Mastery, Expanded Vessel, Flawless Record, Generous Threshold, Extended Jurisdiction

**T3 Dominion** (54 Essence) — 4 upgrades
- Sovereign Composure, Open Channel, Eternal Patience, Favorable Providence

---

### Resolution Outcomes

How an encounter resolves depends on pressure remaining and consequence level:

| Outcome | Condition | Essence | Carryover |
|---------|-----------|---------|-----------|
| **Perfect** | 0 pressure, low consequence | +3 | Minimal |
| **Partial** | 0 pressure or significant reduction | +2 | Moderate |
| **Minimal** | ≤33% pressure reduction | +1 | High |
| **Catastrophic** | Poor pressure + high consequence | +0 | Maximum |

Aftermath flavor varies by dominant ability category used during the encounter.

---

## Implementation State

### Stack
React + TypeScript, Vite, Tailwind CSS v4, Zustand with `persist` middleware (localStorage key: `fallen-god-state`).

### Key Source Files

| File | Role |
|------|------|
| `src/types.ts` | All interfaces: `Upgrade`, `StrengthBonuses`, `ActiveEncounter`, `AbilityPreview`, etc. |
| `src/data/upgrades.ts` | Upgrade definitions and tier costs (T1=18, T2=36, T3=54) |
| `src/utils/gameLogic.ts` | `buildUpgradeChoices`, `createEncounter`, `DEFAULT_STRENGTH_BONUSES` |
| `src/store/gameStore.ts` | Zustand store — all game actions, state migrations (currently v6) |
| `src/components/GameView.tsx` | Main game UI, upgrade screen |
| `src/components/EncounterCard.tsx` | Encounter display: pressure bar, consequence bar, turns, reward |
| `src/components/HelpModal.tsx` | Tutorial/help overlay |

### State Persistence

Persists across runs: essence bank, owned upgrades, strength bonuses, world weights, tutorial seen flag.

Resets per run: current strain, abilities in hand, encounter queue, history, carryover instability.

When adding new fields to `StrengthBonuses`, always merge with defaults in the `rehydrate` block in `gameStore.ts` to prevent `undefined → NaN` bugs from stale localStorage state.

### Known Gotchas
- TypeScript strict mode (`noUnusedLocals`) — Vercel build fails on unused imports/vars. Run `npm run build` before pushing.
- Tailwind v4 — dynamic class construction won't be detected. Use full class names only.
- `applyWorldBonuses(enc, bonuses)` must be called after every `createEncounter()` call (3 callsites in gameStore). It mutates the encounter in place.

---

## Development

```bash
npm install
npm run dev      # localhost:5173
npm run build    # production build + type check
```
