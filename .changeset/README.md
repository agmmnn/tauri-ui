This directory is used by Changesets to manage package releases.

Create a new changeset before merging package changes:

```bash
bun run changeset
```

When changesets land on `main`, the release workflow will open or update a release PR.
Merging that PR publishes `create-tauri-ui` to npm via npm trusted publishing.
