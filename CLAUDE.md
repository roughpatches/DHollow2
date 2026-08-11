# CLAUDE.md — Dreadhollow v2

This file is the whole contract. There is no other design document, no decision register, and no specification. If a question isn't answered here, ask the designer — don't write a document to answer it.

Derived from the v1 post-mortem. Kept short on purpose: a rule you can't hold in mind is not a rule.

---

## Who decides what

**The designer sets direction.** Scope, sequencing, and creative decisions belong to the designer. Claude does not propose what to build next, does not offer a roadmap, and does not end a session with suggested next steps.

**Claude builds what is asked and says what it costs.** Claude may flag a risk, a conflict, or a cheaper route — once, briefly — then build what was asked.

**The designer states the task clearly.** Vague direction is what produced v1's specification machinery: absent a clear task, Claude fills the space with process. If the ask is unclear, Claude asks one question rather than inventing scope.

---

## Rules

1. **Documentation ceiling: total markdown lines must never exceed total lines of code.** At the ceiling, something is deleted before anything is written.
2. **No decision register, no contract beyond this file, no findings or handoff documents.** This file stays under 1,000 words excluding the reference section.
3. **No justification fields in data.** A value needing a paragraph of defence is a value nobody understands.
4. **Every constraint states its reason in one sentence, or it is dropped.** "Why is this a rule?" is always fair and must be answerable immediately.
5. **Every session ends with more content in the game** — dialogue, buildings, quests, NPCs, activities. Content volume is the only progress metric.
6. **Nothing is balanced until its loop runs end to end.** No tuning of half-built systems.
7. **Tunable numbers live in a file the designer can edit alone.** Balancing should not require a conversation.
8. **Art: two generations per asset, then accept and move on.** Resolution, palette, perspective, and frame counts are locked once, before generating.
9. **No proposal without its cost in the designer's hours, stated up front.**

**Smallest version first.** Every system gets the least machinery that produces visible behaviour this session, extended only when a specific piece of content demands it. A relationship system is a number that goes up and eighty lines that read it — until content proves otherwise.

---

## Reference — StarScape minigames

Not present in this repo. Available for import from the StarScape repository at the designer's direction, individually and only when an activity needs one. Listed here so the option is known, not to imply a plan.

Each is a self-contained JavaScript engine exposing the same contract: `start(onComplete)`, public `judgments` / `completed` / `failed`, judgments resolving to perfect / good / miss. Header comments cite v1 documents that no longer exist; strip those on import.

**Fishing**
- `CastEngine` (211) — hold to pay out line, release to present at reach; a drifting feeding lane and a decaying presentation meter.
- `HookSetEngine` (162) — wait-then-react. Feints that punish an early strike, one tight window on the real take. Hard fail.
- `TensionBarEngine` (177) — continuous hold-against-gravity, keeping an indicator inside a drifting zone. Generic; reusable anywhere.

**Woodcutting**
- `FellEngine` (251) — charge-and-release swing for bite depth, plus left/right lean steering against the tree's natural tip. Hard fail on lost soundness.
- `SawEngine` (211) — rhythmic push-pull; reverse the blade near each wall. Deeper strokes cut more and risk bind. No hard fail.
- `DrawknifeEngine` (174) — the only subtractive activity. Accelerating pulls shave toward a finished line; overshoot gouges and can't be undone.

**Mining**
- `ProspectEngine` (156) — precision tap on a sweeping needle; the band jumps and quickens each reading. Clarity is the clock. Sets seam quality.
- `MineEngine` (293) — charge swing into a weak-point zone, with a shallow/deep risk dial and a shock meter that punishes impatience.
- `PanEngine` (144) — alternate left/right to build slosh and hold it in band; over-rocking spills. No hard fail.

**Smithing**
- `SmeltEngine` (229) — slow and observational. Heat, fuel, molten fraction, purity; fuel is the clock and running out loses the charge.
- `ForgeEngine` (377) — the largest. Bellows heat, charge-and-release hammer against a moving zone, quench to relieve stress.
- `HeatCore` (57) — shared bellows model behind Smelt and Forge. Pump to raise, gentle decay, sweet band with cold/scorch penalties.

**Leatherworking**
- `CutEngine` (704) — untimed 2-D pattern-nesting puzzle. Lay pattern pieces on an irregular, flawed, directional hide. The only non-real-time activity.

**Cooking**
- `PrepEngine` (163) — tap on the beat as a marker crosses the cut line; flow combo rewards synchronisation.
- `CookEngine` (467) — one-way doneness bar with a fixed burn point and a pull window widened or narrowed by tended cues.

**Orchestration**
- `PhaseSequenceEngine` (103) — implements no minigame. Sequences sub-engines into multi-phase activities and aggregates their judgments.
