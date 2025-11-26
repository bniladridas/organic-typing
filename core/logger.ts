// SPDX-License-Identifier: BSD-3-Clause
export function redact(obj: any) {
  const clone = JSON.parse(JSON.stringify(obj));
  if (clone.key && clone.key.length > 1) clone.key = '[REDACTED]';
  if (clone.text) clone.text = '[REDACTED]';
  return clone;
}

export const logger = {
  info: (obj: any) => console.info(JSON.stringify(redact(obj))),
  error: (obj: any) => console.error(JSON.stringify(redact(obj))),
};