import { TUNING, COLORS, hex } from '../../tuning.js';
import { CHARACTER, EQUIPMENT, INVENTORY, COMPANIONS } from '../../content/character.js';
import { BESTIARY, QUESTS } from '../../content/codex.js';

// Runs alongside World, hidden until M. Every tab is the same list-and-detail view
// over the same {label, note, body} shape, so adding a tab is one line here and one
// array in content/ — there is no per-tab drawing code to keep in step.
const TABS = [
  ['Equipment', EQUIPMENT],
  ['Character', CHARACTER],
  ['Companions', COMPANIONS],
  ['Inventory', INVENTORY],
  ['Bestiary', BESTIARY],
  ['Quest Log', QUESTS],
];

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
      x += t.width + 26;
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
        rows[i].note,
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
    if (entry.note) {
      y += this.text(this.detailX, y, entry.note, TUNING.menuRowSize, COLORS.menuDim).height + 6;
    }

    const g = this.add.graphics();
    g.lineStyle(1, COLORS.menuRule, 1);
    g.lineBetween(this.detailX, y + 4, this.detailX + this.detailW, y + 4);
    this.layer.add(g);
    y += 18;

    for (const para of entry.body) {
      const t = this.text(this.detailX, y, para, TUNING.menuBodySize, COLORS.menuText, this.detailW);
      y += t.height + 14;
    }
  }

  hint() {
    this.text(
      this.listX,
      this.box.y + this.box.h - 26,
      '[<-/->] Tab    [Up/Down] Select    [M] or [Esc] Close',
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
