import { TUNING, COLORS } from '../tuning.js';
import World from './scenes/World.js';
import Dialogue from './scenes/Dialogue.js';
import Menu from './scenes/Menu.js';
import { report } from './placeholders.js';

// unwritten text is announced on every boot, so it can't quietly accumulate
console.info(report());

// exposed so the game can be poked from the browser console
window.game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: TUNING.viewWidth,
  height: TUNING.viewHeight,
  backgroundColor: COLORS.bg,
  pixelArt: true,
  physics: { default: 'arcade', arcade: { gravity: { y: 0 } } },
  scene: [World, Dialogue, Menu],
});
