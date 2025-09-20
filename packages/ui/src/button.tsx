import { JSX } from 'solid-js';

interface ButtonProps {
  children: JSX.Element;
  className?: string;
  appName: string;
}

export function Button(props: ButtonProps) {
  return (
    <button class={props.className} onClick={() => alert(`Hello from your ${props.appName} app!`)}>
      {props.children}
    </button>
  );
}
