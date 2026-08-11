// Work Gregorious hands out. A quest is a size and a goal; the nodes between here and
// the goal are drawn fresh from content/encounters.js every time it is accepted, so a
// quest is never the same run twice.
//   id    — how src/run.js refers to it.
//   label — shown on the board and in the Quest Log.
//   size  — short, medium, or long. The node count for each is in tuning.js.
//   when  — day, night, or any. A job fixed to one time can only be walked at that
//           time; 'any' lets the party choose when they set out.
//   party — how many recruits must agree to come before it can be attempted.
//   tags  — what the job involves. Matched against traits' `draws` to find who is keen
//           and against characters' `fears` to find who will refuse. A night run is
//           tagged 'dark' on top of these.
//   giver — the NPC id who hands it out.
//   goal  — what the last node is, in one line.
//   body  — what the job is, in the world's voice. Yours to write.
// Add a quest by adding a block. Nothing reads this list by position.

export const QUESTS = [
  {
    id: 'fenedge',
    label: 'The fen edge',
    size: 'short',
    when: 'any',
    party: 2,
    tags: ['fen', 'water', 'thedead', 'leavingtown'],
    giver: 'gregorious',
    goal: 'Walk the black water end to end and come back saying what is in it.',
    body: ['[Placeholder Text]'],
  },
  {
    id: 'coastroad',
    label: 'Down the coast road',
    size: 'medium',
    when: 'day',
    party: 3,
    tags: ['coast', 'water', 'leavingtown'],
    giver: 'gregorious',
    goal: 'Reach the wreck the Sea Hag was named for and bring back what is still on it.',
    body: ['[Placeholder Text]'],
  },
  {
    id: 'northroad',
    label: 'Past the treeline',
    size: 'long',
    when: 'night',
    party: 3,
    tags: ['road', 'forest', 'thenorthroad', 'thedead', 'leavingtown'],
    giver: 'gregorious',
    goal: 'Follow the north road to where the carters stopped, and find out why they stopped there.',
    body: ['[Placeholder Text]'],
  },
];
