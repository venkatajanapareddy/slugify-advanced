# slugify-advanced

[![npm version](https://img.shields.io/npm/v/slugify-advanced.svg)](https://www.npmjs.com/package/slugify-advanced)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> Advanced, SEO-friendly, locale-aware string slugification for URLs. TypeScript, zero runtime dependencies.

## Features

- **SEO-friendly**: Clean, predictable slugs for URLs.
- **Locale-aware**: Built-in transliteration for common European characters.
- **Highly customizable**: Control separators, case, replacements, strictness, stop words, and more.
- **TypeScript-first**: Full types and JSDoc.
- **Zero runtime dependencies**.

## Installation

```sh
npm install slugify-advanced
```

## Usage

```ts
import { slugify } from 'slugify-advanced';

slugify('Hello World!'); // 'hello-world'
slugify('für Straße'); // 'fuer-strasse'
slugify('Crème brûlée', { separator: '_' }); // 'creme_brulee'
```

## API

### `slugify(input: string, options?: SlugifyOptions): string`

Converts a string into a URL-friendly slug with advanced customization options.

#### Options

| Option               | Type                                              | Default     | Description                                                                         |
| -------------------- | ------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------- |
| `separator`          | `string`                                          | `'-'`       | Character used to join words and replace invalid character sequences.               |
| `lowercase`          | `boolean`                                         | `true`      | Whether to convert the result to lowercase.                                         |
| `customReplacements` | `Record<string, string>` or `Map<string, string>` | `{}`        | Custom character replacements to apply before any other processing.                 |
| `locale`             | `boolean`                                         | `true`      | Enable built-in locale transliterations for common European characters.             |
| `strict`             | `boolean`                                         | `false`     | If true, only allows alphanumeric and separator. If false, also allows underscores. |
| `maxLength`          | `number`                                          | `undefined` | Maximum length of the resulting slug. No trailing separator after truncation.       |
| `removeStopWords`    | `boolean` or `string[]`                           | `false`     | Remove common English stop words (or custom list).                                  |

#### Examples

```ts
slugify('The quick brown fox jumps over the lazy dog', { removeStopWords: true });
// 'quick-brown-fox-jumps-lazy-dog'

slugify('foo_bar-baz!', { strict: true });
// 'foo-bar-baz'

slugify('foo bar baz', { separator: '', customReplacements: { foo: 'zap' } });
// 'zapbarbaz'

slugify('Äpfel & Öl!', { lowercase: false, separator: '_', locale: true });
// 'Aepfel_Oel'

slugify('foo bar baz', { maxLength: 7 });
// 'foo-bar'
```

### Locale Support

If `locale: true` (default), the following mappings are applied:

- German: `ä → ae`, `ö → oe`, `ü → ue`, `ß → ss`
- French: `à → a`, `â → a`, `æ → ae`, `ç → c`, `é → e`, `è → e`, `ê → e`, `ë → e`, `î → i`, `ï → i`, `ô → o`, `œ → oe`, `ù → u`, `û → u`, `ü → u`, `ÿ → y`
- Spanish: `á → a`, `í → i`, `ñ → n`, `ó → o`, `ú → u`
- Scandinavian: `å → a`, `ø → o`
- Other: `č → c`, `š → s`, `ž → z`, `ł → l`, etc.

See `src/constants.ts` for the full mapping.

### Order of Operations

1. **Input check**: Throws if not a string. Trims input. Returns `''` if empty.
2. **Custom replacements**: Applies user-defined replacements (longest keys first).
3. **Case conversion**: Applies `lowercase` if enabled.
4. **Locale transliteration**: Applies built-in mappings if `locale: true`.
5. **Unicode normalization**: Removes diacritics.
6. **Stop word removal**: Removes stop words if enabled.
7. **Whitespace replacement**: Replaces whitespace with `separator`.
8. **Disallowed character removal**: Removes unwanted characters based on `strict`.
9. **Collapse separators**: Collapses consecutive separators.
10. **Trim separators**: Trims leading/trailing separators.
11. **Max length**: Truncates to `maxLength` (no trailing separator).
12. **Return**: Returns the slug.

### License

MIT

---

## Contributing

Contributions are welcome! Please open issues or pull requests.

---

## Analysis & Potential Improvements (by AI Assistant)

This section provides a brief analysis of the project and potential areas for enhancement.

**Overall Assessment:**

`slugify-advanced` is a well-structured, well-documented, and comprehensively tested TypeScript library for generating URL slugs. It offers a rich set of features (locale awareness, customization, stop word removal, etc.) with zero runtime dependencies. The code quality is high, employing clear separation of concerns, TypeScript types, and robust handling of edge cases like multi-character separators and `maxLength` truncation.

**Potential Enhancements:**

1.  **Extensible Locale Mappings**: Consider allowing users to provide custom locale mapping objects (e.g., via `options.localeMap`) to supplement or override the built-in `LOCALE_MAPPINGS`, enabling support for more languages or specific transliteration rules.
2.  **Locale-Specific Stop Words**: The `removeStopWords` feature currently defaults to English. Explore adding optional, locale-specific default stop word lists (e.g., `removeStopWords: { locale: 'de' }`) or clearly documenting that users should provide their own arrays for non-English languages. This involves trade-offs regarding package size/dependencies.
3.  **Performance Considerations**: While the current multi-pass regex approach is clear and correct, mention that for extreme high-throughput scenarios, performance profiling might be needed. (Note: The current implementation is likely sufficient for most use cases).
4.  **Developer Documentation**: Add a "Development" section to the README detailing how to set up the project locally, run tests (`npm test`), lint (`npm run lint`), build (`npm run build`), and format code (`npm run format`).
5.  **CI/CD**: Ensure GitHub Actions (or other CI) workflows are in place for automated testing, linting, and potentially release management upon commits/PRs/tags.
6.  **`preserveCase` Clarity**: While functional, the logic in `src/helpers.ts -> preserveCase` could benefit from additional comments explaining the rationale behind the different case-preservation scenarios it handles.

These are suggestions for potential future development and do not indicate major flaws in the current implementation. The library is already robust and feature-rich.
