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
