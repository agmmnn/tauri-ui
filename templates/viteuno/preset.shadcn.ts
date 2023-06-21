import { h, variantGetParameter } from "@unocss/preset-mini/utils"
import type { Preset, VariantContext, VariantObject } from "unocss"
import type { PresetMiniOptions, Theme } from "unocss/preset-mini"

export interface PresetShadcnOptions extends PresetMiniOptions {}

const variantGroupDataAttribute: VariantObject = {
  name: "group-data",
  match(matcher, ctx: VariantContext<Theme>) {
    const variant = variantGetParameter(
      "group-data-",
      matcher,
      ctx.generator.config.separators
    )
    if (variant) {
      const [match, rest] = variant
      const dataAttribute = h.bracket(match) ?? ctx.theme.data?.[match] ?? ""
      if (dataAttribute) {
        return {
          matcher: rest,
          selector: (s) => `.group[data-${dataAttribute}] ${s}`,
        }
      }
    }
  },
}

const handleMatchNumber = (v: string, defaultVal = "0") =>
  h.bracket.cssvar.global.auto.fraction
    .number(v || defaultVal)
    ?.replace("%", "")
const handleMatchRem = (v: string, defaultVal = "full") =>
  h.bracket.cssvar.global.auto.fraction.rem(v || defaultVal)

export function presetShadcn(options: PresetShadcnOptions = {}): Preset<Theme> {
  return {
    name: "unocss-preset-shadcn",
    preflights: [
      {
        getCSS: () => `
          @keyframes shadcn-down { from{ height: 0 } to { height: var(--radix-accordion-content-height)} }
          @keyframes shadcn-up { from{ height: var(--radix-accordion-content-height)} to { height: 0 } }
          @keyframes shadcn-enter { from{ opacity: var(--un-enter-opacity, 1); transform: translate3d(var(--un-enter-translate-x, 0), var(--un-enter-translate-y, 0), 0) scale3d(var(--un-enter-scale, 1), var(--un-enter-scale, 1), var(--un-enter-scale, 1)) rotate(var(--un-enter-rotate, 0)) } }
          @keyframes shadcn-exit { to{ opacity: var(--un-exit-opacity, 1); transform: translate3d(var(--un-exit-translate-x, 0), var(--un-exit-translate-y, 0), 0) scale3d(var(--un-exit-scale, 1), var(--un-exit-scale, 1), var(--un-exit-scale, 1)) rotate(var(--un-exit-rotate, 0)) } }
        `,
      },
    ],
    variants: [variantGroupDataAttribute.match],
    rules: [
      [
        "accordion-down",
        {
          animation: "shadcn-down 0.2s ease-out",
        },
      ],
      [
        "accordion-up",
        {
          animation: "shadcn-up 0.2s ease-out",
        },
      ],
      [
        "animate-in",
        {
          "animation-name": "shadcn-enter",
          "animation-duration": "var(--un-animate-duration)",
          "--un-animate-duration": "150ms",
          "--un-enter-opacity": "initial",
          "--un-enter-scale": "initial",
          "--un-enter-rotate": "initial",
          "--un-enter-translate-x": "initial",
          "--un-enter-translate-y": "initial",
        },
      ],
      [
        "animate-out",
        {
          "animation-name": "shadcn-exit",
          "animation-duration": "var(--un-animate-duration)",
          "--un-animate-duration": "150ms",
          "--un-exit-opacity": "initial",
          "--un-exit-scale": "initial",
          "--un-exit-rotate": "initial",
          "--un-exit-translate-x": "initial",
          "--un-exit-translate-y": "initial",
        },
      ],
      [
        /^fade-in-?(.+)?$/,
        ([, d]) => ({
          "--un-enter-opacity": `${Number(handleMatchNumber(d) || 0) / 100}`,
        }),
      ],
      [
        /^fade-out-?(.+)?$/,
        ([, d]) => ({
          "--un-exit-opacity": `${Number(handleMatchNumber(d) || 0) / 100}`,
        }),
      ],
      [
        /^zoom-in-?(.+)?$/,
        ([, d]) => ({
          "--un-enter-scale": `${Number(handleMatchNumber(d) || 0) / 100}`,
        }),
      ],
      [
        /^zoom-out-?(.+)?$/,
        ([, d]) => ({
          "--un-out-scale": `${Number(handleMatchNumber(d) || 0) / 100}`,
        }),
      ],
      [
        /^spin-in-?(.+)?$/,
        ([, d]) => ({
          "--un-enter-rotate": `${Number(handleMatchNumber(d) || 0)}deg`,
        }),
      ],
      [
        /^spin-out-?(.+)?$/,
        ([, d]) => ({
          "--un-exit-rotate": `${Number(handleMatchNumber(d) || 0)}deg`,
        }),
      ],
      [
        /^slide-in-from-top-?(.+)?$/,
        ([, d]) => ({ "--un-enter-translate-y": `-${handleMatchRem(d)}` }),
      ],
      [
        /^slide-in-from-bottom-?(.+)?$/,
        ([, d]) => ({ "--un-enter-translate-y": handleMatchRem(d) }),
      ],
      [
        /^slide-in-from-left-?(.+)?$/,
        ([, d]) => ({ "--un-enter-translate-x": `-${handleMatchRem(d)}` }),
      ],
      [
        /^slide-in-from-right-?(.+)?$/,
        ([, d]) => ({ "--un-enter-translate-x": handleMatchRem(d) }),
      ],
      [
        /^slide-out-to-top-?(.+)?$/,
        ([, d]) => ({ "--un-exit-translate-y": `-${handleMatchRem(d)}` }),
      ],
      [
        /^slide-out-to-bottom-?(.+)?$/,
        ([, d]) => ({ "--un-exit-translate-y": handleMatchRem(d) }),
      ],
      [
        /^slide-out-to-left-?(.+)?$/,
        ([, d]) => ({ "--un-exit-translate-x": `-${handleMatchRem(d)}` }),
      ],
      [
        /^slide-out-to-right-?(.+)?$/,
        ([, d]) => ({ "--un-exit-translate-x": handleMatchRem(d) }),
      ],
    ],
  }
}

export default presetShadcn
