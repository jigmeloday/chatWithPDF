import { db } from '@/db';
import { ANSWER_STYLES } from '@/config/preferences';

const STYLE_TEXT: Record<(typeof ANSWER_STYLES)[number], string> = {
    concise: 'Keep answers short: one to three sentences unless the user asks for more.',
    balanced: '',
    detailed: 'Give thorough, well-structured answers with headings or bullets where they help.',
};

// The account's answer style and language, phrased as extra instructions for the model.
export const preferenceInstructions = async (userId: string) => {
    const u = await db.user.findUnique({ where: { id: userId }, select: { answerStyle: true, answerLanguage: true } });
    if (!u) return '';
    const parts = [STYLE_TEXT[u.answerStyle as keyof typeof STYLE_TEXT] ?? ''];
    if (u.answerLanguage && u.answerLanguage !== 'auto') parts.push(`Always answer in ${u.answerLanguage}, even if the question or document is in another language.`);
    return parts.filter(Boolean).join(' ');
};
