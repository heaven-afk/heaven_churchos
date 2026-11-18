import { readFile } from 'node:fs/promises';
import { beforeAll, afterAll, vi } from 'vitest';

// Exercise the real shipped text; replace only the HTTP transport in Node tests.
beforeAll(() => {
  vi.stubGlobal('fetch', vi.fn(async (input: string) => {
    if (!/^\/bibles\/[A-Z]+\/[A-Z0-9]+\.json$/.test(input)) throw new Error('Unexpected asset request');
    try { return new Response(await readFile(`public${input}`, 'utf8'), {status: 200}); }
    catch { return new Response(null, {status: 404}); }
  }));
});
afterAll(() => vi.unstubAllGlobals());
