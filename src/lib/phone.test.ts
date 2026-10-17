import { describe, it, expect } from 'vitest';
import { normalizePhone } from './phone';

describe('normalizePhone', () => {
  it('keeps an explicit +indicatif', () => expect(normalizePhone('+221 77 123 45 67')).toBe('221771234567'));
  it('handles 00 prefix', () => expect(normalizePhone('0033612345678')).toBe('33612345678'));
  it('adds default code when missing', () => expect(normalizePhone('77 123 45 67', '221')).toBe('221771234567'));
  it('drops leading 0 for local french number', () => expect(normalizePhone('06 12 34 56 78', '33')).toBe('33612345678'));
  it('rejects imprecise numbers', () => expect(normalizePhone('12345')).toBeNull());
});
