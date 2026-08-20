// Placeholder item icons, generated at boot the way src/textures.js draws everything
// else the game has no art for. An icon is one shape and one pair of colours, and no
// more than that: a drawn icon loaded under the same key later replaces it and nothing
// downstream knows the difference.
//
// A material's icon is its id, so content/materials.js names none. Anything else names
// one — see `icon` in content/character.js. Anything naming an icon that isn't here
// still gets a square, drawn as UNKNOWN.

import { COLORS } from '../tuning.js';
import { SKILL_ART, ITEM_ART } from '../content/looks.js';

const PX = 16; // drawn small and scaled up in the menu, like every other placeholder here

function fill(g, c, x, y, w, h) {
  g.fillStyle(c, 1);
  g.fillRect(x, y, w, h);
}

// Each takes the two colours of its ink: the body of the thing, and the mark on it.
const SHAPES = {
  planks: (g, [a, b]) => {
    for (const y of [3, 7, 11]) {
      fill(g, a, 1, y, 14, 3);
      fill(g, b, 1, y, 14, 1);
    }
  },
  block: (g, [a, b]) => {
    fill(g, a, 2, 4, 12, 9);
    fill(g, b, 2, 4, 12, 2);
    fill(g, b, 8, 8, 4, 1);
  },
  spikes: (g, [a, b]) => {
    for (const x of [3, 7, 11]) {
      fill(g, a, x, 4, 2, 9);
      fill(g, b, x - 1, 3, 4, 2);
    }
  },
  pot: (g, [a, b]) => {
    fill(g, a, 3, 5, 10, 9);
    fill(g, b, 5, 2, 6, 3);
    fill(g, b, 3, 8, 10, 1);
  },
  sheet: (g, [a, b]) => {
    fill(g, a, 2, 3, 12, 11);
    fill(g, b, 2, 6, 12, 1);
    fill(g, b, 2, 10, 12, 1);
  },
  sack: (g, [a, b]) => {
    fill(g, a, 3, 5, 10, 9);
    fill(g, b, 5, 2, 6, 3);
    fill(g, b, 3, 5, 10, 1);
  },
  loaf: (g, [a, b]) => {
    fill(g, a, 2, 6, 12, 7);
    fill(g, a, 4, 4, 8, 2);
    fill(g, b, 5, 8, 2, 1);
    fill(g, b, 9, 9, 2, 1);
  },
  taper: (g, [a, b]) => {
    fill(g, a, 7, 4, 3, 11);
    fill(g, b, 8, 1, 1, 3);
  },
  shard: (g, [a, b]) => {
    g.fillStyle(a, 1);
    g.fillTriangle(3, 14, 9, 2, 14, 12);
    fill(g, b, 8, 7, 2, 5);
  },
  gem: (g, [a, b]) => {
    g.fillStyle(a, 1);
    g.fillTriangle(2, 7, 14, 7, 8, 15); // the pavilion, coming to a point
    fill(g, a, 3, 3, 10, 4); // and the table across the top of it
    g.fillStyle(b, 1); // the two facets the light is actually doing something on
    g.fillTriangle(3, 7, 8, 7, 5, 12);
    fill(g, b, 5, 4, 6, 2);
  },
  coil: (g, [a, b]) => {
    for (const y of [4, 8, 12]) {
      g.fillStyle(a, 1);
      g.fillEllipse(8, y, 13, 4);
      g.fillStyle(b, 1);
      g.fillEllipse(8, y, 6, 2);
    }
  },
  pin: (g, [a, b]) => {
    fill(g, a, 7, 3, 2, 12);
    fill(g, b, 4, 1, 8, 2);
  },
  slip: (g, [a, b]) => {
    fill(g, a, 4, 2, 8, 12);
    for (const y of [5, 8, 11]) fill(g, b, 6, y, 4, 1);
  },
  sprig: (g, [a, b]) => {
    fill(g, a, 7, 3, 2, 11);
    fill(g, b, 3, 5, 4, 2);
    fill(g, b, 9, 7, 4, 2);
    fill(g, b, 3, 9, 4, 2);
  },
  // dug rather than picked: a forked taproot with what was showing above it left on top
  root: (g, [a, b]) => {
    fill(g, a, 7, 4, 2, 6);
    g.fillStyle(a, 1);
    g.fillTriangle(8, 9, 4, 15, 7, 10);
    g.fillTriangle(8, 9, 12, 15, 9, 10);
    fill(g, b, 4, 2, 3, 2);
    fill(g, b, 9, 1, 3, 2);
  },
  fish: (g, [a, b]) => {
    g.fillStyle(a, 1);
    g.fillEllipse(9, 8, 12, 7);
    g.fillTriangle(1, 4, 1, 12, 6, 8);
    fill(g, b, 6, 7, 6, 1);
    fill(g, b, 12, 6, 1, 1);
  },
  branch: (g, [a, b]) => {
    for (let i = 0; i < 6; i++) fill(g, a, 2 + i * 2, 12 - i * 2, 3, 3);
    fill(g, b, 6, 6, 2, 3);
    fill(g, b, 10, 9, 3, 2);
  },
  log: (g, [a, b]) => {
    fill(g, a, 3, 5, 11, 7);
    g.fillStyle(b, 1);
    g.fillEllipse(4, 8, 5, 7);
  },
  grain: (g, [a, b]) => {
    g.fillStyle(a, 1);
    g.fillEllipse(8, 8, 14, 14);
    g.fillStyle(b, 1);
    g.fillEllipse(8, 8, 9, 9);
    g.fillStyle(a, 1);
    g.fillEllipse(8, 8, 4, 4);
  },
  trumpet: (g, [a, b]) => {
    g.fillStyle(a, 1);
    g.fillTriangle(3, 4, 13, 4, 8, 15);
    fill(g, b, 3, 3, 10, 2);
  },
  cap: (g, [a, b]) => {
    fill(g, b, 7, 8, 3, 6);
    g.fillStyle(a, 1);
    g.fillEllipse(8, 7, 13, 8);
  },
  feather: (g, [a, b]) => {
    g.fillStyle(a, 1);
    g.fillEllipse(8, 7, 8, 12);
    fill(g, b, 8, 2, 1, 13);
  },
  shell: (g, [a, b]) => {
    g.fillStyle(a, 1);
    g.fillEllipse(8, 10, 13, 11);
    fill(g, b, 2, 9, 12, 1); // broken open, and open from the outside
    fill(g, b, 6, 11, 2, 2);
  },
  arrows: (g, [a, b]) => {
    for (const x of [4, 10]) {
      fill(g, a, x, 3, 2, 12);
      g.fillStyle(b, 1);
      g.fillTriangle(x - 2, 4, x + 4, 4, x + 1, 0);
      fill(g, b, x - 1, 11, 4, 1);
    }
  },
  // One apiece for the skills, for the column down the side of the road. Drawn to be
  // told apart at a glance rather than to be looked at: a hand-drawn one under the same
  // key replaces any of them without a line changing anywhere.
  flask: (g, [a, b]) => {
    fill(g, b, 6, 1, 4, 4);
    g.fillStyle(a, 1);
    g.fillTriangle(2, 15, 14, 15, 8, 4);
    fill(g, b, 5, 11, 6, 1);
  },
  frond: (g, [a, b]) => {
    fill(g, b, 7, 2, 2, 13);
    g.fillStyle(a, 1);
    for (const y of [3, 6, 9]) {
      g.fillTriangle(7, y, 7, y + 4, 1, y + 4);
      g.fillTriangle(9, y, 9, y + 4, 15, y + 4);
    }
  },
  // A blade point-up: the length is the piece, the guard and grip are the mark on it. One
  // shape does the dagger and the sword — what tells them apart on the shelf is the name
  // under the square, and both of them are the same object at two lengths anyway.
  blade: (g, [a, b]) => {
    fill(g, a, 7, 2, 2, 9);
    g.fillStyle(a, 1);
    g.fillTriangle(6, 3, 10, 3, 8, 1); // the point
    fill(g, b, 4, 11, 8, 1); // the guard
    fill(g, b, 7, 12, 2, 3); // and the grip
  },
  // Rings, drawn as the only thing sixteen pixels can say about eleven thousand of them.
  mail: (g, [a, b]) => {
    fill(g, a, 3, 3, 10, 10);
    for (let y = 4; y < 13; y += 3) {
      for (let x = 4; x < 13; x += 3) fill(g, b, x, y, 1, 1);
    }
    fill(g, b, 3, 2, 10, 1); // the collar
  },
  // A band seen face on, with the setting standing proud at the top of it. The bracelet
  // borrows it: at sixteen pixels a cuff and a ring are the same picture.
  ring: (g, [a, b]) => {
    fill(g, a, 6, 6, 4, 1); // the band, stepped round so it reads as a hoop and not a jar
    fill(g, a, 5, 7, 1, 1);
    fill(g, a, 10, 7, 1, 1);
    fill(g, a, 4, 8, 1, 3);
    fill(g, a, 11, 8, 1, 3);
    fill(g, a, 5, 11, 1, 1);
    fill(g, a, 10, 11, 1, 1);
    fill(g, a, 6, 12, 4, 1);
    fill(g, b, 6, 3, 4, 3); // the bezel above it, and the stone in it
    fill(g, a, 5, 5, 6, 1);
  },
  // A disc on a cord with three settings on its face.
  amulet: (g, [a, b]) => {
    fill(g, b, 4, 1, 8, 1); // the cord across the top
    fill(g, a, 5, 4, 6, 8);
    fill(g, a, 4, 5, 8, 6);
    fill(g, b, 7, 5, 2, 2);
    fill(g, b, 5, 8, 2, 2);
    fill(g, b, 9, 8, 2, 2);
  },
  // A round with a boss in the middle of it, which is the whole of what a shield is.
  shield: (g, [a, b]) => {
    fill(g, a, 6, 1, 4, 1); // the round, stepped in from the top and out to the waist
    fill(g, a, 4, 2, 8, 2);
    fill(g, a, 2, 4, 12, 5);
    fill(g, a, 3, 9, 10, 2);
    fill(g, a, 5, 11, 6, 2);
    fill(g, a, 7, 13, 2, 1); // and down to a point, which is where a shield sheds a blow
    fill(g, b, 6, 5, 4, 4); // the boss
  },
  axe: (g, [a, b]) => {
    fill(g, b, 9, 1, 2, 14);
    g.fillStyle(a, 1);
    g.fillTriangle(9, 2, 9, 9, 2, 6);
    fill(g, b, 2, 5, 2, 2);
  },
  sail: (g, [a, b]) => {
    fill(g, b, 8, 1, 1, 12);
    g.fillStyle(a, 1);
    g.fillTriangle(8, 2, 8, 12, 1, 12);
    fill(g, b, 2, 13, 12, 2);
  },
  hook: (g, [a, b]) => {
    fill(g, b, 9, 1, 4, 2); // the eye, across the top of the shank
    fill(g, a, 10, 2, 2, 8); // the shank
    fill(g, a, 8, 9, 2, 3); // round the bend
    fill(g, a, 5, 11, 3, 2);
    fill(g, a, 4, 7, 2, 5); // and up to the point
    fill(g, b, 2, 5, 4, 2); // the barb
  },
  speech: (g, [a, b]) => {
    fill(g, a, 1, 3, 14, 8);
    g.fillStyle(a, 1);
    g.fillTriangle(4, 11, 9, 11, 4, 15);
    for (const x of [4, 7, 10]) fill(g, b, x, 6, 2, 2);
  },
  eye: (g, [a, b]) => {
    g.fillStyle(a, 1);
    g.fillEllipse(8, 8, 15, 9);
    g.fillStyle(b, 1);
    g.fillEllipse(8, 8, 6, 6);
  },
  hammer: (g, [a, b]) => {
    fill(g, b, 6, 5, 2, 10); // the haft, off-centre, so the head is not a letter T
    fill(g, a, 2, 2, 11, 4); // the head, longer on the peen side
    fill(g, a, 13, 3, 1, 2);
    fill(g, b, 2, 2, 11, 1);
  },
  // two peaks rather than one, so it is a range and not a tent
  peak: (g, [a, b]) => {
    g.fillStyle(a, 1);
    g.fillTriangle(6, 3, 1, 13, 11, 13);
    g.fillTriangle(11, 6, 7, 13, 15, 13);
    g.fillStyle(b, 1);
    g.fillTriangle(6, 3, 3, 7, 9, 7); // the snow on the taller of them
  },
  // reeds standing in water: the waterline is what makes it wetland and not grass
  reed: (g, [a, b]) => {
    g.fillStyle(a, 1);
    for (const [x, top] of [[4, 2], [8, 1], [12, 4]]) {
      fill(g, a, x, top, 2, 11 - top);
      fill(g, b, x, top, 2, 2); // the head on it
    }
    fill(g, b, 1, 11, 14, 2); // the water they are standing in
  },
  // a face with nothing on it: what reading one is done against
  mask: (g, [a, b]) => {
    g.fillStyle(a, 1);
    g.fillEllipse(8, 8, 12, 14);
    fill(g, b, 5, 6, 2, 2);
    fill(g, b, 9, 6, 2, 2);
    fill(g, b, 5, 11, 6, 1);
  },
  pick: (g, [a, b]) => {
    fill(g, b, 7, 4, 2, 11); // the haft
    g.fillStyle(a, 1); // and the head curving away either side of it
    g.fillTriangle(8, 3, 1, 7, 3, 3);
    g.fillTriangle(8, 3, 15, 7, 13, 3);
  },
};

