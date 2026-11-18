"use client";

import { useEffect, useState } from "react";
import { bibleProvider } from "@/providers/bible/web.provider";
import { parseScriptureReference } from "@/lib/bible/reference-parser";
import {
  passageToPresentationSlides,
  createScriptureServiceItem,
} from "@/lib/bible/scripture.service";
import { dispatch } from "@/actions/presentation.actions";
import { useServiceStore } from "@/store/service.store";
import type { BiblePassage, BibleTranslation } from "@/types/bible.types";

const QUICK_PASSAGES = ["John 3:16-18", "Psalm 23", "Romans 8:28", "Gen 1:1-5"];

export function ScripturePanel() {
  const [query, setQuery] = useState("John 3:16-18");
  const [translation, setTranslation] = useState("KJV");
  const [translations, setTranslations] = useState<BibleTranslation[]>([]);
  const [result, setResult] = useState<{ key: string; passage: BiblePassage } | null>(
    null
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [retry, setRetry] = useState(0);
  const currentService = useServiceStore((s) => s.currentService);
  const setCurrentService = useServiceStore((s) => s.setCurrentService);
  const addItem = useServiceStore((s) => s.addItem);
  const key = `${translation}:${query}`;
  const passage = result?.key === key ? result.passage : null;
  const selectedTranslation = translations.find((t) => t.id === translation);

  useEffect(() => {
    void bibleProvider.getTranslations().then(setTranslations);
  }, []);
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const parsed = parseScriptureReference(query);
        if (!parsed?.isValid) {
          if (!cancelled) setResult(null);
          return;
        }
        const passage = parsed.isFullChapter
          ? {
              reference: `${parsed.bookName} ${parsed.chapter}`,
              translation,
              verses: (
                await bibleProvider.getChapter(parsed.bookId, parsed.chapter, translation)
              ).verses,
            }
          : await bibleProvider.getPassage(
              parsed.bookId,
              parsed.chapter,
              parsed.startVerse,
              parsed.endVerse,
              translation
            );
        if (!cancelled) setResult({ key, passage });
      } catch (cause) {
        if (!cancelled) {
          setResult(null);
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to load Scripture. Please try again."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, translation, key, retry]);

  const prepare = (live = false) => {
    if (!passage) return;
    const slides = passageToPresentationSlides(passage);
    dispatch({ type: "SET_SLIDES", slides });
    dispatch({ type: live ? "SEND_LIVE" : "SET_PREVIEW", slide: slides[0] });
  };
  const add = () => {
    if (!passage) return;
    let service = currentService;
    if (!service) {
      const now = new Date().toISOString();
      service = {
        id: crypto.randomUUID(),
        title: "Sunday Service",
        date: now.split("T")[0],
        items: [],
        organizationId: "org-default",
        isSynced: false,
        createdAt: now,
        updatedAt: now,
      };
      setCurrentService(service);
    }
    addItem(createScriptureServiceItem(passage, service.items.length));
    prepare();
  };

  return (
    <div className="resource-panel">
      <div>
        <h2 className="resource-title">Find Scripture</h2>
        <p className="resource-description">
          Search a reference, preview it, then take it live.
        </p>
      </div>
      <label className="field-label" htmlFor="bible-translation">
        Bible translation
      </label>
      <select
        id="bible-translation"
        className="operator-input"
        value={translation}
        onChange={(e) => setTranslation(e.target.value)}
      >
        {translations.map((t) => (
          <option key={t.id} value={t.id}>
            {t.abbreviation} · {t.name}
          </option>
        ))}
      </select>
      <label className="field-label" htmlFor="scripture-query">
        Reference
      </label>
      <input
        id="scripture-query"
        className="operator-input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="John 3:16–18 or Psalm 23"
        autoComplete="off"
        spellCheck={false}
      />
      <div className="flex flex-wrap gap-2">
        {QUICK_PASSAGES.map((q) => (
          <button key={q} className="operator-chip" onClick={() => setQuery(q)}>
            {q}
          </button>
        ))}
      </div>
      <div aria-live="polite" aria-busy={loading}>
        {error ? (
          <div className="operator-notice" role="alert">
            {error}{" "}
            <button className="operator-chip" onClick={() => setRetry((n) => n + 1)}>
              Retry
            </button>
          </div>
        ) : !passage ? (
          <p className="resource-description">
            {loading
              ? "Loading Scripture…"
              : "Enter a book, chapter and optional verse range."}
          </p>
        ) : null}
      </div>
      {passage && (
        <section className="scripture-result">
          <div className="flex items-start justify-between gap-2">
            <h3>{passage.reference}</h3>
            <span className="operator-chip">
              {translation} · {passage.verses.length} verses
            </span>
          </div>
          <div className="scripture-verses" lang={selectedTranslation?.language}>
            {passage.verses.map((v) => (
              <p key={v.verse}>
                <sup>{v.verse}</sup> {v.text}
              </p>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-stage-scripture"
              className="operator-button"
              onClick={() => prepare()}
            >
              Preview
            </button>
            <button id="btn-add-scripture" className="operator-button" onClick={add}>
              + Add to service
            </button>
          </div>
          <button
            id="btn-live-scripture"
            className="operator-button primary"
            onClick={() => prepare(true)}
          >
            Take Scripture live ↗
          </button>
        </section>
      )}
      {selectedTranslation && (
        <p className="resource-description">
          {selectedTranslation.attribution}{" "}
          <a href={selectedTranslation.sourceUrl} target="_blank" rel="noreferrer">
            Source &amp; license ↗
          </a>
        </p>
      )}
      <details className="translation-note">
        <summary>Need NIV, Amplified or The Message?</summary>
        <p>
          These full translations require publisher licensing and are not installed. All
          seven installed translations are served locally; no Bible API or internet
          connection is needed during a service.
        </p>
        <a href="/bibles/LICENSES.md" target="_blank" rel="noreferrer">
          Bible sources and permissions ↗
        </a>
      </details>
    </div>
  );
}
