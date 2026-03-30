import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import PixelBlast from "@/components/pixel-blast";
import {
  AppWindow,
  BatteryCharging,
  BookOpen,
  Boxes,
  Command,
  Gauge,
  Rocket,
  TerminalIcon,
  TerminalSquare,
} from "lucide-react";
import { CopyToClipboardButton, CreateAppAnimation } from "./page.client";
import { ServerCodeBlock } from "fumadocs-ui/components/codeblock.rsc";
import { Button } from "@base-ui/react";

type FeatureTone = "brand";

const featureCards: Array<{
  title: string;
  body: string;
  tone?: FeatureTone;
}> = [
  {
    title: "One command. Three layers.",
    body: "Official shadcn/ui frontend, official create-tauri-app shell, then a tiny battery layer to make the result feel like desktop software.",
    tone: "brand",
  },
  {
    title: "Upstream, not imprisoned.",
    body: "No private template empire to babysit. tauri-ui stays close to the official CLIs and patches only the awkward bits.",
  },
  {
    title: "Stops feeling wrapped.",
    body: "No startup flash. No rubber-band scroll. External links behave. Text selection feels sane. The papercuts get handled first.",
  },
  {
    title: "Ship it without folklore.",
    body: "Starter dashboard, invoke example, smoke-tested workflow, demo binaries, and optional size optimization when you want a leaner build.",
    tone: "brand",
  },
];

const supportCards = [
  {
    icon: <Boxes className="size-4" />,
    title: "Five frontends. One desktop brain.",
    body: "Vite, Next.js, Astro, React Router, and Start all get framework-aware patching instead of one-size-fits-none hacks.",
  },
  {
    icon: <BatteryCharging className="size-4" />,
    title: "Batteries, not baggage.",
    body: "Add the dashboard, invoke example, debug panel, workflow, or size optimization when they help. Leave them out when they don’t.",
  },
  {
    icon: <Gauge className="size-4" />,
    title: "Receipts included.",
    body: "Every release ships a demo build. Download the binaries, inspect the output, and judge the defaults with your own eyes.",
  },
];

