# 🎯 Cách Sử Dụng AI Assistant Activity Bar

## 🚀 **Setup Extension trong VS Code**

### **Bước 1: Build Extension**
```bash
# Compile TypeScript code
npm run compile

# Start test server (nếu dùng local testing)
./scripts/start-test-server.sh
```

### **Bước 2: Test Extension**  
```bash
# Option 1: Test trong VS Code Extension Host
F5 (hoặc Run → Start Debugging)

# Option 2: Package và install
vsce package
code --install-extension ai-assistant-extension-0.0.1.vsix
```

## 📍 **Tìm AI Assistant Icon**

### **Vị trí Icon**
- **Activity Bar**: Bên trái VS Code window
- **Between**: Explorer và Search icons  
- **Look for**: 🤖 Robot icon với chat bubble
- **Tooltip**: "AI Assistant" khi hover

### **Nếu Không Thấy Icon**
1. **Check Extension Activated**: 
   - `Ctrl+Shift+P` → "Extensions: Show Installed Extensions"
   - Find "AI Assistant" → Ensure it's enabled

2. **Reload VS Code**:
   - `Ctrl+Shift+P` → "Developer: Reload Window"

3. **Check Console**:
   - `Ctrl+Shift+P` → "Developer: Toggle Developer Tools"
   - Look for "AI Assistant extension is being activated"

## 🖱️ **Click vào Icon**

### **First Click**
- **Opens**: AI Assistant panel on right side
- **Shows**: Mini chat interface
- **Ready**: For immediate AI interaction

### **Panel Layout**
```
┌─────────────────────────┐
│ 🤖 AI Assistant        │
├─────────────────────────┤  
│ 📝 Explain 🧪 Tests    │ ← Quick Actions
│ 🔧 Fix    📚 Docs      │
├─────────────────────────┤
│                         │
│ Chat Messages Area      │ ← Conversation
│                         │
├─────────────────────────┤
│ [Input Box]  [Send]     │ ← Type messages
│              [Expand]   │
└─────────────────────────┘
```

## 💬 **Sử Dụng Mini Chat**

### **Quick Actions**
1. **📝 Explain**: Click → Type "Explain this code"
2. **🧪 Tests**: Click → Type "Generate unit tests"  
3. **🔧 Fix**: Click → Type "Fix this error"
4. **📚 Docs**: Click → Type "Add documentation"

### **Manual Chat**
1. **Type**: Message in input box
2. **Send**: Click Send button hoặc press Enter
3. **Response**: AI response hiện below

### **Example Conversations**
```
You: Explain this function
AI: This function validates email addresses using regex...

You: Generate unit tests  
AI: Here are comprehensive unit tests for your function...

You: Fix this error: TypeError undefined
AI: This error occurs when... Here's how to fix it...
```

## 🔄 **Expand to Full Chat**

### **Click "Expand" Button**
- **Opens**: Full chat dialog window
- **Features**: 
  - Complete conversation history
  - File context awareness (#thisFile, #localChanges)
  - Advanced AI interactions
  - Copy/paste code blocks

### **Full Chat Features**
```
#thisFile     - Reference current file
#localChanges - Reference git changes  
#file:path    - Reference specific file
#symbol:func  - Reference function/class
```

## 🎯 **Context-Aware Usage**

### **Select Code First**
1. **Highlight**: Code trong editor
2. **Click**: AI Assistant icon  
3. **Use**: Quick actions hoặc ask questions
4. **AI**: Understands selected code context

### **Example Workflow**
```
1. Select a function in editor
2. Click 🤖 icon in Activity Bar
3. Click 📝 "Explain" quick action
4. AI explains the selected function
5. Click 🧪 "Tests" to generate tests  
6. Click "Expand" for full conversation
```

## 🎛️ **Integration với Editor**

### **Right-Click Menu** (Alternative)
- Right-click code → "AI Actions" → Same options
- Works đồng thời với Activity Bar

### **Command Palette** (Alternative)  
- `Ctrl+Shift+P` → Type "AI Assistant"
- All commands available through palette

### **Keyboard Shortcuts**
```
Ctrl+\        - Generate Code  
Alt+Shift+\   - Toggle AI Completion
```

## 🔧 **Troubleshooting**

### **Icon Không Hiện**
```bash
# 1. Check extension đã compile
npm run compile

# 2. Reload VS Code
Ctrl+Shift+P → "Developer: Reload Window"

# 3. Check extension activated
Console: "AI Assistant extension is being activated"
```

### **Panel Không Mở**
```bash
# 1. Check có click đúng icon không
# 2. Try command palette:
Ctrl+Shift+P → "Open AI Chat"

# 3. Check console for errors
Developer Tools → Console tab
```

### **Chat Không Response**
```bash
# 1. Check AI model configuration
Settings → AI Assistant → Provider/API Key

# 2. Check test server running (nếu local)
./scripts/server-manager.sh status

# 3. Check network connectivity
```

## ⚡ **Pro Tips**

### **Efficient Workflow**
1. **Keep Panel Open**: Pin the AI Assistant panel
2. **Use Quick Actions**: Faster than typing full prompts
3. **Context First**: Select code trước khi ask questions
4. **Expand When Needed**: Full chat cho complex conversations

### **Best Practices**
```
✅ DO:
- Select code before asking questions
- Use specific, clear prompts  
- Leverage context references (#thisFile)
- Use quick actions for common tasks

❌ DON'T:
- Ask vague questions without context
- Ignore error messages trong console
- Forget to select relevant code first
```

## 🎉 **Success! You're Ready**

### **When Everything Works:**
- ✅ 🤖 Icon visible trong Activity Bar
- ✅ Click opens AI Assistant panel  
- ✅ Quick actions insert prompts
- ✅ Chat sends/receives messages
- ✅ AI provides helpful responses
- ✅ "Expand" opens full chat dialog

### **Now You Can:**
1. **Explain Code**: Select + Click 📝 Explain
2. **Generate Tests**: Position cursor + Click 🧪 Tests  
3. **Fix Errors**: Select error + Click 🔧 Fix
4. **Add Docs**: Select function + Click 📚 Docs
5. **Chat Freely**: Type anything in input box
6. **Use Full Features**: Click "Expand" for advanced chat

**Your AI coding assistant is ready! Happy coding! 🚀✨**