import { TUNING, COLORS } from '../tuning.js';
import World from './scenes/World.js';
import Dialogue from './scenes/Dialogue.js';
import Menu from './scenes/Menu.js';
import Quest from './scenes/Quest.js';
import Skills from './scenes/Skills.js';
import Craft from './scenes/Craft.js';
import Name from './scenes/Name.js';
import { report } from './placeholders.js';
import * as party from './party.js';
import * as town from './town.js';
import * as run from './run.js';
import * as story from './story.js';
import * as craft from './craft.js';

// so a character can be levelled from the browser console while there is no content that
// does it yet: party.award('aldis', 40)
window.party = party;
// and so materials can be handed out before any activity produces them: town.give('ironore', 20)
// and so a building can be put up a stage while no repair cost is written: town.raise('forge')
window.town = town;
// and so a run can be started without walking to the Sea Hag: run.start('fenedge')
window.run = run;
// and so the story can be inspected or pushed along: story.set('firstday-done')
window.story = story;
// and so a workstation can be stood at without walking to it: craft.recipesAt('forge')
window.craft = craft;

// unwritten text is announced on every boot, so it can't quietly accumulate
console.info(report());

// Nothing is drawn until the face is in. Phaser bakes a line of text to a texture the
// moment it is written, and a line baked against a fallback stays that shape.
await document.fonts.load(`16px ${TUNING.font}`);

// exposed so the game can be poked from the browser console
window.game = new Phaser.Game({
  type: Phaser.AUTO,
  backgroundColor: COLORS.bg,
  pixelArt: true,
  // The game is drawn at one size and shown at another. Everything inside it lays
  // itself out against TUNING.viewWidth / viewHeight and always will; the canvas is
  // then blown up to whatever the window is, keeping its shape, with the dark of the
  // page down the sides. Nothing in the game knows or cares how big the window is.
  //
  // The enlargement is not a whole number at most window sizes, so a pixel of the
  // painting lands on one and a bit pixels of the screen: the ironwork's thinnest
  // lines come out uneven and the lettering, which is drawn small and then enlarged,
  // goes ragged at the strokes. That is the cost of filling the screen at this
  // drawing size and it is meant to be looked at rather than argued about.
  scale: {
    parent: 'game',
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: TUNING.viewWidth,
    height: TUNING.viewHeight,
  },
  physics: { default: 'arcade', arcade: { gravity: { y: 0 } } },
  scene: [World, Dialogue, Menu, Quest, Skills, Craft, Name],
});
