import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./tools.js";

async function main() {
	// Create MCP server
	const server = new McpServer({
		name: "codebase-explorer",
		version: "1.0.0",
	});

	// Register all tools
	registerTools(server);

	// Start the server with stdio transport
	const transport = new StdioServerTransport();
	await server.connect(transport);
}

main().catch((error) => {
	console.error("Failed to start server:", error);
	process.exit(1);
});
