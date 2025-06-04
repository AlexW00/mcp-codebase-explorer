import fs from 'fs/promises';
import path from 'path';
import { readDir } from '../src/tools/readDir.js';

describe('readDir', () => {
  let tempDir: string;
  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(process.cwd(), 'rd-'));
    process.env.MCP_BASE_DIR = tempDir;
    await fs.writeFile(path.join(tempDir, 'file.txt'), 'hello');
    await fs.mkdir(path.join(tempDir, 'sub'));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
    delete process.env.MCP_BASE_DIR;
  });

  it('lists directory contents with types', async () => {
    const results = await readDir('.');
    expect(results).toEqual(
      expect.arrayContaining([
        { name: 'file.txt', path: path.join(tempDir, 'file.txt'), type: 'file' },
        { name: 'sub', path: path.join(tempDir, 'sub'), type: 'directory' }
      ])
    );
  });

  it('respects maxResults', async () => {
    const results = await readDir('.', 1);
    expect(results.length).toBe(1);
  });
});
