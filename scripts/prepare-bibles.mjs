// Rebuild distributable, book-sized JSON assets from the upstream source downloads.
// See public/bibles/LICENSES.md. No Scripture text is generated or paraphrased.
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const books = JSON.parse(await readFile("src/data/bible/books.json", "utf8"));
const sources = [
  ["WEB", "web"],
  ["ASV", "asv"],
  ["BBE", "basicenglish"],
  ["YLT", "ylt"],
  ["WBS", "wb"],
];
const root = "public/bibles";
await mkdir(`${root}/sources`, { recursive: true });
const manifest = {};
for (const [id, upstream] of sources) {
  const file = `scratch/bible-sources/${upstream}.json`;
  let raw;
  try {
    raw = await readFile(file, "utf8");
  } catch {
    const response = await fetch(`https://api.getbible.net/v2/${upstream}.json`);
    if (!response.ok) throw new Error(`Download failed: ${upstream} ${response.status}`);
    raw = await response.text();
    await writeFile(file, raw);
  }
  const data = JSON.parse(raw);
  const chapters = {};
  for (const book of books) {
    const source = data.books.find((b) => b.nr === books.indexOf(book) + 1);
    if (!source || source.chapters.length !== book.chapters)
      throw new Error(`${id}: incomplete ${book.id}`);
    chapters[book.id] = Object.fromEntries(
      source.chapters.map((c) => [
        c.chapter,
        c.verses.map((v) => ({
          book: book.id,
          chapter: c.chapter,
          verse: v.verse,
          text: v.text.trim(),
        })),
      ])
    );
  }
  await save(id, chapters, {
    url: `https://api.getbible.net/v2/${upstream}.json`,
    sha256: createHash("sha256").update(raw).digest("hex"),
    license: data.distribution_license,
  });
  const { books: omitted, ...metadata } = data;
  void omitted;
  await writeFile(`${root}/sources/${id}.json`, JSON.stringify(metadata, null, 2));
}
const aliases = {
  SOL: "SNG",
  EZE: "EZK",
  JOE: "JOL",
  NAH: "NAM",
  MAR: "MRK",
  JOH: "JHN",
  PHI: "PHP",
  JAM: "JAS",
  "1JO": "1JN",
  "2JO": "2JN",
  "3JO": "3JN",
};
for (const [id, dir, prefix, license] of [
  ["OYCB", "yor", "yor", "CC BY-SA 4.0"],
  ["KJV", "kjv", "eng-kjv", "Public domain (UK Crown rights may apply)"],
]) {
  const raw = await readFile(
    "scratch/bible-sources/" + dir + "/" + prefix + "_vpl.txt",
    "utf8"
  );
  const chapters = {};
  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const match = /^(\w+) (\d+):(\d+) (.+)$/.exec(line);
    if (!match) throw new Error("Unsupported verse format: " + line.slice(0, 60));
    const [, sourceBook, chapter, verse, text] = match;
    const book = aliases[sourceBook] ?? sourceBook;
    if (!books.some((b) => b.id === book)) {
      if (id === "KJV") continue; // This application currently exposes the 66-book Protestant canon.
      throw new Error("Unknown book: " + book);
    }
    ((chapters[book] ??= {})[chapter] ??= []).push({
      book,
      chapter: Number(chapter),
      verse: Number(verse),
      text: text.trim(),
    });
  }
  await save(id, chapters, {
    url: "https://ebible.org/Scriptures/" + prefix + "_vpl.zip",
    sha256: createHash("sha256").update(raw).digest("hex"),
    license,
  });
  await copyFile(
    "scratch/bible-sources/" + dir + "/" + prefix + "_about.htm",
    root + "/sources/" + id + "-copyright.htm"
  );
}
await writeFile(`${root}/manifest.json`, JSON.stringify(manifest, null, 2));

async function save(id, chapters, source) {
  await mkdir(`${root}/${id}`, { recursive: true });
  let count = 0,
    verses = 0;
  for (const book of books) {
    const content = chapters[book.id];
    if (!content || Object.keys(content).length !== book.chapters)
      throw new Error(`${id}: missing chapters in ${book.id}`);
    for (const rows of Object.values(content)) {
      if (!rows.length || rows.some((v) => !v.text || !Number.isInteger(v.verse)))
        throw new Error(`${id}: invalid verses`);
      count++;
      verses += rows.length;
    }
    await writeFile(`${root}/${id}/${book.id}.json`, JSON.stringify(content));
  }
  if (count !== 1189 || verses < 30000) throw new Error(`${id}: incomplete corpus`);
  manifest[id] = { books: 66, chapters: count, verses, ...source };
  console.log(`${id}: 66 books, ${count} chapters, ${verses} verses`);
}
