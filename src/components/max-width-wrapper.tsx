import { ReactNode } from 'react';
import { MaxWidthProps } from '@/components/model/max-width-wrapper';
import { cn } from '@/lib/utils';

function MaxWidthWrapper({ className, children }: MaxWidthProps) {
    return(
        <div className={cn('mx-auto w-full max-w-screen-xl px-2.5 md:px-20', className as string)}>
            {children}
        </div>
    )
}

export default MaxWidthWrapper;
