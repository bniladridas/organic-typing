// SPDX-License-Identifier: BSD-3-Clause
type RawEvent = {
  printable?: boolean;
  pauseBefore?: number;
  down?: number;
  up?: number;
  key?: string;
  masked?: boolean;
};
export type RhythmVector = {
  interKeyMean: number;
  interKeyStd: number;
  backspaceRate: number;
  longPauseCount: number;
  sampleLength: number;
};

export function toRhythmVector(events: RawEvent[]): RhythmVector {
  const pauses = events.map((e) =>
    typeof e.pauseBefore === 'number' ? e.pauseBefore : 0
  );
  const interKeyMean =
    pauses.reduce((a, b) => a + b, 0) / Math.max(1, pauses.length);
  const interKeyStd = Math.sqrt(
    pauses
      .map((p) => Math.pow(p - interKeyMean, 2))
      .reduce((a, b) => a + b, 0) / Math.max(1, pauses.length)
  );
  const backspaceRate =
    events.filter((e) => e.key === 'Backspace').length /
    Math.max(1, events.length);
  const longPauseCount = pauses.filter((p) => p > 2000).length; // > 2s
  return {
    interKeyMean,
    interKeyStd,
    backspaceRate,
    longPauseCount,
    sampleLength: events.length,
  };
}
