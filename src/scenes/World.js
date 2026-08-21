import { TUNING, COLORS, hex } from '../../tuning.js';
import { MAPS } from '../../content/maps.js';
import { NPCS } from '../../content/npcs.js';
import { buildTextures } from '../textures.js';
import {
  haltPlayer, createStreetPlayer, updateStreetPlayer, spawnStreetActor, cutBelow,
} from '../player.js';
import {
  preloadArt, buildArt, fitBody, stand, raiseStructures,
  raiseProps, restate, occasionalIdle, lookIn, faceFor,
} from '../art.js';
import { createStreet, coverPatch, focusNear, DEPTH } from '../street.js';
import { createFlicker } from '../ambient.js';
import { preloadFrames, buildFrames } from '../frames.js';
import { preloadIcons, buildIcons } from '../icons.js';
import { findTarget, faceToward } from '../interact.js';
import { linesOf } from '../placeholders.js';
import {
  isOpen, contribute, contributeLines, statusLines, remaining,
} from '../town.js';
import { worksAt } from '../craft.js';
import { applyToWorld } from '../settings.js';
import { SCENES, START } from '../../content/scenes.js';
import { play, hasPlayed, holdBack } from '../script.js';
import * as story from '../story.js';

const TS = TUNING.tileSize;

export default class World extends Phaser.Scene {
  constructor() {
    super('World');
  }

  // Whatever brought you here says where you come in; the game's own start says it when
  // nothing did — a boot, or a restart with nothing handed to it.
  init(data) {
    // Before anything is placed: a scene on hold is counted as played, so whoever it
    // would have moved is already moved when the map decides who is standing on it.
    for (const sc of SCENES) if (sc.hold) holdBack(sc);
    const from = data.map ? data : START;
    this.mapKey = from.map;
    this.spawnTile = from.spawn || MAPS[this.mapKey].spawn;
  }

  // the only files the game loads; everyone without art is drawn at boot instead
  preload() {
    preloadArt(this);
    preloadFrames(this);
    preloadIcons(this);
  }

  create() {
    buildTextures(this);
    buildArt(this);
    buildFrames(this);
    buildIcons(this);
    const map = MAPS[this.mapKey];
    this.street = map.street;
    this.buildStreet(map);

    this.npcs = [];
    this.taken = []; // whatever anybody has picked up off the painting; see takeUp()
    this.waiting = []; // and whoever is standing still between doing it; see idles()
    // `until` and `after` name a scene: someone can be on the strand only until the
    // opening has played, and in the house only once it has
    const here = NPCS.filter((n) => n.map === this.mapKey
      && !(n.until && hasPlayed(n.until))
      && !(n.after && !hasPlayed(n.after)));
    for (const def of here) {
      // somebody behind the bar is standing at the back of the room rather than out in
      // the aisle, and what shows of them is cut at the line they are standing behind
      const palette = lookIn(def.palette, map.indoors);
      const npc = spawnStreetActor(this, palette, def.x,
        def.behind ? this.sillY : this.groundY, def.facing || 'left', this.bodyPx);
      if (def.behind) cutBelow(npc, def.behind);
      // reaches further past the feet than the player's box, so you stop beside someone
      // rather than inside them
      fitBody(npc, 12, 20, 6);
      npc.body.setImmovable(true);
      npc.def = def;
      this.npcs.push(npc);
      // and the mug he takes off the bar, if he takes one
      if (def.takes) {
        this.taken.push({ npc, from: def.takes.from, patch: coverPatch(this, this.street.art, def.takes) });
      }
      // somebody whose idle is something they do now and then stands about between times
      if (occasionalIdle(palette, npc.facing)) {
        this.waiting.push({ npc, y: npc.y, cut: def.behind, next: 0 });
      }
      // A panel has one line on it and standing on that line is not a reason nobody can
      // get past you, so people are walked through rather than walked around.
      npc.setDepth(DEPTH.npc);
    }

    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.worldW, this.worldH);
    cam.setRoundPixels(true);
    applyToWorld(this);

    this.keys = this.input.keyboard.addKeys('up,down,left,right,w,a,s,d');
    // event-driven, not polled: a quick tap between two frames must not be lost
    this.input.keyboard.on('keydown-E', this.tryTalk, this);
    this.input.keyboard.on('keydown-SPACE', this.tryTalk, this);

    if (!this.scene.isActive('Dialogue')) this.scene.launch('Dialogue');
    if (!this.scene.isActive('Menu')) this.scene.launch('Menu');
    if (!this.scene.isActive('Quest')) this.scene.launch('Quest');
    if (!this.scene.isActive('Skills')) this.scene.launch('Skills');
    if (!this.scene.isActive('Craft')) this.scene.launch('Craft');
    if (!this.scene.isActive('Name')) this.scene.launch('Name');

    this.frozen = false;
    this.scripted = false;

