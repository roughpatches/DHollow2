// How big the game is actually drawn, as against how big it lays itself out.
//
// The game is written against TUNING.viewWidth by viewHeight and always will be: every
// panel, every margin and every font size in tuning.js is a number of those pixels. What
// changed here is the canvas underneath. It used to be built at that size and blown up by
// the browser to fill the window, which is fine for a painting — a pixel becomes one and a
// bit pixels, unevenly, and that is the cost of filling a screen at this drawing size.
//
// It is not fine for lettering. A line of text was baked into fourteen pixels of canvas
// however big the window was, and then those fourteen pixels were chunked up: the strokes
// of a serif face came out ragged and there was nothing to be done about it at that size,
// because the detail was never drawn in the first place.
//
// So the canvas is built at the size it is shown at, and the enlargement is carried by the
// cameras instead. The pictures are scaled exactly as much as they were and look the same.
// The lettering is baked at the screen's own resolution and comes out clean.

import { TUNING } from '../tuning.js';

// How much bigger than its drawing size this window can show the game. Read once, at boot:
// a window resized afterwards is fitted by the browser the way the whole game used to be,
// which is the old behaviour and is what it looked like until the page is loaded again.
export const MAGNIFY = (() => {
  const box = document.getElementById('game');
  return Math.max(1, Math.min(box.clientWidth / TUNING.viewWidth,
    box.clientHeight / TUNING.viewHeight));
})();

// and so how big the canvas is built. Nothing inside the game reads this: everything is
// laid out against TUNING.viewWidth and viewHeight, and the camera does the rest.
export const CANVAS = {
  width: Math.round(TUNING.viewWidth * MAGNIFY),
  height: Math.round(TUNING.viewHeight * MAGNIFY),
};

// A scene's camera, carrying the enlargement. `zoom` is whatever the scene wanted before
// any of this — 1 for a screen that draws in view pixels, the street's own zoom for the
// town — and it comes back multiplied. Centred on the drawing rectangle, so a screen that
// draws from 0,0 to viewWidth,viewHeight still fills the canvas.
export function fitCamera(scene, zoom = 1) {
  const cam = scene.cameras.main;
  cam.setZoom(zoom * MAGNIFY);
  cam.centerOn(TUNING.viewWidth / 2, TUNING.viewHeight / 2);
  return cam;
}

// Every line of type in the game, baked at the resolution it is shown at.
//
// It is done by wrapping the scene's own text factory rather than at the fifty-odd places
// that ask for a line, because sixteen of those are inside imported activity engines that
// know nothing about any of this and should not have to. A scene calls this once and every
// line it or anything running inside it draws is baked right, for ever.
//
// `zoom` is the same one the scene handed fitCamera, so a line is baked at exactly the
// size it is drawn and its own pixels land on the screen's. Filtered smooth rather than
// square, because that is a promise this cannot always keep — the town's camera is zoomed
// again by the player's own View setting, and a line baked for one zoom and drawn at
// another should go soft rather than go ragged, which is the thing being fixed.
export function crispType(scene, zoom = 1) {
  if (scene.add.crisped) return; // a scene is created again on every restart; its factory is not
  scene.add.crisped = true;
  const plain = scene.add.text.bind(scene.add);
  scene.add.text = (x, y, content, style) => {
    const t = plain(x, y, content, { ...style, resolution: zoom * MAGNIFY });
    t.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    return t;
  };
}
