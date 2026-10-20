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

export interface ChunkHit {
    fileId: string;
    name: string;
    page: number;
    content: string;
    score: number;
}

// Closest passages across ALL of a user's ready documents.
export const searchUserChunks = (userId: string, embedding: number[], limit = 12) =>
    db.$queryRaw<ChunkHit[]>`
        select c."fileId" as "fileId", f.name as name, c.page as page, c.content as content,
               (1 - (c.embedding <=> ${toVector(embedding)}::vector))::float8 as score
        from "DocumentChunk" c
        join "File" f on f.id = c."fileId"
        where f."userId" = ${userId} and f."uploadStatus" = 'SUCCESS'
        order by c.embedding <=> ${toVector(embedding)}::vector
        limit ${limit}`;

// Closest passages within a chosen set of documents (already checked to belong to the user).
export const searchChunksIn = (fileIds: string[], embedding: number[], limit = 8) =>
    db.$queryRaw<ChunkHit[]>`
        select c."fileId" as "fileId", f.name as name, c.page as page, c.content as content,
               (1 - (c.embedding <=> ${toVector(embedding)}::vector))::float8 as score
        from "DocumentChunk" c
        join "File" f on f.id = c."fileId"
        where c."fileId" = any(${fileIds}::text[])
        order by c.embedding <=> ${toVector(embedding)}::vector
        limit ${limit}`;
