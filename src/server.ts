import { McpServer } from '@modelcontextprotocol/server';
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const SERVER_NAME = 're-webapp-factory';
const SERVER_VERSION = '0.1.0';
const ROOT = path.resolve(process.env.RE_WEBAPP_ROOT || process.cwd());

function ensureInsideRoot(target: string) {
  const resolved = path.resolve(target);
  const relative = path.relative(ROOT, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Path must stay inside RE_WEBAPP_ROOT: ${ROOT}`);
  }
  return resolved;
}

async function exists(file: string) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function run(command: string, args: string[], cwd: string) {
  return await new Promise<{ code: number; stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(command, args, { cwd, shell: process.platform === 'win32' });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d.toString()));
    child.stderr.on('data', (d) => (stderr += d.toString()));
    child.on('error', reject);
    child.on('close', (code) => resolve({ code: code ?? 1, stdout, stderr }));
  });
}

const standards = `# RE WEBAPP STANDARD\n\n- Font: Pretendard\n- Responsive: Mobile First, desktop compatible\n- Visual direction: minimal, simple, modern\n- Typography: deliberate hierarchy, line-height, letter-spacing, margin and padding\n- Version: visible in the UI\n- Storage: local-first; use LocalStorage for ordinary project state unless another store is explicitly requested\n- Recovery: restore work after refresh where practical\n- PWA: include manifest and installable baseline for new apps\n- Privacy: do not send user data to external services unless explicitly requested\n- Safe edit: preserve unrelated working features and prefer minimal changes over broad refactors\n- Git: inspect and test before committing; never push unless explicitly requested\n`;

function vanillaFiles(appName: string) {
  const title = appName.replace(/[-_]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
  return {
    'index.html': `<!doctype html>\n<html lang="ko">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <meta name="theme-color" content="#f7f7f5" />\n  <link rel="manifest" href="./manifest.webmanifest" />\n  <link rel="stylesheet" href="./src/style.css" />\n  <title>${title}</title>\n</head>\n<body>\n  <main class="app-shell">\n    <header class="topbar">\n      <div>\n        <p class="eyebrow">RE WEBAPP</p>\n        <h1>${title}</h1>\n      </div>\n      <span class="version">v0.1.0</span>\n    </header>\n\n    <section class="panel">\n      <label for="note">자동 저장 테스트</label>\n      <textarea id="note" placeholder="입력한 내용은 이 브라우저에 자동 저장됩니다."></textarea>\n      <p class="status" id="status">준비됨</p>\n    </section>\n  </main>\n  <script type="module" src="./src/app.js"></script>\n</body>\n</html>\n`,
    'src/style.css': `@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');\n\n:root {\n  font-family: Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;\n  color: #181817;\n  background: #f7f7f5;\n  font-synthesis: none;\n}\n* { box-sizing: border-box; }\nbody { margin: 0; min-width: 320px; }\nbutton, input, textarea { font: inherit; }\n.app-shell { width: min(100% - 32px, 920px); margin: 0 auto; padding: 28px 0 64px; }\n.topbar { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; margin-bottom: 40px; }\n.eyebrow { margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: .12em; }\nh1 { margin: 0; font-size: clamp(28px, 7vw, 48px); line-height: 1.05; letter-spacing: -.035em; }\n.version { flex: none; font-size: 12px; line-height: 1; padding: 8px 10px; border: 1px solid #d9d9d4; border-radius: 999px; }\n.panel { background: #fff; border: 1px solid #e4e4df; border-radius: 20px; padding: 20px; }\nlabel { display: block; margin-bottom: 10px; font-size: 14px; font-weight: 650; }\ntextarea { width: 100%; min-height: 220px; resize: vertical; border: 1px solid #dcdcd6; border-radius: 14px; padding: 14px 16px; line-height: 1.6; letter-spacing: -.01em; background: #fcfcfa; outline: none; }\ntextarea:focus { border-color: #98988f; }\n.status { margin: 10px 2px 0; font-size: 12px; color: #75756f; }\n@media (min-width: 720px) { .app-shell { padding-top: 48px; } .panel { padding: 28px; } }\n`,
    'src/app.js': `const STORAGE_KEY = 're:${appName}:note';\nconst note = document.querySelector('#note');\nconst status = document.querySelector('#status');\n\nnote.value = localStorage.getItem(STORAGE_KEY) || '';\nlet timer;\nnote.addEventListener('input', () => {\n  clearTimeout(timer);\n  status.textContent = '저장 중…';\n  timer = setTimeout(() => {\n    localStorage.setItem(STORAGE_KEY, note.value);\n    status.textContent = '자동 저장됨';\n  }, 250);\n});\n\nif ('serviceWorker' in navigator) {\n  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));\n}\n`,
    'manifest.webmanifest': JSON.stringify({ name: title, short_name: title.slice(0, 12), start_url: './', display: 'standalone', background_color: '#f7f7f5', theme_color: '#f7f7f5' }, null, 2),
    'sw.js': `const CACHE = 're-${appName}-v0.1.0';\nconst ASSETS = ['./', './index.html', './src/style.css', './src/app.js', './manifest.webmanifest'];\nself.addEventListener('install', (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS))));\nself.addEventListener('fetch', (event) => event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request))));\n`,
    'RE-STANDARD.md': standards,
    'package.json': JSON.stringify({ name: appName, private: true, version: '0.1.0', scripts: { dev: 'npx serve .', test: 'node -e "console.log(\\\"No automated tests configured yet\\\")"' } }, null, 2) + '\n'
  };
}

const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });

server.registerTool('create_webapp', {
  description: 'Create a new local-first vanilla webapp scaffold using the RE Webapp Standard. Never overwrites an existing non-empty directory.',
  inputSchema: z.object({
    name: z.string().min(1).regex(/^[a-zA-Z0-9._-]+$/),
    parentDir: z.string().optional().describe('Directory relative to RE_WEBAPP_ROOT. Defaults to root.'),
  })
}, async ({ name, parentDir }) => {
  const dir = ensureInsideRoot(path.join(ROOT, parentDir || '', name));
  if (await exists(dir)) {
    const current = await fs.readdir(dir);
    if (current.length > 0) throw new Error(`Refusing to overwrite non-empty directory: ${dir}`);
  }
  await fs.mkdir(dir, { recursive: true });
  for (const [relative, content] of Object.entries(vanillaFiles(name))) {
    const target = ensureInsideRoot(path.join(dir, relative));
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, content, 'utf8');
  }
  return { content: [{ type: 'text', text: `Created ${name} at ${dir}\nApplied: Pretendard, responsive UI, visible v0.1.0, LocalStorage autosave, PWA baseline, RE-STANDARD.md.` }] };
});

