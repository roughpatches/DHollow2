import { TUNING, COLORS, hex } from '../../tuning.js';
import { MAPS, TILES, LEGEND } from '../../content/maps.js';
import { NPCS } from '../../content/npcs.js';
import { buildTextures } from '../textures.js';
import {
  createPlayer, updatePlayer, haltPlayer, spawnActor,
  createStreetPlayer, updateStreetPlayer, spawnStreetActor,
} from '../player.js';
import {
  preloadArt, buildArt, bakeTiles, slotFor, seamFor, fitBody, stand, raiseStructures,
  raiseProps, restate,
} from '../art.js';
import { createStreet, focusNear, DEPTH } from '../street.js';
import { preloadFrames, buildFrames } from '../frames.js';
import { preloadIcons, buildIcons } from '../icons.js';
import { findTarget, faceToward } from '../interact.js';
import { linesOf } from '../placeholders.js';
import {
  siteAt, isOpen, patchesFor, patchOf, levelOf, contribute, contributeLines, statusLines, remaining,
} from '../town.js';
import { applyToWorld } from '../settings.js';
import { SCENES, OPENING } from '../../content/scenes.js';
import { play, hasPlayed } from '../script.js';
import * as story from '../story.js';

const TS = TUNING.tileSize;

export default class World extends Phaser.Scene {
  constructor() {
    super('World');
  }

  init(data) {
    this.mapKey = data.map || OPENING.map;
    this.spawnTile = data.spawn || MAPS[this.mapKey].spawn;
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
    bakeTiles(this);
    const map = MAPS[this.mapKey];
    // Two kinds of place, one scene: a grid you walk around, and a street you walk along.
    // Everything past this point — who is standing here, what the camera does, what a
    // conversation is — is the same either way.
    this.street = map.street || null;
    if (this.street) this.buildStreet(map);
    else this.buildGrid(map);

    this.npcs = [];
    // `until` and `after` name a scene: someone can be on the strand only until the
    // opening has played, and in the house only once it has
    const here = NPCS.filter((n) => n.map === this.mapKey
      && !(n.until && hasPlayed(n.until))
      && !(n.after && !hasPlayed(n.after)));
    for (const def of here) {
      const npc = this.street
        ? spawnStreetActor(this, def.palette, def.x, this.groundY, def.facing || 'left')
        : spawnActor(this, def.palette, def.x, def.y, def.facing || 'down');
      // reaches further past the feet than the player's box, so you stop beside someone
      // rather than inside them
      fitBody(npc, 12, 20, 6);
      npc.body.setImmovable(true);
      npc.def = def;
      this.npcs.push(npc);
      // A street has one line on it and standing on that line is not a reason nobody can
      // get past you, so people on a street are walked through rather than walked around.
      if (this.street) npc.setDepth(DEPTH.npc);
      else this.physics.add.collider(this.player, npc);
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
    if (!this.scene.isActive('Name')) this.scene.launch('Name');

    this.frozen = false;
    this.doorLocked = true; // cleared once the player steps off the tile they spawned on
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

    // the opening plays itself the first time its map is walked into, and never again
    const scene = SCENES.find((sc) => sc.map === this.mapKey && !hasPlayed(sc.id));
    if (scene) play(this, scene, scene.id);

    this.events.once('shutdown', () => {
      this.game.events.off('dialogue:end', afterDialogue);
      this.game.events.off('menu:open', freeze);
      this.game.events.off('menu:close', unfreeze);
      this.game.events.off('quest:open', freeze);
      this.game.events.off('quest:close', unfreeze);
    });
  }

  // The town, seen from the side: the painting, the line across it, and whatever stands on
  // that line. No tiles, so nothing here bakes a grid, cuts a seam or sets a collision.
  buildStreet(map) {
    const street = createStreet(this, map.street);
    this.groundY = street.ground; // where a person walks
    this.sillY = street.sill; // and where a building stands, which is further back
    this.worldW = street.width;
    this.worldH = street.height;
    this.physics.world.setBounds(0, 0, street.width, street.height);

    this.player = createStreetPlayer(this, this.spawnTile[0], street.ground);
    this.player.setDepth(DEPTH.player);

    this.built = raiseStructures(this, this.mapKey);
    raiseProps(this, this.mapKey);

    this.hint = this.add.text(0, 0, '', {
      fontFamily: TUNING.font,
      fontSize: `${TUNING.streetHintSize}px`,
      color: hex(COLORS.menuAccent),
      stroke: hex(COLORS.bg),
      strokeThickness: 3,
    }).setOrigin(0.5, 1).setDepth(DEPTH.hint).setVisible(false);
  }

  buildGrid(map) {
    this.hint = null; // nothing is written over anybody's head on a grid
    const w = map.rows[0].length;
    const h = map.rows.length;

    // the map as written, then whatever state the town has got itself into on top of it
    const names = map.rows.map((row) => [...row].map((ch) => LEGEND[ch]));
    for (const [x, y, ch] of patchesFor(this.mapKey)) names[y][x] = LEGEND[ch];
    this.names = names; // what ground is where, so a seam can be worked out again later

    // Two grids from one: a tile with `above` also draws a second tile on a layer
    // over the actors, so you pass behind foliage instead of in front of it.
    const ground = [];
    const above = [];
    for (let y = 0; y < h; y++) {
      ground.push([]);
      above.push([]);
      for (let x = 0; x < w; x++) {
        const name = names[y][x];
        ground[y].push(slotFor(name, x, y));
        above[y].push(TILES[name].above ? slotFor(TILES[name].above, x, y) : -1);
      }
    }

    this.ground = this.buildLayer(ground, 0);
    this.above = this.buildLayer(above, 20000);

    // Seams: where two grounds meet, one tile painted with both of them, laid half a tile
    // up and left so it straddles the four squares its corners came from. A seam is only
    // ever drawn over the two grounds it is made of, so it changes nothing but the edge.
    const seams = [];
    for (let y = 0; y < h; y++) {
      seams.push([]);
      for (let x = 0; x < w; x++) seams[y].push(this.seamAt(x, y));
    }
    this.seams = this.buildLayer(seams, 1).setPosition(-TS / 2, -TS / 2);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (TILES[names[y][x]].solid) this.ground.getTileAt(x, y).setCollision(true);
      }
    }

