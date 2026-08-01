import type { ReleaseArtifact, TargetOs } from "./types";
import pc from "picocolors";

export const DEFAULT_RELEASE_ARTIFACTS: ReleaseArtifact[] = [
  "windows-nsis",
  "windows-portable",
  "macos-aarch64-dmg",
  "macos-x64-dmg",
  "linux-appimage",
  "linux-deb",
];

export const RELEASE_ARTIFACT_GROUPS: Record<
  string,
  Array<{ value: ReleaseArtifact; label: string }>
> = {
  Windows: [
    {
      value: "windows-nsis",
      label: `NSIS installer (.exe) ${pc.dim("(recommended)")}`,
    },
    {
      value: "windows-portable",
      label: `Portable executable ${pc.dim("(no installation)")}`,
    },
    {
      value: "windows-msi",
      label: `MSI installer ${pc.dim("(enterprise deployment)")}`,
    },
  ],
  macOS: [
    {
      value: "macos-aarch64-dmg",
      label: `Apple Silicon (.dmg) ${pc.dim("(M1 and newer)")}`,
    },
    {
      value: "macos-x64-dmg",
      label: `Intel (.dmg) ${pc.dim("(legacy Intel Macs)")}`,
    },
  ],
  Linux: [
    {
      value: "linux-appimage",
      label: `AppImage ${pc.dim("(cross-distribution)")}`,
    },
    {
      value: "linux-deb",
      label: `Debian package (.deb) ${pc.dim("(Debian and Ubuntu)")}`,
    },
    {
      value: "linux-rpm",
      label: `RPM package (.rpm) ${pc.dim("(Fedora, RHEL and openSUSE)")}`,
    },
  ],
};

export function releaseArtifactsForTargetOS(targetOS: TargetOs[]): ReleaseArtifact[] {
  const artifacts: ReleaseArtifact[] = [];

  if (targetOS.includes("windows-latest")) {
    artifacts.push("windows-nsis", "windows-portable");
  }

  if (targetOS.includes("macos-latest")) {
    artifacts.push("macos-aarch64-dmg", "macos-x64-dmg");
  }

  if (targetOS.includes("ubuntu-latest")) {
    artifacts.push("linux-appimage", "linux-deb");
  }

  return artifacts;
}
