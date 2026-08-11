// What the quest dispenser reads out. The Quest Log is the list; this is the part of
// it that is still live. Flat and mechanical on purpose — rewrite freely.

import { QUESTS } from '../content/codex.js';

export function openQuests() {
  return QUESTS.filter((q) => q.note !== 'Closed');
}

export function questLines() {
  const open = openQuests();
  if (!open.length) return ['Nothing wanting doing.'];
  return ['Work going:', ...open.map((q) => `  ${q.label} — ${q.note}.`)];
}
