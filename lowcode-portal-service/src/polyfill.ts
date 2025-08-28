import { webcrypto } from 'crypto';

// Polyfill crypto for Node.js < 19
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as any;
}

// Polyfill for global crypto object
if (typeof global !== 'undefined' && !global.crypto) {
  global.crypto = webcrypto as any;
}