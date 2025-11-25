// SPDX-License-Identifier: BSD-3-Clause
import { Keystroke } from '../collector/keylogger';

export interface NormalizedKeystroke extends Keystroke {
  interval: number; // time since previous keystroke
}

export function normalizeKeystrokes(keystrokes: Keystroke[]): NormalizedKeystroke[] {
  const sorted = keystrokes.sort((a, b) => a.timestamp - b.timestamp);
  const normalized: NormalizedKeystroke[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const interval = i > 0 ? sorted[i].timestamp - sorted[i-1].timestamp : 0;
    normalized.push({ ...sorted[i], interval });
  }
  return normalized;
}
