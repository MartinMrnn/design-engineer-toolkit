import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { ROOT } from './harness.mjs';

const HOOK = join(ROOT, 'hooks/never.mjs');
const sandbox = mkdtempSync(join(tmpdir(), 'never-'));
const bin = join(sandbox, 'bin');
mkdirSync(bin);
writeFileSync(join(bin, 'gh'), '#!/bin/sh\n[ "$FAKE_VISIBILITY" = FAIL ] && exit 1\necho "$FAKE_VISIBILITY"\n');
chmodSync(join(bin, 'gh'), 0o755);
after(() => rmSync(sandbox, { recursive: true, force: true }));

let count = 0;
const git = (cwd, ...args) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@example.com', '-c', 'commit.gpgsign=false', ...args], { cwd, stdio: 'ignore' });
const project = (files = {}) => {
  const root = join(sandbox, `p${count++}`);
  const all = {
    'design/decisions.md': 'decisions',
    'design/spec.md': 'spec',
    'design/inspiration/photo.md': 'the user',
    'design/inspiration/board.md': 'board',
    'design/inspiration/links.md': 'links',
    'src/index.html': '<p>Real copy</p>',
    ...files,
  };
  for (const [path, text] of Object.entries(all)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  git(root, 'init', '-q', '-b', 'main');
  git(root, 'add', '.');
  git(root, 'commit', '-qm', 'start');
  git(root, 'remote', 'add', 'origin', 'https://github.com/acme/site.git');
  return root;
};
const hook = (cwd, tool_name, tool_input, { visibility = 'PRIVATE', mode = 'default' } = {}) => {
  const result = spawnSync(process.execPath, [HOOK], {
    input: JSON.stringify({ tool_name, tool_input, cwd, permission_mode: mode }),
    encoding: 'utf8',
    env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, FAKE_VISIBILITY: visibility },
  });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout ? JSON.parse(result.stdout).hookSpecificOutput.permissionDecision : 'pass';
};
const bash = (cwd, command, options) => hook(cwd, 'Bash', { command }, options);

test('hooks.json runs the guard before every file edit and shell command', () => {
  const { hooks } = JSON.parse(readFileSync(join(ROOT, 'hooks/hooks.json'), 'utf8'));
  const [entry] = hooks.PreToolUse;
  for (const tool of ['Write', 'Edit', 'NotebookEdit', 'Bash']) assert.ok(entry.matcher.split('|').includes(tool), tool);
  assert.match(entry.hooks[0].command, /\$\{CLAUDE_PLUGIN_ROOT\}\/hooks\/never\.mjs/);
});

test('a file tool cannot change a user file', () => {
  const root = project();
  const photo = join(root, 'design/inspiration/photo.md');
  symlinkSync(join(root, 'design/inspiration'), join(root, 'alias'));
  assert.equal(hook(root, 'Edit', { file_path: photo }), 'deny');
  assert.equal(hook(root, 'Write', { file_path: 'design/inspiration/photo.md' }), 'deny');
  assert.equal(hook(root, 'Write', { file_path: 'design/../design/inspiration/photo.md' }), 'deny');
  assert.equal(hook(root, 'Edit', { file_path: join(root, 'alias/photo.md') }), 'deny');
  assert.equal(hook(root, 'NotebookEdit', { notebook_path: photo }), 'deny');
});

test('a file tool can write board.md, links.md and new files', () => {
  const root = project();
  for (const name of ['board.md', 'links.md', 'new-photo.md']) {
    assert.equal(hook(root, 'Write', { file_path: join(root, 'design/inspiration', name) }), 'pass', name);
  }
  assert.equal(hook(root, 'Edit', { file_path: join(root, 'design/spec.md') }), 'pass');
});

