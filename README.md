# AI Assistant for VS Code

A comprehensive AI-powered coding assistant extension for Visual Studio Code with multi-model support and advanced features.

## Features

### 🤖 Multi-Model AI Support
- **OpenAI GPT**: GPT-4, GPT-4-turbo, GPT-3.5-turbo
- **Google Gemini**: Gemini-pro, Gemini-pro-vision
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
  "aiAssistant.openai.model": "gpt-4"
}
```

### Google Gemini Setup
```json
{
  "aiAssistant.provider": "gemini",
  "aiAssistant.gemini.apiKey": "your-api-key",
  "aiAssistant.gemini.model": "gemini-pro"
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

## Contributing

This extension is built with TypeScript and uses the VS Code Extension API. Contributions are welcome!

## License

Apache License 2.0 - see LICENSE file for details.

## Privacy

This extension sends code and prompts to the configured AI provider. Please review your AI provider's privacy policy and terms of service. No data is stored locally by this extension beyond configuration settings.