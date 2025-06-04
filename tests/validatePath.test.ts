import fs from 'fs';
import path from 'path';
import { validatePath } from '../src/utils/pathUtils.js';

describe('validatePath', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(process.cwd(), 'vp-'));
    process.env.MCP_BASE_DIR = tempDir;
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
    delete process.env.MCP_BASE_DIR;
  });

  it('resolves relative paths within base directory', () => {
    const result = validatePath('file.txt');
    expect(result).toBe(path.join(tempDir, 'file.txt'));
  });

  it('throws for paths outside the base directory', () => {
    expect(() => validatePath('../outside.txt')).toThrow('Access denied');
  });
});
