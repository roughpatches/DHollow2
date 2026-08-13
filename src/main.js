import { TUNING, COLORS } from '../tuning.js';
import World from './scenes/World.js';
import Dialogue from './scenes/Dialogue.js';
import Menu from './scenes/Menu.js';
import Quest from './scenes/Quest.js';
import Skills from './scenes/Skills.js';
import Name from './scenes/Name.js';
import { report } from './placeholders.js';
import * as party from './party.js';
import * as town from './town.js';
import * as run from './run.js';
import * as story from './story.js';

// so a character can be levelled from the browser console while there is no content that
// does it yet: party.award('aldis', 40)
window.party = party;
// and so materials can be handed out before any activity produces them: town.give('timber', 20)
window.town = town;
// and so a run can be started without walking to the Sea Hag: run.start('fenedge')
window.run = run;
// and so the story can be inspected or pushed along: story.set('firstday-done')
window.story = story;

// unwritten text is announced on every boot, so it can't quietly accumulate
console.info(report());

// Nothing is drawn until the face is in. Phaser bakes a line of text to a texture the
// moment it is written, and a line baked against a fallback stays that shape.
await document.fonts.load(`16px ${TUNING.font}`);

// exposed so the game can be poked from the browser console
window.game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: TUNING.viewWidth,
  height: TUNING.viewHeight,
  backgroundColor: COLORS.bg,
  pixelArt: true,
  physics: { default: 'arcade', arcade: { gravity: { y: 0 } } },
  scene: [World, Dialogue, Menu, Quest, Skills, Name],
});
