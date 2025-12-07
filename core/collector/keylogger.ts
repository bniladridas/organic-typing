// SPDX-License-Identifier: BSD-3-Clause
export interface Keystroke {
  key: string;
  timestamp: number;
  type: 'press' | 'release';
  sensitive?: boolean;
}

class Keylogger {
  private keystrokes: Keystroke[] = [];
  private sensitiveMode = false;

  setSensitiveMode(sensitive: boolean) {
    this.sensitiveMode = sensitive;
  }

  start() {
    process.stdin.setRawMode(true);
    process.stdin.on('data', (data) => {
      const key = data.toString();
      if (this.sensitiveMode) {
        // Skip logging in sensitive mode
        return;
      }
      this.keystrokes.push({
        key,
        timestamp: Date.now(),
        type: 'press',
        sensitive: this.sensitiveMode,
      });
    });
  }

  stop() {
    process.stdin.setRawMode(false);
  }

  getKeystrokes(): Keystroke[] {
    return this.keystrokes;
  }
}

export default Keylogger;
