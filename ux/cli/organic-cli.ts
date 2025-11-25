// SPDX-License-Identifier: BSD-3-Clause
import { Command } from 'commander';
import { spawn } from 'child_process';
import * as fs from 'fs';
import { normalizeKeystrokes } from '../../core/processor/normalize';
import { calculateStats } from '../../core/processor/stats';
import { Keystroke } from '../../core/collector/keylogger';
interface LinuxKeyloggerType {
  start(): Promise<void>;
  stop(): void;
  getKeystrokes(): { key: string; timestamp: number; type: 'press' | 'release' }[];
}

let LinuxKeylogger: (new () => LinuxKeyloggerType) | undefined;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  LinuxKeylogger = require('../../core/collector/linux-keylogger').default;
} catch (e) {
  // evdev not available
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
    const python = spawn('python3', ['core/model/generator.py', prompt]);
    python.stdout.on('data', (data) => {
      console.log(data.toString().trim());
    });
    python.stderr.on('data', (data) => {
      console.error('Error:', data.toString());
    });
  });

program.command('verify')
  .description('Verify typing signature')
  .argument('<file>', 'keystroke data file')
  .action((file) => {
    console.log(`Verifying signature from: ${file}`);
    try {
      const data: Keystroke[] = JSON.parse(fs.readFileSync(file, 'utf8'));
      const normalized = normalizeKeystrokes(data);
      const stats = calculateStats(normalized);
      console.log(`Stats: Avg Interval ${stats.averageInterval.toFixed(2)}ms, Pauses: ${stats.pauseCount}`);
      // TODO: call verifier model
      console.log('Verification: Human-like (placeholder)');
    } catch (err) {
      console.error('Error reading file:', (err as Error).message);
    }
  });

program.command('collect')
  .description('Collect keystroke data on Ubuntu (requires root/sudo)')
  .argument('<file>', 'output file for keystroke data')
  .action(async (file) => {
    if (!LinuxKeylogger) {
      console.error('Linux keylogger not available on this platform');
      process.exit(1);
    }
    console.log('Starting keystroke collection... Press Ctrl+C to stop.');
    const logger = new LinuxKeylogger();
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
