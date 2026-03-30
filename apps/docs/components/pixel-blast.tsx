"use client";

import type { CSSProperties } from "react";
import RawPixelBlast from "@/components/PixelBlast";

export type PixelBlastProps = {
  variant?: string;
  pixelSize?: number;
  color?: string;
  className?: string;
  style?: CSSProperties;
  antialias?: boolean;
  patternScale?: number;
  patternDensity?: number;
  liquid?: boolean;
  liquidStrength?: number;
  liquidRadius?: number;
  pixelSizeJitter?: number;
  enableRipples?: boolean;
  rippleIntensityScale?: number;
  rippleThickness?: number;
  rippleSpeed?: number;
  liquidWobbleSpeed?: number;
  autoPauseOffscreen?: boolean;
  speed?: number;
  transparent?: boolean;
  edgeFade?: number;
  noiseAmount?: number;
};

const PixelBlastComponent = RawPixelBlast as unknown as (
  props: PixelBlastProps,
) => React.JSX.Element;

export default function PixelBlast(props: PixelBlastProps) {
  return <PixelBlastComponent className="" style={undefined} {...props} />;
}
