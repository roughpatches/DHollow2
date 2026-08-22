import { TUNING, COLORS, hex, blend } from '../../tuning.js';
import { SKILLS } from '../../content/skills.js';
import * as run from '../run.js';
import * as recruit from '../recruit.js';
import {
  roster, charOf, bandName, bandOf, scoreLine, scoreOf, skillsOf, skillOf,
  isCombat, nameOf, fill, YOU, carryTotal,
} from '../party.js';
import { stock, heldOf, nameOf as goodName } from '../town.js';
import { cutStones, fullName, worthLine, sideLine } from '../charm.js';
import {
  forged as forgedGear, wornIn, isWorn, wear as wearGear, shelfCount, setIn,
  firstTaking, cycleStone, willTake, socketLine, wornAll,
  fullName as gearName, worthLine as gearWorth, slotName, SLOTS,
} from '../gear.js';
import { MOVES, moveLine, saidCount } from '../combat.js';
import { iconKeyFor } from '../icons.js';
import { drawSlots, shapeOf } from '../slots.js';
import { createWalk } from '../walk.js';
import { framed, padOf, minOf, inkOf, hangOf } from '../frames.js';
import { rewardToast, clearToast } from '../toast.js';
import { rollCard, clearRoll } from '../roll.js';
import { markKey } from '../textures.js';
import { hasEngine, engineFor, hintFor } from '../activity.js';
import { fitCamera, crispType } from '../view.js';

// What a pan on a camp fire came to, in the few words the card has room for. Nothing is
// said about a pan that is still on it — the engine is drawing that.
function mealResult(meal) {
  if (!meal.result) return ' went on the fire';
  if (meal.result.failed) return ' — botched';
  const got = Object.entries(meal.result.made || {});
  return got.length
    ? ` — ${got.map(([m, n]) => `${n} ${goodName(m)}`).join(', ')}`
    : ' — and nothing came off it worth eating';
}

// The last row on a work card. It is written where the party can do exactly one thing
// here, because then leaving is the only other answer. A card with two things to do is
// already a question and does not need it.
const WALK_ON = 'Continue on.';
const walkRow = (node) => node.worked.length === 1;

const CARD = 'plaque'; // the panel a node's account is written on
const COLUMN = 'band'; // and the one stood on its end beside the road
const PIP = 'plate'; // and the small square a walked node is hung in, down on the trail

// The crawl. Runs over World, which freezes behind it. Three bands: the party's
// constitution across the top, the party walking the landscape in the middle, and the
// trail along the bottom — what they have walked, what they are standing in, and how many
// blanks are still ahead. A node is not a node until it has walked into view, so the card
// over the landscape only opens when they reach it.
export default class Quest extends Phaser.Scene {
  constructor() {
    super('Quest');
  }

  create() {
    fitCamera(this);
    crispType(this);
    this.sizeTo(null);

    this.layer = this.add.container().setDepth(29000).setVisible(false);
    this.open_ = false;
    this.row = 0;

    this.input.keyboard.on('keydown', this.onKey, this);
    // an axe swing is a key held and let go, so the release needs its own listener
    this.input.keyboard.on('keyup', (ev) => {
      if (this.open_ && this.activity && ev.key === ' ') this.activity.strike();
    });
    this.game.events.on('quest:board', this.openBoard, this);
    this.game.events.on('quest:start', this.openJob, this);
  }

  // The board, the hour and the crew are panels over wherever you are standing, because
  // you are still standing there. The crawl is not — once the party has set out the town
  // is no longer behind them, so it takes the whole screen.
  sizeTo(mode) {
    const p = mode === 'run' ? 0 : TUNING.questPad;
    this.box = { x: p, y: p, w: TUNING.viewWidth - p * 2, h: TUNING.viewHeight - p * 2 };
    // The frame is the margin. A screen is written inside the flat of whichever panel it
    // is drawn in, so nothing runs under the ironwork at either edge.
    const pad = padOf(this.frame(mode));
    this.left = this.box.x + pad.l;
    this.wide = this.box.w - pad.l - pad.r;
    this.top = this.box.y + pad.t;
    this.foot = this.box.y + this.box.h - pad.b;
  }

  // The board, the hour and the crew are opened standing in Dreadhollow, so they use the
  // town's parchment. The crawl uses the road's own ironwork, so the screen says they have
  // left town before a word of it is read.
  frame(mode = this.mode) {
    return mode === 'run' ? 'band' : 'parchment';
  }

  // what colour a line or a rule takes on whichever of the two the screen is
  ink(colour) {
    return inkOf(this.frame(), colour);
  }

  openBoard() {
    if (this.open_) return;
    this.mode = 'board';
    this.row = 0;
    this.open_ = true;
    this.swallow = true; // the keypress that closed Gregorious must not also pick a job
    this.layer.setVisible(true);
    this.draw();
    this.game.events.emit('quest:open');
  }

  // set out for somewhere named on the map: no board, straight to the questions
  openJob(id) {
    if (this.open_) return;
    const job = run.questOf(id);
    if (!job) return;
    this.open_ = true;
    this.swallow = true;
    this.layer.setVisible(true);
    this.take(job);
    this.draw();
    this.game.events.emit('quest:open');
  }

  // Taking a job means answering whatever it leaves open. Standing work off the board asks
  // all three — how long, when, where. A written job asks only the hour, and only if it
  // was written to leave that free.
  take(job) {
    this.job = job;
    this.times = job.procedural ? run.allTimes(job) : run.timesFor(job);
    this.size_ = job.size || run.SIZES[0];
    this.where_ = job.at || null;
    this.row = 0;
    if (job.procedural) this.mode = 'length';
    else if (this.times.length === 1) this.toRecruiting(this.times[0]);
    else this.mode = 'when';
  }

  // the hour chosen, and then the place if the job did not come with one
  pickTime(when) {
    if (!run.timeOpen(this.job, when)) return; // there is nothing out there to walk yet
    this.when_ = when;
    this.row = 0;
    if (this.job.procedural) this.mode = 'where';
    else this.toRecruiting(when);
  }

