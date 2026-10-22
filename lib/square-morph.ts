/**
 * The square actor's shape along its route, keyed on the route's roles so it
 * holds with or without the lens slot. Born a square (the full stop of I'M
 * JIEWEN.), it spins three turns into a circle on its way to the lens at
 * mid-screen, stays a circle through the lens and into TRAJECTORY's O, then,
 * leaving the O, spins one more turn back into a square and stays a square
 * for the rest of the journey (36 vh slot, EXPERIENCE, the deck, BU■LD).
 *
 * `ai` is the mark the actor is leaving (or dwelling at), `t` its 0..1
 * progress toward the next mark; `roles` are the lens slot's and the O's mark
 * indices (lens −1 when there is no lens slot: the O takes its place). `round`
 * is 0 (square) .. 1 (circle). `spin` is cumulative degrees, so it never runs
 * backwards and every rest point is a whole number of turns.
 */

export interface SquareMorph {
  round: number;
  spin: number;
}

export interface MorphRoles {
  lens: number;
  o: number;
}

const INTO_CIRCLE = 1080; // three turns into the circle
const BACK_TO_SQUARE = 360; // one more back into the square

export function squareMorph(ai: number, t: number, roles: MorphRoles): SquareMorph {
  const { o } = roles;
  if (o < 0) return { round: 0, spin: 0 };
  const lens = roles.lens < 0 ? o : roles.lens;
  if (ai < lens) return { round: t, spin: INTO_CIRCLE * t };
  if (ai < o) return { round: 1, spin: INTO_CIRCLE };
  if (ai === o) return { round: 1 - t, spin: INTO_CIRCLE + BACK_TO_SQUARE * t };
  return { round: 0, spin: INTO_CIRCLE + BACK_TO_SQUARE };
}