    this.physics.world.setBounds(0, 0, w * TS, h * TS);
    this.worldW = w * TS;
    this.worldH = h * TS;

    this.player = createPlayer(this, this.spawnTile[0], this.spawnTile[1]);
    this.physics.add.collider(this.player, this.ground);

    // buildings with art stand over their tiles before anyone walks in front of them
    this.built = raiseStructures(this, this.mapKey);
    raiseProps(this, this.mapKey);
  }

  // The ground is drawn from tilePx-sized art and scaled down to a tile, so it is
  // sampled at the size it was painted rather than at the size it occupies.
  buildLayer(data, depth) {
    const P = TUNING.tilePx;
    const map = this.make.tilemap({ data, tileWidth: P, tileHeight: P });
    const tiles = map.addTilesetImage('tiles', 'tiles', P, P, 0, 0);
    return map.createLayer(0, tiles, 0, 0).setScale(TS / P).setDepth(depth);
  }

  update() {
    if (this.frozen) {
      this.player.body.setVelocity(0, 0);
    } else if (this.street) {
      updateStreetPlayer(this.player, this.keys);
    } else {
      updatePlayer(this.player, this.keys);
      this.checkDoors();
    }

    // A street sorts by layer, not by feet: nobody on it is ever further up the road than
    // anybody else, so the depths set when they were placed are the last word.
    if (this.street) {
      this.showHint();
      return;
    }
    this.player.setDepth(this.player.y);
    for (const npc of this.npcs) npc.setDepth(npc.y);
  }

  // The name of whatever is within reach, written over the player's head. A painted street
  // has its doors painted into it, and without this the only way to find one would be to
  // walk the length of the town pressing [E].
  showHint() {
    if (this.frozen) {
      this.hint.setVisible(false);
      return;
    }
    const npc = findTarget(this.player, this.npcs);
    const focus = npc ? null : focusNear(this.mapKey, this.player.x);
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

  tryTalk() {
    if (this.frozen) return;
    const npc = findTarget(this.player, this.npcs);
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
      // a face of their own if the def names one, otherwise the palette they walk in
      this.say(npc.def.name, lines, npc.def.portrait || npc.def.palette);
      return;
    }
    if (this.street) {
      const focus = focusNear(this.mapKey, this.player.x);
      if (focus) this.reach(focus);
      return;
    }
    const site = this.siteAhead();
    if (site) this.workOn(site);
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
    if (remaining(b.id)) {
      this.workOn(b);
      return;
    }
    if (b.enter && isOpen(b.id)) this.enter(b.enter);
    else this.say(b.name, statusLines(b.id), null);
  }

  enter(to, spawn) {
    this.scene.restart({ map: to, spawn: spawn || MAPS[to].spawn });
  }

  say(name, lines, portrait) {
    haltPlayer(this.player);
    this.frozen = true;
    this.game.events.emit('dialogue:start', { name, lines, portrait });
  }

  // the tile you are facing, or the one under your feet — a site with no door is
  // ground you can stand on, and standing on it should count as being there
  siteAhead() {
    const TS_ = TS;
    const here = [Math.floor(this.player.x / TS_), Math.floor((this.player.y - 1) / TS_)];
    const [dx, dy] = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[this.player.facing];
    return siteAt(this.mapKey, here[0] + dx, here[1] + dy) || siteAt(this.mapKey, here[0], here[1]);
  }

  workOn(b) {
    if (!remaining(b.id)) {
      this.say(b.name, statusLines(b.id), null);
      return;
    }
    const before = levelOf(b.id);
    const result = contribute(b.id);
    if (result.levelled) {
      // a street has no tiles for a stage to lay down; the picture is the whole of it
      if (!this.street) this.applyPatch(patchOf(b.id, before + 1));
      restate(this.built, b.id); // and the building itself changes where it stands
    }
    this.say(b.name, contributeLines(b.id, result), null);
  }

  // the tile for the corner northwest of this square, from the four grounds around it
  seamAt(x, y) {
    if (x === 0 || y === 0) return -1;
    return seamFor(this.names[y - 1][x - 1], this.names[y - 1][x],
      this.names[y][x - 1], this.names[y][x]);
  }

  // a stage's tiles go down without rebuilding the map, so the town changes under you
  applyPatch(patch) {
    for (const [x, y, ch] of patch) {
      const name = LEGEND[ch];
      this.names[y][x] = name;
      this.ground.putTileAt(slotFor(name, x, y), x, y).setCollision(!!TILES[name].solid);
      this.above.putTileAt(TILES[name].above ? slotFor(TILES[name].above, x, y) : -1, x, y);
    }
    // a square that changed is a corner of four seams, and all four are now wrong
    for (const [x, y] of patch) {
      for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
        const [sx, sy] = [x + dx, y + dy];
        if (sy < this.names.length && sx < this.names[0].length) {
          this.seams.putTileAt(this.seamAt(sx, sy), sx, sy);
        }
      }
    }
  }

  checkDoors() {
    const tx = Math.floor(this.player.x / TS);
    const ty = Math.floor((this.player.y - 1) / TS);

    if (this.doorLocked) {
      if (tx !== this.spawnTile[0] || ty !== this.spawnTile[1]) this.doorLocked = false;
      return;
    }

    const door = MAPS[this.mapKey].doors.find((d) => d.x === tx && d.y === ty);
    if (!door) return;
    // a building still under repair keeps its door shut; E on it says what it wants
    const site = siteAt(this.mapKey, tx, ty);
    if (site && !isOpen(site.id)) return;
    this.scene.restart({ map: door.to, spawn: door.spawn });
  }
}