  close() {
    this.open_ = false;
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0)'); // the town is behind it again
    this.layer.setVisible(false);
    this.activity = null;
    this.scrim?.destroy();
    this.scrim = null;
    this.walk?.destroy();
    this.walk = null;
    clearToast();
    clearRoll();
    this.holding = false;
    run.clear();
    this.game.events.emit('quest:close');
  }

  update(time, delta) {
    this.swallow = false;
    this.activity?.update(time);
    if (!this.walk) return;
    this.walk.update(delta);
    if (this.walkMark) this.walkMark.setX(this.trailX());
    const r = run.active();
    if (r && r.state === 'running' && r.phase === 'fork') this.walk.setMoving(false);
  }

  onKey(ev) {
    if (!this.open_ || this.swallow) return;
    const k = ev.key.toLowerCase();

    if (this.mode === 'board') {
      const jobs = run.offered();
      if (k === 'escape') this.close();
      else if (k === 'arrowup' || k === 'w') this.row = (this.row - 1 + jobs.length) % Math.max(1, jobs.length);
      else if (k === 'arrowdown' || k === 's') this.row = (this.row + 1) % Math.max(1, jobs.length);
      else if ((k === 'enter' || k === ' ') && jobs.length) {
        this.take(jobs[this.row]);
      }
      this.draw();
      return;
    }

    // How long a walk. Standing work only: a written job is as long as it was written.
    if (this.mode === 'length') {
      // a job reached from the Map tab has no board behind it to back out onto
      if (k === 'escape') { if (this.job.at) this.close(); else { this.mode = 'board'; this.row = 0; } }
      else if (k === 'arrowup' || k === 'w') this.row = (this.row + run.SIZES.length - 1) % run.SIZES.length;
      else if (k === 'arrowdown' || k === 's') this.row = (this.row + 1) % run.SIZES.length;
      else if (k === 'enter' || k === ' ') {
        this.size_ = run.SIZES[this.row];
        this.row = 0;
        // a job fixed to one hour has nothing to ask, so it goes straight past it
        if (this.times.length === 1) this.pickTime(this.times[0]);
        else this.mode = 'when';
      }
      this.draw();
      return;
    }

    if (this.mode === 'when') {
      const n = this.times.length;
      if (k === 'escape') {
        if (this.job.procedural) { this.mode = 'length'; this.row = 0; }
        else if (this.job.at) this.close();
        else { this.mode = 'board'; this.row = 0; }
      }
      else if (k === 'arrowup' || k === 'w' || k === 'arrowleft' || k === 'a') this.row = (this.row + n - 1) % n;
      else if (k === 'arrowdown' || k === 's' || k === 'arrowright' || k === 'd') this.row = (this.row + 1) % n;
      else if (k === 'enter' || k === ' ') this.pickTime(this.times[this.row]);
      this.draw();
      return;
    }

    // And where. Standing work only, for the same reason: a written job is set out for
    // from wherever it was written to be set out for from.
    if (this.mode === 'where') {
      const places = run.zones();
      if (k === 'escape') { this.mode = this.times.length > 1 ? 'when' : 'length'; this.row = 0; }
      else if (k === 'arrowup' || k === 'w') this.row = (this.row + places.length - 1) % places.length;
      else if (k === 'arrowdown' || k === 's') this.row = (this.row + 1) % places.length;
      else if ((k === 'enter' || k === ' ') && places.length) {
        this.where_ = places[this.row].id;
        this.toRecruiting(this.when_);
      }
      this.draw();
      return;
    }

    if (this.mode === 'party') {
      const all = roster();
      if (k === 'escape') {
        if (this.job.procedural) { this.mode = 'where'; this.row = 0; }
        else if (this.times.length > 1) { this.mode = 'when'; this.row = 0; }
        else if (this.job.at) this.close();
        else { this.mode = 'board'; this.row = 0; }
      }
      else if (k === 'arrowup' || k === 'w') this.row = (this.row - 1 + all.length) % all.length;
      else if (k === 'arrowdown' || k === 's') this.row = (this.row + 1) % all.length;
      else if (k === ' ') this.toggleWalker(all[this.row].id);
      else if (k === 'enter' && this.crewed()) this.toPacking();
      this.draw();
      return;
    }

    // What goes out with them. The cursor walks the shelves as a grid — up and down are a
    // row, left and right a square — so Space and Backspace are what move a stack rather
    // than an arrow. The crew is behind this screen and the road is in front of it.
    if (this.mode === 'pack') {
      const rows = this.packRows();
      const n = Math.max(1, rows.length);
      const { cols } = this.shelfShape();
      const step = (d) => { this.row = ((this.row + d) % n + n) % n; };
      if (k === 'escape') { this.bring = {}; this.mode = 'party'; this.row = 0; }
      else if (k === 'arrowup' || k === 'w') step(-cols);
      else if (k === 'arrowdown' || k === 's') step(cols);
      else if (k === 'arrowleft' || k === 'a') step(-1);
      else if (k === 'arrowright' || k === 'd') step(1);
      else if (k === ' ') this.packMore(rows[this.row], 1);
      else if (k === 'backspace') this.packMore(rows[this.row], -1);
      else if (k === 'e') this.equip(rows[this.row]);
      else if (k === 'enter') this.begin(this.when_);
      this.draw();
      return;
    }

    const r = run.active();
    // A throw still in the air takes the next key and nothing else does. The die comes down
    // where it stands and the card comes up behind it, so nobody presses past the one thing
    // they were waiting on.
    if (this.holding) { this.landRoll(); return; }
    if (this.activity) {
      // The engine has the controls: space winds up and releases, and every arrow is passed
      // through by the name of its direction. An engine ignores what it has no use for —
      // the axe takes two arrows, the pot takes all four. Nothing else is listening.
      if (k === ' ') this.activity.chargeStart();
      else if (k === 'arrowleft' || k === 'a') this.activity.setSide('left');
      else if (k === 'arrowright' || k === 'd') this.activity.setSide('right');
      else if (k === 'arrowup' || k === 'w') this.activity.setSide('up');
      else if (k === 'arrowdown' || k === 's') this.activity.setSide('down');
      return;
    }
    if (r.state !== 'running') {
      if (k === 'enter' || k === 'e' || k === ' ') { if (!this.turnPage()) this.close(); }
      else if (k === 'escape') this.close();
      return;
    }
    // A full pack with something standing in front of it. Dropping is the only way to
    // make room, and leaving it is always on the card: nobody is trapped in here.
    if (r.phase === 'pack') {
      const cells = run.packCells();
      const n = Math.max(1, cells.length);
      const cols = shapeOf(this.bands().walk.w - 28, n, TUNING.menuIconCell).cols;
      const step = (d) => { this.row = ((this.row + d) % n + n) % n; };
      if (k === 'arrowup' || k === 'w') step(-cols);
      else if (k === 'arrowdown' || k === 's') step(cols);
      else if (k === 'arrowleft' || k === 'a') step(-1);
      else if (k === 'arrowright' || k === 'd') step(1);
      else if ((k === 'enter' || k === ' ') && cells[this.row]) {
        run.dropSquare(this.row);
        this.row = Math.min(this.row, Math.max(0, run.packCells().length - 1));
      } else if (k === 'escape' || k === 'e') { run.leaveOffer(); this.row = 0; }
      this.draw();
      return;
    }


    // The pack, at a camp. A number key and not the cursor: the cursor belongs to the
    // ways, and a party that stopped to eat has not answered the node yet.
    if (/^[1-9]$/.test(k) && !this.approaching) {
      const row = run.atHand()[Number(k) - 1];
      if (row) {
        run.takeAtHand(row);
        this.draw();
        return;
      }
    }
    // Who steps up. The only choice a party gets about a fight before it starts, and the
    // one they get again the moment somebody is carried.
    if (r.phase === 'fighter') {
      const up = run.standing();
      if (k === 'arrowup' || k === 'w') this.row = (this.row + up.length - 1) % up.length;
      else if (k === 'arrowdown' || k === 's') this.row = (this.row + 1) % up.length;
      else if (k === 'enter' || k === ' ' || k === 'e') { run.stepUp(up[this.row]); this.row = 0; }
      else if (k === 'escape') run.abandon();
      this.draw();
      return;
    }
    // And the fight: one thing off the card every turn, until one of them is down.
    if (r.phase === 'fight') {
      const ways = this.fightWays();
      if (k === 'arrowup' || k === 'w') this.row = (this.row + ways.length - 1) % ways.length;
      else if (k === 'arrowdown' || k === 's') this.row = (this.row + 1) % ways.length;
      else if (k === 'enter' || k === ' ' || k === 'e') {
        const way = ways[this.row];
        if (way.move) run.fightMove(way.move.id);
        else if (way.flee) run.fightFlee();
        else run.swapIn(way.swap);
        this.row = 0; // whoever is up next is asked from the top of their own list
      } else if (k === 'escape') run.abandon();
      this.draw();
      return;
    }
    if (r.phase === 'beat') {
      const b = r.nodes[r.at].beat;
      const opts = b.choose;
      if (this.approaching) return; // it has not got here yet
      if (opts) {
        // the cursor steps over a way the party cannot take rather than landing on it
        const step = (d) => {
          for (let i = 1; i <= opts.length; i++) {
            const at = (((this.row + d * i) % opts.length) + opts.length) % opts.length;
            if (!run.shutTo(opts[at])) { this.row = at; return; }
          }
        };
        if (k === 'arrowup' || k === 'w') step(-1);
        else if (k === 'arrowdown' || k === 's') step(1);
        else if (k === 'enter' || k === ' ' || k === 'e') { run.pickBeat(this.row); this.row = 0; }
        else if (k === 'escape') run.abandon();
      } else if (k === 'e' || k === ' ' || k === 'enter') { if (this.turnPage()) return; run.advance(); }
      else if (k === 'escape') run.abandon();
      this.draw();
      return;
    }
    // The description card. One key, the same one that turns any other page of writing.
    if (r.phase === 'read') {
      if (this.approaching) return; // they have not got to it yet
      if (k === 'e' || k === ' ' || k === 'enter') { if (this.turnPage()) return; run.readOn(); }
      else if (k === 'escape') run.abandon();
      this.draw();
      return;
    }
    // Two things standing here and light for one. Same shape as a scene's choice: the
    // cursor steps over work nobody walking can do rather than landing on it.
    if (r.phase === 'choose') {
      if (this.approaching) return; // they have not got to it yet
      const n = r.nodes[r.at];
      const hs = n.harvests;
      // the walking-on row is last and always open: it needs no skill
      const rows = hs.length + (walkRow(n) ? 1 : 0);
      const step = (d) => {
        for (let i = 1; i <= rows; i++) {
          const at = (((this.row + d * i) % rows) + rows) % rows;
          if (at === hs.length || hs[at].score) { this.row = at; return; }
        }
      };
      if (k === 'arrowup' || k === 'w') step(-1);
      else if (k === 'arrowdown' || k === 's') step(1);
      else if (k === 'enter' || k === ' ' || k === 'e') {
        if (this.row === hs.length) run.walkOn();
        else run.pickWork(this.row);
        this.row = 0;
      }
      else if (k === 'escape') run.abandon();
      this.draw();
      return;
    }
    if (r.phase === 'fork') {
      // two ways or three: the cursor walks the list rather than being told which end of
      // it each key means
      const ways = r.nodes[r.at].branches.length;
      if (k === 'arrowup' || k === 'w' || k === 'arrowleft' || k === 'a') this.row = (this.row + ways - 1) % ways;
      else if (k === 'arrowdown' || k === 's' || k === 'arrowright' || k === 'd') this.row = (this.row + 1) % ways;
      // the cursor belongs to the card it is on: whatever is drawn next starts at its top
      else if (k === 'enter' || k === ' ' || k === 'e') { run.choose(this.row); this.row = 0; }
      else if (k === 'escape') run.abandon();
    } else if (k === 'e' || k === ' ' || k === 'enter') {
      if (this.approaching) return; // it has not got here yet
      if (this.turnPage()) return;
      run.step();
      this.row = 0;
    } else if (k === 'escape') {
      run.abandon();
    }
    this.draw();
  }

  // --- drawing --------------------------------------------------------------

  // Everyone who will come is taken by default; the player pares that back. You are one
  // of the number the job asks for, so it wants job.party - 1 others — unless it names
  // more than that as people it will not go without.
  toRecruiting(when) {
    this.when_ = when;
    const must = (this.job.must || []).filter((id) => recruit.asked(id, this.job, when).willing);
    const rest = recruit.willing(this.job, when).filter((id) => !must.includes(id));
    // after dark a fighter is taken before anybody else, because the job will not go
    // without one and the default crew should not have to be corrected by hand
    if (run.needsFighter(when)) rest.sort((a, b) => isCombat(b) - isCombat(a));
    // you are one of the four, so the most anybody else can be is three
    this.taking = [...must, ...rest]
      .slice(0, Math.min(TUNING.partyMax - 1, Math.max(must.length, this.job.party - 1)));
    this.mode = 'party';
    this.row = 0;
  }

  // you are on it whoever else is, so you are counted in both of these
  crew() {
    return [YOU, ...this.taking];
  }

  crewed() {
    return this.crew().length >= this.job.party
      && (!run.needsFighter(this.when_) || run.hasFighter(this.crew()));
  }

  toggleWalker(id) {
    if ((this.job.must || []).includes(id)) return; // the job does not go without them
    if (this.taking.includes(id)) this.taking = this.taking.filter((x) => x !== id);
    else if (this.crew().length >= TUNING.partyMax) return; // four walk out and no more
    else if (recruit.asked(id, this.job, this.when_).willing) this.taking.push(id);
  }

  // The crew is settled, so what they can carry is settled. Packing is the last thing asked
  // before the gate, and it is asked here rather than in the town's menu because it is a
  // decision about this job: what is worth a square on this road, at this hour, with these
  // four.
  //
  // Two grids. The town's shelves on the left, where the cursor is, and the pack on the
  // right, which reads back what the left one has done. The pack is drawn at exactly the
  // number of squares the crew is worth, empties included, because the question is how
  // much room is left.
  toPacking() {
    this.bring = {};
    this.mode = 'pack';
    this.row = 0;
  }

  // What is still on the shelves, a square at a time: gear, then stones, then the town's
  // stock. Anything packed has left the shelf and is drawn in the other grid, so the two
  // together add up to what the town owns. A thing taken down to none keeps one empty
  // square so there is somewhere to put it back to, and a stone set in something keeps its
  // square for the same reason: settings are chosen from this grid, so it has to stay
  // something the cursor can reach.
  packRows() {
    const out = [];
    // Gear first and stones second, because neither of them costs a square and the two
    // decisions are one decision: what is worn, and what is set in it. The ore comes
    // after, where the arithmetic starts.
    for (const w of forgedGear()) out.push({ gear: true, w });
    for (const c of cutStones()) {
      out.push({ stone: true, key: c.key, gem: c.gem, grade: c.grade, n: shelfCount(c.key) });
    }
    for (const [id, n] of stock()) {
      const taken = (this.bring || {})[id] || 0;
      const shelf = n - taken;
      if (shelf <= 0) {
        if (taken > 0) out.push({ id, n: 0 });
        continue;
      }
      for (let left = shelf; left > 0; left -= TUNING.stackMax) {
        out.push({ id, n: Math.min(left, TUNING.stackMax) });
      }
    }
    return out;
  }

  // A square of the pack is stackMax of one thing. Taking and putting back both move a
  // square's worth, because a square is the unit the screen is drawn in.
  packSquares() {
    const cells = [];
    for (const [m, n] of Object.entries(this.bring)) {
      for (let left = n; left > 0; left -= TUNING.stackMax) {
        cells.push({ id: m, n: Math.min(left, TUNING.stackMax) });
      }
    }
    return cells;
  }

  packUsed() {
    return this.packSquares().length;
  }

  packRoom() {
    return carryTotal(this.crew()) - this.packUsed();
  }

  // How many more of one thing will go: what is left in its own part-filled square, plus
  // a whole square for every empty one. The same sum src/run.js does out on the road.
  roomFor(id) {
    const have = this.bring[id] || 0;
    const inLast = have % TUNING.stackMax;
    return (inLast ? TUNING.stackMax - inLast : 0) + this.packRoom() * TUNING.stackMax;
  }

  packMore(row, by) {
    if (!row) return;
    // A sword is on the belt, mail is on the body and a stone is in one or the other, so
    // none of them is in the pack and none can be put there. [E] is the only key they
    // answer, and it is the same key for both: put it on, or put it in.
    if (row.gear || row.stone) return;
    const have = this.bring[row.id] || 0;
    if (by > 0) {
      const take = Math.min(TUNING.stackMax, heldOf(row.id) - have, this.roomFor(row.id));
      if (take <= 0) return;
      if (take > 0) this.bring[row.id] = have + take;
    } else {
      const back = Math.min(TUNING.stackMax, have);
      if (!back) return;
      this.bring[row.id] = have - back;
      if (!this.bring[row.id]) delete this.bring[row.id];
    }
  }

  // One key does both halves of getting kitted out. On a piece it puts it on, and a second
  // press takes it off; putting on a second thing for the same slot sends the first back
  // to the shelf rather than losing it. On a stone it walks the stone along every setting
  // that will have it and then off the end — jewellery first, since a ring is what a
  // setting is for. Which setting it lands in matters: a stone in a ring is a skill, and
  // the same stone in a sword is a fight.
  equip(row) {
    if (!row) return;
    if (row.gear) { wearGear(row.w.uid); return; }
    if (row.stone) cycleStone(row.key);
  }

  // Why a stone will not go in, said in the words of whatever is stopping it. Nothing here
  // is a mistake to be corrected — it is a thing to go and forge, or a stone to go and cut.
  stoneWhy(row) {
    const worn = wornAll();
    if (!worn.length) return 'Nothing is on. A stone goes in something, and there is nothing to put it in.';
    if (!worn.some((w) => w.sockets.length)) {
      return 'Nothing on has a setting. Forge a ring, or bring a piece off the anvil at masterwork.';
    }
    const why = worn.map((w) => willTake(w.uid, row.key));
    if (why.includes('toofine')) return 'Too fine for bronze. That stone is waiting on a metal nobody here has.';
    if (why.every((r) => r === 'full' || r === 'nosocket')) return 'Every setting is full. Pull one out first.';
    return 'Nothing on will take it.';
  }

  // Where the two grids sit and how wide they are. The renderer draws to it and the keys
  // step by it, so the cursor never moves by a different number of columns than the eye.
  shelfShape() {
    const cell = TUNING.menuIconCell;
    const room = carryTotal(this.crew());
    const packWide = Math.min(this.wide * 0.4,
      Math.max(3, Math.min(shapeOf(this.wide, room, cell).cols, 5)) * cell);
    const shelfWide = this.wide - packWide - 28;
    return { cell, packWide, shelfWide, cols: shapeOf(shelfWide, 0, cell).cols };
  }

  packing() {
    const rows = this.packRows();
    const crew = this.crew();
    const room = carryTotal(crew);
    const cell = TUNING.menuIconCell;
    let y = this.top;

    y += this.text(this.left, y, this.job.label, TUNING.questTitleSize, COLORS.menuAccent).height + 4;
    y += this.text(this.left, y,
      `${crew.map((id) => nameOf(id)).join(', ')} — ${room} squares between them, `
      + `${TUNING.stackMax} of a thing to a square. `
      + 'Gear is worn and stones are set in it, so neither costs a square to bring.',
      TUNING.questBodySize, COLORS.menuDim, this.wide).height + 12;

    // the two headings, and under each of them its grid
    const { packWide, shelfWide } = this.shelfShape();
    const packX = this.left + shelfWide + 28;

    this.text(this.left, y, 'On the shelves', TUNING.menuRowSize, COLORS.menuDim);
    this.text(packX, y, `In the pack — ${this.packUsed()} of ${room}`, TUNING.menuRowSize,
      this.packRoom() ? COLORS.menuText : COLORS.menuMapMark);
    y += 24;

    const draw = (at, cells, sel, dimmed) => drawSlots(this, {
      at,
      cell,
      cells,
      sel,
      dimmed,
      ink: (c) => this.ink(c),
      add: (o) => this.layer.add(o),
      text: (x, ty, str, size, colour) => this.text(x, ty, str, size, colour),
    });

    const shelf = rows.map((r) => {
      if (r.gear) return { id: r.w.piece.id, n: 1, note: isWorn(r.w.uid) ? 'on' : '' };
      if (r.stone) return { id: r.gem.id, n: r.n, note: setIn(r.key) ? 'set' : r.n > 1 ? `x${r.n}` : '' };
      return { id: r.id, n: r.n, note: `${r.n}` };
    });
    const { cols: shelfCols } = this.shelfShape();
    while (!shelf.length || shelf.length % shelfCols) shelf.push(null);
    // A stone with none left on the shelf and none set in anything is drawn faint: it is
    // still pointed at, because settings are chosen here, but there is nothing to set.
    const bottom = draw({ x: this.left, y, w: shelfWide }, shelf, this.row,
      (c, i) => !!(rows[i] && rows[i].stone && rows[i].n < 1 && !setIn(rows[i].key)));

    const packed = this.packSquares();
    while (packed.length < room) packed.push(null);
    const packBottom = draw({ x: packX, y, w: packWide }, packed, -1);

    // What is worn, under the pack rather than in it. A line for every slot whether it is
    // filled or not, because an empty slot is the thing worth seeing, with its settings
    // under it: what is in a piece is as much a decision as which piece it is.
    let sy = packBottom + 10;
    sy += this.text(packX, sy, 'On the body', TUNING.menuRowSize, COLORS.menuDim).height + 4;
    for (const slot of SLOTS) {
      const w = wornIn(slot);
      sy += this.text(packX, sy,
        `${slotName(slot)}: ${w ? gearName(w.piece, w.grade) : 'nothing'}`,
        TUNING.questHintSize, w ? COLORS.menuText : COLORS.menuDim, packWide + 28).height + 2;
      if (!w) continue;
      const said = [gearWorth(w.piece, w.grade), socketLine(w)].filter(Boolean).join('  ');
      sy += this.text(packX + 12, sy, said,
        TUNING.questHintSize, COLORS.menuDim, packWide + 16).height + 2;
    }

    // what the cursor is on, said in full under both grids
    const r = rows[this.row];
    // Under whichever column ran longer — the shelf, or the pack with the slots below it.
    let ty = Math.max(bottom, sy) + 10;
    if (r && r.gear) {
      const { w } = r;
      const wearing = isWorn(w.uid);
      const in_ = wornIn(w.piece.slot);
      ty += this.text(this.left, ty, gearName(w.piece, w.grade), TUNING.menuRowSize, COLORS.menuAccent).height + 2;
      const where = wearing ? 'On you, and costing the pack nothing. [E] to take it off.'
        : in_ ? `${slotName(w.piece.slot)} is taken by ${gearName(in_.piece, in_.grade)}. [E] to put this on instead.`
          : `${slotName(w.piece.slot)} is empty. [E] to put it on — it takes no square.`;
      const holds = w.sockets.length
        ? ` ${w.sockets.length} setting${w.sockets.length === 1 ? '' : 's'}: ${socketLine(w)}.`
        : ' No settings — it was not good enough off the anvil to take one.';
      this.text(this.left, ty, `${gearWorth(w.piece, w.grade)}.${holds} ${where}`,
        TUNING.questHintSize, COLORS.menuDim, this.wide);
    } else if (r && r.stone) {
      const set = setIn(r.key);
      ty += this.text(this.left, ty, fullName(r.gem, r.grade), TUNING.menuRowSize, COLORS.menuAccent).height + 2;
      // A stone with a setting in view is told what it will be worth there and nothing else,
      // because the other half is no longer the question. A stone with nowhere to go is told
      // both halves, since that is what it is choosing between.
      const into = set || (r.n > 0 ? firstTaking(r.key) : null);
      const worth = into
        ? `${sideLine(r.gem, r.grade, into.piece.slot)} in your ${gearName(into.piece, into.grade).toLowerCase()}`
        : worthLine(r.gem, r.grade);
      const next = firstTaking(r.key);
      const where = set
        ? (next ? `[E] to move it to your ${gearName(next.piece, next.grade).toLowerCase()}.`
          : '[E] to take it back out.')
        : into ? '[E] to set it there.'
          : r.n > 0 ? this.stoneWhy(r)
            : 'Every one of them is already set in something.';
      this.text(this.left, ty, `${worth}. ${where}`,
        TUNING.questHintSize, COLORS.menuDim, this.wide);
    } else if (r) {
      const taking = this.bring[r.id] || 0;
      ty += this.text(this.left, ty, goodName(r.id), TUNING.menuRowSize, COLORS.menuAccent).height + 2;
      this.text(this.left, ty,
        `${heldOf(r.id) - taking} on the shelf${taking ? `, ${taking} in the pack` : ''}.`,
        TUNING.questHintSize, COLORS.menuDim, this.wide);
    } else {
      this.text(this.left, ty, 'The shelves are bare. You walk out with what you stand up in.',
        TUNING.questHintSize, COLORS.menuMapFolk, this.wide);
    }

    this.hint('[Arrows] Look    [Space] Take a square    [Backspace] Put it back    '
      + '[E] Put gear on, or set a stone in it    [Enter] Set out    [Esc] Back');
  }

  begin(when) {
    const r = run.start(this.job.id, when, this.taking,
      { size: this.size_, where: this.where_ }, this.bring || {});
    // The board and the crew are panels over the town, because the party is still standing
    // in it. Once they have set out they are not, so the crawl paints its own ground and
    // the town does not show through the ironwork.
    this.cameras.main.setBackgroundColor(COLORS.bg);
    this.mode = 'run';
    this.sizeTo(this.mode);
    this.row = 0;
    this.activity = null;
    this.walk?.destroy();
    this.walk = createWalk(this, this.bands().walk, r.party, when, run.backdropOf(this.job, r.where));
    this.con = null;
    this.shownAt = -1;
    this.toasted = -1;
    this.thrown = null;
    this.holding = false;
    this.approaching = false;
  }

  // The crawl is three bands inside the panel: the constitution bar across the top, the
  // party walking in the middle, the trail along the bottom. The middle band gives up a
  // column at its left edge to what the party can do, and the road starts where that
  // stops.
  bands() {
    const b = this.box;
    const pad = padOf('band');
    // The band over the road holds the constitution and, where anybody on the run fights, a
    // slim bar apiece under it. Hit points belong to each fighter, so they are not in the
    // pool and not on the pool's bar.
    const hp = this.fightersOn();
    const barY = hp.length
      ? b.y + pad.t + 2
      : b.y + (TUNING.questHeadHeight - TUNING.questBarHeight) / 2;
    const top = b.y + TUNING.questHeadHeight;
    const bottom = b.y + b.h - TUNING.questTrailHeight;
    const trailTop = bottom + pad.t + 4; // the ring around the goal reaches above its box
    // a party with nothing between them gives the road its width back
    const col = this.scored().length ? TUNING.questSkillWidth : 0;
    return {
      bar: { x: this.left, y: barY, w: this.wide, h: TUNING.questBarHeight },
      hp: hp.length
        ? {
          x: this.left,
          y: barY + TUNING.questBarHeight + 6,
          w: this.wide,
          h: TUNING.questHpHeight,
        }
        : null,
      skills: { x: b.x, y: top, w: col, h: bottom - top },
      // the road the party walks, and under it the land it is painted on, which is
      // everything down to the trail and out to both edges
      walk: {
        x: b.x + col,
        y: top,
        w: b.w - col,
        h: bottom - top,
        land: { x: b.x, y: b.y, w: b.w, h: bottom - b.y },
      },
      // the last line of the band belongs to the controls, so the trail stops above it
      trail: { x: this.left, y: trailTop, w: this.wide, h: this.foot - 22 - trailTop },
    };
  }

  draw() {
    this.sizeTo(this.mode);
    this.layer.removeAll(true);
    this.walkMark = null; // it went with the layer; the trail hangs a new one if it is walking
    const r = run.active();
    const night = this.mode === 'run' && r && r.when === 'night';
    // On the crawl the middle band is the landscape, so the panel paints only the strips
    // above and below it and leaves the walking party showing through between them.
    this.walk?.setVisible(this.mode === 'run');
    if (this.mode === 'run') this.chrome(night);
    else this.panel(night);
    if (this.mode === 'board') this.board();
    else if (this.mode === 'length') this.length();
    else if (this.mode === 'when') this.when();
    else if (this.mode === 'where') this.where();
    else if (this.mode === 'party') this.party();
    else if (this.mode === 'pack') this.packing();
    else this.crawl();
  }

  panel(night) {
    this.hang(this.frame(), this.box, night);
  }

  // the banner the bar is on, the banner the trail is on, and the landscape between them
  chrome(night) {
    const b = this.box;
    const band = this.bands();
    const under = band.walk.y + band.walk.h;
    this.hang('band', { x: b.x, y: b.y, w: b.w, h: band.walk.y - b.y }, night);
    this.hang('band', { x: b.x, y: under, w: b.w, h: b.y + b.h - under }, night);
  }

  hang(name, rect, night, turned) {
    for (const o of framed(this, name, rect, night, turned)) this.layer.add(o);
  }

  board() {
    const jobs = run.offered();
    let y = this.top;
    y += this.text(this.left, y, 'Gregorious has work', TUNING.questTitleSize, COLORS.menuAccent).height + 10;
    this.rule(y);
    y += 16;

    if (!jobs.length) {
      this.text(this.left, y, 'Nothing on the board. Come back when something has gone wrong.', TUNING.questBodySize, COLORS.menuDim, this.wide);
      this.hint('[Esc] Leave');
      return;
    }

    jobs.forEach((q, i) => {
      const on = i === this.row;
      const h = TUNING.questRowHeight;
      if (on) {
        // inside the flat of the frame: a row that bleeds past it is a row on the ironwork
        const g = this.add.graphics();
        g.fillStyle(this.ink(COLORS.menuSelectFill), 1);
        g.fillRect(this.left, y - 3, this.wide, h);
        g.fillStyle(this.ink(COLORS.menuAccent), 1);
        g.fillRect(this.left, y - 3, 2, h);
        this.layer.add(g);
      }
      const size = run.sizeOf(q);
      const times = run.timesFor(q);
      const when = times.length > 1 ? 'day or night' : `${times[0]} only`;
      const length = q.size || 'your length';
      // whether it can be walked at all is the first thing worth knowing about a job,
      // and after dark that includes whether anybody coming can fight
      const crewed = run.timesFor(q).some((t) => run.canStart(q.id, t));
      this.text(this.left + this.wide - 12, y, `${length} · ${size[0]}–${size[1]} nodes · ${q.party} to walk it · ${when}`,
        TUNING.menuRowSize, on ? COLORS.menuAccent : (crewed ? COLORS.menuRule : COLORS.menuMapFolk)).setOrigin(1, 0);
      this.text(this.left + 4, y, q.label, TUNING.menuRowSize, on ? COLORS.menuText : COLORS.menuDim);
      y += h;
    });

    y += 14;
    const q = jobs[this.row];
    this.rule(y);
    y += 14;
    y += this.text(this.left, y, q.goal, TUNING.questBodySize, COLORS.menuText, this.wide).height + 12;
    for (const para of q.body) {
      y += this.text(this.left, y, para, TUNING.questBodySize, COLORS.menuDim, this.wide).height + 10;
    }
    this.hint('[Up/Down] Choose    [Enter] Accept    [Esc] Leave');
  }

  // How far out? A length is a band and not a number — the road rolls its own count
  // inside it — so the band is what the screen says, along with what finishing it pays.
  length() {
    let y = this.top;
    y += this.text(this.left, y, this.job.label, TUNING.questTitleSize, COLORS.menuAccent).height + 6;
    y += this.text(this.left, y, 'How long a walk?', TUNING.questBodySize, COLORS.menuText).height + 10;
    this.rule(y);
    y += 16;

    run.SIZES.forEach((size, i) => {
      const on = i === this.row;
      const span = run.sizeOf(null, size);
      y += this.text(this.left, y, `${on ? '>' : ' '} ${size[0].toUpperCase()}${size.slice(1)}`,
        TUNING.questBodySize + 2, on ? COLORS.menuAccent : COLORS.menuDim).height + 4;
      y += this.text(this.left + 24, y, `${span[0]} to ${span[1]} nodes, rolled when you set out.`,
        TUNING.questBodySize, on ? COLORS.menuText : COLORS.menuRule, this.wide - 24).height + 4;
      y += this.text(this.left + 24, y,
        `Finishing it pays ${TUNING.questBonusXp[size]} xp each on top of everything the road paid.`,
        TUNING.questHintSize, on ? COLORS.menuDim : COLORS.menuRule).height + 14;
    });

    this.text(this.left, this.foot - 44, run.partyLine(), TUNING.menuRowSize, COLORS.menuText);
    this.hint('[Up/Down] Choose    [Enter] That long    [Esc] Back to the board');
  }

  // Set out when? What each hour costs is shown rather than described, so the choice is
  // made on what the run will be. An hour with nothing written to walk in it stays on the
  // screen and will not answer — it is coming, and the point is to say so.
  when() {
    let y = this.top;
    y += this.text(this.left, y, this.job.label, TUNING.questTitleSize, COLORS.menuAccent).height + 6;
    y += this.text(this.left, y, 'Set out when?', TUNING.questBodySize, COLORS.menuText).height + 10;
    this.rule(y);
    y += 16;

    this.times.forEach((t, i) => {
      const on = i === this.row;
      const open = run.timeOpen(this.job, t);
      const head = on ? COLORS.menuAccent : COLORS.menuDim;
      // an hour that will not answer still takes the cursor, or the player loses it
      y += this.text(this.left, y, `${on ? '>' : ' '} ${t === 'day' ? 'By day' : 'After dark'}`,
        TUNING.questBodySize + 2, open ? head : COLORS.menuRule).height + 4;
      if (!open) {
        y += this.text(this.left + 24, y, 'Not yet. Nothing has been written out there after dark.',
          TUNING.questBodySize, COLORS.menuRule, this.wide - 24).height + 14;
        return;
      }
      // the mix is the zone's once the zone is known, and everything drawable before that
      y += this.text(this.left + 24, y, run.mixAt(t, this.where_), TUNING.questBodySize,
        on ? COLORS.menuText : COLORS.menuRule, this.wide - 24).height + 4;
      const cost = t === 'night'
        ? `The road takes ${TUNING.questNightCon}× the constitution and pays ${TUNING.questNightXp}× for it. Will not go out without a fighter.`
        : 'Constitution and pay as written. Nothing out there to fight.';
      y += this.text(this.left + 24, y, cost, TUNING.questHintSize,
        on ? COLORS.menuDim : COLORS.menuRule).height + 14;
    });

    this.text(this.left, this.foot - 44, run.partyLine(), TUNING.menuRowSize, COLORS.menuText);
    this.hint('[Up/Down] Choose    [Enter] Set out    [Esc] Back');
  }

  // And where. A place is its ground, what is in it, and what the hour will be made of once
  // you are standing there. Those three are what separate one place from another.
  where() {
    const places = run.zones();
    let y = this.top;
    y += this.text(this.left, y, this.job.label, TUNING.questTitleSize, COLORS.menuAccent).height + 6;
    y += this.text(this.left, y, 'Walk out where?', TUNING.questBodySize, COLORS.menuText).height + 10;
    this.rule(y);
    y += 16;

    if (!places.length) {
      this.text(this.left, y, 'Nowhere is open to walk yet.', TUNING.questBodySize, COLORS.menuDim, this.wide);
      this.hint('[Esc] Back');
      return;
    }

    places.forEach((p, i) => {
      const on = i === this.row;
      y += this.text(this.left, y, `${on ? '>' : ' '} ${p.label}`,
        TUNING.questBodySize + 2, on ? COLORS.menuAccent : COLORS.menuDim).height + 4;
      const ground = run.groundLine(this.job, this.crewOrRoster(), p.id);
      if (ground) {
        y += this.text(this.left + 24, y, ground, TUNING.questBodySize,
          on ? COLORS.menuText : COLORS.menuRule, this.wide - 24).height + 4;
      }
      y += this.text(this.left + 24, y, run.mixAt(this.when_, p.id), TUNING.questHintSize,
        on ? COLORS.menuDim : COLORS.menuRule, this.wide - 24).height + 14;
    });

    this.text(this.left, this.foot - 44, run.partyLine(), TUNING.menuRowSize, COLORS.menuText);
    this.hint('[Up/Down] Choose    [Enter] Out that way    [Esc] Back');
  }

  // Who the ground would be read by, before anybody has been picked: everybody who could
  // come. The crew screen says it again for the crew actually going.
  crewOrRoster() {
    return [YOU, ...roster().map((c) => c.id)];
  }

  // Who will come, who will not, and the arithmetic behind both. A refusal the player
  // cannot account for reads as unfair, so the sum is on the page.
  party() {
    const all = roster();
    const short = this.job.party - (1 + this.taking.length); // you are already on it
    let y = this.top;

    this.text(this.left + this.wide, y + 4, `${this.when_ === 'night' ? 'after dark' : 'by day'}`,
      TUNING.menuRowSize, this.when_ === 'night' ? COLORS.menuMapMark : COLORS.menuDim).setOrigin(1, 0);
    y += this.text(this.left, y, this.job.label, TUNING.questTitleSize, COLORS.menuAccent).height + 6;
    const others = this.taking.length === 1 ? 'one other' : `${this.taking.length} others`;
    const coming = this.taking.length ? `You and ${others} coming` : 'You, and nobody else';
    const full = this.crew().length >= TUNING.partyMax;
    y += this.text(this.left, y,
      short > 0 ? `Needs ${this.job.party}. ${coming} — ${short} short.`
        : `Needs ${this.job.party}. ${coming}.${full ? `  ${TUNING.partyMax} is the most that walk out.` : ''}`,
      TUNING.questBodySize, short > 0 ? COLORS.menuMapFolk : COLORS.menuText).height + 10;
    // the night rule is said on the screen where the crew is picked, because that is
    // the only screen where it can be answered
    if (run.needsFighter(this.when_)) {
      const armed = run.hasFighter(this.crew());
      y += this.text(this.left, y,
        armed
          ? 'Something out there will have to be fought. Somebody coming can.'
          : 'Something out there will have to be fought. Nobody coming can.',
        TUNING.questBodySize, armed ? COLORS.menuText : COLORS.menuMapFolk, this.wide).height + 10;
    }
    // the ground, and what this crew is worth on it — half the reason to take somebody
    const ground = run.groundLine(this.job, this.crew(), this.where_);
    if (ground) {
      y += this.text(this.left, y, ground, TUNING.questBodySize, COLORS.menuMapMark, this.wide).height + 10;
    }
    // the job's own roll is named before the crew is picked, because it is the reason
    // to pick one crew over another
    if (this.job.check) {
      const ch = this.job.check;
      y += this.text(this.left, y, `The last node asks a ${skillOf(ch.skill).name} roll at DC ${ch.dc}.`,
        TUNING.questHintSize, COLORS.menuMapMark).height + 8;
    }
    this.rule(y);
    y += 14;

    all.forEach((c, i) => {
      const a = recruit.asked(c.id, this.job, this.when_);
      const on = i === this.row;
      const taken = this.taking.includes(c.id);
      const required = (this.job.must || []).includes(c.id);
      const mark = required ? '[!]' : taken ? '[x]' : a.willing ? '[ ]' : ' × ';
      const colour = taken ? COLORS.menuAccent : a.willing ? COLORS.menuText : COLORS.menuRule;
      // what they are worth is on the row itself: it is half of why you take somebody,
      // and after dark whether they fight is the other half
      const worth = skillsOf(c.id).map((t) => `${t.name} ${t.rank}`).join('   ')
        + (isCombat(c.id) ? '   fights' : '');
      this.text(this.left + this.wide, y + 2, worth,
        TUNING.questHintSize, on ? COLORS.menuDim : COLORS.menuRule).setOrigin(1, 0);
      y += this.text(this.left, y, `${on ? '>' : ' '} ${mark} ${nameOf(c.id)}`,
        TUNING.questBodySize, on ? colour : (taken ? COLORS.menuAccent : COLORS.menuDim)).height + 2;
      const why = required
        ? `This job does not go without them. ${recruit.why(c.id, this.job, this.when_)}`
        : recruit.why(c.id, this.job, this.when_);
      y += this.text(this.left + 40, y, why,
        TUNING.questHintSize, on ? COLORS.menuDim : COLORS.menuRule, this.wide - 40).height + 10;
    });

    // you are on it whoever else is, so you are in both readouts
    const crew = this.crew();
    this.text(this.left, this.foot - 66,
      run.partyLine(crew.map((id) => charOf(id))), TUNING.menuRowSize, COLORS.menuText);
    // the crew added up: what this party would be good at if it walked out now
    this.text(this.left, this.foot - 44, scoreLine(crew),
      TUNING.questHintSize, COLORS.menuDim);
    this.hint(this.crewed()
      ? '[Up/Down] Look    [Space] Take or leave    [Enter] Pack for it    [Esc] Back'
      : '[Up/Down] Look    [Space] Take or leave    [Esc] Back');
  }

  // The pack, drawn as what it is: a grid with no empty square in it, and the thing that
  // will not go in named above it. The same widget as the shelves and the town's tab, so
  // a full pack is read the same way wherever the player meets one.
  packFull(rect) {
    const cells = run.packCells();
    const cell = TUNING.menuIconCell;
    // Sized to its own contents and hung on the same plaque a node's account is written
    // on, so the grid sits on the road's furniture rather than on the trees.
    const cols = shapeOf(rect.w - 56, cells.length, cell).cols;
    const rows = Math.max(1, Math.ceil(cells.length / cols));
    const pad = padOf(CARD);
    const high = pad.t + pad.b + 76 + rows * cell + 30;
    const box = { x: rect.x + 10, y: rect.y + rect.h - high - 10, w: rect.w - 20, h: high };
    this.hang(CARD, box, run.active().when === 'night');

    const on_ = (c) => inkOf(CARD, c);
    let y = box.y + pad.t;
    y += this.text(box.x + pad.l, y, 'The pack will not hold it.',
      TUNING.questTitleSize, on_(COLORS.menuAccent)).height + 4;
    y += this.text(box.x + pad.l, y, `${run.offerLine()} ${run.packLine()}`,
      TUNING.questBodySize, on_(COLORS.menuMapMark), box.w - pad.l - pad.r).height + 10;

    if (!cells.some(Boolean)) {
      this.text(box.x + pad.l, y, 'And nothing on their backs to put down. It stays where it is.',
        TUNING.questBodySize, on_(COLORS.menuMapFolk), box.w - pad.l - pad.r);
      return;
    }

    const bottom = drawSlots(this, {
      at: { x: box.x + pad.l, y, w: box.w - pad.l - pad.r },
      cell,
      cells,
      sel: this.row,
      ink: on_,
      add: (o) => this.layer.add(o),
      text: (x, ty, str, size, colour) => this.text(x, ty, str, size, on_(colour)),
    });

    const on = cells[this.row];
    if (on) {
      const brought = (r0) => ((run.active().brought || {})[r0] ? '  — carried out with you' : '');
      const said = `${on.n} ${goodName(on.id)}${brought(on.id)}`;
      this.text(box.x + pad.l, bottom + 10, said,
        TUNING.questBodySize, on_(COLORS.menuText), box.w - pad.l - pad.r);
    }
  }

  crawl() {
    const r = run.active();
    const band = this.bands();
    this.pages = 1;
    // what the card is showing, in one string: when it changes the card is read from the top
    const sig = `${r.state}:${r.at}:${r.phase}:${r.nodes[r.at]?.beat?.id || ''}`;
    // a throw still in the air belonged to the card showing when it was made, so moving on
    // takes it down with that card
    if (sig !== this.cardSig) { this.cardSig = sig; this.page = 0; clearRoll(); this.holding = false; }

    // A node the party has not walked up to yet is not a node they know anything about,
    // so the approach runs first and the card only opens when it has arrived.
    if (r.state === 'running' && r.phase !== 'fork' && this.shownAt !== r.at) {
      this.shownAt = r.at;
      this.approaching = true;
      this.walk.approach(run.kindOf(r.nodes[r.at].kind), () => {
        this.approaching = false;
        this.draw();
      });
    }
    if (r.state !== 'running' || r.phase === 'fork') {
      this.approaching = false;
      this.walk.pass();
    }

    // the controls are handed over wherever the activity phase came from: straight off
    // the node, or off the last beat of the walk up to it
    if (r.state === 'running' && r.phase === 'activity' && !this.approaching) this.startActivity();

    // The die, thrown the first time the card showing it is drawn. Keyed on the check
    // itself rather than the node, because every roll is its own object: a beat that rolls
    // a second time at the same node is a second throw, and a redraw is not.
    const throwing = !this.approaching ? this.rollShown(r) : null;
    if (throwing && this.thrown !== throwing) {
      this.thrown = throwing;
      this.holding = true; // and the card stays down until the word has been said
      rollCard(this, band.walk, throwing, r.when === 'night', () => {
        this.holding = false;
        this.draw();
      });
    }

    // What the node gave up, raised the moment it settles and taken down when the party
    // walks on. The card under it says nothing about what was paid, so the tally has to
    // stand as long as the card does. Raised once per node: the card is redrawn on every
    // keypress, and a tally that came back with each page turn could not be read past.
    const settled = r.state === 'running' && r.phase === 'node';
    if (!settled || this.toasted !== r.at) clearToast();
    if (settled && !this.approaching && !this.holding && this.toasted !== r.at) {
      this.toasted = r.at;
      rewardToast(this, band.walk, r.nodes[r.at], r.when === 'night');
    }

    this.conBar(r, band.bar);
    this.hpRow(r, band.hp);
    this.skills(r, band.skills);
    this.trail(r, band.trail);

    if (r.state === 'running' && r.phase === 'pack') this.packFull(band.walk);
    else if (r.state === 'running' && r.phase === 'fighter') this.card(band.walk, this.fighterLines(r), this.nodeHead(r));
    else if (r.state === 'running' && r.phase === 'fight') this.card(band.walk, this.fightLines(r), this.fightHead());
    else if (r.state === 'running' && r.phase === 'fork') this.card(band.walk, this.forkLines(r), 'The way splits.');
    else if (r.state === 'running' && r.phase === 'read' && !this.approaching) {
      this.card(band.walk, this.readLines(r), this.nodeHead(r), true);
    }
    else if (r.state === 'running' && r.phase === 'choose' && !this.approaching) {
      this.card(band.walk, this.workLines(r), this.nodeHead(r));
    }
    else if (r.state === 'running' && r.phase === 'activity') this.activityHead(r, band.walk);
    else if (r.state === 'running' && r.phase === 'beat' && !this.approaching && !this.holding) {
      // A beat can be the moment the thing on the road stops being there — the heron taking
      // flight rather than a tree coming down, but the same change of state. Called on
      // every draw of the beat rather than once on reaching it: the loop it starts is
      // played with ignoreIfPlaying, so calling it twice changes nothing.
      if (r.nodes[r.at].beat.leaves) this.walk.felled();
      this.card(band.walk, this.beatLines(r), this.nodeHead(r), !r.nodes[r.at].beat.choose);
    }
    else if (r.state === 'running' && !this.approaching && !this.holding) {
      // A node played out in its beats has said everything written for it by the time it
      // settles, so the card would be empty. Rather than stand an empty panel on the road
      // it is not hung at all: the tally is up, the hint says press on, and the landscape
      // is left to look at.
      const lines = this.nodeLines(r);
      if (lines.length) this.card(band.walk, lines, this.nodeHead(r), true);
      else this.pages = 1;
    }
    else if (r.state !== 'running') this.card(band.walk, this.endingLines(r), this.endHead(r), true);

    if (r.state === 'running' && this.holding) this.hint('The die is in the air.    [Any key] Bring it down');
    else if (r.state !== 'running') this.hint(this.page < this.pages - 1 ? '[Enter] Read on' : '[Enter] Back to town');
    else if (r.phase === 'pack') this.hint('[Arrows] Choose a square    [Enter] Tip it out    [Esc] Leave the rest');
    else if (r.phase === 'fighter') this.hint('[Up/Down] Who steps up    [Enter] Send them    [Esc] Turn back');
    else if (r.phase === 'fight') this.hint('[Up/Down] Choose    [Enter] Do it    [Esc] Break off');
    else if (r.phase === 'fork') this.hint('[Up/Down] Choose a way    [Enter] Take it    [Esc] Turn back');
    else if (r.phase === 'read' && !this.approaching) {
      const pack = this.campKeys();
      this.hint(`${this.page < this.pages - 1 ? '[E] Read on' : '[E] Press on'}${pack}    [Esc] Turn back`);
    }
    else if (r.phase === 'choose' && !this.approaching) {
      // Every work card is a question now, because leaving is always one of the answers.
      // A card with nothing on it anybody can do never gets this far.
      const pack = this.campKeys();
      this.hint(`[Up/Down] Choose    [Enter] Do it${pack}    [Esc] Turn back`);
    }
    else if (r.phase === 'activity') this.hint(this.activity ? hintFor(run.playing()) : 'Walking.');
    else if (r.phase === 'beat' && !this.approaching) {
      const pack = this.campKeys();
      this.hint((r.nodes[r.at].beat.choose
        ? '[Up/Down] Choose    [Enter] Do it'
        : `[E] ${this.page < this.pages - 1 ? 'Read on' : 'Go on'}`) + `${pack}    [Esc] Turn back`);
    }
    else {
      const pack = this.campKeys();
      this.hint(`${this.page < this.pages - 1 ? '[E] Read on' : '[E] Press on'}${pack}    [Esc] Turn back`);
    }
  }

  // What a fire adds to the hint line, and what nowhere else on the road does: the pack
  // is open here.
  campKeys() {
    return run.atHand().length ? '    [1-9] Cook, eat or drink' : '';
  }

  // The constitution, and nothing else on the band with it. It is the one readout that has
  // to be taken at a glance — at nothing the run is over where it stands — and a shortening
  // bar says that faster than a sentence would. What each node took is said on the card at
  // that node, where it happened.
  //
  // Iron, like everything else on the screen: a sunk trough, a rim lit along the top, and
  // a rivet at each end. What is left in them is the gold of the leaves, and it turns the
  // same red as it runs out.
  // A sunk trough with something left in it. The one shape every readout on the crawl is
  // made of: the constitution across the top, and the slim bars under it.
  trough(g, rect, frac, low, full) {
    const { x, y, w, h } = rect;
    g.fillStyle(COLORS.conTrough, 1);
    g.fillRect(x, y, w, h);
    g.lineStyle(1, blend(COLORS.conRim, 0x000000, 0.55), 1);
    g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

    const lit = Math.round((w - 4) * Math.max(0, Math.min(1, frac)));
    if (lit <= 0) return;
    const c = blend(low, full, frac);
    g.fillStyle(c, 1);
    g.fillRect(x + 2, y + 2, lit, h - 4);
    g.fillStyle(blend(c, 0xffffff, 0.32), 1); // the light along the top of it
    g.fillRect(x + 2, y + 2, lit, 1);
    g.fillStyle(blend(c, 0x000000, 0.4), 1);
    g.fillRect(x + 2, y + h - 3, lit, 1);
  }

  conBar(r, rect) {
    const frac = r.conMax ? Math.max(0, Math.min(1, r.con / r.conMax)) : 0;
    const { x, y, w, h } = rect;
    const g = this.add.graphics();
    this.layer.add(g);

    // the trough, sunk between the two caps that hold it to the panel
    const cap = TUNING.questBarCap;
    const tx = x + cap;
    const tw = w - cap * 2;
    this.trough(g, { x: tx, y, w: tw, h }, frac, COLORS.conLow, COLORS.conFull);

    // the caps: iron, lit along the top and shadowed under, with a rivet driven through
    for (const cx of [x, x + w - cap]) {
      g.fillStyle(COLORS.conRim, 1);
      g.fillRect(cx, y - 3, cap, h + 6);
      g.fillStyle(COLORS.conRimLit, 1);
      g.fillRect(cx, y - 3, cap, 1);
      g.fillStyle(blend(COLORS.conRim, 0x000000, 0.55), 1);
      g.fillRect(cx, y + h + 2, cap, 1);
      g.fillStyle(blend(COLORS.conRim, 0x000000, 0.5), 1);
      g.fillRect(cx + cap / 2 - 2, y + h / 2 - 2, 4, 4);
      g.fillStyle(COLORS.conRivet, 1);
      g.fillRect(cx + cap / 2 - 2, y + h / 2 - 2, 3, 3);
    }
  }

  // Everybody on the run who fights, in the order they were taken. Empty on a day run, or
  // on a night one crewed before anybody could fight — and then there is no second row.
  fightersOn() {
    const r = run.active();
    return r && this.mode === 'run' ? r.party.filter((id) => isCombat(id)) : [];
  }

  // The slim bars under the constitution: what each fighter has left, and — while a fight
  // is on — what is left of the thing they are fighting, at the far end of the row in its
  // own colour. A fighter who has been carried keeps their place and is drawn empty,
  // because the party is still carrying them.
  hpRow(r, rect) {
    const who = this.fightersOn();
    if (!rect || !who.length) return;
    const fight = run.fightingAt();
    const cells = who.length + (fight ? 1 : 0);
    const gap = 18;
    const wide = (rect.w - gap * (cells - 1)) / cells;
    const g = this.add.graphics();
    this.layer.add(g);

    const bar = (i, label, frac, low, full, dim) => {
      const x = rect.x + i * (wide + gap);
      const t = this.text(x, rect.y - 3, label, TUNING.questHintSize, dim ? COLORS.menuRule : COLORS.menuDim);
      const from = x + t.width + 8;
      this.trough(g, { x: from, y: rect.y, w: Math.max(24, x + wide - from), h: rect.h }, frac, low, full);
    };

    who.forEach((id, i) => {
      const max = run.hpMaxOf(id);
      const now = run.hpOf(id);
      const up = fight && fight.who === id;
      bar(i, `${up ? '▸ ' : ''}${nameOf(id)} ${now}/${max}`, max ? now / max : 0,
        COLORS.hpLow, COLORS.hpFull, !now);
    });
    if (fight) {
      // the one in front, and how many are still behind it waiting their turn
      const more = fight.rest.length ? ` +${fight.rest.length}` : '';
      bar(who.length, `${fight.foe.name}${more} ${fight.foeHp}/${fight.foeMax}`,
        fight.foeMax ? fight.foeHp / fight.foeMax : 0, COLORS.foeLow, COLORS.foeFull);
    }
  }

  // A card longer than the space under the road is read a page at a time. Returns
  // whether it took the keypress, so the caller only moves the party on once the last
  // page has been read.
  turnPage() {
    if (this.page >= this.pages - 1) return false;
    this.page += 1;
    this.draw();
    return true;
  }

  // What the party is worth at every skill it has any points in, best first — the same sum
  // the crew screen ends on. A skill nobody has would be a blank line rather than a
  // readout, so it is left out.
  scored() {
    const r = run.active();
    if (!r) return [];
    return SKILLS.map((skill) => ({ skill, n: scoreOf(r.party, skill.id) }))
      .filter((s) => s.n > 0)
      .sort((a, b) => b.n - a.n);
  }

  // Down the side of the road: what the party can do, kept in front of the player for the
  // whole run instead of being read once on the way out of town. The banner from the
  // sheet, stood on its end.
  skills(r, rect) {
    const rows = this.scored();
    if (!rows.length) return; // and a party with nothing between them gets no column
    this.hang(COLUMN, rect, r.when === 'night', true);

    const pad = padOf(COLUMN, true);
    const tall = rect.h - pad.t - pad.b;
    // spread down the column, however many of them there turn out to be
    const step = Math.min(TUNING.questSkillStep, tall / rows.length);
    let y = rect.y + pad.t + (tall - step * (rows.length - 1)) / 2;
    for (const { skill: t, n } of rows) {
      // centred on its own half of the column: the shapes are different widths and left
      // against a margin they read as a ragged edge rather than a list
      const icon = this.add.image(rect.x + pad.l + TUNING.questSkillPx / 2, y, iconKeyFor(t.id));
      // sized, not scaled: a drawn icon and the shape standing in for it are painted at
      // different sizes and both have to come out the same size in the column
      icon.setOrigin(0.5).setDisplaySize(TUNING.questSkillPx, TUNING.questSkillPx);
      this.layer.add(icon);
      this.text(rect.x + rect.w - pad.r - 6, y - 10, `${n}`, TUNING.questBodySize,
        COLORS.menuAccent).setOrigin(1, 0);
      y += step;
    }
  }

  // The trail along the bottom: what has been walked, what is being walked, and how many
  // blanks are still in front of them. A fork is a notch, the goal is ringed.
  trail(r, rect) {
    const n = r.nodes.length;
    const least = TUNING.questPipGap;
    // The road runs the width of the band. The nodes are spread across all of it rather
    // than bunched in the middle of it, and only close up when there are more of them
    // than the band will hold at the size a node is drawn.
    // A length of road at each end, so the first node is walked up to rather than stood
    // on from the off, and the goal has somewhere to sit that is not the edge of a panel.
    let lead = least;
    let side = Math.min(TUNING.questPipSize, rect.h);
    let step = n > 1 ? (rect.w - side - lead * 2) / (n - 1) : 0;
    if (n > 1 && step < side + least) {
      lead = 0;
      side = Math.max(10, (rect.w - least * (n - 1)) / n);
      step = side + least;
    }
    const x0 = rect.x + lead + side / 2;
    const cy = rect.y + rect.h / 2;
    const gap = step - side; // the length of road between two of them
    const night = r.when === 'night';
    const g = this.add.graphics();
    this.layer.add(g);
    // what the party's own mark is slid along, in update
    this.pips = { x0, step, cy, from: rect.x };

    r.nodes.forEach((node, i) => {
      const cx = x0 + i * step;
      const here = i === r.at;
      const behind = i < r.at || (here && !this.approaching && r.phase === 'node');
      const boxed = behind && !!node.kind;

      // the length of road to the next one
      if (i < n - 1) {
        g.fillStyle(blend(COLORS.conRim, 0x000000, 0.3), 1);
        g.fillRect(cx + side / 2, cy - 1, gap, 2);
        g.fillStyle(COLORS.conRimLit, 0.6);
        g.fillRect(cx + side / 2, cy - 1, gap, 1);
      }
      // a fork in it is a rivet driven through the road before the node it splits at
      if (node.fork) {
        const rx = cx - side / 2 - gap / 2;
        g.fillStyle(blend(COLORS.conRim, 0x000000, 0.5), 1);
        g.fillRect(rx - 2, cy - 2, 4, 4);
        g.fillStyle(COLORS.conRivet, 1);
        g.fillRect(rx - 2, cy - 2, 3, 3);
      }

      // A node they have walked is drawn as the thing that was standing in it. One still
      // ahead is a stud in the road and nothing more, because it is not anything yet: what
      // a node turns out to be is rolled when the party gets there.
      if (boxed) {
        // A node whose work belongs to a skill is drawn with that skill's own icon — the
        // axe where they cut, the rod where they fished — and one that is nobody's work
        // keeps the shape of its nature. The encounter names an activity and the skill
        // that claims it is looked up; neither has to name the other.
        const e = run.kindOf(node.kind);
        const skill = run.skillAt(node);
        // set in the small square, so what they have walked reads as a row of pictures
        // hung along the road rather than shapes floating over it
        this.hang(PIP, { x: cx - side / 2, y: cy - side / 2, w: side, h: side }, night);
        const mark = this.add.image(cx, cy, skill ? iconKeyFor(skill.id) : markKey(e.nature));
        // Fitted, not stretched: a silhouette squashed to a box stops being a silhouette.
        // Drawn inside the square's edge rather than across it, so the frame stays on top.
        const inner = side - TUNING.questPipInset * 2;
        mark.setScale(Math.min(inner / mark.width, inner / mark.height));
        // in its own colours, and dimmer the further back down the road it is: these are
        // dark already, and anything laid over them takes them to nothing
        if (!here) mark.setAlpha(0.6);
        this.layer.add(mark);
      } else {
        g.fillStyle(blend(COLORS.conRim, 0x000000, 0.4), 1);
        g.fillCircle(cx, cy, 6);
        g.fillStyle(here ? COLORS.conRivet : COLORS.conTrough, 1);
        g.fillCircle(cx, cy, 5);
      }
      // Where they are standing is ringed whether they have finished with it or not, and
      // the goal a ring further out. Round a stud and square round a square: a circle
      // drawn at a boxed node cuts its corners off.
      const ring = (colour, out) => {
        g.lineStyle(1, colour, 1);
        if (boxed) g.strokeRect(cx - side / 2 - out, cy - side / 2 - out, side + out * 2, side + out * 2);
        else g.strokeCircle(cx, cy, side / 2 + out);
      };
      // Not while they are still walking up to it: the mark sliding along the road is
      // where they are, and the node they are heading for is not that yet.
      if (here && !this.approaching) ring(COLORS.conRivet, 1);
      if (node.goal) ring(COLORS.conRimLit, 4);
    });

    // and the party themselves, somewhere on the road between the last node and the one
    // walking into view. Only while they are walking: standing at a node, the ring round
    // that node is where they are, and a second mark would say it twice.
    if (this.approaching) {
      const m = this.add.graphics();
      m.fillStyle(blend(COLORS.conRim, 0x000000, 0.5), 1);
      m.fillCircle(0, 0, TUNING.questPipYou + 1.5);
      m.fillStyle(COLORS.conRivet, 1);
      m.fillCircle(0, 0, TUNING.questPipYou);
      m.setPosition(this.trailX(), cy);
      this.layer.add(m);
      this.walkMark = m;
    }
  }

  // Where the party is along the trail: at the node they are standing on, or that far
  // between it and the one behind it. The first node is walked to from the end of the
  // band, because what is behind them there is the town.
  trailX() {
    const r = run.active();
    if (!r || !this.pips) return 0;
    const { x0, step, from } = this.pips;
    const to = x0 + Math.min(r.at, r.nodes.length - 1) * step;
    if (!this.approaching) return to;
    const back = r.at > 0 ? x0 + (r.at - 1) * step : from;
    return back + (to - back) * (this.walk ? this.walk.coming() : 1);
  }

  // Everything that happens at a node is said on one card over the landscape, so the party
  // and the ground they are standing on stay on screen while it is read. The card is a
  // plaque: a page held up over the road.
  card(rect, lines, head, paged) {
    const pad = padOf(CARD);
    const w = Math.max(Math.min(TUNING.questCardWidth, rect.w - 16), minOf(CARD).w);
    const wrap = w - pad.l - pad.r;
    const texts = [];
    for (const [str, size, colour] of lines) {
      texts.push(this.text(0, 0, str, size, inkOf(CARD, colour), wrap));
    }

    // A card as long as its account is a card over the whole road. It is read a page at
    // a time instead: as much as the space under the party will take, and the key that
    // moves the party on turns the page while there is one left. A card that asks a
    // question is never paged — the question and the ways out of it are one thing.
    const pages = [[]];
    let tall = 0;
    for (const t of texts) {
      if (paged && pages.at(-1).length && tall + t.height + 8 > TUNING.questCardBody) {
        pages.push([]);
        tall = 0;
      }
      pages.at(-1).push(t);
      tall += t.height + 8;
    }
    this.pages = pages.length;
    const at = Math.min(this.page, pages.length - 1);
    for (const [i, page] of pages.entries()) {
      if (i !== at) for (const t of page) t.destroy();
    }
    const shown = pages[at];
    const body = shown.reduce((n, t) => n + t.height + 8, 0);

    // the head, the paragraphs, and the frame's own margin above and below them
    const h = pad.t + 26 + body - 8 + pad.b;
    // Stood on the foot of the road and run the width of it, ending level with the
    // bottom of the column beside it: the two panels are one edge. Short enough that its
    // top is below the line everything stands on, so the party, the road and whatever
    // the party has walked up to are all still there while it is being read.
    const x = rect.x + 8;
    // by its bottom rail, not by the leaves hanging under it, so it lines up with the
    // column beside it rather than sitting the depth of those leaves above it
    const top = Math.max(rect.y + 10, rect.y + rect.h + hangOf(CARD) - h);
    this.hang(CARD, { x, y: top, w, h }, run.active()?.when === 'night');

    this.text(x + pad.l, top + pad.t - 4, head, TUNING.questBodySize + 4,
      inkOf(CARD, COLORS.menuText), wrap);
    let ty = top + pad.t + 26;
    for (const t of shown) {
      t.setPosition(x + pad.l, ty);
      this.layer.bringToTop(t); // measured before the frame was hung, so it is under it
      ty += t.height + 8;
    }
    // there is more of it: the same mark a page turn gets anywhere else
    if (at < pages.length - 1) {
      const g = this.add.graphics();
      g.fillStyle(inkOf(CARD, COLORS.menuDim), 1);
      const mx = x + w - pad.r;
      const my = top + h - pad.b - 9;
      g.fillTriangle(mx - 9, my, mx, my, mx - 4.5, my + 6);
      this.layer.add(g);
    }
  }

  // --- activities -------------------------------------------------------------
  // A node with an engine behind it hands the player the controls where they stand. The
  // landscape drops below the engine's own drawing so the party stays at the tree.

  startActivity() {
    const doing = run.playing();
    if (!hasEngine(doing) || this.activity) return;
    // a blow being played rather than a piece of work: the same handover, and a
    // different thing waiting at the end of it
    const blow = !!run.fightingAt();
    const pan = !blow && !!run.cookingAt();
    const band = this.bands().walk;
    // the landscape drops below the engine's own drawing, with a scrim between them so
    // the readouts are read against something rather than against a hedge
    this.walk.depth(-200);
    this.scrim = this.add.graphics().setDepth(-100);
    this.scrim.fillStyle(COLORS.menuFill, 0.82);
    this.scrim.fillRect(band.x, band.y, band.w, band.h);
    // the engine works on the road, not in the column beside it
    this.activity = engineFor(doing, this, {
      x: band.x + 40,
      top: band.y + 34,
      barW: Math.min(430, band.w - 80),
    });
    this.activity.start((judgments) => {
      const failed = this.activity?.failed;
      this.activity = null;
      this.scrim?.destroy();
      this.scrim = null;
      this.walk.depth(28900);
      if (blow) {
        run.fightPlayed({ judgments, failed });
      } else if (pan) {
        // A dinner is not a node: nothing was felled and nothing paid out but the pan.
        run.cookPlayed({ judgments, failed });
      } else {
        this.walk.felled(); // whatever was standing there is not standing any more
        run.settle({ judgments, failed });
      }
      this.draw();
    });
  }

  // just the name of the work over the top of it; the engine draws everything else. In a
  // fight it is who is swinging at what, because the node's name is not the news.
  activityHead(r, rect) {
    const n = r.nodes[r.at];
    const f = run.fightingAt();
    const pan = run.cookingAt();
    const said = f
      ? `${nameOf(f.who)} — ${f.foe.name}    ${run.hpOf(f.who)}/${run.hpMaxOf(f.who)} against ${f.foeHp}/${f.foeMax}`
      : pan ? `At the fire — ${pan.r.name}`
        : `${run.kindOf(n.kind).name} — ${run.activityOf(n)}`;
    this.text(rect.x + 12, rect.y + 4, said, TUNING.questBodySize + 2, COLORS.menuText);
  }

  // What is standing in front of them, and nothing about where along the road it is: the
  // trail says that, and a party does not count off the places they have been.
  nodeHead(r) {
    const n = r.nodes[r.at];
    const e = run.kindOf(n.kind);
    return `${e.name}${n.goal ? ' — the goal' : ''}`;
  }

  // The roll the die is thrown for right now, or nothing. A node's own check is thrown
  // when the node settles; a scene's is thrown on the beat that reads it back — the one
  // carrying `result` — so the way is chosen, the die answers it, and the account of the
  // attempt comes up behind the word.
  // The die brought down where it stands, because somebody pressed a key rather than
  // watching it. What was going to be said is not said; the card comes up instead.
  landRoll() {
    clearRoll();
    this.holding = false;
    this.draw();
  }

  rollShown(r) {
    if (r.state !== 'running') return null;
    const n = r.nodes[r.at];
    if (!n || !n.check) return null;
    if (r.phase === 'node') return n.check;
    if (r.phase === 'beat' && n.beat && n.beat.result) return n.check;
    return null;
  }

  nodeLines(r) {
    const n = r.nodes[r.at];
    const e = run.kindOf(n.kind);
    const out = [];
    // work nobody here can do: what the encounter is, and then the walking on
    const passed = run.passedLine(n);
    if (passed) {
      for (const para of e.body) out.push([para, TUNING.questBodySize, COLORS.menuDim]);
      out.push([passed, TUNING.questBodySize, COLORS.menuMapFolk]);
      return out;
    }
    // How the work went, in the words written for it. A node whose account was read on the
    // way in does not say it again here; one that was not — an authored scene, played out
    // in its beats — still does.
    // what was fought here, and what it cost, before anything is counted off it
    const won = run.wonLine(n);
    if (won) out.push([won, TUNING.questBodySize, COLORS.menuText]);
    for (const line of run.faintLines(n)) out.push([line, TUNING.questBodySize, COLORS.menuMapFolk]);
    const done = run.doneLine(n);
    if (done) out.push([done, TUNING.questBodySize, COLORS.menuText]);
    if (!n.shown) for (const para of e.body) out.push([para, TUNING.questBodySize, COLORS.menuDim]);
    // What the roll came to is the die's to say and the word's after it — all this card
    // carries is the line written for the way it went.
    if (n.check) {
      const said = n.check.pass ? n.check.held : n.check.lost;
      if (said) out.push([said, TUNING.questBodySize, COLORS.menuText]);
    }
    // What the node paid is on the tally raised over the road and nowhere else, down to the
    // stone that came up with the ore. This card is what was said about the work, and
    // nothing that was counted off it — no verdict on it either. How it went is in the
    // line written for the way it went, above, and in what came out of it.
    // And nothing about a missing engine. The card carries the writing and nothing else;
    // hasEngine in src/activity.js says which activities still have none, without spending
    // a line of the party's card on it.
    return [...out, ...this.packLines()];
  }

  // Who goes and stands in front of it. Asked when a fight starts with more than one
  // fighter on the run, and again the moment one of them is carried — which is the
  // reason to bring a second fighter at all.
  fighterLines(r) {
    const up = run.standing();
    if (this.row >= up.length) this.row = 0;
    const n = r.nodes[r.at];
    const out = [];
    for (const line of run.faintLines(n)) out.push([line, TUNING.questBodySize, COLORS.menuMapFolk]);
    out.push([up.length > 1 ? 'Who stands in front of it?' : 'Only one of you fights.',
      TUNING.questBodySize, COLORS.menuText]);
    up.forEach((id, i) => {
      const on = i === this.row;
      out.push([`${on ? '>' : ' '} ${nameOf(id)}    ${run.hpOf(id)}/${run.hpMaxOf(id)} hit points`,
        TUNING.questBodySize, on ? COLORS.menuAccent : COLORS.menuDim]);
    });
    return out;
  }

  // Everything that can be done with a turn: the three moves, and — where somebody else
  // on the run fights and is still up — changing over to them, which costs the turn.
  fightWays() {
    const f = run.fightingAt();
    if (!f) return [];
    return [
      ...MOVES.map((move) => ({ move })),
      ...run.standing().filter((id) => id !== f.who).map((swap) => ({ swap })),
      // last, and only once whoever is up is badly hurt, so the rows above it do not
      // move under the cursor the turn it appears
      ...(run.canBreakOff() ? [{ flee: true }] : []),
    ];
  }

  // Whoever is in front of the party right now, and how much of the band is behind it
  fightHead() {
    const f = run.fightingAt();
    return f.rest.length ? `${f.foe.name}, and ${saidCount(f.rest.length)} behind it` : f.foe.name;
  }

  // The fight itself: what the last exchange came to, and what can be done about the next
  // one. Never paged — the question and the answers are one card.
  fightLines(r) {
    const f = run.fightingAt();
    const ways = this.fightWays();
    if (this.row >= ways.length) this.row = 0;
    const tone = { us: COLORS.menuText, them: COLORS.menuMapFolk, said: COLORS.menuDim };
    // The last exchange and no further back. A fight with a band in it and a changeover
    // in the middle of it can put six lines on the card, and the card is over the road.
    const out = f.log.slice(-4).map(([line, side]) => [line, TUNING.questBodySize, tone[side]]);
    // What each way costs is written under the one the cursor is on rather than under all
    // of them: there are five rows here when the party is beaten and has somewhere to send
    // for, and five rows with a line each is a card taller than the road it hangs over.
    ways.forEach((way, i) => {
      const on = i === this.row;
      const head = way.move ? way.move.name
        : way.flee ? 'Break off' : `Send in ${nameOf(way.swap)}`;
      out.push([`${on ? '>' : ' '} ${head}`, TUNING.questBodySize,
        on ? COLORS.menuAccent : COLORS.menuDim]);
      if (!on) return;
      const said = way.move
        ? `${way.move.line}  (${moveLine(way.move, f)})`
        : way.flee
          ? 'Leave it standing and go, if you can.  '
            + `(the turn, a d20 against ${TUNING.combat.fleeDC}, `
            + `and it answers at +${TUNING.combat.swapOpens} if you do not get clear)`
        // what they have left is on the bar above; what it costs is the news here
          : `They come across, you come out.  (the turn, and it answers at +${TUNING.combat.swapOpens})`;
      out.push([`    ${said}`, TUNING.questHintSize, COLORS.menuText]);
    });
    return out;
  }

  // An authored encounter, a beat at a time: what the party sees, what the bird says,
  // and — where the beat is a choice — what they can do about it. A cry is drawn apart
  // from the narration around it, because it is a noise and not a sentence.
  beatLines(r) {
    const n = r.nodes[r.at];
    const b = n.beat;
    const out = [];
    // the cursor never rests on a way the party cannot take, including the first draw
    if (b.choose && run.shutTo(b.choose[this.row])) {
      this.row = Math.max(0, b.choose.findIndex((o) => !run.shutTo(o)));
    }
    for (const para of b.text || []) {
      if (typeof para === 'string') {
        out.push([fill(para, n.actorId), TUNING.questBodySize, COLORS.menuDim]);
      } else if (para.cry) {
        out.push([fill(para.cry, n.actorId), TUNING.questBodySize, COLORS.menuMapMark]);
      } else {
        // somebody on the road saying it, named the way a fork's reading is named
        out.push([`${nameOf(para.who)}: ${fill(para.line, n.actorId)}`,
          TUNING.questBodySize, COLORS.menuText]);
      }
    }
    // The way as it was written and nothing under it, the same as the ways at a node: who
    // would take it and what they would be throwing against was a readout stood in the
    // middle of the writing. A way nobody walking can take is greyed out rather than
    // explained; what the die was for is said by the die, when it is thrown.
    (b.choose || []).forEach((o, i) => {
      const on = i === this.row;
      const shut = run.shutTo(o);
      out.push([`${shut ? '·' : on ? '>' : ' '} ${fill(o.text)}`, TUNING.questBodySize,
        shut ? COLORS.menuRule : on ? COLORS.menuAccent : COLORS.menuDim]);
    });
    return [...out, ...this.packLines()];
  }

  // The pack, on the card, at a camp and nowhere else: what can be drunk or eaten,
  // numbered, and what is already working. The ways keep the cursor — the pack is a number
  // key, so stopping for a meal never costs the party the choice they walked up to.
  packLines() {
    const can = run.atHand();
    const force = run.inForce();
    const ate = run.mealAt();
    if (!can.length && !force.length && !ate) return [];
    const out = [['', TUNING.questHintSize, COLORS.menuRule]];
    if (can.length) {
      out.push(['Somebody has the pack open, and the fire is in.', TUNING.questHintSize, COLORS.menuDim]);
      can.forEach((row, i) => {
        // A pan going on says so: it is the one row on this list that hands the controls
        // over rather than simply being done.
        out.push([`  [${i + 1}] ${row.kind === 'cook' ? 'Cook — ' : ''}${row.name} — ${row.body.join(' ')}`,
          TUNING.questHintSize, COLORS.menuText]);
      });
      // Not dropped quietly: there are nine number keys, and a pack with more in it than
      // that says so rather than leaving the rest of itself out of the list unexplained.
      const over = run.handOver();
      if (over) {
        out.push([`  And ${over} more in the pack than there are numbers for. Take one and the next comes up.`,
          TUNING.questHintSize, COLORS.menuDim]);
      }
    }
    // Said rather than left to be noticed: the food went out of the numbered list when it
    // was eaten, and a square that simply vanishes tells the player nothing.
    if (ate) {
      out.push([ate.how === 'cooked'
        ? `  ${ate.name}${mealResult(ate)}. There is one meal in a fire, and this fire has had it.`
        : `  They have eaten — ${ate.name}. There is one meal in a fire, and this fire has had it.`,
      TUNING.questHintSize, COLORS.menuMapFolk]);
    }
    for (const p of force) {
      out.push([`  ${p.name} is working. ${p.body.join(' ')}`,
        TUNING.questHintSize, COLORS.menuMapMark]);
    }
    return out;
  }

  // The node's description and nothing else. It is here rather than on the tally because
  // a place is described on arriving at it, not on leaving. The ways are the next card.
  readLines(r) {
    const n = r.nodes[r.at];
    const out = run.kindOf(n.kind).body.map((para) => [para, TUNING.questBodySize, COLORS.menuDim]);
    return [...out, ...this.packLines()];
  }

  workLines(r) {
    const n = r.nodes[r.at];
    const hs = n.harvests;
    // The cursor never rests on work nobody can do, including on the first draw. The
    // walking-on row sits past the end of the harvests and is not work, so it is skipped
    // here — it is always open.
    if (!(walkRow(n) && this.row === hs.length) && (!hs[this.row] || !hs[this.row].score)) {
      this.row = Math.max(0, hs.findIndex((h) => h.score));
    }
    const out = []; // the writing was the card before this one
    hs.forEach((h, i) => {
      const on = i === this.row;
      const shut = !h.score;
      // The way itself, as it was written, and nothing under it. A kind with nothing
      // written for it falls back to naming the work. What the work is worth and who can
      // do it were a readout stood in the middle of the writing; now the way as it is
      // written is all the choice is made on, and work nobody walking can do is greyed
      // out rather than explained.
      out.push([`${shut ? '·' : on ? '>' : ' '} ${h.text || `${h.activity} — ${h.skill.name}`}`,
        TUNING.questBodySize, shut ? COLORS.menuRule : on ? COLORS.menuAccent : COLORS.menuDim]);
    });
    // One thing to do is still a question: the other answer is to leave it. A card with
    // two is already a choice and does not need the row.
    if (walkRow(n)) {
      const on = this.row === hs.length;
      out.push([`${on ? '>' : ' '} ${WALK_ON}`,
        TUNING.questBodySize, on ? COLORS.menuAccent : COLORS.menuDim]);
    }
    return [...out, ...this.packLines()];
  }

  forkLines(r) {
    const n = r.nodes[r.at];
    return n.branches.flatMap((br, i) => {
      const on = i === this.row;
      const said = br.read
        ? `${br.read.who}: ${br.read.line}`
        : 'Nobody in the party can tell you anything about this one.';
      return [
        [`${on ? '>' : ' '} ${br.side}`, TUNING.questBodySize, on ? COLORS.menuAccent : COLORS.menuDim],
        [`    ${said}`, TUNING.questBodySize, on ? COLORS.menuText : COLORS.menuRule],
      ];
    });
  }

  endHead(r) {
    if (r.state === 'spent' && r.routed) return 'Nobody left standing.';
    return { done: 'Done.', spent: 'Nothing left in them.', abandoned: 'Turned back.' }[r.state];
  }

  endingLines(r) {
    const won = r.state === 'done';
    const out = [];
    if (won) out.push([r.quest.goal, TUNING.questBodySize, COLORS.menuText]);
    if (r.state === 'spent') {
      out.push([r.routed
        ? 'Everybody who could fight is being carried, and there is still something out there standing up. They came home from where they stood, and they came home the long way.'
        : 'The constitution ran out with the job unfinished. They came home from where they stood.',
      TUNING.questBodySize, COLORS.menuMapFolk]);
    }
    // The pack at the gate, which is what the walk was worth: nothing reached the town's
    // stock until they did.
    out.push([`Carried out of it: ${run.listOf(r.pack)}.    ${r.xp} xp each.`, TUNING.questBodySize, COLORS.menuText]);
    if (Object.keys(r.left || {}).length) {
      out.push([`Left on the road: ${run.listOf(r.left)}.`, TUNING.questBodySize, COLORS.menuMapFolk]);
    }
    if (r.lost && Object.keys(r.lost).length) {
      out.push([`Half of it went down on the road: ${run.listOf(r.lost)}.`, TUNING.questBodySize, COLORS.menuMapFolk]);
    }
    if (won) {
      out.push([`Finishing pays again, ${TUNING.questBonusFactor} times over: ${run.listOf(r.bonus.spoils)}, and ${r.bonus.xp} xp each.`,
        TUNING.questBodySize, COLORS.menuAccent]);
    } else {
      out.push(['The bonus for finishing is lost. What was carried out is kept.', TUNING.questBodySize, COLORS.menuDim]);
    }
    return out;
  }

  // --- bits ------------------------------------------------------------------

  rule(y) {
    const g = this.add.graphics();
    g.lineStyle(1, this.ink(COLORS.menuRule), 1);
    g.lineBetween(this.left, y, this.left + this.wide, y);
    this.layer.add(g);
  }

  hint(str) {
    this.text(this.left, this.foot - 18, str, TUNING.questHintSize, COLORS.menuDim);
  }

  text(x, y, str, size, color, wrap) {
    const t = this.add.text(x, y, str, {
      fontFamily: TUNING.font,
      fontSize: `${size}px`,
      color: hex(this.ink(color)),
      lineSpacing: 4,
      ...(wrap ? { wordWrap: { width: wrap } } : {}),
    });
    this.layer.add(t);
    return t;
  }
}
