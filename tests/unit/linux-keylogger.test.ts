// SPDX-License-Identifier: BSD-3-Clause
import * as os from 'os';

interface LinuxKeyloggerType {
  start(): Promise<void>;
  stop(): void;
  getKeystrokes(): {
    key: string;
    timestamp: number;
    type: 'press' | 'release';
  }[];
  setSensitiveMode(sensitive: boolean): void;
}

if (os.platform() === 'linux') {
  jest.mock('evdev', () => ({
    list: jest.fn(),
    Reader: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      close: jest.fn(),
    })),
    EV_KEY: 1,
    KEY: {
      30: 'A',
      48: 'B',
    },
  }));

  const mockEvdev = require('evdev');

  const LinuxKeyloggerClass =
    require('../../core/collector/linux-keylogger').default;

  describe('LinuxKeylogger', () => {
    let logger: LinuxKeyloggerType;

    beforeEach(() => {
      logger = new LinuxKeyloggerClass();
      jest.clearAllMocks();
    });

    afterEach(() => {
      logger.stop();
    });

    it('should start and find keyboard device', async () => {
      mockEvdev.list.mockReturnValue([
        { name: 'AT Translated Set 2 keyboard' },
      ]);
      const mockReader = { on: jest.fn(), close: jest.fn() };
      mockEvdev.Reader.mockReturnValue(mockReader);

      await logger.start();

      expect(mockEvdev.list).toHaveBeenCalled();
      expect(mockEvdev.Reader).toHaveBeenCalled();
      expect(mockReader.on).toHaveBeenCalledWith('event', expect.any(Function));
    });

    it('should throw error if no keyboard found', async () => {
      mockEvdev.list.mockReturnValue([{ name: 'Mouse' }]);

      await expect(logger.start()).rejects.toThrow('No keyboard device found');
    });

    it('should capture keystrokes on events', async () => {
      mockEvdev.list.mockReturnValue([{ name: 'keyboard' }]);
      const mockReader = { on: jest.fn(), close: jest.fn() };
      mockEvdev.Reader.mockReturnValue(mockReader);

      await logger.start();

      const eventHandler = mockReader.on.mock.calls[0][1];
      eventHandler({ type: 1, code: 30, value: 1 }); // press A
      eventHandler({ type: 1, code: 30, value: 0 }); // release A

      const keystrokes = logger.getKeystrokes();
      expect(keystrokes).toHaveLength(2);
      expect(keystrokes[0]).toEqual({
        key: 'a',
        timestamp: expect.any(Number),
        type: 'press',
      });
      expect(keystrokes[1]).toEqual({
        key: 'a',
        timestamp: expect.any(Number),
        type: 'release',
      });
    });

    it('should stop and close reader', async () => {
      mockEvdev.list.mockReturnValue([{ name: 'keyboard' }]);
      const mockReader = { on: jest.fn(), close: jest.fn() };
      mockEvdev.Reader.mockReturnValue(mockReader);

      await logger.start();
      logger.stop();

      expect(mockReader.close).toHaveBeenCalled();
    });

    it('should not capture keystrokes in sensitive mode', async () => {
      mockEvdev.list.mockReturnValue([{ name: 'keyboard' }]);
      const mockReader = { on: jest.fn(), close: jest.fn() };
      mockEvdev.Reader.mockReturnValue(mockReader);

      logger.setSensitiveMode(true);
      await logger.start();

      const eventHandler = mockReader.on.mock.calls[0][1];
      eventHandler({ type: 1, code: 30, value: 1 }); // press A

      const keystrokes = logger.getKeystrokes();
      expect(keystrokes).toHaveLength(0);
    });

    it('should capture keystrokes when not in sensitive mode', async () => {
      mockEvdev.list.mockReturnValue([{ name: 'keyboard' }]);
      const mockReader = { on: jest.fn(), close: jest.fn() };
      mockEvdev.Reader.mockReturnValue(mockReader);

      logger.setSensitiveMode(false);
      await logger.start();

      const eventHandler = mockReader.on.mock.calls[0][1];
      eventHandler({ type: 1, code: 30, value: 1 }); // press A

      const keystrokes = logger.getKeystrokes();
      expect(keystrokes).toHaveLength(1);
    });
  });
} else {
  describe.skip('LinuxKeylogger', () => {
    it('skipped on non-Linux platforms', () => {
      // Skipped
    });
  });
}
