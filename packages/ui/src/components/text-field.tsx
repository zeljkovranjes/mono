import type { JSX, ValidComponent } from 'solid-js';
import { createMemo, createSignal, Show } from 'solid-js';
import { mergeProps, splitProps } from 'solid-js';

import type { PolymorphicProps } from '@kobalte/core';
import * as TextFieldPrimitive from '@kobalte/core/text-field';
import { cva } from 'class-variance-authority';

import { cn } from '../utils';

type TextFieldRootProps<T extends ValidComponent = 'div'> =
  TextFieldPrimitive.TextFieldRootProps<T> & {
    class?: string | undefined;
  };

const TextField = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, TextFieldRootProps<T>>,
) => {
  const [local, others] = splitProps(props as TextFieldRootProps, ['class']);
  return <TextFieldPrimitive.Root class={cn('flex flex-col gap-1', local.class)} {...others} />;
};

type TextFieldInputProps<T extends ValidComponent = 'input'> =
  TextFieldPrimitive.TextFieldInputProps<T> & {
    class?: string | undefined;
    /** Optional inline icon element rendered inside the input */
    icon?: JSX.Element;
    /** Where to place the icon if provided */
    iconAlign?: 'left' | 'right';
    type?:
      | 'button'
      | 'checkbox'
      | 'color'
      | 'date'
      | 'datetime-local'
      | 'email'
      | 'file'
      | 'hidden'
      | 'image'
      | 'month'
      | 'number'
      | 'password'
      | 'radio'
      | 'range'
      | 'reset'
      | 'search'
      | 'submit'
      | 'tel'
      | 'text'
      | 'time'
      | 'url'
      | 'week';
  };

const TextFieldInput = <T extends ValidComponent = 'input'>(
  rawProps: PolymorphicProps<T, TextFieldInputProps<T>>,
) => {
  const props = mergeProps<TextFieldInputProps<T>[]>({ type: 'text', iconAlign: 'left' }, rawProps);
  const [local, others] = splitProps(props as TextFieldInputProps, [
    'type',
    'class',
    'icon',
    'iconAlign',
  ]);

  /** Base input classes */
  const baseInput =
    'flex h-10 w-full rounded-sm border border-input bg-gray-50 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[invalid]:border-error-foreground data-[invalid]:text-error-foreground';

  /** Padding adjustments depending on icon / toggle */
  const padLeftForIcon = createMemo(() =>
    local.icon && (local.iconAlign ?? 'left') === 'left' ? 'pl-10' : 'pl-3',
  );

  // Compute padding classes using createMemo for reactivity
  const padRightClass = createMemo(() => {
    const hasRightIcon = !!local.icon && (local.iconAlign ?? 'left') === 'right';
    const hasToggle = local.type === 'password';
    return hasRightIcon && hasToggle
      ? 'pr-28'
      : hasToggle
        ? 'pr-16'
        : hasRightIcon
          ? 'pr-10'
          : 'pr-3';
  });

  /** Renders the icon appropriately positioned */
  const IconNode = () => (
    <Show when={local.icon}>
      <div
        class={cn(
          'pointer-events-none absolute inset-y-0 my-auto flex h-5 w-5 items-center justify-center text-muted-foreground',
          (local.iconAlign ?? 'left') === 'left'
            ? 'left-3'
            : local.type === 'password'
              ? // If there is also a password toggle, shift icon left a bit to make space for the toggle button
                'right-14'
              : 'right-3',
        )}
        aria-hidden="true"
      >
        {local.icon}
      </div>
    </Show>
  );

  // Use Show component instead of early returns for reactivity
  return (
    <>
      <Show when={local.type === 'password'}>
        <PasswordInput
          local={local}
          others={others}
          baseInput={baseInput}
          padLeftForIcon={padLeftForIcon()}
          padRightClass={padRightClass()}
          IconNode={IconNode}
        />
      </Show>

      <Show when={local.type !== 'password' && local.icon}>
        <div class="relative">
          <TextFieldPrimitive.Input
            type={local.type}
            class={cn(baseInput, padLeftForIcon(), padRightClass(), local.class)}
            {...(others as TextFieldPrimitive.TextFieldInputProps)}
          />
          <IconNode />
        </div>
      </Show>

      <Show when={local.type !== 'password' && !local.icon}>
        <TextFieldPrimitive.Input
          type={local.type}
          class={cn(baseInput, 'px-3', local.class)}
          {...(others as TextFieldPrimitive.TextFieldInputProps)}
        />
      </Show>
    </>
  );
};

