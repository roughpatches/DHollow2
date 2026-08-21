// Everyone who walks a run: the player, and everyone who can be recruited onto one.
// One block each; add a character by adding a block.
//   id       — how src/party.js refers to them. Never shown.
//   you      — the player. They are on every run without being recruited, and their
//              skills are the three chosen in the hut rather than the three written
//              here, so the block below leaves them empty.
//   name     — shown in the menu and on the recruiting screen.
//   palette  — their sprite and portrait colours, from PALETTES in tuning.js, or the id
//              of a drawn look from content/looks.js if they have real art.
//   con      — their own constitution at level one. Levels add conPerLevel on top of it.
//              A run starts with everyone's added together and drains it as the party
//              walks; at zero they turn for home. It is the whole of what a run costs.
//   skills   — exactly skillsAtLevelOne ids from content/skills.js, against the points
//              spent on each. The points must add up to skillPointsAtLevelOne;
//              src/party.js complains to the console if either count is wrong. The
//              skills not listed are what they are untrained at, and they roll for
//              those on the die alone.
//   carry    — how many slots of the run's pack are theirs. A slot holds stackMax of one
//              thing and no more of it; past that it takes another. Everybody's added
//              together is the grid the party walks with, so who you take is how much you
//              can carry out as well as what you can do out there. Leave it out and it is
//              carryDefault in tuning.js.
//   fears    — ids from content/fears.js. A quest carrying one of these as a tag needs
//              a deeper bond before they will walk out on it.
//   combat   — the numbers they fight on, and carrying the line at all is what makes them
//              a fighter. Every night job needs one of them on it, because after dark the
//              road puts up things that have to be fought rather than worked around.
//              No skill and no score marks a fighter: this line does.
//                hp    — hit points, their own bar, full at the gate of every run and
//                        spent down by whatever they trade blows with. At zero they are
//                        out of that run. Levels add combat.hpPerLevel from tuning.js.
//                hit   — what they add to their own d20 when they swing.
//                guard — what a blow at them has to beat.
//                harm  — what one of their blows takes off, [least, most].
//              Leave any of the four out and it is the fighter default in tuning.js, so
//              `combat: true` is a fighter of exactly that size — and one the default can
//              still be retuned from, which a block repeating those numbers would not be.
//   needs    — a story flag they are not recruitable before. See src/story.js.
//   bond     — how well they know you at the start, in points. A band is bondPerBand
//              points, so 0 is a stranger and 9 is sworn. See tuning.js.
//   body     — who they are. Yours to write.
// Level, XP and the bond as it stands now live in src/party.js; the constitution a run
// has left lives on the run, in src/run.js. This file is only what a character starts as.
//
// Aldis, Ivo, Melovia and Aethelwynn are the recruits for now: the rest of the cast is
// being written. Everyone still standing around town in content/npcs.js is somebody to
// talk to, not somebody to take — a character becomes recruitable by getting a block here.
// The last two have their art and their numbers and nowhere to be met: nothing in
// content/npcs.js stands either of them anywhere yet.

export const PARTY = [
  {
    id: 'you',
    you: true,
    name: 'You',
    palette: 'player',
    con: 11, // Vitality, and the same number for the same reason
    carry: 4, // you are the one the pack is on
    // Filled in by the scene in Aldis's hut, which is on hold — so these three stand in
    // for the sheet until it is asked for again, and are overwritten the moment it is.
    // Three skills and six points, the same as everyone else was built with, and picked
    // to complement Aldis: he is the woodcraft, you are the rod and the axe.
    skills: { fishing: 3, woodcutting: 2, investigation: 1 },
    bond: 0,
    body: ['[Placeholder Text]'],
  },
  {
    id: 'aldis',
    name: 'Aldis Rooke',
    palette: 'aldis',
    con: 11,
    // His two Animal Handling points came onto Woodcraft in the merge. Perception stays
    // where it was; the spare point went to Woodcutting because he is the one who picks
    // the stand, and nobody else in town has a point of it.
    carry: 5, // he has carried wood out of that forest his whole life and it shows
    skills: { woodcraft: 3, investigation: 2, woodcutting: 1 },
    fears: ['thedead'], // the grave-pin in their pack that they have mentioned to nobody
    // no combat: he knows the Greywood, he does not fight it. The first job is day work
    // for that reason.
    bond: 9,
    body: ['[Placeholder Text]'],
  },
  {
    // The one person in Dreadhollow who will walk out after dark, and the only reason a
    // night job can be crewed at all. Name, look and body are placeholders: what is real
    // here is the `combat` line and the four numbers on it.
    id: 'ivo',
    name: 'Ivo Marchant',
    palette: 'warden',
    con: 11,
    // Three skills, six points, like everybody else. Nothing here is what makes them a
    // fighter — the line below is — but they are the second pair of eyes on the road at
    // night, which is what a night job's own roll usually asks for.
    carry: 2, // the one who fights walks with their hands free, and that costs the pack
    skills: { intimidation: 3, fording: 2, investigation: 1 },
    // A fighter at the size tuning.js says a fighter is. Written this way and not as the
    // four numbers over again, because the only fighter in the game repeating the
    // defaults would mean the defaults could never be retuned from.
    combat: true,
    needs: 'firstday-done', // they turn up once the first job is walked, and so does night work
    bond: 3, // acquainted: enough to come out on ordinary work without being courted first
    body: ['[Placeholder Text]'],
  },
  {
    // The herbalist. Herblore is the one gathering skill with no minigame behind it yet
    // and nobody else has a point of it, so she is what makes a Foraging node worth
    // walking to; the alchemy recipes already written have no other way in. The fording
    // point is worth a con apiece to everyone setting out over wetland.
    id: 'melovia',
    name: 'Melovia',
    palette: 'melovia',
    con: 11, // the cast's, until the drain a run costs is tuned end to end
    skills: { herblore: 3, alchemy: 2, fording: 1 },
    // Nothing written carries this tag, so it costs her nothing today and bites the first
    // time a job is tagged for ending badly. That is what it is for.
    fears: ['harm'],
    bond: 2, // a stranger one point off acquainted: she comes on herb work, not on the north road
    body: ['[Placeholder Text]'],
  },
  {
    // The blacksmith, and the whole of the iron in one person: neither smithing nor
    // mining is anywhere else in the cast. Persuasion rather than a fourth terrain point
    // because no zone is mountain yet and a point that buys nothing is not a point.
    id: 'aethelwynn',
    name: 'Aethelwynn',
    palette: 'aethelwynn',
    con: 11,
    skills: { smithing: 3, mining: 2, persuasion: 1 },
    // No fear. `leavingtown` is the lever if she should be the reluctant one, and it is a
    // heavy one: every quest written carries that tag, so it would shut her out of all but
    // the north road until she is sworn.
    // And no `combat` line: a smith with a hammer is the obvious second fighter, but Ivo
    // above is written as the only one, and a second changes what a night job is.
    bond: 3, // acquainted: she walks out on ordinary work without being courted first
    body: ['[Placeholder Text]'],
  },
];
