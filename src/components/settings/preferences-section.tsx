'use client';
import { FormEvent, useEffect, useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { trpc } from '@/app/_trpc/client';
import { useToast } from '@/hooks/use-toast';
import { ANSWER_LANGUAGES, ANSWER_STYLES } from '@/config/preferences';
import { cn } from '@/lib/utils';
import { Field, SaveButton, SettingsCard } from './ui';

const STYLES: Record<(typeof ANSWER_STYLES)[number], { title: string; text: string; sample: string }> = {
    concise: { title: 'Concise', text: 'Short, to the point.', sample: 'Refunds are allowed within 30 days (p. 1).' },
    balanced: { title: 'Balanced', text: 'Clear with some context.', sample: 'You can request a full refund within 30 days of purchase. After that, refunds are not given (p. 1).' },
    detailed: { title: 'Detailed', text: 'Thorough and structured.', sample: '**Refund policy**\n- Full refund within **30 days** of purchase\n- No refunds after 30 days\n\nSource: page 1.' },
};

export default function PreferencesSection() {
    const { toast } = useToast();
    const utils = trpc.useContext();
    const { data } = trpc.getPreferences.useQuery();
    const [style, setStyle] = useState<(typeof ANSWER_STYLES)[number]>('balanced');
    const [language, setLanguage] = useState<(typeof ANSWER_LANGUAGES)[number]>('auto');

    useEffect(() => {
        if (data) {
            setStyle(data.answerStyle as (typeof ANSWER_STYLES)[number]);
            setLanguage(data.answerLanguage as (typeof ANSWER_LANGUAGES)[number]);
        }
    }, [data]);

    const { mutate: save, isLoading } = trpc.updatePreferences.useMutation({
        onSuccess: () => {
            utils.getPreferences.invalidate();
            toast({ title: 'Preferences saved', description: 'They apply to your next question.' });
        },
    });

    const dirty = !!data && (style !== data.answerStyle || language !== data.answerLanguage);
    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        save({ answerStyle: style, answerLanguage: language });
    };

    return (
        <form onSubmit={onSubmit}>
            <SettingsCard
                title='AI answers'
                description='How the assistant writes its answers. Applies to chat, Ask AI and the API.'
                footer={
                    <>
                        <span className='text-xs text-zinc-500'>{dirty ? 'You have unsaved changes' : 'Up to date'}</span>
                        <SaveButton loading={isLoading} disabled={!dirty} />
                    </>
                }>
                <p className='text-sm font-medium text-zinc-800'>Answer style</p>
                <div role='radiogroup' className='mt-2 grid gap-3 sm:grid-cols-3'>
                    {ANSWER_STYLES.map((s) => {
                        const on = style === s;
                        return (
                            <button
                                key={s}
                                type='button'
                                role='radio'
                                aria-checked={on}
                                onClick={() => setStyle(s)}
                                className={cn(
                                    'relative rounded-xl p-4 text-left ring-1 transition',
                                    on ? 'bg-green-50 ring-2 ring-green-600' : 'bg-white ring-zinc-950/10 hover:bg-zinc-50'
                                )}>
                                {on && <Check className='absolute right-3 top-3 h-4 w-4 text-green-700' />}
                                <p className='font-semibold text-zinc-900'>{STYLES[s].title}</p>
                                <p className='mt-0.5 text-xs text-zinc-500'>{STYLES[s].text}</p>
                            </button>
                        );
                    })}
                </div>

                <div className='mt-5 rounded-xl bg-zinc-50 p-4 ring-1 ring-zinc-950/5'>
                    <p className='flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-green-700'>
                        <Sparkles className='h-3.5 w-3.5' /> Example answer
                    </p>
                    <p className='mt-2 whitespace-pre-wrap text-sm text-zinc-700'>{STYLES[style].sample}</p>
                </div>

                <div className='mt-6 max-w-sm'>
                    <Field label='Answer language' hint='“Match the question” answers in whatever language you ask in.'>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as (typeof ANSWER_LANGUAGES)[number])}
                            className='h-10 w-full rounded-md border border-input bg-white px-3 text-sm'>
                            {ANSWER_LANGUAGES.map((l) => (
                                <option key={l} value={l}>{l === 'auto' ? 'Match the question' : l}</option>
                            ))}
                        </select>
                    </Field>
                </div>
            </SettingsCard>
        </form>
    );
}
