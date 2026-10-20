import { animate } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;
const HEADER_OFFSET = 96; // sticky header (68px) plus breathing room

let running: { stop: () => void } | null = null;

// Glides the window to the element with this id. The animation hands control back as soon as the user scrolls.
export const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return false;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const target = Math.max(0, el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET);

    running?.stop();
    if (reduceMotion) {
        window.scrollTo(0, target);
        return true;
    }

    const distance = Math.abs(target - window.scrollY);
    const controls = animate(window.scrollY, target, {
        duration: Math.min(1.2, 0.5 + distance / 3000),
        ease: EASE,
        onUpdate: (y) => window.scrollTo(0, y),
        onComplete: cleanup,
    });
    running = controls;

    function cleanup() {
        window.removeEventListener('wheel', cancel);
        window.removeEventListener('touchstart', cancel);
        window.removeEventListener('keydown', cancel);
        running = null;
    }
    function cancel() {
        controls.stop();
        cleanup();
    }
    window.addEventListener('wheel', cancel, { passive: true });
    window.addEventListener('touchstart', cancel, { passive: true });
    window.addEventListener('keydown', cancel);
    return true;
};

// Click handler for "/#section" links: smooth-scrolls when already on the landing page, otherwise lets the router navigate.
export const handleAnchorClick = (e: React.MouseEvent, href: string, pathname: string) => {
    const [path, hash] = href.split('#');
    if (!hash || (path || '/') !== pathname) return;

    if (scrollToId(hash)) {
        e.preventDefault();
        window.history.replaceState(null, '', `#${hash}`);
    }
};
