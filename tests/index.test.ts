import { describe, it, expect } from 'vitest';

import { slugify } from '../src';

describe('slugify', () => {
  it('should return an empty string for empty or whitespace-only input', () => {
    expect(slugify('')).toBe('');
    expect(slugify('   ')).toBe('');
  });

  it('should throw TypeError for non-string input', () => {
    // @ts-expect-error testing null input which is invalid
    expect(() => slugify(null)).toThrow(TypeError);
    // @ts-expect-error testing undefined input which is invalid
    expect(() => slugify(undefined)).toThrow(TypeError);
    // @ts-expect-error testing number input which is invalid
    expect(() => slugify(123)).toThrow(TypeError);
    // @ts-expect-error testing object input which is invalid
    expect(() => slugify({})).toThrow(TypeError);
  });

  it('should slugify basic ASCII strings with default options', () => {
    expect(slugify('Hello World!')).toBe('hello-world');
    expect(slugify('The quick brown fox')).toBe('the-quick-brown-fox');
    expect(slugify('foo_bar-baz!')).toBe('foo_bar-baz');
  });

  it('should handle custom separators (single and multi-character)', () => {
    expect(slugify('Hello World!', { separator: '_' })).toBe('hello_world');
    expect(slugify('foo   bar---baz', { separator: '_' })).toBe('foo_bar_baz');
    expect(slugify('foo   bar---baz', { separator: '--' })).toBe('foo--bar--baz');
    expect(slugify('foo   bar---baz', { separator: '' })).toBe('foobarbaz');
  });

  it('should respect lowercase: false and preserve case', () => {
    expect(slugify('Hello World!', { lowercase: false })).toBe('Hello-World');
    expect(
      slugify('FOO foo', { lowercase: false, customReplacements: { FOO: 'BAR', foo: 'baz' } })
    ).toBe('BAR-baz');
  });

  it('should apply customReplacements (object and Map)', () => {
    expect(slugify('foo bar baz', { customReplacements: { foo: 'qux', bar: 'zap' } })).toBe(
      'qux-zap-baz'
    );
    const map = new Map([
      ['foo', 'qux'],
      ['bar', 'zap'],
    ]);
    expect(slugify('foo bar baz', { customReplacements: map })).toBe('qux-zap-baz');
  });

  it('should apply locale mappings for German, French, Spanish, Scandinavian', () => {
    expect(slugify('für Straße')).toBe('fuer-strasse');
    expect(slugify('crème brûlée')).toBe('creme-brulee');
    expect(slugify('niño jalapeño')).toBe('nino-jalapeno');
    expect(slugify('smörgåsbord')).toBe('smoergasbord');
    expect(slugify('Æther & Œuvre')).toBe('aether-oeuvre');
    expect(slugify('Łódź')).toBe('lodz');
  });

  it('should handle ß -> ss even if locale: false', () => {
    expect(slugify('straße', { locale: false })).toBe('strasse');
  });

  it('should remove diacritics for other accents', () => {
    expect(slugify('São Tomé')).toBe('sao-tome');
    expect(slugify('Český Krumlov')).toBe('cesky-krumlov');
  });

  it('should remove stop words (default and custom list)', () => {
    expect(slugify('The quick brown fox jumps over the lazy dog', { removeStopWords: true })).toBe(
      'quick-brown-fox-jumps-lazy-dog'
    );
    expect(slugify('foo bar baz qux', { removeStopWords: ['bar', 'qux'] })).toBe('foo-baz');
  });

  it('should handle strict mode (removes all but alphanumeric and separator)', () => {
    expect(slugify('foo_bar-baz!', { strict: true })).toBe('foo-bar-baz');
    expect(slugify('foo_bar-baz!', { strict: false })).toBe('foo_bar-baz');
    expect(slugify('foo_bar-baz!', { strict: true, separator: '_' })).toBe('foo_bar_baz');
  });

  it('should handle maxLength and not leave trailing separator', () => {
    expect(slugify('the quick brown fox', { maxLength: 10 })).toBe('the-quick');
    expect(slugify('the quick brown fox', { maxLength: 13 })).toBe('the-quick-bro');
    expect(slugify('the quick brown fox', { maxLength: 14 })).toBe('the-quick-brow');
    expect(slugify('the quick brown fox', { maxLength: 15 })).toBe('the-quick-brown');
    expect(slugify('the quick brown fox', { maxLength: 16 })).toBe('the-quick-brown');
    expect(slugify('the quick brown fox', { maxLength: 17 })).toBe('the-quick-brown-f');
    expect(slugify('foo bar baz', { maxLength: 7 })).toBe('foo-bar');
    expect(slugify('foo bar baz', { maxLength: 8 })).toBe('foo-bar');
    expect(slugify('foo bar baz', { maxLength: 9 })).toBe('foo-bar-b');
  });

  it('should collapse consecutive separators and trim leading/trailing separators', () => {
    expect(slugify('foo   bar---baz', { separator: '-' })).toBe('foo-bar-baz');
    expect(slugify('foo   bar---baz', { separator: '_' })).toBe('foo_bar_baz');
    expect(slugify('---foo bar---', { separator: '-' })).toBe('foo-bar');
    expect(slugify('___foo bar___', { separator: '_' })).toBe('foo_bar');
  });

  it('should handle empty separator and single word', () => {
    expect(slugify('foo bar baz', { separator: '' })).toBe('foobarbaz');
    expect(slugify('foo   bar---baz', { separator: '' })).toBe('foobarbaz');
    expect(slugify('Hello', { lowercase: false })).toBe('Hello');
  });

  it('should handle very long strings and strings with only symbols', () => {
    const long = 'a'.repeat(1000);
    expect(slugify(long)).toBe('a'.repeat(1000));
    expect(slugify(long, { maxLength: 10 })).toBe('aaaaaaaaaa');
    expect(slugify('!@#$%^&*()')).toBe('');
    expect(slugify('!@#$%^&*()', { separator: '_' })).toBe('');
  });

  it('should handle mixed case, symbols, and accents', () => {
    expect(slugify('Äpfel & Öl!')).toBe('aepfel-oel');
    expect(slugify('Crème brûlée!')).toBe('creme-brulee');
    expect(slugify('¡Hola, señor!')).toBe('hola-senor');
  });

  it('should handle leading/trailing/consecutive spaces', () => {
    expect(slugify('   foo   bar   ')).toBe('foo-bar');
    expect(slugify('foo   bar   baz')).toBe('foo-bar-baz');
  });

  it('should handle option combinations and edge cases', () => {
    expect(
      slugify('The quick brown fox', { lowercase: false, separator: '_', removeStopWords: true })
    ).toBe('quick_brown_fox');
    expect(slugify('Äpfel & Öl!', { lowercase: false, separator: '_', locale: true })).toBe(
      'Aepfel_Oel'
    );
    expect(
      slugify('foo bar baz', { customReplacements: { foo: 'zap' }, strict: true, separator: '_' })
    ).toBe('zap_bar_baz');
    expect(
      slugify('FOO foo', { lowercase: false, customReplacements: { FOO: 'BAR', foo: 'baz' } })
    ).toBe('BAR-baz');
  });

  it('should handle multi-character separators with strict mode and maxLength', () => {
    expect(slugify('foo   bar---baz', { separator: '--', strict: true })).toBe('foo--bar--baz');
    expect(slugify('foo   bar---baz', { separator: '--', maxLength: 8 })).toBe('foo--bar');
    expect(slugify('foo   bar---baz', { separator: '--', maxLength: 9 })).toBe('foo--bar');
    expect(slugify('foo   bar---baz', { separator: '--', maxLength: 10 })).toBe('foo--bar');
  });
});
