import express from 'express';
import { Request, Response } from 'express';
import { createNodeMiddleware, Webhooks } from '@octokit/webhooks';
import { Octokit } from '@octokit/rest';
import { App } from '@octokit/app';
import { kv } from '@vercel/kv';
import { execSync } from 'child_process';
import { Keystroke } from '../../core/collector/keylogger';
import { normalizeKeystrokes } from '../../core/processor/normalize';
import { calculateStats } from '../../core/processor/stats';

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

function textToKeystrokes(text: string | null): Keystroke[] {
  const keystrokes: Keystroke[] = [];
  let time = 0;
  for (const char of text || '') {
    keystrokes.push({ key: char, timestamp: time, type: 'press' });
    time += 100; // Simulate 100ms per character
  }
  return keystrokes;
}



// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handlePullRequest(event: any, isUpdate: boolean) {
  const installationId = event.payload.installation?.id;
  if (!installationId) {
    console.error('Installation ID not found in webhook payload.');
    return;
  }
  const octokit = await githubApp.getInstallationOctokit(installationId);
  const pr = event.payload.pull_request as PR;
  const body = pr.body;

  const keystrokes = textToKeystrokes(body);
  const normalized = normalizeKeystrokes(keystrokes);
  const stats = calculateStats(normalized);

  // Encode stats using Python model
  const statsJson = JSON.stringify(stats);
  const encodedVector = JSON.parse(execSync(`python3 core/model/organic-encoder.py`, {
    input: statsJson,
    encoding: 'utf-8'
  }).toString().trim());

  // Verify using Python model
  const vectorJson = JSON.stringify(encodedVector);
  const verification = execSync(`python3 core/model/verifier.py`, {
    input: vectorJson,
    encoding: 'utf-8'
  }).toString().trim();

  // Update signature atomically
  const userLogin = pr.user.login;
  await kv.hset('signatures', { [userLogin]: stats });

  const analysis = `Average Interval: ${stats.averageInterval.toFixed(2)}ms, Pauses: ${stats.pauseCount}, Rhythm: ${stats.rhythmVector.join(', ')}, Verification: ${verification}`;
  const commentBody = isUpdate
    ? `Organic Typing Analysis (updated):\n${analysis}\nSignature updated for user ${userLogin}.`
    : `Organic Typing Analysis:\n${analysis}\nSignature stored for user ${userLogin}.`;

  await (octokit as Octokit).issues.createComment({
    owner: event.payload.repository.owner.login,
    repo: event.payload.repository.name,
    issue_number: pr.number,
    body: commentBody,
  });
}

const webhooks = new Webhooks({
  secret: process.env.WEBHOOK_SECRET || 'development',
});

webhooks.on('pull_request.opened', (event) => handlePullRequest(event, false));
webhooks.on('pull_request.edited', (event) => handlePullRequest(event, true));

app.use('/webhook', createNodeMiddleware(webhooks, { path: '/webhook' }));

app.get('/', (req: Request, res: Response) => {
  res.send('Organic Typing GitHub App');
});

app.get('/favicon.ico', (req: Request, res: Response) => {
  res.status(204).end(); // No content for favicon
});

app.get('/favicon.png', (req: Request, res: Response) => {
  res.status(204).end(); // No content for favicon
});

// For Vercel serverless
export default app;

// For local development
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}
