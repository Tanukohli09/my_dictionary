export function normalizeWord(input: string) {
  return input.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function titleCaseWord(word: string) {
  return word
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export function firstLetter(word: string) {
  const letter = normalizeWord(word).charAt(0).toUpperCase();
  return /[A-Z]/.test(letter) ? letter : '#';
}
