import { siteUrl } from '@/lib/stripe';

const json = (schema: object, description: string) => ({ description, content: { 'application/json': { schema } } });
const err = json({ type: 'object', properties: { error: { type: 'string' } } }, 'Error');
const secured = [{ bearerAuth: [] }];
const idParam = [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }];

const usageSchema = {
    type: 'object',
    properties: { input_tokens: { type: 'integer' }, output_tokens: { type: 'integer' }, total_tokens: { type: 'integer' } },
};
const sourceSchema = {
    type: 'object',
    properties: { page: { type: 'integer' }, snippet: { type: 'string', description: 'Start of the passage the answer used' } },
};

const spec = () => ({
    openapi: '3.0.3',
    info: {
        title: 'Otterly API',
        version: '1.1.0',
        description:
            "Upload PDFs and ask questions about them. Calls count against your plan's token and document limits. 60 requests per minute per account; every response carries X-RateLimit-Limit and X-RateLimit-Remaining headers.",
    },
    servers: [{ url: siteUrl() }],
    components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', description: 'API key starting with dc_live_' } } },
    paths: {
        '/api/v1/documents': {
            get: {
                summary: 'List documents',
                security: secured,
                responses: {
                    200: json(
                        { type: 'object', properties: { data: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' }, status: { type: 'string', enum: ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED'] }, error: { type: 'string', nullable: true }, createdAt: { type: 'string', format: 'date-time' } } } } } },
                        'Your documents, newest first'
                    ),
                    401: err,
                },
            },
            post: {
                summary: 'Upload a PDF',
                description: 'Processing is asynchronous. Poll GET /api/v1/documents/{id} until status is SUCCESS.',
                security: secured,
                requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', required: ['file'], properties: { file: { type: 'string', format: 'binary', description: 'PDF up to 4MB' } } } } } },
                responses: { 202: { description: 'Accepted' }, 400: err, 401: err, 403: err, 413: err, 415: err, 429: err },
            },
        },
        '/api/v1/documents/{id}': {
            get: { summary: 'Get a document', description: 'Status, failure reason, number of indexed passages and stored messages.', security: secured, parameters: idParam, responses: { 200: { description: 'Document' }, 401: err, 404: err } },
            delete: { summary: 'Delete a document', description: 'Removes the file, its index and its conversation.', security: secured, parameters: idParam, responses: { 204: { description: 'Deleted' }, 401: err, 404: err } },
        },
        '/api/v1/documents/{id}/messages': {
            get: { summary: 'Get the conversation', description: 'Stored questions and answers, oldest first.', security: secured, parameters: idParam, responses: { 200: { description: 'Messages' }, 401: err, 404: err } },
            delete: { summary: 'Clear the conversation', description: 'The next question starts fresh.', security: secured, parameters: idParam, responses: { 204: { description: 'Cleared' }, 401: err, 404: err } },
        },
        '/api/v1/usage': {
            get: { summary: 'Current plan usage', security: secured, responses: { 200: { description: 'Tokens, documents and days left' }, 401: err } },
        },
        '/api/v1/chat': {
            post: {
                summary: 'Ask a question about a document',
                description:
                    'Returns the answer, the passages it came from and token usage. Set `stream: true` for server-sent events: repeated `delta` events with `{ text }`, then one `done` event with the full result (or an `error` event).',
                security: secured,
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['document_id', 'message'],
                                properties: {
                                    document_id: { type: 'string' },
                                    message: { type: 'string', maxLength: 4000 },
                                    stream: { type: 'boolean', default: false, description: 'Stream the answer as server-sent events' },
                                    history: { type: 'boolean', default: true, description: 'Use earlier messages in this document as context' },
                                    store: { type: 'boolean', default: true, description: 'Save this exchange to the document conversation. Tokens still count toward your plan.' },
                                    max_sources: { type: 'integer', minimum: 1, maximum: 10, default: 5, description: 'How many passages to retrieve' },
                                    instructions: { type: 'string', maxLength: 500, description: 'Extra instructions, e.g. tone, language or output format' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: json(
                        { type: 'object', properties: { answer: { type: 'string' }, sources: { type: 'array', items: sourceSchema }, usage: usageSchema } },
                        'The answer'
                    ),
                    400: err, 401: err, 404: err, 409: err, 429: err, 502: err,
                },
            },
        },
    },
});

export const GET = () => Response.json(spec());
