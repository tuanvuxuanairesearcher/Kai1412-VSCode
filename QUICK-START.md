# 🚀 AI Assistant Extension - Quick Start Guide

## 1️⃣ Khởi động Mock Server (30 giây)

```bash
# Bước 1: Start server với auto-cleanup
./scripts/server-manager.sh start

# Kiểm tra server
./scripts/server-manager.sh status
```

**Expected output:**
```
✅ Server started successfully!
🔧 URL: http://localhost:1998
📡 Model: Qwen3 0.6B
🔑 API Key: EMPTY
```

## 2️⃣ Cấu hình VS Code Extension (1 phút)

1. **Mở VS Code Settings** (`Ctrl+,`)
2. **Tìm "AI Assistant"**
3. **Cấu hình:**
   - ✅ **Provider**: `local`
   - ✅ **Local Endpoint**: `http://localhost:1998`
   - ✅ **Local Model**: `qwen3-0.6b`
   - ✅ **Local API Key**: `EMPTY`

## 3️⃣ Test Extension Features (2 phút)

### 🤖 Test Chat Interface
```
1. Click AI Assistant icon ở Activity Bar
2. Type: "Hello, can you help me with JavaScript?"
3. ✅ Expected: AI response về JavaScript help
```

### ⚡ Test Code Generation
```
1. Tạo file mới: test.js
2. Press Ctrl+\
3. Type: "Create a function to validate email addresses"
4. ✅ Expected: Diff view với generated code
```

### 📖 Test Code Explanation  
```
1. Select regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
2. Right-click → AI Actions → Explain Code
3. ✅ Expected: Detailed regex explanation
```

### 🔧 Test Git Integration
```
1. Make some file changes
2. Go to Source Control panel
3. Click "Generate Commit Message with AI"
4. ✅ Expected: Conventional commit message generated
```

## 4️⃣ Verify Everything Works

```bash
# Test programmatically
npm run demo

# Expected output:
# ✅ Server health: OK
# ✅ Code generation: Working
# ✅ Streaming: Working
# ✅ All tests passed!
```

## 🆘 Quick Troubleshooting

### Server Issues:
```bash
# Port already in use?
./scripts/server-manager.sh restart

# Server not responding?
./scripts/server-manager.sh test

# Need to see what's running?
./scripts/server-manager.sh status
```

### Extension Issues:
```bash
# Recompile if needed
npm run compile

# Check server connectivity
curl http://localhost:1998/health
```

## 🎯 Success Checklist

- [ ] ✅ Mock server running on localhost:1998
- [ ] ✅ VS Code configured with local provider
- [ ] ✅ Chat interface responds to messages
- [ ] ✅ Code generation works (`Ctrl+\`)
- [ ] ✅ Code explanation works (right-click menu)
- [ ] ✅ Git integration generates commit messages
- [ ] ✅ Inline completion appears when typing
- [ ] ✅ All demo tests pass

## 🚀 Ready to Go!

Sau khi hoàn thành checklist trên, bạn có thể:

1. **Explore tất cả features** - Thử tất cả AI Actions trong context menu
2. **Customize prompts** - Command palette → "Open Prompt Library"
3. **Switch providers** - Change sang OpenAI/Gemini khi có API keys thật
4. **Share với team** - Package extension với `vsce package`

**Total setup time: ~ 3-4 phút** ⏱️

Enjoy coding with your AI Assistant! 🎉