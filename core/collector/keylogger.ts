export interface Keystroke {
  key: string;
  timestamp: number;
  type: 'press' | 'release';
}

class Keylogger {
  private keystrokes: Keystroke[] = [];

  start() {
    process.stdin.setRawMode(true);
    process.stdin.on('data', (data) => {
      const key = data.toString();
      this.keystrokes.push({ key, timestamp: Date.now(), type: 'press' });
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
