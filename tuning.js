// Every number and colour the game runs on. Nothing else holds a magic value.
// Edit freely; no code change is required to retune or retint anything here.

export const TUNING = {
  tileSize: 16, // a tile's size in the world: what a step, a wall and a map are measured in
  tilePx: 64, // and the size it is drawn from, so painted ground keeps its detail
  zoom: 3,
  viewWidth: 960,
  viewHeight: 640,

  // The town seen from the side (see `street` in content/maps.js). It is drawn further
  // back than a grid map because a painted street is 384 pixels tall and a room is not:
  // at the grid's own zoom you would never see a roofline.
  streetZoom: 2,
  streetBodyPx: 34, // how tall anybody standing on a street is drawn, feet to head
  streetReach: 30, // how near a door or a building you stand for [E] to reach it, in pixels
  streetHintSize: 14, // the name of whatever is within reach, written over the player's head
  streetHintRise: 22, // and how far over it

  // Every word in the game is set in this. The face itself is declared in index.html
  // and loaded before the game starts, because a line of text is baked to a texture the
  // moment it is written and one baked against a fallback stays wrong.
  font: "'Libre Baskerville', serif",

  walkSpeed: 78,
  walkFrameRate: 7, // a placeholder walk is two frames; a drawn one has its own rates
  artWalkFrameRate: 10,
  artIdleFrameRate: 5,

  interactReach: 12,
  interactRange: 20,

  // A run is a line of nodes with a fork every so often. Node counts are [least, most]
  // and are rolled when the quest is accepted.
  questNodes: { short: [4, 8], medium: [8, 12], long: [12, 16] },
  questForkEvery: 3, // a fork before every nth node; 0 turns forks off
  questBiasWeight: 10, // taking a branch multiplies that encounter's weight by this
  questBonusFactor: 2, // finishing pays this many times over what the run itself paid
  questBonusXp: { short: 150, medium: 350, long: 700 }, // and this on top, flat
  questNightCon: 1.25, // a node at night takes this much more constitution
  questNightXp: 1.3, // and pays this much more for it

  // Constitution is what a party has to spend on being out there: everyone's own score
  // added up at the gate, drained by the road, and gone when the run ends either way.
  // At zero the party turns for home with half of what it was carrying.
  questConDecay: 1, // taken at every node, before the node itself is felt
  questConHeld: 1, // a check held steadies them by this much
  questConLost: 3, // a check lost costs this on top of whatever the node takes
  questSpentKeep: 0.5, // what a party with nothing left in it carries home

  // The crawl is three bands: the constitution bar across the top, the party walking in
  // the middle, and the trail behind and ahead of them along the bottom.
  questBarHeight: 16,
  questBarCap: 12, // the iron at each end of it, holding it to the panel
  questHeadHeight: 84, // the band the bar sits in, deep enough for the frame around it
  questSkillWidth: 108, // the column down the side of the road, taken off the road's width
  questSkillStep: 52, // how far apart the skills sit in it
  questSkillPx: 32, // how big an icon is in the column, whatever size it is painted
  questTrailHeight: 108, // the band along the bottom, deep enough for the frame and a node in it
  questWalkGroundFrac: 0.68, // where the ground line sits inside the walking band
  questBodyPx: 62, // how tall a walking placeholder is drawn on the road
  questArtScale: 1.25, // drawn art carries air around the body; this brings it up to size
  questMarkScale: 2.5, // and how big a generated one is drawn; painted art keeps its size
  questMarkInset: 150, // how far in from the far side of the road it comes to rest
  questCardWidth: 836, // the card runs the width of the road
  questCardBody: 52, // and this much of it is paragraphs, which keeps it under the ground line;
  // a longer account is read a page at a time
  questScrollPxPerSec: 46, // the near ground's speed; the layers behind it run slower
  questParallax: [0.15, 0.4, 1], // far, mid, near, as a fraction of that speed
  questApproachMs: 1400, // how long a node takes to walk into view
  questConTweenMs: 500, // and how long the bar takes to catch up with it

  // The tally raised at the corner of the road when a node is done with (src/toast.js).
  questToastWidth: 300,
  questToastRow: 28, // one thing taken, and how much room it gets
  questToastIcon: 22,
  questToastInset: 14, // how far in from the corner of the road it hangs
  questToastFadeMs: 220,
  questToastStepMs: 90, // how long between one line landing and the next
  questToastHoldMs: 2800, // how long the whole tally stays up once it has landed

  // The Fell minigame (src/minigames/FellEngine.js), which is what a Woodcutting node
  // is. Every number the axe answers to lives here.
  fell: {
    chargeDurationMs: 1700, // how long a full wind-up takes
    ventPerSec: 3.2, // and how fast the power bleeds back off after a swing
    overchargeAt: 1.0, // past this the swing goes wild and splinters the trunk
    wildChip: 0.12, // what a wild swing costs the trunk's soundness
    cutPerSwing: 0.125, // a clean bite this deep, so eight of them fell it
    strikePips: 8, // and a pip apiece, once there is art for them
    leanStep: 0.07, // how far a swing shifts the lean toward the side you cut
    leanDrift: 0.021, // and how fast the tree tips that way on its own
    leanBand: { low: 0.34, high: 0.66 }, // the lean it will take without straining
    leanBandRoam: 0.12, // how far that band wanders
    bandStepPerSwing: 0.013, // and how far it moves per swing
    zoneShiftPerSwing: 0.05, // the bite target walks this far with every strike
    powerZone: { width: 0.2, min: 0.28, max: 0.88 }, // where the bite sits on the wind-up
    soundnessDrainPerSec: 0.18, // straining the trunk costs this
    soundnessRegenPerSec: 0.18, // and a balanced cut puts it back
  },

  // Fishing (src/minigames/FishEngine.js), which is what a Casting node is: cast to find
  // a fish, hook it when it takes, hold the line while it fights. Three engines, three
  // blocks of numbers, and every one of them a gate.
  fish: {
    // Cast — hold to pay out line, release to present it in the drifting feeding lane.
    // Short, over, or too slow and there is no fish to hook.
    cast: {
      payOutRateStart: 0.55, // reach per second with no line out
      payOutRateEnd: 0.3, // and at full extension — the lengthening, slowing feel
      lane: {
        start: 0.42, // where the feeding lane sits before it starts moving
        width: 0.2, // how much of the water it covers
        driftSpeed: 0.18, // and how fast it wanders across it
        wanderIntervalMs: 1800,
      },
      presentationMs: 6200, // work the cast longer than this and the fish moves off
    },
    // Hook — wait, then react. A nibble looks like a take and is not.
    hook: {
      window: { perfect: 420, good: 900 }, // how long the take stays settable
      calmMsRange: [900, 2000], // how long the water stays quiet between events
      feintMs: 480, // and how long a nibble lasts
      refusals: 1, // how many nibbles come before the real thing
    },
    // Reel — hold the line inside a band that will not stay still.
    reel: {
      durationMs: 5600, // how long the fish fights
      tickIntervalMs: 300, // and how often the hold is scored
      zoneWidth: 0.38,
      zoneWanderIntervalMs: 1500,
      zoneDriftSpeed: 0.6,
      indicatorAccel: 1.5, // how hard holding hauls the line
      gravity: 1, // and how fast it falls back when you let go
      maxVelocity: 1.3,
      lineIntegrity: 5, // slips the line takes before it snaps; the 5th ends the catch
    },
  },

  // What playing an activity is worth. A judgment of perfect counts full, good most of
  // the way, a miss barely — averaged into one 0..1 quality, which is what the node then
  // pays on. A run where the party never touches an activity is unaffected by any of it.
  activityWorth: { perfect: 1, good: 0.7, miss: 0.2 },
  activityKeepFloor: 0.4, // the worst performance still carries this much of the spoils
  activityFailKeep: 0.25, // and a botched activity — a split trunk — this much
  activityConBest: 2, // a quality above activityConGood puts this much constitution back
  activityConGood: 0.8,
  activityConWorst: -3, // and a botched one costs this

  questPipSize: 32, // a node on the trail; they spread across the band and close up at this
  questPipGap: 18, // the least road left between two of them before they start to shrink
  questPipInset: 5, // how far inside its square a node's picture is drawn
  questPipYou: 3.5, // and the party's own mark, sliding along the road between them
  questPad: 26,
  questTitleSize: 22,
  questBodySize: 16,
  questHintSize: 13,
  questRowHeight: 26,

  // Recruiting. A bond is counted in points; a band is bondPerBand of them, and the
  // bands are named below. Someone comes along if their band is at or above what the
  // job asks of them.
  bondPerBand: 3,
  bondNames: ['Stranger', 'Acquainted', 'Trusted', 'Sworn'],
  bondPerRun: 1, // points added to everyone who walked a run to the end
  recruitBase: 1, // the band an ordinary job asks for
  recruitDraw: 1, // each skill drawn to the work asks one band less
  recruitFear: 2, // each fear or scruple the work touches asks two bands more

  // Skills are points, not badges. A character picks skillsAtLevelOne of them from
  // content/skills.js and spreads skillPointsAtLevelOne between those three; the rest
  // of the list is what they are untrained at.
  skillsAtLevelOne: 3,
  skillPointsAtLevelOne: 6,
  skillBonusPerPoint: 2, // what one point is worth to an activity
  skillYieldPerPoint: 0.15, // and to what a gathering node pays: every point in the
  // party's score for that work adds this much on top of the roll

  // What a point is worth to a node that draws its yield off a table (see `draw` in
  // content/encounters.js). Points flatten the table toward its rare end — every one of
  // them raises each weight to a lower power, which leaves an even table even and moves
  // an uneven one toward its scarcer rows. A table's order never inverts: no amount of
  // Woodcutting takes more heartwood off an oak than branches.
  skillOddsPerPoint: 0.06,
  skillOddsMost: 0.6, // and this is as flat as any table gets, at any score

  // Skill checks. A die, plus the skill, against a DC written on the encounter or the
  // job. The best in the party rolls it. A natural top always holds and a natural 1
  // never does, so no DC is a wall and none is a formality.
  checkDie: 20,
  checkPassXp: 1.25, // a check held pays this much more
  checkFailKeep: 0.5, // a check lost keeps this much of what was there to take
  checkFailHurt: 2, // and costs this much on top of the node's own wounds

  // What knowing the ground is worth. Every point the party has in a skill whose
  // `terrain` matches the zone's is this much constitution before they set out — the
  // reason to take the woodsman into the wood. Zero turns the whole thing off.
  conPerTerrainPoint: 1,

  maxLevel: 10,
  conPerLevel: 3, // added to a character's own constitution for every level past the first
  xpBase: 40, // leaving level n costs xpBase * n, so levels get longer at a steady rate

  nameMaxLength: 16, // what fits in the dialogue box beside a portrait
  nameCaretBlinkMs: 450,

  dialogueCharsPerSec: 45,
  dialogueBoxHeight: 128,
  dialogueBoxMargin: 16,
  dialogueFontSize: 20,
  dialogueNameSize: 18,

  // The portrait panel's side in screen pixels. Eight of those are border, so a painted
  // portrait of 128 sits inside it pixel for pixel; a drawn placeholder of 40 trebles.
  dialoguePortraitSize: 136,
  dialoguePortraitGap: 8, // space between portrait panel and dialogue box
  dialoguePortraitRise: 10, // how far the portrait travels as it pops up
  dialoguePortraitPopMs: 130,

  menuMargin: 26,
  menuPad: 20,
  menuTabStripHeight: 42,
  menuListWidth: 300,
  menuRowHeight: 26,
  menuRowsVisible: 13,
  menuTabSize: 16,
  menuTabGap: 22, // space between tab names; shrink it when a new tab crowds the strip
  menuTitleSize: 22,
  menuRowSize: 15,
  menuBodySize: 15,
  menuHintSize: 13,

  menuMapCell: 12, // a map tile's size on the Map tab; shrinks to fit a big map
  menuMapHeight: 208,

  // The Inventory tab's grid. Columns and visible rows are whatever fits the panel at
  // this cell size, so widening a square narrows the grid rather than overrunning it.
  menuIconCell: 60,
  menuIconPx: 32, // the icon inside a square; placeholder icons are drawn at 16
};

