import { createServer } from "node:http";
import Busboy from "busboy";
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

const port = Number(process.env.PUBLISHER_PORT || 8787);
const maxFileSize = 90 * 1024 * 1024;

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

function send(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "http://localhost:3000", "Access-Control-Allow-Headers": "content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" });
  response.end(JSON.stringify(body));
}

function readMultipart(request) {
  return new Promise((resolve, reject) => {
    const fields = {};
    let file = null;
    const parser = Busboy({ headers: request.headers, limits: { fileSize: maxFileSize, files: 1 } });
    parser.on("field", (name, value) => { fields[name] = value; });
    parser.on("file", (name, stream, info) => {
      const chunks = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("limit", () => reject(new Error("GitHub's regular Contents API supports files below 100 MB.")));
      stream.on("end", () => { file = { name, filename: info.filename, mimeType: info.mimeType, buffer: Buffer.concat(chunks) }; });
    });
    parser.on("finish", () => resolve({ fields, file }));
    parser.on("error", reject);
    request.pipe(parser);
  });
}

async function publish(request, response) {
  if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_OWNER || !process.env.GITHUB_REPO || !process.env.ADMIN_KEY) return send(response, 503, { error: "GitHub publishing is not configured. Copy .env.example to .env.local first." });
  try {
    const { fields, file } = await readMultipart(request);
    const title = (fields.title || "").trim();
    const description = (fields.description || "").trim();
    const year = (fields.year || "").trim();
    const type = (fields.type || "").trim();
    if (fields.adminKey !== process.env.ADMIN_KEY) return send(response, 401, { error: "Invalid admin key." });
    if (!title || !description || !year || !type || !file || file.mimeType !== "application/pdf") return send(response, 400, { error: "Title, paper metadata, and a PDF are required." });
    const slug = slugify(title);
    const metadata = JSON.stringify({ title, description, year, type, slug, pdf: `/papers/${slug}.pdf` }, null, 2);
    const api = `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents`;
    const headers = { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json" };
    const commitMessage = `Publish paper: ${title}`;
    const pdfResponse = await fetch(`${api}/public/papers/${slug}.pdf`, { method: "PUT", headers, body: JSON.stringify({ message: commitMessage, content: file.buffer.toString("base64") }) });
    if (!pdfResponse.ok) throw new Error(`PDF commit failed (${pdfResponse.status})`);
    const metadataResponse = await fetch(`${api}/papers/${slug}.json`, { method: "PUT", headers, body: JSON.stringify({ message: commitMessage, content: Buffer.from(metadata).toString("base64") }) });
    if (!metadataResponse.ok) throw new Error(`Metadata commit failed (${metadataResponse.status})`);
    const result = await metadataResponse.json();
    return send(response, 200, { commit: result.commit?.sha?.slice(0, 7) || "complete", slug });
  } catch (error) {
    return send(response, 502, { error: error instanceof Error ? error.message : "GitHub publishing failed." });
  }
}

createServer((request, response) => {
  if (request.method === "OPTIONS") return send(response, 204, {});
  if (request.method === "POST" && request.url === "/api/publish") return publish(request, response);
  return send(response, 404, { error: "Not found." });
}).listen(port, "127.0.0.1", () => {
  const configured = Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_OWNER && process.env.GITHUB_REPO && process.env.ADMIN_KEY);
  console.log(`Private publisher listening on http://localhost:${port}`);
  if (!configured) console.log("Missing configuration. Create .env.local from .env.example and add GITHUB_TOKEN and ADMIN_KEY.");
});