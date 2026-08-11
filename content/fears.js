// What a person will not do, and what they will not do yet. Characters carry these by
// id; quests carry the same ids as tags. A match means they need to know you better
// before they will come.
//   id   — how content/party.js and content/quests.js refer to it.
//   name — shown on their sheet and in a refusal.
//   kind — fear or scruple. A fear is about them; a scruple is about the work. Only
//          changes the wording of the refusal, but the wording is the whole point.
//   body — what it is, in the world's voice. Yours to write.
// A quest run after dark is tagged 'dark' on top of whatever it already carries, so
// choosing the hour changes who will walk out with you.

export const FEARS = [
  { id: 'dark', name: 'The dark', kind: 'fear', body: ['[Placeholder Text]'] },
  { id: 'thedead', name: 'The dead', kind: 'fear', body: ['[Placeholder Text]'] },
  { id: 'water', name: 'Deep water', kind: 'fear', body: ['[Placeholder Text]'] },
  { id: 'thenorthroad', name: 'The north road', kind: 'fear', body: ['[Placeholder Text]'] },
  { id: 'leavingtown', name: 'Leaving the village', kind: 'scruple', body: ['[Placeholder Text]'] },
  { id: 'harm', name: 'Work that ends in harm', kind: 'scruple', body: ['[Placeholder Text]'] },
];
