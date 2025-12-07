import { isSensitiveInput, maskKeyEventForStorage } from '../../core/sanitizer';

describe('sanitizer', () => {
  test('isSensitiveInput detects password', () => {
    const el = { tagName: 'INPUT', type: 'password' };
    expect(isSensitiveInput(el)).toBe(true);
  });

  test('isSensitiveInput detects data-sensitive', () => {
    const el = {
      tagName: 'INPUT',
      type: 'text',
      hasAttribute: (attr: string) => attr === 'data-sensitive',
    };
    expect(isSensitiveInput(el)).toBe(true);
  });

  test('isSensitiveInput handles null input', () => {
    expect(isSensitiveInput(null)).toBe(false);
  });

  test('isSensitiveInput handles undefined input', () => {
    expect(isSensitiveInput(undefined)).toBe(false);
  });

  test('isSensitiveInput detects email input', () => {
    const el = { tagName: 'INPUT', type: 'email' };
    expect(isSensitiveInput(el)).toBe(true);
  });

  test('isSensitiveInput detects tel input', () => {
    const el = { tagName: 'INPUT', type: 'tel' };
    expect(isSensitiveInput(el)).toBe(true);
  });

  test('isSensitiveInput ignores non-sensitive input', () => {
    const el = { tagName: 'INPUT', type: 'text' };
    expect(isSensitiveInput(el)).toBe(false);
  });

  test('isSensitiveInput handles missing hasAttribute', () => {
    const el = { tagName: 'INPUT', type: 'text' };
    expect(isSensitiveInput(el)).toBe(false);
  });

  test('isSensitiveInput handles null tagName', () => {
    const el = { tagName: null, type: 'text' };
    expect(isSensitiveInput(el)).toBe(false);
  });

  test('maskKeyEventForStorage masks printable chars', () => {
    expect(maskKeyEventForStorage({ key: 'a' })).toEqual({
      key: '[CHAR]',
      isPrintable: true,
    });
  });

  test('maskKeyEventForStorage keeps non-printable', () => {
    expect(maskKeyEventForStorage({ key: 'Enter' })).toEqual({
      key: 'Enter',
      isPrintable: false,
    });
  });
});
