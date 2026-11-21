// Shared by the original Hanzi page and the isolated clue-analysis worker.
export function componentMatches(dict, text) {
  const parts = [...text.replace(/\s/g, '')];
  function contains(character, part, seen = new Set()) {
    if (character === part) return true;
    if (seen.has(character)) return false;
    seen.add(character);
    return [...(dict.get(character)?.decomposition || '')].some(
      (next) => next === part || (dict.has(next) && contains(next, part, seen)),
    );
  }
  return [...dict.keys()].filter((character) => parts.every((part) => contains(character, part)));
}
