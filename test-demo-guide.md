# 🧪 AI Assistant Extension - Test & Demo Guide

Hướng dẫn chi tiết cách test và demo extension AI Assistant với mock server Qwen3 0.6B

## 📋 Yêu cầu hệ thống

- **Node.js**: v16 hoặc cao hơn
- **npm**: v7 hoặc cao hơn  
- **VS Code**: v1.74.0 hoặc cao hơn
- **Git**: Để test Git integration features

## 🚀 Hướng dẫn nhanh (Quick Start)

### 1. Cài đặt dependencies

```bash
# Cài đặt dependencies cho extension
npm install

# Cài đặt dependencies cho test server
cd test-server && npm install && cd ..
```

### 2. Khởi động Mock Server

```bash
# Cách 1: Script tự động
./scripts/start-test-server.sh

# Cách 2: Manual
cd test-server
npm start
```

Server sẽ chạy tại: **http://localhost:1998**
- Model: **Qwen3 0.6B**
- API Key: **EMPTY**

### 3. Cấu hình VS Code Extension

1. Mở VS Code settings (`Ctrl+,`)
2. Tìm "AI Assistant" 
3. Cấu hình:
   - **Provider**: `local`
   - **Local Endpoint**: `http://localhost:1998`
   - **Local Model**: `qwen3-0.6b`
   - **Local API Key**: `EMPTY`

### 4. Chạy Tests

```bash
# Test tự động toàn bộ
./scripts/test-all.sh

# Hoặc test từng phần
npm run compile    # Compile TypeScript
npm run lint      # Kiểm tra code quality
npm run test      # Chạy unit & integration tests
npm run demo      # Demo programmatic API calls
```

## 🎯 Test Scenarios

### A. Chat Interface Tests

1. **Mở AI Chat Panel**:
   - Click vào AI Assistant icon ở Activity Bar
   - Hoặc `Ctrl+Shift+P` → "Open AI Chat"

2. **Test Basic Chat**:
   ```
   User: "Hello, can you help me with JavaScript?"
   Expected: Phản hồi từ AI về JavaScript
   ```

3. **Test Context References**:
   ```
   User: "Explain this file #thisFile"
   Expected: AI phân tích file hiện tại
   
   User: "Review my changes #localChanges"  
   Expected: AI review git diff
   
   User: "Analyze #file:package.json"
   Expected: AI phân tích package.json
   ```

### B. Code Generation Tests

