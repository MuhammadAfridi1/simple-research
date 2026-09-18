import { NextResponse } from "next/server";

const MAX_FILE_SIZE = 90 * 1024 * 1024;

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

export async function POST(request: Request) {
  if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_OWNER || !process.env.GITHUB_REPO || !process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "GitHub publishing is not configured. Copy .env.example to .env.local first." }, { status: 503 });
  }
  const origin = request.headers.get("origin") || "";
  if (!process.env.ALLOW_REMOTE_ADMIN && origin && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return NextResponse.json({ error: "The publishing desk is local-only." }, { status: 403 });
  }

  const form = await request.formData();
  if (form.get("adminKey") !== process.env.ADMIN_KEY) return NextResponse.json({ error: "Invalid admin key." }, { status: 401 });
  const title = String(form.get("title") || "").trim();
  const description = String(form.get("description") || "").trim();
  const year = String(form.get("year") || "").trim();
  const type = String(form.get("type") || "").trim();
  const pdf = form.get("pdf");
  if (!title || !description || !year || !type || !(pdf instanceof File) || pdf.type !== "application/pdf") return NextResponse.json({ error: "Title, metadata, and a PDF are required." }, { status: 400 });
  if (pdf.size > MAX_FILE_SIZE) return NextResponse.json({ error: "GitHub's regular Contents API supports files below 100 MB; this upload is too large." }, { status: 413 });

  const slug = slugify(title);
  const metadata = JSON.stringify({ title, description, year, type, slug, pdf: `/papers/${slug}.pdf` }, null, 2);
  const pdfBase64 = Buffer.from(await pdf.arrayBuffer()).toString("base64");
  const api = `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents`;
  const headers = { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json" };

  try {
    const commitMessage = `Publish paper: ${title}`;
    const pdfResponse = await fetch(`${api}/public/papers/${slug}.pdf`, { method: "PUT", headers, body: JSON.stringify({ message: commitMessage, content: pdfBase64 }) });
    if (!pdfResponse.ok) throw new Error(`PDF commit failed (${pdfResponse.status})`);
    const metadataResponse = await fetch(`${api}/content/papers/${slug}.json`, { method: "PUT", headers, body: JSON.stringify({ message: commitMessage, content: Buffer.from(metadata).toString("base64") }) });
    if (!metadataResponse.ok) throw new Error(`Metadata commit failed (${metadataResponse.status})`);
    const result = await metadataResponse.json();
    return NextResponse.json({ commit: result.commit?.sha?.slice(0, 7) || "complete", slug });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "GitHub publishing failed." }, { status: 502 });
  }
}