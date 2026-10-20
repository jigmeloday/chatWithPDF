import { Suspense } from 'react';
import ResetPasswordForm from '@/components/auth/reset-password-form';

export default function Page() {
    return (
        <Suspense>
            <ResetPasswordForm />
        </Suspense>
    );
}
