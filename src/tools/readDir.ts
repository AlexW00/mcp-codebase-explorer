import { promises as fs } from "fs";
import path from "path";
import { validatePath } from "../utils/pathUtils.js";

/**
 * Reads a directory and returns its contents
 * @param dirPath Path to the directory to read (relative to base directory)
 * @param maxResults Maximum number of results to return (default: 100)
 * @returns Array of directory entries with name, path, and type
 */
export async function readDir(
	dirPath: string,
	maxResults: number = 100
): Promise<Array<{ name: string; path: string; type: "file" | "directory" }>> {
	try {
		// Validate and resolve the path relative to base directory
		const absolutePath = validatePath(dirPath);

		// Check if the directory exists
		await fs.access(absolutePath);

		// Read the directory
		const entries = await fs.readdir(absolutePath, { withFileTypes: true });

		// Map directory entries to the required format and limit results
		const result = entries.slice(0, maxResults).map((entry) => {
			const entryPath = path.join(absolutePath, entry.name);
			return {
				name: entry.name,
				path: entryPath,
				type: entry.isDirectory() ? ("directory" as const) : ("file" as const),
			};
		});

		return result;
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to read directory ${dirPath}: ${error.message}`);
		}
		throw error;
	}
}
