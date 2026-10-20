'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Database, ShieldCheck, SlidersHorizontal, TriangleAlert, User } from 'lucide-react';
import { EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import ProfileSection, { Avatar, SettingsUser } from './profile-section';
import PreferencesSection from './preferences-section';
import NotificationsSection from './notifications-section';
import SecuritySection from './security-section';
import DataSection from './data-section';
import DangerSection from './danger-section';

const SECTIONS = [
    { id: 'profile', label: 'Profile', hint: 'Photo and personal info', icon: User },
    { id: 'preferences', label: 'AI preferences', hint: 'Answer style and language', icon: SlidersHorizontal },
    { id: 'notifications', label: 'Notifications', hint: 'Email alerts', icon: Bell },
    { id: 'security', label: 'Security', hint: 'Password and sessions', icon: ShieldCheck },
    { id: 'data', label: 'Data and privacy', hint: 'Export and clear data', icon: Database },
    { id: 'danger', label: 'Danger zone', hint: 'Delete your account', icon: TriangleAlert },
] as const;
type SectionId = (typeof SECTIONS)[number]['id'];

function Settings({ user }: { user: SettingsUser }) {
    const [active, setActive] = useState<SectionId>('profile');
    const current = SECTIONS.find((s) => s.id === active)!;

    return (
        <main className='mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8'>
            <div className='flex items-center gap-4'>
                <Avatar user={user} size='h-14 w-14 text-xl' />
                <div className='min-w-0'>
                    <h1 className='text-3xl font-bold tracking-tight text-zinc-900'>Settings</h1>
                    <p className='truncate text-sm text-zinc-500'>{user.name || 'Your account'} · {user.email}</p>
                </div>
            </div>

            <div className='mt-8 grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]'>
                {/* Navigation: a sticky column on desktop, a scrolling strip on small screens */}
                <nav aria-label='Settings sections' className='lg:sticky lg:top-8 lg:self-start'>
                    <div role='tablist' aria-orientation='vertical' className='-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0'>
                        {SECTIONS.map(({ id, label, hint, icon: Icon }) => {
                            const on = active === id;
                            const danger = id === 'danger';
                            return (
                                <button
                                    key={id}
                                    role='tab'
                                    aria-selected={on}
                                    onClick={() => setActive(id)}
                                    className={cn(
                                        'relative flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-left transition-colors lg:w-full',
                                        on ? (danger ? 'text-red-700' : 'text-green-800') : danger ? 'text-red-500 hover:bg-red-50' : 'text-zinc-600 hover:bg-zinc-100'
                                    )}>
                                    {on && (
                                        <motion.span
                                            layoutId='settings-active'
                                            className={cn('absolute inset-0 rounded-xl', danger ? 'bg-red-50' : 'bg-green-50')}
                                            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                                        />
                                    )}
                                    <Icon className='relative h-[18px] w-[18px] shrink-0' />
                                    <span className='relative'>
                                        <span className='block text-sm font-medium'>{label}</span>
                                        <span className='hidden text-xs font-normal opacity-70 lg:block'>{hint}</span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </nav>

                <div className='min-w-0'>
                    <div className='mb-5'>
                        <h2 className='text-xl font-semibold text-zinc-900'>{current.label}</h2>
                        <p className='text-sm text-zinc-500'>{current.hint}</p>
                    </div>
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={active}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.22, ease: EASE }}>
                            {active === 'profile' && <ProfileSection user={user} />}
                            {active === 'preferences' && <PreferencesSection />}
                            {active === 'notifications' && <NotificationsSection />}
                            {active === 'security' && <SecuritySection />}
                            {active === 'data' && <DataSection />}
                            {active === 'danger' && <DangerSection email={user.email} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </main>
    );
}

export default Settings;
