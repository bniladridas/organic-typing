// SPDX-License-Identifier: BSD-3-Clause
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
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

  setSensitiveMode(sensitive: boolean) {
    this.sensitiveMode = sensitive;
  }

  private handleKeyEvent(type: 'press' | 'release', e: UiohookKeyboardEvent) {
    if (this.sensitiveMode) return;
    const key = UiohookKey[e.keycode];
    if (!key) return; // Skip unmapped keys
    this.keystrokes.push({ key: key.toLowerCase(), timestamp: Date.now(), type });
  }

  async start(): Promise<void> {
    uIOhook.on('keydown', (e: UiohookKeyboardEvent) => {
      this.handleKeyEvent('press', e);
    });
    uIOhook.on('keyup', (e: UiohookKeyboardEvent) => {
      this.handleKeyEvent('release', e);
    });
    uIOhook.start();
  }

  stop() {
    uIOhook.stop();
    this.sensitiveMode = false;
  }

  getKeystrokes(): Keystroke[] {
    return this.keystrokes;
  }
}

export default MacKeylogger;
