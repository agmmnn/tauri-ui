"use client";

import { cn } from "@/lib/cn";
import { Button } from "@base-ui/react";
import {
  type ComponentProps,
  Fragment,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";

export function CreateAppAnimation(props: ComponentProps<"div">) {
  const installCmd = "bun create tauri-ui";
  const tickTime = 100;
  const timeCommandEnter = installCmd.length;
  const timeCommandRun = timeCommandEnter + 3;
  const timeCommandEnd = timeCommandRun + 3;
  const timeWindowOpen = timeCommandEnd + 1;
  const timeEnd = timeWindowOpen + 1;

  const [tick, setTick] = useState(timeEnd);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => (prev >= timeEnd ? prev : prev + 1));
    }, tickTime);

    return () => {
      clearInterval(timer);
    };
  }, [timeEnd]);

  const lines: ReactElement[] = [];

  lines.push(
    <span key="command_type">
      {installCmd.substring(0, tick)}
      {tick < timeCommandEnter && (
        <div className="inline-block h-3 w-1 animate-pulse bg-fd-foreground" />
      )}
    </span>,
  );

  if (tick >= timeCommandEnter) {
    lines.push(<span key="space"> </span>);
  }

  if (tick > timeCommandRun)
    lines.push(
      <Fragment key="command_response">
        {tick > timeCommandRun + 1 && (
          <>
            <span className="font-medium">◇ Project name</span>
            <span>│ my-app</span>
          </>
        )}
        {tick > timeCommandRun + 2 && (
          <>
            <span>│</span>
            <span className="font-medium">◆ Frontend template</span>
          </>
        )}
        {tick > timeCommandRun + 3 && (
          <>
            <span>│ ● Vite</span>
            <span>│ ○ Next.js</span>
            <span>│ ○ TanStack Start</span>
            <span>│ ○ React Router</span>
            <span>│ ○ Astro</span>
          </>
        )}
      </Fragment>,
    );

  return (
    <div
      {...props}
      onMouseEnter={() => {
        if (tick >= timeEnd) {
          setTick(0);
        }
      }}
    >
      {tick > timeWindowOpen && (
        <LaunchAppWindow className="absolute bottom-5 right-4 z-10 animate-in fade-in slide-in-from-top-10" />
      )}
      <pre className="font-mono text-sm min-h-[240px]">
        <code className="grid">{lines}</code>
      </pre>
    </div>
  );
}

function LaunchAppWindow(props: HTMLAttributes<HTMLDivElement>) {
  return <div></div>;
}

export function CopyToClipboardButton(props: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      onClick={() => {
        navigator.clipboard.writeText(props.text);
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      }}
      className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-fd-background)] px-5 py-3 text-sm font-medium font-mono text-[color:var(--color-fd-foreground)] transition-opacity hover:opacity-90 z-11"
    >
      {copied ? "Copied!" : props.text}
    </Button>
  );
}
