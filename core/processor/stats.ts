import { NormalizedKeystroke } from './normalize';

export interface TypingStats {
  averageInterval: number;
  stdInterval: number;
  pauseCount: number;
  rhythmVector: number[];
}

export function calculateStats(normalized: NormalizedKeystroke[]): TypingStats {
  const intervals = normalized.map(k => k.interval).filter(i => i > 0);
  if (intervals.length === 0) return { averageInterval: 0, stdInterval: 0, pauseCount: 0, rhythmVector: [] };

  const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((sum, i) => sum + (i - avg) ** 2, 0) / intervals.length;
  const std = Math.sqrt(variance);
  const pauses = intervals.filter(i => i > 1000).length;

  // Rhythm vector: count intervals in bins (ms)
  const bins = [0, 100, 200, 500, 1000, Infinity];
  const rhythmVector = bins.slice(0, -1).map((bin, idx) => {
    const next = bins[idx + 1];
    return intervals.filter(i => i >= bin && i < next).length;
  });

  return { averageInterval: avg, stdInterval: std, pauseCount: pauses, rhythmVector };
}