// [shape, ink]. Ink names a pair in COLORS.icon, so retinting every wooden thing at
// once is one edit in tuning.js.
const ICONS = {
  brooktrout: ['fish', 'trout'],
  perch: ['fish', 'perch'],
  bluegill: ['fish', 'bluegill'],
  oakbranch: ['branch', 'wood'],
  oaklog: ['log', 'wood'],
  heartwood: ['grain', 'heart'],
  blacktrumpet: ['trumpet', 'soot'],
  oystermushroom: ['cap', 'bone'],
  bittercap: ['cap', 'herb'],
  heronfeather: ['feather', 'ash'],
  eggshell: ['shell', 'shell'],
  greyarrow: ['arrows', 'ash'],
  bone: ['shard', 'bone'],
  copperore: ['grain', 'copper'],
  tinore: ['grain', 'tin'],
  coal: ['block', 'coal'],
  ironore: ['grain', 'iron'],
  mithrilore: ['grain', 'mithril'],
  adamantiumore: ['grain', 'adamant'],
  dwarvenore: ['block', 'dwarf'],
  elvishore: ['grain', 'elf'],
  holyore: ['grain', 'holy'],
  charcoal: ['block', 'soot'],
  // The nine stones: the rough lump out of the ground, and the same stone cut. All three
  // grades of a cut stone share its square — a Flawless Ruby is a ruby.
  roughgarnet: ['shard', 'garnet'],
  roughagate: ['shard', 'agate'],
  roughamethyst: ['shard', 'amethyst'],
  roughtopaz: ['shard', 'topaz'],
  roughsapphire: ['shard', 'sapphire'],
  roughonyx: ['shard', 'onyx'],
  roughdiamond: ['shard', 'diamond'],
  roughemerald: ['shard', 'emerald'],
  roughruby: ['shard', 'ruby'],
  garnet: ['gem', 'garnet'],
  agate: ['gem', 'agate'],
  amethyst: ['gem', 'amethyst'],
  topaz: ['gem', 'topaz'],
  sapphire: ['gem', 'sapphire'],
  onyx: ['gem', 'onyx'],
  diamond: ['gem', 'diamond'],
  emerald: ['gem', 'emerald'],
  ruby: ['gem', 'ruby'],
  tonic: ['flask', 'herb'],
  salve: ['pot', 'bone'],
  cordial: ['flask', 'bronze'],
  woodsdraught: ['flask', 'food'],
  copsebroth: ['pot', 'herb'],
  blackdraught: ['flask', 'soot'],
  nightwash: ['flask', 'ash'],
  steadyhand: ['pot', 'glass'],
  bitterwash: ['flask', 'shell'],
  bronzebar: ['log', 'bronze'],
  bronzedagger: ['blade', 'bronze'],
  bronzesword: ['blade', 'bronze'],
  bronzeshield: ['shield', 'bronze'],
  bronzechainmail: ['mail', 'bronze'],
  bronzeplatemail: ['mail', 'bronze'],
  bronzering: ['ring', 'bronze'],
  bronzebracelet: ['ring', 'bronze'],
  bronzeamulet: ['amulet', 'bronze'],
  ironbar: ['log', 'iron'],
  coalfish: ['fish', 'ash'],
  panperch: ['cap', 'food'],
  troutsupper: ['fish', 'heart'],
  friedfish: ['fish', 'food'],
  woodstew: ['pot', 'food'],
  smokedfish: ['fish', 'soot'],
  shorepie: ['loaf', 'food'],
  bread: ['loaf', 'food'],
  candle: ['taper', 'bone'],
  flint: ['shard', 'stone'],
  rope: ['coil', 'cloth'],
  powder: ['pot', 'glass'],
  gravepin: ['pin', 'iron'],
  bellshard: ['shard', 'bronze'],
  tally: ['slip', 'bone'],
  mint: ['sprig', 'herb'],
  waterskin: ['sack', 'wood'],
  // The skills, by their id in content/skills.js — a skill's icon is its id, the way a
  // material's is. These are what stands in for a skill the painted sheet has no cell
  // for, or for all of them until the sheet is in.
  // terrain
  woodcraft: ['frond', 'herb'],
  sailing: ['sail', 'cloth'],
  mountaineering: ['peak', 'stone'],
  fording: ['reed', 'glass'],
  // social
  intimidation: ['spikes', 'iron'],
  persuasion: ['speech', 'bone'],
  investigation: ['eye', 'glass'],
  insight: ['mask', 'bone'],
  // gathering
  woodcutting: ['axe', 'iron'],
  fishing: ['hook', 'ash'],
  mining: ['pick', 'stone'],
  herblore: ['sprig', 'herb'],
  // crafting
  alchemy: ['flask', 'glass'],
  smithing: ['hammer', 'bronze'],
  cooking: ['pot', 'bronze'],
  gemcutting: ['shard', 'glass'],
};

