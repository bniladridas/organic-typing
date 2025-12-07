// SPDX-License-Identifier: BSD-3-Clause
import { calculateStats } from '../../core/processor/stats';
import { normalizeKeystrokes } from '../../core/processor/normalize';
import { Keystroke } from '../../core/collector/keylogger';

describe('calculateStats', () => {
  it('should calculate average interval correctly', () => {
    const keystrokes: Keystroke[] = [
      { key: 'a', timestamp: 100, type: 'press' },
      { key: 'b', timestamp: 200, type: 'press' },
      { key: 'c', timestamp: 300, type: 'press' },
    ];
    const normalized = normalizeKeystrokes(keystrokes);
    const stats = calculateStats(normalized);
    expect(stats.averageInterval).toBe(100);
  });

  it('should calculate pause count correctly', () => {
    const keystrokes: Keystroke[] = [
      { key: 'a', timestamp: 100, type: 'press' },
      { key: 'b', timestamp: 200, type: 'press' },
      { key: 'c', timestamp: 1201, type: 'press' }, // pause > 1000ms
    ];
    const normalized = normalizeKeystrokes(keystrokes);
    const stats = calculateStats(normalized);
    expect(stats.pauseCount).toBe(1);
  });

  it('should generate rhythm vector', () => {
    const keystrokes: Keystroke[] = [
      { key: 'a', timestamp: 100, type: 'press' },
      { key: 'b', timestamp: 200, type: 'press' },
    ];
    const normalized = normalizeKeystrokes(keystrokes);
    const stats = calculateStats(normalized);
    expect(stats.rhythmVector).toEqual([0, 1, 0, 0, 0]); // 100ms in 100-200 bin
  });
});
