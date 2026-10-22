/**
 * The hero's quote bar: shown one at a time, in this order, looping.
 * Editable copy — reorder, add or remove freely; the first entry is what
 * the page renders before any JS runs.
 */

export interface Quote {
  readonly text: string;
  readonly author: string;
  readonly work?: string;
}

export const QUOTES: readonly Quote[] = [
  {
    text: "The most important step a man can take. It's not the first one, is it? It's the next one. Always the next step…",
    author: "Brandon Sanderson",
  },
  { text: "My mistakes are my life.", author: "Samuel Beckett" },
  {
    text: "Ever tried. Ever failed. No matter. Try again. Fail again. Fail better.",
    author: "Samuel Beckett",
    work: "Worstward Ho",
  },
  {
    text: "I would have lived in peace. But my enemies brought me war.",
    author: "Pierce Brown",
    work: "Red Rising",
  },
  {
    text: "A man thinks he can fly, but he is afraid to jump. A poor friend pushes him from behind. A good friend jumps with.",
    author: "Pierce Brown",
    work: "Red Rising",
  },
  { text: "One must imagine Sisyphus happy.", author: "Albert Camus", work: "The Myth of Sisyphus" },
  { text: "What stands in the way becomes the way.", author: "Marcus Aurelius", work: "Meditations" },
  { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" },
  {
    text: "Life can only be understood backwards; but it must be lived forwards.",
    author: "Søren Kierkegaard",
  },
  {
    text: "Let everything happen to you: beauty and terror. Just keep going. No feeling is final.",
    author: "Rainer Maria Rilke",
  },
  {
    text: "The mystery of human existence lies not in just staying alive, but in finding something to live for.",
    author: "Fyodor Dostoevsky",
    work: "The Brothers Karamazov",
  },
  {
    text: "Life before death. Strength before weakness. Journey before destination.",
    author: "Brandon Sanderson",
    work: "The Way of Kings",
  },
];

export const QUOTE_INTERVAL_MS = 7000;

export function nextQuoteIndex(current: number, count: number): number {
  return (current + 1) % count;
}
