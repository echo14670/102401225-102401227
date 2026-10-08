let fallbackCounter = 0;

export function generateId(prefix = "item") {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }
  fallbackCounter += 1;
  return `${prefix}-${Date.now()}-${fallbackCounter}`;
}
