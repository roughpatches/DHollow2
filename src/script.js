// Plays a scripted scene over the World: the verbs in content/scenes.js and nothing
// else. Each step calls back when it is finished, so a step that takes time
// holds the scene until it is done rather than the scene running on a timer.

import { TUNING } from '../tuning.js';
import { NPCS } from '../content/npcs.js';
import { walkAnim, proneKey } from './textures.js';
import { stand } from './art.js';
import * as story from './story.js';

const TS = TUNING.tileSize;

// a scene that has played is just another flag
export function hasPlayed(id) {
  return story.has(`scene:${id}`);
}

export function markPlayed(id) {
  story.set(`scene:${id}`);
}

// Runs one scene against a live World. The scene owns the player and the camera for
// its duration: World checks `scripted` before it hands control back.
export function play(scene, script, id) {
  markPlayed(id);
  scene.scripted = true;
  scene.frozen = true;

  let i = 0;
  const next = () => {
    if (i >= script.steps.length) {
      scene.scripted = false;
      scene.frozen = false;
      return;
    }
    const step = script.steps[i];
    i += 1;
    run(scene, step, next);
  };
  next();
}

// 'player' is an actor too, so a scene can walk them across a room
function actorFor(scene, npcId) {
  if (npcId === 'player') return scene.player;
  return scene.npcs.find((n) => n.def.id === npcId);
}

function run(scene, step, done) {
  if (step.wait) {
    scene.time.delayedCall(step.wait, done);
  } else if (step.walk) {
    walk(scene, actorFor(scene, step.walk), step.to, done);
  } else if (step.face) {
    const a = actorFor(scene, step.face);
    if (a) {
      a.facing = step.dir;
      stand(a, a.palette, step.dir);
    }
    done();
  } else if (step.say || step.narrate) {
    say(scene, step, done);
  } else if (step.choose) {
    choose(scene, step, done);
  } else if (step.name) {
    naming(scene, done);
  } else if (step.skills) {
    skills(scene, done);
  } else if (step.prone !== undefined) {
    prone(scene, step.prone);
    done();
  } else if (step.flag) {
    story.set(step.flag);
    done();
  } else if (step.fade) {
    fade(scene, step, done);
  } else if (step.go) {
    scene.scripted = false;
    scene.scene.restart({ map: step.go, spawn: step.spawn });
  } else {
    done();
  }
}

// straight line, one axis at a time, at the same pace anyone else walks
function walk(scene, actor, [tx, ty], done) {
  if (!actor) {
    done();
    return;
  }
  const x = tx * TS + TS / 2;
  const y = ty * TS + TS - 1;
  const leg = (toX, toY, after) => {
    const dist = Math.hypot(toX - actor.x, toY - actor.y);
    if (dist < 1) {
      after();
      return;
    }
    const dir = Math.abs(toX - actor.x) > Math.abs(toY - actor.y)
      ? (toX < actor.x ? 'left' : 'right')
      : (toY < actor.y ? 'up' : 'down');
    actor.facing = dir;
    actor.anims.play(walkAnim(actor.palette, dir), true);
    scene.tweens.add({
      targets: actor,
      x: toX,
      y: toY,
      duration: (dist / TUNING.walkSpeed) * 1000,
      ease: 'Linear',
      onComplete: after,
    });
  };
  leg(x, actor.y, () => leg(actor.x, y, () => {
    stand(actor, actor.palette, actor.facing);
    done();
  }));
}

// the live actor's def first, so the same person standing on two maps is still one
// person to a scene
function defOf(scene, id) {
  const actor = actorFor(scene, id);
  return actor ? actor.def : NPCS.find((n) => n.id === id);
}

function say(scene, step, done) {
  const def = step.narrate ? null : defOf(scene, step.say);
  const once = () => {
    scene.game.events.off('dialogue:end', once);
    scene.frozen = true; // World let go on dialogue:end; the scene has not finished
    done();
  };
  scene.game.events.on('dialogue:end', once);
  scene.game.events.emit('dialogue:start', {
    name: def ? def.name : '',
    lines: step.narrate || step.lines,
    portrait: def ? (def.portrait || def.palette) : null,
  });
}

// The player never speaks, so every choice they get is something they do. Which one
// they took is not kept anywhere: a branch that reconverges immediately is a beat in
// which the player moved, not a fork in the story. Give a step `sets` when one of them
// has to mean something later.
function choose(scene, step, done) {
  const once = () => {
    scene.game.events.off('choice:end', once);
    done();
  };
  scene.game.events.on('choice:end', once);
  scene.game.events.emit('choice:start', { options: step.choose });
}

// the one thing the game cannot know about the player at boot. See src/scenes/Name.js.
function naming(scene, done) {
  const once = () => {
    scene.game.events.off('name:done', once);
    done();
  };
  scene.game.events.on('name:done', once);
  scene.game.events.emit('name:choose');
}

// the same shape as a line of dialogue: the scene stops until the player has answered
function skills(scene, done) {
  const once = () => {
    scene.game.events.off('skills:done', once);
    done();
  };
  scene.game.events.on('skills:done', once);
  scene.game.events.emit('skills:choose');
}

function prone(scene, down) {
  const p = scene.player;
  if (!down) {
    stand(p, p.palette, p.facing || 'down');
    return;
  }
  p.anims.stop();
  p.setTexture(proneKey(p.palette));
}

function fade(scene, step, done) {
  const cam = scene.cameras.main;
  const ms = step.ms || 600;
  if (step.fade === 'out') {
    cam.once('camerafadeoutcomplete', done);
    cam.fadeOut(ms, 0, 0, 0);
  } else {
    cam.once('camerafadeincomplete', done);
    cam.fadeIn(ms, 0, 0, 0);
  }
}
