# Organic Typing GitHub App

This GitHub App analyzes pull request descriptions to build and store organic typing signatures based on simulated keystroke patterns.

## Setup

1. Create a GitHub App:
   - Go to https://github.com/settings/apps
   - Use the `manifest.json` to create the app, or manually set:
     - Name: Organic Typing Verifier
     - Webhook URL: Your server URL + /webhook
     - Permissions: Pull requests (read)
     - Events: Pull request

2. Install the app on your repository.

3. Set environment variables:
   - `GITHUB_TOKEN`: Personal access token with repo scope
   - `WEBHOOK_SECRET`: Secret from GitHub App settings
   - `PORT`: Port to run server (default 3000)

## Running Locally

```bash
npm install
npm run server
```

For webhooks, use ngrok: `ngrok http 3000` and update webhook URL.

## Deployment

Deploy to a hosting service like Vercel, Heroku, or Railway.

Example for Vercel:

- Set environment variables in Vercel dashboard
- Deploy with `vercel --prod`

## How it Works

- On PR open/edit, simulates keystrokes from description text
- Computes typing stats (intervals, pauses, rhythm)
- Stores signature per user in `signatures.json`
- Comments analysis on the PR
