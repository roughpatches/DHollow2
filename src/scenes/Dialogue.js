import { TUNING, COLORS, hex } from '../../tuning.js';
import { setting } from '../settings.js';
import { buildTextures, portraitKey } from '../textures.js';
import { fill } from '../party.js';
import { framed, padOf } from '../frames.js';
import { fitCamera, crispType } from '../view.js';

const BOX = 'parchment'; // talking happens in the town, so it happens on the town's paper
const FACE = 'plate';

// Runs alongside World. A line array, a box that reads it, and the speaker's face
// beside it — nothing else. The same box also puts a choice in front of the player:
// what they do rather than what they say, because the player has no voice.
export default class Dialogue extends Phaser.Scene {
  constructor() {
    super('Dialogue');
  }

  create() {
    fitCamera(this);
    crispType(this);
    buildTextures(this);

    const m = TUNING.dialogueBoxMargin;
    const ps = TUNING.dialoguePortraitSize;
    const h = TUNING.dialogueBoxHeight;
    const top = TUNING.viewHeight - h - m;
    this.metrics = { m, ps, h, top };

    // the panel is hung on the first line the box is opened with, not here: the sheet it
    // is cut from is still loading while this runs
    this.box = this.add.container();
    this.pad = padOf(BOX);

    this.nameText = this.add.text(0, top + 12, '', {
      fontFamily: TUNING.font,
      fontSize: `${TUNING.dialogueNameSize}px`,
      color: hex(COLORS.inkAccent),
    });

    this.bodyText = this.add.text(0, top + 40, '', {
      fontFamily: TUNING.font,
      fontSize: `${TUNING.dialogueFontSize}px`,
      color: hex(COLORS.inkText),
      lineSpacing: 4,
    });

    this.hint = this.add.text(0, top + h - 26, '[E]', {
      fontFamily: TUNING.font,
      fontSize: '14px',
      color: hex(COLORS.inkDim),
    }).setOrigin(1, 0);

    // panel and face travel together, so the pop is one tween on one thing
    this.portraitY = top + h - ps;
    this.portrait = this.add.container(m, this.portraitY);
    this.face = this.add.image(ps / 2, ps / 2, portraitKey('player'));
    this.fitFace();
    this.portrait.add(this.face);

    this.options = null; // the list, while a choice is up; null while a line is
    this.chose = null; // and which of them was taken, handed on as the box closes

    this.group = [this.box, this.nameText, this.bodyText, this.hint, this.portrait];
    this.hide();

    this.input.keyboard.on('keydown-E', this.advance, this);
    this.input.keyboard.on('keydown-SPACE', this.advance, this);
    this.input.keyboard.on('keydown', this.onKey, this);

    this.game.events.on('dialogue:start', this.open, this);
    this.game.events.on('choice:start', this.ask, this);
  }

  // With a face beside it the box gives up its left end; without one it takes the whole
  // width back, so a readout with no speaker doesn't leave a panel-shaped hole.
  layout(withPortrait) {
    const { m, ps, h, top } = this.metrics;
    const bx = withPortrait ? m + ps + TUNING.dialoguePortraitGap : m;
    const w = TUNING.viewWidth - bx - m;

    const pad = this.pad;
    this.box.removeAll(true);
    for (const o of framed(this, BOX, { x: bx, y: top, w, h })) this.box.add(o);

    // The face is set in the square off the same sheet, hung once and kept: it is the
    // same size every time, and it travels with the portrait rather than the box.
    if (!this.plate) {
      this.plate = this.add.container(0, 0);
      for (const o of framed(this, FACE, { x: 0, y: 0, w: ps, h: ps })) this.plate.add(o);
      this.portrait.addAt(this.plate, 0);
    }

    // in past the corner brackets, which reach further in than the rails do
    this.nameText.setX(bx + pad.l);
    this.bodyText.setX(bx + pad.l).setWordWrapWidth(w - pad.l - pad.r);
    this.hint.setX(bx + w - pad.r);
  }

  hide() {
    for (const o of this.group) o.setVisible(false);
    this.open_ = false;
    this.options = null;
  }

  open({ name, lines, portrait }) {
    this.lines = lines.map((l) => fill(l));
    this.index = 0;
    this.chars = 0;
    this.open_ = true;
    this.options = null;
    this.chose = null;
    this.swallowKey = true; // the same keypress opened this; it must not also advance it
    for (const o of this.group) o.setVisible(true);
    this.hint.setVisible(setting('prompt'));
    this.nameText.setText(fill(name));
    this.bodyText.setText('');
    this.showPortrait(portrait);
  }

  // A choice is the same box with nobody in it: no name, no face, and the options
  // listed where the line would be. It never types itself out — a list you are reading
  // to decide from is not a line somebody is saying to you.
  ask({ options }) {
    this.options = options.map((o) => fill(o));
    this.pick = 0;
    this.chose = null;
    this.open_ = true;
    this.swallowKey = true;
    for (const o of this.group) o.setVisible(true);
    this.hint.setVisible(setting('prompt'));
    this.nameText.setText('');
    this.showPortrait(null);
    this.drawOptions();
  }

  drawOptions() {
    this.bodyText.setText(this.options
      .map((o, i) => `${i === this.pick ? '>' : ' '} ${o}`)
      .join('\n'));
  }

  onKey(ev) {
    if (!this.options || this.swallowKey || this.closing) return;
    const k = ev.key.toLowerCase();
    if (k === 'arrowup' || k === 'w') this.pick = (this.pick - 1 + this.options.length) % this.options.length;
    else if (k === 'arrowdown' || k === 's') this.pick = (this.pick + 1) % this.options.length;
    else return;
    this.drawOptions();
  }

  // A drawn placeholder is 40 pixels and a painted face is 128, and both have to sit in
  // the same panel. Whole multiples only on the way up — a portrait scaled 2.7× is a
  // blurred portrait — and down to fit if the art is bigger than the panel.
  fitFace() {
    const room = this.metrics.ps - 8;
    const px = this.face.frame.width;
    this.face.setScale(px > room ? room / px : Math.max(1, Math.floor(room / px)));
  }

  // a speaker with no portrait of their own leaves the panel out rather than
  // borrowing someone else's face
  showPortrait(palette) {
    const key = palette && portraitKey(palette);
    if (!key || !this.textures.exists(key)) {
      this.portrait.setVisible(false);
      this.layout(false);
      return;
    }
    this.layout(true);
    this.face.setTexture(key);
    this.fitFace();
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

    if (this.options) {
      this.chose = this.pick;
      this.closing = true;
      return;
    }

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
      const chose = this.chose;
      this.chose = null;
      this.hide();
      // a choice answers whoever asked it; a line answers World, which unfreezes on it
      if (chose === null) this.game.events.emit('dialogue:end');
      else this.game.events.emit('choice:end', chose);
      return;
    }
    if (!this.open_) return;
    this.swallowKey = false;
    if (this.options) return; // nothing types itself out; the list is already up

    const line = this.lines[this.index];
    if (this.chars < line.length) {
      const rate = TUNING.dialogueCharsPerSec * setting('text');
      this.chars = Math.min(line.length, this.chars + (rate * delta) / 1000);
      this.bodyText.setText(line.slice(0, Math.floor(this.chars)));
    }
  }
}
