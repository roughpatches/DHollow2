// Work Gregorious hands out. A quest is a size and a goal; the nodes between here and
// the goal are drawn fresh from content/encounters.js every time it is accepted, so a
// quest is never the same run twice.
//   id    — how src/run.js refers to it.
//   label — shown on the board and in the Quest Log.
//   size  — short, medium, or long. The node count for each is in tuning.js. Leave it
//           out on a job marked `procedural` and the player sets it when they take it.
//   procedural — standing work rather than a written job: no `line` and no `size`,
//           because the player picks the length, the hour and the place when they take it
//           off the board. What they can pick is in tuning.js and in the `work` flag in
//           content/places.js. The nodes come from content/nodes.js.
//   where — the zone a procedural job is walked in, named here instead of asked for. A
//           job that is about one place knows its own ground, so the place screen is
//           skipped and only the length and the hour are left to answer. Unlike `at` it
//           does not take the job off the board: it is still work Gregorious hands out.
//   when  — day, night, or any. A job fixed to one time can only be walked at that
//           time; 'any' lets the party choose when they set out. A day run has nothing
//           in it to fight; a night run does, and will not go out without somebody
//           marked `combat` in content/party.js on it.
//   party — how many walk it, you included. You are on every job and are the one who
//           puts the crew together, so a job of 3 wants two others to agree to come.
//   tags  — what the job involves. Matched against skills' `draws` to find who is keen
//           and against characters' `fears` to find who will refuse. A night run is
//           tagged 'dark' on top of these.
//   giver — the NPC id who hands it out.
//   needs — a story flag. Until it is set the job does not exist as far as the game is
//           concerned. See src/story.js.
//   ready — a second flag, for a job that is known about but not yet agreed to.
//   sets  — a flag raised the first time it is walked to the end.
//   must  — character ids who have to be on it. Somebody the job will not go without.
//   at    — the id of the place it is set out from, instead of Gregorious's board.
//           That place's terrain is the ground the job is walked on. See content/places.js.
//   check — the roll the last node asks for, in the same shape encounters use: a skill,
//           a DC, and the line said whether it is held or lost. The job's own test,
//           standing in front of the goal, rather than whatever the road threw up.
//   line  — an authored run, in order, instead of one drawn from the table. Each entry
//           is an encounter id; an entry that is a pair of ids is a fork offering those
//           two ways on. A quest with a line ignores `size` for its node count, and the
//           last entry is its goal. Leave it out and the run is drawn fresh every time.
//   goal  — what the last node is, in one line.
//   body  — what the job is, in the world's voice. Yours to write.
// Add a quest by adding a block. Nothing reads this list by position.

export const QUESTS = [
  {
    id: 'firstday',
    label: 'First Day in Dreadhollow',
    size: 'short',
    when: 'day',
    party: 1,
    must: ['aldis'], // he knows the Greywood and nobody else in town is going anywhere
    needs: 'firstday-offered', // Gregorious has to ask first
    ready: 'aldis-agreed', // and Aldis has to say yes
    sets: 'firstday-done',
    at: 'greywood',
    tags: ['forest', 'timber', 'wild', 'leavingtown'],
    giver: 'gregorious',
    // The first job is authored rather than drawn: fish the water on the way out, take
    // one of two ways through the wood, fell a stand, and then the grove.
    line: [
      'firstcast',
      ['heron', 'mushrooms'],
      'secondcut',
      'aldiswood',
    ],
    // No roll in front of this goal: the last node is the grove, and the grove is a plot
    // node that plays straight through. Put a `check` back here the day the job ends on
    // something that can be got right or wrong.
    check: null,
    goal: 'Bring back enough timber and provisions to put the Sea Hag right.',
    body: ['[Placeholder Text]'],
  },
  {
    // The standing job. Gregorious does not run out of work and never has: this is the
    // one row on the board that is always there, and what it turns out to be is two
    // questions asked on the way out of town rather than anything written here. The wood
    // does not run out of trees or of trouble, and it never leaves the board.
    id: 'greywoodexcursion',
    needs: 'firstday-done',
    label: 'Greywood Excursion',
    procedural: true,
    where: 'greywood',
    when: 'any',
    party: 2,
    tags: ['forest', 'timber', 'wild', 'leavingtown'],
    giver: 'gregorious',
    check: null,
    goal: 'Walk into the Greywood as far as you have the daylight for, work it, and come back out.',
    body: ['[Placeholder Text]'],
  },
  {
    id: 'fenedge',
    needs: 'firstday-done',
    label: 'The fen edge',
    size: 'short',
    when: 'any',
    party: 2,
    tags: ['fen', 'water', 'thedead', 'leavingtown'],
    giver: 'gregorious',
    check: {
      skill: 'investigation',
      dc: 13,
      held: 'Somebody counts the black water twice and gets a different number the second time — and can say where.',
      lost: 'You walk it end to end and come back able to say only that it is wet.',
    },
    goal: 'Walk the black water end to end and come back saying what is in it.',
    body: ['[Placeholder Text]'],
  },
  {
    id: 'coastroad',
    needs: 'firstday-done',
    label: 'Down the coast road',
    size: 'medium',
    when: 'day',
    party: 3,
    tags: ['coast', 'water', 'leavingtown'],
    giver: 'gregorious',
    check: {
      skill: 'sailing',
      dc: 14,
      held: 'Somebody reads the tide off her list and calls how long you have on board.',
      lost: 'The water is around your knees before anybody thinks to look at it.',
    },
    goal: 'Reach the wreck the Sea Hag was named for and bring back what is still on it.',
    body: ['[Placeholder Text]'],
  },
  {
    id: 'northroad',
    needs: 'firstday-done',
    label: 'Past the treeline',
    size: 'long',
    when: 'night',
    party: 3,
    tags: ['road', 'forest', 'thenorthroad', 'thedead', 'leavingtown'],
    giver: 'gregorious',
    check: {
      skill: 'investigation',
      dc: 15,
      held: 'The carts are where they stopped, and so is the reason, and somebody sees the second one.',
      lost: 'You find the carts. Nobody finds the rest of it, and the dark is not lending anybody a lamp.',
    },
    goal: 'Follow the north road to where the carters stopped, and find out why they stopped there.',
    body: ['[Placeholder Text]'],
  },
];
