---
"create-tauri-ui": patch
---

Use the `tauri-action` input names declared by the pinned `tauri-apps/tauri-action@action-v1.0.0`. Generated release workflows passed `assetNamePattern` and `includeUpdaterJson`, which the action renamed to `releaseAssetNamePattern` and `uploadUpdaterJson`; GitHub Actions silently drops undeclared `with:` keys, so generated releases kept Tauri's default asset names and published an updater `latest.json` despite the explicit opt-out.
