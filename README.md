# Field / Notes

A private publishing desk for a public, GitHub-backed research archive.

The configured content repository is [MuhammadAfridi1/simple-research](https://github.com/MuhammadAfridi1/simple-research).

## How it works

- The public archive is served by the Next.js app.
- `/admin` is the private local publishing desk.
- Publishing commits the PDF to `public/papers/<slug>.pdf` and metadata to `papers/<slug>.json` in GitHub.
- MongoDB is intentionally reserved for lightweight search/index metadata. PDFs and images should stay in GitHub, not the 512 MB database.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Create a GitHub fine-grained token with Contents read/write access only to the archive repository.
3. Set `GITHUB_TOKEN` and a long random `ADMIN_KEY`; the owner and repository are already configured for `MuhammadAfridi1/simple-research`.
4. In one terminal, run `npm run publisher`.
5. In another terminal, run `npm run dev` and open `http://localhost:3000/admin`.

The GitHub token and MongoDB URI must stay in `.env.local`; they are never sent to the browser. The local publisher listens only on `127.0.0.1:8787`, while the Next.js desk runs at `localhost:3000`.

## Storage note

GitHub's regular Contents API rejects files at or above 100 MB. For larger PDFs or media, use Git LFS or object storage and commit only the public URL plus metadata. GitHub repository size and bandwidth limits should also be checked before treating it as a long-term media host.

## GitHub Pages

The workflow in `.github/workflows/deploy-pages.yml` builds the public archive as a static export and deploys it to GitHub Pages on every push to `master`. The expected public URL is:

`https://muhammadafridi1.github.io/simple-research/`

The private publisher is intentionally not deployed to Pages. It stays on your computer so the GitHub token is never exposed publicly.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
