import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import fuzzysort from "fuzzysort";
import { resolvePath, validatePath } from "../utils/pathUtils.js";

const execPromise = promisify(exec);

interface SearchResult {
	file: string;
	line: number;
	content: string;
	beforeContext: string[];
	afterContext: string[];
}

/**
 * Search file contents using fuzzy matching
 * @param query Fuzzy search query
 * @param subdir Optional subdirectory to limit search scope
 * @param maxResults Maximum number of results to return (default: 25)
 * @param context Number of lines of context before and after match (default: 5)
 * @returns Array of search results with file path, line number, and content
 */
export async function searchFileContentsFuzzy(
	query: string,
	subdir?: string,
	maxResults: number = 25,
	context: number = 5
): Promise<SearchResult[]> {
	try {
		// Resolve and validate the search directory
		const searchDir = subdir ? resolvePath(subdir) : resolvePath(".");
		validatePath(searchDir);

		// First, get a list of all files in the directory
		const { stdout: fileList } = await execPromise(
			`find ${searchDir} -type f -not -path "*/node_modules/*" -not -path "*/\\.git/*"`
		);
		const files = fileList.split("\n").filter((file) => file.trim() !== "");

		// Process each file to find fuzzy matches
		const results: SearchResult[] = [];

		for (const file of files) {
			if (results.length >= maxResults) break;

			try {
				// Read file content
				const content = await fs.readFile(file, "utf-8");
				const lines = content.split("\n");

				// Perform fuzzy search on each line
				const matches = lines
					.map((line, index) => {
						const result = fuzzysort.single(query, line);
						return { line, index, score: result ? result.score : -Infinity };
					})
					.filter((match) => match.score > -1000) // Filter out very low scores
					.sort((a, b) => b.score - a.score) // Sort by score descending
					.slice(0, 5); // Limit matches per file

				// Add matches to results
				for (const match of matches) {
					if (results.length >= maxResults) break;

					// Get context lines
					const lineNumber = match.index + 1; // 1-based line number
					const startContext = Math.max(0, match.index - context);
					const endContext = Math.min(lines.length - 1, match.index + context);

					const beforeContext = lines.slice(startContext, match.index);
					const afterContext = lines.slice(match.index + 1, endContext + 1);

					results.push({
						file,
						line: lineNumber,
						content: match.line,
						beforeContext,
						afterContext,
					});
				}
			} catch (error) {
				// Skip files that can't be read
				continue;
			}
		}

		return results.slice(0, maxResults);
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(
				`Failed to search file contents with fuzzy query ${query}: ${error.message}`
			);
		}
		throw error;
	}
}
