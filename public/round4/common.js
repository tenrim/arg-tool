export {
  $,
  esc,
  field,
  area,
  button,
  status,
  setStatus,
  action,
  mount,
  download,
  webSource,
} from "../round1/common.js";
export const number = (id, value, min = -10000, max = 10000, step = "any") =>
  `<input id="${id}" type="number" value="${value}" min="${min}" max="${max}" step="${step}">`;
export const select = (id, items) =>
  `<select id="${id}">${items.map(([v, t]) => `<option value="${v}">${t}</option>`).join("")}</select>`;
export const row = (html) => `<div class="r4-row">${html}</div>`;
export const box = (html) => `<div class="r4-box">${html}</div>`;
export function finite(value, min = -10000, max = 10000) {
  const n = Number(value);
  if (String(value).trim() === "" || !Number.isFinite(n) || n < min || n > max)
    throw Error(`请输入 ${min} 至 ${max} 的数值。`);
  return n;
}
export function textFile(file, max = 2 * 1024 * 1024) {
  if (!file) throw Error("请先选择文件。");
  if (file.size > max) throw Error(`文件不能超过 ${max / 1024 / 1024} MB。`);
  return file.text();
}
export function watchSize(node, fn) {
  const ob = new ResizeObserver(() => {
    if (node.clientWidth && node.clientHeight)
      fn(node.clientWidth, node.clientHeight);
  });
  ob.observe(node);
  return ob;
}
export const source = (name, repo, role) => [
  name,
  "https://github.com/" + repo,
  role,
];
