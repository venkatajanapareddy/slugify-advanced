/**
 * Escapes special RegExp characters in a string for use in a RegExp pattern.
 * @param str - The string to escape.
 * @returns The escaped string.
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Preserves the case of the original string in the replacement string.
 * If the original is all uppercase, returns replacement in uppercase.
 * If the original is all lowercase, returns replacement in lowercase.
 * If the original is capitalized, returns replacement capitalized.
 * Otherwise, returns replacement as-is.
 * @param original - The original string to match case from.
 * @param replacement - The replacement string to adjust case for.
 * @returns The replacement string with case adjusted to match the original.
 */
export function preserveCase(original: string, replacement: string): string {
  if (original.length === 1 && original.toUpperCase() === original) {
    // Single uppercase letter, capitalize only the first letter of the replacement
    return replacement[0].toUpperCase() + replacement.slice(1).toLowerCase();
  }
  if (original.toUpperCase() === original) {
    return replacement.toUpperCase();
  }
  if (original.toLowerCase() === original) {
    return replacement.toLowerCase();
  }
  if (
    original.length > 1 &&
    original[0].toUpperCase() === original[0] &&
    original.slice(1).toLowerCase() === original.slice(1)
  ) {
    return replacement[0].toUpperCase() + replacement.slice(1).toLowerCase();
  }
  return replacement;
}
