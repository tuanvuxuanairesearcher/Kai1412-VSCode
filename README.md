# AI Assistant for VS Code

A comprehensive AI-powered coding assistant extension for Visual Studio Code with multi-model support and advanced features.

## Features

### 🤖 Multi-Model AI Support
- **OpenAI GPT**: GPT-4.1, GPT-4.5, GPT-4o, O1/O3/O4 Series, Codex
- **Google Gemini**: Gemini-2.5-pro, Gemini-2.5-flash, Gemini-2.5-flash-lite
- **Local AI**: Compatible with Ollama and OpenAI-compatible endpoints

### 💬 AI Chat Interface
- Interactive chat panel with context-aware conversations
- Special references: `#thisFile`, `#localChanges`, `#file:path`, `#symbol:name`
- Git integration for repository questions
- Export chat history

### ✏️ In-Editor Coding Assistance
- **Code Generation**: Generate code from natural language descriptions
- **Code Explanation**: Understand complex code, regex, SQL, cron expressions
- **Documentation**: Auto-generate JSDoc, docstrings, and other documentation formats
- **Problem Detection**: Find bugs, performance issues, and code quality problems
- **Unit Test Generation**: Create comprehensive test suites
- **Language Conversion**: Convert code between different programming languages
- **Refactoring Suggestions**: Improve code structure and readability
- **Smart Naming**: Get better variable, function, and class name suggestions

### 🚀 Intelligent Code Completion
- Real-time AI-powered inline completions
- Context-aware suggestions
- Customizable trigger keys (Tab, Enter, Ctrl+Enter)
- Debounced requests to optimize performance

### 🔗 Git Integration
- **Smart Commit Messages**: Generate conventional commit messages from diffs
- **Commit Explanation**: Understand what changes were made in any commit
- Integration with VS Code's Source Control panel

### 🛠️ Error Analysis
- Explain error messages and stack traces
- Get solutions and debugging tips
- Context-aware error analysis

### ⚙️ Customization
- **Prompt Library**: Customize all AI prompts used by the extension
- **Multi-Provider Configuration**: Easy switching between AI providers
- **Flexible Settings**: Configure API keys, models, and behaviors

## Installation

1. Install the extension from the VS Code marketplace
2. Configure your AI provider in settings
3. Start coding with AI assistance!

## Configuration

### OpenAI Setup
```json
{
  "aiAssistant.provider": "openai",
  "aiAssistant.openai.apiKey": "your-api-key",
  "aiAssistant.openai.model": "gpt-4o-mini"
}
```

### Google Gemini Setup
```json
{
  "aiAssistant.provider": "gemini",
  "aiAssistant.gemini.apiKey": "your-api-key",
  "aiAssistant.gemini.model": "gemini-2.5-flash"
}
```

### Local AI Setup (Ollama)
```json
{
  "aiAssistant.provider": "local",
  "aiAssistant.local.endpoint": "http://localhost:11434",
  "aiAssistant.local.model": "llama2"
}
```

## Usage

### Quick Start
1. **Open AI Chat**: Click the AI Assistant icon in the activity bar or use `Ctrl+Shift+P` → "Open AI Chat"
2. **Generate Code**: Select text and press `Ctrl+\` or right-click → "AI Actions" → "Generate Code"
3. **Explain Code**: Select code and right-click → "AI Actions" → "Explain Code"
4. **Generate Commit Message**: In Source Control panel, click "Generate Commit Message with AI"

### Keyboard Shortcuts
- `Ctrl+\`: Generate code from description
- `Alt+Shift+\`: Toggle AI code completion
- `Tab`: Accept inline completion (configurable)

### Context References in Chat
- `#thisFile`: Reference the currently open file
- `#localChanges`: Reference uncommitted Git changes
- `#file:src/utils.ts`: Reference a specific file
- `#symbol:MyClass`: Reference a specific function or class

## Commands

All commands are available via `Ctrl+Shift+P`:

- **AI Assistant: Open Chat** - Open the AI chat panel
- **AI Assistant: Generate Code** - Generate code from description
- **AI Assistant: Explain Code** - Explain selected code
- **AI Assistant: Write Documentation** - Generate documentation
- **AI Assistant: Find Problems** - Analyze code for issues
- **AI Assistant: Generate Unit Tests** - Create test cases
- **AI Assistant: Convert to Another Language** - Convert code between languages
- **AI Assistant: Suggest Refactoring** - Get refactoring suggestions
- **AI Assistant: Generate Commit Message** - Create commit messages
- **AI Assistant: Explain Commit** - Understand commit changes
- **AI Assistant: Explain Error** - Get help with error messages
- **AI Assistant: Open Settings** - Configure the extension
- **AI Assistant: Open Prompt Library** - Customize AI prompts

## Customizing Prompts

1. Open Command Palette (`Ctrl+Shift+P`)
2. Run "AI Assistant: Open Prompt Library"
3. Edit any prompt template to suit your needs
4. Use variables like `{description}`, `{code}`, `{language}` in your prompts

## Troubleshooting

### Common Issues

**"No AI model configured"**
- Check your API key configuration in settings
- Ensure the selected provider is properly configured

**Inline completions not working**
- Check if `aiAssistant.enableInlineCompletion` is enabled
- Try reloading the window after configuration changes

**Git integration not working**
- Ensure you're in a Git repository
- Check that Git is installed and accessible

### Getting Help

1. Check the extension settings for configuration issues
2. Look at the VS Code developer console for error messages
3. Try refreshing the AI model configuration

## Testing

### Quick Test Setup

1. **Start the test server:**
   ```bash
   # Recommended - using server manager
   ./scripts/server-manager.sh start
   
   # Alternative methods:
   ./scripts/start-test-server.sh
   # Or manually:
   cd test-server && npm install && npm start
   ```

