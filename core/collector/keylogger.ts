// SPDX-License-Identifier: BSD-3-Clause
export interface Keystroke {
  key: string;
  timestamp: number;
  type: 'press';
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
      if (this.sensitiveMode) {
        // Skip logging all keystrokes in sensitive mode to prevent capturing passwords
        return;
      }
      const key = data.toString();
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
    this.sensitiveMode = false; // Reset sensitive mode on stop
  }

  getKeystrokes(): Keystroke[] {
    return this.keystrokes;
  }

  clearKeystrokes() {
    this.keystrokes = [];
  }
}

export default Keylogger;
