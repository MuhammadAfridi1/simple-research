import { promises as fs } from "node:fs";
import path from "node:path";

export type Paper = { title: string; description: string; year: string; type: string; slug: string };

const fallbackPapers: Paper[] = [
  { title: "A field guide to questions worth keeping", description: "Working notes on collecting, comparing, and returning to good questions.", year: "2026", type: "Essay", slug: "questions-worth-keeping" },
  { title: "The shape of a careful archive", description: "A short study of how context changes what survives in a personal library.", year: "2025", type: "Research note", slug: "shape-of-a-careful-archive" },
];

export async function getPapers() {
  const directory = path.join(process.cwd(), "papers");
  try {
    const files = (await fs.readdir(directory)).filter((file) => file.endsWith(".json"));
    const loaded = await Promise.all(files.map(async (file) => JSON.parse(await fs.readFile(path.join(directory, file), "utf8")) as Paper));
    return loaded.sort((first, second) => second.year.localeCompare(first.year));
  } catch {
    return fallbackPapers;
  }
}

export async function getPaper(slug: string) {
  return (await getPapers()).find((paper) => paper.slug === slug) || { title: slug.replaceAll("-", " "), description: "Published research paper.", year: "", type: "Paper", slug };
}