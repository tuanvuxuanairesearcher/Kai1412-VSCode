# AI Assistant Extension - Testing Guide

This guide provides comprehensive instructions for testing the AI Assistant extension.

## Quick Start

### 1. Start Test Environment

```bash
# Start mock AI server
./scripts/start-test-server.sh

# Run all tests
./scripts/test-all.sh
```

### 2. Configure Extension

Open VS Code Settings and configure:
- **Provider**: `local`
- **Local Endpoint**: `http://localhost:1998`
- **Local Model**: `qwen3-0.6b`
- **Local API Key**: `EMPTY`

## Test Server Details

The mock server simulates various AI providers and provides realistic responses for testing:

- **URL**: http://localhost:1998
- **API Key**: `EMPTY`
- **Model**: `qwen3-0.6b`
- **Compatible with**: OpenAI API format

### Server Endpoints

- `GET /health` - Health check
- `GET /v1/models` - Available models
- `POST /v1/chat/completions` - Chat completions (streaming supported)

## Detailed Test Procedures

### 🤖 AI Chat Interface Tests

#### Basic Chat Functionality
1. Click AI Assistant icon in activity bar
2. Send message: "Hello, can you help me with JavaScript?"
3. **Expected**: Streaming response from AI
4. **Verify**: Response is relevant and well-formatted

#### Context References
1. Open a JavaScript file with some code
2. In chat, type: `Explain this file #thisFile`
3. **Expected**: AI response includes file content and explanation
4. **Verify**: File content is properly referenced

```javascript
// Test file content example
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
```

#### Git Context
1. Make some changes to files (don't commit)
2. In chat, type: `Review my changes #localChanges`
3. **Expected**: AI analyzes git diff
4. **Verify**: Changes are properly shown and analyzed

#### File References
1. In chat, type: `Analyze #file:package.json`
2. **Expected**: AI analyzes the package.json file
3. **Verify**: Correct file content is referenced

### ✏️ Editor Assistance Tests

#### Code Generation Test
1. Create new file: `test-generate.js`
2. Press `Ctrl+\`
3. Enter prompt: "Create a function to calculate fibonacci numbers"
4. **Expected**: Diff view shows generated code
5. **Verify**: Code is syntactically correct and functional

```javascript
// Expected output example
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}
```

#### Code Explanation Test
1. Select this regex: `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/`
2. Right-click → AI Actions → Explain Code
3. **Expected**: Detailed regex explanation
4. **Verify**: Each part of regex is explained

#### Documentation Generation Test
1. Select this function:
```javascript
function calculateArea(radius) {
    return Math.PI * radius * radius;
}
```
2. Right-click → AI Actions → Write Documentation
3. **Expected**: JSDoc comments are added above function
4. **Verify**: Documentation includes parameters, return value, description

#### Problem Finding Test
1. Select this problematic code:
```javascript
function divide(a, b) {
    return a / b; // No zero division check
}
```
2. Right-click → AI Actions → Find Problems
3. **Expected**: Issues identified (zero division, no input validation)
4. **Verify**: Suggestions are practical and correct

#### Unit Test Generation Test
1. Place cursor in a function
2. Right-click → AI Actions → Generate Unit Tests
3. **Expected**: New test file created with comprehensive tests
4. **Verify**: Tests cover edge cases and use appropriate framework

#### Language Conversion Test
1. Open a JavaScript file with a simple function
2. Right-click → AI Actions → Convert to Another Language
3. Select "Python"
4. **Expected**: Equivalent Python code in new document
5. **Verify**: Logic is preserved, syntax is correct

#### Refactoring Test
1. Select this code:
```javascript
function getUserData(id) {
    var user = users.find(u => u.id == id);
    if (user != null) {
        return user.name + " " + user.email;
    } else {
        return "User not found";
    }
}
```
2. Right-click → AI Actions → Suggest Refactoring
3. **Expected**: Improved version with modern syntax, better practices
4. **Verify**: Diff view shows improvements

### 🚀 Inline Completion Tests

#### Basic Completion Test
1. Enable inline completion: `Alt+Shift+\`
2. Type: `function validate`
3. Wait 500ms
4. **Expected**: Ghost text completion appears
5. **Verify**: Press `Tab` to accept, `Esc` to reject

#### Context-Aware Completion Test
1. Type: `const email = document.getElementById('email').`
2. Wait for completion
3. **Expected**: Relevant DOM methods suggested
4. **Verify**: Completion is contextually appropriate

#### Performance Test
1. Type rapidly in a large file
2. **Expected**: Completions don't slow down typing
3. **Verify**: Debouncing works (no excessive API calls)

### 🔗 Git Integration Tests

#### Commit Message Generation Test
1. Make changes to multiple files:
   - Add a new function to one file
   - Fix a bug in another
   - Update documentation
2. Stage changes: `git add .`
3. Go to Source Control panel
4. Click "Generate Commit Message with AI"
5. **Expected**: Meaningful commit message following conventional format
6. **Verify**: Message reflects actual changes made

Example expected output:
```
feat: add email validation utility

