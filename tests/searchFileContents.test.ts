import fs from 'fs/promises';
import path from 'path';
import { searchFileContentsRegex } from '../src/tools/searchFileContentsRegex.js';
import { searchFileContentsFuzzy } from '../src/tools/searchFileContentsFuzzy.js';

describe('searchFileContentsRegex', () => {
  let tempDir: string;
  let filePath: string;
  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(process.cwd(), 'sfr-'));
    process.env.MCP_BASE_DIR = tempDir;
    filePath = path.join(tempDir, 'file.txt');
    await fs.writeFile(filePath, 'hello world\nsecond line');
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
    delete process.env.MCP_BASE_DIR;
  });

  it('finds lines matching regex', async () => {
    const results = await searchFileContentsRegex('hello');
    expect(results[0]).toMatchObject({ file: filePath, line: 1 });
    expect(results[0].content).toContain('hello');
  });
});

describe('searchFileContentsFuzzy', () => {
  let tempDir: string;
  let filePath: string;
  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(process.cwd(), 'sff-'));
    process.env.MCP_BASE_DIR = tempDir;
    filePath = path.join(tempDir, 'file.txt');
    await fs.writeFile(filePath, 'hello world\nsecond line');
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
    delete process.env.MCP_BASE_DIR;
  });

  it('finds fuzzy matches in file contents', async () => {
    const results = await searchFileContentsFuzzy('helo');
    const paths = results.map(r => r.file);
    expect(paths).toContain(filePath);
  });
});