server.registerTool('apply_re_standard', {
  description: 'Add or refresh RE-STANDARD.md in an existing project without touching application code.',
  inputSchema: z.object({ projectDir: z.string().min(1) })
}, async ({ projectDir }) => {
  const dir = ensureInsideRoot(path.join(ROOT, projectDir));
  if (!(await exists(dir))) throw new Error(`Project not found: ${dir}`);
  await fs.writeFile(path.join(dir, 'RE-STANDARD.md'), standards, 'utf8');
  return { content: [{ type: 'text', text: `RE Webapp Standard written to ${path.join(dir, 'RE-STANDARD.md')}. No application files were modified.` }] };
});

server.registerTool('inspect_project', {
  description: 'Inspect a project directory, package version, git status, and presence of RE/PWA/local-storage signals. Read-only.',
  inputSchema: z.object({ projectDir: z.string().min(1) })
}, async ({ projectDir }) => {
  const dir = ensureInsideRoot(path.join(ROOT, projectDir));
  const files = await fs.readdir(dir).catch(() => []);
  let pkg: any = null;
  if (await exists(path.join(dir, 'package.json'))) {
    try { pkg = JSON.parse(await fs.readFile(path.join(dir, 'package.json'), 'utf8')); } catch {}
  }
  const git = await run('git', ['status', '--short'], dir).catch(() => ({ code: 1, stdout: '', stderr: 'git unavailable' }));
  const index = await fs.readFile(path.join(dir, 'index.html'), 'utf8').catch(() => '');
  const appJs = await fs.readFile(path.join(dir, 'src/app.js'), 'utf8').catch(() => '');
  const report = {
    directory: dir,
    version: pkg?.version ?? null,
    files,
    hasREStandard: files.includes('RE-STANDARD.md'),
    hasManifest: files.includes('manifest.webmanifest') || files.includes('manifest.json'),
    visibleVersionSignal: /v\d+\.\d+\.\d+/.test(index),
    localStorageSignal: /localStorage/.test(appJs),
    gitStatus: git.stdout.trim() || '(clean or not a git repository)',
    gitError: git.code === 0 ? null : git.stderr.trim()
  };
  return { content: [{ type: 'text', text: JSON.stringify(report, null, 2) }] };
});

