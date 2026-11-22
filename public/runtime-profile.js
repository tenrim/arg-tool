export const DESKTOP_APP = globalThis.location?.origin === 'https://mist-toolbox.invalid';
export const ANDROID_APP =
  globalThis.location?.origin === 'https://appassets.androidplatform.net' &&
  typeof globalThis.MistNetwork?.request === 'function';
