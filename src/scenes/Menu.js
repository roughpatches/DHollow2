import { TUNING, COLORS, hex } from '../../tuning.js';
import { MAPS, LEGEND } from '../../content/maps.js';
import { NPCS } from '../../content/npcs.js';
import { CHARACTER, EQUIPMENT, INVENTORY, COMPANIONS } from '../../content/character.js';
import { BESTIARY, QUESTS } from '../../content/codex.js';
import { PLACES } from '../../content/places.js';
import { SETTINGS } from '../../content/settings.js';
import { option, setting, cycleSetting, applyToWorld } from '../settings.js';
import { SCRIPT } from '../placeholders.js';

// Runs alongside World, hidden until M. Every tab is the same list-and-detail view
// over the same {label, note, body} shape, so adding a tab is one line here and one
// array in content/. An entry carrying a `map` also gets that grid drawn above its
// text — the one thing a list of paragraphs cannot say — and one carrying `options`
// becomes a setting the player cycles with Enter. Script is the one derived tab: it is
// scanned out of the others rather than written, and lists every line still unwritten.
const TABS = [
  ['Equipment', EQUIPMENT],
  ['Character', CHARACTER],
  ['Companions', COMPANIONS],
  ['Inventory', INVENTORY],
  ['Bestiary', BESTIARY],
  ['Quest Log', QUESTS],
  ['Map', PLACES],
  ['Script', SCRIPT],
  ['Settings', SETTINGS],
];

// a setting's right-hand column is whichever option it is currently on
function noteOf(entry) {
  return entry.options ? option(entry.id).name : entry.note;
}

const EMPTY = { label: '—', note: '', body: ['Nothing recorded yet.'] };

