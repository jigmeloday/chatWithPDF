import { db } from '@/db'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import {
    createUploadthing,
    type FileRouter,
} from 'uploadthing/next'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { OpenAIEmbeddings } from '@langchain/openai'
import { getPineconeClient } from '@/lib/pinecone'
import { PineconeStore } from '@langchain/pinecone'

import { getUserSubscriptionPlan } from '@/lib/stripe'
import { PLANS } from '@/config/stripe'
import { UploadThingError } from '@uploadthing/shared';

const f = createUploadthing();

export const ourFileRouter = {
    pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
        .middleware(async ({ req }) => {
            const { getUser } = getKindeServerSession();
            const user = await getUser();
            if ( !user || !user.id ) throw new Error('Unauthorized')

            return { userId: user.id }
        })
        .onUploadComplete(async ({ metadata, file }) => {
            const createdFile = await db.file.create({
                data: {
                    key: file.key,
                    name: file.name,
                    userId: metadata.userId,
                    url: `https://utfs.io/f/${file.key}`,
                    uploadStatus: 'PROCESSING',
                }
            })
            try {
                const response = await fetch(`https://utfs.io/f/${file.key}`)
                console.log('helllllllooooooooo')
                const blob = await response.blob();
                const loader = new PDFLoader(blob)
                const pageLevelDocs = await loader.load()
                const pagesAmt = pageLevelDocs.length
                const pinecone = await getPineconeClient()
                const pineconeIndex = pinecone.Index('docuchatty');
                const embeddings = new OpenAIEmbeddings({
                    openAIApiKey: process.env.OPENAI_API_KEY
                })
                console.log('uploading')
                await PineconeStore.fromDocuments(
                    pageLevelDocs,
                    embeddings,
                    {
                        pineconeIndex,
                        namespace: createdFile.id,
                    })
                console.log("Updating database status to SUCCESS");

                await db.file.update({
                    data: {
                        uploadStatus: 'SUCCESS',
                    },
                    where: {
                        id: createdFile.id,
                    },
                })
            } catch ( err ) {
                console.error("Error occurred:", err);
                await db.file.update({
                    data: {
                        uploadStatus: 'FAILED',
                    },
                    where: {
                        id: createdFile.id,
                    },
                })
            }
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
