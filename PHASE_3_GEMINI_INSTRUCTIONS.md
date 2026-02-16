# Phase 3: UI Updates - Instructions for Gemini

## Context
The game's core systems have been updated to focus on consequence management rather than just reducing pressure to 0. ChatGPT has created new encounter modifiers and resolution flavor text. Now you need to update the UI to show all this information clearly.

## What Changed in Phase 1 & 2

### Core Mechanic Changes:
- **Encounters end when pressure hits 0 OR turn limit reached** (not just turn limit)
- **Consequence threshold is now critical**: exceeding it triggers -2 essence penalty
- **Encounter modifiers** change ability values (e.g., "Stormsurge: Smite costs +1 strain, deals +1 pressure")
- **Resolution outcomes** based on BOTH pressure remaining AND consequence level
- **High consequence = higher carryover** to next encounter (makes it harder)

### New Data Structures:

**EncounterModifier** (in `src/data/encounterModifiers.ts`):
```typescript
interface EncounterModifier {
  id: string;
  name: string;
  description: string;
  effects: {
    // Global effects
    strainCostDelta?: number;
    pressureDelta?: number;
    consequenceDelta?: number;
    essenceDelta?: number;
    // Ability-specific overrides
    abilityEffects?: {
      abilityId: AbilityId;
      strainCostDelta?: number;
      pressureDelta?: number;
      consequenceDelta?: number;
      essenceDelta?: number;
    }[];
  };
}
```

**ActiveEncounter** (in `src/types.ts`):
```typescript
interface ActiveEncounter {
  // ... existing fields ...
  consequenceThreshold: number;
  thresholdExceeded: boolean;
  modifierId: string;
  modifierName: string;
  modifierDescription: string;
  modifierEffects: EncounterModifier['effects'];
}
```

**AbilityPreview** (shows base vs modified values):
```typescript
interface AbilityPreview {
  abilityId: AbilityId;
  baseStrainCost: number;
  strainCost: number; // after modifiers
  basePressure: number;
  pressureDelta: number; // after modifiers
  baseEssence: number;
  essenceDelta: number; // after modifiers
  baseConsequence: number;
  consequenceDelta: number; // after modifiers
  projectedConsequenceMeter: number;
  willExceedThreshold: boolean;
  // ... other fields ...
}
```

**EncounterResolution** (stored in `state.lastEncounterResolution`):
```typescript
interface EncounterResolution {
  outcome: 'perfect' | 'partial' | 'minimal' | 'catastrophic';
  pressureRemaining: number;
  finalConsequence: number;
  thresholdExceeded: boolean;
  essenceGained: number;
  carryoverAdded: number;
  flavorText: string;
}
```

---

## Your Tasks

### Task 1: Update EncounterCard.tsx

**Current state**: Shows pressure, reward, consequence in 3 separate large boxes. No threshold info. No modifier info.

**Required changes**:

1. **Add Consequence Threshold Display** (HIGH PRIORITY)
   - Show `consequenceMeter / consequenceThreshold` (e.g., "3 / 5")
   - Use a visual indicator (progress bar or colored text)
   - Color coding:
     - Green/gray: Below 80% of threshold
     - Yellow/warning: 80-100% of threshold
     - Red/danger: Exceeded threshold

2. **Show Active Modifier** (HIGH PRIORITY)
   - Display modifier name as a badge/tag
   - Show modifier description (tooltip or small text)
   - Example: `<span className="badge">Stormsurge</span>` + description on hover

3. **Compact Layout** (MEDIUM PRIORITY)
   - Current 3 boxes take too much vertical space
   - Redesign as a **compact 3-column grid** or **single box with sections**
   - Goal: Reduce total height by ~40%
   - Keep critical info visible without scrolling on mobile

4. **Visual Warnings**
   - If `thresholdExceeded === true`, show a warning badge/icon
   - Example: "⚠ THRESHOLD EXCEEDED" in red

**Example Layout Option**:
```tsx
<div className="encounter-card">
  <div className="header">
    <h2>{encounter.title}</h2>
    <span className="modifier-badge">{encounter.modifierName}</span>
  </div>

  <p className="description">{encounter.description}</p>
  <p className="modifier-desc">{encounter.modifierDescription}</p>

  <div className="stats-grid">
    <div className="stat">
      <label>Pressure</label>
      <value>{encounter.pressureRemaining} / {encounter.startingPressure}</value>
    </div>
    <div className="stat">
      <label>Consequence</label>
      <value className={consequenceMeter > threshold ? 'danger' : 'safe'}>
        {encounter.consequenceMeter} / {encounter.consequenceThreshold}
      </value>
    </div>
    <div className="stat">
      <label>Reward</label>
      <value>+{encounter.rewardPerTurn} Essence</value>
    </div>
  </div>
</div>
```

---

### Task 2: Update ActionPreview.tsx

**Current state**: Shows final values only. Doesn't explain modifiers.

**Required changes**:

1. **Show Base vs Modified Values** (HIGH PRIORITY)
   - When modifiers change values, show: `Base: 3 → Modified: 4`
   - Example for strain cost:
     ```tsx
     {preview.strainCost !== preview.baseStrainCost ? (
       <span>
         {preview.baseStrainCost} → {preview.strainCost}
       </span>
     ) : (
       <span>{preview.strainCost}</span>
     )}
     ```

