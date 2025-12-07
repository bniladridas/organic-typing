// SPDX-License-Identifier: BSD-3-Clause
interface EvdevDevice {
  name: string;
}

interface EvdevEvent {
  type: number;
  code: number;
  value: number;
}

interface EvdevReader {
  on(event: string, callback: (event: EvdevEvent) => void): void;
  close(): void;
}

interface Evdev {
  list(): EvdevDevice[];
  Reader: new (device: EvdevDevice) => EvdevReader;
  EV_KEY: number;
  KEY: { [key: number]: string };
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const evdev = require('evdev') as Evdev;

const EV_KEY = evdev.EV_KEY;
const KEY = evdev.KEY;

export interface Keystroke {
  key: string;
  timestamp: number;
  type: 'press' | 'release';
}

class LinuxKeylogger {
  private keystrokes: Keystroke[] = [];
  private reader?: EvdevReader;
  private device?: EvdevDevice;
  private sensitiveMode = false;

  setSensitiveMode(sensitive: boolean) {
    this.sensitiveMode = sensitive;
  }

  async start() {
    // Find keyboard device
    const devices = evdev.list();
    this.device = devices.find((dev: EvdevDevice) =>
      dev.name.toLowerCase().includes('keyboard')
    );
    if (!this.device) {
      throw new Error('No keyboard device found');
    }

    this.reader = new evdev.Reader(this.device);
    this.reader.on('event', (event: EvdevEvent) => {
      if (this.sensitiveMode) {
        // Skip logging all keystrokes in sensitive mode to prevent capturing passwords
        return;
      }
      if (event.type === EV_KEY) {
        const keyName = KEY[event.code];
        if (keyName) {
          const type: 'press' | 'release' =
            event.value === 1
              ? 'press'
              : event.value === 0
                ? 'release'
                : 'press'; // 1 press, 0 release, 2 repeat
          if (type === 'press' || type === 'release') {
            this.keystrokes.push({
              key: keyName.toLowerCase(), // normalize to lowercase
              timestamp: Date.now(),
              type,
            });
          }
        }
      }
    });
  }

  stop() {
    if (this.reader) {
      this.reader.close();
    }
    this.sensitiveMode = false; // Reset sensitive mode on stop
  }

  getKeystrokes(): Keystroke[] {
    return this.keystrokes;
  }
}

export default LinuxKeylogger;
