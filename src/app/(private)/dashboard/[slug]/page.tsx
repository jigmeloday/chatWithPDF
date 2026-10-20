import { GlobalProps } from '@/lib/model/shared.model';
import { getSessionUser } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/db';
import ChatWrapper from '@/components/chat/chat-wrapper';
import PdfRenderer from '@/components/pdf-render';

async function Page(props: GlobalProps) {
    const { params, searchParams } = props;
    const initialPage = Math.max(1, Number.parseInt(searchParams?.page ?? '1', 10) || 1);
    const user = await getSessionUser()
    if ( !user ) {
        redirect('/auth-callback?origin=dashboard')
    }
    const file = await db.file.findFirst({
        where: {
            id: params.slug,
            userId: user.id
        }
    })

    if ( !file ) {
        notFound()
    }

    return(
        <div className='flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)] md:h-screen'>
            <div className='mx-auto w-full max-w-8xl grow lg:flex xl:px-2'>
                <div className='flex-1 xl:flex'>
                    <div className='px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6'>
                        <PdfRenderer url={file.url} initialPage={initialPage} />
                    </div>
                </div>
                <div className='shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0'>
                    <ChatWrapper fileId={file.id} />
                </div>
            </div>
        </div>
    )
}

export default Page;