const UNKNOWN = ['block', 'cloth'];

function keyOf(name) {
  return `icon_${name}`;
}

// The texture for a thing, or the unknown square for a thing with no icon named.
export function iconKeyFor(name) {
  return keyOf(ICONS[name] ? name : 'unknown');
}

export function preloadIcons(scene) {
  for (const { sheet } of [SKILL_ART, ITEM_ART]) {
    if (sheet && !scene.textures.exists(sheet)) scene.load.image(sheet, sheet);
  }
  // A painting is loaded once under its own path, however many names wear it: one stone
  // is painted and nine stones are drawn from it.
  for (const [path] of Object.values(ITEM_ART.files || {})) {
    if (!scene.textures.exists(path)) scene.load.image(path, path);
  }
}

// One cell off a painted sheet, under the name the drawn shape would have had. Two sheets
// are read — the things a pack holds first, then the skills — and either is allowed not to
// exist yet: a name with no cell on either, or a sheet not in the repo, goes back to the
// generator and gets the shape drawn for it. That is how the whole set is placeholder
// today and how it stops being one a sheet at a time.
function cutFrom(scene, spec, name) {
  const at = spec.at[name];
  if (!at || !spec.sheet || !scene.textures.exists(spec.sheet)) return false;
  const px = spec.cell;
  const tex = scene.textures.createCanvas(keyOf(name), px, px);
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(scene.textures.get(spec.sheet).getSourceImage(),
    (at[0] - 1) * px, (at[1] - 1) * px, px, px, 0, 0, px, px);
  tex.refresh();
  return true;
}

