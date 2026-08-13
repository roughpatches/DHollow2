import { TUNING, COLORS, hex } from '../../tuning.js';
import { setName, YOU } from '../party.js';

// The one thing about the player the game cannot know at boot. Aldis asks, this opens
// over the hut scene, and the scene waits on it the same way it waits on the skill
// sheet. Typed once and never again; everything that shows a name reads it back through
// party.nameOf.
export default class Name extends Phaser.Scene {
  constructor() {
    super('Name');
  }

  create() {
    const p = TUNING.questPad;
    this.box = {
      x: p * 3,
      y: this.scale.height / 2 - 90,
      w: this.scale.width - p * 6,
      h: 180,
    };
    this.left = this.box.x + TUNING.menuPad;
    this.wide = this.box.w - TUNING.menuPad * 2;

    this.layer = this.add.container().setDepth(29600).setVisible(false);
    this.open_ = false;
    this.typed = '';
    this.caret = true;

    this.input.keyboard.on('keydown', this.onKey, this);
    this.game.events.on('name:choose', this.open, this);
  }

  open() {
    if (this.open_) return;
    this.typed = '';
    this.open_ = true;
    this.swallow = true; // the keypress that closed Aldis's line must not type into this
    this.caret = true;
    this.blink = this.time.addEvent({
      delay: TUNING.nameCaretBlinkMs,
      loop: true,
      callback: () => {
        this.caret = !this.caret;
        this.draw();
      },
    });
    this.layer.setVisible(true);
    this.draw();
  }

  update() {
    this.swallow = false;
  }

  // A name is letters, spaces, and the punctuation a name is allowed: no digits, no
  // symbols, nothing that would read as a command in a line of somebody else's dialogue.
  onKey(ev) {
    if (!this.open_ || this.swallow) return;
    const k = ev.key;

    if (k === 'Backspace') this.typed = this.typed.slice(0, -1);
    else if (k === 'Enter') {
      if (!this.typed.trim()) return;
      setName(YOU, this.typed);
      this.close();
      return;
    } else if (k.length === 1 && /[\p{L}\p{M} '-]/u.test(k)
      && this.typed.length < TUNING.nameMaxLength) {
      this.typed += k;
    }
    this.draw();
  }

  close() {
    this.open_ = false;
    this.blink.remove();
    this.layer.setVisible(false);
    this.game.events.emit('name:done');
  }

  draw() {
    this.layer.removeAll(true);
    this.panel();

    let y = this.box.y + TUNING.menuPad;
    y += this.text(this.left, y, 'What they call you', TUNING.questTitleSize, COLORS.menuAccent).height + 6;
    y += this.text(this.left, y, 'It comes before anything else does.',
      TUNING.questBodySize, COLORS.menuDim).height + 16;

    const ready = !!this.typed.trim();
    this.text(this.left, y, `${this.typed}${this.caret ? '_' : ' '}`,
      TUNING.questTitleSize, ready ? COLORS.menuText : COLORS.menuDim);

    this.text(this.left, this.box.y + this.box.h - 26,
      ready ? '[Enter] That is your name' : 'Type it.', TUNING.questHintSize, COLORS.menuDim);
  }

  // --- bits ------------------------------------------------------------------

  panel() {
    const b = this.box;
    const g = this.add.graphics();
    g.fillStyle(COLORS.menuFill, 0.98);
    g.fillRect(b.x, b.y, b.w, b.h);
    g.lineStyle(2, COLORS.menuEdge, 1);
    g.strokeRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2);
    this.layer.add(g);
  }

  text(x, y, str, size, color) {
    const t = this.add.text(x, y, str, {
      fontFamily: TUNING.font,
      fontSize: `${size}px`,
      color: hex(color),
      lineSpacing: 4,
    });
    this.layer.add(t);
    return t;
  }
}
