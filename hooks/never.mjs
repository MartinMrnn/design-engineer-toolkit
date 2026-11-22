// Guards the Never actions of a design-studio project (a folder with design/decisions.md); silent elsewhere.
// shortcut: reads ordinary shell commands, not scripts (python -c, bash -c, xargs); a guard-rail, not a sandbox.
import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';

const EXEMPT = new Set(['board.md', 'links.md']);
const WRAPPERS = new Set(['sudo', 'command', 'env', 'nohup', 'time', 'exec', '{', '!', 'then', 'do', 'else']);
const REMOVERS = new Set(['rm', 'unlink', 'shred', 'truncate', 'tee']);
const NO_PROMPT = new Set(['bypassPermissions', 'dontAsk']);
const USER_FILE = "design-studio: this is one of the user's files in design/inspiration/. It is never edited, moved or deleted (only board.md and links.md may change). Tell the user; do not work around this.";

const answer = (permissionDecision, permissionDecisionReason) => console.log(JSON.stringify({
  hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision, permissionDecisionReason },
}));
const run = (file, args) => execFileSync(file, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 8000 }).trim();

// Resolves symlinks, .. and the true case of what exists; the part that does not exist yet is kept.
const real = (path) => {
  const rest = [];
  let at = resolve(path);
  while (!existsSync(at) && dirname(at) !== at) {
    rest.unshift(basename(at));
    at = dirname(at);
  }
  return join(realpathSync.native(at), ...rest);
};
const inside = (path, folder) => {
  const to = relative(folder, path);
  return to !== '' && to !== '..' && !to.startsWith(`..${sep}`);
};
const projectOf = (path) => {
  for (let at = real(path); ; at = dirname(at)) {
    if (existsSync(join(at, 'design/decisions.md'))) return at;
    if (dirname(at) === at) return null;
  }
};
// The user's files at this path: the file itself, or those under it when it is a folder.
const userFilesAt = (path) => {
  const target = real(path);
  const root = projectOf(target);
  if (!root) return [];
  const folder = real(join(root, 'design/inspiration'));
  if (!existsSync(folder)) return [];
  return readdirSync(folder, { recursive: true })
    .map((name) => join(folder, name))
    .filter((file) => !lstatSync(file).isDirectory() && !(dirname(file) === folder && EXEMPT.has(basename(file))))
    .filter((file) => file === target || inside(file, target));
};

