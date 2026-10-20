# DocuChatty

Chat with your PDFs. Upload a document, ask questions in plain language, and get answers with page citations. Sold as a subscription with a monthly token allowance, plus an API.

## Stack

- **Next.js 14** (App Router), **TypeScript**, **Tailwind CSS**
- **Better Auth**: email and password sign-in
- **Prisma** + **PostgreSQL** with **pgvector** for vector search
- **tRPC**: type-safe app APIs
- **Gemini** (`gemini-embedding-001`): embeddings
- **Groq** (`openai/gpt-oss-120b`): answer generation
- **Local disk storage** for PDFs (swap `src/lib/storage.ts` for S3/R2 in production)

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Make sure PostgreSQL has the [pgvector](https://github.com/pgvector/pgvector) extension available, then create a database.

3. Create `.env.local`:

   ```
   DATABASE_URL="postgresql://user@localhost:5432/chatwithpdf"
   BETTER_AUTH_SECRET=<openssl rand -base64 32>
   BETTER_AUTH_URL=http://localhost:3000
   GOOGLE_API_KEY=<from aistudio.google.com>
   GROQ_API_KEY=<from console.groq.com>
   ```

   Optional: `STRIPE_SECRET_KEY`, `STRIPE_PRO_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` (billing) and `RESEND_API_KEY`, `EMAIL_FROM` (emails; without them, links are printed to the server console).

4. Apply migrations (the Prisma CLI reads `.env`, so pass the URL inline or copy it there):

   ```bash
   DATABASE_URL=... npx prisma migrate deploy
   ```

5. Start the dev server:

   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev`: start the dev server
- `npm test`: run unit tests
- `npm run build`: production build

## How it works

```
Upload:  PDF → split into chunks → Gemini embeds them → stored in pgvector
Ask:     question → Gemini embeds it → pgvector finds top chunks → Groq writes the answer
```

Token usage from Groq is saved on every answer and drives the plan limits shown on the dashboard.

## Public API

Create a key under **API** in the dashboard and send it as `Authorization: Bearer dc_live_...`.

- `GET /api/v1/documents`
- `GET /api/v1/usage`
- `POST /api/v1/documents` (multipart `file`) to upload a PDF
- `GET /api/v1/openapi.json` for the full spec
- `POST /api/v1/chat` with `{ "document_id": "...", "message": "..." }`

## Learn more

- [Better Auth](https://www.better-auth.com/docs)
- [pgvector](https://github.com/pgvector/pgvector)
- [Gemini API](https://ai.google.dev/gemini-api/docs/embeddings)
- [Groq](https://console.groq.com/docs)
- [Prisma](https://www.prisma.io/docs) · [tRPC](https://trpc.io/docs)
