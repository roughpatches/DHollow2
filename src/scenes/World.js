import { TUNING } from '../../tuning.js';
import { MAPS, TILES, LEGEND } from '../../content/maps.js';
import { NPCS } from '../../content/npcs.js';
import { buildTextures, TILE_INDEX, actorFrame } from '../textures.js';
import { createPlayer, updatePlayer, haltPlayer, spawnActor } from '../player.js';
import { findTarget, faceToward } from '../interact.js';

const TS = TUNING.tileSize;

export default class World extends Phaser.Scene {
  constructor() {
    super('World');
  }

  init(data) {
    this.mapKey = data.map || 'village';
    this.spawnTile = data.spawn || MAPS[this.mapKey].spawn;
  }

  create() {
    buildTextures(this);
    const map = MAPS[this.mapKey];
    const w = map.rows[0].length;
    const h = map.rows.length;

    // Two grids from one: a tile with `above` also draws a second tile on a layer
    // over the actors, so you pass behind foliage instead of in front of it.
    const ground = [];
    const above = [];
    for (let y = 0; y < h; y++) {
      ground.push([]);
      above.push([]);
      for (let x = 0; x < w; x++) {
        const name = LEGEND[map.rows[y][x]];
        ground[y].push(TILE_INDEX[name]);
        above[y].push(TILES[name].above ? TILE_INDEX[TILES[name].above] : -1);
      }
    }

    this.ground = this.buildLayer(ground, 0);
    this.above = this.buildLayer(above, 20000);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (TILES[LEGEND[map.rows[y][x]]].solid) this.ground.getTileAt(x, y).setCollision(true);
      }
    }

    this.physics.world.setBounds(0, 0, w * TS, h * TS);

    this.player = createPlayer(this, this.spawnTile[0], this.spawnTile[1]);
    this.physics.add.collider(this.player, this.ground);

    this.npcs = [];
    for (const def of NPCS.filter((n) => n.map === this.mapKey)) {
      const npc = spawnActor(this, def.palette, def.x, def.y, def.facing || 'down');
      // taller than the player's foot-box so you stop beside someone rather than inside them
      npc.body.setSize(12, 20).setOffset(2, 8);
      npc.body.setImmovable(true);
      npc.def = def;
      this.npcs.push(npc);
      this.physics.add.collider(this.player, npc);
    }

    const cam = this.cameras.main;
    cam.setZoom(TUNING.zoom);
    cam.setBounds(0, 0, w * TS, h * TS);
    cam.setRoundPixels(true);
    cam.startFollow(this.player, true, 0.2, 0.2);

    this.keys = this.input.keyboard.addKeys('up,down,left,right,w,a,s,d');
    // event-driven, not polled: a quick tap between two frames must not be lost
    this.input.keyboard.on('keydown-E', this.tryTalk, this);
    this.input.keyboard.on('keydown-SPACE', this.tryTalk, this);

    if (!this.scene.isActive('Dialogue')) this.scene.launch('Dialogue');
    if (!this.scene.isActive('Menu')) this.scene.launch('Menu');

    this.frozen = false;
    this.doorLocked = true; // cleared once the player steps off the tile they spawned on

    const unfreeze = () => {
      this.frozen = false;
      haltPlayer(this.player);
    };
    const freeze = () => {
      this.frozen = true;
      haltPlayer(this.player);
    };
    this.game.events.on('dialogue:end', unfreeze);
    this.game.events.on('menu:open', freeze);
    this.game.events.on('menu:close', unfreeze);
    this.events.once('shutdown', () => {
      this.game.events.off('dialogue:end', unfreeze);
      this.game.events.off('menu:open', freeze);
      this.game.events.off('menu:close', unfreeze);
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
    if (!npc) return;
    npc.facing = faceToward(npc, this.player);
    npc.setTexture(actorFrame(npc.palette, npc.facing, 0));
    haltPlayer(this.player);
    this.frozen = true;
    this.game.events.emit('dialogue:start', { name: npc.def.name, lines: npc.def.lines });
  }

  checkDoors() {
    const tx = Math.floor(this.player.x / TS);
    const ty = Math.floor((this.player.y - 1) / TS);

    if (this.doorLocked) {
      if (tx !== this.spawnTile[0] || ty !== this.spawnTile[1]) this.doorLocked = false;
      return;
    }

    const door = MAPS[this.mapKey].doors.find((d) => d.x === tx && d.y === ty);
    if (door) this.scene.restart({ map: door.to, spawn: door.spawn });
  }
}
