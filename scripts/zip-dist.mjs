import { execFile } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

await mkdir('release', { recursive: true });
await execFileAsync('zip', ['-r', '../release/videosays-chrome-extension.zip', '.'], { cwd: 'dist' });
console.log('Created release/videosays-chrome-extension.zip');
