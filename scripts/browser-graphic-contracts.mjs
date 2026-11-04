import { startBrowserTestSite } from './browser-test-site.mjs';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const { chromium } = createRequire(import.meta.url)('playwright');
const site = await startBrowserTestSite();
const browser = await chromium
  .launch({ executablePath: process.env.CHROMIUM_PATH || undefined })
  .catch(async (error) => {
    await site.close();
    throw error;
  });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce',
  });
  page.setDefaultTimeout(20000);
  await page.goto(site.base + '/?layout=chronicle#notebook');
  await page.locator('#notebook-new').click();
  await page.locator('#notebook-editor .vditor-ir [contenteditable=true]').waitFor();
  const result = await page.evaluate(async () => {
    const { Box } = await import('/ui/index.js'),
      { createGraphicEngine } = await import('/graphics/engines.js'),
      lib = await import('/vendor/graphics/excalidraw/excalidraw-entry.js'),
      { createNotebookStore } = await import('/notebook/store.js');
    const store = createNotebookStore();
    const elements = lib.convertToExcalidrawElements([
        {
          type: 'rectangle',
          x: 20,
          y: 20,
          width: 200,
          height: 100,
          roughness: 2,
          fillStyle: 'hachure',
        },
        { type: 'text', x: 20, y: 150, text: '字体保留', fontFamily: 1 },
      ]),
      scene = {
        elements,
        files: {},
        appState: {
          viewBackgroundColor: '#ffffff',
          currentItemStrokeColor: '#ff0000',
          scrollX: 80,
          scrollY: 50,
          zoom: { value: 1.2 },
        },
      };
    await store.workspaceSet('whiteboard-library', [
      { id: 'saved-library', created: Date.now(), status: 'unpublished', elements: [elements[0]] },
    ]);
    const host = Box({ className: 'graphic-engine', attrs: { style: 'width:900px;height:650px' } });
    document.body.append(host);
    const engine = await createGraphicEngine('whiteboard', host, scene, {
      library: await store.workspaceGet('whiteboard-library'),
      saveLibrary: (items) => store.workspaceSet('whiteboard-library', items),
    });
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const after = engine.get(),
      svg = await engine.svg({ transparent: true }),
      png = await engine.png({ transparent: true, size: 1024 }),
      image = await createImageBitmap(new Blob([png], { type: 'image/png' })),
      canvas = Box({ tag: 'canvas' });
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    const alpha = ctx.getImageData(0, 0, 1, 1).data[3];
    image.close();
    await engine.setLibrary([
      {
        id: 'new-library',
        name: '新素材',
        created: Date.now(),
        status: 'unpublished',
        elements: [elements[0]],
      },
    ]);
    await new Promise((resolve, reject) => {
      const deadline = Date.now() + 5000;
      async function check() {
        const items = await store.workspaceGet('whiteboard-library');
        if (items?.[0]?.id === 'new-library') resolve();
        else if (Date.now() > deadline) reject(Error('素材库修改未保存'));
        else requestAnimationFrame(check);
      }
      check();
    });
    let selectedRejected = false;
    try {
      await engine.svg({ selectedOnly: true });
    } catch {
      selectedRejected = true;
    }
    engine.destroy();
    host.remove();
    await store.close();
    return { after, svg, alpha, selectedRejected };
  });
  assert.equal(result.after.elements[0].roughness, 2);
  assert.equal(result.after.elements[0].fillStyle, 'hachure');
  assert.equal(result.after.elements[1].fontFamily, 1);
  assert.equal(result.after.appState.viewBackgroundColor, '#ffffff');
  assert.equal(result.after.appState.currentItemStrokeColor, '#ff0000');
  assert.equal(result.after.appState.zoom.value, 1.2);
  assert.equal(result.after.appState.scrollX, 80);
  assert.equal(result.alpha, 0);
  assert(result.selectedRejected);
  await page.getByRole('button', { name: '插入线索白板', exact: true }).click();
  await page.waitForFunction(
    () => document.querySelector('#whiteboard-status')?.textContent === '已保存到笔记本',
  );
  const board = page.locator('#whiteboard-editor > .graphic-engine-session:not([hidden])');
  await board.locator('label[title=素材库]').click();
  await board.locator('.library-unit').first().waitFor();
  assert((await board.locator('.library-unit').count()) > 0);
  await page
    .locator('#panel-whiteboard')
    .getByRole('button', { name: '添加文字', exact: true })
    .click();
  await page.locator('#graphic-text').fill('保留撤销');
  await page
    .locator('#graphic-text-dialog')
    .getByRole('button', { name: '加入图稿', exact: true })
    .click();
  await page.waitForFunction(
    () => document.querySelector('#whiteboard-status')?.textContent === '已保存到笔记本',
  );
  const count = async () =>
    page.evaluate(async () => {
      const { createNotebookStore } = await import('/notebook/store.js'),
        { drawingsIn } = await import('/graphics/model.js');
      const s = createNotebookStore();
      try {
        return drawingsIn((await s.list())[0]).find((e) => e.drawing.kind === 'whiteboard').drawing
          .scene.elements.length;
      } finally {
        await s.close();
      }
    });
  assert.equal(await count(), 1);
  await page
    .locator('#panel-whiteboard')
    .getByRole('button', { name: '返回笔记', exact: true })
    .click();
  await page.locator('#notebook-editor .vditor-ir [contenteditable=true]').waitFor();
  await page.locator('[data-notebook-drawing]').first().click();
  await board.getByTestId('button-undo').click();
  await page.waitForFunction(
    () => document.querySelector('#whiteboard-status')?.textContent === '已保存到笔记本',
  );
  assert.equal(await count(), 0);
  console.log(
    'PASS graphic contracts: existing style/viewport, transparent export, selected-only guard, persistent library update/restore, undo after navigation',
  );
} finally {
  try {
    await browser.close();
  } finally {
    await site.close();
  }
}
