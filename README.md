# MCP Codebase Explorer

This project implements an MCP (Model Context Protocol) server that exposes tools to explore and understand a codebase. The server provides various tools that can be used by an agent to retrieve information from a codebase.

## Features

The server implements the following tools:

1. **read_file** - Read a file with optional line range

   - Parameters: `path`, optional `from`, optional `to`

2. **read_dir** - Read a directory and list its contents

   - Parameters: `path`, optional `max_results` (default: 100)

3. **search_file_contents_regex** - Search file contents using regex pattern

   - Parameters: `regex`, optional `subdir`, optional `max_results` (default: 25), optional `context` (default: 5)

4. **search_file_contents_fuzzy** - Search file contents using fuzzy matching

   - Parameters: `query`, optional `subdir`, optional `max_results` (default: 25), optional `context` (default: 5)

5. **search_dir** - Search for files and directories by name using regex

   - Parameters: `regex`, optional `subdir`, optional `max_results` (default: 50)

6. **search_dir_fuzzy** - Search for files and directories by name using fuzzy matching
   - Parameters: `query`, optional `subdir`, optional `max_results` (default: 50)

## Security

All file operations are restricted to a configurable base directory for security:

- Set `MCP_BASE_DIR` environment variable to define the allowed base directory
- Defaults to current working directory if not set
- All file paths are validated to prevent directory traversal attacks

## Installation

### Local Development

```bash
npm install
```

### Docker

Build the Docker image:

```bash
docker build -t mcp-codebase-explorer .
```

## Usage

### Local Development

```bash
# Build the project
npm run build

# Start the server
npm start

# Or run in development mode with hot reload
npm run dev
```

### Docker

Run the MCP server in a Docker container with your codebase mounted:

```bash
# Run with a mounted directory (use quotes for paths with spaces)
docker run -it --rm \
  -v "/path/to/your/codebase:/workspace" \
  -e MCP_BASE_DIR=/workspace \
  mcp-codebase-explorer

# Example: Mount current directory (properly quoted)
docker run -it --rm \
  -v "$(pwd):/workspace" \
  -e MCP_BASE_DIR=/workspace \
  mcp-codebase-explorer

# Example: Mount a specific directory with spaces
docker run -it --rm \
  -v "/aw/Developer/Buffertab:/workspace" \
  -e MCP_BASE_DIR=/workspace \
  mcp-codebase-explorer
```

## VS Code Configuration

To use this MCP server with VS Code and Claude, add the following configuration to your VS Code settings:

### Option 1: Local Installation

Add to your VS Code `settings.json`:

```json
{
	"mcp.mcpServers": {
		"codebase-explorer": {
			"command": "node",
			"args": ["/path/to/mcp-codebase-explorer/dist/server.js"],
			"env": {
				"MCP_BASE_DIR": "/path/to/your/codebase"
			}
		}
	}
}
```

### Option 2: Docker Container

Add to your VS Code `settings.json`:

```json
{
	"mcp.mcpServers": {
		"codebase-explorer": {
			"command": "docker",
			"args": [
				"run",
				"-i",
				"--rm",
				"-v",
				"/path/to/your/codebase:/workspace",
				"-e",
				"MCP_BASE_DIR=/workspace",
				"mcp-codebase-explorer"
			]
		}
	}
}
```

**Note**: For paths with spaces, escape them properly or use the full absolute path without spaces if possible.

### Claude Desktop Configuration

For Claude Desktop, add to your `claude_desktop_config.json`:

```json
{
	"mcpServers": {
		"codebase-explorer": {
			"command": "docker",
			"args": [
				"run",
				"-i",
				"--rm",
				"-v",
				"/aw/Developer/Buffertab:/workspace",
				"-e",
				"MCP_BASE_DIR=/workspace",
				"mcp-codebase-explorer"
			]
		}
	}
}
```

**Important**: The volume mount path must be properly quoted when running Docker commands manually. In JSON configuration files, the paths are automatically handled correctly.

## Troubleshooting

### Docker Volume Mount Issues

If you encounter errors like "includes invalid characters for a local volume name", ensure your paths are properly quoted:

```bash
# ✅ Correct - paths with spaces are quoted
docker run -it --rm \
  -v "/path/with spaces:/workspace" \
  -e MCP_BASE_DIR=/workspace \
  mcp-codebase-explorer

# ❌ Incorrect - unquoted paths with spaces
docker run -it --rm \
  -v /path/with spaces:/workspace \
  -e MCP_BASE_DIR=/workspace \
  mcp-codebase-explorer
```

### Permission Issues

If you encounter permission issues when accessing files, you may need to run the container with your user ID:

```bash
docker run -it --rm \
  -v "$(pwd):/workspace" \
  -e MCP_BASE_DIR=/workspace \
  --user "$(id -u):$(id -g)" \
  mcp-codebase-explorer
```

## Implementation Details

- Uses performant tools like `find` and `ripgrep` for searching
- Implements fuzzy search using the `fuzzysort` library
- All tools are implemented as TypeScript modules for maintainability
- Error handling is implemented for all tools
- Built with MCP TypeScript SDK v1.12.0
- Uses ES modules and modern TypeScript features
- Includes path validation and security restrictions

## Project Structure

- `src/tools/` - Individual tool implementations
- `src/tools.ts` - Tool definitions and MCP SDK integration
- `src/server.ts` - MCP server setup and configuration
