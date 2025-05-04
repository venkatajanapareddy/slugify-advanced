import { DEFAULT_STOP_WORDS, LOCALE_MAPPINGS } from './constants';
import { escapeRegExp, preserveCase } from './helpers';

/**
 * Configuration options for the slugify function.
 */
export interface SlugifyOptions {
  /**
   * Character used to join words and replace invalid character sequences.
   * @default '-'
   */
  separator?: string;
  /**
   * Whether to convert the result to lowercase.
   * @default true
   */
  lowercase?: boolean;
  /**
   * Custom character replacements to apply before any other processing.
   * Keys are characters/strings to replace, values are their replacements.
   * Applied case-insensitively if `lowercase` is true. Longest keys replaced first.
   * @default {}
   */
  customReplacements?: Record<string, string> | Map<string, string>;
  /**
   * Whether to enable basic common transliterations for accented characters.
   * If true, applies a built-in map for common European characters.
   * If false, only basic accent removal via Unicode normalization occurs.
   * @default true
   */
  locale?: boolean;
  /**
   * If true, removes any character that is not strictly alphanumeric or the specified separator
   * after replacements and transliterations.
   * If false (default), preserves alphanumeric characters, underscores '_', and the separator,
   * removing other symbols.
   * @default false
   */
  strict?: boolean;
  /**
   * Maximum length of the resulting slug. If undefined, no limit is applied.
   * Truncation should not leave a trailing separator.
   * @default undefined
   */
  maxLength?: number;
  /**
   * If true, removes common English stop words using a default list.
   * If an array of strings is provided, removes those specific words instead.
   * Removal is case-insensitive and respects word boundaries.
   * @default false
   */
  removeStopWords?: boolean | string[];
}

/**
 * Converts a string into a URL-friendly slug with advanced customization options.
 * Follows a specific order of operations for predictable results.
 *
 * @param input - The string to convert to a slug.
 * @param options - Optional configuration object to customize slugification behavior.
 * @returns The generated slug string.
 * @throws {TypeError} If the input is not a string.
 */
