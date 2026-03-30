---
"create-tauri-ui": patch
---

Improve the generated desktop shell and debug tooling.

- scope the generated scroll container to a dedicated root shell so starter layouts do not create nested `main` scrollbars
- refresh the development debug panel with a denser inspector-style layout, improved docking behavior, and a dedicated tool palette
- polish the workflow setup prompts with clearer target OS labels and document generated CSS battery behavior more clearly
