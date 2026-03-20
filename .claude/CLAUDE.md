We are going to analyze this tool for pdf2md process.

The below is summury of the ripository.

## Commands

```bash
npm run dev          # Dev server with Turbopack
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint (next.js core-web-vitals + TypeScript)
npm run test         # Jest unit tests
npm run test:watch   # Jest watch mode
npm run test:integration  # Integration tests from __tests__/integration/
```

## Architecture

Next.js 15 app (TypeScript, React 19, TailwindCSS 4) that converts PDFs to Markdown using Mistral AI OCR. Deployed on Vercel.

### Request Flow

1. `middleware.ts` detects browser language from `Accept-Language` header, redirects `/` to `/{lang}` (13 languages)
2. `app/[lang]/page.tsx` renders the FileUploader (client component)
3. User uploads PDF → server action `app/action/mistral.ts` uploads to S3, gets signed URL, calls Mistral OCR, deletes from S3
4. Image uploads skip S3 — sent directly as base64 to Mistral
5. Results displayed as rendered markdown with KaTeX math support, exportable as ZIP or markdown

### Key Directories

- `app/[lang]/` — Dynamic language route (layout.tsx handles SEO metadata/hreflang, page.tsx renders uploader)
- `app/action/` — Server actions: `mistral.ts` (OCR), `s3.ts` (AWS S3 ops), `downloadHelper.ts` (ZIP export)
- `app/components/` — UI: FileUploader, Header (tabs/copy/download), OcrResultView (markdown preview), Footer
- `app/lib/` — `i18n.ts` (13-language translations, ~80+ keys), `metadata.ts` (per-language SEO metadata with JSON-LD)
- `analyze/` — Directory of analyze results. If you done new analyzing task, you will make md file in this repo.

### i18n

Path-based routing (`/en`, `/ja`, `/ko`, etc.) with 13 languages. The `Language` type and all translations live in `app/lib/i18n.ts`. Middleware handles detection and legacy query-param redirects (`?lang=en` → `/en`). Static params generated for all languages via `generateStaticParams()`.

### External Services

- **Mistral AI** (`mistral-ocr-latest` model) — OCR processing
- **AWS S3** — Temporary PDF storage (uploaded, signed URL created for Mistral, then deleted)
- **Vercel** — Hosting, analytics (`@vercel/analytics`)

### Environment Variables

```
MISTRAL_API_KEY, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET_NAME
```

## Configuration Notes

- `next.config.ts`: Server action body size limit set to 20MB for PDF uploads
- `tsconfig.json`: Path alias `@/*` maps to project root
- Tests use `jest.setup.js` which loads `.env.local`
- Note: README mentions Vercel Blob but the codebase has migrated to AWS S3
