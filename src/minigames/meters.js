// Meter widgets for the activity minigames, built on the 9-slice UI kit. The engines
// compute everything in normalized 0..1 values and only DRAW with these, so the widgets
// can be re-skinned without touching hit detection or tuning. Shared so every engine
// reads the same.
//
// Changed on import: the atlas comes from src/uiatlas.js rather than a painted sheet, and
// StarScape's unused import of the art manifest is gone. Nothing else moved.
import { bar as uiBar, feedback as uiFeedback, panel } from './ui.js';

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

// First candidate frame that actually exists on an atlas — lets a caller PREFER a
// bespoke frame (axe_marker, grain_band, bar_fell_*) yet fall back to the generic
// one until the art is baked. Returns the fallback (last item) if none exist so the
// draw never hard-fails on a missing frame.
export function resolveFrame(scene, atlasKey, candidates) {
  const tex = scene.textures.get(atlasKey);
  for (const name of candidates) if (tex?.has(name)) return name;
  return candidates[candidates.length - 1];
}

// Preferred bar KIND (bar_fell, …) if its `<kind>_fill` frame is baked, else the
// fallback kind. ui.bar() dies on a missing `_fill` frame, so resolve before calling.
export function resolveBarKind(scene, preferred, fallback) {
  return scene.textures.get('ui')?.has(`${preferred}_fill`) ? preferred : fallback;
}

// A horizontal track with an optional translucent sweet-spot band and a marker —
// the reusable "moving zone + marker" widget (charge-swing bite, prospect band,
// tension band). x = left edge, y = vertical center, w = pixel width.
//
// `markerKey`/`bandKey` let a minigame swap in a bespoke marker/band (e.g. the
// Fell axe-bit + grain band) as a drop-in; the marker draws at its frame's NATIVE
// width (so an 8px axe_marker isn't squashed to the generic 6px `marker`), unless
// `markerW` overrides it.
export function trackWidget(scene, x, y, w, { height = 14, band = true, markerKey = 'marker', bandKey = 'sweetspot_band', markerW } = {}) {
  const track = panel(scene, x + w / 2, y, w, height, 'track');
  const bandObj = band ? scene.add.nineslice(x, y, 'ui', bandKey, 20, height - 2, 3, 3, 0, 0) : null;
  const mW = markerW ?? scene.textures.getFrame('ui', markerKey)?.width ?? 6;
  const marker = scene.add.image(x, y, 'ui', markerKey).setDisplaySize(mW, height + 8);
  const api = {
    track, band: bandObj, marker,
    setMarker(pct) { marker.x = x + w * clamp01(pct); return api; },
    setMarkerTint(c) { c == null ? marker.clearTint() : marker.setTint(c); return api; },
    setBand(centerPct, halfWidthPct) {
      if (bandObj) { bandObj.setSize(Math.max(4, w * halfWidthPct * 2), height - 2); bandObj.x = x + w * clamp01(centerPct); }
      return api;
    },
    setBandTint(c) { if (bandObj) (c == null ? bandObj.clearTint() : bandObj.setTint(c)); return api; },
    depth(d) { track.setDepth(d); bandObj?.setDepth(d + 1); marker.setDepth(d + 2); return api; },
    destroy() { [track, bandObj, marker].forEach((o) => o?.destroy()); },
  };
  return api;
}

// A filled progress/meter bar (cut, soundness, quality…). Thin wrapper over ui.bar
// exposing setValue + a tint(color|null) for danger states. kind ∈ bar_hp /
// bar_stamina / bar_atb / bar_quality / bar_integrity.
export function meterBar(scene, x, y, w, h, kind = 'bar_quality') {
  const b = uiBar(scene, x, y, w, h, kind);
  return {
    ...b,
    setValue: b.setValue,
    tint(c) { c == null ? (b.fill.clearTint(), b.track.clearTint()) : b.fill.setTint(c); },
    destroy() { b.track.destroy(); b.fill.destroy(); },
  };
}