export default class Menu extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const m = TUNING.menuMargin;
    const p = TUNING.menuPad;
    this.box = { x: m, y: m, w: this.scale.width - m * 2, h: this.scale.height - m * 2 };
    this.listX = this.box.x + p;
    this.detailX = this.listX + TUNING.menuListWidth + p;
    this.detailW = this.box.x + this.box.w - p - this.detailX;
    this.bodyY = this.box.y + TUNING.menuTabStripHeight + p;

    // each tab keeps its own cursor, so tabbing away and back lands where you left
    this.tab = 0;
    this.row = TABS.map(() => 0);
    this.top = TABS.map(() => 0);

    this.layer = this.add.container().setDepth(30000).setVisible(false);
    this.open_ = false;

    this.input.keyboard.on('keydown', this.onKey, this);
  }

  onKey(ev) {
    const k = ev.key.toLowerCase();

    if (k === 'm') {
      this.toggle();
      return;
    }
    if (!this.open_) return;

    if (k === 'escape') this.close();
    else if (k === 'arrowleft' || k === 'a') this.step('tab', -1);
    else if (k === 'arrowright' || k === 'd') this.step('tab', 1);
    else if (k === 'arrowup' || k === 'w') this.step('row', -1);
    else if (k === 'arrowdown' || k === 's') this.step('row', 1);
    else if (k === 'enter' || k === ' ') this.change();
  }

  // left and right already belong to the tab strip, so a setting cycles forward on
  // Enter rather than being nudged along an axis
  change() {
    const entry = this.rows()[this.row[this.tab]];
    if (!entry || !entry.options) return;
    cycleSetting(entry.id);
    applyToWorld(this.scene.get('World'));
    this.draw();
  }

  toggle() {
    if (this.open_) {
      this.close();
      return;
    }
    // World is frozen during dialogue and door transitions; the menu does not
    // interrupt either, and would have nothing to unfreeze on the way out
    if (this.scene.get('World').frozen) return;
    this.open_ = true;
    this.layer.setVisible(true);
    this.draw();
    this.game.events.emit('menu:open');
  }

  close() {
    this.open_ = false;
    this.layer.setVisible(false);
    this.game.events.emit('menu:close');
  }

  step(what, dir) {
    if (what === 'tab') {
      this.tab = (this.tab + dir + TABS.length) % TABS.length;
    } else {
      const n = this.rows().length;
      if (n) this.row[this.tab] = (this.row[this.tab] + dir + n) % n;
    }
    this.draw();
  }

  rows() {
    return TABS[this.tab][1];
  }

  draw() {
    this.layer.removeAll(true);
    this.panel();
    this.tabStrip();
    this.list();
    this.detail();
    this.hint();
  }

  // --- pieces -------------------------------------------------------------

  panel() {
    const b = this.box;
    const g = this.add.graphics();
    g.fillStyle(COLORS.menuFill, 0.97);
    g.fillRect(b.x, b.y, b.w, b.h);
    g.fillStyle(COLORS.menuPanel, 1);
    g.fillRect(this.listX - 8, this.bodyY - 10, TUNING.menuListWidth + 8, b.y + b.h - this.bodyY - 34);
    g.lineStyle(2, COLORS.menuEdge, 1);
    g.strokeRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2);
    g.lineStyle(1, COLORS.menuRule, 1);
    g.lineBetween(b.x + 1, b.y + TUNING.menuTabStripHeight, b.x + b.w - 1, b.y + TUNING.menuTabStripHeight);
    this.layer.add(g);
  }

  tabStrip() {
    const y = this.box.y + 12;
    let x = this.listX;
    TABS.forEach(([name], i) => {
      const on = i === this.tab;
      const t = this.text(x, y, name, TUNING.menuTabSize, on ? COLORS.menuAccent : COLORS.menuDim);
      if (on) {
        const g = this.add.graphics();
        g.fillStyle(COLORS.menuAccent, 1);
        g.fillRect(x, y + t.height + 3, t.width, 2);
        this.layer.add(g);
      }
      x += t.width + TUNING.menuTabGap;
    });
  }

  list() {
    const rows = this.rows();
    const sel = this.row[this.tab];
    const h = TUNING.menuRowHeight;
    const visible = TUNING.menuRowsVisible;

    // scroll only as far as it takes to bring the cursor back into view
    let top = this.top[this.tab];
    if (sel < top) top = sel;
    if (sel >= top + visible) top = sel - visible + 1;
    top = Math.max(0, Math.min(top, Math.max(0, rows.length - visible)));
    this.top[this.tab] = top;

    for (let i = top; i < Math.min(rows.length, top + visible); i++) {
      const y = this.bodyY + (i - top) * h;
      const on = i === sel;

      if (on) {
        const g = this.add.graphics();
        g.fillStyle(COLORS.menuSelectFill, 1);
        g.fillRect(this.listX - 8, y - 3, TUNING.menuListWidth + 8, h);
        g.fillStyle(COLORS.menuAccent, 1);
        g.fillRect(this.listX - 8, y - 3, 2, h);
        this.layer.add(g);
      }

      const note = this.text(
        this.listX + TUNING.menuListWidth - 12,
        y,
        noteOf(rows[i]),
        TUNING.menuRowSize,
        on ? COLORS.menuAccent : COLORS.menuRule,
      ).setOrigin(1, 0);

      const label = this.text(
        this.listX + 4,
        y,
        rows[i].label,
        TUNING.menuRowSize,
        on ? COLORS.menuText : COLORS.menuDim,
      );
      // the note is the thing you scan the column for, so a long label loses its tail
      // rather than being written over the top of it
      const room = TUNING.menuListWidth - 28 - note.width;
      while (label.width > room && label.text.length > 2) {
        label.setText(`${label.text.slice(0, -2)}…`);
      }
    }

    if (rows.length > visible) {
      this.text(
        this.listX + 4,
        this.bodyY + visible * h + 6,
        `${sel + 1} / ${rows.length}`,
        TUNING.menuHintSize,
        COLORS.menuDim,
      );
    }
  }

  detail() {
    const entry = this.rows()[this.row[this.tab]] || EMPTY;
    let y = this.bodyY - 6;

    y += this.text(this.detailX, y, entry.label, TUNING.menuTitleSize, COLORS.menuAccent).height + 4;
    const note = noteOf(entry);
    if (note) {
      y += this.text(this.detailX, y, note, TUNING.menuRowSize, COLORS.menuDim).height + 6;
    }

    const g = this.add.graphics();
    g.lineStyle(1, COLORS.menuRule, 1);
    g.lineBetween(this.detailX, y + 4, this.detailX + this.detailW, y + 4);
    this.layer.add(g);
    y += 18;

    // the prose is measured first and the map takes whatever vertical room is left over,
    // so a long entry shrinks its map rather than running off the bottom of the panel
    const paras = entry.body.map((p) =>
      this.text(this.detailX, 0, p, TUNING.menuBodySize, COLORS.menuText, this.detailW));
    const proseH = paras.reduce((h, t) => h + t.height + 14, 0);

    if (entry.map) y = this.miniMap(entry, y, this.box.y + this.box.h - 44 - proseH - y) + 16;
    if (entry.options) y = this.choices(entry, y) + 20;

    for (const t of paras) {
      t.setY(y);
      y += t.height + 14;
    }
  }

  // Every option laid out at once, current one boxed, so the whole range of a setting
  // is visible without cycling through it to find out what is there.
  choices(entry, y) {
    const current = option(entry.id);
    const g = this.add.graphics();
    this.layer.add(g);

    let x = this.detailX;
    let bottom = y;
    for (const o of entry.options) {
      const on = o === current;
      const t = this.text(x + 8, y + 4, o.name, TUNING.menuRowSize, on ? COLORS.menuText : COLORS.menuDim);
      g.lineStyle(1, on ? COLORS.menuAccent : COLORS.menuRule, 1);
      g.strokeRect(x, y, t.width + 16, t.height + 8);
      x += t.width + 16 + 10;
      bottom = y + t.height + 8;
    }
    return bottom;
  }

  // The map is the world's own grid at a smaller size, drawn in the same tile colours,
  // so retinting tuning.js retints the map with it. Pins come from the live world rather
  // than from content/places.js: move an NPC or a door and the map follows on its own.
  miniMap(entry, y, room) {
    const map = MAPS[entry.map];
    const cols = map.rows[0].length;
    const rows = map.rows.length;
    const cell = Math.max(
      2,
      Math.min(
        TUNING.menuMapCell,
        Math.floor(this.detailW / cols),
        Math.floor(TUNING.menuMapHeight / rows),
        Math.floor((room - 22) / rows), // 22 leaves the key its line
      ),
    );
    const x0 = this.detailX;

    const g = this.add.graphics();
    for (let ty = 0; ty < rows; ty++) {
      for (let tx = 0; tx < cols; tx++) {
        g.fillStyle(COLORS[LEGEND[map.rows[ty][tx]]][0], 1);
        g.fillRect(x0 + tx * cell, y + ty * cell, cell, cell);
      }
    }
    g.lineStyle(1, COLORS.menuRule, 1);
    g.strokeRect(x0 - 1, y - 1, cols * cell + 2, rows * cell + 2);

    // grown pins read at a cell size of a few pixels, where a single tile does not
    const pin = (tx, ty, color, grow) => {
      g.fillStyle(color, 1);
      g.fillRect(x0 + tx * cell - grow, y + ty * cell - grow, cell + grow * 2, cell + grow * 2);
    };

    const pins = setting('pins');
    if (pins !== 'none') for (const d of map.doors) pin(d.x, d.y, COLORS.menuMapDoor, 0);
    if (pins === 'all') for (const n of NPCS) if (n.map === entry.map) pin(n.x, n.y, COLORS.menuMapFolk, 0);
    if (entry.at) pin(entry.at[0], entry.at[1], COLORS.menuMapMark, 1);

    const world = this.scene.get('World');
    if (world.mapKey === entry.map) {
      const TS = TUNING.tileSize;
      pin(Math.floor(world.player.x / TS), Math.floor((world.player.y - 1) / TS), COLORS.menuMapYou, 1);
    }
    this.layer.add(g);

    return y + rows * cell + 8 + this.key(x0, y + rows * cell + 8, entry).height;
  }

  key(x, y, entry) {
    const pins = setting('pins');
    const swatches = [[COLORS.menuMapYou, 'you']];
    if (pins !== 'none') swatches.push([COLORS.menuMapDoor, 'door']);
    if (pins === 'all') swatches.push([COLORS.menuMapFolk, 'folk']);
    if (entry.at) swatches.push([COLORS.menuMapMark, 'here']);

    const g = this.add.graphics();
    this.layer.add(g);
    let last = null;
    for (const [color, name] of swatches) {
      g.fillStyle(color, 1);
      g.fillRect(x, y + 3, 7, 7);
      last = this.text(x + 12, y, name, TUNING.menuHintSize, COLORS.menuDim);
      x += 12 + last.width + 16;
    }
    return last;
  }

  hint() {
    const change = this.rows().some((r) => r.options) ? '    [Enter] Change' : '';
    this.text(
      this.listX,
      this.box.y + this.box.h - 26,
      `[<-/->] Tab    [Up/Down] Select${change}    [M] or [Esc] Close`,
      TUNING.menuHintSize,
      COLORS.menuDim,
    );
  }

  text(x, y, str, size, color, wrap) {
    const t = this.add.text(x, y, str, {
      fontFamily: 'monospace',
      fontSize: `${size}px`,
      color: hex(color),
      lineSpacing: 4,
      ...(wrap ? { wordWrap: { width: wrap } } : {}),
    });
    this.layer.add(t);
    return t;
  }
}
