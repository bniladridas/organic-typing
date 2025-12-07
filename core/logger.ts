// SPDX-License-Identifier: BSD-3-Clause
export function redact(obj: Record<string, unknown>): Record<string, unknown> {
  const clone = JSON.parse(JSON.stringify(obj));
  if (typeof clone.key === 'string' && clone.key.length > 1)
    clone.key = '[REDACTED]';
  if (clone.text) clone.text = '[REDACTED]';
  return clone;
}

export const logger = {
  info: (obj: Record<string, unknown>) =>
    console.info(JSON.stringify(redact(obj))),
  error: (obj: Record<string, unknown>) =>
    console.error(JSON.stringify(redact(obj))),
};
