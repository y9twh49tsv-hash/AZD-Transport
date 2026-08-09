import { describe, expect, it } from 'vitest';
import { escapeFilterValue, formatDate, formatDateTime, initials, pluralise } from './utils';

describe('escapeFilterValue', () => {
  it('leaves ordinary search terms untouched', () => {
    expect(escapeFilterValue('El Amrani')).toBe('El Amrani');
    expect(escapeFilterValue('+49 176 1111111')).toBe('+49 176 1111111');
    expect(escapeFilterValue('MC-260809-0042')).toBe('MC-260809-0042');
  });

  it('neutralises the PostgREST or() grammar', () => {
    // Without escaping this would append an extra condition to the filter and
    // return rows the search was never meant to reach.
    const attack = 'x,price_total_cents.gte.0';
    expect(escapeFilterValue(attack)).not.toContain(',');

    for (const character of [',', '(', ')', '\\']) {
      expect(escapeFilterValue(`a${character}b`)).toBe('a b');
    }
  });

  it('collapses the whitespace it introduces', () => {
    expect(escapeFilterValue('a,,,b')).toBe('a b');
    expect(escapeFilterValue('  Meier , Schmidt  ')).toBe('Meier Schmidt');
  });

  it('returns an empty string for input that was only separators', () => {
    expect(escapeFilterValue(',,,')).toBe('');
    expect(escapeFilterValue('   ')).toBe('');
  });
});

describe('date formatting', () => {
  it('formats in German, Berlin time', () => {
    expect(formatDate('2026-08-09T12:00:00Z')).toBe('09.08.2026');
    expect(formatDateTime('2026-08-09T12:00:00Z')).toContain('09.08.2026');
    expect(formatDateTime('2026-08-09T12:00:00Z')).toContain('Uhr');
  });

  it('degrades gracefully instead of printing "Invalid Date"', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
    expect(formatDate('kein datum')).toBe('—');
    expect(formatDateTime('')).toBe('—');
  });
});

describe('small helpers', () => {
  it('builds initials', () => {
    expect(initials('Yassin', 'El Amrani')).toBe('YE');
    expect(initials('Yassin')).toBe('Y');
    expect(initials()).toBe('?');
  });

  it('pluralises', () => {
    expect(pluralise(1, 'Sendung', 'Sendungen')).toBe('Sendung');
    expect(pluralise(0, 'Sendung', 'Sendungen')).toBe('Sendungen');
    expect(pluralise(5, 'Sendung', 'Sendungen')).toBe('Sendungen');
  });
});