    const unfreeze = () => {
      if (this.scripted) return; // a scene in progress keeps hold of the player
      this.frozen = false;
      haltPlayer(this.player);
    };
    const freeze = () => {
      this.frozen = true;
      haltPlayer(this.player);
    };
    const built = (id) => restate(this.built, id);
    const afterDialogue = () => {
      unfreeze();
      if (this.scripted) return;
      if (!this.pendingBoard) return;
      this.pendingBoard = false;
      this.game.events.emit('quest:board');
    };
    this.game.events.on('dialogue:end', afterDialogue);
    this.game.events.on('menu:open', freeze);
    this.game.events.on('menu:close', unfreeze);
    this.game.events.on('quest:open', freeze);
    this.game.events.on('quest:close', unfreeze);
    this.game.events.on('craft:close', unfreeze);
    // the character sheet, whether it is being filled in for the first time or a level's
    // points are being put somewhere
    this.game.events.on('skills:choose', freeze);
    this.game.events.on('skills:spend', freeze);
    this.game.events.on('skills:done', unfreeze);
    // a stage paid off at the bench changes the picture standing on the street, the same
    // as one paid off at the door
    this.game.events.on('craft:built', built, this);

    // the scenes still in the game play themselves the first time their map is walked
    // into, and never again
    const scene = SCENES.find((sc) => sc.map === this.mapKey && !hasPlayed(sc.id));
    if (scene) play(this, scene, scene.id);

