import { RouteSectionProps } from '@solidjs/router';

export default function AuthLayout(props: RouteSectionProps) {
  return (
    <div class="min-h-screen flex flex-col items-center text-gray-950 p-3 relative noise">
      <div class="flex-1 flex-col w-full flex items-center justify-center ">
        <div class="flex items-center justify-center w-[384px] md:justify-start py-3 px-1 mb-0 md:mb-5">
          <span class="md:text-lg">SAFEOUTPUT</span>
        </div>
        {props.children}
      </div>
    </div>
  );
}
