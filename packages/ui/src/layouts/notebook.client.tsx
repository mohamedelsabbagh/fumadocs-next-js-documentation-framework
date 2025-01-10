'use client';
import { cn } from '@/utils/cn';
import type { ButtonHTMLAttributes, HTMLAttributes } from 'react';
import { useSidebar } from '@/contexts/sidebar';
import { useNav } from '@/components/layout/nav';
import { SidebarTrigger } from 'fumadocs-core/sidebar';
import { buttonVariants } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import type { Option } from '@/components/layout/root-toggle';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isActive } from '@/utils/is-active';

export function Navbar({
  full,
  ...props
}: HTMLAttributes<HTMLElement> & {
  full: boolean;
}) {
  const { open, collapsed } = useSidebar();
  const { isTransparent } = useNav();

  return (
    <header
      id="nd-subnav"
      {...props}
      className={cn(
        'fixed inset-x-0 top-[var(--fd-banner-height)] z-10 h-14 pe-[var(--fd-layout-offset)] backdrop-blur-lg transition-colors',
        (!isTransparent || open) && 'bg-fd-background/80',
        props.className,
      )}
      style={
        {
          paddingInlineStart:
            collapsed || full
              ? 'calc(var(--fd-layout-offset))'
              : 'calc(var(--fd-layout-offset) + var(--fd-sidebar-width))',
        } as object
      }
    >
      {props.children}
    </header>
  );
}

export function NavbarTab(tab: Option) {
  const pathname = usePathname();
  const active = tab.urls
    ? tab.urls.includes(pathname)
    : isActive(tab.url, pathname);

  return (
    <Link
      href={tab.url}
      className={cn(
        '-mx-2 whitespace-nowrap border-b border-transparent px-2 pb-2 text-sm text-fd-muted-foreground transition-all',
        active && 'border-fd-primary font-medium text-fd-primary',
      )}
    >
      {tab.title}
    </Link>
  );
}

export function NavbarSidebarTrigger(
  props: ButtonHTMLAttributes<HTMLButtonElement>,
) {
  const { open } = useSidebar();

  return (
    <SidebarTrigger
      {...props}
      className={cn(
        buttonVariants({
          color: 'ghost',
          size: 'icon',
        }),
        props.className,
      )}
    >
      {open ? <X /> : <Menu />}
    </SidebarTrigger>
  );
}
