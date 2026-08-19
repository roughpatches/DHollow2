// The grid a pack is read as, drawn the same way wherever a pack is shown: the town's
// shelves, the packing screen at the gate, and the square that will not take what is
// standing in front of it. One square is one stack — see stackMax in tuning.js — and an
// empty square is drawn as an empty square, because how much room is left is the thing a
// pack is looked at for.
//
// Everything a caller passes is geometry and content. Nothing here knows which screen it
// is on: the colours come in, and so does the function that makes a line of text, so the
// same grid sits on the town's parchment and on the road's ironwork without being told
// which is which.

import { TUNING, COLORS } from '../tuning.js';
import { iconKeyFor } from './icons.js';

// How many squares fit across a given width, and how many rows that makes.
export function shapeOf(width, count, cell = TUNING.menuIconCell) {
  const cols = Math.max(1, Math.floor(width / cell));
  return { cols, rows: Math.max(1, Math.ceil(count / cols)) };
}

// Draw one grid. `cells` is one entry per square — { id, n } for a stack, null for an
// empty one — and `sel` is which square the cursor is on, or -1 for a grid nobody is
// pointing at. Returns how far down the panel it reached, so a caller can write under it.
//
//   at       — { x, y, w } the grid is laid into.
//   cells    — the squares, in order.
//   sel      — the cursor, or -1.
//   text     — (x, y, str, size, colour) => Phaser text, the caller's own.
//   add      — what to put every object on: a container, usually the scene's layer.
//   ink      — (colour) => colour, so a grid on the road's ironwork reads as ironwork.
//   dimmed   — optional (cell, i) => true, for squares that are shown and cannot be taken.
export function drawSlots(scene, o) {
  const cell = o.cell || TUNING.menuIconCell;
  const px = o.iconPx || TUNING.menuIconPx;
  const ink = o.ink || ((c) => c);
  const { cols } = shapeOf(o.at.w, o.cells.length, cell);
  const rows = Math.ceil(o.cells.length / cols);

  for (let i = 0; i < o.cells.length; i++) {
    const c = o.cells[i];
    const x = o.at.x + (i % cols) * cell;
    const y = o.at.y + Math.floor(i / cols) * cell;
    const on = i === o.sel;
    const dim = o.dimmed ? o.dimmed(c, i) : false;

    const g = scene.add.graphics();
    // An empty square is the same square with nothing in it: the grid is the readout, so
    // it is drawn whether or not there is anything to put in it.
    g.fillStyle(ink(on ? COLORS.menuSelectFill : COLORS.menuFill), c ? 1 : 0.45);
    g.fillRect(x + 2, y + 2, cell - 4, cell - 4);
    g.lineStyle(1, ink(on ? COLORS.menuAccent : COLORS.menuRule), c ? 1 : 0.6);
    g.strokeRect(x + 2, y + 2, cell - 4, cell - 4);
    o.add(g);
    if (!c) continue;

    const icon = scene.add.image(x + cell / 2, y + 6 + px / 2, iconKeyFor(c.id));
    icon.setDisplaySize(px, px);
    if (dim) icon.setAlpha(0.4);
    o.add(icon);

    // The count sits under the icon rather than across it, and a square filled to the top
    // says so in the accent: a full stack is the one that costs the next square. A cell
    // carrying its own `note` says that instead — some things in a pack are a length of
    // rope rather than a number of anything.
    const full = c.n >= TUNING.stackMax;
    const said = c.note ?? `${c.n}`;
    if (said) {
      o.text(x + cell - 8, y + cell - 20, said, TUNING.menuHintSize,
        on ? COLORS.menuAccent : full ? COLORS.menuMapMark : COLORS.menuDim).setOrigin(1, 0);
    }
  }
  return o.at.y + rows * cell;
}
