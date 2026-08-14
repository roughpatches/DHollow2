import { TUNING, COLORS, hex, blend } from '../../tuning.js';
import { SKILLS } from '../../content/skills.js';
import * as run from '../run.js';
import * as recruit from '../recruit.js';
import {
  roster, charOf, bandName, bandOf, scoreLine, scoreOf, skillsOf, skillOf, isCombat,
  nameOf, fill, YOU,
} from '../party.js';
import { iconKeyFor } from '../icons.js';
import { createWalk } from '../walk.js';
import { framed, padOf, minOf, inkOf } from '../frames.js';
import { markKey } from '../textures.js';
import { hasEngine, engineFor, hintFor, qualityLine } from '../activity.js';

const CARD = 'plaque'; // the panel a node's account is written on
const COLUMN = 'band'; // and the one stood on its end beside the road

// The crawl. Runs over World, which freezes behind it. Three bands: the party's
// constitution across the top, the party walking the landscape in the middle, and the
// trail they are on along the bottom — what they have walked, what they are standing in,
// and how many blanks are still in front of them. A node is not a node until it has
// walked into view, so the card over the landscape only opens when they reach it.
export default class Quest extends Phaser.Scene {
  constructor() {
    super('Quest');
  }

  create() {
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
  // you are still standing there. The crawl is not: once the party has set out, the town
  // is not behind them any more, so it takes the whole screen.
  sizeTo(mode) {
    const p = mode === 'run' ? 0 : TUNING.questPad;
    this.box = { x: p, y: p, w: this.scale.width - p * 2, h: this.scale.height - p * 2 };
    // The frame is the margin. A screen is written inside the flat of whichever panel it
    // is drawn in, so nothing runs under the ironwork at either edge.
    const pad = padOf(this.frame(mode));
    this.left = this.box.x + pad.l;
    this.wide = this.box.w - pad.l - pad.r;
    this.top = this.box.y + pad.t;
    this.foot = this.box.y + this.box.h - pad.b;
  }

  // the whole screen is one page; the crawl is bands, and a band is the smaller frame
  frame(mode = this.mode) {
    return mode === 'run' ? 'band' : 'page';
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

  // set out for somewhere named on the map: no board, straight to the hour or the crew
  openJob(id) {
    if (this.open_) return;
    this.job = run.questOf(id);
    if (!this.job) return;
    this.times = run.timesFor(this.job);
    this.row = 0;
    this.open_ = true;
    this.swallow = true;
    this.layer.setVisible(true);
    if (this.times.length === 1) this.toRecruiting(this.times[0]);
    else this.mode = 'when';
    this.draw();
    this.game.events.emit('quest:open');
  }

  close() {
    this.open_ = false;
    this.layer.setVisible(false);
    this.activity = null;
    this.scrim?.destroy();
    this.scrim = null;
    this.walk?.destroy();
    this.walk = null;
    run.clear();
    this.game.events.emit('quest:close');
  }

  update(time, delta) {
    this.swallow = false;
    this.activity?.update(time);
    if (!this.walk) return;
    this.walk.update(delta);
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
        // a job fixed to one hour skips the question; the rest ask it
        this.job = jobs[this.row];
        this.times = run.timesFor(this.job);
        this.row = 0;
        // a job fixed to one hour has nothing to ask, so it goes straight to recruiting
        if (this.times.length === 1) this.toRecruiting(this.times[0]);
        else this.mode = 'when';
      }
      this.draw();
      return;
    }

    if (this.mode === 'when') {
      if (k === 'escape') { this.mode = 'board'; this.row = 0; }
      else if (k === 'arrowup' || k === 'w' || k === 'arrowleft' || k === 'a') this.row = 0;
      else if (k === 'arrowdown' || k === 's' || k === 'arrowright' || k === 'd') this.row = 1;
      else if (k === 'enter' || k === ' ') this.toRecruiting(this.times[this.row]);
      this.draw();
      return;
    }

    if (this.mode === 'party') {
      const all = roster();
      if (k === 'escape') {
        if (this.times.length > 1) { this.mode = 'when'; this.row = 0; }
        else if (this.job.at) this.close();
        else { this.mode = 'board'; this.row = 0; }
      }
      else if (k === 'arrowup' || k === 'w') this.row = (this.row - 1 + all.length) % all.length;
      else if (k === 'arrowdown' || k === 's') this.row = (this.row + 1) % all.length;
      else if (k === ' ') this.toggleWalker(all[this.row].id);
      else if (k === 'enter' && this.crewed()) this.begin(this.when_);
      this.draw();
      return;
    }

    const r = run.active();
    if (this.activity) {
      // the engine has the controls: space winds up and releases, left and right pick
      // the side of the cut. Nothing else is listening.
      if (k === ' ') this.activity.chargeStart();
      else if (k === 'arrowleft' || k === 'a') this.activity.setSide('left');
      else if (k === 'arrowright' || k === 'd') this.activity.setSide('right');
      return;
    }
    if (r.state !== 'running') {
      if (k === 'escape' || k === 'enter' || k === 'e' || k === ' ') this.close();
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
      } else if (k === 'e' || k === ' ' || k === 'enter') run.advance();
      else if (k === 'escape') run.abandon();
      this.draw();
      return;
    }
    if (r.phase === 'fork') {
      if (k === 'arrowup' || k === 'w') this.row = 0;
      else if (k === 'arrowdown' || k === 's') this.row = 1;
      else if (k === 'arrowleft' || k === 'a') this.row = 0;
      else if (k === 'arrowright' || k === 'd') this.row = 1;
      // the cursor belongs to the card it is on: whatever is drawn next starts at its top
      else if (k === 'enter' || k === ' ' || k === 'e') { run.choose(this.row); this.row = 0; }
      else if (k === 'escape') run.abandon();
    } else if (k === 'e' || k === ' ' || k === 'enter') {
      if (this.approaching) return; // it has not got here yet
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
    this.taking = [...must, ...rest].slice(0, Math.max(must.length, this.job.party - 1));
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
    else if (recruit.asked(id, this.job, this.when_).willing) this.taking.push(id);
  }

