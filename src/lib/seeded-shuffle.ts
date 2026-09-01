/** Deterministic shuffle: same `seed` always produces the same order, different seeds scramble differently. */
export function seededShuffle<T>(list: T[], seed: string): T[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const rand = () => {
    h = (Math.imul(h, 1103515245) + 12345) | 0;
    return (h >>> 0) / 4294967296;
  };
  return list
    .map((item) => ({ item, k: rand() }))
    .sort((a, b) => a.k - b.k)
    .map(({ item }) => item);
}