test('a shell command cannot change a user file', () => {
  const root = project();
  for (const command of [
    'rm design/inspiration/photo.md',
    'rm -rf design',
    'rm design/inspiration/*',
    'cd design/inspiration && rm photo.md',
    'mv design/inspiration/photo.md elsewhere.md',
    'cp design/spec.md design/inspiration/photo.md',
    'echo x > design/inspiration/photo.md',
    'echo x >> design/inspiration/photo.md',
    "sed -i '' s/a/b/ design/inspiration/photo.md",
    'find design/inspiration -type f -delete',
    'git rm design/inspiration/photo.md',
    'git clean -fdx',
    'git checkout -- design/inspiration/photo.md',
  ]) assert.equal(bash(root, command), 'deny', command);
  assert.equal(bash(sandbox, `rm ${join(root, 'design/inspiration/photo.md')}`), 'deny', 'from another folder');
});

test('ordinary shell commands pass', () => {
  const root = project();
  for (const command of [
    'cat design/inspiration/photo.md > /dev/null',
    "sed -i '' s/a/b/ design/spec.md",
    'rm design/inspiration/board.md',
    'echo x >> design/inspiration/links.md',
    'mv design/spec.md design/inspiration/',
    'cp design/decisions.md design/inspiration/new.md',
    'git status',
    'git checkout main',
    'git restore --staged .',
    'git clean -n',
    "cat <<'E'\nrm design/inspiration/photo.md\nE",
    'ls design/inspiration 2>&1 | head',
  ]) assert.equal(bash(root, command), 'pass', command);
});

test('going public is refused', () => {
  const root = project();
  for (const command of ['git push', 'git push -u origin main', 'git -C . push']) {
    assert.equal(bash(root, command, { visibility: 'PUBLIC' }), 'deny', command);
  }
  assert.equal(bash(root, 'git push', { visibility: 'FAIL' }), 'deny', 'unknown visibility');
  for (const command of [
    'gh repo create site --public --source .',
    'gh repo edit --visibility public --accept-visibility-change-consequences',
    'gh api -X PATCH repos/acme/site -f private=false',
    'gh api -X PATCH repos/acme/site -f visibility=public',
  ]) assert.equal(bash(root, command), 'deny', command);
});

test('going public is refused in every permission mode', () => {
  const root = project();
  for (const mode of ['default', 'acceptEdits', 'auto', 'bypassPermissions', 'dontAsk']) {
    assert.equal(bash(root, 'git push', { visibility: 'PUBLIC', mode }), 'deny', mode);
  }
});

test('private pushes and read-only gh commands pass', () => {
  const root = project();
  assert.equal(bash(root, 'git push -u origin main'), 'pass');
  assert.equal(bash(root, 'git push', { visibility: 'INTERNAL' }), 'pass');
  assert.equal(bash(root, 'gh repo create site --private --source . --remote origin'), 'pass');
  assert.equal(bash(root, 'gh api repos/acme/site --jq .visibility'), 'pass');
  assert.equal(bash(root, "gh api repos/acme/site --jq '.visibility==\"public\"'"), 'pass');
});

test('a push is refused while src/ holds placeholder text', () => {
  for (const text of ['<p>Lorem ipsum</p>', '<p>[à fournir]</p>', '<p>[À fournir : téléphone]</p>']) {
    assert.equal(bash(project({ 'src/index.html': text }), 'git push -u origin main'), 'deny', text);
  }
});

test('placeholder text in design/ does not stop a push', () => {
  const root = project({ 'design/content.md': 'Téléphone : [à fournir]', 'src/index.html': '<p>Colorem</p>' });
  assert.equal(bash(root, 'git push'), 'pass');
});

test('inside a project a failure of the guard blocks the action', () => {
  assert.equal(hook(project(), 'Bash', {}), 'deny');
});

test('outside a design-studio project the hook stays silent', () => {
  const other = project();
  rmSync(join(other, 'design/decisions.md'));
  assert.equal(bash(other, 'rm design/inspiration/photo.md'), 'pass');
  assert.equal(bash(other, 'git push', { visibility: 'PUBLIC' }), 'pass');
  assert.equal(bash(other, 'gh repo create site --public'), 'pass');
  assert.equal(hook(other, 'Edit', { file_path: join(other, 'design/inspiration/photo.md') }), 'pass');
  assert.equal(hook(other, 'Bash', {}), 'pass');
});
