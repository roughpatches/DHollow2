import { TUNING, COLORS } from '../../tuning.js';

// Runs alongside World. A line array and a box that reads it — nothing else.
export default class Dialogue extends Phaser.Scene {
  constructor() {
    super('Dialogue');
  }

  create() {
    const m = TUNING.dialogueBoxMargin;
    const w = this.scale.width - m * 2;
    const h = TUNING.dialogueBoxHeight;
    const top = this.scale.height - h - m;

    this.box = this.add.graphics();
    this.box.fillStyle(COLORS.dialogueFill, 0.94);
    this.box.fillRect(m, top, w, h);
    this.box.lineStyle(2, COLORS.dialogueEdge, 1);
    this.box.strokeRect(m + 1, top + 1, w - 2, h - 2);

    this.nameText = this.add.text(m + 18, top + 12, '', {
      fontFamily: 'monospace',
      fontSize: `${TUNING.dialogueNameSize}px`,
      color: hex(COLORS.dialogueName),
    });

    this.bodyText = this.add.text(m + 18, top + 40, '', {
      fontFamily: 'monospace',
      fontSize: `${TUNING.dialogueFontSize}px`,
      color: hex(COLORS.dialogueText),
      wordWrap: { width: w - 36 },
      lineSpacing: 4,
    });

    this.hint = this.add.text(m + w - 18, top + h - 26, '[E]', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: hex(COLORS.dialogueEdge),
    }).setOrigin(1, 0);

    this.group = [this.box, this.nameText, this.bodyText, this.hint];
    this.hide();

    this.input.keyboard.on('keydown-E', this.advance, this);
    this.input.keyboard.on('keydown-SPACE', this.advance, this);

    this.game.events.on('dialogue:start', this.open, this);
  }

  hide() {
    for (const o of this.group) o.setVisible(false);
    this.open_ = false;
  }

  open({ name, lines }) {
    this.lines = lines;
    this.index = 0;
    this.chars = 0;
    this.open_ = true;
    this.swallowKey = true; // the same keypress opened this; it must not also advance it
    for (const o of this.group) o.setVisible(true);
    this.nameText.setText(name);
    this.bodyText.setText('');
  }

  advance() {
    if (!this.open_ || this.swallowKey || this.closing) return;
    const line = this.lines[this.index];

    if (this.chars < line.length) {
      this.chars = line.length;
      this.bodyText.setText(line);
    } else if (this.index < this.lines.length - 1) {
      this.index += 1;
      this.chars = 0;
      this.bodyText.setText('');
    } else {
      // closing on the next frame, not here: World unfreezes on dialogue:end, and the
      // key event that closed us is still being dispatched to it
      this.closing = true;
    }
  }

  update(time, delta) {
    if (this.closing) {
      this.closing = false;
      this.hide();
      this.game.events.emit('dialogue:end');
      return;
    }
    if (!this.open_) return;
    this.swallowKey = false;

    const line = this.lines[this.index];
    if (this.chars < line.length) {
      this.chars = Math.min(line.length, this.chars + (TUNING.dialogueCharsPerSec * delta) / 1000);
      this.bodyText.setText(line.slice(0, Math.floor(this.chars)));
    }
  }
}

function hex(n) {
  return `#${n.toString(16).padStart(6, '0')}`;
}