2. **Explain Modifier Impact** (HIGH PRIORITY)
   - The `preview.notes` array already includes modifier explanations
   - Example note: "Stormsurge: +1 Strain cost"
   - Make sure these notes are **prominently displayed**
   - Consider highlighting modifier notes differently than synergy notes

3. **Threshold Warning** (CRITICAL)
   - If `preview.willExceedThreshold === true`, show a **big warning**
   - Example:
     ```tsx
     {preview.willExceedThreshold && (
       <div className="threshold-warning">
         ⚠ WARNING: This will exceed the consequence threshold!
         You'll lose 2 essence immediately.
       </div>
     )}
     ```
   - Use red/orange colors, make it impossible to miss

4. **Consequence Projection**
   - Show: `Consequence: {currentMeter} → {preview.projectedConsequenceMeter}`
   - Example: "Consequence: 3 → 5" (and threshold is 5, so this is risky)

---

### Task 3: Create ResolutionModal.tsx (NEW COMPONENT)

**Purpose**: Show encounter resolution outcome with flavor text and consequences.

**When to show**: After an encounter ends (`state.encounterResolved === true` and `state.lastEncounterResolution !== null`)

**Design**:
- **Modal overlay** (semi-transparent dark background)
- **Centered card** with resolution details
- **Auto-closes after 3 seconds** OR user clicks "Continue"
- **Different styling** based on outcome:
  - `perfect`: Green/gold, celebratory
  - `partial`: Blue/neutral
  - `minimal`: Yellow/warning
  - `catastrophic`: Red/critical

**Content to show**:
```tsx
<div className="resolution-modal">
  <h2 className={outcomeClass}>{outcomeTitle}</h2>
  <p className="flavor-text">{resolution.flavorText}</p>

  <div className="stats">
    <div>Pressure Remaining: {resolution.pressureRemaining}</div>
    <div>Final Consequence: {resolution.finalConsequence}</div>
    {resolution.thresholdExceeded && <div className="warning">Threshold Exceeded!</div>}
  </div>

  <div className="impacts">
    <div>Essence Gained: +{resolution.essenceGained}</div>
    {resolution.carryoverAdded > 0 && (
      <div>Carryover Instability: +{resolution.carryoverAdded}</div>
    )}
  </div>

  <button onClick={handleClose}>Continue</button>
</div>
```

**Implementation notes**:
- Use `useEffect` to auto-close after 3 seconds
- When closed, call `state.nextEncounter()` to proceed
- Import resolution data from `useGameStore.getState().lastEncounterResolution`

---

### Task 4: Mobile Layout Improvements (GameView.tsx)

**Current issues**:
- Too much vertical scrolling
- Encounter card + ability bar + preview all fighting for space

**Required changes**:

1. **Sticky Header** (MEDIUM PRIORITY)
   - Make the doctrine + essence section stick to top when scrolling
   - This keeps critical info always visible

2. **Compact Stats Row** (HIGH PRIORITY)
   - The "Encounter / Turn / Carryover" grid currently has too much padding
   - Reduce padding, use smaller text
   - Goal: Make it ~30% smaller

3. **Strain Meter** (LOW PRIORITY)
   - Currently vertical? Consider making it horizontal at top
   - Or keep as-is if it's already compact

4. **Ability Bar** (MEDIUM PRIORITY)
   - If more than 4 abilities, consider:
     - Horizontal scroll
     - OR wrap to 2 rows
   - Make sure touch targets are still big enough (minimum 44px)

---

## Design System (Keep Consistent)

**Colors**:
- `mythic-gold`: #FBD38D (primary accent, essence, success)
- `void-purple`: #7C3AED (buttons, actions)
- `strain-red`: red-500 (danger, strain, exceeded threshold)
- `gray-900`: Background
- `gray-700/gray-800`: Borders

**Typography**:
- `font-display`: Headers, important text
- Regular font: Body text
- Uppercase tracking for labels: `text-xs uppercase tracking-widest`

**Spacing**:
- Mobile-first: Assume narrow screen
- Use `p-3` or `p-4` max for cards
- Compact grids: `gap-2` instead of `gap-4`

---

## Files You'll Modify

1. `src/components/EncounterCard.tsx` - Update existing
2. `src/components/ActionPreview.tsx` - Update existing
3. `src/components/ResolutionModal.tsx` - Create new
4. `src/components/GameView.tsx` - Update layout

---

## Testing Checklist

After you're done:
- [ ] Build succeeds (`npm run build`)
- [ ] No TypeScript errors
- [ ] Consequence threshold is visible on encounter card
- [ ] Modifier name/description is shown
- [ ] Action preview shows base vs modified values
- [ ] Threshold warning appears when appropriate
- [ ] Resolution modal appears after encounter ends
- [ ] Layout is more compact (less scrolling)
- [ ] Everything still readable on mobile

---

## What NOT to Change

- Don't modify game logic (that's in `gameStore.ts`)
- Don't change ability data
- Don't change encounter templates
- Don't modify the core game loop
- Only update UI components

---

## Questions/Clarifications

If anything is unclear:
1. Check `src/types.ts` for the exact data structures
2. Check `src/store/gameStore.ts` to see how data is calculated
3. Look at existing components for styling patterns
4. The user wants mobile-first, compact, clear information hierarchy
