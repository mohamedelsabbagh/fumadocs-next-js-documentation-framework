import { Fragment, type HTMLAttributes, type ReactNode } from 'react';
import {
  type BaseLayoutProps,
  getLinks,
  type SharedNavProps,
} from '@/layouts/shared';
import {
  CollapsibleSidebar,
  Sidebar,
  SidebarCollapseTrigger,
  SidebarFooter,
  SidebarHeader,
  SidebarViewport,
  SidebarPageTree,
} from '@/layouts/docs/sidebar';
import { type Option } from '@/components/layout/root-toggle';
import { TreeContextProvider } from '@/contexts/tree';
import { NavProvider, Title } from '@/components/layout/nav';
import { SearchOnly } from '@/contexts/search';
import {
  LargeSearchToggle,
  SearchToggle,
} from '@/components/layout/search-toggle';
import { cn } from '@/utils/cn';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { ChevronDown, Languages } from 'lucide-react';
import { BaseLinkItem, type LinkItemType } from '@/layouts/links';
import { LanguageToggle } from '@/components/layout/language-toggle';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  checkPageTree,
  getSidebarTabsFromOptions,
  layoutVariables,
  SidebarLinkItem,
  type SidebarOptions,
} from '@/layouts/docs/shared';
import type { PageTree } from 'fumadocs-core/server';
import { Navbar, NavbarSidebarTrigger, NavbarTab } from './notebook.client';
import { type PageStyles, StylesProvider } from '@/contexts/layout';

export interface DocsLayoutProps extends BaseLayoutProps {
  tree: PageTree.Root;

  extendNavbar?: boolean;

  sidebar?: Omit<Partial<SidebarOptions>, 'component' | 'enabled'>;

  containerProps?: HTMLAttributes<HTMLDivElement>;
}

export function DocsLayout({
  nav: { transparentMode, ...nav } = {},
  extendNavbar = false,
  sidebar: {
    collapsible: sidebarCollapsible = true,
    tabs: tabOptions,
    banner: sidebarBanner,
    footer: sidebarFooter,
    components: sidebarComponents,
    ...sidebar
  } = {},
  i18n = false,
  ...props
}: DocsLayoutProps): ReactNode {
  checkPageTree(props.tree);
  const links = getLinks(props.links ?? [], props.githubUrl);
  const Aside = sidebarCollapsible ? CollapsibleSidebar : Sidebar;

  const tabs = getSidebarTabsFromOptions(tabOptions, props.tree) ?? [];
  const variables = cn(
    '[--fd-nav-height:3.5rem] [--fd-tocnav-height:36px] md:[--fd-sidebar-width:268px] xl:[--fd-toc-width:268px] xl:[--fd-tocnav-height:0px]',
    tabs.length > 0 && '[--fd-nav-height:6rem]',
  );

  const pageStyles: PageStyles = {
    tocNav: cn('lg:px-4 xl:hidden'),
    toc: cn('max-xl:hidden'),
    page: cn('mt-[var(--fd-nav-height)]'),
  };

  if (extendNavbar && sidebarCollapsible)
    sidebarFooter = (
      <SidebarCollapseTrigger className="ms-auto text-fd-muted-foreground" />
    );
  else if (sidebarCollapsible)
    nav.children = (
      <SidebarCollapseTrigger className="ms-auto text-fd-muted-foreground" />
    );

  return (
    <TreeContextProvider tree={props.tree}>
      <NavProvider transparentMode={transparentMode}>
        <main
          id="nd-docs-layout"
          {...props.containerProps}
          className={cn(
            'flex w-full flex-1 flex-row pe-[var(--fd-layout-offset)]',
            variables,
            props.containerProps?.className,
          )}
          style={{
            ...layoutVariables,
            ...props.containerProps?.style,
          }}
        >
          <Aside
            {...sidebar}
            className={cn(
              'md:ps-[var(--fd-layout-offset)]',
              !extendNavbar && 'md:[--fd-nav-height:0px]',
              sidebar.className,
            )}
          >
            <SidebarHeader>
              <SidebarHeaderItems
                nav={extendNavbar ? { ...nav, title: undefined } : nav}
                links={links}
              >
                {nav.children}
              </SidebarHeaderItems>
              {sidebarBanner}
            </SidebarHeader>
            <SidebarViewport>
              <div className="pt-4 empty:hidden lg:hidden">
                {links.map((item, i) => (
                  <SidebarLinkItem key={i} item={item} />
                ))}
              </div>
              <div className="py-4">
                <SidebarPageTree components={sidebarComponents} />
              </div>
            </SidebarViewport>
            <SidebarFooter className={cn(!sidebarFooter && 'md:hidden')}>
              {!props.disableThemeSwitch ? (
                <ThemeToggle className="w-fit md:hidden" />
              ) : null}
              {sidebarFooter}
            </SidebarFooter>
          </Aside>
          <DocsNavbar
            nav={nav}
            links={links}
            i18n={i18n}
            sidebarCollapsible={sidebarCollapsible}
            tabs={tabs}
            full={extendNavbar}
          />
          <StylesProvider {...pageStyles}>{props.children}</StylesProvider>
        </main>
      </NavProvider>
    </TreeContextProvider>
  );
}

