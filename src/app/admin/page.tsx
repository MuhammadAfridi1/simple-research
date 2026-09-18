"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function AdminPage() {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("Publishing to GitHub...");
    const form = new FormData(event.currentTarget);
    try {
      const publisherApi = process.env.NEXT_PUBLIC_PUBLISH_API || "http://localhost:8787/api/publish";
      const response = await fetch(publisherApi, { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Publishing failed");
      setStatus(`Published. Commit: ${result.commit}`);
      event.currentTarget.reset();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Publishing failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-shell">
      <div className="admin-top"><Link href="/" className="wordmark">FIELD / NOTES</Link><span className="admin-badge">PRIVATE DESK</span></div>
      <div className="admin-intro"><p className="eyebrow">New publication</p><h1>Add a paper<br /><em>to the archive.</em></h1><p>Upload the PDF and its context. The server will commit both to the configured GitHub repository.</p></div>
      <form className="publish-form" onSubmit={publish}>
        <label>Paper title<input name="title" required placeholder="A title with room to breathe" /></label>
        <div className="form-grid"><label>Year<input name="year" required inputMode="numeric" placeholder="2026" /></label><label>Type<input name="type" required placeholder="Research note" /></label></div>
        <label>Short description<textarea name="description" required rows={4} placeholder="What is this paper about?" /></label>
        <label>PDF document<input name="pdf" required type="file" accept="application/pdf" /></label>
        <label>Admin key<input name="adminKey" required type="password" autoComplete="off" placeholder="From ADMIN_KEY in .env.local" /></label>
        <button className="publish-button" disabled={busy} type="submit">{busy ? "Publishing..." : "Publish paper ↗"}</button>
        <p className="form-status" aria-live="polite">{status}</p>
      </form>
    </main>
  );
}