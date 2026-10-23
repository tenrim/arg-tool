// Named, directional integration contracts; additions need a concrete owner
// and matching behavior coverage, not a blanket feature-to-feature exemption.
export const bridges = [
  ['public/feedback/ui.js','public/deployment.js','Operator configured same-origin endpoint; source deployment regression'],
  ['public/media-workspace/audio.js','public/media.js','Audio controller reuses WAV serialization, reverse preview and Morse synthesis; media workspace and audio browser regressions'],
  ['public/media-workspace/audio.js','public/result-recording.js','Audio controller owns current analysis, spectrum and preview-aligned clip leases; media workspace browser regressions'],
  ['public/media-workspace/file.js','public/engine.js','File analysis uses byte-to-hex formatting only; file hash browser regression'],
  ['public/media-workspace/file.js','public/media.js','File controller uses pure signature, entropy, dump and string models; file browser regressions'],
  ['public/media-workspace/file.js','public/hex/editor.js','Original upload owner composes the hex editor and adopts edited bytes through an injected navigation lease; hex browser regression'],
  ['public/media-workspace/file.js','public/result-recording.js','File controller owns original bytes and revision-qualified analysis leases; file and native-note browser regressions'],
  ['public/round1/cube.js','public/project-sources.js','Cube observation passes only the actual dependency list and fixed roles to the shared source owner; upstream completion checks non-3x3 source narrowing and footer placement'],
  ['public/science/native-view.js','public/result-recording.js','Original engine workbook owns full results and terminable Worker revisions; upstream completion regression'],
  ['public/science/sequence-view.js','public/result-recording.js','SeqViz owns full sequence options, source file and selection; upstream completion checks unmount/invalidation'],
  ['public/round1/cubing-view.js','public/result-recording.js','Pinned puzzle owner publishes complete state; upstream completion real KPuzzle checks'],
  ['public/round1/hanzi-full.js','public/result-recording.js','Full Hanzi dictionary and original methods publish explicit current records; upstream completion'],
  ['public/round2/tonal-view.js','public/result-recording.js','Player interval/transpose forms publish the complete current text and invalidate it synchronously; upstream completion'],
  ['public/qalculate/units.js','public/capabilities/unit-catalog.js','Static discipline membership only, no numeric conversion; qalculate units verify all 452 units and browser verifies real task selection'],
  ['public/qalculate/units.js','public/result-recording.js','Unit conversion owns calculation cancellation, discipline drafts and result leases; covered by qalculate browser tests'],
  ['public/qalculate/index.js','public/result-recording.js','Qalculate owns exact result and synchronous invalidation; qalculate browser tests cover notebook leases'],
  ['public/animation/index.js','public/result-recording.js','Animation owner publishes exact selected PNG and full metadata; animation browser verifies selection and task invalidation'],
  ['public/ui/animate-ui.js','public/vendor/ui-runtime/runtime.js','Pinned Animate UI/React component runtime; original-node interop and lifecycle tested by browser-ui-runtime'],
  ['public/ui/motion.js','public/vendor/ui-runtime/runtime.js','Pinned Motion engine for shared transitions; browser-ui-motion and browser-ui-runtime'],
  ['public/expansion/index.js','public/completion/views.js','Compose completion workspaces with their original controllers; browser-completion covers activation and results'],
  ['public/expansion/help.js','public/completion/help.js','Static completion task help; knowledge and catalogue checks'],
  ['public/completion/views.js','public/expansion/session.js','Shared cancellation, byte result and notebook leases; browser-completion'],
  ['public/completion/views.js','public/expansion/hunt-data.js','Public dictionary selection metadata only; completion full-data tests'],
  ['public/completion/worker.js','public/expansion/hunt-data.js','T9 reads complete selected dictionary; completion units and browser'],
  ['public/completion/keyboard.js','public/result-recording.js','Explicit local composer result lease and target insertion; browser-completion'],
  ['public/completion/keyboard.js','public/expansion/session.js','Save full keyboard text through shared export transport; browser-completion'],
  ['public/completion/origami.js','public/result-recording.js','Revision-qualified full FOLD scene snapshot; browser-completion'],
  ['public/completion/origami.js','public/expansion/session.js','Full scene export transport; browser-completion'],
  ['public/round1/qr.js','public/completion/qr-view.js','QR owner supplies matrix snapshots and explicit undoable recovery adoption; completion QR regressions'],
  ['public/atlas-celestial/core.js','public/reference/chinese-search.js','Search-only orthographic normalization for sourced constellation names and eclipse types/dates; atlas celestial regressions preserve raw records'],
  ['public/discovery/reference-core.js','public/reference/chinese-search.js','Pure local orthographic normalization for public reference matching; Chinese reference regressions retain raw records'],
  ['public/reference/core.js','public/reference-locale/unicode.js','Pure fixed Chinese Unicode annotation lookup; CLDR and reference model regressions keep original code points and names'],
  ['public/discovery/reference-core.js','public/reference-locale/names.js','Exact fixed CLDR currency-code labels only; CLDR tests keep all original currency rows'],
  ['public/timezones/core.js','public/reference-locale/names.js','Pure exact IANA aliases and territory-code Chinese labels; timezone and CLDR regressions preserve compiled zone identity'],
  ['public/timezones/index.js','public/reference-locale/names.js','Display the fixed locale version from its sole metadata owner; timezone UI regression keeps language scope visible'],
  ['public/timezones/core.js','public/reference/chinese-search.js','Local search-only orthographic normalization; timezone regressions preserve original TZif bytes and rule IDs'],
  ['public/atlas-life-culture/core.js','public/reference-locale/names.js','Exact territory-name keywords supplement public bird range search without translating original prose; atlas Chinese regressions'],
  ['public/atlas-life-culture/core.js','public/reference/chinese-search.js','Search-only orthographic normalization; atlas Chinese tests preserve all raw catalogue fields'],
  ['public/it-reference/model.js','public/reference/chinese-search.js','Pure local orthographic normalization only; reference Chinese regressions preserve original registry values and no network or persistent storage'],
  ['public/online-query/external.js','public/handoff/button.js','Explicit online reference records retain complete provider data and provenance in revision-qualified notebook/graphics leases; online-query-expansion browser covers stale results and selection'],
  ['public/online-query/index.js','public/handoff/button.js','Explicitly selected full OEIS response record uses a revision-qualified notebook/graphics lease; online-query browser verifies capture, selection and stale invalidation'],
  ['public/feedback/model.js','public/site-version.js','Pure product version metadata keeps diagnostic reports aligned with About; feedback units and site-pages/handoff-feedback browsers verify version identity'],
  ['public/hex/editor.js','public/result-recording.js','Original controller publishes full current result with revision lease; browser-handoff-feedback and affected owner suites validate capture and invalidation'],
  ['public/it-reference/page.js','public/result-recording.js','Original controller publishes full current result with revision lease; browser-handoff-feedback and affected owner suites validate capture and invalidation'],
  ['public/basics/session.js','public/result-recording.js','Original controller publishes complete current result and clears revisions; browser-native-notes and affected owner suites validate capture and invalidation'],
  ['public/chef-tools/task-view.js','public/result-recording.js','Original controller publishes complete current result and clears revisions; browser-native-notes and affected owner suites validate capture and invalidation'],
  ['public/discovery/go.js','public/result-recording.js','Original controller publishes complete current result and clears revisions; browser-native-notes and affected owner suites validate capture and invalidation'],
  ['public/reference/index.js','public/result-recording.js','Original controller publishes complete current result and clears revisions; browser-native-notes and affected owner suites validate capture and invalidation'],
  ['public/round1/analysis.js','public/result-recording.js','Original controller publishes complete current result and clears revisions; browser-native-notes and affected owner suites validate capture and invalidation'],
  ['public/round1/cube.js','public/result-recording.js','Original controller publishes complete current result and clears revisions; browser-native-notes and affected owner suites validate capture and invalidation'],
  ['public/round1/hanzi.js','public/result-recording.js','Original controller publishes complete current result and clears revisions; browser-native-notes and affected owner suites validate capture and invalidation'],
  ['public/round1/instruments.js','public/result-recording.js','Original controller publishes complete current result and clears revisions; browser-native-notes and affected owner suites validate capture and invalidation'],
  ['public/round1/qr.js','public/result-recording.js','Original controller publishes complete current result and clears revisions; browser-native-notes and affected owner suites validate capture and invalidation'],
  ['public/round1/substitution.js','public/result-recording.js','Original controller publishes complete current result and clears revisions; browser-native-notes and affected owner suites validate capture and invalidation'],
  ['public/round1/symbols.js','public/result-recording.js','Original controller publishes complete current result and clears revisions; browser-native-notes and affected owner suites validate capture and invalidation'],
  ['public/round2/archive.js','public/result-recording.js','Original controller publishes complete current result and clears revisions; browser-native-notes and affected owner suites validate capture and invalidation'],
  ['public/round2/coordinates.js','public/result-recording.js','Original controller publishes complete current result and clears revisions; browser-native-notes and affected owner suites validate capture and invalidation'],
  ['public/round2/images.js','public/result-recording.js','Original controller publishes complete current result and clears revisions; browser-native-notes and affected owner suites validate capture and invalidation'],
  ['public/round2/music.js','public/result-recording.js','Original controller publishes complete current result and clears revisions; browser-native-notes and affected owner suites validate capture and invalidation'],
  ['public/round3/paper.js','public/result-recording.js','Original controller publishes complete current result and clears revisions; browser-native-notes and affected owner suites validate capture and invalidation'],
  ['public/round4/chess.js','public/result-recording.js','Original controller publishes complete current result and clears revisions; browser-native-notes and affected owner suites validate capture and invalidation'],
  ['public/round4/fragments.js','public/result-recording.js','Original controller publishes complete current result and clears revisions; browser-native-notes and affected owner suites validate capture and invalidation'],
  ['public/round4/life.js','public/result-recording.js','Original controller publishes complete current result and clears revisions; browser-native-notes and affected owner suites validate capture and invalidation'],
  ['public/science/index.js','public/result-recording.js','Original controller publishes complete current result and clears revisions; browser-native-notes and affected owner suites validate capture and invalidation'],
  ['public/turing/ui.js','public/result-recording.js','Original controller publishes complete current result and clears revisions; browser-native-notes and affected owner suites validate capture and invalidation'],
  ['public/coderunner/ui.js','public/handoff/button.js','Completed actual output and full SQL tables/database use an immutable note/graphics lease; browser-coderunner-layout verifies capture and invalidation'],
  ['public/atlas/index.js','public/handoff/button.js','Selected full local catalogue record uses an immutable note/graphics lease; browser-atlas verifies adoption and stale invalidation'],
  ['public/timezones/index.js','public/handoff/button.js','Selected real TZif conversion and rule provenance use an immutable note/graphics lease; browser-timezones verifies stale invalidation'],
  ['public/capabilities/search.js','public/vendor/fuse/fuse.js','Pinned pure metadata matching only; search unit and inline-search browser validate offline ranking and lifecycle'],
  ['public/expansion/session.js','public/handoff/button.js','Immutable real result to notebook and graphics; browser-expansion validates source leases'],
  ['public/expansion/morse-view.js','public/handoff/button.js','Morse raw text or actual WAV snapshot; expansion Morse browser/UI regressions'],
  ['public/expansion/morse-view.js','public/media.js','Pure WAV serializer only; morse UI browser verifies original PCM and download'],
  ['public/expansion/constraints-view.js','public/tool-help.js','Append original Chinese DSL reference into shared help; browser-expansion'],
  ['public/audio-worker.js','public/expansion/morse-engine.js','Dedicated CPU audio worker owns real ggmorse WASM execution; expansion Morse worker/UI tests'],
  ['public/audio-worker.js','public/expansion/score-core.js','Audio synthesis in the existing audio worker; score PCM and browser-expansion'],
  ['public/notebook/page.js','public/graphics/model.js','Typed editable drawing attachments; graphics unit and browser-graphics validate backup and reopen'],
  ['public/handoff/button.js','public/graphics/bridge.js','Explicit result snapshot subscription; browser-graphics validates source lease and original bytes'],
  ['public/graphics/page.js','public/handoff/model.js','Immutable byte snapshot; graphics and handoff units'],
  ['public/graphics/page.js','public/notebook/model.js','Pure base64 serialization only; notebook transaction service is injected by app.js; browser-graphics'],
  ['public/notebook/page.js','public/handoff/button.js','Explicit result capture subscription; browser-notebook validates stale source and original bytes'],
  ['public/notebook/page.js','public/handoff/model.js','Bounded immutable result snapshot; notebook and handoff tests'],
  ['public/handoff/dialog.js','public/chef-tools/catalog.js','Compatible target input types from official metadata; handoff tests'],
  ['public/chef-tools/task-view.js','public/feedback/model.js','Sanitized execution diagnostics; feedback tests'],
  ['public/basics/session.js','public/feedback/model.js','Sanitized conversion diagnostics; feedback tests'],
  ['public/basics/session.js', 'public/cyberchef-client.js', 'Execute basic conversions through the shared Chef client'],
  ['public/chef-tools/task-view.js', 'public/cyberchef-client.js', 'Chef task execution adapter'],
  ['public/round1/analysis.js', 'public/cyberchef-client.js', 'Explicit automatic decoding through Chef'],
  ['public/round1/symbols.js', 'public/engine.js', 'Reuse the original Morse and Braille conversion in the symbol reference'],
  ['public/round1/braille.js', 'public/engine.js', 'Keyboard and dot view share the original six-dot decoding; round-one and UI layout cover actual selection and drafts'],
  ['public/round2/archive.js', 'public/media.js', 'Reuse the shared file signature inspector'],
  ['public/basics/foundation.js', 'public/chef-tools/schema.js', 'Basic conversions reuse the real Chef parameter schema'],
  ['public/basics/session.js', 'public/chef-tools/catalog.js', 'Basic conversion adapter resolves original operation metadata'],
  ['public/capabilities/reference-workspaces.js', 'public/reference/world-map.js', 'Region context uses the real map'],
  ['public/capabilities/reference-workspaces.js', 'public/discovery/bridge.js', 'Region and sky detail actions'],
  ['public/capabilities/reference-workspaces.js', 'public/science/core.js', 'Sequence workspace uses the amino acid table'],
  ['public/reference/browser.js', 'public/discovery/reference-browser.js', 'Reference UI composes currencies, marine and sky'],
  ['public/reference/browser.js', 'public/discovery/bridge.js', 'Reference detail object handoff'],
  ['public/reference/browser.js', 'public/capabilities/reference-workspaces.js', 'Shared region context'],
  ['public/reference/index.js', 'public/discovery/bridge.js', 'Validated detail object handoff'],
  ['public/reference/index.js', 'public/discovery/reference-core.js', 'Catalogue object normalization'],
  ['public/reference/index.js', 'public/capabilities/reference-workspaces.js', 'Reference controller registration'],
  ['public/reference/catalog.js', 'public/discovery/catalog.js', 'One combined reference catalogue'],
  ['public/round2/music.js', 'public/round1/instruments.js', 'Audio play tab keeps its original instrument controller'],
  ['public/round3/paper.js', 'public/round2/common.js', 'Bounded workerJob compatibility helper'],
  ['public/science/index.js', 'public/discovery/bridge.js', 'Real sky catalogue object to astronomy'],
];
bridges.push(
 ['public/practical/geometry-view.js','public/qalculate/client.js','Dedicated geometry and BMI forms execute the existing cancellable core; practical browser tests check actual values and stale results'],
 ['public/practical/distance-view.js','public/round2/coordinates-engine.js','Dedicated distance form reuses the sole geographic parser and spherical distance/bearing owner; practical unit and browser tests cover it'],
 ['public/practical/timezone-picker.js','public/reference/chinese-search.js','Local-only orthographic search over the complete IANA labels; practical browser tests cover traditional Chinese search without changing zone IDs'],
 ['public/practical/time-client.js','public/timezones/worker.js','Same-origin resource protocol to the sole complete TZif owner; practical browser tests cover cancellation, Blob/subdirectory, failure and retry'],
 ['public/practical/form.js','public/result-recording.js','Dedicated forms own current immutable text and synchronous invalidation; practical browser tests cover notebook leases'],
);
const shared = new Set(['public/round1/common.js', 'public/capabilities/registry.js',
  'public/capabilities/routes.js', 'public/capabilities/input-session.js', 'public/capabilities/task-lifecycle.js']);