// Splits a command into simple commands, each with its words and the files it redirects output to.
const parse = (command) => {
  const segments = [{ words: [], outputs: [] }];
  let word = null;
  let quote = null;
  let output = false;
  let heredocs = [];
  const end = () => {
    if (word === null) return;
    (output ? segments.at(-1).outputs : segments.at(-1).words).push(word);
    word = null;
    output = false;
  };
  for (let i = 0; i < command.length; i++) {
    const c = command[i];
    if (quote) {
      if (c === quote) quote = null;
      else if (c === '\\' && quote === '"') word += command[++i] ?? '';
      else word += c;
    } else if (c === '"' || c === "'") {
      quote = c;
      word ??= '';
    } else if (c === '\\') {
      i++;
      if (command[i] !== '\n') word = (word ?? '') + (command[i] ?? '');
    } else if (c === '#' && word === null) {
      while (i + 1 < command.length && command[i + 1] !== '\n') i++;
    } else if (command.startsWith('<<<', i)) {
      end();
      i += 2;
    } else if (command.startsWith('<<', i)) {
      end();
      const tag = /^<<-?\s*['"\\]?([\w.-]+)['"]?/.exec(command.slice(i));
      if (tag) heredocs.push(tag[1]);
      i += (tag ? tag[0].length : 2) - 1;
    } else if (c === '>') {
      if (/^\d+$/.test(word ?? '')) word = null;
      end();
      if (command[i + 1] === '>') i++;
      if (command[i + 1] === '&') {
        i++;
        while (/\d/.test(command[i + 1] ?? '')) i++;
      } else output = true;
    } else if (';|&()\n'.includes(c)) {
      end();
      segments.push({ words: [], outputs: [] });
      if (c === '\n') {
        for (const tag of heredocs) {
          for (;;) {
            const stop = command.indexOf('\n', i + 1);
            const line = command.slice(i + 1, stop < 0 ? undefined : stop);
            i = stop < 0 ? command.length : stop;
            if (stop < 0 || line.trim() === tag) break;
          }
        }
        heredocs = [];
      }
    } else if (/\s/.test(c)) {
      end();
    } else {
      word = (word ?? '') + c;
    }
  }
  end();
  return segments;
};

const expand = (token) => token.replace(/^(~|\$HOME|\$\{HOME\})(?=\/|$)/, homedir());
// A glob counts as the folder it starts from.
const pathOf = (token, base) => {
  const glob = token.search(/[*?[{]/);
  return resolve(base, expand(glob < 0 ? token : dirname(`${token.slice(0, glob)}x`)));
};
const hits = (token, base) => userFilesAt(pathOf(token, base)).length > 0;
const operands = (args) => {
  const stop = args.indexOf('--');
  const before = stop < 0 ? args : args.slice(0, stop);
  const after = stop < 0 ? [] : args.slice(stop + 1);
  return [...before.filter((arg) => !arg.startsWith('-')), ...after].filter(Boolean);
};
// cp and mv: does the last operand land on a user file?
const overwrites = (list, base) => {
  if (list.length < 2) return false;
  const to = pathOf(list.at(-1), base);
  const folder = existsSync(to) && statSync(to).isDirectory();
  return list.slice(0, -1).some((from) => userFilesAt(folder ? join(to, basename(from)) : to).length > 0);
};
const destroys = (cmd, args, base) => {
  const list = operands(args);
  const hit = (token) => hits(token, base);
  if (REMOVERS.has(cmd)) return list.some(hit);
  if (cmd === 'sed' || cmd === 'perl') return args.some((arg) => /^-[a-zA-Z]*i/.test(arg) || arg.startsWith('--in-place')) && list.some(hit);
  if (cmd === 'dd') return args.some((arg) => arg.startsWith('of=') && hit(arg.slice(3)));
  if (cmd === 'mv') return list.slice(0, -1).some(hit) || overwrites(list, base);
  if (cmd === 'cp') return overwrites(list, base);
  if (cmd === 'find') {
    const acts = args.includes('-delete') || args.some((arg, i) => /^-exec(dir)?$/.test(arg) && ['mv', ...REMOVERS].includes(basename(args[i + 1] ?? '')));
    const end = args.findIndex((arg) => /^[-(!]/.test(arg));
    const starts = args.slice(0, end < 0 ? args.length : end);
    return acts && (starts.length ? starts : ['.']).some(hit);
  }
  return false;
};

const gitParts = (args, base) => {
  let i = 0;
  let dir = base;
  while (args[i]?.startsWith('-')) {
    if (args[i] === '-C') dir = resolve(dir, expand(args[++i] ?? '.'));
    else if (args[i] === '-c') i++;
    i++;
  }
  return { sub: args[i], rest: args.slice(i + 1), dir };
};
const gitDestroys = ({ sub, rest, dir }) => {
  const list = operands(rest);
  const hit = (token) => hits(token, dir);
  if (sub === 'rm' || sub === 'checkout') return list.some(hit);
  if (sub === 'restore') return (!rest.includes('--staged') || rest.includes('--worktree')) && list.some(hit);
  if (sub === 'mv') return list.slice(0, -1).some(hit) || overwrites(list, dir);
  if (sub === 'clean') return rest.some((arg) => arg === '--force' || /^-[a-zA-Z]*f/.test(arg)) && (list.length ? list : ['.']).some(hit);
  return false;
};
// shortcut: reads HEAD, not the refspec pushed; the studio pushes the branch it is on.
const placeholders = (root) => {
  let found;
  try {
    // git's case folding of à depends on the locale, so it only pre-filters; the regex below decides.
    found = run('git', ['-C', root, 'grep', '-nIiE', 'lorem|fournir', 'HEAD', '--', 'src']);
  } catch (error) {
    if (error.status === 1) return [];
    throw error;
  }
  return found.split('\n')
    .filter((line) => /\blorem\b|\[à fournir/i.test(line.split(':').slice(3).join(':')))
    .map((line) => line.slice('HEAD:'.length));
};
const remoteOf = (rest, dir) => {
  const named = operands(rest)[0];
  if (named) return named;
  try {
    return run('git', ['-C', dir, 'config', `branch.${run('git', ['-C', dir, 'branch', '--show-current'])}.remote`]);
  } catch {
    return 'origin';
  }
};
const visibility = (remote, dir) => {
  try {
    const url = /[/:]/.test(remote) ? remote : run('git', ['-C', dir, 'remote', 'get-url', remote]);
    return run('gh', ['repo', 'view', url, '--json', 'visibility', '--jq', '.visibility']);
  } catch {
    return 'UNKNOWN';
  }
};
const publishes = (args) => {
  if (args[0] === 'repo' && args[1] === 'create') return args.some((arg) => /^--public\b/.test(arg));
  if (args[0] === 'repo' && args[1] === 'edit') return args.some((arg) => arg.startsWith('--visibility'));
  if (args[0] === 'api') return args.some((arg) => /visibility=(?!=)|private=false/.test(arg));
  return false;
};

const inspect = (command, cwd) => {
  let base = cwd;
  let ask = null;
  for (const { words, outputs } of parse(command)) {
    if (outputs.some((file) => hits(file, base))) return ['deny', USER_FILE];
    while (WRAPPERS.has(words[0]) || /^\w+=/.test(words[0] ?? '')) words.shift();
    if (!words.length) continue;
    const cmd = basename(words[0]);
    const args = words.slice(1);
    if (cmd === 'cd' || cmd === 'pushd') {
      if (args[0] !== '-') base = resolve(base, expand(args[0] ?? homedir()));
    } else if (cmd === 'git') {
      const git = gitParts(args, base);
      if (gitDestroys(git)) return ['deny', USER_FILE];
      const root = git.sub === 'push' && projectOf(git.dir);
      if (root) {
        const lines = placeholders(root);
        if (lines.length) return ['deny', `design-studio: src/ still holds placeholder text, so it cannot ship:\n${lines.slice(0, 5).join('\n')}\nAsk the user for the real content.`];
        const remote = remoteOf(git.rest, git.dir);
        const seen = visibility(remote, git.dir);
        if (!['PRIVATE', 'INTERNAL'].includes(seen)) ask = `design-studio: the remote "${remote}" is ${seen === 'PUBLIC' ? 'public' : 'of unknown visibility'}. Pushing to it needs your consent.`;
      }
    } else if (cmd === 'gh') {
      if (publishes(args) && projectOf(base)) ask = 'design-studio: this makes a repository public or changes its visibility. It needs your consent.';
    } else if (destroys(cmd, args, base)) {
      return ['deny', USER_FILE];
    }
  }
  return ask && ['ask', ask];
};

const decide = ({ tool_name: tool, tool_input: input, cwd = process.cwd(), permission_mode: mode }) => {
  if (tool !== 'Bash') {
    const path = input.file_path ?? input.notebook_path;
    return path && userFilesAt(resolve(cwd, path)).length ? ['deny', USER_FILE] : null;
  }
  const found = inspect(input.command, cwd);
  if (found?.[0] === 'ask' && NO_PROMPT.has(mode)) return ['deny', `${found[1]} This mode cannot ask for it: tell the user, and do not work around this.`];
  return found;
};

let call = {};
try {
  call = JSON.parse(readFileSync(0, 'utf8'));
  const found = decide(call);
  if (found) answer(...found);
} catch (error) {
  const at = call.tool_input?.file_path ?? call.tool_input?.notebook_path ?? '.';
  if (projectOf(resolve(call.cwd ?? process.cwd(), at))) answer('deny', `design-studio: the guard failed, so the action is blocked: ${error.message}`);
}
