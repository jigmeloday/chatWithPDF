import { siteUrl } from '@/lib/stripe';

const error = { description: 'Error', content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' } } } } } };
const secured = [{ bearerAuth: [] }];

const spec = () => ({
    openapi: '3.0.3',
    info: { title: 'Otterly API', version: '1.0.0', description: 'Upload PDFs and ask questions about them. Calls count against your plan\'s token and document limits. 60 requests per minute per account.' },
    servers: [{ url: siteUrl() }],
    components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', description: 'API key starting with dc_live_' } } },
    paths: {
        '/api/v1/documents': {
            get: {
                summary: 'List documents',
                security: secured,
                responses: {
                    200: { description: 'Your documents, newest first', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' }, status: { type: 'string', enum: ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED'] }, createdAt: { type: 'string', format: 'date-time' } } } } } } } } },
                    401: error,
                },
            },
            post: {
                summary: 'Upload a PDF',
                description: 'Processing is asynchronous. Poll GET /api/v1/documents until status is SUCCESS.',
                security: secured,
                requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', required: ['file'], properties: { file: { type: 'string', format: 'binary', description: 'PDF up to 4MB' } } } } } },
                responses: { 202: { description: 'Accepted' }, 400: error, 401: error, 403: error, 413: error, 415: error, 429: error },
            },
        },
        '/api/v1/usage': {
            get: { summary: 'Current plan usage', security: secured, responses: { 200: { description: 'Tokens, documents and days left' }, 401: error } },
        },
        '/api/v1/chat': {
            post: {
                summary: 'Ask a question about a document',
                security: secured,
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['document_id', 'message'], properties: { document_id: { type: 'string' }, message: { type: 'string' } } } } } },
                responses: {
                    200: { description: 'The answer and tokens used', content: { 'application/json': { schema: { type: 'object', properties: { answer: { type: 'string' }, usage: { type: 'object', properties: { input_tokens: { type: 'integer' }, output_tokens: { type: 'integer' } } } } } } } },
                    401: error, 404: error, 409: error, 429: error, 502: error,
                },
            },
        },
    },
});

export const GET = () => Response.json(spec());
