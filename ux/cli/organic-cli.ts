import { Command } from 'commander';
import { spawn } from 'child_process';
import * as fs from 'fs';
import { normalizeKeystrokes } from '../../core/processor/normalize';
import { calculateStats } from '../../core/processor/stats';
import { Keystroke } from '../../core/collector/keylogger';

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

program.parse();
