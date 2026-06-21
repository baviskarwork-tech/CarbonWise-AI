import { formatCarbon, formatPercent, formatDate } from './formatters';

describe('UI Formatters Utility', () => {
  test('formats carbon values in tons when >= 1000 kg', () => {
    expect(formatCarbon(1500)).toBe('1.5 t CO₂e');
    expect(formatCarbon(12340, 1)).toBe('12.3 t CO₂e');
  });

  test('formats carbon values in kg when < 1000 kg', () => {
    expect(formatCarbon(850)).toBe('850 kg CO₂e');
    expect(formatCarbon(20)).toBe('20 kg CO₂e');
  });

  test('formats numbers as percent labels correctly', () => {
    expect(formatPercent(45)).toBe('45%');
    expect(formatPercent(12.3)).toBe('12%');
  });

  test('formats ISO strings to clean dates', () => {
    const isoString = '2026-06-21T12:00:00.000Z';
    expect(formatDate(isoString)).toContain('2026');
    expect(formatDate(isoString)).toContain('Jun');
  });

  test('returns N/A for invalid date parameters', () => {
    expect(formatDate('invalid-date')).toBe('N/A');
    expect(formatDate('')).toBe('N/A');
  });
});
