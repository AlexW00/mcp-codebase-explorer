import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { resolvePath, validatePath } from "../utils/pathUtils.js";

const execPromise = promisify(exec);

interface DirSearchResult {
	path: string;
	type: "file" | "directory";
	name: string;
}

/**
 * Search for files and directories by name using regex
 * @param regex Regular expression pattern to match file/directory names
 * @param subdir Optional subdirectory to limit search scope
 * @param maxResults Maximum number of results to return (default: 50)
 * @returns Array of matching files and directories
 */
export async function searchDir(
	regex: string,
	subdir?: string,
	maxResults: number = 50
): Promise<DirSearchResult[]> {
	try {
		// Resolve and validate the search directory
		const searchDir = subdir ? resolvePath(subdir) : resolvePath(".");
		validatePath(searchDir);

		// Construct the find command with regex pattern
		// Using find with -regex option for regex matching of paths
		const command = `find ${searchDir} -regextype posix-extended -regex ".*${regex}.*" -not -path "*/node_modules/*" -not -path "*/\\.git/*" -maxdepth 10 | head -n ${maxResults}`;

		const { stdout } = await execPromise(command);

		// Parse the output
		const paths = stdout.split("\n").filter((line) => line.trim() !== "");

		// Get file/directory information for each path
		const results: DirSearchResult[] = [];

		for (const p of paths) {
			try {
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
				`Failed to search directory with regex ${regex}: ${error.message}`
			);
		}
		throw error;
	}
}
