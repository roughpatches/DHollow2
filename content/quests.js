// Work Gregorious hands out. A quest is a size and a goal; the nodes between here and
// the goal are drawn fresh from content/encounters.js every time it is accepted, so a
// quest is never the same run twice.
//   id    — how src/run.js refers to it.
//   label — shown on the board and in the Quest Log.
//   size  — short, medium, or long. The node count for each is in tuning.js.
//   giver — the NPC id who hands it out.
//   goal  — what the last node is, in one line.
//   body  — what the job is, in the world's voice. Yours to write.
// Add a quest by adding a block. Nothing reads this list by position.

export const QUESTS = [
  {
    id: 'fenedge',
    label: 'The fen edge',
    size: 'short',
    giver: 'gregorious',
    goal: 'Walk the black water end to end and come back saying what is in it.',
    body: ['[Placeholder Text]'],
  },
  {
    id: 'coastroad',
    label: 'Down the coast road',
    size: 'medium',
    giver: 'gregorious',
    goal: 'Reach the wreck the Sea Hag was named for and bring back what is still on it.',
    body: ['[Placeholder Text]'],
  },
  {
    id: 'northroad',
    label: 'Past the treeline',
    size: 'long',
    giver: 'gregorious',
    goal: 'Follow the north road to where the carters stopped, and find out why they stopped there.',
    body: ['[Placeholder Text]'],
  },
];