// [base, detail] per tile. Retint the whole world from this table.
export const COLORS = {
  bg: 0x0b0d10,
  dialogueFill: 0x14161b,
  dialogueEdge: 0x6b5a3a,
  dialogueText: 0xd9d3c4,
  dialogueName: 0xc9a95f,
  portraitFill: 0x14161b,
  portraitEdge: 0x6b5a3a,
  portraitBack: 0x1d1a16, // the wash behind a bust, so a dark palette still reads as a head

  menuFill: 0x101216,
  menuPanel: 0x171a20,
  menuEdge: 0x6b5a3a,
  menuRule: 0x2e3138,
  menuText: 0xd9d3c4,
  menuDim: 0x8b8578,
  menuAccent: 0xc9a95f,
  menuSelectFill: 0x2a2418,
  menuMapYou: 0xe8e2d2,
  menuMapDoor: 0xc9a95f,
  menuMapFolk: 0x9c5a46,
  menuMapMark: 0x7f9fa8,
  // Ink, for the one panel that is a page rather than a board. Every colour above has
  // its opposite number here and nothing else changes: a line written for the dark is
  // read back in ink when it lands on paper. See `ink` in content/looks.js.
  inkText: 0x241a12,
  inkDim: 0x6d5136,
  inkAccent: 0x7d4a10,
  inkRule: 0x8b6c4a,
  inkFolk: 0x86301c,
  inkMark: 0x2c4a52,
  inkSelectFill: 0xb5905f,
  inkPanel: 0xcbb083, // the paper a shade down: a list's ground, a grid's squares

  // The constitution bar: an iron trough with what the road has not taken yet in it.
  // Full it is the gold the leaves are, and at nothing it is the red they go to.
  conTrough: 0x17120f,
  conRim: 0x5b5352,
  conRimLit: 0x928178,
  conRivet: 0x9aa0a6,
  conFull: 0xd1943c,
  conLow: 0xa8341f,

  // What is behind the town. The paintings carry no sky — it is transparent in them, so
  // the weather is the game's to draw — and where a panel has a hole in it you are looking
  // through at the water. Retint here and every panel's weather follows.
  skyHigh: 0x232a37, // overhead, where the dusk is furthest along
  skyLow: 0x6d616a, // and down at the water, where the last of the light is
  skyCloud: 0x2f3543, // the banks lying across it
  skyCloudLit: 0x8a7a74, // and their undersides, catching what is left
  seaFar: 0x55606b, // steel, out at the horizon
  seaNear: 0x2c3540, // and darker close in
  seaCrest: 0x77828c, // the swell on it

  questNightFill: 0x0c0e14, // a run at night is drawn colder than one by day
  questNightEdge: 0x3f4a63,
  questSkyDay: 0x2c333c, // what the party is walking under in the middle band
  questSkyNight: 0x11141d,
  questNightTint: 0x6a7590, // laid over the landscape after dark

  // What a placeholder item icon is made of (src/icons.js): the body of the thing, and
  // the mark on it. Retint here and every wooden thing changes at once.
  icon: {
    wood: [0x6b4f2a, 0x8a6b3c],
    stone: [0x6f7379, 0x9aa0a6],
    iron: [0x4a4f58, 0x878d96],
    bronze: [0x8a6a2f, 0xc9a95f],
    cloth: [0x8d8266, 0xb9ab8c],
    pitch: [0x2b2a2e, 0x4a4652],
    food: [0xa8763f, 0xd0a061],
    herb: [0x5d7a4a, 0x86a466],
    glass: [0x7f9fa8, 0xbcd4d9],
    bone: [0xa8a292, 0xd9d3c4],
    trout: [0x6d6a4a, 0xb4553f],
    perch: [0xb08a34, 0x5c4a22],
    bluegill: [0x4c6f7a, 0x2c3b46],
    heart: [0x4a3520, 0x7a5a30],
    soot: [0x33302f, 0x57514c],
    ash: [0x8f9298, 0xc2c5cb],
    shell: [0xa8bfa2, 0x6d8069],
  },

  // The minigame UI kit, drawn into the generated 'ui' atlas at boot. Retint here and
  // every widget an activity engine draws follows; nothing else reads these.
  ui: {
    stage: 0x0b0d10,
    panel: 0x171a20,
    inset: 0x101216,
    edge: 0x6b5a3a,
    rule: 0x2e3138,
    text: 0xd9d3c4,
    muted: 0x8b8578,
    gold: 0xc9a95f,
    goldBright: 0xf0d68f,
    grass: 0x6f8f4a,
    danger: 0x9c5a46,
    cool: 0x7f9fa8,
    warn: 0xc08040,
    ink: 0x0b0d10,
  },
  // A judgment ribbon carries a dark label, so these stay light enough to read it.
  uiRibbons: {
    fb_perfect: 0xf0d68f,
    fb_clean: 0x8fae66,
    fb_good: 0xc9a95f,
    fb_wild: 0xd39a55,
    fb_miss: 0xc07a63,
  },
  // what each bar kind is filled with
  uiBars: {
    bar_hp: 0x9c5a46,
    bar_stamina: 0x6f8f4a,
    bar_atb: 0x7f9fa8,
    bar_quality: 0xc9a95f,
    bar_integrity: 0xc08040,
  },

  grass: [0x2f3d2b, 0x263422],
  path: [0x4f4a43, 0x413d37],
  dirt: [0x453a2e, 0x392f25],
  water: [0x1f3346, 0x2b4460],
  tree: [0x1b2a1c, 0x33261a],
  wall: [0x4a4642, 0x383533],
  roof: [0x352e2c, 0x27211f],
  door: [0x53381f, 0xb99154],
  wood: [0x453728, 0x392d21],
  stone: [0x434039, 0x36332e],
  well: [0x4f4b44, 0x101317],
  grave: [0x6a655d, 0x47433d],
  bar: [0x4e3c29, 0x6d5537],
  forge: [0x2b2825, 0xb04a1c],
  shelf: [0x40331f, 0x74603e],
  altar: [0x565046, 0x9c8c62],
  pew: [0x4a3826, 0x6a5136],
  crate: [0x574328, 0x3b2c1a],
  hearth: [0x33302c, 0xc4601f],
  rug: [0x5a2b2b, 0x8a4a3a],
  bed: [0x4a3b3a, 0x7a6a58],
  sand: [0x494235, 0x3c362b],
  flotsam: [0x494235, 0x362a1e], // small wreckage the tide left, walkable
  spar: [0x3d3124, 0x241c14], // a beam off a ship, big enough to walk around

  // the harbour
  deck: [0x5a4831, 0x6e5940], // dock planking, salt-bleached
  rot: [0x463a2a, 0x241d14], // the same planking with the gaps showing
  piling: [0x2f2a20, 0x1a1610], // a post standing in the water
  wreck: [0x2b2520, 0x413528],
  post: [0x2b2c30, 0x565a60], // cast iron: a lamp post or a bollard

  // the town, and what is taking it back
  rubble: [0x504b44, 0x6b655c],
  scrub: [0x3a4029, 0x6a5c32], // dying grass gone to seed, ochre at the tips
  bramble: [0x27301f, 0x4a4326],
  stump: [0x473a28, 0x6a5738],
  fence: [0x473827, 0x2c2318],
};