// Separate password input component to handle the toggle logic
const PasswordInput = (props: {
  local: { type?: string; class?: string; icon?: JSX.Element; iconAlign?: 'left' | 'right' };
  others: Record<string, unknown>;
  baseInput: string;
  padLeftForIcon: string;
  padRightClass: string;
  IconNode: () => JSX.Element;
}) => {
  const [shown, setShown] = createSignal(false);

  return (
    <div class="relative">
      <TextFieldPrimitive.Input
        type={shown() ? 'text' : 'password'}
        class={cn(props.baseInput, props.padLeftForIcon, props.padRightClass, props.local.class)}
        {...(props.others as TextFieldPrimitive.TextFieldInputProps)}
      />
      <props.IconNode />
      <button
        type="button"
        class="absolute inset-y-0 right-2 my-auto h-7 rounded-sm px-2 text-xs font-medium underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-pressed={shown()}
        aria-label={shown() ? 'Hide password' : 'Show password'}
        onClick={() => setShown((v) => !v)}
      >
        {shown() ? 'Hide' : 'Show'}
      </button>
    </div>
  );
};

type TextFieldTextAreaProps<T extends ValidComponent = 'textarea'> =
  TextFieldPrimitive.TextFieldTextAreaProps<T> & { class?: string | undefined };

const TextFieldTextArea = <T extends ValidComponent = 'textarea'>(
  props: PolymorphicProps<T, TextFieldTextAreaProps<T>>,
) => {
  const [local, others] = splitProps(props as TextFieldTextAreaProps, ['class']);
  return (
    <TextFieldPrimitive.TextArea
      class={cn(
        'flex min-h-[80px] w-full rounded-sm border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        local.class,
      )}
      {...others}
    />
  );
};

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-1',
  {
    variants: {
      variant: {
        label: 'data-[invalid]:text-destructive',
        description: 'font-normal text-muted-foreground',
        error: 'text-xs text-destructive',
      },
    },
    defaultVariants: {
      variant: 'label',
    },
  },
);

type TextFieldLabelProps<T extends ValidComponent = 'label'> =
  TextFieldPrimitive.TextFieldLabelProps<T> & { class?: string | undefined };

const TextFieldLabel = <T extends ValidComponent = 'label'>(
  props: PolymorphicProps<T, TextFieldLabelProps<T>>,
) => {
  const [local, others] = splitProps(props as TextFieldLabelProps, ['class']);
  return <TextFieldPrimitive.Label class={cn(labelVariants(), local.class)} {...others} />;
};

type TextFieldDescriptionProps<T extends ValidComponent = 'div'> =
  TextFieldPrimitive.TextFieldDescriptionProps<T> & {
    class?: string | undefined;
  };

const TextFieldDescription = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, TextFieldDescriptionProps<T>>,
) => {
  const [local, others] = splitProps(props as TextFieldDescriptionProps, ['class']);
  return (
    <TextFieldPrimitive.Description
      class={cn(labelVariants({ variant: 'description' }), local.class)}
      {...others}
    />
  );
};

type TextFieldErrorMessageProps<T extends ValidComponent = 'div'> =
  TextFieldPrimitive.TextFieldErrorMessageProps<T> & {
    class?: string | undefined;
  };

const TextFieldErrorMessage = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, TextFieldErrorMessageProps<T>>,
) => {
  const [local, others] = splitProps(props as TextFieldErrorMessageProps, ['class']);
  return (
    <TextFieldPrimitive.ErrorMessage
      class={cn(labelVariants({ variant: 'error' }), local.class)}
      {...others}
    />
  );
};

export {
  TextField,
  TextFieldInput,
  TextFieldTextArea,
  TextFieldLabel,
  TextFieldDescription,
  TextFieldErrorMessage,
};
