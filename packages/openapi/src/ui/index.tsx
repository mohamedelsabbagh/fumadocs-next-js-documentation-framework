import { cn } from 'fumadocs-ui/components/api';
import { type HTMLAttributes, type ReactNode } from 'react';
import { badgeVariants } from '@/ui/components/variants';
import type { PropertyProps } from '@/render/renderer';
import { CollapsiblePanel } from '@/ui/components/collapsible';

export {
  Root,
  useSchemaContext,
  APIPlayground,
  ScalarPlayground,
  ScalarProvider,
} from './client';

export function APIInfo({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('min-w-0 flex-1', className)} {...props}>
      {props.children}
    </div>
  );
}

export function API({ children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        'flex flex-col gap-x-6 gap-y-4 xl:flex-row xl:items-start',
        props.className,
      )}
      style={
        {
          '--fd-api-info-top':
            'calc(var(--fd-nav-height) + var(--fd-banner-height) + var(--fd-tocnav-height, 0px))',
          ...props.style,
        } as object
      }
    >
      {children}
    </div>
  );
}

export function Property({
  name,
  type,
  required,
  deprecated,
  children,
}: PropertyProps) {
  return (
    <div className="rounded-xl border bg-fd-card p-3 prose-no-margin">
      <div className="flex flex-row flex-wrap items-center gap-4">
        <code>{name}</code>
        {required ? (
          <div className={cn(badgeVariants({ color: 'red' }))}>Required</div>
        ) : null}
        {deprecated ? (
          <div className={cn(badgeVariants({ color: 'yellow' }))}>
            Deprecated
          </div>
        ) : null}
        <span className="ms-auto text-xs font-mono text-fd-muted-foreground">
          {type}
        </span>
      </div>
      {children}
    </div>
  );
}

export function APIExample(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        'prose-no-margin md:sticky md:top-[var(--fd-api-info-top)] xl:w-[400px]',
        props.className,
      )}
    >
      {props.children}
    </div>
  );
}

export function ObjectCollapsible(props: {
  name: string;
  children: ReactNode;
}) {
  return (
    <CollapsiblePanel title={props.name} innerClassName="gap-2">
      {props.children}
    </CollapsiblePanel>
  );
}
