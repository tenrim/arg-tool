// SPDX-License-Identifier: GPL-2.0-only
// Standalone whole-file audio decoder: byte input, PCM channels/rate output.
import decode from './node_modules/@audio/decode-aac/decode-aac.js';
self.onmessage = async ({data}) => {
  try { self.postMessage({ result: await decode(data.bytes) }); }
  catch (error) { self.postMessage({ error: error.message }); }
};
