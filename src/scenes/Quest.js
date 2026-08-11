import { TUNING, COLORS, hex } from '../../tuning.js';
import * as run from '../run.js';
import * as recruit from '../recruit.js';
import { roster, charOf, bandName, bandOf, scoreLine, traitsOf, traitOf, YOU } from '../party.js';

// The crawl. Runs over World, which freezes behind it. A row of pips across the top is
// the whole run at a glance; everything below is the node you are standing on.
export default class Quest extends Phaser.Scene {
  constructor() {
    super('Quest');
  }

  create() {
    const p = TUNING.questPad;
    this.box = { x: p, y: p, w: this.scale.width - p * 2, h: this.scale.height - p * 2 };
    this.left = this.box.x + TUNING.menuPad;
    this.wide = this.box.w - TUNING.menuPad * 2;

    this.layer = this.add.container().setDepth(29000).setVisible(false);
    this.open_ = false;
    this.row = 0;

    this.input.keyboard.on('keydown', this.onKey, this);
    this.game.events.on('quest:board', this.openBoard, this);
    this.game.events.on('quest:start', this.openJob, this);
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
    run.clear();
    this.game.events.emit('quest:close');
  }

  update() {
    this.swallow = false;
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
      else if (k === 'enter' && this.taking.length >= this.job.party) this.begin(this.when_);
      this.draw();
      return;
    }

