import { db } from '@/db';

export interface Chunk {
    page: number;
    content: string;
    embedding: number[];
}

// pgvector expects a "[0.1,0.2,...]" literal.
const toVector = (v: number[]) => `[${v.join(',')}]`;

export const addChunks = async (fileId: string, chunks: Chunk[]) => {
    await db.$transaction(
        chunks.map(
            (c) => db.$executeRaw`
                insert into "DocumentChunk" (id, "fileId", page, content, embedding)
                values (gen_random_uuid()::text, ${fileId}, ${c.page}, ${c.content}, ${toVector(c.embedding)}::vector)`
        )
    );
};

export const searchChunks = (fileId: string, embedding: number[], limit = 5) =>
    db.$queryRaw<{ page: number; content: string }[]>`
        select page, content
        from "DocumentChunk"
        where "fileId" = ${fileId}
        order by embedding <=> ${toVector(embedding)}::vector
        limit ${limit}`;
