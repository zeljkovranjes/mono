import type { JSX } from 'solid-js';
import type { ValidComponent } from 'solid-js';
import { splitProps, createMemo } from 'solid-js';

import type { PolymorphicProps } from '@kobalte/core/polymorphic';
import * as SeparatorPrimitive from '@kobalte/core/separator';

import { cn } from '../utils';

type SeparatorRootProps<T extends ValidComponent = 'hr'> =
  SeparatorPrimitive.SeparatorRootProps<T> & { class?: string | undefined };

const Separator = <T extends ValidComponent = 'hr'>(
  props: PolymorphicProps<T, SeparatorRootProps<T>>,
) => {
  const [local, others] = splitProps(props as SeparatorRootProps, ['class', 'orientation']);
  return (
    <SeparatorPrimitive.Root
      orientation={local.orientation ?? 'horizontal'}
      class={cn(
        'shrink-0 bg-border',
        (local.orientation ?? 'horizontal') === 'vertical' ? 'h-full w-px' : 'h-px w-full',
        local.class,
      )}
      {...others}
    />
  );
};

export { Separator };

type LabeledSeparatorProps = {
  children: JSX.Element;
  orientation?: 'horizontal' | 'vertical';
  class?: string;
  labelClass?: string;
  lineClass?: string;
  gapClass?: string;
  inset?: boolean;
};

export const LabeledSeparator = (props: LabeledSeparatorProps) => {
  const orientation = createMemo(() => props.orientation ?? 'horizontal');
  const isVertical = createMemo(() => orientation() === 'vertical');
  const gap = createMemo(() => props.gapClass ?? (isVertical() ? 'my-3' : 'mx-3'));

  return (
    <div
      class={cn(
        'flex items-center',
        isVertical() ? 'flex-col' : 'flex-row',
        props.inset && !isVertical() && 'pl-3',
        props.class,
      )}
      role="group"
    >
      <SeparatorPrimitive.Root
        aria-hidden="true"
        orientation={orientation()}
        class={cn(
          'bg-border shrink-0',
          isVertical() ? 'w-px flex-1' : 'h-px flex-1',
          props.lineClass,
        )}
      />

      <span class={cn(gap(), 'relative inline-flex')}>
        <span
          class={cn(
            'px-2 text-sm text-muted-foreground',
            'bg-background',
            'rounded-md',
            props.labelClass,
          )}
        >
          {props.children}
        </span>
      </span>

      <SeparatorPrimitive.Root
        aria-hidden="true"
        orientation={orientation()}
        class={cn(
          'bg-border shrink-0',
          isVertical() ? 'w-px flex-1' : 'h-px flex-1',
          props.lineClass,
        )}
      />
    </div>
  );
};