// Hue and depth of colour out of an ink, and nothing else out of it: the light is the
// painting's own. Colours as 0xrrggbb here and as h,s,l in 0..1 everywhere below.
function toHsl(r, g, b) {
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const hi = Math.max(R, G, B);
  const lo = Math.min(R, G, B);
  const l = (hi + lo) / 2;
  if (hi === lo) return [0, 0, l];
  const d = hi - lo;
  const h = hi === R ? ((G - B) / d + (G < B ? 6 : 0))
    : hi === G ? (B - R) / d + 2
      : (R - G) / d + 4;
  return [h / 6, d / (1 - Math.abs(2 * l - 1)), l];
}

function fromHsl(h, s, l) {
  if (!s) return [l, l, l].map((v) => Math.round(v * 255));
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const at = (t) => {
    const x = (t + 1) % 1;
    if (x < 1 / 6) return p + (q - p) * 6 * x;
    if (x < 1 / 2) return q;
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
    return p;
  };
  return [at(h + 1 / 3), at(h), at(h - 1 / 3)].map((v) => Math.round(v * 255));
}

// The painting repainted in somebody else's colour. Every pixel keeps its own lightness
// and takes the ink's hue and saturation, so the shading, the outline and the highlight
// that were painted into the stone survive being made a different stone. Fully clear
// pixels are left alone — there is no colour in them to change.
function recolour(ctx, w, h, ink) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const [hue, sat] = toHsl((ink >> 16) & 255, (ink >> 8) & 255, ink & 255);
  for (let i = 0; i < d.length; i += 4) {
    if (!d[i + 3]) continue;
    const [, , l] = toHsl(d[i], d[i + 1], d[i + 2]);
    [d[i], d[i + 1], d[i + 2]] = fromHsl(hue, sat, l);
  }
  ctx.putImageData(img, 0, 0);
}

