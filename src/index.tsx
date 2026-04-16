#!/usr/bin/env node
import React, { useState } from 'react';
import { render, Box, Text, useApp, useInput } from 'ink';
import Spinner from 'ink-spinner';
import BigText from 'ink-big-text';
import Gradient from 'ink-gradient';
import { spawn, spawnSync } from 'node:child_process';

const INNER_FLAG = 'AIHUB_INNER';
const QUIT_CODE = 77;
const VERSION = '0.1.0';
const BRAND_COLOR = '#d97706';


type Cli = {
  id: 'claude' | 'codex' | 'gemini';
  label: string;
  command: string;
  vendor: string;
  tagline: string;
  accent: string;
  glyph: string;
};

const CLIS: Cli[] = [
  {
    id: 'claude',
    label: 'Claude Code',
    command: 'claude',
    vendor: 'Anthropic',
    tagline: 'agentic coding, built-in tools',
    accent: '#d97706',
    glyph: '✦',
  },
  {
    id: 'codex',
    label: 'OpenAI Codex',
    command: 'codex',
    vendor: 'OpenAI',
    tagline: 'code generation & precise edits',
    accent: '#10a37f',
    glyph: '◆',
  },
  {
    id: 'gemini',
    label: 'Gemini CLI',
    command: 'gemini',
    vendor: 'Google',
    tagline: 'multimodal assistant',
    accent: '#4285f4',
    glyph: '✧',
  },
];

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <Text>
      <Text color="gray" dimColor>
        [
      </Text>
      <Text color="white">{children}</Text>
      <Text color="gray" dimColor>
        ]
      </Text>
    </Text>
  );
}

