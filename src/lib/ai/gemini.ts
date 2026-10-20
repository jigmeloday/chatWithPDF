// Gemini embeddings over REST (free tier). Vectors are 768-d to match the DocumentChunk column.
const MODEL = process.env.GEMINI_EMBEDDING_MODEL ?? 'gemini-embedding-001';
const DIMENSIONS = 768;
const BATCH_SIZE = 50;
const API = 'https://generativelanguage.googleapis.com/v1beta';

type TaskType = 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const embedBatch = async (texts: string[], taskType: TaskType, attempt = 0): Promise<number[][]> => {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error('GOOGLE_API_KEY is not set');

    const res = await fetch(`${API}/models/${MODEL}:batchEmbedContents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        signal: AbortSignal.timeout(60_000),
        cache: 'no-store',
        body: JSON.stringify({
            requests: texts.map((text) => ({
                model: `models/${MODEL}`,
                content: { parts: [{ text }] },
                taskType,
                outputDimensionality: DIMENSIONS,
            })),
        }),
    });

    // Free tier is rate limited; back off and retry.
    if (res.status === 429 && attempt < 4) {
        await sleep(2000 * 2 ** attempt);
        return embedBatch(texts, taskType, attempt + 1);
    }
    if (!res.ok) throw new Error(`Gemini embeddings failed (${res.status}): ${await res.text()}`);

    const json = (await res.json()) as { embeddings: { values: number[] }[] };
    return json.embeddings.map((e) => normalize(e.values));
};

// Truncated (non-3072) embeddings are not unit length, so normalize for cosine search.
const normalize = (v: number[]) => {
    const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
    return v.map((x) => x / norm);
};

export const embedTexts = async (texts: string[], taskType: TaskType = 'RETRIEVAL_DOCUMENT') => {
    const out: number[][] = [];
    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
        out.push(...(await embedBatch(texts.slice(i, i + BATCH_SIZE), taskType)));
    }
    return out;
};

export const embedQuery = async (text: string) => (await embedTexts([text], 'RETRIEVAL_QUERY'))[0];

const OCR_MODEL = process.env.GEMINI_OCR_MODEL ?? 'gemini-flash-lite-latest';

export interface PageText {
    page: number;
    text: string;
}

// Reads a scanned or image-only PDF with Gemini's vision and returns the text of each page.
export const ocrPdf = async (pdf: Buffer): Promise<PageText[]> => {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error('GOOGLE_API_KEY is not set');

    const res = await fetch(`${API}/models/${OCR_MODEL}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        signal: AbortSignal.timeout(240_000),
        cache: 'no-store',
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        { inline_data: { mime_type: 'application/pdf', data: pdf.toString('base64') } },
                        {
                            text:
                                'Transcribe all text in this PDF exactly as written, in reading order. ' +
                                'Begin each page with a line of the form "=== Page N ===". ' +
                                'Do not summarize, translate or add commentary. If a page has no text, output only its marker.',
                        },
                    ],
                },
            ],
            generationConfig: { temperature: 0 },
        }),
    });
    if (!res.ok) throw new Error(`Gemini OCR failed (${res.status}): ${await res.text()}`);

    const json = await res.json();
    const text: string = json.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';

    const pages: PageText[] = [];
    const parts = text.split(/^=== Page (\d+) ===\s*$/m);
    // split() with a capture group yields [preamble, "1", text1, "2", text2, ...]
    for (let i = 1; i < parts.length; i += 2) pages.push({ page: Number(parts[i]), text: parts[i + 1].trim() });

    // The model ignored the markers: treat everything as one page rather than losing the text.
    if (!pages.length && text.trim()) pages.push({ page: 1, text: text.trim() });
    return pages;
};
