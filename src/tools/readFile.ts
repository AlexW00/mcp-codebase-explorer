import { promises as fs } from "fs";
import { validatePath } from "../utils/pathUtils.js";

/**
 * Reads a file with optional start and end line parameters
 * @param filePath Path to the file to read (relative to base directory)
 * @param from Optional starting line (0-indexed)
 * @param to Optional ending line (0-indexed, exclusive)
 * @returns File content as string
 */
export async function readFile(
	filePath: string,
	from?: number,
	to?: number
): Promise<string> {
	try {
		// Validate and resolve the path relative to base directory
		const absolutePath = validatePath(filePath);

		// Check if the file exists
		await fs.access(absolutePath);

		// If no range is specified, return the entire file
		if (from === undefined && to === undefined) {
			return await fs.readFile(absolutePath, "utf-8");
		}

		// Read the file content
		const content = await fs.readFile(absolutePath, "utf-8");
		const lines = content.split("\n");

		// Apply line range if specified
		const startLine = from !== undefined ? Math.max(0, from) : 0;
		const endLine =
			to !== undefined ? Math.min(lines.length, to) : lines.length;

		// Return the specified range
		return lines.slice(startLine, endLine).join("\n");
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to read file ${filePath}: ${error.message}`);
		}
		throw error;
	}
}
