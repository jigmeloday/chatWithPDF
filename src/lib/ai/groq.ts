// Groq chat completions (OpenAI-compatible) with streaming and token usage.
const MODEL = process.env.GROQ_MODEL ?? 'openai/gpt-oss-120b';
const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface TokenUsage {
    inputTokens: number;
    outputTokens: number;
}

// Streams the answer text to `onText` and resolves with the full text and token usage.
export const streamChat = async (
    messages: ChatMessage[],
    onText: (chunk: string) => void
): Promise<{ text: string; usage: TokenUsage }> => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY is not set');

    const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
            model: MODEL,
            messages,
            temperature: 0,
            // gpt-oss models reason before answering; keep it short to save time and tokens.
            ...(MODEL.startsWith('openai/gpt-oss') && { reasoning_effort: 'low' }),
            stream: true,
            stream_options: { include_usage: true },
        }),
        cache: 'no-store',
    });
    if (!res.ok || !res.body) throw new Error(`Groq request failed (${res.status}): ${await res.text()}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let text = '';
    let usage: TokenUsage = { inputTokens: 0, outputTokens: 0 };

    for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            const payload = line.slice(5).trim();
            if (!payload || payload === '[DONE]') continue;

            const json = JSON.parse(payload);
            const delta: string | undefined = json.choices?.[0]?.delta?.content;
            if (delta) {
                text += delta;
                onText(delta);
            }
            const u = json.usage ?? json.x_groq?.usage;
            if (u) usage = { inputTokens: u.prompt_tokens ?? 0, outputTokens: u.completion_tokens ?? 0 };
        }
    }
    return { text, usage };
};

// One-shot completion for background jobs (summaries etc.). Pass `json` to request a JSON object.
export const completeChat = async (messages: ChatMessage[], opts: { json?: boolean } = {}): Promise<{ text: string; usage: TokenUsage }> => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY is not set');

    const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
            model: MODEL,
            messages,
            temperature: 0.2,
            ...(MODEL.startsWith('openai/gpt-oss') && { reasoning_effort: 'low' }),
            ...(opts.json && { response_format: { type: 'json_object' } }),
        }),
        signal: AbortSignal.timeout(60_000),
        cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Groq request failed (${res.status}): ${await res.text()}`);

    const json = await res.json();
    return {
        text: json.choices?.[0]?.message?.content ?? '',
        usage: { inputTokens: json.usage?.prompt_tokens ?? 0, outputTokens: json.usage?.completion_tokens ?? 0 },
    };
};
