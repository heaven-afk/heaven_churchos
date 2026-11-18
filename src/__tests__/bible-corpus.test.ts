import { readFile } from 'node:fs/promises';
import { describe, expect, it, vi } from 'vitest';
import { BIBLE_TRANSLATIONS } from '@/config/bibles';
import { CANONICAL_BOOKS } from '@/lib/bible/reference-parser';
import { WebBibleProvider } from '@/providers/bible/web.provider';
import type { BibleVerse } from '@/types/bible.types';
import './fixtures/bible-assets';

describe('Shipped Bible library', () => {
  it.each(BIBLE_TRANSLATIONS)('$id ships every canonical book and chapter with authentic nonempty text', async translation => {
    let chapters = 0;
    let verses = 0;
    for (const book of CANONICAL_BOOKS) {
      const data = JSON.parse(await readFile(`public/bibles/${translation.id}/${book.id}.json`, 'utf8')) as Record<string, BibleVerse[]>;
      expect(Object.keys(data)).toHaveLength(book.chapters);
      for (let chapter = 1; chapter <= book.chapters; chapter++) {
        const rows = data[String(chapter)];
        expect(rows?.length).toBeGreaterThan(0);
        expect(new Set(rows.map(v => v.verse)).size).toBe(rows.length);
        expect(rows.every(v => v.book === book.id && v.chapter === chapter && v.verse > 0 && v.text.trim().length > 0)).toBe(true);
        expect(rows.some(v => /The word of the Lord in the .* translation|verse text\./.test(v.text))).toBe(false);
        chapters++; verses += rows.length;
      }
    }
    expect(chapters).toBe(1189);
    expect(verses).toBeGreaterThan(30000);
  });

  it('serves real KJV and Yoruba text without falling back to WEB', async () => {
    const provider = new WebBibleProvider();
    const kjv = await provider.getPassage('JHN', 3, 16, undefined, 'KJV');
    const yoruba = await provider.getPassage('JHN', 3, 16, undefined, 'OYCB');
    expect(kjv.verses[0].text).toContain('only begotten Son');
    expect(yoruba.verses[0].text).toContain('Ọlọ́run');
    expect(yoruba.translation).toBe('OYCB');
    expect(yoruba.verses[0].text).not.toBe(kjv.verses[0].text);
  });

  it('rejects uninstalled translations and nonexistent references', async () => {
    const provider = new WebBibleProvider();
    for (const version of ['NIV', 'AMP', 'MSG', 'unknown']) await expect(provider.getPassage('JHN', 3, 16, undefined, version)).rejects.toThrow('not installed');
    await expect(provider.getChapter('JHN', 22)).rejects.toThrow('does not exist');
    await expect(provider.getPassage('JHN', 3, 99)).rejects.toThrow('unavailable');
    await expect(provider.getPassage('JHN', 3, 15, 99)).rejects.toThrow('unavailable');
  });

  it('retries failed book loads and coalesces requests for the same book', async () => {
    const provider = new WebBibleProvider();
    const fetchSpy = vi.mocked(fetch);
    fetchSpy.mockRejectedValueOnce(new Error('offline'));
    await expect(provider.getChapter('ROM', 8, 'KJV')).rejects.toThrow('offline');
    const [a, b] = await Promise.all([provider.getChapter('ROM', 8, 'KJV'), provider.getChapter('ROM', 12, 'KJV')]);
    expect(a.verses.length).toBeGreaterThan(0);
    expect(b.verses.length).toBeGreaterThan(0);
    expect(fetchSpy.mock.calls.filter(([url]) => url === '/bibles/KJV/ROM.json')).toHaveLength(2);
  });
});
