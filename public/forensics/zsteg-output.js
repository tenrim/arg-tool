// The pinned AperiSolve adapter splits stdout on LF. zsteg also starts
// each scan combination with a terminal carriage return, even without a hit.
export function zstegDisplayText(value) {
  const text = Array.isArray(value) ? value.join('\n') : value;
  return text
    .replace(/^\r(?!\n)/, '')
    .replace(/\r\n|\n\r|\r/g, '\n')
    .trimEnd();
}
