import type { ValidComponent } from 'solid-js';
import { splitProps, Show } from 'solid-js';

import type { PolymorphicProps } from '@kobalte/core/polymorphic';
import * as SeparatorPrimitive from '@kobalte/core/separator';

import { cn } from '../utils';

type SeparatorRootProps<T extends ValidComponent = 'hr'> =
  SeparatorPrimitive.SeparatorRootProps<T> & {
    class?: string | undefined;
    children?: any;
  };

const Separator = <T extends ValidComponent = 'hr'>(
  props: PolymorphicProps<T, SeparatorRootProps<T>>,
) => {
  const [local, others] = splitProps(props as SeparatorRootProps, [
    'class',
    'orientation',
    'children',
  ]);

  return (
    <div class={cn('flex items-center', local.orientation === 'vertical' && 'flex-col')}>
      {/* First line */}
      <SeparatorPrimitive.Root
        orientation={local.orientation ?? 'horizontal'}
        class={cn(
          'shrink-0 bg-border',
          local.orientation === 'vertical' ? 'h-full w-px' : 'h-px w-full',
          local.class,
        )}
        {...others}
      />

      {/* Text slot */}
      <Show when={local.children}>
        <span
          class={cn(
            'mx-2 text-sm text-muted-foreground',
            local.orientation === 'vertical' && 'my-2 mx-0',
          )}
        >
          {local.children}
        </span>
      </Show>

      {/* Second line */}
      <SeparatorPrimitive.Root
        orientation={local.orientation ?? 'horizontal'}
        class={cn(
          'shrink-0 bg-border',
          local.orientation === 'vertical' ? 'h-full w-px' : 'h-px w-full',
          local.class,
        )}
        {...others}
      />
    </div>
  );
};

export { Separator };
