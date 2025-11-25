// SPDX-License-Identifier: BSD-3-Clause
import { execSync } from 'child_process';

const pythonCmd = 'python3';

describe('Model Integration', () => {
  it('should encode stats using Python encoder', () => {
    const stats = {
      averageInterval: 100,
      stdInterval: 10,
      pauseCount: 0,
      rhythmVector: [0, 1, 0, 0, 0]
    };
    const statsJson = JSON.stringify(stats);
    const result = execSync(`${pythonCmd} core/model/organic-encoder.py`, {
      input: statsJson,
      encoding: 'utf-8'
    }).toString().trim();
    const vector = JSON.parse(result);
    expect(Array.isArray(vector)).toBe(true);
    expect(vector.length).toBe(8); // 3 stats + 5 rhythm
  });

  it('should verify vector using Python verifier', () => {
    const vector = [100, 10, 0, 0, 1, 0, 0, 0];
    const vectorJson = JSON.stringify(vector);
    const result = execSync(`${pythonCmd} core/model/verifier.py`, {
      input: vectorJson,
      encoding: 'utf-8'
    }).toString().trim();
    expect(result).toBe('Human'); // Based on heuristic
  });
});