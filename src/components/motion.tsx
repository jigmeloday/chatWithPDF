'use client';
import { ElementType, ReactNode, useEffect, useRef } from 'react';
import {
    HTMLMotionProps,
    Variants,
    animate,
    motion,
    useInView,
    useMotionValue,
    useTransform,
} from 'framer-motion';

// A soft ease-out used everywhere so movement feels consistent.
export const EASE = [0.22, 1, 0.36, 1] as const;

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

type Tag = 'div' | 'ul' | 'ol' | 'li' | 'section' | 'span';

// Fades and lifts its children into view the first time they scroll on screen.
export function Reveal({
    children,
    delay = 0,
    y = 24,
    className,
}: {
    children: ReactNode;
    delay?: number;
    y?: number;
    className?: string;
}) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: EASE, delay }}>
            {children}
        </motion.div>
    );
}

// Container that staggers its StaggerItem children. Animates on scroll by default, or on mount with `onMount`.
export function Stagger({
    as = 'div',
    children,
    className,
    gap = 0.08,
    delay = 0,
    onMount = false,
}: {
    as?: Tag;
    children: ReactNode;
    className?: string;
    gap?: number;
    delay?: number;
    onMount?: boolean;
}) {
    const Component = motion[as] as ElementType;
    const variants: Variants = { hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } };
    const trigger = onMount
        ? { animate: 'show' }
        : { whileInView: 'show', viewport: { once: true, margin: '-60px' } };

    return (
        <Component className={className} variants={variants} initial='hidden' {...trigger}>
            {children}
        </Component>
    );
}

export function StaggerItem({
    as = 'div',
    children,
    className,
    ...rest
}: { as?: Tag; children: ReactNode; className?: string } & Omit<HTMLMotionProps<'div'>, 'children' | 'className'>) {
    const Component = motion[as] as ElementType;
    return (
        <Component className={className} variants={itemVariants} {...rest}>
            {children}
        </Component>
    );
}

// Counts up to `value` when it first appears, and glides to new values afterwards.
export function CountUp({ value, format = (n: number) => Math.round(n).toLocaleString(), className }: {
    value: number;
    format?: (n: number) => string;
    className?: string;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });
    const motionValue = useMotionValue(0);
    const text = useTransform(motionValue, (n) => format(n));

    useEffect(() => {
        if (!inView) return;
        const controls = animate(motionValue, value, { duration: 1.1, ease: EASE });
        return () => controls.stop();
    }, [inView, value, motionValue]);

    return <motion.span ref={ref} className={className}>{text}</motion.span>;
}

// A bar that grows from empty to `percent` (0-100).
export function GrowBar({ percent, className, delay = 0 }: { percent: number; className?: string; delay?: number }) {
    return (
        <motion.div
            className={className}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.9, ease: EASE, delay }}
        />
    );
}
