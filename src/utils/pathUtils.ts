import path from "path";

/**
 * Get the base directory for MCP operations
 * This can be set via MCP_BASE_DIR environment variable
 * Defaults to current working directory
 */
export function getBaseDir(): string {
	return process.env.MCP_BASE_DIR || process.cwd();
}

/**
 * Resolve a path relative to the MCP base directory
 * If the path is already absolute, return it as-is
 * Otherwise, resolve it relative to the base directory
 */
export function resolvePath(filePath: string): string {
	if (path.isAbsolute(filePath)) {
		return filePath;
	}
	return path.resolve(getBaseDir(), filePath);
}

/**
 * Ensure a path is within the base directory for security
 * Throws an error if the path tries to escape the base directory
 */
export function validatePath(filePath: string): string {
	const resolvedPath = resolvePath(filePath);
	const baseDir = getBaseDir();

	if (!resolvedPath.startsWith(baseDir)) {
		throw new Error(
			`Access denied: Path ${filePath} is outside the allowed base directory`
		);
	}

	return resolvedPath;
}
