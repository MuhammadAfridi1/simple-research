import Link from "next/link";
import { getPapers } from "@/lib/papers";

export default async function Home() {
  const papers = await getPapers();
  return (
    <main>
      <header className="site-header shell">
        <Link className="wordmark" href="/">FIELD / NOTES</Link>
        <nav><a href="#collection">Collection</a><a href="#about">About</a><Link className="admin-link" href="/admin">Private desk</Link></nav>
      </header>

      <section className="hero shell">
        <p className="eyebrow">A personal research library <span>•</span> Est. 2026</p>
        <h1>Ideas, kept<br /><em>in context.</em></h1>
        <div className="hero-bottom">
          <p>A quiet home for papers, fragments, and the questions that refuse to leave. Browse the public collection below.</p>
          <span className="scroll-mark">↓ 01 — 02</span>
        </div>
      </section>

      <section className="collection shell" id="collection">
        <div className="section-heading"><p className="eyebrow">Selected work</p><p className="muted">{papers.length} papers in the public index</p></div>
        <div className="paper-list">
          {papers.map((paper, index) => (
            <article className="paper-row" key={paper.slug}>
              <span className="paper-number">0{index + 1}</span>
              <div className="paper-copy"><p className="paper-type">{paper.type} / {paper.year}</p><h2>{paper.title}</h2><p>{paper.description}</p></div>
              <Link className="read-link" href={`/papers/${paper.slug}`}>Read paper <span>↗</span></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="about-band" id="about"><div className="shell about-grid"><p className="eyebrow">Archive note</p><p>This library is intentionally small in its machinery. Documents and images live in a versioned GitHub repository; MongoDB stores only the searchable index and lightweight notes.</p><Link href="/admin" className="text-link">Open the private desk ↗</Link></div></section>
      <footer className="site-footer shell"><span>FIELD / NOTES</span><span>Private research archive</span><span>© 2026</span></footer>
    </main>
  );
}