    const r = run.active();
    if (r.state !== 'running') {
      if (k === 'escape' || k === 'enter' || k === 'e' || k === ' ') this.close();
      return;
    }
    if (r.phase === 'fork') {
      if (k === 'arrowup' || k === 'w') this.row = 0;
      else if (k === 'arrowdown' || k === 's') this.row = 1;
      else if (k === 'arrowleft' || k === 'a') this.row = 0;
      else if (k === 'arrowright' || k === 'd') this.row = 1;
      else if (k === 'enter' || k === ' ' || k === 'e') run.choose(this.row);
      else if (k === 'escape') run.abandon();
    } else if (k === 'e' || k === ' ' || k === 'enter') {
      run.step();
      this.row = 0;
    } else if (k === 'escape') {
      run.abandon();
    }
    this.draw();
  }

  // --- drawing --------------------------------------------------------------

  // everyone who will come is taken by default; the player pares that back
  toRecruiting(when) {
    this.when_ = when;
    const must = (this.job.must || []).filter((id) => recruit.asked(id, this.job, when).willing);
    const rest = recruit.willing(this.job, when).filter((id) => !must.includes(id));
    this.taking = [...must, ...rest].slice(0, this.job.party);
    this.mode = 'party';
    this.row = 0;
  }

  toggleWalker(id) {
    if ((this.job.must || []).includes(id)) return; // the job does not go without them
    if (this.taking.includes(id)) this.taking = this.taking.filter((x) => x !== id);
    else if (recruit.asked(id, this.job, this.when_).willing) this.taking.push(id);
  }

  begin(when) {
    run.start(this.job.id, when, this.taking);
    this.mode = 'run';
    this.row = 0;
  }

  draw() {
    this.layer.removeAll(true);
    const r = run.active();
    this.panel(this.mode === 'run' && r && r.when === 'night');
    if (this.mode === 'board') this.board();
    else if (this.mode === 'when') this.when();
    else if (this.mode === 'party') this.party();
    else this.crawl();
  }

  panel(night) {
    const b = this.box;
    const g = this.add.graphics();
    g.fillStyle(night ? COLORS.questNightFill : COLORS.menuFill, 0.98);
    g.fillRect(b.x, b.y, b.w, b.h);
    g.lineStyle(2, night ? COLORS.questNightEdge : COLORS.menuEdge, 1);
    g.strokeRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2);
    this.layer.add(g);
  }

  board() {
    const jobs = run.offered();
    let y = this.box.y + TUNING.menuPad;
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
        const g = this.add.graphics();
        g.fillStyle(COLORS.menuSelectFill, 1);
        g.fillRect(this.left - 8, y - 3, this.wide + 8, h);
        g.fillStyle(COLORS.menuAccent, 1);
        g.fillRect(this.left - 8, y - 3, 2, h);
        this.layer.add(g);
      }
      const size = run.sizeOf(q);
      const when = q.when === 'any' ? 'day or night' : `${q.when} only`;
      // whether it can be crewed at all is the first thing worth knowing about a job
      const crewed = run.timesFor(q).some((t) => recruit.enough(q, t));
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
    let y = this.box.y + TUNING.menuPad;
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
        ? `Wounds run ${TUNING.questNightHurt}× and pay ${TUNING.questNightXp}× for it.`
        : 'Wounds and pay as written.';
      y += this.text(this.left + 24, y, cost, TUNING.questHintSize,
        on ? COLORS.menuDim : COLORS.menuRule).height + 14;
    });

    this.text(this.left, this.box.y + this.box.h - 52, run.partyLine(), TUNING.menuRowSize, COLORS.menuText);
    this.hint('[Up/Down] Choose    [Enter] Set out    [Esc] Back to the board');
  }

  // Who will come, who will not, and the arithmetic behind both. A refusal the player
  // cannot account for reads as unfairness, so the whole sum is on the page.
  party() {
    const all = roster();
    const short = this.job.party - this.taking.length;
    let y = this.box.y + TUNING.menuPad;

    this.text(this.left + this.wide, y + 4, `${this.when_ === 'night' ? 'after dark' : 'by day'}`,
      TUNING.menuRowSize, this.when_ === 'night' ? COLORS.menuMapMark : COLORS.menuDim).setOrigin(1, 0);
    y += this.text(this.left, y, this.job.label, TUNING.questTitleSize, COLORS.menuAccent).height + 6;
    y += this.text(this.left, y,
      short > 0 ? `Needs ${this.job.party}. ${this.taking.length} coming — ${short} short.`
        : `Needs ${this.job.party}. ${this.taking.length} coming.`,
      TUNING.questBodySize, short > 0 ? COLORS.menuMapFolk : COLORS.menuText).height + 10;
    // the job's own roll is named before the crew is picked, because it is the reason
    // to pick one crew over another
    if (this.job.check) {
      const ch = this.job.check;
      y += this.text(this.left, y, `The last node asks a ${traitOf(ch.trait).name} roll at DC ${ch.dc}.`,
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
      // what they are worth is on the row itself: it is half of why you take somebody
      this.text(this.left + this.wide, y + 2, traitsOf(c.id).map((t) => `${t.name} ${t.rank}`).join('   '),
        TUNING.questHintSize, on ? COLORS.menuDim : COLORS.menuRule).setOrigin(1, 0);
      y += this.text(this.left, y, `${on ? '>' : ' '} ${mark} ${c.name}`,
        TUNING.questBodySize, on ? colour : (taken ? COLORS.menuAccent : COLORS.menuDim)).height + 2;
      const why = required
        ? `This job does not go without them. ${recruit.why(c.id, this.job, this.when_)}`
        : recruit.why(c.id, this.job, this.when_);
      y += this.text(this.left + 40, y, why,
        TUNING.questHintSize, on ? COLORS.menuDim : COLORS.menuRule, this.wide - 40).height + 10;
    });

    // you are on it whoever else is, so you are in both readouts
    const crew = [YOU, ...this.taking];
    this.text(this.left, this.box.y + this.box.h - 74,
      run.partyLine(crew.map((id) => charOf(id))), TUNING.menuRowSize, COLORS.menuText);
    // the crew added up: what this party would be good at if it walked out now
    this.text(this.left, this.box.y + this.box.h - 50, scoreLine(crew),
      TUNING.questHintSize, COLORS.menuDim);
    this.hint(short > 0
      ? '[Up/Down] Look    [Space] Take or leave    [Esc] Back'
      : '[Up/Down] Look    [Space] Take or leave    [Enter] Set out    [Esc] Back');
  }

  crawl() {
    const r = run.active();
    let y = this.box.y + TUNING.menuPad;

    this.text(this.left + this.wide, y + 4, `${r.quest.size} · ${r.when} · ${r.nodes.length} nodes`,
      TUNING.menuRowSize, r.when === 'night' ? COLORS.menuMapMark : COLORS.menuDim).setOrigin(1, 0);
    y += this.text(this.left, y, r.quest.label, TUNING.questTitleSize, COLORS.menuAccent).height + 12;

    y = this.pips(r, y) + 14;
    this.rule(y);
    y += 16;

    if (r.state === 'running' && r.phase === 'fork') y = this.fork(r, y);
    else if (r.state === 'running') y = this.node(r, y);
    else y = this.ending(r, y);

    this.text(this.left, this.box.y + this.box.h - 52, run.partyLine(), TUNING.menuRowSize, COLORS.menuText);

    if (r.state !== 'running') this.hint('[Enter] Back to town');
    else if (r.phase === 'fork') this.hint('[Up/Down] Choose a way    [Enter] Take it    [Esc] Turn back');
    else this.hint('[E] Press on    [Esc] Turn back');
  }

  // the run at a glance: behind you filled, ahead of you hollow, the goal ringed
  pips(r, y) {
    const s = TUNING.questPipSize;
    const gap = TUNING.questPipGap;
    const g = this.add.graphics();
    this.layer.add(g);
    r.nodes.forEach((n, i) => {
      const x = this.left + i * (s + gap);
      const here = i === r.at;
      if (i < r.at || (here && r.phase === 'node')) {
        g.fillStyle(here ? COLORS.menuAccent : COLORS.menuMapFolk, 1);
        g.fillRect(x, y, s, s);
      } else {
        g.lineStyle(1, here ? COLORS.menuAccent : COLORS.menuRule, 1);
        g.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);
      }
      if (n.goal) {
        g.lineStyle(1, COLORS.menuMapMark, 1);
        g.strokeRect(x - 2.5, y - 2.5, s + 4, s + 4);
      }
      if (n.fork) {
        g.fillStyle(COLORS.menuMapMark, 1);
        g.fillRect(x - gap + 2, y + s / 2 - 1, 3, 3);
      }
    });
    return y + s;
  }

  node(r, y) {
    const n = r.nodes[r.at];
    const e = run.kindOf(n.kind);

    y += this.text(this.left, y, `${r.at + 1}. ${e.name}${n.goal ? ' — the goal' : ''}`,
      TUNING.questBodySize + 4, COLORS.menuText).height + 6;
    if (e.activity) {
      y += this.text(this.left, y, `${e.activity} — waiting on that engine. For now the party works it out and moves on.`,
        TUNING.questHintSize, COLORS.menuDim, this.wide).height + 10;
    }
    for (const para of e.body) {
      y += this.text(this.left, y, para, TUNING.questBodySize, COLORS.menuDim, this.wide).height + 10;
    }

    // the roll, then what the roll did, then what the work paid — in that order,
    // because the player is owed the arithmetic before the outcome
    if (n.check) {
      y += 4;
      y += this.text(this.left, y, run.checkLine(n.check), TUNING.questBodySize,
        n.check.pass ? COLORS.menuMapMark : COLORS.menuMapFolk, this.wide).height + 4;
      y += this.text(this.left, y, n.check.pass ? n.check.held : n.check.lost,
        TUNING.questBodySize, COLORS.menuText, this.wide).height + 6;
    }

    y += 6;
    y += this.text(this.left, y, `Taken: ${run.listOf(n.spoils)}.    ${n.xp} xp each.`,
      TUNING.questBodySize, COLORS.menuAccent).height + 6;
    const harvest = run.harvestLine(n.harvest);
    if (harvest) {
      y += this.text(this.left, y, harvest, TUNING.questHintSize, COLORS.menuDim, this.wide).height + 6;
    }
    if (n.hurt > 0) {
      y += this.text(this.left, y, `${n.hurtWho} takes ${n.hurt}.`, TUNING.questBodySize, COLORS.menuMapFolk).height + 6;
    }
    return y;
  }

  fork(r, y) {
    const n = r.nodes[r.at];
    y += this.text(this.left, y, 'The way splits.', TUNING.questBodySize + 4, COLORS.menuText).height + 12;

    n.branches.forEach((br, i) => {
      const on = i === this.row;
      const label = `${on ? '>' : ' '} ${br.side}`;
      y += this.text(this.left, y, label, TUNING.questBodySize, on ? COLORS.menuAccent : COLORS.menuDim).height + 4;
      const said = br.read
        ? `${br.read.who}: ${br.read.line}`
        : 'Nobody in the party can tell you anything about this one.';
      y += this.text(this.left + 24, y, said, TUNING.questBodySize, on ? COLORS.menuText : COLORS.menuRule, this.wide - 24).height + 14;
    });
    return y;
  }

  ending(r, y) {
    const won = r.state === 'done';
    const head = { done: 'Done.', failed: 'The party is down.', abandoned: 'Turned back.' }[r.state];
    y += this.text(this.left, y, head, TUNING.questTitleSize, won ? COLORS.menuAccent : COLORS.menuMapFolk).height + 12;

    if (won) y += this.text(this.left, y, r.quest.goal, TUNING.questBodySize, COLORS.menuText, this.wide).height + 12;

    y += this.text(this.left, y, `Carried out of it: ${run.listOf(r.spoils)}.    ${r.xp} xp each.`,
      TUNING.questBodySize, COLORS.menuText, this.wide).height + 8;

    if (won) {
      y += this.text(this.left, y, `Finishing pays again, ${TUNING.questBonusFactor} times over: ${run.listOf(r.bonus.spoils)}, and ${r.bonus.xp} xp each.`,
        TUNING.questBodySize, COLORS.menuAccent, this.wide).height + 8;
    } else {
      y += this.text(this.left, y, 'The bonus for finishing is lost. What was carried out is kept.',
        TUNING.questBodySize, COLORS.menuDim, this.wide).height + 8;
    }
    y += this.text(this.left, y, 'The Sea Hag mends what the road did. The party comes back whole.',
      TUNING.questHintSize, COLORS.menuDim, this.wide).height + 8;
    return y;
  }

  // --- bits ------------------------------------------------------------------

  rule(y) {
    const g = this.add.graphics();
    g.lineStyle(1, COLORS.menuRule, 1);
    g.lineBetween(this.left, y, this.left + this.wide, y);
    this.layer.add(g);
  }

  hint(str) {
    this.text(this.left, this.box.y + this.box.h - 26, str, TUNING.questHintSize, COLORS.menuDim);
  }

  text(x, y, str, size, color, wrap) {
    const t = this.add.text(x, y, str, {
      fontFamily: 'monospace',
      fontSize: `${size}px`,
      color: hex(color),
      lineSpacing: 4,
      ...(wrap ? { wordWrap: { width: wrap } } : {}),
    });
    this.layer.add(t);
    return t;
  }
}
