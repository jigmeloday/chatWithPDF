import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { db } from '@/db';
import { PLANS } from '@/config/plans';
import { PageText, embedTexts, ocrPdf } from '@/lib/ai/gemini';
import { generateInsights } from '@/lib/insights';
import { storage } from '@/lib/storage';
import { emitWebhookEvent } from '@/lib/webhooks';
import { getUsageSummary } from '@/lib/usage';
import { addChunks } from '@/lib/vector-store';

class UserFacingError extends Error {}

// A PDF whose pages hold almost no text is a scan, so it needs OCR.
const MIN_CHARS_PER_PAGE = 20;

const readTextLayer = async (data: Buffer): Promise<{ pages: PageText[]; totalPages: number }> => {
    const docs = await new PDFLoader(new Blob([new Uint8Array(data)])).load();
    const totalPages = docs[0]?.metadata?.pdf?.totalPages ?? docs.length;
    return {
        totalPages,
        pages: docs.map((d) => ({ page: d.metadata?.loc?.pageNumber ?? 1, text: d.pageContent })),
    };
};

// Reads the stored PDF (with OCR for scans), embeds it into pgvector, writes insights and updates the file's status.
export const processDocument = async (fileId: string, key: string) => {
    const step = (name: string) => console.log(`[process ${fileId.slice(0, 8)}] ${name}`);
    try {
        step('start');
        const data = await storage.read(key);
        const file = await db.file.findUniqueOrThrow({ where: { id: fileId } });
        const plan = file.userId ? (await getUsageSummary(file.userId)).plan : PLANS.free;

        step('reading text layer');
        let { pages, totalPages } = await readTextLayer(data);
        step(`text layer: ${totalPages} pages`);
        const chars = pages.reduce((n, p) => n + p.text.trim().length, 0);

        // Check the page limit before spending OCR on a document that would be rejected anyway.
        if (totalPages > plan.maxPagesPerDocument)
            throw new UserFacingError(`This PDF has ${totalPages} pages. The ${plan.name} plan supports up to ${plan.maxPagesPerDocument}.`);

        let usedOcr = false;
        if (chars < MIN_CHARS_PER_PAGE * Math.max(totalPages, 1)) {
            step('running OCR');
            pages = await ocrPdf(data);
            step(`OCR done: ${pages.length} pages`);
            usedOcr = true;
            if (pages.length > plan.maxPagesPerDocument)
                throw new UserFacingError(`This PDF has ${pages.length} pages. The ${plan.name} plan supports up to ${plan.maxPagesPerDocument}.`);
        }

        const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 150 });
        const pieces: { page: number; content: string }[] = [];
        for (const p of pages) {
            if (!p.text.trim()) continue;
            for (const content of await splitter.splitText(p.text)) if (content.trim()) pieces.push({ page: p.page, content });
        }
        if (!pieces.length) throw new UserFacingError('No readable text found in this PDF.');

        step(`embedding ${pieces.length} chunks`);
        const embeddings = await embedTexts(pieces.map((p) => p.content));
        await addChunks(fileId, pieces.map((p, i) => ({ ...p, embedding: embeddings[i] })));

        step('generating insights');
        const insights = await generateInsights(pages.map((p) => p.text).join('\n\n')).catch((err) => {
            console.error(`Insights failed for file ${fileId}:`, err);
            return null;
        });

        step('done');
        await db.file.update({
            where: { id: fileId },
            data: {
                uploadStatus: 'SUCCESS',
                failureReason: null,
                usedOcr,
                summary: insights?.summary ?? null,
                keyPoints: insights?.keyPoints ?? undefined,
                suggestions: insights?.suggestions ?? undefined,
            },
        });
        if (file.userId)
            void emitWebhookEvent(file.userId, 'document.ready', {
                document: { id: fileId, name: file.name, status: 'SUCCESS', pages: pages.length, usedOcr, summary: insights?.summary ?? null },
            });
    } catch (err) {
        console.error(`Processing failed for file ${fileId}:`, err);
        const reason = err instanceof UserFacingError ? err.message : 'Processing failed. Please try again.';
        const failed = await db.file.update({ where: { id: fileId }, data: { uploadStatus: 'FAILED', failureReason: reason } });
        if (failed.userId)
            void emitWebhookEvent(failed.userId, 'document.failed', { document: { id: fileId, name: failed.name, status: 'FAILED', error: reason } });
    }
};
