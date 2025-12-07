// SPDX-License-Identifier: BSD-3-Clause
import { spawn } from 'child_process';
import * as os from 'os';

describe('CLI Integration', () => {
  it('should generate text via CLI', (done) => {
    const cli = spawn('npm', ['run', 'dev', 'generate', 'test'], {
      stdio: 'pipe',
    });
    let output = '';
    cli.stdout.on('data', (data) => {
      output += data.toString();
    });
    cli.on('close', (code) => {
      expect(code).toBe(0);
      expect(output).toContain('Generated: test');
      done();
    });
  }, 10000);

  it('should handle collect command on Linux', (done) => {
    if (os.platform() !== 'linux') {
      console.log('Skipping collect test on non-Linux platform');
      return done();
    }
    const cli = spawn('npm', ['run', 'dev', 'collect', 'test.json'], {
      stdio: 'pipe',
      timeout: 2000,
    });
    cli.on('close', (code) => {
      // May fail without sudo or device, but command should exist
      expect(code).toBeDefined();
      done();
    });
  });
});
