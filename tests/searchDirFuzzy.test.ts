import fs from 'fs/promises';
import path from 'path';
import { searchDirFuzzy } from '../src/tools/searchDirFuzzy.js';

describe('searchDirFuzzy', () => {
  let tempDir: string;
  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(process.cwd(), 'sdf-'));
    process.env.MCP_BASE_DIR = tempDir;
    await fs.writeFile(path.join(tempDir, 'match.txt'), 'a');
    await fs.writeFile(path.join(tempDir, 'another.txt'), 'b');
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
    delete process.env.MCP_BASE_DIR;
  });

  it('performs fuzzy search on directory entries', async () => {
    const results = await searchDirFuzzy('matc');
    const paths = results.map(r => r.path);
    expect(paths).toContain(path.join(tempDir, 'match.txt'));
  });
});