export function slugify(input: string, options: SlugifyOptions = {}): string {
  if (typeof input !== 'string') {
    throw new TypeError('slugify: input must be a string');
  }
  let result = input.trim();
  if (!result) return '';

  const {
    separator = '-',
    lowercase = true,
    customReplacements = {},
    locale = true,
    strict = false,
    maxLength,
    removeStopWords = false,
  } = options;

  // b. Custom replacements
  let replacementsArr: [string, string][] = [];
  if (customReplacements instanceof Map) {
    replacementsArr = Array.from(customReplacements.entries());
  } else if (typeof customReplacements === 'object' && customReplacements !== null) {
    replacementsArr = Object.entries(customReplacements);
  }
  replacementsArr.sort((a, b) => b[0].length - a[0].length);
  for (const [find, replace] of replacementsArr) {
    const flags = 'g';
    const pattern = escapeRegExp(find);
    result = result.replace(new RegExp(pattern, flags), (match) => preserveCase(match, replace));
  }

  // d. Locale mappings (use LOCALE_MAPPINGS as is)
  if (locale) {
    const localeEntries = Object.entries(LOCALE_MAPPINGS).sort((a, b) => b[0].length - a[0].length);
    for (const [find, replace] of localeEntries) {
      const pattern = escapeRegExp(find);
      result = result.replace(new RegExp(pattern, 'g'), (match) => preserveCase(match, replace));
    }
  }
  // Always handle ß -> ss even if locale: false
  result = result.replace(/ß/g, 'ss');
  result = result.replace(/ẞ/g, 'SS');

  // e. Unicode normalization and diacritic removal
  result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // c. Lowercase (after normalization, before stop word removal)
  if (lowercase) {
    result = result.toLowerCase();
  }

  // f. Stop word removal (after lowercasing and normalization, before separator normalization)
  let stopWords: string[] = [];
  if (removeStopWords === true) {
    stopWords = DEFAULT_STOP_WORDS;
  } else if (Array.isArray(removeStopWords)) {
    stopWords = removeStopWords;
  }
  if (stopWords.length > 0) {
    const stopPattern = new RegExp(`\\b(${stopWords.map(escapeRegExp).join('|')})\\b`, 'gi');
    result = result.replace(stopPattern, ' ');
    result = result.replace(/\s+/g, ' ');
    result = result.trim();
  }

  // g. Normalize all runs of whitespace and all runs of '-' to the separator
  if (separator) {
    result = result.replace(/[\s-]+/g, separator);
  } else {
    result = result.replace(/[\s-]+/g, '');
  }

  // --- Robust separator handling for steps h, i, j ---
  const isMultiCharSep = separator.length > 1;
  const SEP_PLACEHOLDER = '__SLUGIFYSEP__';

  // h. Remove disallowed characters
  if (separator && isMultiCharSep) {
    result = result.replace(new RegExp(escapeRegExp(separator), 'g'), SEP_PLACEHOLDER);
    // In strict mode, also replace underscores with the separator before removing
    if (strict) {
      result = result.replace(/_/g, SEP_PLACEHOLDER);
    }
    const allowed = strict
      ? new RegExp(`[^a-zA-Z0-9${SEP_PLACEHOLDER}]`, 'g')
      : new RegExp(`[^a-zA-Z0-9_${SEP_PLACEHOLDER}]`, 'g');
    result = result.replace(allowed, '');
    result = result.replace(new RegExp(SEP_PLACEHOLDER, 'g'), separator);
  } else {
    const escapedSeparator = escapeRegExp(separator);
    if (strict) {
      // In strict mode, also replace underscores with the separator before removing
      result = result.replace(/_/g, separator);
      const pattern = separator
        ? new RegExp(`[^a-zA-Z0-9${escapedSeparator}]`, 'g')
        : /[^a-zA-Z0-9]/g;
      result = result.replace(pattern, '');
    } else {
      const pattern = separator
        ? new RegExp(`[^a-zA-Z0-9_${escapedSeparator}]`, 'g')
        : /[^a-zA-Z0-9_]/g;
      result = result.replace(pattern, '');
    }
  }

  if (separator && isMultiCharSep) {
    result = result.replace(/SLUGIFYSEP/g, separator);
  }

  // i. Collapse consecutive separators (must be after all placeholder replacements)
  if (separator) {
    if (isMultiCharSep) {
      const sepPattern = new RegExp(`(?:${escapeRegExp(separator)}){2,}`, 'g');
      result = result.replace(sepPattern, separator);
    } else {
      const sepPattern = new RegExp(`${escapeRegExp(separator)}{2,}`, 'g');
      result = result.replace(sepPattern, separator);
    }
  }

  // j. Trim leading/trailing separators
  if (separator) {
    if (isMultiCharSep) {
      const trimPattern = new RegExp(
        `^(?:${escapeRegExp(separator)})+|(?:${escapeRegExp(separator)})+$`,
        'g'
      );
      result = result.replace(trimPattern, '');
    } else {
      const trimPattern = new RegExp(
        `^${escapeRegExp(separator)}+|${escapeRegExp(separator)}+$`,
        'g'
      );
      result = result.replace(trimPattern, '');
    }
  }

  // k. Max length truncation (allow partial words, just trim trailing separator if present)
  if (typeof maxLength === 'number' && maxLength > 0 && result.length > maxLength) {
    result = result.slice(0, maxLength);
  }

  // Remove any trailing substring that is a prefix of the separator (after truncation)
  if (separator) {
    let changed = true;
    while (changed) {
      changed = false;
      for (let i = separator.length - 1; i > 0; i--) {
        if (result.endsWith(separator.slice(0, i))) {
          result = result.slice(0, -i);
          changed = true;
          break;
        }
      }
    }
  }

  // Remove trailing separator if present (must be after truncation and partial separator removal)
  if (separator) {
    if (isMultiCharSep) {
      const trimPattern = new RegExp(`(?:${escapeRegExp(separator)})+$`);
      result = result.replace(trimPattern, '');
    } else {
      const trimPattern = new RegExp(`${escapeRegExp(separator)}+$`);
      result = result.replace(trimPattern, '');
    }
  }

  return result;
}