  begin(when) {
    const r = run.start(this.job.id, when, this.taking);
    this.mode = 'run';
    this.sizeTo(this.mode);
    this.row = 0;
    this.activity = null;
    this.walk?.destroy();
    this.walk = createWalk(this, this.bands().walk, r.party, when, run.backdropOf(this.job));
    this.con = null;
    this.shownAt = -1;
    this.approaching = false;
  }

  // The crawl is three bands inside the panel: the constitution bar across the top, the
  // party walking in the middle, the trail along the bottom. The middle band gives up a
  // column at its left edge to what the party can do, and the road starts where that
  // stops.
  bands() {
    const b = this.box;
    const pad = padOf('band');
    // the band over the road holds the bar and nothing else, so it is as deep as the bar
    const barY = b.y + (TUNING.questHeadHeight - TUNING.questBarHeight) / 2;
    const top = b.y + TUNING.questHeadHeight;
    const bottom = b.y + b.h - TUNING.questTrailHeight;
    const trailTop = bottom + pad.t + 4; // the ring around the goal reaches above its box
    // a party with nothing between them gives the road its width back
    const col = this.scored().length ? TUNING.questSkillWidth : 0;
    return {
      bar: { x: this.left, y: barY, w: this.wide, h: TUNING.questBarHeight },
      skills: { x: b.x, y: top, w: col, h: bottom - top },
      walk: { x: b.x + col, y: top, w: b.w - col, h: bottom - top },
      // the last line of the band belongs to the controls, so the trail stops above it
      trail: { x: this.left, y: trailTop, w: this.wide, h: this.foot - 22 - trailTop },
    };
  }

