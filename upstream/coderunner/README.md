# Code runner upstreams

Esolang Park source is preserved unchanged at commit `d84b21c333dc4ce417e0841145d69f04de1a4e2e`, with `SOURCE.json` hashes. Only Brainfuck, Befunge-93, Deadfish and their runtime dependencies enter the browser bundle. Its Monaco/React/Next UI and Chef/Shakespeare runtimes are not integrated.

The other packages are pinned in package-lock.json, including tarball URLs and npm integrity digests. The browser only loads checked-in local assets. The import script keeps license notices and records every shipped file's SHA-256 and byte size. Ordinary builds do not download anything.

Maintenance rebuild (Node 24+):

```sh
npm ci --ignore-scripts --prefix upstream/coderunner
node scripts/import-coderunner.mjs
```

`ARG_CODE_MODULES` may select another directory containing those exact installed versions. Preserve Pyodide, CPython and Lua license files here. Their sources are Pyodide tag 0.29.3/LICENSE, CPython tag v3.13.2/LICENSE and Lua tag v5.4.6/lua.h (license section).

The adapters and worker capability restrictions are original code in `public/coderunner`. Ook! converts token pairs to the unchanged Brainfuck engine. Whitespace uses the upstream parser, compiled instructions and VM state with our bounded step loop. JavaScript runs inside QuickJS, never host eval. Python's exposed `js` namespace is empty; host networking, persistent storage, worker creation and dynamic JS execution entry points are removed after trusted initialization. No host filesystem or selected files are passed except the explicit text input and SQL database.

Workers are killed on edit, stop, timeout or navigation. These browser resource controls are not an operating-system sandbox or a hard Python memory quota. Pyodide has no third-party package installation in this integration; package auto-loading is not used. Fresh Workers also reset virtual files, globals and SQL databases between runs. Native browser security updates remain necessary.

Validation: `node scripts/browser-coderunner.mjs` exercises all ten runtimes, Unicode, stdin, SQL files, step state, denied host APIs, cancellation, stale-result guards, output/time limits and mobile layouts.
