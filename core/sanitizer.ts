// SPDX-License-Identifier: BSD-3-Clause

interface ElementLike {
  tagName?: string;
  type?: string;
  hasAttribute?: (attr: string) => boolean;
}

export function isSensitiveInput(el: ElementLike | null): boolean {
  if (!el) return false;
  try {
    const tag = (el.tagName || '').toLowerCase();
    const type = el.type || '';
    if (type === 'password') return true;
    if (el.hasAttribute && el.hasAttribute('data-sensitive')) return true;
    if (tag === 'input' && ['email', 'tel'].includes(type)) return true;
    return false;
  } catch {
    return true; // fail closed: treat unknown elements as sensitive
  }
}

export function maskKeyEventForStorage(e: { key?: string }) {
  // store only short keys like 'Enter', 'Backspace' or single characters masked,
  // but never store sequences that reveal content.
  const k = e.key ?? '[unknown]';
  if (k.length === 1) {
    return { key: '[CHAR]', isPrintable: true };
  }
  return { key: k, isPrintable: false };
}
