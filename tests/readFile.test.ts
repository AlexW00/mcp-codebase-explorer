import fs from 'fs/promises';
import path from 'path';
import { readFile } from '../src/tools/readFile.js';

describe('readFile', () => {
  let tempDir: string;
  const fileName = 'test.txt';
  const fileContent = 'line1\nline2\nline3\nline4';

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(process.cwd(), 'rf-'));
    process.env.MCP_BASE_DIR = tempDir;
    await fs.writeFile(path.join(tempDir, fileName), fileContent);
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
    delete process.env.MCP_BASE_DIR;
  });

  it('reads the entire file when no range is specified', async () => {
    const result = await readFile(fileName);
    expect(result).toBe(fileContent);
  });

  it('reads a specific range of lines', async () => {
    const result = await readFile(fileName, 1, 3);
    expect(result).toBe('line2\nline3');
  });
});
