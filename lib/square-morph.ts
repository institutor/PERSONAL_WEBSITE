/**
 * The square actor's shape along its route. Born a square (the full stop
 * of I'M JIEWEN.), it spins three turns into a circle across its first flight
 * (to the lens at mid-screen), stays round through the site, and spins one
 * more turn back into a square on the final approach to BU■LD.
 *
 * `ai` is the mark the actor is leaving (or dwelling at), `t` its 0..1
 * progress toward the next mark, `count` the number of marks. `round` is
 * 0 (square) .. 1 (circle). `spin` is cumulative degrees, so it never runs
 * backwards and every rest point is a whole number of turns.
 */

export interface SquareMorph {
  round: number;
  spin: number;
}

export function squareMorph(ai: number, t: number, count: number): SquareMorph {
  if (count < 2) return { round: 0, spin: 0 };
  const last = count - 1;
  const first = 1080; // three turns into the circle
  const total = first + 360; // and one more back into the square
  if (ai >= last) return { round: 0, spin: total };
  // one flight is both the first and the last: round out and back in it
  if (last === 1) return { round: Math.sin(Math.PI * t), spin: total * t };
  if (ai === 0) return { round: t, spin: first * t };
  if (ai === last - 1) return { round: 1 - t, spin: first + 360 * t };
  return { round: 1, spin: first };
}
