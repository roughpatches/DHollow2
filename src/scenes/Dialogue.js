import { TUNING, COLORS, hex } from '../../tuning.js';
import { setting } from '../settings.js';
import { buildTextures, portraitKey, PORTRAIT_PX } from '../textures.js';

// Runs alongside World. A line array, a box that reads it, and the speaker's face
// beside it — nothing else.
export default class Dialogue extends Phaser.Scene {
  constructor() {
    super('Dialogue');
  }

  create() {
    buildTextures(this);

    const m = TUNING.dialogueBoxMargin;
    const ps = TUNING.dialoguePortraitSize;
    const h = TUNING.dialogueBoxHeight;
    const top = this.scale.height - h - m;
    // the box gives up its left end to the portrait; everything in it starts from there
    const bx = m + ps + TUNING.dialoguePortraitGap;
    const w = this.scale.width - bx - m;

    this.box = this.add.graphics();
    this.box.fillStyle(COLORS.dialogueFill, 0.94);
    this.box.fillRect(bx, top, w, h);
    this.box.lineStyle(2, COLORS.dialogueEdge, 1);
    this.box.strokeRect(bx + 1, top + 1, w - 2, h - 2);

    this.nameText = this.add.text(bx + 18, top + 12, '', {
      fontFamily: 'monospace',
      fontSize: `${TUNING.dialogueNameSize}px`,
      color: hex(COLORS.dialogueName),
    });

    this.bodyText = this.add.text(bx + 18, top + 40, '', {
      fontFamily: 'monospace',
      fontSize: `${TUNING.dialogueFontSize}px`,
      color: hex(COLORS.dialogueText),
      wordWrap: { width: w - 36 },
      lineSpacing: 4,
    });

    this.hint = this.add.text(bx + w - 18, top + h - 26, '[E]', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: hex(COLORS.dialogueEdge),
    }).setOrigin(1, 0);

    // panel and face travel together, so the pop is one tween on one thing
    this.portraitY = top + h - ps;
    this.portrait = this.add.container(m, this.portraitY);
    const frame = this.add.graphics();
    frame.fillStyle(COLORS.portraitFill, 0.94);
    frame.fillRect(0, 0, ps, ps);
    frame.lineStyle(2, COLORS.dialogueEdge, 1);
    frame.strokeRect(1, 1, ps - 2, ps - 2);
    // whole multiples only: a portrait scaled 2.7x is a blurred portrait
    const scale = Math.max(1, Math.floor((ps - 8) / PORTRAIT_PX));
    this.face = this.add.image(ps / 2, ps / 2, portraitKey('player')).setScale(scale);
    this.portrait.add([frame, this.face]);

    this.group = [this.box, this.nameText, this.bodyText, this.hint, this.portrait];
    this.hide();

    this.input.keyboard.on('keydown-E', this.advance, this);
    this.input.keyboard.on('keydown-SPACE', this.advance, this);

    this.game.events.on('dialogue:start', this.open, this);
  }

  hide() {
    for (const o of this.group) o.setVisible(false);
    this.open_ = false;
  }

  open({ name, lines, portrait }) {
    this.lines = lines;
    this.index = 0;
    this.chars = 0;
    this.open_ = true;
    this.swallowKey = true; // the same keypress opened this; it must not also advance it
    for (const o of this.group) o.setVisible(true);
    this.hint.setVisible(setting('prompt'));
    this.nameText.setText(name);
    this.bodyText.setText('');
    this.showPortrait(portrait);
  }

  // a speaker with no portrait of their own leaves the panel out rather than
  // borrowing someone else's face
  showPortrait(palette) {
    const key = palette && portraitKey(palette);
    if (!key || !this.textures.exists(key)) {
      this.portrait.setVisible(false);
      return;
    }
    this.face.setTexture(key);
    this.tweens.killTweensOf(this.portrait);
    this.portrait.setY(this.portraitY + TUNING.dialoguePortraitRise).setAlpha(0);
    this.tweens.add({
      targets: this.portrait,
      y: this.portraitY,
      alpha: 1,
      duration: TUNING.dialoguePortraitPopMs,
      ease: 'Quad.Out',
    });
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
      const rate = TUNING.dialogueCharsPerSec * setting('text');
      this.chars = Math.min(line.length, this.chars + (rate * delta) / 1000);
      this.bodyText.setText(line.slice(0, Math.floor(this.chars)));
    }
  }
}
