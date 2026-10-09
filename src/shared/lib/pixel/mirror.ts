/** Expands left-half rows into full symmetrical rows. */
export function mirror(halves: string[]) {
  return halves.map((row) => row + [...row].reverse().join(""));
}
