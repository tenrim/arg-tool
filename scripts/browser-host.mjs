// Edge's download UI is a browser-owned top-level surface on Windows.
// All other extra pages remain failures in single-workspace regressions.
export function appPages(context){return context.pages().filter(page=>page.url()!=='edge://downloads/hub');}
