import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
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
 * Search file contents using regex pattern
 * @param regex Regular expression pattern to search for
 * @param subdir Optional subdirectory to limit search scope
 * @param maxResults Maximum number of results to return (default: 25)
 * @param context Number of lines of context before and after match (default: 5)
 * @returns Array of search results with file path, line number, and content
 */
export async function searchFileContentsRegex(
	regex: string,
	subdir?: string,
	maxResults: number = 25,
	context: number = 5
): Promise<SearchResult[]> {
	try {
		// Resolve and validate the search directory
		const searchDir = subdir ? resolvePath(subdir) : resolvePath(".");
		validatePath(searchDir);

		// Construct the ripgrep command
		// Using -n for line numbers, -A and -B for context, --json for structured output
		const command = `rg "${regex}" ${searchDir} -n --json -A ${context} -B ${context} --max-count=${maxResults}`;

		const { stdout } = await execPromise(command);

		// Parse the JSON output from ripgrep
		const results: SearchResult[] = [];
		const lines = stdout.split("\n").filter((line) => line.trim() !== "");

		let currentMatch: Partial<SearchResult> | null = null;
		let beforeContext: string[] = [];
		let afterContext: string[] = [];

		for (const line of lines) {
			try {
				const data = JSON.parse(line);

				if (data.type === "match") {
					// If we have a previous match, push it to results
					if (
						currentMatch &&
						currentMatch.file &&
						currentMatch.line !== undefined &&
						currentMatch.content
					) {
						results.push({
							file: currentMatch.file,
							line: currentMatch.line,
							content: currentMatch.content,
							beforeContext: beforeContext,
							afterContext: afterContext,
						});

						// Reset for next match
						beforeContext = [];
						afterContext = [];
					}

					// Start a new match
					currentMatch = {
						file: data.data.path.text,
						line: data.data.line_number,
						content: data.data.lines.text,
					};
				} else if (data.type === "context" && currentMatch) {
					// Add context lines
					if (data.data.line_number < currentMatch.line!) {
						beforeContext.push(data.data.lines.text);
					} else {
						afterContext.push(data.data.lines.text);
					}
				}
			} catch (e) {
				// Skip lines that aren't valid JSON
				continue;
			}
		}

		// Add the last match if it exists
		if (
			currentMatch &&
			currentMatch.file &&
			currentMatch.line !== undefined &&
			currentMatch.content
		) {
			results.push({
				file: currentMatch.file,
				line: currentMatch.line,
				content: currentMatch.content,
				beforeContext: beforeContext,
				afterContext: afterContext,
			});
		}

		return results.slice(0, maxResults);
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(
				`Failed to search file contents with regex ${regex}: ${error.message}`
			);
		}
		throw error;
	}
}
