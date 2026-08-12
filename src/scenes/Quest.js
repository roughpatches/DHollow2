import { TUNING, COLORS, hex } from '../../tuning.js';
import * as run from '../run.js';
import * as recruit from '../recruit.js';
import { roster, charOf, bandName, bandOf, scoreLine, skillsOf, skillOf, isCombat, YOU } from '../party.js';
import { createWalk } from '../walk.js';
import { markKey } from '../textures.js';
import { meterBar } from '../minigames/meters.js';

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
    this.walk?.destroy();
    this.walk = null;
    run.clear();
    this.game.events.emit('quest:close');
  }

  update(time, delta) {
    this.swallow = false;
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
    this.row = 0;
    this.walk?.destroy();
    this.walk = createWalk(this, this.bands().walk, r.party, when);
    this.con = null;
    this.shownAt = -1;
    this.approaching = false;
  }

  // The crawl is three bands inside the panel: the constitution bar across the top, the
  // party walking in the middle, the trail along the bottom.
  bands() {
    const b = this.box;
    const barY = b.y + TUNING.menuPad + 22;
    const top = barY + TUNING.questBarHeight + 30; // room under the bar for who is walking
    const bottom = b.y + b.h - TUNING.questTrailHeight;
    return {
      bar: { x: this.left, y: barY, w: this.wide, h: TUNING.questBarHeight },
      walk: { x: b.x, y: top, w: b.w, h: bottom - top },
      trail: { x: this.left, y: bottom + 12, w: this.wide, h: TUNING.questTrailHeight - 34 },
    };
  }

  draw() {
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
    const b = this.box;
    const g = this.add.graphics();
    g.fillStyle(night ? COLORS.questNightFill : COLORS.menuFill, 0.98);
    g.fillRect(b.x, b.y, b.w, b.h);
    g.lineStyle(2, night ? COLORS.questNightEdge : COLORS.menuEdge, 1);
    g.strokeRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2);
    this.layer.add(g);
  }

  // the strip the bar sits on, the strip the trail sits on, and the frame around both
  chrome(night) {
    const b = this.box;
    const band = this.bands();
    const g = this.add.graphics();
    g.fillStyle(night ? COLORS.questNightFill : COLORS.menuFill, 1);
    g.fillRect(b.x, b.y, b.w, band.walk.y - b.y);
    g.fillStyle(COLORS.questTrailFill, 1);
    g.fillRect(b.x, band.walk.y + band.walk.h, b.w, b.y + b.h - band.walk.y - band.walk.h);
    g.lineStyle(1, night ? COLORS.questNightEdge : COLORS.menuRule, 1);
    g.lineBetween(b.x, band.walk.y, b.x + b.w, band.walk.y);
    g.lineBetween(b.x, band.walk.y + band.walk.h, b.x + b.w, band.walk.y + band.walk.h);
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
        ? `The road takes ${TUNING.questNightCon}× the constitution and pays ${TUNING.questNightXp}× for it. Will not go out without a fighter.`
        : 'Constitution and pay as written. Nothing out there to fight.';
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
    const short = this.job.party - (1 + this.taking.length); // you are already on it
    let y = this.box.y + TUNING.menuPad;

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
      y += this.text(this.left, y, `${on ? '>' : ' '} ${mark} ${c.name}`,
        TUNING.questBodySize, on ? colour : (taken ? COLORS.menuAccent : COLORS.menuDim)).height + 2;
      const why = required
        ? `This job does not go without them. ${recruit.why(c.id, this.job, this.when_)}`
        : recruit.why(c.id, this.job, this.when_);
      y += this.text(this.left + 40, y, why,
        TUNING.questHintSize, on ? COLORS.menuDim : COLORS.menuRule, this.wide - 40).height + 10;
    });

    // you are on it whoever else is, so you are in both readouts
    const crew = this.crew();
    this.text(this.left, this.box.y + this.box.h - 74,
      run.partyLine(crew.map((id) => charOf(id))), TUNING.menuRowSize, COLORS.menuText);
    // the crew added up: what this party would be good at if it walked out now
    this.text(this.left, this.box.y + this.box.h - 50, scoreLine(crew),
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
    if (r.state === 'running' && r.phase === 'node' && this.shownAt !== r.at) {
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

    this.conBar(r, band.bar);
    this.trail(r, band.trail);

    if (r.state === 'running' && r.phase === 'fork') this.card(band.walk, this.forkLines(r), 'The way splits.');
    else if (r.state === 'running' && !this.approaching) this.card(band.walk, this.nodeLines(r), this.nodeHead(r));
    else if (r.state !== 'running') this.card(band.walk, this.endingLines(r), this.endHead(r));

    if (r.state !== 'running') this.hint('[Enter] Back to town');
    else if (r.phase === 'fork') this.hint('[Up/Down] Choose a way    [Enter] Take it    [Esc] Turn back');
    else if (this.approaching) this.hint('Walking.    [Esc] Turn back');
    else this.hint('[E] Press on    [Esc] Turn back');
  }

  // The constitution bar, and what the last node did to it under the label. This is the
  // only readout that matters at a glance: at zero the run is over wherever it stands.
  conBar(r, rect) {
    const frac = r.conMax ? r.con / r.conMax : 0;
    const low = frac <= 0.25;
    this.text(this.left, rect.y - 22, r.quest.label, TUNING.questTitleSize - 2, COLORS.menuAccent);
    this.text(this.left + this.wide, rect.y - 18, `${r.quest.size} · ${r.when} · node ${Math.min(r.at + 1, r.nodes.length)} of ${r.nodes.length}`,
      TUNING.questHintSize, r.when === 'night' ? COLORS.menuMapMark : COLORS.menuDim).setOrigin(1, 0);

    // the kit's bar, rebuilt with the panel because the panel is cheap and so is it
    const bar = meterBar(this, rect.x, rect.y + rect.h / 2, rect.w, rect.h, low ? 'bar_hp' : 'bar_stamina');
    bar.setValue(frac);
    this.layer.add(bar.track);
    this.layer.add(bar.fill);

    this.text(rect.x + 10, rect.y + rect.h / 2 - 8, run.conLine(r), TUNING.questBodySize,
      low ? COLORS.menuMapFolk : COLORS.menuText);
    // who is walking it and what each of them put into the bar, under the bar rather
    // than on it, because a number over a moving fill cannot be read
    this.text(rect.x, rect.y + rect.h + 8, run.partyLine(), TUNING.questHintSize, COLORS.menuDim);
    this.text(rect.x + rect.w, rect.y + rect.h + 8,
      low ? 'Nearly spent. At nothing they turn for home with half of it.' : 'What the road has left them.',
      TUNING.questHintSize, low ? COLORS.menuMapFolk : COLORS.menuDim).setOrigin(1, 0);
  }

  // The trail along the bottom: what has been walked, what is being walked, and how many
  // blanks are still in front of them. A fork is a notch, the goal is ringed.
  trail(r, rect) {
    const n = r.nodes.length;
    const gap = 6;
    const w = Math.max(10, Math.min(38, (rect.w - gap * (n - 1)) / n));
    const h = rect.h - 20;
    const g = this.add.graphics();
    this.layer.add(g);

    r.nodes.forEach((node, i) => {
      const x = rect.x + i * (w + gap);
      const here = i === r.at;
      const behind = i < r.at || (here && !this.approaching && r.phase === 'node');
      g.fillStyle(behind ? COLORS.menuSelectFill : COLORS.questTrailFill, 1);
      g.fillRect(x, rect.y, w, h);
      g.lineStyle(here ? 2 : 1, here ? COLORS.menuAccent : COLORS.menuRule, 1);
      g.strokeRect(x + 0.5, rect.y + 0.5, w - 1, h - 1);
      if (node.goal) {
        g.lineStyle(1, COLORS.menuMapMark, 1);
        g.strokeRect(x - 2.5, rect.y - 2.5, w + 4, h + 4);
      }
      if (node.fork) {
        g.fillStyle(COLORS.menuMapMark, 1);
        g.fillRect(x - gap + 1, rect.y + h / 2 - 2, 4, 4);
      }
      // a walked node is notated with the thing that was standing in it; one still ahead
      // says nothing, because it is not anything yet
      if (behind && node.kind) {
        const mark = this.add.image(x + w / 2, rect.y + h - 4, markKey(run.kindOf(node.kind).nature));
        // fitted, not stretched: a silhouette squashed to a box stops being a silhouette
        mark.setOrigin(0.5, 1).setScale(Math.min((w - 8) / mark.width, (h - 8) / mark.height));
        if (!here) mark.setAlpha(0.65);
        this.layer.add(mark);
      }
    });

    this.text(rect.x + rect.w, rect.y + h + 6,
      `${Math.max(0, n - r.at - 1)} still in front of you`, TUNING.questHintSize, COLORS.menuDim).setOrigin(1, 0);
  }

  // Everything that happens at a node is said on one card over the landscape, so the
  // party and the ground they are standing on stay on the screen while it is read.
  card(rect, lines, head) {
    const w = Math.min(660, rect.w - 80);
    const pad = 18;
    const g = this.add.graphics();
    this.layer.add(g);
    const texts = [];
    let y = rect.y + pad + 26;
    for (const [str, size, colour] of lines) {
      const t = this.text(0, 0, str, size, colour, w - pad * 2);
      texts.push(t);
      y += t.height + 8;
    }
    const h = y - rect.y - pad + 8;
    const x = rect.x + (rect.w - w) / 2;
    const top = rect.y + 10; // the party stays visible on the road under it
    g.fillStyle(COLORS.menuFill, 0.94);
    g.fillRect(x, top, w, h);
    g.lineStyle(1, COLORS.menuEdge, 1);
    g.strokeRect(x + 0.5, top + 0.5, w - 1, h - 1);

    this.text(x + pad, top + pad - 4, head, TUNING.questBodySize + 4, COLORS.menuText, w - pad * 2);
    let ty = top + pad + 26;
    for (const t of texts) {
      t.setPosition(x + pad, ty);
      ty += t.height + 8;
    }
  }

  nodeHead(r) {
    const n = r.nodes[r.at];
    const e = run.kindOf(n.kind);
    return `${r.at + 1}. ${e.name}${n.goal ? ' — the goal' : ''}`;
  }

  nodeLines(r) {
    const n = r.nodes[r.at];
    const e = run.kindOf(n.kind);
    const out = [];
    if (e.activity) {
      out.push([`${e.activity} — waiting on that engine. For now the party works it out and moves on.`,
        TUNING.questHintSize, COLORS.menuDim]);
    }
    for (const para of e.body) out.push([para, TUNING.questBodySize, COLORS.menuDim]);
    if (n.check) {
      out.push([run.checkLine(n.check), TUNING.questBodySize, n.check.pass ? COLORS.menuMapMark : COLORS.menuMapFolk]);
      out.push([n.check.pass ? n.check.held : n.check.lost, TUNING.questBodySize, COLORS.menuText]);
    }
    out.push([`Taken: ${run.listOf(n.spoils)}.    ${n.xp} xp each.`, TUNING.questBodySize, COLORS.menuAccent]);
    const harvest = run.harvestLine(n.harvest);
    if (harvest) out.push([harvest, TUNING.questHintSize, COLORS.menuDim]);
    const con = run.conLines(n);
    if (con) out.push([con, TUNING.questBodySize, n.con >= 0 ? COLORS.menuMapMark : COLORS.menuMapFolk]);
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
