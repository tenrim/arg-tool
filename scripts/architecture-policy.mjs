// Named, directional integration contracts; additions need a concrete owner
// and matching behavior coverage, not a blanket feature-to-feature exemption.
export const bridges = [
  ['public/feedback/ui.js','public/deployment.js','Operator-owned same-origin feedback endpoint; local-only default and explicit service coverage in browser-site-pages / browser-handoff-feedback'],
  ['public/handoff/dialog.js','public/chef-tools/catalog.js','Compatible target input types from official metadata; handoff tests'],
  ['public/chef-tools/task-view.js','public/handoff/button.js','Explicit current Chef result handoff; browser-handoff-feedback'],
  ['public/basics/session.js','public/handoff/button.js','Native conversion result handoff; browser-handoff-feedback'],
  ['public/round2/archive.js','public/handoff/button.js','Selected verified archive entry handoff; browser-handoff-feedback'],
  ['public/chef-tools/task-view.js','public/feedback/model.js','Sanitized execution diagnostics; feedback tests'],
  ['public/basics/session.js','public/feedback/model.js','Sanitized conversion diagnostics; feedback tests'],
  ['public/basics/session.js', 'public/cyberchef-client.js', 'Execute basic conversions through the shared Chef client'],
  ['public/chef-tools/task-view.js', 'public/cyberchef-client.js', 'Chef task execution adapter'],
  ['public/round1/analysis.js', 'public/cyberchef-client.js', 'Explicit automatic decoding through Chef'],
  ['public/round1/symbols.js', 'public/engine.js', 'Reuse the original Morse conversion'],
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
  ['public/round4/model.js', 'public/reference/model-bridge.js', 'Explicit real CIF model handoff'],
  ['public/science/index.js', 'public/discovery/bridge.js', 'Real sky catalogue object to astronomy'],
];
const shared = new Set(['public/round1/common.js', 'public/capabilities/registry.js',
  'public/capabilities/routes.js', 'public/capabilities/input-session.js', 'public/capabilities/task-lifecycle.js']);
const sharedRoot = new Set(['public/navigation.js','public/tool-search.js','public/cyberchef-i18n.js','public/tool-help.js']);
export function isDiscoveryData(file) {
  return ['public/navigation.js','public/capabilities/registry.js','public/capabilities/routes.js',
    'public/tool-search.js','public/cyberchef-i18n.js','public/chef-tools/catalog.js',
    'public/coderunner/catalog.js','public/round3/catalog.js','public/knowledge/content.js'].includes(file)
    || file.startsWith('public/knowledge/articles/');
}
const area = file => file.split('/').length > 2 ? file.split('/')[1] : 'root';
// round4/model.js is the 3D page controller (not a domain model).
const model = file => !file.startsWith('public/ui/') && file!=='public/round4/model.js' && /\/(?:[^/]+-)?(?:core|model|engine|geometry)\.js$/.test(file);
export function boundaryViolations(graph, closure) {
  const issues = [];
  for (const [file, node] of graph) {
    for (const target of node.imports) {
      if (file.startsWith('public/ui/') && !target.startsWith('public/ui/')) issues.push(`${file} -> ${target}: UI must not depend on application domains`);
      if (isDiscoveryData(file) && !isDiscoveryData(target)) issues.push(`${file} -> ${target}: discovery data must not load UI/controllers/algorithms`);
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
