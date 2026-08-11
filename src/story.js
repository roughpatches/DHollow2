// What has happened so far. A set of names, and three functions that read it.
//
// Anything in content/ can carry `needs` (not available until that flag is set) and
// `not` (gone once it is). Anything that happens can carry `sets`. That is the whole
// of the story system: scenes, dialogue, quests, and who is recruitable all gate on
// the same set, so a new gate needs no new machinery.

const flags = new Set();

export function set(id) {
  if (id) flags.add(id);
  return id;
}

export function has(id) {
  return flags.has(id);
}

export function raised() {
  return [...flags];
}

export function clear() {
  flags.clear();
}

// true when a thing's conditions are met. Something with neither field is always on.
export function ok(x) {
  if (!x) return true;
  if (x.needs && !flags.has(x.needs)) return false;
  if (x.not && flags.has(x.not)) return false;
  return true;
}
