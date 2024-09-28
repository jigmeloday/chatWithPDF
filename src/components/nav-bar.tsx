import MaxWidthWrapper from '@/components/max-width-wrapper';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import {LoginLink, RegisterLink} from '@kinde-oss/kinde-auth-nextjs/server';
import { ArrowRight } from 'lucide-react';

function NavBar() {
    return(
        <nav className='sticky h-14 insert-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all'>
            <MaxWidthWrapper>
                <div className='flex h-14 flex justify-between items-center border-b border-zinc-200'>
                    <Link href='/' className='flex z-40 font-semibold'>
                        <span>DocuChatty</span>
                    </Link>
                    {/*TODO MOBILE*/}
                    <div className='hidden items-center space-x-4 sm:flex'>
                        <>
                            <Link className={buttonVariants({
                                variant: 'ghost',
                                size: 'sm'
                            })} href='/price' >Pricing </Link>
                            <Link className={buttonVariants({
                                variant: 'ghost',
                                size: 'sm'
                            })} href='/price' >Price </Link>
                            <LoginLink
                                className={buttonVariants({
                                variant: 'ghost',
                                size: 'sm'
                            })} >
                                Sign In
                            </LoginLink>
                            <RegisterLink className={buttonVariants({
                                size: 'sm'
                            })} >
                                Get started <ArrowRight className='ml-1.5 h-5 w-5' />
                            </RegisterLink>
                        </>
                    </div>
                </div>
            </MaxWidthWrapper>
        </nav>
    )
}

export default NavBar;