- Add validateEmail function with regex pattern
- Fix null pointer bug in user handler  
- Update README with new API documentation
```

#### Commit Explanation Test
1. Run command: "AI Assistant: Explain Commit"
2. Select "Latest commit"
3. **Expected**: Detailed explanation of what changed and why
4. **Verify**: Explanation is accurate and helpful

### 🛠️ Error Analysis Tests

#### Error Explanation Test
1. Run command: "AI Assistant: Explain Error"
2. Enter: `TypeError: Cannot read property 'length' of undefined`
3. **Expected**: Detailed explanation with causes and solutions
4. **Verify**: Solutions are practical and code examples are included

### ⚙️ Configuration Tests

#### Provider Switching Test
1. Test with different providers:
   - Set provider to "openai" (will fail without real API key)
   - Set provider to "local" with test server
   - Set provider to "gemini" (will fail without real API key)
2. **Expected**: Extension handles configuration changes gracefully
3. **Verify**: Error messages are helpful when configuration is invalid

#### Prompt Customization Test
1. Command palette → "AI Assistant: Open Prompt Library"
2. Edit "Code Generation" prompt
3. Test code generation with custom prompt
4. **Expected**: Custom prompt is used
5. **Verify**: Reset functionality works

## Performance Testing

### Concurrent Requests Test
```javascript
// Run this test in the VS Code developer console
async function testConcurrentRequests() {
    const promises = [];
    for (let i = 0; i < 5; i++) {
        promises.push(
            vscode.commands.executeCommand('aiAssistant.generateCode')
        );
    }
    const results = await Promise.all(promises);
    console.log('All concurrent requests completed');
}
```

### Memory Usage Test
1. Use extension continuously for 30 minutes
2. Monitor VS Code memory usage
3. **Expected**: No significant memory leaks
4. **Verify**: Performance remains consistent

## Error Scenarios Testing

### Network Error Handling
1. Stop the test server
2. Try to use any AI feature
3. **Expected**: Graceful error message
4. **Verify**: Extension doesn't crash

### Invalid API Key Test
1. Change API key to "INVALID"
2. Try to use AI features
3. **Expected**: Authentication error message
4. **Verify**: Helpful suggestion to check configuration

### Malformed Response Test
The test server handles this automatically by simulating various response formats.

## Test Automation

### Running Automated Tests
```bash
# Full test suite
./scripts/test-all.sh

# Individual test components
npm run lint          # Code quality
npm run compile       # TypeScript compilation
npm run test          # Unit and integration tests
```

### Continuous Integration
The test suite is designed to work in CI environments:
- All dependencies are installed automatically
- Mock server starts and stops cleanly
- Tests are isolated and don't interfere with each other

## Troubleshooting

### Common Issues

**"Mock server not responding"**
- Check if port 1998 is available: `lsof -i :1998`
- Ensure Node.js and npm are installed
- Try manually starting: `cd test-server && npm start`

**"Extension not loading"**
- Compile TypeScript: `npm run compile`
- Check VS Code developer console (Help → Toggle Developer Tools)
- Verify no syntax errors in package.json

**"Tests failing sporadically"**
- Increase timeout values in test files
- Check system resources (CPU, memory)
- Run tests individually to isolate issues

**"Configuration not taking effect"**
- Restart VS Code after configuration changes
- Check configuration scope (User vs Workspace)
- Clear VS Code settings cache

### Debug Mode

To run extension in debug mode:
1. Open project in VS Code
2. Press F5 to launch Extension Development Host
3. Set breakpoints in TypeScript files
4. Use developer console for logging

### Performance Monitoring

Monitor extension performance:
- Use VS Code's built-in performance profiler
- Check network tab for API request timing
- Monitor memory usage in Task Manager

## Test Reports

After running tests, check:
- Console output for test results
- Generated test reports (if configured)
- Coverage reports (if enabled)
- Performance metrics

The automated test suite provides comprehensive coverage of all extension features and should be run before any release or major changes.