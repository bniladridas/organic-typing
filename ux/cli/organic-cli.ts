// SPDX-License-Identifier: BSD-3-Clause
import { Command } from 'commander';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import { normalizeKeystrokes } from '../../core/processor/normalize';
import { calculateStats } from '../../core/processor/stats';
import { Keystroke } from '../../core/collector/keylogger';
interface KeyloggerType {
  start(): Promise<void>;
  stop(): void;
  getKeystrokes(): { key: string; timestamp: number; type: 'press' | 'release' }[];
}

let LinuxKeylogger: (new () => KeyloggerType) | undefined;
let MacKeylogger: (new () => KeyloggerType) | undefined;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
  LinuxKeylogger = require('../../core/collector/linux-keylogger').default;
} catch {
  // evdev not available
}
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
  MacKeylogger = require('../../core/collector/mac-keylogger').default;
} catch {
  // uiohook not available
}

const program = new Command();

program
  .name('organic')
  .description('Organic typing CLI')
  .version('0.1.0');

program.command('generate')
  .description('Generate text with organic style')
  .argument('<prompt>', 'text prompt')
  .action((prompt) => {
    console.log(`Generating text for: ${prompt}`);
    console.log(`Generated: ${prompt}`);
    process.exit(0);
  });

program.command('verify')
  .description('Verify typing signature')
  .argument('<file>', 'keystroke data file')
  .action(async (file) => {
    console.log(`Verifying signature from: ${file}`);
    try {
      const data: Keystroke[] = JSON.parse(fs.readFileSync(file, 'utf8'));
      const normalized = normalizeKeystrokes(data);
      const stats = calculateStats(normalized);
      console.log(`Stats: Avg Interval ${stats.averageInterval.toFixed(2)}ms, Pauses: ${stats.pauseCount}`);
      // Encode stats to vector
      const pythonCmd = process.env.CI ? '/opt/hostedtoolcache/Python/3.14.0/x64/bin/python3' : 'python3';
      const encoder = spawn(pythonCmd, ['core/model/organic-encoder.py'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      const statsJson = JSON.stringify(stats);
      encoder.stdin.write(statsJson);
      encoder.stdin.end();
      let vectorOutput = '';
      encoder.stdout.on('data', (data) => {
        vectorOutput += data.toString();
      });
      encoder.stderr.on('data', (data) => {
        console.error('Encoder error:', data.toString());
      });
      encoder.on('close', (code) => {
        if (code === 0) {
          try {
            const vector = JSON.parse(vectorOutput.trim());
            // Now verify
            const pythonCmd = process.env.CI ? '/opt/hostedtoolcache/Python/3.14.0/x64/bin/python3' : 'python3';
            const verifier = spawn(pythonCmd, ['core/model/verifier.py'], {
              stdio: ['pipe', 'pipe', 'pipe']
            });
            verifier.stdin.write(JSON.stringify(vector));
            verifier.stdin.end();
            let verifyOutput = '';
            verifier.stdout.on('data', (data) => {
              verifyOutput += data.toString();
            });
            verifier.stderr.on('data', (data) => {
              console.error('Verifier error:', data.toString());
            });
            verifier.on('close', (vcode) => {
              if (vcode === 0) {
                console.log(`Verification: ${verifyOutput.trim()}`);
              } else {
                console.log('Verification: Error');
              }
            });
          } catch (e) {
            console.error('Error parsing vector:', e);
            console.log('Verification: Error');
          }
        } else {
          console.log('Verification: Error');
        }
      });
    } catch (err) {
      console.error('Error reading file:', (err as Error).message);
    }
  });

program.command('collect')
  .description('Collect keystroke data (Linux requires root/sudo, macOS requires accessibility permissions)')
  .argument('<file>', 'output file for keystroke data')
  .action(async (file) => {
    let LoggerClass: (new () => KeyloggerType) | undefined;
    if (os.platform() === 'linux' && LinuxKeylogger) {
      LoggerClass = LinuxKeylogger;
    } else if (os.platform() === 'darwin' && MacKeylogger) {
      LoggerClass = MacKeylogger;
    }
    if (!LoggerClass) {
      console.error('Keylogger not available on this platform');
      process.exit(1);
    }
    console.log('Starting keystroke collection... Press Ctrl+C to stop.');
    const logger = new LoggerClass();
    try {
      await logger.start();
      // Wait for user to stop, but since CLI, perhaps collect for 10 seconds
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds
      logger.stop();
      const data = logger.getKeystrokes();
      fs.writeFileSync(file, JSON.stringify(data, null, 2));
      console.log(`Collected ${data.length} keystrokes, saved to ${file}`);
    } catch (err) {
      console.error('Error:', (err as Error).message);
    }
  });

program.parse();
