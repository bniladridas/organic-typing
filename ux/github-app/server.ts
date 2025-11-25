import express from 'express';
import { Request, Response } from 'express';
import { createNodeMiddleware, Webhooks } from '@octokit/webhooks';
import { Octokit } from '@octokit/rest';
import { App } from '@octokit/app';
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

const appId = process.env.GITHUB_APP_ID;
const privateKey = process.env.GITHUB_PRIVATE_KEY;

if (!appId || !privateKey) {
  throw new Error('GITHUB_APP_ID and GITHUB_PRIVATE_KEY must be set in environment variables.');
}

const githubApp = new App({
  appId,
  privateKey,
});
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
  const octokit = await githubApp.getInstallationOctokit((event.payload.installation as { id: number }).id);
  const pr = event.payload.pull_request as PR;
  const body = pr.body;

   const keystrokes = textToKeystrokes(body);
  const normalized = normalizeKeystrokes(keystrokes);
  const stats = calculateStats(normalized);

  // Call verifier (simple heuristic)
  const avgInterval = stats.averageInterval;
  const pauseCount = stats.pauseCount;
  const verification = avgInterval > 80 && pauseCount < 10 ? 'Human' : 'AI';

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
  await (octokit as Octokit).issues.createComment({
    owner: event.payload.repository.owner.login,
    repo: event.payload.repository.name,
    issue_number: number,
    body: `Organic Typing Analysis:\n${analysis}\nSignature stored for user ${userLogin}.`
  });
});

webhooks.on('pull_request.edited', async (event) => {
  const octokit = await githubApp.getInstallationOctokit((event.payload.installation as { id: number }).id);
  const pr = event.payload.pull_request as PR;
  const body = pr.body;

  const keystrokes = textToKeystrokes(body);
  const normalized = normalizeKeystrokes(keystrokes);
  const stats = calculateStats(normalized);

  // Call verifier (simple heuristic)
  const avgInterval = stats.averageInterval;
  const pauseCount = stats.pauseCount;
  const verification = avgInterval > 80 && pauseCount < 10 ? 'Human' : 'AI';

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
  await (octokit as Octokit).issues.createComment({
    owner: event.payload.repository.owner.login,
    repo: event.payload.repository.name,
    issue_number: number,
    body: `Organic Typing Analysis (updated):\n${analysis}\nSignature updated for user ${userLogin}.`
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
