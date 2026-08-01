import { isCancel } from "@clack/prompts";
import pc from "picocolors";

import { compactGroupMultiselect } from "./compact-prompts";
import { DEFAULT_RELEASE_ARTIFACTS, RELEASE_ARTIFACT_GROUPS } from "./release-artifacts";
import type { ReleaseArtifact } from "./types";

const RELEASE_PLATFORMS = Object.keys(RELEASE_ARTIFACT_GROUPS) as Array<
  keyof typeof RELEASE_ARTIFACT_GROUPS
>;

const SHORT_ARTIFACT_LABELS: Record<ReleaseArtifact, string> = {
  "windows-nsis": "NSIS",
  "windows-msi": "MSI",
  "windows-portable": "Portable",
  "macos-aarch64-dmg": "Apple Silicon DMG",
  "macos-x64-dmg": "Intel DMG",
  "linux-appimage": "AppImage",
  "linux-deb": "DEB",
  "linux-rpm": "RPM",
};

function unwrap<T>(value: T | symbol): T {
  if (isCancel(value)) {
    throw new Error("Operation cancelled");
  }

  return value as T;
}

export async function promptReleaseArtifacts(yes: boolean | undefined): Promise<ReleaseArtifact[]> {
  if (yes) {
    return [...DEFAULT_RELEASE_ARTIFACTS];
  }

  return unwrap(
    await compactGroupMultiselect<ReleaseArtifact>({
      message: "Release artifacts (GitHub Releases)",
      initialValues: [...DEFAULT_RELEASE_ARTIFACTS],
      required: true,
      options: RELEASE_ARTIFACT_GROUPS,
      groupSpacing: 1,
      formatSelection: formatReleaseArtifactSelection,
    }),
  );
}

export function formatReleaseArtifactSelection(artifacts: ReleaseArtifact[]) {
  return RELEASE_PLATFORMS.map((platform) => {
    const platformValues = new Set(RELEASE_ARTIFACT_GROUPS[platform].map(({ value }) => value));
    return artifacts
      .filter((artifact) => platformValues.has(artifact))
      .map((artifact) => SHORT_ARTIFACT_LABELS[artifact])
      .join(", ");
  })
    .filter(Boolean)
    .join(pc.dim(" · "));
}

export function formatReleaseArtifactCounts(artifacts: ReleaseArtifact[]) {
  const counts = RELEASE_PLATFORMS.map((platform) => {
    const values = new Set(RELEASE_ARTIFACT_GROUPS[platform].map(({ value }) => value));
    const count = artifacts.filter((artifact) => values.has(artifact)).length;
    return count > 0 ? `${platform} ${count}` : undefined;
  }).filter((entry): entry is string => Boolean(entry));

  return `${artifacts.length} artifact${artifacts.length === 1 ? "" : "s"}${
    counts.length > 0 ? ` ${pc.dim(`· ${counts.join(" · ")}`)}` : ""
  }`;
}
