import { BarChart3, Bookmark, CreditCard, FileText, KeyRound, LayoutDashboard, Layers, Search, Settings, Webhook, LucideIcon } from 'lucide-react';

export interface NavItem {
    href: string;
    label: string;
    icon: LucideIcon;
    /** Only highlight on this exact path. */
    exact?: boolean;
    /** Extra path prefixes that keep the item highlighted: opening a file (/dashboard/<id>) counts as Documents. */
    also?: string[];
}

export const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
    {
        title: 'Workspace',
        items: [
            { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
            { href: '/documents', label: 'Documents', icon: FileText, also: ['/dashboard/'] },
            { href: '/ask', label: 'Ask AI', icon: Layers },
            { href: '/search', label: 'Search', icon: Search },
            { href: '/saved', label: 'Saved', icon: Bookmark },
        ],
    },
    {
        title: 'Insights',
        items: [{ href: '/usage', label: 'Usage', icon: BarChart3 }],
    },
    {
        title: 'Developers',
        items: [
            { href: '/developers', label: 'API keys', icon: KeyRound },
            { href: '/webhooks', label: 'Webhooks', icon: Webhook },
        ],
    },
    {
        title: 'Account',
        items: [
            { href: '/billing', label: 'Billing', icon: CreditCard },
            { href: '/settings', label: 'Settings', icon: Settings },
        ],
    },
];

export const isNavActive = (item: NavItem, pathname: string) =>
    item.exact
        ? pathname === item.href
        : pathname === item.href || pathname.startsWith(`${item.href}/`) || (item.also ?? []).some((p) => pathname.startsWith(p));
