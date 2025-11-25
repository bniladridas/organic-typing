// SPDX-License-Identifier: BSD-3-Clause
import { normalizeKeystrokes } from '../../core/processor/normalize';
import { Keystroke } from '../../core/collector/keylogger';

describe('normalizeKeystrokes', () => {
  it('should calculate intervals correctly', () => {
    const keystrokes: Keystroke[] = [
      { key: 'a', timestamp: 100, type: 'press' },
      { key: 'b', timestamp: 200, type: 'press' },
      { key: 'c', timestamp: 300, type: 'press' },
    ];
    const result = normalizeKeystrokes(keystrokes);
    expect(result[0].interval).toBe(0);
    expect(result[1].interval).toBe(100);
    expect(result[2].interval).toBe(100);
  });

  it('should handle empty keystrokes', () => {
    const keystrokes: Keystroke[] = [];
    const result = normalizeKeystrokes(keystrokes);
    expect(result).toEqual([]);
  });

  it('should handle single keystroke', () => {
    const keystrokes: Keystroke[] = [
      { key: 'a', timestamp: 100, type: 'press' },
    ];
    const result = normalizeKeystrokes(keystrokes);
    expect(result[0].interval).toBe(0);
  });

  it('should calculate intervals with varying timestamps', () => {
    const keystrokes: Keystroke[] = [
      { key: 'a', timestamp: 100, type: 'press' },
      { key: 'b', timestamp: 150, type: 'press' },
      { key: 'c', timestamp: 180, type: 'press' },
    ];
    const result = normalizeKeystrokes(keystrokes);
    expect(result[0].interval).toBe(0);
    expect(result[1].interval).toBe(50);
    expect(result[2].interval).toBe(30);
  });
});
