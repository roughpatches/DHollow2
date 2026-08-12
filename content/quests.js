// Work Gregorious hands out. A quest is a size and a goal; the nodes between here and
// the goal are drawn fresh from content/encounters.js every time it is accepted, so a
// quest is never the same run twice.
//   id    — how src/run.js refers to it.
//   label — shown on the board and in the Quest Log.
//   size  — short, medium, or long. The node count for each is in tuning.js.
//   when  — day, night, or any. A job fixed to one time can only be walked at that
//           time; 'any' lets the party choose when they set out. A day run has nothing
//           in it to fight; a night run does, and will not go out without somebody
//           marked `combat` in content/party.js on it.
//   party — how many walk it, you included. You are on every job and are the one who
//           puts the crew together, so a job of 3 wants two others to agree to come.
//   tags  — what the job involves. Matched against traits' `draws` to find who is keen
//           and against characters' `fears` to find who will refuse. A night run is
//           tagged 'dark' on top of these.
//   giver — the NPC id who hands it out.
//   needs — a story flag. Until it is set the job does not exist as far as the game is
//           concerned. See src/story.js.
//   ready — a second flag, for a job that is known about but not yet agreed to.
//   sets  — a flag raised the first time it is walked to the end.
//   must  — character ids who have to be on it. Somebody the job will not go without.
//   at    — the Map tab entry it is set out from, instead of Gregorious's board.
//   check — the roll the last node asks for, in the same shape encounters use: a trait,
//           a DC, and the line said whether it is held or lost. The job's own test,
//           standing in front of the goal, rather than whatever the road threw up.
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
    check: {
      trait: 'woodcraft',
      dc: 12,
      held: 'Aldis picks the stand, and the stand gives up what the inn needs.',
      lost: 'You cut what was nearest instead of what was best, and half of it is green.',
    },
    goal: 'Bring back enough timber and provisions to put the Sea Hag right.',
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
      trait: 'perception',
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
      trait: 'sailing',
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
      trait: 'perception',
      dc: 15,
      held: 'The carts are where they stopped, and so is the reason, and somebody sees the second one.',
      lost: 'You find the carts. Nobody finds the rest of it, and the dark is not lending anybody a lamp.',
    },
    goal: 'Follow the north road to where the carters stopped, and find out why they stopped there.',
    body: ['[Placeholder Text]'],
  },
];
