import express from 'express';
import { Request, Response } from 'express';
import { createNodeMiddleware, Webhooks } from '@octokit/webhooks';
import { Octokit } from '@octokit/rest';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { Keystroke } from '../../core/collector/keylogger';
import { normalizeKeystrokes } from '../../core/processor/normalize';
import { calculateStats, TypingStats } from '../../core/processor/stats';

type PR = {
  title: string;
  body: string;
  user: { login: string };
  number: number;
};

const app = express();
const port = process.env.PORT || 3000;

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const signaturesPath = path.join(__dirname, 'signatures.json');

function textToKeystrokes(text: string | null): Keystroke[] {
  const keystrokes: Keystroke[] = [];
  let time = 0;
  for (const char of text || '') {
    keystrokes.push({ key: char, timestamp: time, type: 'press' });
    time += 100; // Simulate 100ms per character
  }
  return keystrokes;
}



const webhooks = new Webhooks({
  secret: process.env.WEBHOOK_SECRET || 'development',
});

webhooks.on('pull_request.opened', async (event) => {
  const pr = event.payload.pull_request as PR;
  const body = pr.body;

   const keystrokes = textToKeystrokes(body);
  const normalized = normalizeKeystrokes(keystrokes);
  const stats = calculateStats(normalized);

  // Call verifier
  const vector = [stats.averageInterval, stats.pauseCount, ...stats.rhythmVector];
  const verifier = spawn('python3', ['core/model/verifier.py', JSON.stringify(vector)]);
  let verification = 'Pending';
  verifier.stdout.on('data', (data: Buffer) => {
    verification = data.toString().trim();
  });
  verifier.on('close', async () => {
    // Store signature
    let signatures: Record<string, TypingStats> = {};
    if (fs.existsSync(signaturesPath)) {
      signatures = JSON.parse(fs.readFileSync(signaturesPath, 'utf8'));
    }
    const userLogin = pr.user.login;
    const number = pr.number;
    signatures[userLogin] = stats;
    fs.writeFileSync(signaturesPath, JSON.stringify(signatures, null, 2));

    const analysis = `Average Interval: ${stats.averageInterval.toFixed(2)}ms, Pauses: ${stats.pauseCount}, Rhythm: ${stats.rhythmVector.join(', ')}, Verification: ${verification}`;
    await octokit.issues.createComment({
      owner: event.payload.repository.owner.login,
      repo: event.payload.repository.name,
      issue_number: number,
      body: `Organic Typing Analysis:\n${analysis}\nSignature stored for user ${userLogin}.`
    });
  });
});

webhooks.on('pull_request.edited', async (event) => {
  const pr = event.payload.pull_request as PR;
  const body = pr.body;

  const keystrokes = textToKeystrokes(body);
  const normalized = normalizeKeystrokes(keystrokes);
  const stats = calculateStats(normalized);

  // Call verifier
  const vector = [stats.averageInterval, stats.pauseCount, ...stats.rhythmVector];
  const verifier = spawn('python3', ['core/model/verifier.py', JSON.stringify(vector)]);
  let verification = 'Pending';
  verifier.stdout.on('data', (data: Buffer) => {
    verification = data.toString().trim();
  });
  verifier.on('close', async () => {
    // Update signature
    let signatures: Record<string, TypingStats> = {};
    if (fs.existsSync(signaturesPath)) {
      signatures = JSON.parse(fs.readFileSync(signaturesPath, 'utf8'));
    }
    const userLogin = pr.user.login;
    const number = pr.number;
    signatures[userLogin] = stats;
    fs.writeFileSync(signaturesPath, JSON.stringify(signatures, null, 2));

    const analysis = `Average Interval: ${stats.averageInterval.toFixed(2)}ms, Pauses: ${stats.pauseCount}, Rhythm: ${stats.rhythmVector.join(', ')}, Verification: ${verification}`;
    await octokit.issues.createComment({
      owner: event.payload.repository.owner.login,
      repo: event.payload.repository.name,
      issue_number: number,
      body: `Organic Typing Analysis (updated):\n${analysis}\nSignature updated for user ${userLogin}.`
    });
  });
});

app.use('/webhook', createNodeMiddleware(webhooks, { path: '/webhook' }));

app.get('/', (req: Request, res: Response) => {
  res.send('Organic Typing GitHub App');
});

// For Vercel serverless
export default app;

// For local development
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}
