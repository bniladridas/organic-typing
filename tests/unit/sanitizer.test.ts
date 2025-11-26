import { isSensitiveInput, maskKeyEventForStorage } from '../../core/sanitizer';

describe('sanitizer', () => {
  test('isSensitiveInput detects password', () => {
    const el = { tagName: 'INPUT', type: 'password' };
    expect(isSensitiveInput(el)).toBe(true);
  });

  test('isSensitiveInput detects data-sensitive', () => {
    const el = { tagName: 'INPUT', type: 'text', hasAttribute: (attr: string) => attr === 'data-sensitive' };
    expect(isSensitiveInput(el)).toBe(true);
  });

  test('maskKeyEventForStorage masks printable chars', () => {
    expect(maskKeyEventForStorage({ key: 'a' })).toEqual({ key: '[CHAR]', isPrintable: true });
  });

  test('maskKeyEventForStorage keeps non-printable', () => {
    expect(maskKeyEventForStorage({ key: 'Enter' })).toEqual({ key: 'Enter', isPrintable: false });
  });
});