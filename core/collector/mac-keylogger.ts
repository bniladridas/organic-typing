// SPDX-License-Identifier: BSD-3-Clause
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { uIOhook, UiohookKey } = require('uiohook-napi');

interface UiohookKeyboardEvent {
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  keycode: number;
}

export interface Keystroke {
  key: string;
  timestamp: number;
  type: 'press' | 'release';
}

class MacKeylogger {
  private keystrokes: Keystroke[] = [];
  private sensitiveMode = false;
  private isRunning = false;
  private readonly keydownHandler = (e: UiohookKeyboardEvent) =>
    this.handleKeyEvent('press', e);
  private readonly keyupHandler = (e: UiohookKeyboardEvent) =>
    this.handleKeyEvent('release', e);

  setSensitiveMode(sensitive: boolean) {
    this.sensitiveMode = sensitive;
  }

  private handleKeyEvent(type: 'press' | 'release', e: UiohookKeyboardEvent) {
    if (this.sensitiveMode) return;
    const key = UiohookKey[e.keycode];
    if (!key) return; // Skip unmapped keys
    this.keystrokes.push({
      key: key.toLowerCase(),
      timestamp: Date.now(),
      type,
    });
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    uIOhook.on('keydown', this.keydownHandler);
    uIOhook.on('keyup', this.keyupHandler);
    uIOhook.start();
    this.isRunning = true;
  }

  stop() {
    if (!this.isRunning) return;
    uIOhook.stop();
    uIOhook.off('keydown', this.keydownHandler);
    uIOhook.off('keyup', this.keyupHandler);
    this.isRunning = false;
    this.sensitiveMode = false;
  }

  getKeystrokes(): Keystroke[] {
    return this.keystrokes;
  }
}

export default MacKeylogger;