function App({ onLaunch }: { onLaunch: (cli: Cli) => void }) {
  const [index, setIndex] = useState(0);
  const [launching, setLaunching] = useState<Cli | null>(null);
  const { exit } = useApp();

  useInput((input, key) => {
    if (launching) return;

    if (key.upArrow || input === 'k') {
      setIndex((i) => (i - 1 + CLIS.length) % CLIS.length);
      return;
    }
    if (key.downArrow || input === 'j') {
      setIndex((i) => (i + 1) % CLIS.length);
      return;
    }
    if (input >= '1' && input <= String(CLIS.length)) {
      const picked = CLIS[Number(input) - 1];
      if (picked) {
        setIndex(Number(input) - 1);
        setLaunching(picked);
        setTimeout(() => {
          exit();
          onLaunch(picked);
        }, 220);
      }
      return;
    }
    if (key.return) {
      const picked = CLIS[index];
      if (!picked) return;
      setLaunching(picked);
      setTimeout(() => {
        exit();
        onLaunch(picked);
      }, 220);
      return;
    }
    if (key.escape || input === 'q') {
      exit();
    }
  });

  const selected = CLIS[index];

  return (
    <Box flexDirection="column" paddingX={2} paddingBottom={1}>
      {/* Brand */}
      <Box flexDirection="column" marginBottom={1}>
        <Box flexDirection="row" alignItems="center">
          <Gradient name="morning">
            <BigText text="aihub" font="tiny" />
          </Gradient>
          <Box flexDirection="column" marginLeft={2} paddingTop={1}>
            <Box>
              <Text color={BRAND_COLOR} bold>v{VERSION}</Text>
              <Text color="gray" dimColor>{'   '}</Text>
              <Text color="white">{CLIS.length}</Text>
              <Text color="gray" dimColor>{' providers'}</Text>
            </Box>
            <Box>
              <Text color="gray" dimColor>
                launcher for AI coding CLIs
              </Text>
            </Box>
          </Box>
        </Box>
        <Box>
          <Text color="gray" dimColor>
            {'─'.repeat(48)}
          </Text>
        </Box>
      </Box>

      {/* List */}
      <Box flexDirection="column" marginBottom={1}>
        {CLIS.map((cli, i) => {
          const active = i === index;
          return (
            <Box flexDirection="column" marginBottom={1} key={cli.id}>
              <Box>
                <Text color={cli.accent} bold>
                  {active ? '▌ ' : '  '}
                </Text>
                <Text color={cli.accent} bold={active} dimColor={!active}>
                  {cli.glyph}
                  {'  '}
                </Text>
                <Text bold={active} color={active ? undefined : 'gray'}>
                  {cli.label}
                </Text>
                <Box flexGrow={1} />
                <Text color="gray" dimColor>
                  {cli.vendor}
                </Text>
              </Box>
              <Box>
                <Text color="gray" dimColor>
                  {'      '}
                  {cli.tagline}
                </Text>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Footer */}
      <Box>
        {launching ? (
          <Box>
            <Text color={launching.accent}>
              <Spinner type="dots" />
            </Text>
            <Text color="gray">{'  '}launching </Text>
            <Text color={launching.accent} bold>
              {launching.label}
            </Text>
            <Text color="gray" dimColor>
              {'  ·  '}
              {launching.vendor}
            </Text>
          </Box>
        ) : (
          <Box>
            <Kbd>↑↓</Kbd>
            <Text color="gray" dimColor>
              {' move   '}
            </Text>
            <Kbd>↵</Kbd>
            <Text color="gray" dimColor>
              {' launch   '}
            </Text>
            <Kbd>1–{CLIS.length}</Kbd>
            <Text color="gray" dimColor>
              {' jump   '}
            </Text>
            <Kbd>esc</Kbd>
            <Text color="gray" dimColor>
              {' quit'}
            </Text>
            {selected ? (
              <Text color="gray" dimColor>
                {'   ·   '}next: <Text color={selected.accent}>{selected.command}</Text>
              </Text>
            ) : null}
          </Box>
        )}
      </Box>
    </Box>
  );
}

function releaseStdin() {
  try {
    if (process.stdin.isTTY && typeof process.stdin.setRawMode === 'function') {
      process.stdin.setRawMode(false);
    }
    process.stdin.pause();
    process.stdin.removeAllListeners('data');
    process.stdin.removeAllListeners('readable');
    process.stdin.removeAllListeners('keypress');
  } catch {
    // ignore
  }
}

// After a child TUI exits, the shared TTY can be left in raw mode with a
// hidden cursor and stale key handlers. Put it back into a known-sane state
// before Ink tries to attach again.
function resetTerminal() {
  try {
    if (process.stdin.isTTY && typeof process.stdin.setRawMode === 'function') {
      process.stdin.setRawMode(false);
    }
    process.stdin.removeAllListeners('data');
    process.stdin.removeAllListeners('readable');
    process.stdin.removeAllListeners('keypress');
    process.stdin.resume();
    // show cursor + reset attributes, in case the child left them off
    process.stdout.write('\x1b[?25h\x1b[0m');
  } catch {
    // ignore
  }
}

function showMenu(): Promise<Cli | null> {
  return new Promise((resolve) => {
    let chosen: Cli | null = null;
    const { waitUntilExit } = render(
      <App
        onLaunch={(cli) => {
          chosen = cli;
        }}
      />,
    );
    waitUntilExit().then(() => resolve(chosen));
  });
}

function runChild(picked: Cli): Promise<number> {
  return new Promise((resolve) => {
    const args = process.argv.slice(2);
    const isWin = process.platform === 'win32';

    // On Windows, bypass Node's `shell: true` (which spawns an intermediate
    // cmd.exe that swallows keystrokes for interactive TUIs). Invoke cmd.exe
    // directly with /c so the child owns the console cleanly.
    const child = isWin
      ? spawn(
        process.env.ComSpec || 'cmd.exe',
        ['/d', '/s', '/c', picked.command, ...args],
        { stdio: 'inherit' },
      )
      : spawn(picked.command, args, { stdio: 'inherit' });

    child.on('error', (err: NodeJS.ErrnoException) => {
      console.error(
        `\n\x1b[31m✗\x1b[0m failed to launch \x1b[1m${picked.label}\x1b[0m: ${err.message}`,
      );
      if (err.code === 'ENOENT') {
        console.error(
          `  the \`${picked.command}\` command was not found on your PATH.`,
        );
      }
      resolve(1);
    });

    child.on('exit', (code) => resolve(code ?? 0));
  });
}

// INNER: one iteration — show menu, hand off to chosen CLI, exit.
// This process dies after each launch so the next iteration gets a
// pristine stdin. Workaround for Node's stdin getting wedged after a
// child TUI (raw-mode) exits in the same process.
async function runInner(): Promise<never> {
  const chosen = await showMenu();
  if (!chosen) process.exit(QUIT_CODE);
  releaseStdin();
  await new Promise<void>((r) => setImmediate(r));
  await runChild(chosen);
  process.exit(0);
}

// OUTER: the long-lived loop the user actually ran. Never touches stdin
// itself — just re-spawns inner processes until one reports QUIT_CODE.
function runOuter(): never {
  const runtime = process.argv[0];
  const scriptAndArgs = process.argv.slice(1);
  if (!runtime) {
    console.error('aihub: cannot determine runtime path');
    process.exit(1);
  }
  const result = spawnSync(runtime, scriptAndArgs, {
    stdio: 'inherit',
    env: { ...process.env, [INNER_FLAG]: '1' },
  });
  if (result.error) {
    console.error(`aihub: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status === QUIT_CODE) process.exit(0);
  process.exit(result.status ?? 0);
}

if (process.env[INNER_FLAG]) {
  runInner();
} else {
  runOuter();
}