// A scored-arc gauge with a roaming safe-band segment and a swinging plumb-bob marker —
// the Woodcutting Fell lean read (`lean_gauge` face + `lean_band` + `lean_marker`). The
// marker hangs from a pivot near the top-centre of the face and swings ±SPAN as the value
// runs 0..1 (0.5 = plumb/vertical); the band segment is repositioned (not resized) to the
// safe-zone centre. `cx,cy` = centre of the gauge face. Returns the trackWidget-compatible
// API (setMarker/setBand/setMarkerTint) so the engine drives it identically to the linear track.
const LEAN_SPAN = 0.92; // radians of half-swing at value 0 / 1 (~53°)
export function arcGauge(scene, cx, cy, { scale = 2.0 } = {}) {
  const face = scene.add.image(cx, cy, 'ui', 'lean_gauge').setScale(scale);
  const fh = face.displayHeight;
  const pivX = cx, pivY = cy - fh * 0.42;      // pivot just below the top edge of the face
  const swing = fh * 0.62;                       // marker/band swing radius
  const band = scene.add.image(pivX, pivY, 'ui', 'lean_band').setOrigin(0.5, 0.5).setScale(scale);
  const marker = scene.add.image(pivX, pivY, 'ui', 'lean_marker').setOrigin(0.5, 0).setScale(scale);
  const angleOf = (pct) => (clamp01(pct) - 0.5) * 2 * LEAN_SPAN; // 0→-SPAN, .5→0, 1→+SPAN
  const place = (obj, pct, r) => {
    const a = angleOf(pct);
    obj.setPosition(pivX + Math.sin(a) * r, pivY + Math.cos(a) * r).setRotation(a);
  };
  const api = {
    face, band, marker,
    setMarker(pct) { place(marker, pct, 0); return api; }, // origin (0.5,0): rotate about the pivot
    setMarkerTint(c) { c == null ? marker.clearTint() : marker.setTint(c); return api; },
    setBand(centerPct) { place(band, centerPct, swing); return api; },
    setBandTint(c) { c == null ? band.clearTint() : band.setTint(c); return api; },
    depth(d) { face.setDepth(d); band.setDepth(d + 1); marker.setDepth(d + 2); return api; },
    destroy() { [face, band, marker].forEach((o) => o?.destroy()); },
  };
  marker.setPosition(pivX, pivY); // hangs from the pivot; rotation swings the bob
  return api;
}

// The smithing heat gauge (cold → sweet-band → scorch gradient) with a marker.
export function heatGauge(scene, x, y, w, { height = 16 } = {}) {
  const img = scene.add.image(x, y, 'ui', 'heat_gauge').setOrigin(0, 0.5).setDisplaySize(w, height);
  const marker = scene.add.image(x, y, 'ui', 'marker').setDisplaySize(5, height + 8);
  return {
    img, marker,
    setValue(pct) { marker.x = x + w * clamp01(pct); },
    setMarkerTint(c) { c == null ? marker.clearTint() : marker.setTint(c); },
    destroy() { img.destroy(); marker.destroy(); },
  };
}

// Pop a feedback ribbon (PERFECT/CLEAN/GOOD/MISS/WILD) that rises and fades.
export function popFeedback(scene, x, y, kind) {
  const fb = uiFeedback(scene, x, y, kind).setScale(1.2);
  scene.tweens.add({ targets: fb, scale: 1.5, duration: 120, yoyo: true });
  scene.tweens.add({ targets: fb, y: y - 18, alpha: 0, delay: 320, duration: 380, onComplete: () => fb.destroy() });
  return fb;
}

// Map an engine judgment/word to a feedback ribbon kind.
export function ribbonKind(judgment) {
  const j = String(judgment).toLowerCase();
  if (/perfect/.test(j)) return 'perfect';
  if (/clean|great/.test(j)) return 'clean';
  if (/good|bite|hit/.test(j)) return 'good';
  if (/wild|over/.test(j)) return 'wild';
  return 'miss';
}

export { clamp01 };
