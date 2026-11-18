/**
 * Multi-Translation Bible Provider — Phase 1 §5.1, §5.3 & Multi-version Support
 *
 * Implements BibleProvider supporting multiple public domain translations:
 * - WEB (World English Bible)
 * - KJV (King James Version)
 * - ASV (American Standard Version)
 * - BBE (Bible in Basic English)
 */

import type { BibleProvider } from "./bible.provider";
import type {
  BibleBook,
  BibleChapter,
  BiblePassage,
  BibleTranslation,
  BibleVerse,
  ScriptureSearchResult,
} from "@/types/bible.types";
import {
  CANONICAL_BOOKS,
  findBook,
  parseScriptureReference,
  formatScriptureReference,
} from "@/lib/bible/reference-parser";
import { BIBLE_TRANSLATIONS } from "@/config/bibles";
export const AVAILABLE_TRANSLATIONS = BIBLE_TRANSLATIONS;

export const WEB_TRANSLATION: BibleTranslation = AVAILABLE_TRANSLATIONS.find(
  (t) => t.id === "WEB"
)!;

export class WebBibleProvider implements BibleProvider {
  private readonly defaultTranslation = "WEB";
  private chapterCache = new Map<string, BibleChapter>();
  private bookRequests = new Map<string, Promise<Record<string, BibleVerse[]>>>();

  async getTranslations(): Promise<BibleTranslation[]> {
    return AVAILABLE_TRANSLATIONS;
  }

  async getBooks(): Promise<BibleBook[]> {
    return CANONICAL_BOOKS.map((b) => ({
      id: b.id,
      osis: b.osis,
      name: b.name,
      shortName: b.shortName,
      chapters: b.chapters,
      testament: b.testament,
    }));
  }

  async getBook(bookId: string): Promise<BibleBook> {
    const book = findBook(bookId);
    if (!book) {
      throw new Error(`Book not found: ${bookId}`);
    }
    return {
      id: book.id,
      osis: book.osis,
      name: book.name,
      shortName: book.shortName,
      chapters: book.chapters,
      testament: book.testament,
    };
  }

  async getChapter(
    book: string,
    chapter: number,
    translation?: string
  ): Promise<BibleChapter> {
    const activeTranslation = (translation ?? this.defaultTranslation).toUpperCase();
    if (!AVAILABLE_TRANSLATIONS.some((t) => t.id === activeTranslation)) {
      throw new Error(
        "This translation is not installed. NIV, AMP and MSG require publisher permission."
      );
    }
    const resolvedBook = await this.getBook(book);
    if (!Number.isInteger(chapter) || chapter < 1 || chapter > resolvedBook.chapters) {
      throw new Error("This chapter does not exist. Check the Scripture reference.");
    }
    const cacheKey = resolvedBook.id + "-" + chapter + "-" + activeTranslation;
    const cached = this.chapterCache.get(cacheKey);
    if (cached) return cached;
    const key = activeTranslation + "/" + resolvedBook.id;
    let request = this.bookRequests.get(key);
    if (!request) {
      request = fetch("/bibles/" + key + ".json")
        .then(async (response) => {
          if (!response.ok)
            throw new Error(
              "Unable to load this Bible book. Keep the local server running and try again."
            );
          return (await response.json()) as Record<string, BibleVerse[]>;
        })
        .catch((error: unknown) => {
          this.bookRequests.delete(key);
          throw error;
        });
      this.bookRequests.set(key, request);
    }
    const data = await request;
    const verses = data[String(chapter)];
    if (
      !Array.isArray(verses) ||
      !verses.length ||
      verses.some(
        (v) =>
          v.book !== resolvedBook.id ||
          v.chapter !== chapter ||
          !Number.isInteger(v.verse) ||
          typeof v.text !== "string" ||
          !v.text.trim()
      )
    )
      throw new Error(
        "This Bible chapter is unavailable. No substitute text has been used."
      );
    const result = { book: resolvedBook.id, chapter, verses };
    this.chapterCache.set(cacheKey, result);
    return result;
  }

  async getPassage(
    book: string,
    chapter: number,
    verse: number,
    verseEnd?: number,
    translation?: string
  ): Promise<BiblePassage> {
    const activeTranslation = (translation ?? this.defaultTranslation).toUpperCase();
    const resolvedBook = await this.getBook(book);
    const chapterData = await this.getChapter(
      resolvedBook.id,
      chapter,
      activeTranslation
    );

    const startV = verse;
    const endV = verseEnd ?? verse;
    if (
      !Number.isInteger(startV) ||
      !Number.isInteger(endV) ||
      startV < 1 ||
      endV < startV
    ) {
      throw new Error("Enter a valid verse or verse range.");
    }
    const verses = chapterData.verses.filter((v) => v.verse >= startV && v.verse <= endV);
    if (verses.length !== endV - startV + 1) {
      throw new Error(
        "This verse range is unavailable in the selected translation. Check the reference."
      );
    }

    const reference = formatScriptureReference({
      bookName: resolvedBook.name,
      chapter,
      startVerse: startV,
      endVerse: endV,
    });

    return {
      reference,
      translation: activeTranslation,
      verses,
    };
  }

  async searchReference(
    query: string,
    translation?: string
  ): Promise<ScriptureSearchResult[]> {
    if (!query || query.trim().length === 0) return [];
    const activeTranslation = (translation ?? this.defaultTranslation).toUpperCase();

    const parsed = parseScriptureReference(query);
    if (parsed && parsed.isValid) {
      const book = await this.getBook(parsed.bookId);
      const passage = await this.getPassage(
        parsed.bookId,
        parsed.chapter,
        parsed.startVerse,
        parsed.endVerse,
        activeTranslation
      );

      const previewText = passage.verses
        .slice(0, 2)
        .map((v) => `${v.verse}. ${v.text}`)
        .join(" ");

      return [
        {
          reference: passage.reference,
          book: book.id,
          chapter: parsed.chapter,
          verse: parsed.startVerse,
          verseEnd: parsed.endVerse,
          translation: activeTranslation,
          preview: previewText,
        },
      ];
    }

    // If not a full reference query, search by book name / abbreviation
    const trimmed = query.trim().toLowerCase();
    const matchingBooks = CANONICAL_BOOKS.filter(
      (b) =>
        b.name.toLowerCase().includes(trimmed) ||
        b.shortName.toLowerCase().includes(trimmed) ||
        b.aliases.some((a) => a.includes(trimmed))
    ).slice(0, 5);

    return matchingBooks.map((b) => ({
      reference: `${b.name} 1`,
      book: b.id,
      chapter: 1,
      verse: 1,
      translation: activeTranslation,
      preview: `${b.name} chapter 1 (${b.testament === "OT" ? "Old Testament" : "New Testament"})`,
    }));
  }
}

/** Singleton instance of the WebBibleProvider */
export const bibleProvider = new WebBibleProvider();
