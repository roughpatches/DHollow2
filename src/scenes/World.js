import { TUNING } from '../../tuning.js';
import { MAPS, TILES, LEGEND } from '../../content/maps.js';
import { NPCS } from '../../content/npcs.js';
import { buildTextures, TILE_INDEX, actorFrame } from '../textures.js';
import { createPlayer, updatePlayer, haltPlayer, spawnActor } from '../player.js';
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

  create() {
    buildTextures(this);
    const map = MAPS[this.mapKey];
    const w = map.rows[0].length;
    const h = map.rows.length;

    // the map as written, then whatever state the town has got itself into on top of it
    const names = map.rows.map((row) => [...row].map((ch) => LEGEND[ch]));
    for (const [x, y, ch] of patchesFor(this.mapKey)) names[y][x] = LEGEND[ch];

    // Two grids from one: a tile with `above` also draws a second tile on a layer
    // over the actors, so you pass behind foliage instead of in front of it.
    const ground = [];
    const above = [];
    for (let y = 0; y < h; y++) {
      ground.push([]);
      above.push([]);
      for (let x = 0; x < w; x++) {
        const name = names[y][x];
        ground[y].push(TILE_INDEX[name]);
        above[y].push(TILES[name].above ? TILE_INDEX[TILES[name].above] : -1);
      }
    }

    this.ground = this.buildLayer(ground, 0);
    this.above = this.buildLayer(above, 20000);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (TILES[names[y][x]].solid) this.ground.getTileAt(x, y).setCollision(true);
      }
    }

    this.physics.world.setBounds(0, 0, w * TS, h * TS);

    this.player = createPlayer(this, this.spawnTile[0], this.spawnTile[1]);
    this.physics.add.collider(this.player, this.ground);

    this.npcs = [];
    // `until` and `after` name a scene: someone can be on the strand only until the
    // opening has played, and in the house only once it has
    const here = NPCS.filter((n) => n.map === this.mapKey
      && !(n.until && hasPlayed(n.until))
      && !(n.after && !hasPlayed(n.after)));
    for (const def of here) {
      const npc = spawnActor(this, def.palette, def.x, def.y, def.facing || 'down');
      // taller than the player's foot-box so you stop beside someone rather than inside them
      npc.body.setSize(12, 20).setOffset(2, 8);
      npc.body.setImmovable(true);
      npc.def = def;
      this.npcs.push(npc);
      this.physics.add.collider(this.player, npc);
    }

    const cam = this.cameras.main;
    cam.setBounds(0, 0, w * TS, h * TS);
    cam.setRoundPixels(true);
    applyToWorld(this);

    this.keys = this.input.keyboard.addKeys('up,down,left,right,w,a,s,d');
    // event-driven, not polled: a quick tap between two frames must not be lost
    this.input.keyboard.on('keydown-E', this.tryTalk, this);
    this.input.keyboard.on('keydown-SPACE', this.tryTalk, this);

    if (!this.scene.isActive('Dialogue')) this.scene.launch('Dialogue');
    if (!this.scene.isActive('Menu')) this.scene.launch('Menu');
    if (!this.scene.isActive('Quest')) this.scene.launch('Quest');
    if (!this.scene.isActive('Traits')) this.scene.launch('Traits');

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

  buildLayer(data, depth) {
    const map = this.make.tilemap({ data, tileWidth: TS, tileHeight: TS });
    const tiles = map.addTilesetImage('tiles', 'tiles', TS, TS, 0, 0);
    return map.createLayer(0, tiles, 0, 0).setDepth(depth);
  }

  update() {
    if (this.frozen) {
      this.player.body.setVelocity(0, 0);
    } else {
      updatePlayer(this.player, this.keys);
      this.checkDoors();
    }

    this.player.setDepth(this.player.y);
    for (const npc of this.npcs) npc.setDepth(npc.y);
  }

  tryTalk() {
    if (this.frozen) return;
    const npc = findTarget(this.player, this.npcs);
    if (npc) {
      npc.facing = faceToward(npc, this.player);
      npc.setTexture(actorFrame(npc.palette, npc.facing, 0));
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
    const site = this.siteAhead();
    if (site) this.workOn(site);
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
    if (result.levelled) this.applyPatch(patchOf(b.id, before + 1));
    this.say(b.name, contributeLines(b.id, result), null);
  }

  // a stage's tiles go down without rebuilding the map, so the town changes under you
  applyPatch(patch) {
    for (const [x, y, ch] of patch) {
      const name = LEGEND[ch];
      this.ground.putTileAt(TILE_INDEX[name], x, y).setCollision(!!TILES[name].solid);
      this.above.putTileAt(TILES[name].above ? TILE_INDEX[TILES[name].above] : -1, x, y);
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