// Actor placeholder palettes. Add an entry, reference its name from content/npcs.js.
export const PALETTES = {
  player: { body: 0x39566b, head: 0xc7a184, hair: 0x2a2119, trim: 0x8ba4b5 },
  hunter: { body: 0x3f4a33, head: 0xbb9670, hair: 0x35291b, trim: 0x7d8a63 },
  warden: { body: 0x3c4048, head: 0xb99175, hair: 0x1f1c19, trim: 0x8d8f96 },
  elder: { body: 0x4a4640, head: 0xc9b19a, hair: 0xb9b4ad, trim: 0x6e6a63 },
  sexton: { body: 0x2c3128, head: 0xa88a6d, hair: 0x2b2a24, trim: 0x5c6153 },
  barkeep: { body: 0x6a3f3a, head: 0xcaa387, hair: 0x54331f, trim: 0xb0785a },
  drunk: { body: 0x54492f, head: 0xbe9270, hair: 0x6d5a33, trim: 0x8a7a4e },
  smith: { body: 0x4b2f22, head: 0xb98a63, hair: 0x241c16, trim: 0xa9552a },
  herbalist: { body: 0x35513f, head: 0xd0b096, hair: 0x4b3a22, trim: 0x7fa384 },
  priest: { body: 0x23262c, head: 0xc5a68d, hair: 0xa8a49b, trim: 0xc0a45e },
  child: { body: 0x5b4a6b, head: 0xd2b193, hair: 0x3a2a1d, trim: 0x9782ab },
};

// Phaser text wants '#rrggbb'; every colour above is a number. Lives here so the
// two places that draw text don't each keep their own copy.
export function hex(n) {
  return `#${n.toString(16).padStart(6, '0')}`;
}

// One colour some of the way into another. What a bar that changes as it empties is
// made of, and what puts the light and the shadow on a rail without naming a third
// and fourth colour for every one that has them.
export function blend(a, b, t) {
  const at = (s) => (a >> s) & 255;
  const bt = (s) => (b >> s) & 255;
  const ch = (s) => Math.round(at(s) + (bt(s) - at(s)) * t) << s;
  return ch(16) | ch(8) | ch(0);
}
