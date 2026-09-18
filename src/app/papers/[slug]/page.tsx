import Link from "next/link";
import { getPaper, getPapers } from "@/lib/papers";

export async function generateStaticParams() {
  return (await getPapers()).map((paper) => ({ slug: paper.slug }));
}

export default async function PaperPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const paper = await getPaper(slug);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return (
    <main className="reader-shell">
      <header className="site-header"><Link className="wordmark" href="/">FIELD / NOTES</Link><Link className="back-link" href="/">← All papers</Link></header>
      <section className="reader-heading"><p className="eyebrow">{paper.type} / {paper.year}</p><h1>{paper.title}</h1><p>{paper.description}</p></section>
      <section className="pdf-frame"><object data={`${basePath}/papers/${slug}.pdf`} type="application/pdf" aria-label={`PDF of ${paper.title}`}><p>This paper is available as a PDF. <a href={`${basePath}/papers/${slug}.pdf`}>Open the document</a>.</p></object></section>
    </main>
  );
}