function DocsNavbar({
  sidebarCollapsible,
  links,
  nav = {},
  i18n,
  tabs,
  full,
}: {
  nav: DocsLayoutProps['nav'];
  sidebarCollapsible: boolean;
  i18n: boolean;
  links: LinkItemType[];
  tabs: Option[];
  full: boolean;
}) {
  const iconNodes = links
    .filter((item) => item.type === 'icon')
    .map((item, i) => (
      <BaseLinkItem
        key={i}
        item={item}
        className={cn(
          buttonVariants({ size: 'icon', color: 'ghost' }),
          'text-fd-muted-foreground',
        )}
        aria-label={item.label}
      >
        {item.icon}
      </BaseLinkItem>
    ));

  const linkNodes = links
    .filter((item) => item.type !== 'icon')
    .map((item, i) => (
      <NavbarLinkItem
        key={i}
        item={item}
        className="text-sm text-fd-muted-foreground transition-colors hover:text-fd-accent-foreground"
      />
    ));

  const row = (
    <>
      {sidebarCollapsible ? (
        <SidebarCollapseTrigger className="-ms-1.5 text-fd-muted-foreground data-[collapsed=false]:hidden max-md:hidden" />
      ) : null}
      <Title
        url={nav.url}
        title={nav.title}
        className={cn('me-auto', full ? 'flex-1' : 'md:hidden')}
      />
      <SearchOnly>
        <LargeSearchToggle
          className={cn(
            'me-auto w-full max-w-sm rounded-lg max-md:hidden',
            full && 'flex-1 rounded-xl p-2',
          )}
        />
      </SearchOnly>
      <div className="flex flex-1 flex-row items-center justify-end gap-6 px-2 max-lg:hidden">
        {linkNodes}
      </div>

      <SearchOnly>
        <SearchToggle className="md:hidden" />
      </SearchOnly>

      {i18n ? (
        <LanguageToggle>
          <Languages className="size-5" />
        </LanguageToggle>
      ) : null}
      <NavbarSidebarTrigger className="-me-1.5 md:hidden" />
      <div className="flex flex-row items-center px-2 empty:hidden max-lg:hidden">
        {iconNodes}
      </div>
      {i18n ? (
        <LanguageToggle>
          <Languages className="size-5" />
        </LanguageToggle>
      ) : null}
      <ThemeToggle className="p-0 max-md:hidden" />
    </>
  );

  if (tabs.length > 0) {
    return (
      <Navbar className="h-24" full={full}>
        <div className="flex size-full flex-col border-b border-fd-foreground/10 px-4 lg:px-8">
          <div className="flex flex-row items-center py-2">{row}</div>
          <div className="flex flex-1 flex-row items-end gap-6 overflow-auto">
            {tabs.map((tab) => (
              <NavbarTab key={tab.url} {...tab} />
            ))}
          </div>
        </div>
      </Navbar>
    );
  }

  return (
    <Navbar full={full}>
      <div className="mx-auto flex size-full flex-row items-center border-b border-fd-foreground/10 px-4 md:gap-1.5 lg:px-8">
        {row}
      </div>
    </Navbar>
  );
}

function NavbarLinkItem({
  item,
  ...props
}: { item: LinkItemType } & HTMLAttributes<HTMLElement>) {
  if (item.type === 'menu') {
    return (
      <Popover>
        <PopoverTrigger
          {...props}
          className={cn('inline-flex items-center gap-1.5', props.className)}
        >
          {item.text}
          <ChevronDown className="size-3" />
        </PopoverTrigger>
        <PopoverContent className="flex flex-col">
          {item.items.map((child, i) => {
            if (child.type === 'custom')
              return <Fragment key={i}>{child.children}</Fragment>;

            return (
              <BaseLinkItem
                key={i}
                item={child}
                className="inline-flex items-center gap-2 rounded-md p-2 text-start hover:bg-fd-accent hover:text-fd-accent-foreground data-[active=true]:text-fd-primary [&_svg]:size-4"
              >
                {child.icon}
                {child.text}
              </BaseLinkItem>
            );
          })}
        </PopoverContent>
      </Popover>
    );
  }

  if (item.type === 'custom') return item.children;

  return (
    <BaseLinkItem item={item} {...props}>
      {item.text}
    </BaseLinkItem>
  );
}

function SidebarHeaderItems({
  links,
  nav = {},
  children,
}: SharedNavProps & {
  nav: DocsLayoutProps['nav'];
  links: LinkItemType[];
  children: ReactNode;
}) {
  const isEmpty = !nav.title && !nav.children && links.length === 0;
  if (isEmpty) return null;

  return (
    <div className="flex flex-row items-center max-md:hidden">
      {nav.title ? (
        <Link
          href={nav.url ?? '/'}
          className="inline-flex items-center gap-2.5 py-2 font-medium md:px-2"
        >
          {nav.title}
        </Link>
      ) : null}
      {children}
    </div>
  );
}
