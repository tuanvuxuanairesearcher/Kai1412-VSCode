# 🎯 AI Assistant Extension - Demo Cheat Sheet

## ⚡ Quick Launch

```bash
# 1. Setup (if needed)
./scripts/demo-setup.sh

# 2. Launch Extension
# Press F5 in VS Code → Extension Development Host opens
```

## 🔧 Configuration (30 seconds)

In Extension Development Host:
- `Ctrl+,` → Search "AI Assistant"
- **Provider**: `local`
- **Endpoint**: `http://localhost:1998`  
- **Model**: `qwen3-0.6b`
- **API Key**: `EMPTY`

## 🎬 Demo Features (8 minutes)

### 1. **Chat Interface** (1 min)
- Click 🤖 AI Assistant icon in Activity Bar
- Type: `"Hello! Help me with JavaScript"`
- Demo context: `"Explain this file #thisFile"`

### 2. **Code Generation** (1 min)  
- Open `demo/live-demo.js`
- Cursor on empty line → `Ctrl+\`
- Type: `"Create function to validate Vietnamese phone numbers"`
- Show diff view → Accept changes

### 3. **Code Explanation** (1 min)
- Select complex regex in `live-demo.js`
- Right-click → **AI Actions** → **Explain Code**
- Show detailed breakdown

### 4. **Documentation** (1 min)
- Select `calculateCompoundInterest` function
- Right-click → **AI Actions** → **Write Documentation**  
- Show JSDoc generation

### 5. **Problem Finding** (45s)
- Select `processUserData` function (has issues)
- Right-click → **AI Actions** → **Find Problems**
- Show analysis results

### 6. **Unit Tests** (1 min)
- Cursor in `validatePassword` function
- Right-click → **AI Actions** → **Generate Unit Tests**
- Show comprehensive test file creation

### 7. **Git Integration** (45s)
- Make changes to `demo/git-demo-changes.js`
- Source Control panel → **"Generate Commit Message with AI"**
- Show conventional commit generation

### 8. **Inline Completion** (45s)
- `Alt+Shift+\` to enable
- Type slowly: `function validate`
- Show ghost text → Press `Tab` to accept

## 🎯 Demo Talking Points

### **Opening** (30s)
*"Today I'll demo AI Assistant - a comprehensive coding extension that integrates AI directly into VS Code workflow. It supports multiple AI providers and works completely local for privacy."*

### **Chat Interface**
*"First, our chat interface with intelligent context references. Notice how #thisFile automatically includes the current file content for context-aware responses."*

### **Code Generation**  
*"Generate production-ready code from natural language. The diff view lets you review before accepting changes."*

### **Code Explanation**
*"Explain any code - from complex regex to SQL queries. Perfect for learning and code reviews."*

### **Documentation**
*"Automatic documentation generation with proper formatting for each language - JSDoc for JavaScript, docstrings for Python, etc."*

### **Problem Finding**
*"AI analyzes code for bugs, performance issues, and best practices violations with specific recommendations."*

### **Unit Tests**
*"Generate comprehensive test suites with edge cases. Supports all major testing frameworks."*

### **Git Integration**  
*"Smart commit message generation following conventional format, plus commit explanation for understanding changes."*

### **Inline Completion**
*"Real-time AI-powered code completion that understands context and provides relevant suggestions."*

### **Closing** (30s)
*"This extension transforms your coding workflow with AI assistance while maintaining privacy with local deployment. It's customizable, extensible, and production-ready."*

## 🚨 Troubleshooting

### **Server Issues:**
```bash
./scripts/server-manager.sh restart
```

### **Extension Issues:**
```bash
npm run compile
# Then restart Extension Development Host
```

### **Demo Backup:**
- Use `demo/test-samples.js` for more examples
- Test server: `./scripts/server-manager.sh test`
- API test: `npm run demo`

## ⏱️ Timing Guide

- **Total Demo**: 8-10 minutes
- **Setup**: 1 minute
- **Core Features**: 6-7 minutes  
- **Q&A**: 2-3 minutes

## 🎥 Recording Tips

### **Screen Setup:**
- Full screen VS Code
- Large font (14pt+)
- Dark theme
- Hide distracting UI elements

### **Audio Script:**
- Clear introduction of each feature
- Explain what's happening during processing
- Highlight key benefits
- Mention customization options

## ✅ Demo Checklist

**Pre-Demo:**
- [ ] Server running (`./scripts/demo-setup.sh`)
- [ ] Extension compiled
- [ ] Demo files ready
- [ ] Screen recording setup

**During Demo:**
- [ ] Chat interface with context references
- [ ] Code generation with diff view
- [ ] Code explanation (regex example)
- [ ] Documentation generation
- [ ] Problem finding
- [ ] Unit test generation
- [ ] Git integration
- [ ] Inline completion

**Post-Demo:**
- [ ] Mention multi-provider support
- [ ] Show configuration flexibility
- [ ] Provide next steps
- [ ] Answer questions

## 🔥 Key Selling Points

1. **Complete Integration** - Everything in VS Code, no context switching
2. **Privacy First** - Local AI option, no data sent to external services
3. **Multi-Provider** - OpenAI (GPT-4.1/4.5/4o, O1/O3/O4, Codex), Gemini 2.5, Local AI support
4. **Production Ready** - Error handling, performance optimization, testing
5. **Customizable** - Prompt library, configuration options
6. **Context Aware** - Understands files, git history, project structure

**Ready to demo! 🚀**