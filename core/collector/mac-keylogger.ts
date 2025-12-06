// SPDX-License-Identifier: BSD-3-Clause
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const { uIOhook, UiohookKey } = require('uiohook-napi');

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

  start() {
    uIOhook.on('keydown', (e: { keycode: number }) => {
      if (this.sensitiveMode) return;
      const key = UiohookKey[e.keycode] || String.fromCharCode(e.keycode).toLowerCase();
      this.keystrokes.push({ key, timestamp: Date.now(), type: 'press' });
    });
    uIOhook.on('keyup', (e: { keycode: number }) => {
      if (this.sensitiveMode) return;
      const key = UiohookKey[e.keycode] || String.fromCharCode(e.keycode).toLowerCase();
      this.keystrokes.push({ key, timestamp: Date.now(), type: 'release' });
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