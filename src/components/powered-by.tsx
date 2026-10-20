import { cn } from '@/lib/utils';

function PoweredBy({ className }: { className?: string }) {
    return (
        <a
            href='https://technologies.thepalter.com'
            target='_blank'
            rel='noopener noreferrer'
            className={cn('text-xs text-zinc-500 transition hover:text-zinc-900', className)}>
            Powered by <span className='font-semibold'>Palter Technologies</span>
        </a>
    );
}

export default PoweredBy;
