import { Button, element } from '../ui/index.js';

// Active results keep their discovery order so a button never moves under the pointer.
// The finished report supplies the definitive ranks and all routes to each result.
export function candidateList({ candidates, more, section, pathName, choose }) {
  let items = [],
    paths = new Map(),
    visible = 100,
    frame,
    clickedId;
  function reset() {
    cancelAnimationFrame(frame);
    frame = undefined;
    clickedId = undefined;
    paths.clear();
    items = [];
    visible = 100;
    candidates.replaceChildren();
    section.hidden = true;
    more.hidden = true;
  }
  function append() {
    frame = undefined;
    const start = candidates.childElementCount;
    const currentItems = items;
    for (let i = start; i < Math.min(items.length, visible); i++) {
      const candidate = items[i];
      candidates.append(
        Button({
          variant: 'choice',
          layout: 'stacked',
          attrs: { 'data-clue-candidate': candidate.id, 'aria-pressed': 'false' },
          children: [
            element('strong', {
              text: `${i + 1}. ${candidate.observation ? '观察 · ' : ''}${pathName(candidate)}`,
            }),
            element('span', {
              text: candidate.text.length ? candidate.text.slice(0, 160) : '（空文本）',
            }),
            element('small', {
              text: `${Array.from(candidate.text).length} 个字符${candidate.text.length > 160 ? ' · 摘要仅显示前 160 字符' : ''}`,
            }),
          ],
          on: {
            click: () => {
              if (currentItems !== items) return;
              clickedId = candidate.id;
              choose(candidate);
            },
          },
        }),
      );
    }
    section.hidden = !items.length;
    more.hidden = candidates.childElementCount >= items.length;
    more.textContent = `显示更多候选（已显示 ${candidates.childElementCount} / ${items.length}）`;
  }
  more.onclick = () => {
    visible += 100;
    cancelAnimationFrame(frame);
    append();
  };
  function discover({ id, edge, text, observation }) {
    const path = [...(paths.get(edge.from) || []), edge];
    paths.set(id, path);
    if (text === null) return;
    items.push({ id, text, observation, path, incoming: [edge] });
    if (frame === undefined)
      frame = requestAnimationFrame(() => {
        const first = !candidates.childElementCount;
        append();
        if (first) choose(items[0]);
      });
  }
  function finish(ranked) {
    cancelAnimationFrame(frame);
    const focusId = document.activeElement?.dataset.clueCandidate;
    const index = ranked.findIndex((item) => item.id === clickedId);
    const focusIndex = ranked.findIndex((item) => String(item.id) === focusId);
    visible = Math.max(visible, Math.ceil((Math.max(index, focusIndex) + 1) / 100) * 100);
    items = ranked;
    paths.clear();
    candidates.replaceChildren();
    append();
    if (ranked.length) choose(ranked[Math.max(0, index)]);
    if (focusIndex >= 0) candidates.children[focusIndex]?.focus({ preventScroll: true });
  }
  return { reset, discover, finish };
}