export default function HomePage() {
  return (
    <main className="landing-page mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-10 px-4 pt-4 pb-10 md:px-6 md:pt-6 md:pb-14">
      <section className="landing-hero relative flex min-h-[560px] h-[66vh] max-h-[820px] overflow-hidden rounded-[28px] border border-fd-border">
        <div className="landing-pixel-blast absolute inset-0">
          <PixelBlast
            variant="square"
            pixelSize={4}
            color="#B19EEF"
            patternScale={2}
            patternDensity={0.95}
            pixelSizeJitter={0}
            enableRipples
            rippleSpeed={0.4}
            rippleThickness={0.12}
            rippleIntensityScale={1.5}
            liquid={false}
            liquidStrength={0.12}
            liquidRadius={1.2}
            liquidWobbleSpeed={5}
            speed={0.55}
            edgeFade={0.34}
            transparent
          />
        </div>
        <div className="landing-hero-noise absolute inset-0" />
        {/* <div className="landing-orb absolute top-14 right-10 size-52 rounded-full md:size-72" /> */}
        {/* <div className="landing-orb landing-orb-secondary absolute -bottom-16 left-16 size-56 rounded-full md:size-72" /> */}

        <div className="relative z-10 flex size-full flex-col px-4 pt-10 pb-6 md:px-10 md:pt-14 md:pb-10 xl:px-14 max-md:items-center max-md:text-center">
          <div className="max-w-2xl">
            <h1 className="mt-7 max-w-3xl text-4xl font-medium leading-tighter tracking-tight text-fd-foreground xl:text-5xl">
              Build modern Tauri desktop apps, your{" "}
              <span className="text-[color:var(--color-brand)]">way.</span>
            </h1>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/docs/getting-started"
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-brand)] px-5 py-3 text-sm font-medium text-[color:var(--color-brand-foreground)] transition-opacity hover:opacity-90 z-11"
              >
                Getting Started
              </Link>
              <CopyToClipboardButton text="bun create tauri-ui" />
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute top-[360px] left-[20%] z-10 hidden w-full max-w-[1300px] md:block lg:top-[300px]">
          <Image
            src="/light.png"
            alt="tauri-ui generated app in light mode"
            width={1600}
            height={1000}
            className=" h-auto w-full rounded-xl dark:hidden"
          />
          <Image
            src="/dark.png"
            alt="tauri-ui generated app in dark mode"
            width={1600}
            height={1000}
            className="hidden h-auto w-full rounded-xl  dark:block"
          />
        </div>

        <div className="pointer-events-none relative z-10 mt-auto px-4 pb-4 md:hidden">
          <Image
            src="/light.png"
            alt="tauri-ui generated app in light mode"
            width={1600}
            height={1000}
            className="block h-52 w-full rounded-t-xl border-x border-t border-black/8 object-cover object-left-top dark:hidden"
          />
          <Image
            src="/dark.png"
            alt="tauri-ui generated app in dark mode"
            width={1600}
            height={1000}
            className="hidden h-52 w-full rounded-t-xl border-x border-t border-white/10 object-cover object-left-top dark:block"
          />
        </div>
      </section>

      <section className="mx-auto mt-1 max-w-[1400px] px-2 md:px-6">
        <p className="text-2xl tracking-tight leading-snug font-light text-fd-foreground md:text-3xl xl:text-4xl">
          <span className="text-[color:var(--color-brand)]">tauri-ui</span> is a
          Tauri scaffolding workflow for{" "}
          <span className="text-[color:var(--color-brand)]">desktop apps</span>,
          built around upstream tools and a small layer of practical defaults.
          It stays close to the source while still fixing the parts that make a
          wrapped website feel unfinished.
        </p>
      </section>

      <div className="relative p-4 rounded-2xl col-span-full z-2 overflow-hidden md:p-8">
        {/* <Image
            src={CLIImage}
            alt=""
            className="absolute inset-0 size-full object-top object-cover -z-1"
          /> */}
        <div className="mx-auto w-full max-w-[800px] p-2 bg-fd-card text-fd-card-foreground border rounded-2xl shadow-lg">
          <div className="flex flex-row gap-2">
            <ServerCodeBlock
              code="bun create tauri-ui"
              lang="bash"
              codeblock={{
                className: "bg-fd-secondary flex-1",
              }}
            />
          </div>

          <div className="relative bg-fd-secondary rounded-xl mt-2 border shadow-md">
            <div className="flex flex-row items-center gap-2 border-b p-2 text-fd-muted-foreground">
              <TerminalIcon className="size-4" />
              <span className="text-xs font-medium">Terminal</span>
              <div className="ms-auto me-2 size-2 rounded-full bg-red-400" />
            </div>

            <CreateAppAnimation className="p-2 text-fd-secondary-foreground/80" />
          </div>
        </div>
      </div>

      <CenteredSection
        eyebrow="Not a wrapped website."
        title="Fix the desktop papercuts once."
        description="Startup flash, external links, scroll physics, selection behavior, and the debug panel are handled early so every new app doesn’t start with the same cleanup sprint."
      />

      <section className="space-y-5">
        <div className="grid gap-5 md:grid-cols-3">
          {supportCards.map((card) => (
            <SmallInfoCard key={card.title} {...card} />
          ))}
        </div>
      </section>

      {/* <CenteredSection
        eyebrow="Small batteries. Big mood."
        title="Keep the scaffold lean. Pull extras when they earn it."
        description="The baseline should stay sharp on its own. The extras are there for the moments when you want more range without turning the generator into a monster."
      />

      <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <FeatureCard
          title="Default kit, no apology."
          body="Startup flash prevention, external-link handling, desktop scroll behavior, selection defaults, sensible window setup, and the dev-only debug panel ship in the baseline."
          icon={<AppWindow className="size-4" />}
          tone="brand"
        />
        <VisualPanel
          title="Show the wiring."
          note="TODO: add a battery map, scaffold flow, or a playful diagram that makes the upstream-plus-batteries model obvious at a glance."
          className="landing-panel-bg-gold"
        >
          <div className="flex min-h-56 items-center justify-center rounded-[22px] border border-dashed border-white/15 bg-black/10 px-6 text-center text-sm leading-6 text-fd-muted-foreground">
            Placeholder block for a future visual that explains how tauri-ui
            layers on top of shadcn/ui and create-tauri-app without becoming a
            template zoo.
          </div>
        </VisualPanel>
      </section> */}
    </main>
  );
}