// One painting, under the name the drawn shape would have had. The same fallback rule the
// sheets get: a painting not in the repo yet leaves the name to the generator.
function paintFrom(scene, spec, name) {
  const named = spec.files && spec.files[name];
  if (!named) return false;
  const [path, ink] = named;
  if (!scene.textures.exists(path)) return false;
  const src = scene.textures.get(path).getSourceImage();
  const tex = scene.textures.createCanvas(keyOf(name), src.width, src.height);
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(src, 0, 0);
  if (ink && COLORS.icon[ink]) recolour(ctx, src.width, src.height, COLORS.icon[ink][1]);
  tex.refresh();
  return true;
}

function cutIcon(scene, name) {
  return paintFrom(scene, ITEM_ART, name)
    || cutFrom(scene, ITEM_ART, name) || cutFrom(scene, SKILL_ART, name);
}

// Painted where there is paint for it, drawn where there is not, and the same key either
// way — so nothing that puts an icon on the screen knows or cares which it got.
export function buildIcons(scene) {
  for (const [name, spec] of [...Object.entries(ICONS), ['unknown', UNKNOWN]]) {
    const key = keyOf(name);
    if (scene.textures.exists(key)) continue;
    if (cutIcon(scene, name)) continue;
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    SHAPES[spec[0]](g, COLORS.icon[spec[1]]);
    g.generateTexture(key, PX, PX);
    g.destroy();
  }
}