  draw() {
    this.sizeTo(this.mode);
    this.layer.removeAll(true);
    const r = run.active();
    const night = this.mode === 'run' && r && r.when === 'night';
    // On the crawl the middle band is the landscape, so the panel paints only the strips
    // above and below it and leaves the walking party showing through between them.
    this.walk?.setVisible(this.mode === 'run');
    if (this.mode === 'run') this.chrome(night);
    else this.panel(night);
    if (this.mode === 'board') this.board();
    else if (this.mode === 'when') this.when();
    else if (this.mode === 'party') this.party();
    else this.crawl();
  }

  panel(night) {
    this.hang('page', this.box, night);
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
        g.fillStyle(COLORS.menuSelectFill, 1);
        g.fillRect(this.left, y - 3, this.wide, h);
        g.fillStyle(COLORS.menuAccent, 1);
        g.fillRect(this.left, y - 3, 2, h);
        this.layer.add(g);
      }
      const size = run.sizeOf(q);
      const when = q.when === 'any' ? 'day or night' : `${q.when} only`;
      // whether it can be walked at all is the first thing worth knowing about a job,
      // and after dark that includes whether anybody coming can fight
      const crewed = run.timesFor(q).some((t) => run.canStart(q.id, t));
      this.text(this.left + this.wide - 12, y, `${q.size} · ${size[0]}–${size[1]} nodes · ${q.party} to walk it · ${when}`,
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

  // Set out when? The mix behind each hour is shown rather than described, so the
  // choice is made on what the run will actually be made of.
  when() {
    let y = this.top;
    y += this.text(this.left, y, this.job.label, TUNING.questTitleSize, COLORS.menuAccent).height + 6;
    y += this.text(this.left, y, 'Set out when?', TUNING.questBodySize, COLORS.menuText).height + 10;
    this.rule(y);
    y += 16;

    this.times.forEach((t, i) => {
      const on = i === this.row;
      y += this.text(this.left, y, `${on ? '>' : ' '} ${t === 'day' ? 'By day' : 'After dark'}`,
        TUNING.questBodySize + 2, on ? COLORS.menuAccent : COLORS.menuDim).height + 4;
      y += this.text(this.left + 24, y, run.mixAt(t), TUNING.questBodySize,
        on ? COLORS.menuText : COLORS.menuRule, this.wide - 24).height + 4;
      const cost = t === 'night'
        ? `The road takes ${TUNING.questNightCon}× the constitution and pays ${TUNING.questNightXp}× for it. Will not go out without a fighter.`
        : 'Constitution and pay as written. Nothing out there to fight.';
      y += this.text(this.left + 24, y, cost, TUNING.questHintSize,
        on ? COLORS.menuDim : COLORS.menuRule).height + 14;
    });

    this.text(this.left, this.foot - 44, run.partyLine(), TUNING.menuRowSize, COLORS.menuText);
    this.hint('[Up/Down] Choose    [Enter] Set out    [Esc] Back to the board');
  }

  // Who will come, who will not, and the arithmetic behind both. A refusal the player
  // cannot account for reads as unfairness, so the whole sum is on the page.
  party() {
    const all = roster();
    const short = this.job.party - (1 + this.taking.length); // you are already on it
    let y = this.top;

    this.text(this.left + this.wide, y + 4, `${this.when_ === 'night' ? 'after dark' : 'by day'}`,
      TUNING.menuRowSize, this.when_ === 'night' ? COLORS.menuMapMark : COLORS.menuDim).setOrigin(1, 0);
    y += this.text(this.left, y, this.job.label, TUNING.questTitleSize, COLORS.menuAccent).height + 6;
    const others = this.taking.length === 1 ? 'one other' : `${this.taking.length} others`;
    const coming = this.taking.length ? `You and ${others} coming` : 'You, and nobody else';
    y += this.text(this.left, y,
      short > 0 ? `Needs ${this.job.party}. ${coming} — ${short} short.`
        : `Needs ${this.job.party}. ${coming}.`,
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
    const ground = run.groundLine(this.job, this.crew());
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
      ? '[Up/Down] Look    [Space] Take or leave    [Enter] Set out    [Esc] Back'
      : '[Up/Down] Look    [Space] Take or leave    [Esc] Back');
  }

  crawl() {
    const r = run.active();
    const band = this.bands();

    // A node the party has not walked up to yet is not a node they know anything about,
    // so the approach runs first and the card only opens when it has arrived.
    if (r.state === 'running' && (r.phase === 'node' || r.phase === 'activity' || r.phase === 'beat')
      && this.shownAt !== r.at) {
      this.shownAt = r.at;
      this.approaching = true;
      this.walk.approach(run.kindOf(r.nodes[r.at].kind).nature, () => {
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

    this.conBar(r, band.bar);
    this.skills(r, band.skills);
    this.trail(r, band.trail);

    if (r.state === 'running' && r.phase === 'fork') this.card(band.walk, this.forkLines(r), 'The way splits.');
    else if (r.state === 'running' && r.phase === 'activity') this.activityHead(r, band.walk);
    else if (r.state === 'running' && r.phase === 'beat' && !this.approaching) {
      this.card(band.walk, this.beatLines(r), this.nodeHead(r));
    }
    else if (r.state === 'running' && !this.approaching) this.card(band.walk, this.nodeLines(r), this.nodeHead(r));
    else if (r.state !== 'running') this.card(band.walk, this.endingLines(r), this.endHead(r));

    if (r.state !== 'running') this.hint('[Enter] Back to town');
    else if (r.phase === 'fork') this.hint('[Up/Down] Choose a way    [Enter] Take it    [Esc] Turn back');
    else if (r.phase === 'activity') this.hint(this.activity ? hintFor(run.kindOf(r.nodes[r.at].kind).activity) : 'Walking.');
    else if (r.phase === 'beat' && !this.approaching) {
      this.hint(r.nodes[r.at].beat.choose
        ? '[Up/Down] Choose    [Enter] Do it    [Esc] Turn back'
        : '[E] Go on    [Esc] Turn back');
    }
    else if (this.approaching) this.hint('[E] Press on    [Esc] Turn back');
    else this.hint('[E] Press on    [Esc] Turn back');
  }

  // The constitution, and nothing else on the band with it. It is the one readout that
  // has to be taken at a glance — at nothing the run is over wherever it stands — and a
  // length that is going down says that faster than a sentence about it does. What each
  // node took is said on the card at that node, which is where it happened.
  //
  // Iron, like everything else on the screen: a sunk trough, a rim lit along its top,
  // and a rivet driven in at each end. What is left in them is the gold the leaves are,
  // and it goes the red they go as it runs out.
  conBar(r, rect) {
    const frac = r.conMax ? Math.max(0, Math.min(1, r.con / r.conMax)) : 0;
    const { x, y, w, h } = rect;
    const g = this.add.graphics();
    this.layer.add(g);

    // the trough, sunk between the two caps that hold it to the panel
    const cap = TUNING.questBarCap;
    const tx = x + cap;
    const tw = w - cap * 2;
    g.fillStyle(COLORS.conTrough, 1);
    g.fillRect(tx, y, tw, h);
    g.lineStyle(1, blend(COLORS.conRim, 0x000000, 0.55), 1);
    g.strokeRect(tx + 0.5, y + 0.5, tw - 1, h - 1);

    const lit = Math.round((tw - 4) * frac);
    if (lit > 0) {
      const c = blend(COLORS.conLow, COLORS.conFull, frac);
      g.fillStyle(c, 1);
      g.fillRect(tx + 2, y + 2, lit, h - 4);
      g.fillStyle(blend(c, 0xffffff, 0.32), 1); // the light along the top of it
      g.fillRect(tx + 2, y + 2, lit, 1);
      g.fillStyle(blend(c, 0x000000, 0.4), 1);
      g.fillRect(tx + 2, y + h - 3, lit, 1);
    }

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

  // What the party is worth at each thing it has any points in at all, best first — the
  // same sum the crew screen ends on. A skill nobody has is not a readout, it is a blank
  // line, so it is not one of these.
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
    const gap = TUNING.questPipGap;
    const side = Math.max(10, Math.min(TUNING.questPipSize, rect.h, (rect.w - gap * (n - 1)) / n));
    const span = n * side + gap * (n - 1);
    // centred: the row is the readout, not the band, and a short road left against one
    // end of a wide band reads as a thing that has come loose
    const x0 = rect.x + (rect.w - span) / 2;
    const cy = rect.y + rect.h / 2;
    const g = this.add.graphics();
    this.layer.add(g);

    r.nodes.forEach((node, i) => {
      const cx = x0 + i * (side + gap) + side / 2;
      const here = i === r.at;
      const behind = i < r.at || (here && !this.approaching && r.phase === 'node');

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

      // A node they have walked is the thing that was standing in it. One still in front
      // of them is a stud in the road and nothing else, because it is not anything yet:
      // what a node turns out to be is rolled when the party gets there.
      if (behind && node.kind) {
        const mark = this.add.image(cx, cy, markKey(run.kindOf(node.kind).nature));
        // fitted, not stretched: a silhouette squashed to a box stops being a silhouette
        mark.setScale(Math.min(side / mark.width, side / mark.height));
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
      // where they are standing is ringed whether they have finished with it or not
      if (here) {
        g.lineStyle(1, COLORS.conRivet, 1);
        g.strokeCircle(cx, cy, side / 2 + 1);
      }
      if (node.goal) {
        g.lineStyle(1, COLORS.conRimLit, 1);
        g.strokeCircle(cx, cy, side / 2 + 4);
      }
    });
  }

  // Everything that happens at a node is said on one card over the landscape, so the
  // party and the ground they are standing on stay on the screen while it is read. The
  // card is the plaque: a page held up over the road, written in ink.
  card(rect, lines, head) {
    const pad = padOf(CARD);
    const w = Math.max(Math.min(660, rect.w - 80), minOf(CARD).w);
    const wrap = w - pad.l - pad.r;
    const texts = [];
    let tall = 0;
    for (const [str, size, colour] of lines) {
      const t = this.text(0, 0, str, size, inkOf(CARD, colour), wrap);
      texts.push(t);
      tall += t.height + 8;
    }
    // the head, the paragraphs, and the frame's own margin above and below them: a card
    // that is shorter than what is on it clips its last line
    const h = pad.t + 26 + tall - 8 + pad.b;
    const x = rect.x + (rect.w - w) / 2;
    const top = rect.y + 10; // the party stays visible on the road under it
    this.hang(CARD, { x, y: top, w, h }, run.active()?.when === 'night');

    this.text(x + pad.l, top + pad.t - 4, head, TUNING.questBodySize + 4,
      inkOf(CARD, COLORS.menuText), wrap);
    let ty = top + pad.t + 26;
    for (const t of texts) {
      t.setPosition(x + pad.l, ty);
      this.layer.bringToTop(t); // measured before the frame was hung, so it is under it
      ty += t.height + 8;
    }
  }

  // --- activities -------------------------------------------------------------
  // A node with an engine behind it hands the player the controls where they stand. The
  // landscape drops below the engine's own drawing so the party stays at the tree.

  startActivity() {
    const r = run.active();
    const e = run.kindOf(r.nodes[r.at].kind);
    if (!hasEngine(e.activity) || this.activity) return;
    const band = this.bands().walk;
    // the landscape drops below the engine's own drawing, with a scrim between them so
    // the readouts are read against something rather than against a hedge
    this.walk.depth(-200);
    this.scrim = this.add.graphics().setDepth(-100);
    this.scrim.fillStyle(COLORS.menuFill, 0.82);
    this.scrim.fillRect(band.x, band.y, band.w, band.h);
    // the engine works on the road, not in the column beside it
    this.activity = engineFor(e.activity, this, {
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
      run.settle({ judgments, failed });
      this.draw();
    });
  }

  // just the name of the work over the top of it; the engine draws everything else
  activityHead(r, rect) {
    const e = run.kindOf(r.nodes[r.at].kind);
    this.text(rect.x + 12, rect.y + 4, `${e.name} — ${e.activity}`,
      TUNING.questBodySize + 2, COLORS.menuText);
  }

  // What is standing in front of them, and nothing about where along the road it is: the
  // trail says that, and a party does not count off the places they have been.
  nodeHead(r) {
    const n = r.nodes[r.at];
    const e = run.kindOf(n.kind);
    return `${e.name}${n.goal ? ' — the goal' : ''}`;
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
      const con = run.conLines(n);
      if (con) out.push([con, TUNING.questBodySize, COLORS.menuMapFolk]);
      return out;
    }
    if (e.activity) {
      out.push([`${e.activity} — waiting on that engine. For now the party works it out and moves on.`,
        TUNING.questHintSize, COLORS.menuDim]);
    }
    for (const para of e.body) out.push([para, TUNING.questBodySize, COLORS.menuDim]);
    if (n.check) {
      out.push([run.checkLine(n.check), TUNING.questBodySize, n.check.pass ? COLORS.menuMapMark : COLORS.menuMapFolk]);
      // a beat node's roll was said in the beats; it carries no line of its own
      const said = n.check.pass ? n.check.held : n.check.lost;
      if (said) out.push([said, TUNING.questBodySize, COLORS.menuText]);
    }
    const worked = qualityLine(n);
    if (worked) out.push([worked, TUNING.questBodySize, n.failed ? COLORS.menuMapFolk : COLORS.menuMapMark]);
    out.push([`Taken: ${run.listOf(n.spoils)}.    ${n.xp} xp each.`, TUNING.questBodySize, COLORS.menuAccent]);
    const harvest = run.harvestLine(n.harvest);
    if (harvest) out.push([harvest, TUNING.questHintSize, COLORS.menuDim]);
    const con = run.conLines(n);
    if (con) out.push([con, TUNING.questBodySize, n.con >= 0 ? COLORS.menuMapMark : COLORS.menuMapFolk]);
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
    // the roll is shown once, on the beat that reads it back
    if (b.result && n.check) {
      out.push([run.checkLine(n.check), TUNING.questBodySize,
        n.check.pass ? COLORS.menuMapMark : COLORS.menuMapFolk]);
    }
    (b.choose || []).forEach((o, i) => {
      const on = i === this.row;
      const shut = run.shutTo(o);
      out.push([`${shut ? '·' : on ? '>' : ' '} ${fill(o.text)}`, TUNING.questBodySize,
        shut ? COLORS.menuRule : on ? COLORS.menuAccent : COLORS.menuDim]);
      if (!o.skill) return;
      // who would take it and how hard it is, before it is taken rather than after — or,
      // where nobody could take it, that nobody could
      if (shut) {
        out.push([`    ${skillOf(o.skill).name} — nobody walking this has any.`,
          TUNING.questHintSize, COLORS.menuRule]);
        return;
      }
      const who = run.actorFor(o.skill);
      out.push([`    ${skillOf(o.skill).name} DC ${o.dc} — ${nameOf(who)} would try it`,
        TUNING.questHintSize, on ? COLORS.menuText : COLORS.menuRule]);
    });
    return out;
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
    return { done: 'Done.', spent: 'Nothing left in them.', abandoned: 'Turned back.' }[r.state];
  }

  endingLines(r) {
    const won = r.state === 'done';
    const out = [];
    if (won) out.push([r.quest.goal, TUNING.questBodySize, COLORS.menuText]);
    if (r.state === 'spent') {
      out.push(['The constitution ran out with the job unfinished. They came home from where they stood.',
        TUNING.questBodySize, COLORS.menuMapFolk]);
    }
    out.push([`Carried out of it: ${run.listOf(r.spoils)}.    ${r.xp} xp each.`, TUNING.questBodySize, COLORS.menuText]);
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
    g.lineStyle(1, COLORS.menuRule, 1);
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
      color: hex(color),
      lineSpacing: 4,
      ...(wrap ? { wordWrap: { width: wrap } } : {}),
    });
    this.layer.add(t);
    return t;
  }
}