function CenteredSection({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="mx-auto flex max-w-[980px] flex-col items-center text-center">
      <p className="text-sm font-medium text-[color:var(--color-brand)]">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
        {title}
      </h2>
      <p className="mt-5 max-w-[760px] text-sm leading-7 text-fd-muted-foreground md:text-base">
        {description}
      </p>
    </section>
  );
}

function VisualPanel({
  title,
  note,
  className,
  children,
}: {
  title: string;
  note: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-fd-border px-4 py-5 md:px-6 md:py-6 ${className ?? ""}`}
    >
      <div className="relative z-10">
        <div className="mb-5">
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-xs leading-5 text-fd-muted-foreground">
            {note}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  body,
  icon,
  tone,
}: {
  title: string;
  body: string;
  icon?: ReactNode;
  tone?: FeatureTone;
}) {
  return (
    <div
      className={`rounded-[24px] border px-5 py-5 ${
        tone === "brand"
          ? "border-[color:var(--color-brand-soft-border)] bg-[color:var(--color-brand-soft)]"
          : "border-fd-border bg-fd-card"
      }`}
    >
      {icon ? (
        <div className="mb-3 inline-flex rounded-lg border border-fd-border/70 bg-fd-background p-2 text-[color:var(--color-brand)]">
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-fd-muted-foreground">{body}</p>
    </div>
  );
}

function SmallInfoCard({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[24px] border border-fd-border bg-fd-card px-5 py-5">
      <div className="mb-3 inline-flex rounded-lg border border-fd-border bg-fd-background p-2 text-[color:var(--color-brand)]">
        {icon}
      </div>
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-fd-muted-foreground">{body}</p>
    </div>
  );
}

function TerminalPanel({
  command,
  lines,
}: {
  command: string;
  lines: string[];
}) {
  return (
    <div className="mx-auto max-w-[880px] overflow-hidden rounded-[22px] border border-white/10 bg-[color:var(--landing-surface)] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3 text-xs text-white/55">
        <Command className="size-4" />
        Terminal
        <div className="ml-auto flex gap-1.5">
          <span className="size-2 rounded-full bg-white/20" />
          <span className="size-2 rounded-full bg-white/20" />
          <span className="size-2 rounded-full bg-white/20" />
        </div>
      </div>
      <div className="space-y-4 px-4 py-4 font-mono text-sm text-white/80">
        <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-3">
          <span className="text-[color:var(--color-brand)]">$</span> {command}
        </div>
        <div className="space-y-2 text-white/65">
          {lines.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CodePanel({ title, code }: { title: string; code: string }) {
  return (
    <div className="rounded-[24px] border border-fd-border bg-fd-card p-4 md:p-5">
      <div className="mb-3 text-sm font-semibold">{title}</div>
      <pre className="overflow-x-auto rounded-[18px] border border-fd-border bg-fd-secondary p-4 text-sm leading-7 text-fd-foreground">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function TextPanel({
  title,
  body,
  bullets,
}: {
  title: string;
  body: string;
  bullets: string[];
}) {
  return (
    <div className="rounded-[24px] border border-fd-border bg-fd-card p-6">
      <h3 className="text-3xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-4 max-w-xl text-sm leading-7 text-fd-muted-foreground md:text-base">
        {body}
      </p>
      <ul className="mt-7 space-y-2 text-sm leading-6 text-fd-foreground/90">
        {bullets.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[color:var(--color-brand)]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PlaceholderPanel({ title, note }: { title: string; note: string }) {
  return (
    <div className="rounded-[24px] border border-fd-border bg-fd-card p-5">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-xs leading-5 text-fd-muted-foreground">{note}</p>
      <div className="mt-5 flex min-h-48 items-center justify-center rounded-[18px] border border-dashed border-fd-border/80 bg-fd-secondary/60 px-5 text-center text-sm leading-6 text-fd-muted-foreground">
        Placeholder image block for a future screenshot or graphic
      </div>
    </div>
  );
}
