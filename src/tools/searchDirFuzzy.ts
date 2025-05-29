import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fuzzysort from "fuzzysort";
import { resolvePath, validatePath } from "../utils/pathUtils.js";

const execPromise = promisify(exec);

interface DirSearchResult {
	path: string;
	type: "file" | "directory";
	name: string;
}

/**
 * Search for files and directories by name using fuzzy matching
 * @param query Fuzzy search query for file/directory names
 * @param subdir Optional subdirectory to limit search scope
 * @param maxResults Maximum number of results to return (default: 50)
 * @returns Array of matching files and directories
 */
export async function searchDirFuzzy(
	query: string,
	subdir?: string,
	maxResults: number = 50
): Promise<DirSearchResult[]> {
	try {
		// Resolve and validate the search directory
		const searchDir = subdir ? resolvePath(subdir) : resolvePath(".");
		validatePath(searchDir);

		// Get all files and directories in the search path
		const command = `find ${searchDir} -not -path "*/node_modules/*" -not -path "*/\\.git/*" -maxdepth 10`;

		const { stdout } = await execPromise(command);

		// Parse the output
		const paths = stdout.split("\n").filter((line) => line.trim() !== "");

		// Extract basenames for fuzzy matching
		const pathObjects = paths.map((p) => ({
			fullPath: p,
			basename: path.basename(p),
		}));

		// Perform fuzzy search on basenames
		const fuzzyResults = fuzzysort.go(query, pathObjects, {
			key: "basename",
			limit: maxResults,
			threshold: -10000, // Allow more fuzzy matches
		});

		// Convert fuzzy results to the expected format
		const results: DirSearchResult[] = [];

		for (const result of fuzzyResults) {
			try {
				const p = result.obj.fullPath;
				const { stdout: statOutput } = await execPromise(`stat -c "%F" "${p}"`);
				const type = statOutput.trim().includes("directory")
					? "directory"
					: "file";

				results.push({
					path: p,
					type,
					name: path.basename(p),
				});
			} catch (error) {
				// Skip entries that can't be stat'd
				continue;
			}
		}

		return results.slice(0, maxResults);
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(
				`Failed to search directory with fuzzy query ${query}: ${error.message}`
			);
		}
		throw error;
	}
}
