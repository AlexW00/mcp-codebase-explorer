import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFile } from "./tools/readFile.js";
import { readDir } from "./tools/readDir.js";
import { searchFileContentsRegex } from "./tools/searchFileContentsRegex.js";
import { searchFileContentsFuzzy } from "./tools/searchFileContentsFuzzy.js";
import { searchDir } from "./tools/searchDir.js";
import { searchDirFuzzy } from "./tools/searchDirFuzzy.js";

export function registerTools(server: McpServer) {
	// Read file tool
	server.tool(
		"read_file",
		"Read the contents of a file, optionally with line range",
		{
			path: z.string().describe("Path to the file to read"),
			from: z
				.number()
				.optional()
				.describe("Optional starting line (0-indexed)"),
			to: z
				.number()
				.optional()
				.describe("Optional ending line (0-indexed, exclusive)"),
		},
		async ({ path, from, to }) => {
			try {
				const content = await readFile(path, from, to);
				return { content: [{ type: "text", text: content }] };
			} catch (error) {
				if (error instanceof Error) {
					throw new Error(`Failed to read file: ${error.message}`);
				}
				throw error;
			}
		}
	);

	// Read directory tool
	server.tool(
		"read_dir",
		"List the contents of a directory",
		{
			path: z.string().describe("Path to the directory to read"),
			max_results: z
				.number()
				.optional()
				.describe("Maximum number of results to return (default: 100)"),
		},
		async ({ path, max_results }) => {
			try {
				const entries = await readDir(path, max_results);
				return {
					content: [{ type: "text", text: JSON.stringify(entries, null, 2) }],
				};
			} catch (error) {
				if (error instanceof Error) {
					throw new Error(`Failed to read directory: ${error.message}`);
				}
				throw error;
			}
		}
	);

	// Search file contents with regex tool
	server.tool(
		"search_file_contents_regex",
		"Search for text patterns in files using regular expressions",
		{
			regex: z.string().describe("Regular expression pattern to search for"),
			subdir: z
				.string()
				.optional()
				.describe("Optional subdirectory to limit search scope"),
			max_results: z
				.number()
				.optional()
				.describe("Maximum number of results to return (default: 25)"),
			context: z
				.number()
				.optional()
				.describe(
					"Number of lines of context before and after match (default: 5)"
				),
		},
		async ({ regex, subdir, max_results, context }) => {
			try {
				const searchResults = await searchFileContentsRegex(
					regex,
					subdir,
					max_results,
					context
				);

				// Transform to match expected format
				const results = searchResults.map((result) => ({
					file: result.file,
					line: result.line,
					content: result.content,
					before_context: result.beforeContext,
					after_context: result.afterContext,
				}));

				return {
					content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
				};
			} catch (error) {
				if (error instanceof Error) {
					throw new Error(
						`Failed to search file contents with regex: ${error.message}`
					);
				}
				throw error;
			}
		}
	);

	// Search file contents with fuzzy matching tool
	server.tool(
		"search_file_contents_fuzzy",
		"Search for text in files using fuzzy/approximate matching",
		{
			query: z.string().describe("Fuzzy search query"),
			subdir: z
				.string()
				.optional()
				.describe("Optional subdirectory to limit search scope"),
			max_results: z
				.number()
				.optional()
				.describe("Maximum number of results to return (default: 25)"),
			context: z
				.number()
				.optional()
				.describe(
					"Number of lines of context before and after match (default: 5)"
				),
		},
		async ({ query, subdir, max_results, context }) => {
			try {
				const searchResults = await searchFileContentsFuzzy(
					query,
					subdir,
					max_results,
					context
				);

				// Transform to match expected format
				const results = searchResults.map((result) => ({
					file: result.file,
					line: result.line,
					content: result.content,
					before_context: result.beforeContext,
					after_context: result.afterContext,
				}));

				return {
					content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
				};
			} catch (error) {
				if (error instanceof Error) {
					throw new Error(
						`Failed to search file contents with fuzzy query: ${error.message}`
					);
				}
				throw error;
			}
		}
	);

	// Search directory tool
        server.tool(
                "search_dir",
                "Search for files and directories using a regular expression applied to the full path",
                {
                        regex: z
                                .string()
                                .describe("Regular expression pattern to match file/directory paths"),
			subdir: z
				.string()
				.optional()
				.describe("Optional subdirectory to limit search scope"),
			max_results: z
				.number()
				.optional()
				.describe("Maximum number of results to return (default: 50)"),
		},
		async ({ regex, subdir, max_results }) => {
			try {
				const results = await searchDir(regex, subdir, max_results);
				return {
					content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
				};
			} catch (error) {
				if (error instanceof Error) {
					throw new Error(
						`Failed to search directory with regex: ${error.message}`
					);
				}
				throw error;
			}
		}
	);

	// Search directory with fuzzy matching tool
	server.tool(
		"search_dir_fuzzy",
		"Search for files and directories by name using fuzzy/approximate matching",
		{
			query: z.string().describe("Fuzzy search query for file/directory names"),
			subdir: z
				.string()
				.optional()
				.describe("Optional subdirectory to limit search scope"),
			max_results: z
				.number()
				.optional()
				.describe("Maximum number of results to return (default: 50)"),
		},
		async ({ query, subdir, max_results }) => {
			try {
				const results = await searchDirFuzzy(query, subdir, max_results);
				return {
					content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
				};
			} catch (error) {
				if (error instanceof Error) {
					throw new Error(
						`Failed to search directory with fuzzy query: ${error.message}`
					);
				}
				throw error;
			}
		}
	);
}
