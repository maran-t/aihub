# aihub

`aihub` is an interactive terminal launcher for AI coding CLIs. It presents a simple Ink-based menu so you can pick and open one of the configured tools from a single entrypoint.

Currently included:

- Claude Code
- OpenAI Codex
- Gemini CLI

## Features

- Built with Bun, TypeScript, React, and Ink
- Keyboard-driven terminal UI
- Fast provider selection with arrow keys or number shortcuts
- Passes command-line arguments through to the selected CLI
- Includes Windows-specific terminal reset handling for interactive child TUIs

## Tech Stack

- Bun
- TypeScript
- React
- Ink

## Project Structure

```text
.
├─ src/
│  └─ index.tsx
├─ package.json
├─ tsconfig.json
└─ bunfig.toml
```

## Requirements

- Bun `>=1.1.0`
- The CLI tools you want to launch must already be installed and available on your `PATH`
  - `claude`
  - `codex`
  - `gemini`

## Install Dependencies

```bash
bun install
```

## Run In Development

```bash
bun run src/index.tsx
```

Or use the existing script:

```bash
bun run dev
```

## Controls

- `↑` / `↓` or `j` / `k`: move between providers
- `Enter`: launch selected CLI
- `1-3`: jump directly to a provider
- `Esc` or `q`: quit

Any extra arguments passed to `aihub` are forwarded to the selected CLI.

## Available Scripts

- `bun run dev` - run the app from source
- `bun run start` - run the compiled app from `dist/index.js`
- `bun run typecheck` - run TypeScript type checking

## Current Status

The package metadata is set up for a distributable CLI, but the repository does not currently include a build script that generates `dist/index.js`. Right now, the reliable way to use the project is to run it from source with Bun.

## Notes

- On Windows, the launcher uses a parent/child process handoff to avoid broken stdin state after closing interactive TUIs.
- If a selected command is not installed, the app reports that the executable was not found on your `PATH`.

## License

No license file is currently included in this repository.
