import { toRhythmVector } from '../../core/anonymize';

describe('anonymize', () => {
  test('toRhythmVector computes stats', () => {
    const events = [
      { pauseBefore: 100 },
      { pauseBefore: 200 },
      { key: 'Backspace' },
    ];
    const vector = toRhythmVector(events);
    expect(vector.interKeyMean).toBe(100);
    expect(vector.backspaceRate).toBe(1/3);
    expect(vector.sampleLength).toBe(3);
  });

  test('toRhythmVector handles empty', () => {
    const vector = toRhythmVector([]);
    expect(vector.interKeyMean).toBe(0);
    expect(vector.sampleLength).toBe(0);
  });
});