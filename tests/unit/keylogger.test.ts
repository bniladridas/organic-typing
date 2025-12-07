// SPDX-License-Identifier: BSD-3-Clause
import Keylogger from '../../core/collector/keylogger';

const mockStdin = {
  setRawMode: jest.fn(),
  on: jest.fn(),
} as unknown as NodeJS.ReadStream;

jest.spyOn(process, 'stdin', 'get').mockReturnValue(mockStdin as any);

describe('Keylogger', () => {
  let logger: Keylogger;

  beforeEach(() => {
    logger = new Keylogger();
    jest.clearAllMocks();
  });

  afterEach(() => {
    logger.stop();
  });

  it('should start and listen for data events', () => {
    logger.start();

    expect(mockStdin.setRawMode).toHaveBeenCalledWith(true);
    expect(mockStdin.on as jest.Mock).toHaveBeenCalledWith(
      'data',
      expect.any(Function)
    );
  });

  it('should capture keystrokes when not in sensitive mode', () => {
    logger.start();

    const dataHandler = (mockStdin.on as jest.Mock).mock.calls[0][1];
    dataHandler(Buffer.from('a'));

    const keystrokes = logger.getKeystrokes();
    expect(keystrokes).toHaveLength(1);
    expect(keystrokes[0]).toEqual({
      key: 'a',
      timestamp: expect.any(Number),
      type: 'press',
      sensitive: false,
    });
  });

  it('should not capture keystrokes in sensitive mode', () => {
    logger.setSensitiveMode(true);
    logger.start();

    const dataHandler = (mockStdin.on as jest.Mock).mock.calls[0][1];
    dataHandler(Buffer.from('a'));
    dataHandler(Buffer.from('password'));

    const keystrokes = logger.getKeystrokes();
    expect(keystrokes).toHaveLength(0);
  });

  it('should stop and set raw mode false', () => {
    logger.start();
    logger.stop();

    expect(mockStdin.setRawMode).toHaveBeenCalledWith(false);
  });

  it('should mark keystrokes as sensitive when mode is set', () => {
    logger.setSensitiveMode(true);
    logger.setSensitiveMode(false); // Turn off to capture
    logger.start();

    const dataHandler = (mockStdin.on as jest.Mock).mock.calls[0][1];
    dataHandler(Buffer.from('a'));

    const keystrokes = logger.getKeystrokes();
    expect(keystrokes[0].sensitive).toBe(false); // Since we turned off
  });
});
