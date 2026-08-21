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
  gridBodyPx: 34, // how tall anybody standing on a grid map is drawn, feet to head.
  // Nothing draws a grid map at present — every map in content/maps.js is a painted
  // panel — so this waits for the first one that does rather than matching the street.

  streetZoom: 2,
  // How tall anybody standing on a street is drawn, feet to head. Measured off the
  // paintings rather than picked: a doorway in DH2 is 45 pixels of opening, and a door
  // is a little over a person tall, so a person on the cobbles in front of one is about
  // this. It also draws the 64-pixel road exports at 1:1 — they are painted 62 pixels
  // from boot to crown — so their pixels land on the panel's pixels rather than being
  // resampled, which is most of why they used to read small.
  streetBodyPx: 62,
  streetReach: 30, // how near a door or a building you stand for [E] to reach it, in pixels
  streetHintSize: 14, // the name of whatever is within reach, written over the player's head
  streetHintRise: 22, // and how far over it
  // and how it comes and goes: a name that blinks on the frame you step into reach is a
  // flicker, and a walk down a row of doors is half a dozen of them. It fades instead,
  // and settles the last few pixels of the rise as it does.
  streetHintFadeMs: 130,
  streetHintLift: 3,
  // The pool at anybody's feet: how wide it is against how tall they are drawn, how deep
  // it is against its own width, and how much of the ground it takes. At zero nobody has
  // one, which is the game as it was.
  streetShadowWide: 0.5,
  streetShadowDeep: 0.3,
  streetShadowAlpha: 0.5,
  // A door and the end of a street are the same crossing: black, and then somewhere else.
  // Short enough that walking the town is not walking through curtains.
  streetFadeMs: 180,
  // The breath under anybody standing still between one thing and the next: how far they
  // rise, and how long a breath takes. A pixel is a breath at this size; two is a man who
  // has just run up the road.
  streetBreathPx: 1,
  streetBreathMs: 3400,

  // What goes up off a chimney (src/ambient.js). Only a panel that names its chimneys has
  // any; see `smoke` in content/maps.js.
  streetSmokePuffs: 28, // how many are climbing off one pot at once: enough that the
  // column reads as one thing rather than as a row of dots going up
  streetSmokePx: 7, // how wide one gets at the top of its climb; it leaves the pot at one
  streetSmokeRise: [11, 20], // how fast it climbs, in pixels a second
  streetSmokeClimb: [44, 82], // and how far it gets before it is gone, in pixels
  streetSmokeLean: [0.25, 0.6], // how far it goes sideways per pixel risen: the wind, and
  // one sign for the whole town, because it is one evening. Negative blows the other way.
  streetSmokeWobble: [2, 9], // and how far a puff wanders off that line, and over how many
  // pixels of climb it wanders there and back: what stops the column being a ruled edge
  streetSmokeAlpha: 0.75, // how solid a puff is when it leaves the pot
  streetSmokeRead: 14, // how far above the pot the sky it stands against is read
  streetSmokeContrast: 0.55, // and how far the smoke is pushed away from that sky: nothing
  // is a plume against a sky the same colour as itself
  streetSmokeSteps: 3, // and how many greys it thins through on the way up, rather than
  // every grey between here and gone: a painting blended against continuously is a smear

  // Light moving on painted water (src/ambient.js). Only a panel that draws a rect round
  // its sea has any; see `water` in content/maps.js.
  streetWaterTones: 2, // how many of a rect's commonest colours count as the water itself:
  // what is left is the boat and the jetty, and nothing is set down on those
  streetGlintPer: 6, // how many glints to a thousand pixels of water, so a wide harbour
  // and a gap between two roofs are lit at the same rate rather than in the same number
  streetGlintPx: 5, // how wide a dash gets at its brightest; it comes up at one. Long
  // enough to lie along the swell rather than sit on it like a star
  streetGlintMs: [900, 2600], // how long one takes to come up and go again
  streetGlintCut: 0.45, // how far into its turn it stays dark: a glint lit half the time is
  // a light rather than a glint
  streetGlintSteps: 3, // and how many levels it comes up through, for the same reason smoke
  // has them
  streetGlintAlpha: 0.85, // how solid it is at its brightest
  streetGlintContrast: 0.35, // and how far above the water's own colour that brightest is

  // Scud crossing a painted sky (src/ambient.js). Only a panel that draws a rect round its
  // clear sky has any; see `sky` in content/maps.js.
  streetDriftPer: 0.28, // how many streaks to a thousand pixels of sky, so a panel that is
  // mostly weather and one with a strip of it above the roofs are crossed at the same rate
  streetDriftLong: [16, 54], // how long one is, and
  streetDriftTall: [1, 3], // how thick: low cloud is drawn out, not piled up
  streetDriftPace: [5, 13], // how fast it crosses, in pixels a second
  streetDriftFade: 40, // and over how much of each end of its crossing it comes and goes,
  // so nothing appears at the edge of a rect that stops short of the edge of the panel
  streetDriftAlpha: 0.3, // how solid it is in the middle of the crossing: scud is thin,
  // and a sky already painted full of cloud does not want more laid over it opaque
  streetDriftSteps: 3, // in whole steps, for the same reason the smoke has them
  streetDriftContrast: 0.5, // and how far it is pushed off the sky's own colour

  // A lamp guttering (src/ambient.js). Only a prop that names a second, lit picture has
  // any; see PROPS in content/looks.js.
  streetFlickerMs: [2300, 870], // the two lengths the waver is made of. They do not divide
  // into each other, so the lamp never comes back round to where it was
  streetFlickerRange: [0.55, 1], // how far down the flame goes and how far up: never to
  // nothing, because a lamp somebody keeps lit is down rather than out
  streetGlowDark: 40, // how dark a pixel inside a lit window's rect has to be to count as
  // the glass rather than the sash across it: the glass on these windows reads about 15
  // and the bars about 100, so there is a wide gap to sit in
  streetFlickerSteps: 6, // in whole steps, for the same reason the smoke has them, but
  // more of them than the smoke gets: a flame this coarse has two lamps sitting on the
  // same step half the evening, and a row of lamps in step is a row wired together

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

  // Four a side and no more. The most that walk out of Dreadhollow on one job, and the
  // most that can be standing on the other side of a fight — one number because it is
  // one rule, and because a card that holds four rows holds four rows either way.
  partyMax: 4,

  // A run is a line of nodes with a fork before some of them. Node counts are
  // [least, most] and are rolled once the length is chosen.
  questNodes: { short: [4, 8], medium: [8, 12], long: [12, 16] },
  questForkChance: 0.34, // the chance a node is reached by a fork rather than walked into
  questForkWays: [2, 3], // and how many ways that fork offers, rolled per fork
  // Whether work taken off the board can be walked after dark. Off until there is night
  // content to walk; the quests that name `when: 'night'` themselves are unaffected.
  questNightOpen: false,
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
  questIdleDrift: 0.3, // and what is left of that when the party has stopped: standing at
  // a node the landscape keeps creeping, so a wood at rest is not a photograph. The ground
  // under their feet is not in this — it holds still with them. See src/walk.js.

  // Leaves coming down through a painted wood (src/ambient.js). Only a backdrop that says
  // `leaves` gets them; see content/places.js.
  questLeaves: 34, // how many are in the air at once
  questLeafPx: [3, 2], // how big one is, across and down, at its flattest
  questLeafFall: [10, 26], // how fast one comes down, in pixels a second, slowest to fastest
  questLeafSway: [14, 34], // how far it swings either side of where it was let go
  questLeafSwayMs: [1800, 3600], // and how long a swing takes
  questApproachMs: 1400, // how long a node takes to walk into view
  questConTweenMs: 500, // and how long the bar takes to catch up with it

  // The tally raised at the corner of the road when a node is done with (src/toast.js).
  questToastWidth: 300,
  questToastRow: 28, // one thing taken, and how much room it gets
  questToastIcon: 22,
  questToastInset: 14, // how far in from the corner of the road it hangs
  questToastFadeMs: 220,
  questToastStepMs: 90, // how long between one line landing and the next

  // The die thrown at a check, watched as it lands (src/roll.js). It is raised at the
  // near corner of the road while the tally goes up at the far one.
  questRollWidth: 380,
  questRollInset: 14, // how far in from the corner of the road it hangs
  questRollDial: 56, // the square the face turns up in
  questRollFaceSize: 26,
  questRollBandSize: 20, // how hard it was, said in words beside the dial
  questRollRow: 24, // one thing the party brought to it, and how much room it gets
  questRollChipGap: 16,
  questRollTicks: 20, // faces turned over before it settles
  questRollSpinMs: 900, // and how long the whole spin takes, slowing as it goes
  questRollLandScale: 1.25, // the thump when it stops
  questRollPauseMs: 180, // a beat before what the party brought starts coming in
  questRollStepMs: 200, // and how long between one line of it and the next
  questRollHoldMs: 1400, // how long the panel stands behind the word before it goes

  // And the word the throw is answered with, across the middle of the road. The card
  // under it is held back until this has been read — see src/scenes/Quest.js — so these
  // are also how long the party waits to be told what came of it.
  questFlashSize: 56,
  questFlashFrom: 0.7, // it comes up out of nothing
  questFlashTo: 1.15, // and goes off the front of the screen rather than simply fading
  questFlashInMs: 170,
  questFlashHoldMs: 520, // how long it is held before the card is let up behind it
  questFlashOutMs: 320,

  // How hard a check is, in words rather than in its DC: a party reads a climb, not a
  // number. Lightest green at the bottom, dark red at the top, and the last band takes
  // everything above it. Edit the thresholds, the names or the colours here and the dial
  // follows — nothing else reads this table.
  checkBands: [
    { upTo: 5, name: 'Very Easy', colour: 0xa9d98b },
    { upTo: 10, name: 'Easy', colour: 0x7fbf5c },
    { upTo: 15, name: 'Medium', colour: 0xc9b74a },
    { upTo: 20, name: 'Hard', colour: 0xd18b3c },
    { upTo: 25, name: 'Very Hard', colour: 0xc2532c },
    { upTo: 30, name: 'Legendary', colour: 0x8e2018 },
  ],

  // Mining (src/minigames/QuarryEngine.js): sound the face, then break it. StarScape
  // read these off a per-deposit richness table; there is one seam here and these are its
  // numbers.
  quarry: {
    // Sound — tap on the sweeping needle before the echo fades.
    prospect: {
      sampleCount: 5, // soundings taken before the read is done
      needleSpeed: 0.58, // how fast it sweeps, in bar-widths a second
      bandWidth: 0.17, // how much of the face rings back at once
      clarityDrainPerSec: 0.12, // the echo fading — the clock on the whole read
      clarityPerSample: 0.3, // and what a sounding puts back into it
      needleAccelPerSample: 1.05, // every reading is a little quicker than the last
    },
    // Break — charge-swing the pick at a weak point that will not sit still.
    mine: {
      chargeDurationMs: 1600, // a slower wind-up than the axe: this is deliberate work
      ventPerSec: 3.4,
      overchargeAt: 1.0, // past this the swing goes wild
      wildChip: 0.1, // and takes this off the face's stability
      fracturePerStrike: 0.11, // a clean deep blow, so about six of them break it out
      glanceFractureMult: 0.25,
      powerZone: { width: 0.2, min: 0.28, max: 0.88 }, // where the weak point sits
      zoneSpeed: 0.41, // and how fast it sweeps the face
      shockPerStrike: 0.13,
      shockDecayPerSec: 0.3, // shock cools between blows: the pause is the release valve
      shockRedAt: 0.7, // strike above this and the face cracks
      wildShockMult: 2.2,
      glanceShockMult: 1.5,
      deepFractureMult: 1.65, // the greedy gear
      deepShockMult: 1.9,
      shallowFractureMult: 0.7, // and the safe one
      shallowShockMult: 0.5,
      stabilityCrackOnStrike: 0.16,
      stabilityDrainPerSecInRed: 0.1, // a face left hot frets itself open
      stabilityRegenPerSec: 0.13, // and a cool one knits back
    },
  },

  // Cooking (src/minigames/MealEngine.js): cut it, then cook it and pull it in time.
  // StarScape scaled these by the ingredient's tier; a fire on the road has no tiers.
  meal: {
    // Board — tap on the beat as the blade crosses the line.
    prep: {
      cutCount: 8, // cuts before the prep is done
      beatIntervalMs: 700, // the tempo, steady and telegraphed
      perfTol: 0.05, // how near the line a tap has to land to be clean
      goodTol: 0.125, // and how near to be worth anything at all
    },
    // Fire — one bar filling one way, and one pull.
    cook: {
      doneRatePerSec: 0.05, // constant, and never a difficulty lever: 20 seconds to burnt
      burnAt: 1.0,
      window: {
        base: 0.16, // how wide the pull window opens
        floor: 0.1, // and the narrowest a run of bad tending can close it to
        ceil: 0.34, // or the widest good tending can open it
        highOffset: 0.04, // the window's top edge, under the burn point. It never moves.
      },
      cues: {
        countMin: 4, // how many times the pot asks for something, rolled per meal
        countMax: 7,
        firstAtDoneness: 0.08,
        responseWindowMs: 1800, // generous, and the same every time: recognition, not reflex
        widthReward: 0.08, // what a right answer opens the window by
        precisionBonus: 0.04, // and a little more for answering it promptly
        widthPenalty: 0.1, // a wrong or missed one closes it by this
        showKeyHint: true, // the arrow is printed with the verb
        visualOnly: false,
        verbs: ['flip', 'baste', 'season'], // left or right flips, up bastes, down seasons
      },
    },
  },

  // Smithing (src/minigames/SmeltEngine.js): the crucible, which is what a Smelting recipe
  // is. StarScape scaled these by the ore's tier and the tongs the smith had on; there is
  // one charge here and these are its numbers.
  smelt: {
    // The fire. The band is where the charge runs cleanest, and it sits under the gold
    // stretch of the painted gauge so the good heat is where the gauge says it is.
    sweetBand: { low: 0.5, high: 0.78 },
    warmTolerance: 0.1, // how far past the band is merely hot rather than scorching
    decayPerSec: 0.055, // an untended fire falls away in about twenty seconds
    pumpBurst: 0.1, // and a pump puts a tenth of the gauge back
    // What a pump costs the fire, in seconds off the clock every bench keeps — see
    // `fuel` above. Working the bellows has a price, and it is paid out of the same
    // wood everything else is paid out of.
    pumpFuelSec: 0.9,
    // The charge.
    purity0: 0.35, // what the ore is before anything is taken off it
    purityCeiling: 0.98, // and the best skimming alone will ever get it to
    meltRatePerSec: 0.032, // at the band; see HEAT_FACTOR in the engine for the rest
    oxidePerSec: 0.055, // what being held above the band costs the pool
    minMoltenToPour: 0.5, // below this the pot will not tip: half a charge is the least bar
    // The surface. A clump left past drossSetMs has set, and a set clump is half the
    // purity for twice the heat — the whole of why a skim is a thing to be prompt about.
    drossIntervalMs: 2500,
    drossJitterMs: 300, // so the rhythm cannot be counted
    drossSetMs: 2200,
    maxSurfaceDross: 4, // places on the surface; the fifth clump sinks the oldest
    drossSinkPenalty: 0.06, // and that is a purity loss nothing takes back
    baseSkims: 5, // how many skims are in a charge
    skimPurityGain: 0.09,
    skimPurityGainSet: 0.045,
    skimHeatCost: 0.045,
    skimHeatCostSet: 0.09,
    // The pour, read as the game reads work. The bar is what the charge was for, so the
    // pour is written into the judgments several times over: a run of clean skims poured
    // half-melted is not good work, and this is what says so. Six, because at three the
    // skims drowned it — a pot scorched to a fifth of its purity still scored 70%.
    pourWeight: 6,
    pourPerfectAt: 0.7, // purity, docked for what never ran, above which the bar is clean
    pourGoodAt: 0.5, // and above which it is worth having
    settleMs: 900, // how long the pot is left to be looked at before the tally
  },

  // The anvil (src/minigames/ForgeEngine.js), which is what a Forging recipe is. Three
  // things at once: the same bellows fire the crucible works, a hammer wound and released
  // against a sweeping zone, and the piece's soundness draining the whole time it is hot.
  // Everything above `jobs` is the anvil and is the same whatever is on it.
  forge: {
    // The fire, on the crucible's numbers so a smith who has smelted already knows it.
    sweetBand: { low: 0.5, high: 0.78 },
    warmTolerance: 0.1,
    decayPerSec: 0.05,
    pumpBurst: 0.11,
    pumpFuelSec: 0.8, // what a pump costs the bench's fire, in seconds off its clock
    // One key does the bellows and the hammer, and this is the line between them: a hold
    // that never got this far up the bar was a tap, and a tap is a pump.
    pumpBelow: 0.12,
    // The hammer. It winds slowly and vents fast, so the rhythm is wind, strike, wind.
    chargeDurationMs: 1500, // a full wind, from nothing to the top
    ventPerSec: 3.0,
    overchargeAt: 1.0, // held past this and the blow goes wild
    windHoldScale: 0.25, // what the fire and the stress run at while a blow is being wound
    // The zone the blow wants, sweeping end to end at one pace — the same pass every time,
    // so what is learnt is the rhythm and not the pattern.
    powerZone: { min: 0.22, max: 0.86, width: 0.2 },
    sweepSpeed: 0.34, // of the bar per second
    perfectWithin: 0.5, // how near the middle of the zone a blow has to be released
    perfectHeatWithin: 0.6, // and how near the middle of the band the fire has to be
    // What a blow does, and what a bad one costs.
    progressPerStrike: 0.1, // ten clean blows shape a piece
    heatPerStrike: 0.06, // and every one of them draws heat out of it
    stressPerSec: 0.05, // what being held hot costs the piece's soundness
    scorchChip: 0.16, // a blow struck off a burning piece
    coldChip: 0.06, // and off a cold one, which is cheaper and gets nothing done
    wildChip: 0.1, // a swing wound past the top of the bar
    // The tub. It gives the soundness back and takes the heat with it, which is the whole
    // of the decision: nobody quenches for free.
    quenchCoolPerSec: 0.5,
    quenchRegenPerSec: 0.14,
    settleMs: 900, // how long a finished piece is left to be looked at
    crackMs: 1200, // and how long a cracked one is
    // The three signature jobs. A recipe names one in `hard`, and a recipe naming none is
    // a plain piece: wind, strike, keep it hot, keep it whole.
    //   links   — a mail. Blows landed inside `windowMs` of each other chain, and every
    //             link in the chain is worth more, up to `maxBonus`. One off the beat and
    //             it starts again.
    //   edges   — a blade. The work turns over at halfway and the second edge is compared
    //             with the first; the gap between them is written into the judgments as
    //             `mismatchWeight` misses at worst.
    //   raising — plate. Every blow leaves the metal harder and doing less, up to `max`,
    //             and only the tub anneals it soft again.
    // `say` is the one line the bench puts in front of the player before they commit the
    // bars, the way a brew's tier says how many shapes are going in the pot.
    jobs: {
      links: {
        say: 'blows on the beat chain, and every link is worth more',
        windowMs: 1400, bonusPerLink: 0.12, maxBonus: 0.6,
      },
      edges: {
        say: 'it turns over at halfway, and the second edge is marked against the first',
        mismatchWeight: 6,
      },
      raising: {
        say: 'the metal hardens under the hammer, and only the tub softens it',
        perStrike: 0.07, max: 0.6, annealPerSec: 0.5,
      },
    },
  },

  // Alchemy (src/minigames/BrewEngine.js), which is what a Brewing recipe is: a shape
  // swelling in the pot and an outline to stop it inside, one for every ingredient going
  // in. Everything above the tiers is the pot itself and is the same at any difficulty.
  brew: {
    radius: { min: 12, max: 84 }, // how small and how full the shape gets, in pixels
    cycles: 3, // swells a shape gets before the measure is spoiled — the only clock
    settleMs: 420, // the pause between one ingredient and the next
    // What makes one potion harder than another, and the only thing that does. A recipe
    // names one of these in `hard`; one that names nothing gets the first written.
    //   shapes   — how many go in the pot.
    //   periodMs — how long a full swell takes, rolled per shape. A wide range is a quick
    //              one then a slow one, which is what a hand cannot settle into.
    //   perfTol  — how near the outline is dead on, as a fraction of the whole swell.
    //   goodTol  — and how near still counts for something.
    //   target   — where in the swell the outline is set, rolled per shape. Near 0 or 1 is
    //              a shape that hangs there and is easy; the middle is where it is quick.
    tiers: {
      simple: {
        shapes: 3, periodMs: [1500, 2100], perfTol: 0.055, goodTol: 0.13, target: [0.42, 0.72],
      },
      tricky: {
        shapes: 5, periodMs: [900, 1900], perfTol: 0.045, goodTol: 0.1, target: [0.34, 0.8],
      },
      wicked: {
        shapes: 7, periodMs: [550, 1800], perfTol: 0.035, goodTol: 0.08, target: [0.26, 0.86],
      },
    },
  },

  // Gem Cutting (src/minigames/GemEngine.js): a rough stone, the shape it is meant to
  // become laid over it, and a counted number of cuts to bring one down onto the other.
  // Everything above the tiers is the wheel and is the same whatever is on it.
  gem: {
    segments: 72, // how finely the rim is measured; the stone and the shape are both this
    nodes: 24, // and how many places round it a cut can be made. Divides by every `sides`
    // below, so every face of every shape has a node dead in the middle of it — finding
    // that node is the skill, and the roll on the bite is what stops it being a routine.
    radius: 88, // how big the stone is drawn, in pixels
    inset: 0.97, // how far inside the tightest point of the stone the shape is set
    gougeWeight: 2.5, // material cut from under the shape counts this much worse than
    // material left standing proud: one is work not done and the other cannot be undone
    fitSpan: 0.3, // the error at which the fit readout reads nothing
    cutGouge: 0.09, // a cut that took this much from under the line is called a bad one
    cutTook: 0.05, // and one that took this much excess off is called a good one
    settleMs: 900, // how long the finished stone is left on the wheel to be looked at
    // What a cut stone comes out as, read against the quality the wheel scored — best
    // first, and a cut is the highest grade it clears. `worth` is how far one of the
    // gem's stats moves while it is worn; a tier three stone moves three of them, so a
    // Flawless Ruby is +3 to each of hit, harm and hit points. See content/gems.js.
    grades: [
      { id: 'flawless', name: 'Flawless', at: 0.85, worth: 3 },
      { id: 'fine', name: 'Fine', at: 0.6, worth: 2 },
      { id: 'regular', name: 'Regular', at: 0, worth: 1 },
    ],
    // What makes one stone harder than another. A recipe names one in `hard`.
    //   sides   — the shape it is cut to, and so how many faces it is scored on.
    //   cuts    — how many cuts there are. Never quite enough to be careful with them all.
    //   rough   — how lumpy the stone comes out of the ground.
    //   shallow / deep — the two bites. `nodes` is how much of the rim the wheel takes,
    //             rolled, and `over` is how far past the line it always goes: a wheel
    //             leaned on takes a little of the stone every time whatever you do, and a
    //             wheel touched to it barely does. That is the trade — deep clears a face
    //             in one and costs a little of it, shallow costs nothing and costs cuts.
    //   facePerfect / faceGood — how near a face has to sit to the shape to be called
    //             clean, and to be called a face at all. A tier three stone is read harder
    //             than a tier one: it is the same wheel and a different standard. Which
    //             tier a stone is cut at is its `hard` in content/recipes.js — basic for
    //             a tier one gem, fine for a tier two, master for a tier three.
    tiers: {
      basic: {
        sides: 8, cuts: 18, rough: 0.26,
        shallow: { nodes: [1, 2], over: 0.004 },
        deep: { nodes: [2, 3], over: 0.02 },
        facePerfect: 0.03, faceGood: 0.095,
      },
      fine: {
        sides: 6, cuts: 18, rough: 0.32,
        shallow: { nodes: [1, 2], over: 0.005 },
        deep: { nodes: [2, 4], over: 0.026 },
        facePerfect: 0.022, faceGood: 0.07,
      },
      master: {
        sides: 12, cuts: 22, rough: 0.34,
        shallow: { nodes: [1, 2], over: 0.004 },
        deep: { nodes: [2, 3], over: 0.022 },
        facePerfect: 0.013, faceGood: 0.045,
      },
    },
  },

  // What comes off the smithy's anvil, and how much of it. Gear is graded rather than
  // counted — one piece a job, and how well the work went decides what the piece is worth
  // — so this is the whole of the difference between a poor dagger and a good one. See
  // content/gear.js for the five pieces and src/gear.js for what wears them.
  gear: {
    // Read against the quality the forge scored, best first: a piece is the highest grade
    // it clears, and the last is written at zero so there is always one it makes. `worth`
    // is how far the piece's one stat moves while it is on.
    grades: [
      { id: 'masterwork', name: 'Masterwork', at: 0.85, worth: 3 },
      { id: 'sound', name: 'Sound', at: 0.55, worth: 2 },
      { id: 'rough', name: 'Rough', at: 0, worth: 1 },
    ],
    // How many stones a weapon, a shield or a piece of armour will hold, and it only holds
    // them at the top grade above: a socket is what a masterwork piece is for, and it is
    // the reason to forge one rather than settle for the piece you already have.
    // Jewellery ignores this and says its own count — see content/gear.js.
    socketsAtMasterwork: 1,
    // A point of guard and a point of hit are worth the same on a d20; a point of hit
    // points is not, against a fighter who starts with twenty-four of them. This is what
    // one step of `worth` buys in each number, so the five pieces read against each other
    // rather than against the die.
    scale: {
      hit: 1, harm: 1, guard: 1, hp: 3, con: 2,
    },
  },

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
  // Which of the three lines written for a piece of work is said afterwards. At or above
  // this it went well, under it middling, and a botched activity says the third whatever
  // the number. See `done` in content/nodes.js.
  workWellAt: 0.75,

  // The fire under a bench. Smelting, Cooking and Brewing are all somebody standing over
  // heat, so all three are on one clock: the work has to be finished before what was put
  // on the fire burns through. Gem cutting is a wheel and is not on it.
  //   worth        — what one of a thing is worth on the fire. Wood goes up with its tier
  //                  because a branch is kindling and heartwood is not, and coal is worth
  //                  a whole armful of branches, which is what makes it worth carrying
  //                  home off a face. Anything not written here does not burn.
  //   secondsPerUnit — how long one unit of that burns for. This and a recipe's `fuel` in
  //                  content/recipes.js are the whole of how long a job is allowed to take.
  //   spare        — fuel loaded over what the recipe asked for, as a fraction: a fire is
  //                  laid with a little more than the job needs, because a job that ends
  //                  the same second the fuel does is a job nobody ever finishes.
  fuel: {
    worth: {
      oakbranch: 1, oaklog: 3, heartwood: 5, coal: 10,
    },
    secondsPerUnit: 12,
    spare: 0.25,
    warnAt: 0.25, // the fraction left when the fire is said to be going
    outMs: 1100, // how long the dead fire is left in front of the player before the tally
  },

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

  // What one person carries, where their block in content/party.js does not say, counted
  // in slots. A run's pack is everybody's slots added together and it is drawn as a grid
  // of exactly that many squares: a full pack is a grid with no empty square in it. What
  // is worn on the cord is not carried and takes no slot. See src/run.js.
  carryDefault: 3,
  // How many of one thing go in a slot. Past this it takes another square, so a bulk haul
  // fills the grid and a handful of everything fills it faster. One number for everything
  // on purpose — the day a log should stack shallower than ore, this becomes a column in
  // content/materials.js and nothing else changes.
  stackMax: 20,

  // A stone is not part of what a face pays. It is a chance at the end of a shift that
  // went well, rolled once against the `stones` table a harvest carries — see
  // content/nodes.js. Work below stoneFloor finds nothing at all, and the chance climbs
  // from there to stoneBest at perfect work. Which stone it is, where one is found, is
  // the same tilt every other table is read with: how well it went says whether, and who
  // was brought says which.
  stoneFloor: 0.5,
  stoneBest: 0.35,

  // Fighting. What is fought and what it takes to fight it is in content/foes.js; these
  // are the numbers the system itself runs on, and they are the same for every fight.
  combat: {
    // What a character marked `combat` in content/party.js is worth, where their own
    // block does not say. A block naming none of these is a fighter of exactly this size.
    fighter: { hp: 24, hit: 2, guard: 12, harm: [3, 6] },
    hpPerLevel: 4, // added to a fighter's hit points for every level past the first
    ambushHit: 3, // what a foe adds to its opening blow at a fight walked into blind
    // Changing over mid-fight costs the whole turn — nobody swings — and the one coming
    // in takes what the foe makes of the gap. Somebody stepping in over a fighter who is
    // already down pays neither: the blow that put the last one down was that turn.
    swapOpens: 2,
    // Badly hurt: this far down and a side has decisions to make. A foe written to look
    // after itself pulls back behind a fresher one rather than dying in front of you —
    // costing them the blow they would have thrown, and handing your next swing the same
    // swapOpens their side pays. What comes back later comes back as hurt as it went.
    // It is also the point at which either side may try to leave the fight altogether.
    badlyHurt: 0.3,
    // Breaking off. It costs the turn whether or not it works — no swing, and the other
    // side takes the opening — and it is a bare d20 against this, because running is not
    // a thing anybody here is trained at.
    fleeDC: 11,
    fleeCon: 3, // and what getting away costs the pool: they came back at a run
    fleeXp: 0.5, // and what a node run away from is worth: half of it, for half a job

    // A move is played, not rolled for. Each one is one of the imported activity engines
    // in the numbers a single blow needs rather than a whole tree — the overrides below
    // are laid over that activity's own block in this file, so retuning Felling still
    // retunes the swing. See src/activity.js for which engine each is.
    // Each carries `words` as well: the same meters, called what they are in a fight
    // rather than what they are in the wood. An engine keeps its own word for anything
    // not named here, so a label added to an engine turns up in its trade's language
    // until somebody writes the fighting one.
    swing: {
      // One swing ends it however badly it went, which is a floor and not a preference:
      // a glancing blow adds a fifth of this and a wild one three tenths, so anything
      // under five would quietly make a bad swing take two turns to throw.
      cutPerSwing: 6,
      words: {
        cut: 'Blow',
        lean: 'Footing  (keep your weight in the band)',
        face: 'Swinging: ◄ HIGH   (→ to come in low)',
        back: 'Swinging: LOW ►   (← to come in high)',
        power: 'Swing — hold SPACE, let go as it opens up',
        sound: 'Balance',
        status: '← high   → low',
        good: 'SOLID',
        glance: 'GLANCED OFF',
      },
    },
    drive: {
      fracturePerStrike: 5, // and the pick, whose worst blow is a quarter: four or more
      words: {
        fracture: 'Blow',
        shock: 'Exposure  (every wind-up is time it can see you)',
        stability: 'Footing',
        power: 'Drive — hold SPACE, put it in where it is open',
        deep: 'Going THROUGH it — hard, and you are wide open    [Left] ease off',
        shallow: 'Going SHORT — safe, and it hardly tells    [Right] commit',
        perfect: 'STRAIGHT THROUGH!',
        good: 'IN IT',
        glance: 'TURNED ASIDE',
      },
    },
    cover: {
      durationMs: 2200,
      lineIntegrity: null, // a hold, and one nobody can fail
      words: {
        prompt: 'Hold SPACE to keep your guard on it',
        label: 'guard',
        holding: 'The guard is where it needs to be.',
        slipping: 'It is coming round the side of you.',
      },
    },
    // What playing it well is worth. Quality is the engine's own 0..1 — see
    // activityWorth — and it is the whole of what a blow does: full harm at perfect,
    // less the worse it went, and never under the floor, because a bad swing is still
    // a swing. A guard covers by the same fraction, and a turn played well lands more
    // often as well as harder.
    harmFloor: 0.4,
    playHit: 4,
    // A fighter at zero hit points is out of the run: their own constitution comes off
    // the party's pool, because a body being carried is not a body walking. Somebody else
    // who fights steps up; nobody left who fights and the party turns for home.
    faintCon: 1, // what fraction of their constitution the pool loses. One is all of it.
  },

  questHpHeight: 10, // the slim bar under the constitution, one per fighter on the run

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

  maxLevel: 9, // the game's ceiling, and what the chapel's last stage caps at
  conPerLevel: 3, // added to a character's own constitution for every level past the first
  xpBase: 40, // leaving level n costs xpBase * n, so levels get longer at a steady rate
  // Experience is only ever spent on the level. What a level buys is points, and the
  // points are spent on skills by hand — the player's on the Skills tab, everyone else's
  // as they are earned. Nothing else in the game raises a skill.
  skillPointsPerLevel: 2,

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
  menuPortraitHeight: 200, // the painted landscape at the top of a zone's page, at most
  menuPortraitEdge: 8, // and the frame it is set in, all the way round
  menuFactRow: 34, // the Environment and Resources rows at the foot of a zone's page
  menuFactIcon: 22, // and how big an icon is on one of them
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

  // The slim bars under it: a fighter's own hit points, and — while a fight is on — what
  // is left of the thing they are fighting. The party's runs green to the same red the
  // constitution goes to; the foe's is its own colour, so the two are never confused.
  hpFull: 0x7f9f5a,
  hpLow: 0xa8341f,
  foeFull: 0x8a4a5e,
  foeLow: 0x3a2028,

  // What is behind the town. The paintings carry no sky — it is transparent in them, so
  // the weather is the game's to draw — and where a panel has a hole in it you are looking
  // through at the water. Retint here and every panel's weather follows.
  skyHigh: 0x232a37, // overhead, where the dusk is furthest along
  skyLow: 0x6d616a, // and down at the water, where the last of the light is
  skyCloud: 0x2f3543, // the banks lying across it
  skyCloudLit: 0x8a7a74, // and their undersides, catching what is left
  seaFar: 0x55606b, // steel, out at the horizon
  seaNear: 0x2c3540, // and darker close in
  // and no crest colour: the light on this water is its own colour brought up, the same
  // way it is on the painted harbour — see streetGlintContrast above

  // What comes off a chimney. Pitched at the middle of what the five panels have behind
  // their pots — a sky that runs from near-black over the burying ground to bright cloud
  // over the tavern — so the same smoke is darker than the pale skies and lighter than the
  // dark ones, and reads against all of them without a colour per panel.
  streetSmoke: 0x555a63,

  // What is burning behind the Sea Hag's windows. Taken off the flame in art/props/
  // lamp_lit.png, so the tavern and the lamps outside it are lit by the same fire — off the
  // body of that flame rather than its dim edge, which is grey enough that a window filled
  // with it looks painted beige rather than lit.
  streetGlow: 0xf6d0a9,

  // The light a panel stands in, laid over anybody standing in it. An export is painted at
  // full strength and the town it walks into is a dusk, so a body at full strength reads as
  // a sticker laid on the picture rather than somebody standing in it. White is no light at
  // all, and every step below it is the evening reaching one more thing.
  streetLight: 0xc6bfb8,
  streetShadow: 0x120e0c, // and the pool at their feet, which is what puts them on the ground

  // The word a check is answered with, across the road (src/roll.js). Green and red and
  // nothing subtler: it is the one thing on the screen at the moment it is up.
  rollHeld: 0x8fbf5f,
  rollLost: 0xc4402c,

  questNightFill: 0x0c0e14, // a run at night is drawn colder than one by day
  questNightEdge: 0x3f4a63,
  questSkyDay: 0x2c333c, // what the party is walking under in the middle band
  questSkyNight: 0x11141d,
  questNightTint: 0x6a7590, // laid over the landscape after dark
  // What is coming down through the Greywood. Read off the painting, but off the brightest
  // of it: a leaf in the air has the sky behind it and the canopy it falls past is nearly
  // black, so a leaf the colour of the canopy is a leaf nobody sees. Taken in turn rather
  // than at random, so a handful is never all one colour by chance.
  questLeaf: [0xa96423, 0xc24e68, 0x88422d, 0x9f435e],

  // What a placeholder item icon is made of (src/icons.js): the body of the thing, and
  // the mark on it. Retint here and every wooden thing changes at once.
  icon: {
    wood: [0x6b4f2a, 0x8a6b3c],
    stone: [0x6f7379, 0x9aa0a6],
    iron: [0x4a4f58, 0x878d96],
    bronze: [0x8a6a2f, 0xc9a95f],
    // the nine ores, tier by tier: green-crusted copper and black tin and blacker coal,
    // then iron's rust, mithril's bright thread and adamantium's blue, then the three
    // nobody has dug yet
    copper: [0x4f6b4a, 0xb06a4a],
    tin: [0x3f4348, 0x767c84],
    coal: [0x232225, 0x45414a],
    mithril: [0x7f8894, 0xdfe7f0],
    adamant: [0x2a3244, 0x5d7099],
    dwarf: [0x5b4a35, 0x9a7d4e],
    elf: [0x4a6b53, 0x9fc38a],
    holy: [0xb9b3a0, 0xf2ead2],
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
    // the nine stones, rough and cut off the same pair — see content/gems.js
    garnet: [0x6e1b22, 0xa8323b],
    agate: [0x8a8378, 0xd6cfc2],
    amethyst: [0x59407e, 0x9b7fc4],
    topaz: [0xa8752a, 0xe0b45c],
    sapphire: [0x27456f, 0x5b86bd],
    onyx: [0x1d1c20, 0x6a6870],
    diamond: [0x9fb4bd, 0xe6f1f5],
    emerald: [0x1f5a3c, 0x4f9a70],
    ruby: [0x7d1220, 0xc63347],
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
  // How an activity answers the player, moment to moment: the tint on a marker, a band,
  // a meter running out, and the word a swing is scored with. The engines came from
  // StarScape carrying its own brighter palette written into them a colour at a time —
  // a pure gold, a grass green, a red at full strength — which is a second game's
  // colours laid over this one's. These are the same eight things said in Dreadhollow's.
  // Retint here and every activity follows; nothing else reads them.
  uiJudgment: {
    perfect: 0xf0d68f, // the best a swing gets, and the brightest thing on the screen
    good: 0xc9a95f, // a swing that landed, and the resting colour of anything live
    held: 0x6f8f4a, // in the band, on the beat, holding: the work is going well
    near: 0xc08040, // a meter far enough along to be worth watching
    wild: 0xb5652f, // and past it — overcharged, overcooked, swung too hard
    danger: 0x9c5a46, // the stone cracking, the heat going, and the take worth striking
    // at — one red, because all three are the moment the player has to do something
    glance: 0x8b8578, // a swing gone off it: nothing gained and nothing broken
    edge: 0xd9d3c4, // the line a thing is cut against, which is not a judgment at all
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