    this.events.once('shutdown', () => {
      for (const a of this.ambient) a.destroy();
      this.game.events.off('dialogue:end', afterDialogue);
      this.game.events.off('menu:open', freeze);
      this.game.events.off('menu:close', unfreeze);
      this.game.events.off('quest:open', freeze);
      this.game.events.off('quest:close', unfreeze);
      this.game.events.off('craft:close', unfreeze);
      this.game.events.off('skills:choose', freeze);
      this.game.events.off('skills:spend', freeze);
      this.game.events.off('skills:done', unfreeze);
      this.game.events.off('craft:built', built, this);
    });
  }

  // A place: the painting, the line across it, and whatever stands on that line. There is
  // no grid anywhere in the game — nothing bakes tiles, cuts a seam or sets a collision.
  buildStreet(map) {
    const street = createStreet(this, map.street);
    this.groundY = street.ground; // where a person walks
    this.sillY = street.sill; // and where a building stands, which is further back
    this.bodyPx = street.body; // and how tall a person is drawn, which is the panel's own
    this.reachScale = street.body / TUNING.streetBodyPx; // and so how far an arm reaches
    this.worldW = street.width;
    this.worldH = street.height;
    this.ambient = street.ambient;
    this.physics.world.setBounds(0, 0, street.width, street.height);

    this.player = createStreetPlayer(this, this.spawnTile[0], street.ground, street.body,
      lookIn('player', map.indoors));
    this.player.setDepth(DEPTH.player);

    this.built = raiseStructures(this, this.mapKey);
    // whatever is standing about the town, and the flame in any of it that carries one
    const lit = raiseProps(this, this.mapKey);
    if (lit.length) this.ambient.push(createFlicker(lit));

    this.hint = this.add.text(0, 0, '', {
      fontFamily: TUNING.font,
      fontSize: `${TUNING.streetHintSize}px`,
      color: hex(COLORS.menuAccent),
      stroke: hex(COLORS.bg),
      strokeThickness: 3,
    }).setOrigin(0.5, 1).setDepth(DEPTH.hint).setVisible(false);
  }

  // A panel sorts by layer, not by feet: nobody on it is ever further up the road than
  // anybody else, so the depths set when they were placed are the last word.
  update(time, delta) {
    if (this.frozen) this.player.body.setVelocity(0, 0);
    else {
      updateStreetPlayer(this.player, this.keys);
      this.checkEdges();
    }
    // the chimneys go on smoking and the water goes on catching the light whether or not
    // the player is doing anything, and whether or not the game is frozen behind a panel:
    // it is weather rather than a thing anybody is waiting on
    for (const a of this.ambient) a.update(delta);
    this.showHint();
    this.idles();
    this.takeUp();
  }

  // A street is a panel, not a stretch of something longer: walk into the end of one and
  // the next one is what is on the screen, standing you a tile inside it. Walking into the
  // end is what the world bounds already say — no distance to guess at, and no way to be
  // stopped by the edge of a panel that has somewhere to be.
  checkEdges() {
    const edges = this.street.edges;
    if (!edges) return;
    const stopped = this.player.body.blocked;
    if (edges.right && stopped.right) this.toPanel(edges.right, 'left');
    else if (edges.left && stopped.left) this.toPanel(edges.left, 'right');
  }

  toPanel(to, side) {
    const s = MAPS[to].street;
    const last = (s.size[0] * s.repeats) / TS - 1;
    this.scene.restart({ map: to, spawn: [side === 'left' ? 1 : last - 1] });
  }

  // The name of whatever is within reach, written over the player's head. A painted street
  // has its doors painted into it, and without this the only way to find one would be to
  // walk the length of the town pressing [E].
  showHint() {
    if (this.frozen) {
      this.hint.setVisible(false);
      return;
    }
    const npc = findTarget(this.player, this.npcs, this.reachScale);
    const focus = npc ? null : focusNear(this.mapKey, this.player.x, this.reachScale);
    const name = npc ? npc.def.name : (focus && focus.name);
    this.hint.setVisible(!!name);
    if (!name) return;
    this.hint.setText(`${name}   [E]`);
    this.hint.setPosition(
      Math.round(this.player.x),
      Math.round(this.player.y - this.player.displayHeight * this.player.originY
        - TUNING.streetHintRise),
    );
  }

  // Somebody whose idle is something they do now and then — polishing a glass, say —
  // stands still between one run of it and the next, and breathes while they stand: a
  // pixel of rise and fall, rounded, which is the two-frame breath a pixel artist would
  // have drawn. The wait is counted from the end of a run rather than the start of it, so
  // `every` in content/looks.js is the standing about rather than the whole cycle, and it
  // is rolled again each time so a room of them does not fall into step.
  // Whatever they are standing behind is cut again as they move, because the bar does not
  // breathe with them.
  idles() {
    const rise = Math.sin((this.time.now / TUNING.streetBreathMs) * Math.PI * 2) * 0.5 + 0.5;
    const up = Math.round(rise * TUNING.streetBreathPx);
    for (const w of this.waiting) {
      const idle = occasionalIdle(w.npc.palette, w.npc.facing);
      if (w.npc.anims.isPlaying) w.next = 0; // still at it; the clock starts when it stops
      else if (!w.next) w.next = this.time.now + idle.every[0] + Math.random() * (idle.every[1] - idle.every[0]);
      else if (this.time.now >= w.next) w.npc.anims.play(idle.key);
      w.npc.y = w.y - (w.npc.anims.isPlaying ? 0 : up);
      if (w.cut) cutBelow(w.npc, w.cut);
    }
  }

  // The glass he polishes is one off his own bar. From the frame of his idle he has hold
  // of it, the mug painted on the counter is covered over, so the bar is a mug short for
  // as long as he is holding one — and back on it the moment he is standing there empty
  // handed again.
  takeUp() {
    for (const t of this.taken) {
      const frame = t.npc.anims.currentFrame;
      t.patch.setVisible(t.npc.anims.isPlaying && !!frame && frame.index - 1 >= t.from);
    }
  }

  tryTalk() {
    if (this.frozen) return;
    const npc = findTarget(this.player, this.npcs, this.reachScale);
    if (npc) {
      npc.facing = faceToward(npc, this.player);
      stand(npc, npc.palette, npc.facing);
      // the quest giver's board opens as soon as he has finished speaking
      this.pendingBoard = !!npc.def.quests;
      // somebody with `says` has more than one answer; the first that fits is the one
      // they give, and giving it is what raises its flag
      const answer = (npc.def.says || []).find((a) => story.ok(a));
      if (answer) story.set(answer.sets);
      const lines = answer ? answer.lines : linesOf(npc.def);
      // a face of their own if the def names one, otherwise the look they are wearing
      // here — which indoors is the indoor one, and its own face with it
      this.say(npc.def.name, lines, npc.def.portrait || faceFor(npc.palette, npc.def.palette));
      return;
    }
    const focus = focusNear(this.mapKey, this.player.x, this.reachScale);
    if (focus) this.reach(focus);
  }

  // What [E] does at a landmark on a street. A building still wanting materials takes what
  // you are carrying; one that is finished and has an inside opens; a plain door just
  // opens. Which of those a place is, is its repair state and nothing else.
  reach(focus) {
    if (focus.kind === 'door') {
      this.enter(focus.door.to, focus.door.spawn);
      return;
    }
    const b = focus.building;
    // A workstation rebuilt far enough to work is a bench: standing at it opens what can
    // be made there, and whatever the stage above still wants is the first row on that
    // list. Everything else in town is repaired where it stands.
    if (worksAt(b.id)) {
      this.atBench(b);
      return;
    }
    if (remaining(b.id)) {
      this.workOn(b);
      return;
    }
    if (b.enter && isOpen(b.id)) this.enter(b.enter);
    else this.say(b.name, statusLines(b.id), null);
  }

  atBench(b) {
    haltPlayer(this.player);
    this.frozen = true;
    this.game.events.emit('craft:open', b.id);
  }

  enter(to, spawn) {
    this.scene.restart({ map: to, spawn: spawn || MAPS[to].spawn });
  }

  say(name, lines, portrait) {
    haltPlayer(this.player);
    this.frozen = true;
    this.game.events.emit('dialogue:start', { name, lines, portrait });
  }

  workOn(b) {
    if (!remaining(b.id)) {
      this.say(b.name, statusLines(b.id), null);
      return;
    }
    const result = contribute(b.id);
    // a panel has no tiles for a stage to lay down; the picture is the whole of it
    if (result.levelled) restate(this.built, b.id);
    this.say(b.name, contributeLines(b.id, result), null);
  }

}
