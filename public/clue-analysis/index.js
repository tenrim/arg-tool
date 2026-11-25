import { createAnalysisSession } from './session.js';
import { cyberChefAdapter } from './chef-adapter.js';
import { localAdapters } from './local-adapters.js';
import { fail } from './data.js';
import { puzzleAdapters } from './puzzle-adapters.js';
import { chefPuzzleAdapters } from './chef-puzzle-adapters.js';
import { catalogAdapters } from './catalog-adapters.js';
import { formatProfiles, structuredRecords } from './format-profiles.js';

// Optional foundation entry. No registration, engine startup or UI side effects on import.
export function createClueAnalysis({
  limits,
  textOnly = false,
  puzzle = false,
  key = '',
  expandHypotheses = false,
} = {}) {
  const chef = cyberChefAdapter({
    textOnly,
    ownedSuggestions: puzzle
      ? [
          ...formatProfiles.map((p) => p.op),
          ...structuredRecords.map(([op]) => op),
          'Bacon Cipher Decode',
          'From Float',
        ]
      : [],
  });
  const session = createAnalysisSession({
    adapters: [
      ...localAdapters({ key }),
      chef,
      ...(puzzle
        ? [
            ...puzzleAdapters({ key }),
            ...chefPuzzleAdapters(chef, { key, expanded: expandHypotheses }),
            ...catalogAdapters(),
          ]
        : []),
    ],
    limits,
    expandHypotheses,
  });
  if (textOnly) {
    for (const method of ['analyze', 'runPlan']) {
      const execute = session[method];
      session[method] = (input, ...args) => {
        if (input?.type !== 'text') {
          session.cancel();
          fail('INPUT_INVALID', '文本分析只接受文本输入。');
        }
        return execute(input, ...args);
      };
    }
  }
  return session;
}
export { AnalysisError } from './data.js';
