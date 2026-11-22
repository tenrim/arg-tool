// Optional operator configuration. Never put SMTP credentials in browser code.
// Empty means local-only reports. To enable a separately deployed service,
// set a same-origin relative endpoint such as "./api/feedback".
import { ANDROID_APP, DESKTOP_APP } from './runtime-profile.js';

export const feedbackEndpoint = ANDROID_APP || DESKTOP_APP ? './api/feedback' : '';