1. **Generate Code** (`Ctrl+\`):
   - Tạo file mới → Nhấn `Ctrl+\`
   - Nhập: "Create a function to validate email addresses"
   - **Expected**: Diff view hiện code được generate

2. **Sample Test với file demo**:
   - Mở `demo/test-samples.js`
   - Select incomplete function `processData`
   - `Ctrl+\` → "Complete this function to process user data"

### C. Code Explanation Tests

1. **Explain Regular Expression**:
   - Mở `demo/test-samples.js`
   - Select: `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/`
   - Right-click → AI Actions → Explain Code
   - **Expected**: Giải thích chi tiết từng phần của regex

2. **Explain SQL Query**:
   - Mở `demo/test-samples.sql`
   - Select complex query
   - Right-click → AI Actions → Explain Code

### D. Documentation Generation Tests

1. **Generate JSDoc**:
   - Mở `demo/test-samples.js`
   - Select function `calculateArea`
   - Right-click → AI Actions → Write Documentation
   - **Expected**: JSDoc comment được thêm vào

### E. Problem Finding Tests

1. **Find Code Issues**:
   - Select function `divide` trong `demo/test-samples.js`
   - Right-click → AI Actions → Find Problems
   - **Expected**: Phát hiện lỗi zero division

### F. Unit Test Generation

1. **Generate Tests**:
   - Place cursor trong function `validateEmail`
   - Right-click → AI Actions → Generate Unit Tests
   - **Expected**: File test mới được tạo với Jest tests

### G. Language Conversion Tests

1. **JavaScript to Python**:
   - Mở `demo/test-samples.js`
   - Right-click → AI Actions → Convert to Another Language
   - Select "Python"
   - **Expected**: Python equivalent code

### H. Refactoring Tests

1. **Improve Code**:
   - Select function `getUserInfo` 
   - Right-click → AI Actions → Suggest Refactoring
   - **Expected**: Modern ES6+ refactored version

### I. Git Integration Tests

1. **Generate Commit Message**:
   ```bash
   # Tạo changes
   echo "// New feature" >> demo/test-samples.js
   git add .
   ```
   - Vào Source Control panel
   - Click "Generate Commit Message with AI"
   - **Expected**: Conventional commit message

2. **Explain Commit**:
   - Command palette → "AI Assistant: Explain Commit"
   - Select latest commit
   - **Expected**: Detailed explanation

### J. Inline Completion Tests

1. **Enable Inline Completion**:
   - `Alt+Shift+\` để toggle
   - Type: `function validate`
   - Wait 500ms
   - **Expected**: Ghost text suggestion
   - Press `Tab` to accept

### K. Error Explanation Tests

1. **Explain Error**:
   - Command palette → "AI Assistant: Explain Error"
   - Input: `TypeError: Cannot read property 'length' of undefined`
   - **Expected**: Detailed error analysis with solutions

## 🔧 Advanced Testing

### Programmatic API Testing

```bash
# Test API server trực tiếp
npm run demo
```

Script này sẽ test:
- Health check
- Code generation
- Code explanation  
- Documentation generation
- Problem finding
- Unit test generation
- Refactoring suggestions
- Commit message generation
- Error explanation
- Streaming responses
- Concurrent requests

### Performance Testing

1. **Concurrent Requests**:
   - Mở multiple files
   - Trigger multiple AI actions simultaneously
   - Monitor response times

2. **Memory Usage**:
   - Use extension continuously for 30+ minutes
   - Monitor VS Code memory usage
   - Check for memory leaks

### Error Handling Testing

1. **Invalid API Key**:
   ```bash
   # Temporarily change API key in settings to "INVALID"
   # Try any AI feature
   # Expected: Graceful error message
   ```

2. **Network Error**:
   ```bash
   # Stop test server
   # Try AI features
   # Expected: Network error handling
   ```

3. **Server Timeout**:
   ```bash
   # Modify test server to add delays
   # Test timeout handling
   ```

## 📊 Expected Results

### ✅ Success Criteria

- **Chat Interface**: Responsive, context-aware responses
- **Code Generation**: Syntactically correct, relevant code
- **Code Explanation**: Clear, detailed explanations
- **Documentation**: Proper format (JSDoc, docstring, etc.)
- **Problem Finding**: Identifies real issues with solutions
- **Unit Tests**: Comprehensive test coverage
- **Language Conversion**: Maintains logic, correct syntax
- **Refactoring**: Modern, improved code quality
- **Git Integration**: Meaningful commit messages, accurate explanations
- **Inline Completion**: Context-aware, non-intrusive
- **Error Handling**: Graceful degradation, helpful messages

### 📈 Performance Benchmarks

- **Response Time**: < 3 seconds for most operations
- **Streaming**: Smooth, word-by-word delivery
- **Concurrent Requests**: Handle 5+ simultaneous requests
- **Memory Usage**: Stable, no significant leaks
- **Error Recovery**: Quick recovery from network issues

## 🐛 Troubleshooting

### Common Issues

**Mock server không start được**:
```bash
# Check port availability
lsof -i :1998

# Install dependencies
cd test-server && npm install

# Check Node.js version
node --version  # Should be v16+
```

**Extension không load**:
```bash
# Compile TypeScript
npm run compile

# Check for syntax errors
npm run lint

# Check VS Code developer console
# Help → Toggle Developer Tools
```

**Tests fail**:
```bash
# Ensure server is running
curl http://localhost:1998/health

# Check configuration
# VS Code Settings → AI Assistant

# Clear VS Code cache
# Restart VS Code completely
```

**Network errors**:
- Check firewall settings
- Verify localhost access
- Try different port if 1998 is blocked

### Debug Mode

1. Open project in VS Code
2. Press `F5` để launch Extension Development Host
3. Set breakpoints trong TypeScript files
4. Use developer console để debug

## 📝 Test Report Template

Sau khi hoàn thành tests, ghi lại kết quả:

```markdown
# AI Assistant Extension Test Report

**Date**: [Date]
**Tester**: [Name]
**Environment**: [OS, VS Code version, Node.js version]

## Test Results

### ✅ Passed Tests
- [ ] Chat Interface
- [ ] Code Generation  
- [ ] Code Explanation
- [ ] Documentation Generation
- [ ] Problem Finding
- [ ] Unit Test Generation
- [ ] Language Conversion
- [ ] Refactoring
- [ ] Git Integration
- [ ] Inline Completion
- [ ] Error Handling

### ❌ Failed Tests
- [List any failures with details]

### ⚠️ Issues Found
- [List any bugs or improvements needed]

### 📊 Performance
- Average response time: [X seconds]
- Memory usage: [X MB]
- Concurrent request handling: [Pass/Fail]

### 📝 Notes
[Any additional observations]
```

## 🎉 Kết luận

Extension AI Assistant đã được thiết kế với comprehensive test suite để đảm bảo:

1. **Functionality**: Tất cả features hoạt động đúng
2. **Performance**: Response times acceptable  
3. **Reliability**: Error handling robust
4. **Usability**: User experience smooth
5. **Compatibility**: Works across different environments

Với mock server Qwen3 0.6B, bạn có thể test đầy đủ tính năng mà không cần API keys thật từ OpenAI hay Google.

**Happy Testing! 🚀**