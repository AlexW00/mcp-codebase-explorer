import fs from 'fs/promises';
import path from 'path';
import { searchDir } from '../src/tools/searchDir.js';

describe('searchDir', () => {
  let tempDir: string;
  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(process.cwd(), 'sd-'));
    process.env.MCP_BASE_DIR = tempDir;
    await fs.writeFile(path.join(tempDir, 'match.txt'), 'a');
    await fs.mkdir(path.join(tempDir, 'sub'));
    await fs.writeFile(path.join(tempDir, 'sub', 'match2.txt'), 'b');
    await fs.writeFile(path.join(tempDir, 'other.txt'), 'c');
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
    delete process.env.MCP_BASE_DIR;
  });

  it('finds files matching regex in paths', async () => {
    const results = await searchDir('match');
    const paths = results.map(r => r.path);
    expect(paths).toEqual(expect.arrayContaining([
      path.join(tempDir, 'match.txt'),
      path.join(tempDir, 'sub', 'match2.txt')
    ]));
  });
});