2. **Configure VS Code to use test server:**
   - Open VS Code Settings
   - Search for "AI Assistant"
   - Set:
     - Provider: `local`
     - Local Endpoint: `http://localhost:1998`
     - Local Model: `qwen3-0.6b`
     - Local API Key: `EMPTY`

3. **Test all features:**
   ```bash
   ./scripts/test-all.sh
   ```

### Manual Testing Checklist

#### 🤖 AI Chat Interface
- [ ] Open AI chat panel (click AI Assistant icon)
- [ ] Send a basic message: "Hello, can you help me?"
- [ ] Test context references:
  - [ ] `#thisFile` - reference current file
  - [ ] `#localChanges` - reference git changes
  - [ ] `#file:package.json` - reference specific file
- [ ] Export chat history
- [ ] Clear chat history

#### ✏️ Code Generation & Assistance
- [ ] **Generate Code** (`Ctrl+\`):
  - Create a new file, press `Ctrl+\`
  - Enter: "Create a function to validate email addresses"
  - Verify code is generated and diff view appears
  
- [ ] **Explain Code**:
  - Select some code, right-click → AI Actions → Explain Code
  - Test with regex: `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/`
  - Test with SQL: `SELECT * FROM users WHERE active = 1`
  
- [ ] **Write Documentation**:
  - Select a function, right-click → AI Actions → Write Documentation
  - Verify JSDoc/docstring is generated
  
- [ ] **Find Problems**:
  - Select problematic code, right-click → AI Actions → Find Problems
  - Verify analysis and suggestions appear
  
- [ ] **Generate Unit Tests**:
  - Place cursor in a function, right-click → AI Actions → Generate Unit Tests
  - Verify test file is created
  
- [ ] **Convert Language**:
  - Open a JavaScript file, right-click → AI Actions → Convert to Another Language
  - Select Python, verify conversion
  
- [ ] **Suggest Refactoring**:
  - Select code that could be improved, right-click → AI Actions → Suggest Refactoring
  - Verify refactored version in diff view
  
- [ ] **Smart Naming**:
  - Place cursor on a variable name, press F2, click AI icon for suggestions

#### 🚀 Inline Code Completion
- [ ] **Enable/Disable** (`Alt+Shift+\`):
  - Toggle inline completion on/off
  - Verify status message appears
  
- [ ] **Test Completions**:
  - Type: `function validate` and wait for suggestions
  - Type: `const email = ` and wait
  - Press `Tab` to accept completion

#### 🔗 Git Integration
- [ ] **Generate Commit Message**:
  - Make some changes to files
  - Go to Source Control panel
  - Click "Generate Commit Message with AI"
  - Verify appropriate commit message is generated
  
- [ ] **Explain Commit**:
  - Run command: "AI Assistant: Explain Commit"
  - Select "Latest commit" or pick from history
  - Verify commit explanation appears

#### 🛠️ Error Analysis
- [ ] **Explain Error**:
  - Select error text or run "AI Assistant: Explain Error"
  - Enter: `TypeError: Cannot read property 'length' of undefined`
  - Verify detailed explanation and solutions

#### ⚙️ Configuration & Settings
- [ ] **Open Settings**: Command palette → "AI Assistant: Open Settings"
- [ ] **Test Provider Switching**: Switch between OpenAI, Gemini, Local
- [ ] **Prompt Library**: Command palette → "AI Assistant: Open Prompt Library"
  - [ ] Edit a prompt template
  - [ ] Reset to default
  - [ ] Verify changes take effect

### Automated Testing

Run the complete test suite:

```bash
# Install dependencies and run all tests
./scripts/test-all.sh

# Or run individual components:
npm run compile             # Compile TypeScript
npm run lint               # Run ESLint
npm run test               # Run unit and integration tests
npm run test-server        # Just start the test server
npm run demo               # Test API programmatically

# Server management commands:
./scripts/server-manager.sh start    # Start server
./scripts/server-manager.sh stop     # Stop server
./scripts/server-manager.sh status   # Check status
./scripts/server-manager.sh test     # Test functionality
./scripts/server-manager.sh restart  # Restart server
```

### Test Coverage Areas

- **Unit Tests**: Core classes and utilities
- **Integration Tests**: AI model communication
- **Performance Tests**: Concurrent requests, response times
- **Error Handling**: Network errors, invalid API keys
- **Configuration**: Settings validation and updates

### Troubleshooting Tests

**Mock server won't start:**
- Use server manager: `./scripts/server-manager.sh restart`
- Check server status: `./scripts/server-manager.sh status`
- Manual check: `lsof -i :1998` (should show running process)
- Kill existing process: `./scripts/server-manager.sh stop`
- Install dependencies: `cd test-server && npm install`

**Tests fail with network errors:**
- Ensure mock server is running on localhost:1998
- Check firewall/antivirus blocking localhost connections

**Extension not loading in test:**
- Compile TypeScript: `npm run compile`
- Check VS Code developer console for errors
- Verify extension manifest (package.json) is valid

## Contributing

This extension is built with TypeScript and uses the VS Code Extension API. 

### Development Setup
1. Clone the repository
2. Run `npm install` to install dependencies  
3. Run `npm run compile` to build TypeScript
4. Press F5 to launch Extension Development Host
5. Run tests with `./scripts/test-all.sh`

Contributions are welcome!

## License

Apache 2.0 License - see LICENSE file for details.

## Privacy

This extension sends code and prompts to the configured AI provider. Please review your AI provider's privacy policy and terms of service. No data is stored locally by this extension beyond configuration settings.