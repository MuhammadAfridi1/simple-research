import Link from "next/link";

const papers: Record<string, { title: string; description: string; year: string; type: string }> = {
  "questions-worth-keeping": { title: "A field guide to questions worth keeping", description: "Working notes on collecting, comparing, and returning to good questions.", year: "2026", type: "Essay" },
  "shape-of-a-careful-archive": { title: "The shape of a careful archive", description: "A short study of how context changes what survives in a personal library.", year: "2025", type: "Research note" },
};

export function generateStaticParams() {
  return Object.keys(papers).map((slug) => ({ slug }));
}

export default async function PaperPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const paper = papers[slug] || { title: slug.replaceAll("-", " "), description: "Published research paper.", year: "", type: "Paper" };
  return (
    <main className="reader-shell">
      <header className="site-header"><Link className="wordmark" href="/">FIELD / NOTES</Link><Link className="back-link" href="/">← All papers</Link></header>
      <section className="reader-heading"><p className="eyebrow">{paper.type} / {paper.year}</p><h1>{paper.title}</h1><p>{paper.description}</p></section>
      <section className="pdf-frame"><object data={`/papers/${slug}.pdf`} type="application/pdf" aria-label={`PDF of ${paper.title}`}><p>This paper is available as a PDF. <a href={`/papers/${slug}.pdf`}>Open the document</a>.</p></object></section>
    </main>
  );
}