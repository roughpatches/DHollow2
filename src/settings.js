import { TUNING } from '../tuning.js';
import { SETTINGS } from '../content/settings.js';

// Which option each setting is currently on. Nothing is written to disk yet: settings
// last as long as the page does, which is as long as a session does.
const BY_ID = Object.fromEntries(SETTINGS.map((s) => [s.id, s]));
const chosen = Object.fromEntries(SETTINGS.map((s) => [s.id, s.start]));

export function option(id) {
  return BY_ID[id].options[chosen[id]];
}

export function setting(id) {
  return option(id).value;
}

export function cycleSetting(id) {
  chosen[id] = (chosen[id] + 1) % BY_ID[id].options.length;
}

// Most settings are read where they are used and need no poking. These two live on the
// camera, so they are pushed to it — on every World.create, and again on every change.
export function applyToWorld(world) {
  const cam = world.cameras.main;
  cam.setZoom(Math.max(1, TUNING.zoom + setting('view')));
  cam.startFollow(world.player, true, setting('camera'), setting('camera'));
}
