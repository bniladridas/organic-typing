// SPDX-License-Identifier: BSD-3-Clause

interface KeyloggerType {
  start(): Promise<void>;
  stop(): void;
  getKeystrokes(): { key: string; timestamp: number; type: 'press' | 'release' }[];
  setSensitiveMode(sensitive: boolean): void;
}

jest.mock('uiohook-napi', () => ({
  uIOhook: {
    on: jest.fn(),
    off: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
  },
  UiohookKey: {
    65: 'A',
    66: 'B',
  },
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const mockUiohook = require('uiohook-napi');
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const MacKeyloggerClass = require('../../core/collector/mac-keylogger').default;

describe('MacKeylogger', () => {
  let logger: KeyloggerType;

  beforeEach(() => {
    logger = new MacKeyloggerClass();
    jest.clearAllMocks();
  });

  afterEach(() => {
    logger.stop();
  });

  it('should start and register event listeners', async () => {
    await logger.start();

    expect(mockUiohook.uIOhook.on).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(mockUiohook.uIOhook.on).toHaveBeenCalledWith('keyup', expect.any(Function));
    expect(mockUiohook.uIOhook.start).toHaveBeenCalled();
  });

  it('should not start if already running', async () => {
    await logger.start();
    await logger.start(); // Second call should do nothing

    expect(mockUiohook.uIOhook.on).toHaveBeenCalledTimes(2); // Only once for each event
    expect(mockUiohook.uIOhook.start).toHaveBeenCalledTimes(1);
  });

  it('should capture keystrokes on keydown and keyup', async () => {
    await logger.start();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const keydownHandler = (mockUiohook.uIOhook.on.mock.calls as any[]).find((call: any) => call[0] === 'keydown')[1];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const keyupHandler = (mockUiohook.uIOhook.on.mock.calls as any[]).find((call: any) => call[0] === 'keyup')[1];

    keydownHandler({ keycode: 65 }); // A
    keyupHandler({ keycode: 65 }); // A

    const keystrokes = logger.getKeystrokes();
    expect(keystrokes).toHaveLength(2);
    expect(keystrokes[0]).toEqual({ key: 'a', timestamp: expect.any(Number), type: 'press' });
    expect(keystrokes[1]).toEqual({ key: 'a', timestamp: expect.any(Number), type: 'release' });
  });

  it('should skip unmapped keycodes', async () => {
    await logger.start();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const keydownHandler = (mockUiohook.uIOhook.on.mock.calls as any[]).find((call: any) => call[0] === 'keydown')[1];

    keydownHandler({ keycode: 999 }); // Unmapped

    const keystrokes = logger.getKeystrokes();
    expect(keystrokes).toHaveLength(0);
  });

  it('should stop and remove event listeners', async () => {
    await logger.start();
    logger.stop();

    expect(mockUiohook.uIOhook.stop).toHaveBeenCalled();
    expect(mockUiohook.uIOhook.off).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(mockUiohook.uIOhook.off).toHaveBeenCalledWith('keyup', expect.any(Function));
  });

  it('should not stop if not running', () => {
    logger.stop(); // Should do nothing

    expect(mockUiohook.uIOhook.stop).not.toHaveBeenCalled();
  });

  it('should not capture keystrokes in sensitive mode', async () => {
    logger.setSensitiveMode(true);
    await logger.start();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const keydownHandler = (mockUiohook.uIOhook.on.mock.calls as any[]).find((call: any) => call[0] === 'keydown')[1];

    keydownHandler({ keycode: 65 }); // A

    const keystrokes = logger.getKeystrokes();
    expect(keystrokes).toHaveLength(0);
  });

  it('should capture keystrokes when not in sensitive mode', async () => {
    logger.setSensitiveMode(false);
    await logger.start();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const keydownHandler = (mockUiohook.uIOhook.on.mock.calls as any[]).find((call: any) => call[0] === 'keydown')[1];

    keydownHandler({ keycode: 65 }); // A

    const keystrokes = logger.getKeystrokes();
    expect(keystrokes).toHaveLength(1);
  });
});