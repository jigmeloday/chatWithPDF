import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { db } from '@/db';
import { embedTexts } from '@/lib/ai/gemini';
import { storage } from '@/lib/storage';
import { addChunks } from '@/lib/vector-store';

// Reads the stored PDF, embeds it into pgvector and updates the file's status.
export const processDocument = async (fileId: string, key: string) => {
    try {
        const data = await storage.read(key);
        const pages = await new PDFLoader(new Blob([new Uint8Array(data)])).load();

        const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 150 });
        const docs = (await splitter.splitDocuments(pages)).filter((d) => d.pageContent.trim());
        if (!docs.length) throw new Error('No extractable text (scanned PDF?)');

        const embeddings = await embedTexts(docs.map((d) => d.pageContent));
        await addChunks(
            fileId,
            docs.map((d, i) => ({
                page: d.metadata?.loc?.pageNumber ?? 1,
                content: d.pageContent,
                embedding: embeddings[i],
            }))
        );
        await db.file.update({ where: { id: fileId }, data: { uploadStatus: 'SUCCESS' } });
    } catch (err) {
        console.error(`Processing failed for file ${fileId}:`, err);
        await db.file.update({ where: { id: fileId }, data: { uploadStatus: 'FAILED' } });
    }
};