const sharedRoot = new Set(['public/navigation.js','public/tool-search.js','public/cyberchef-i18n.js','public/tool-help.js']);
export function isDiscoveryData(file) {
  return ['public/navigation.js','public/capabilities/registry.js','public/capabilities/routes.js','public/capabilities/search.js',
    'public/practical/catalog.js','public/capabilities/unit-catalog.js','public/capabilities/topics.js','public/capabilities/topic-model.js','public/capabilities/operation-policy.js','public/capabilities/operation-pairs.js','public/knowledge/topics.js',
    'public/tool-search.js','public/cyberchef-i18n.js','public/chef-tools/catalog.js','public/atlas/catalog.js','public/external-guide/catalog.js',
    'public/coderunner/catalog.js','public/round3/catalog.js','public/knowledge/content.js',
    'public/expansion/catalog.js','public/completion/catalog.js','public/completion/barcode-catalog.js','public/expansion/classical-catalog.js','public/expansion/alpertron-catalog.js','public/expansion/hunt-constraints-catalog.js','public/expansion/keyboard-catalog.js'].includes(file)
    || file.startsWith('public/knowledge/articles/') || file.startsWith('public/knowledge/chapters/');
}
const area = file => file.split('/').length > 2 ? file.split('/')[1] : 'root';
// round4/model.js is the 3D page controller (not a domain model).
const model = file => !file.startsWith('public/ui/') && file!=='public/round4/model.js' && /\/(?:[^/]+-)?(?:core|model|engine|geometry)\.js$/.test(file);
export function boundaryViolations(graph, closure) {
  const issues = [];
  for (const [file, node] of graph) {
    for (const target of node.imports) {
      if(file==='public/app.js'&&['public/media.js','public/engine.js','public/audio-worker.js'].includes(target))
        issues.push(`${file} -> ${target}: bootstrap composes controllers, not media algorithms`);
      if(file==='public/practical/index.js'&&!/^public\/practical\/(?:date|geometry|distance|time)-view\.js$/.test(target))
        issues.push(`${file} -> ${target}: practical entry composes domain views only`);
      if (file.startsWith('public/ui/') && !target.startsWith('public/ui/') && !bridges.some(([from,to])=>from===file&&to===target)) issues.push(`${file} -> ${target}: UI must not depend on application domains`);
      const searchLibrary=file==='public/capabilities/search.js'&&target==='public/vendor/fuse/fuse.js';
      if (isDiscoveryData(file) && !isDiscoveryData(target) && !searchLibrary) issues.push(`${file} -> ${target}: discovery data must not load UI/controllers/algorithms`);
      if (area(file)!=='root' && area(target)==='root' && !sharedRoot.has(target)
        && !bridges.some(([from,to])=>from===file&&to===target))
        issues.push(`${file} -> ${target}: root-level feature imports also need a named bridge contract`);
      if (['public/capabilities/sidebar.js','public/capabilities/browser.js'].includes(file)
        && !['public/ui/index.js','public/capabilities/registry.js','public/capabilities/routes.js'].includes(target))
        issues.push(`${file} -> ${target}: discovery UI must use components, metadata and pure routes`);
      if (area(file)!=='root' && area(target)!=='root' && area(file)!==area(target)
        && !['ui','vendor'].includes(area(target)) && !isDiscoveryData(file)
        && !shared.has(target) && !bridges.some(([from,to])=>from===file&&to===target))
        issues.push(`${file} -> ${target}: cross-feature dependency needs a named bridge contract`);
    }
    if (model(file) || /(?:^|[-/])worker\.js$/.test(file)) {
      for (const target of closure(graph,file)) if (target.startsWith('public/ui/')) {
        issues.push(`${file}: model/engine/worker transitively imports UI (${target})`);break;
      }
    }
    if (area(file)!=='root' && node.imports.some(target=>['public/app.js','public/site-shell.js','public/workbench-shell.js','public/workspace.js'].includes(target)))
      issues.push(`${file}: a feature must not import the application bootstrap or shell`);
  }
  return issues;
}
