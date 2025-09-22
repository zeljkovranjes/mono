import type { Component, ComponentProps } from 'solid-js';
import { splitProps } from 'solid-js';

import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

import { cn } from '../utils';

const calloutVariants = cva(
  'rounded-md border-l-4 p-4 pl-6 shadow-sm transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'border-info-foreground bg-info/50 text-info-foreground backdrop-blur-sm',
        success: 'border-success-foreground bg-success/50 text-success-foreground backdrop-blur-sm',
        warning: 'border-warning-foreground bg-warning/50 text-warning-foreground backdrop-blur-sm',
        error: 'border-error-foreground bg-error/50 text-error-foreground backdrop-blur-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

type CalloutProps = ComponentProps<'div'> & VariantProps<typeof calloutVariants>;

const Callout: Component<CalloutProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'variant']);
  return <div class={cn(calloutVariants({ variant: local.variant }), local.class)} {...others} />;
};

const CalloutTitle: Component<ComponentProps<'h3'>> = (props) => {
  const [local, others] = splitProps(props, ['class']);
  return (
    <h3
      class={cn('font-semibold text-lg leading-tight mb-2 tracking-tight', local.class)}
      {...others}
    />
  );
};

const CalloutContent: Component<ComponentProps<'div'>> = (props) => {
  const [local, others] = splitProps(props, ['class']);
  return <div class={cn('text-sm leading-relaxed opacity-90', local.class)} {...others} />;
};

export { Callout, CalloutTitle, CalloutContent };
