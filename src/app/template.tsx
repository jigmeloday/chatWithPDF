'use client';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { EASE } from '@/components/motion';

// A template re-mounts on every navigation, which gives each page a soft entrance.
export default function Template({ children }: { children: ReactNode }) {
    return (
        <motion.div
            className='flex flex-1 flex-col'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE }}>
            {children}
        </motion.div>
    );
}
