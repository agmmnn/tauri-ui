import {
  GroupMultiSelectPrompt,
  MultiSelectPrompt,
  settings,
  wrapTextWithPrefix,
} from "@clack/core";
import {
  S_BAR,
  S_BAR_END,
  S_CHECKBOX_ACTIVE,
  S_CHECKBOX_INACTIVE,
  S_CHECKBOX_SELECTED,
  type CommonOptions,
  symbol,
  symbolBar,
} from "@clack/prompts";
import pc from "picocolors";

type CompactOption<Value> = {
  value: Value;
  label: string;
  disabled?: boolean;
};

type CompactMultiselectOptions<Value> = CommonOptions & {
  message: string;
  options: Array<CompactOption<Value>>;
  initialValues?: Value[];
  required?: boolean;
  formatSelection: (values: Value[]) => string;
};

type CompactGroupMultiselectOptions<Value> = CommonOptions & {
  message: string;
  options: Record<string, Array<CompactOption<Value>>>;
  initialValues?: Value[];
  required?: boolean;
  groupSpacing?: number;
  formatSelection: (values: Value[]) => string;
};

function promptHeader(
  state: Parameters<typeof symbol>[0],
  message: string,
  withGuide: boolean,
  output: CommonOptions["output"],
) {
  return wrapTextWithPrefix(
    output,
    message,
    withGuide ? `${symbolBar(state)}  ` : "",
    `${symbol(state)}  `,
  );
}

function footer(withGuide: boolean) {
  const controls = pc.dim("↑↓ navigate · space toggle · enter confirm");
  return withGuide ? `${pc.cyan(S_BAR)}  ${controls}\n${pc.cyan(S_BAR_END)}` : controls;
}

export function compactMultiselect<Value>(
  options: CompactMultiselectOptions<Value>,
): Promise<Value[] | symbol> {
  const required = options.required ?? true;
  const prompt = new MultiSelectPrompt<CompactOption<Value>>({
    options: options.options,
    initialValues: options.initialValues,
    signal: options.signal,
    input: options.input,
    output: options.output,
    validate(value) {
      if (required && (!value || value.length === 0)) {
        return "Select at least one option";
      }
    },
    render() {
      const withGuide = options.withGuide ?? settings.withGuide;
      const output = options.output ?? process.stdout;
      const header = promptHeader(this.state, options.message, withGuide, output);
      const prefix = withGuide ? `${symbolBar(this.state)}  ` : "";
      const selected = this.value ?? [];

      if (this.state === "submit") {
        return `${header}\n${prefix}${pc.dim(options.formatSelection(selected))}`;
      }

      if (this.state === "cancel") {
        return `${header}\n${prefix}${pc.strikethrough(pc.dim("Cancelled"))}`;
      }

      const rows = this.options.map((option, index) => {
        const active = index === this.cursor;
        const checked = selected.includes(option.value);
        const marker = checked
          ? pc.green(S_CHECKBOX_SELECTED)
          : active
            ? pc.cyan(S_CHECKBOX_ACTIVE)
            : pc.dim(S_CHECKBOX_INACTIVE);
        const label = active ? option.label : pc.dim(option.label);
        return `${prefix}${marker} ${label}`;
      });

      if (this.state === "error") {
        rows.push(`${prefix}${pc.yellow(this.error)}`);
      }

      return [header, ...rows, footer(withGuide)].join("\n");
    },
  });

  return prompt.prompt() as Promise<Value[] | symbol>;
}

export function compactGroupMultiselect<Value>(
  options: CompactGroupMultiselectOptions<Value>,
): Promise<Value[] | symbol> {
  const required = options.required ?? true;
  const prompt = new GroupMultiSelectPrompt<CompactOption<Value>>({
    options: options.options,
    initialValues: options.initialValues,
    signal: options.signal,
    input: options.input,
    output: options.output,
    required,
    validate(value) {
      if (required && (!value || value.length === 0)) {
        return "Select at least one artifact";
      }
    },
    render() {
      const withGuide = options.withGuide ?? settings.withGuide;
      const output = options.output ?? process.stdout;
      const header = promptHeader(this.state, options.message, withGuide, output);
      const prefix = withGuide ? `${symbolBar(this.state)}  ` : "";
      const selected = this.value ?? [];

      if (this.state === "submit") {
        return `${header}\n${prefix}${pc.dim(options.formatSelection(selected))}`;
      }

      if (this.state === "cancel") {
        return `${header}\n${prefix}${pc.strikethrough(pc.dim("Cancelled"))}`;
      }

      const rows: string[] = [];

      this.options.forEach((option, index) => {
        const active = index === this.cursor;

        if (option.group === true) {
          if (index > 0 && (options.groupSpacing ?? 0) > 0) rows.push(prefix.trimEnd());
          const checked = this.isGroupSelected(String(option.value));
          const marker = checked
            ? pc.green(S_CHECKBOX_SELECTED)
            : active
              ? pc.cyan(S_CHECKBOX_ACTIVE)
              : pc.dim(S_CHECKBOX_INACTIVE);
          rows.push(`${prefix}${marker} ${active ? option.label : pc.dim(option.label)}`);
          return;
        }

        const checked = selected.includes(option.value);
        const next = this.options[index + 1];
        const branch = next?.group === option.group ? "├" : "└";
        const marker = checked
          ? pc.green(S_CHECKBOX_SELECTED)
          : active
            ? pc.cyan(S_CHECKBOX_ACTIVE)
            : pc.dim(S_CHECKBOX_INACTIVE);
        rows.push(
          `${prefix}${pc.dim(branch)} ${marker} ${active ? option.label : pc.dim(option.label)}`,
        );
      });

      if (this.state === "error") {
        rows.push(`${prefix}${pc.yellow(this.error)}`);
      }

      return [header, ...rows, footer(withGuide)].join("\n");
    },
  });

  return prompt.prompt() as Promise<Value[] | symbol>;
}