server.registerTool('bump_version', {
  description: 'Bump package.json semantic version (patch/minor/major). Updates package.json only; does not commit or push.',
  inputSchema: z.object({ projectDir: z.string().min(1), level: z.enum(['patch', 'minor', 'major']).default('patch') })
}, async ({ projectDir, level }) => {
  const dir = ensureInsideRoot(path.join(ROOT, projectDir));
  const pkgPath = path.join(dir, 'package.json');
  const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
  const match = String(pkg.version || '').match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) throw new Error(`package.json version is not plain semver: ${pkg.version}`);
  let [major, minor, patch] = match.slice(1).map(Number);
  if (level === 'major') { major += 1; minor = 0; patch = 0; }
  if (level === 'minor') { minor += 1; patch = 0; }
  if (level === 'patch') patch += 1;
  pkg.version = `${major}.${minor}.${patch}`;
  await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  return { content: [{ type: 'text', text: `Version bumped to ${pkg.version}. UI version text was not changed automatically; update it deliberately after reviewing the project.` }] };
});

server.registerTool('test_webapp', {
  description: 'Run an existing npm test script, or report that no test script is configured. Does not install dependencies.',
  inputSchema: z.object({ projectDir: z.string().min(1) })
}, async ({ projectDir }) => {
  const dir = ensureInsideRoot(path.join(ROOT, projectDir));
  const pkg = JSON.parse(await fs.readFile(path.join(dir, 'package.json'), 'utf8'));
  if (!pkg.scripts?.test) return { content: [{ type: 'text', text: 'No npm test script is configured.' }] };
  const result = await run('npm', ['test', '--', '--runInBand'], dir);
  return { content: [{ type: 'text', text: `exit=${result.code}\n${result.stdout}\n${result.stderr}` }], isError: result.code !== 0 };
});

server.registerTool('git_commit', {
  description: 'Create a local git commit after showing current status. Never pushes. Refuses when working tree is clean.',
  inputSchema: z.object({ projectDir: z.string().min(1), message: z.string().min(3), addAll: z.boolean().default(false) })
}, async ({ projectDir, message, addAll }) => {
  const dir = ensureInsideRoot(path.join(ROOT, projectDir));
  const before = await run('git', ['status', '--short'], dir);
  if (before.code !== 0) throw new Error(before.stderr || 'Not a git repository');
  if (!before.stdout.trim()) throw new Error('Working tree is clean; nothing to commit.');
  if (addAll) {
    const add = await run('git', ['add', '-A'], dir);
    if (add.code !== 0) throw new Error(add.stderr || 'git add failed');
  }
  const commit = await run('git', ['commit', '-m', message], dir);
  return { content: [{ type: 'text', text: `Before:\n${before.stdout}\nCommit exit=${commit.code}\n${commit.stdout}\n${commit.stderr}\nNo push was performed.` }], isError: commit.code !== 0 };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
