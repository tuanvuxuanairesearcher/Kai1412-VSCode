# 🧠 Gemini Models Support - AI Assistant Extension

Extension đã được cập nhật để hỗ trợ các Gemini models mới nhất từ Google.

## 🚀 Gemini 2.5 Series Models

### **Gemini 2.5 Pro** 
- **Model ID**: `gemini-2.5-pro`
- **Tính năng**: Most capable multimodal model với advanced reasoning
- **Max Tokens**: 8,192
- **Use Cases**: Complex coding, analysis, research
- **Pricing**: $1.25/$5.00 per 1M tokens (input/output)

### **Gemini 2.5 Flash** ⭐ (Default)
- **Model ID**: `gemini-2.5-flash`  
- **Tính năng**: Fast và versatile cho diverse tasks
- **Max Tokens**: 8,192
- **Use Cases**: General coding, chat, documentation
- **Pricing**: $0.075/$0.30 per 1M tokens (input/output)

### **Gemini 2.5 Flash Lite**
- **Model ID**: `gemini-2.5-flash-lite`
- **Tính năng**: Lightweight và siêu nhanh
- **Max Tokens**: 4,096  
- **Use Cases**: Simple tasks, inline completion
- **Pricing**: $0.0375/$0.15 per 1M tokens (input/output)

## 📋 Model Capabilities

| Model | Text Gen | Code Gen | Reasoning | Multimodal | Function Calls | JSON Mode |
|-------|----------|----------|-----------|------------|----------------|-----------|
| 2.5 Pro | ✅ | ✅ | ✅ Advanced | ✅ | ✅ | ✅ |
| 2.5 Flash | ✅ | ✅ | ✅ Good | ✅ | ✅ | ✅ |
| 2.5 Flash Lite | ✅ | ✅ | ✅ Basic | ❌ | ❌ | ❌ |

## ⚙️ Cấu hình Extension

### VS Code Settings
```json
{
  "aiAssistant.provider": "gemini",
  "aiAssistant.gemini.apiKey": "your-google-api-key",
  "aiAssistant.gemini.model": "gemini-2.5-flash"
}
```

### Model Selection Guide

**Cho Coding Complex:**
```json
"aiAssistant.gemini.model": "gemini-2.5-pro"
```

**Cho Daily Development (Recommended):**
```json
"aiAssistant.gemini.model": "gemini-2.5-flash"
```

**Cho Fast Completion:**
```json
"aiAssistant.gemini.model": "gemini-2.5-flash-lite"
```

## 🔄 Migration từ Legacy Models

### Automatic Upgrade
Extension tự động migrate các legacy models:

```
gemini-pro → gemini-2.5-flash (default)
gemini-pro-vision → gemini-2.5-pro (for multimodal needs)
```

### Backward Compatibility
Legacy models vẫn được support:
- `gemini-pro` 
- `gemini-pro-vision`

## 🎯 Performance Comparison

| Metric | 2.5 Pro | 2.5 Flash | 2.5 Flash Lite | Legacy Pro |
|--------|---------|-----------|----------------|------------|
| Speed | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Quality | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Cost | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Features | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

## 🚀 Getting Started

1. **Get API Key**: https://makersuite.google.com/app/apikey
2. **Configure Extension**: Settings → AI Assistant → Gemini
3. **Select Model**: Choose based on your needs
4. **Start Coding**: Extension automatically uses new capabilities!

## 🔧 Advanced Features

### Smart Model Selection
Extension tự động recommend model based on task:

```typescript
// For complex code analysis
getRecommendedGeminiModel('analysis') // → gemini-2.5-pro

// For chat conversations  
getRecommendedGeminiModel('chat') // → gemini-2.5-flash

// For fast completions
getRecommendedGeminiModel('fast') // → gemini-2.5-flash-lite
```

### Capability Detection
```typescript
// Check multimodal support
supportsMultimodal('gemini-2.5-pro') // → true
supportsMultimodal('gemini-2.5-flash-lite') // → false

// Check function calling
supportsFunctionCalling('gemini-2.5-flash') // → true
```

## 📊 Usage Recommendations

### **For Individual Developers**
- **Default**: `gemini-2.5-flash` (best balance)
- **Budget**: `gemini-2.5-flash-lite` (cheapest)
- **Quality**: `gemini-2.5-pro` (best results)

### **For Teams**
- **Coding**: `gemini-2.5-pro` (complex tasks)
- **Daily**: `gemini-2.5-flash` (general work)  
- **CI/CD**: `gemini-2.5-flash-lite` (automated tasks)

### **For Different Tasks**
- **Code Generation**: `gemini-2.5-pro`
- **Code Explanation**: `gemini-2.5-flash`
- **Documentation**: `gemini-2.5-flash`
- **Unit Tests**: `gemini-2.5-pro`
- **Inline Completion**: `gemini-2.5-flash-lite`

## 🎉 What's New

✅ **Latest Models**: Support for Gemini 2.5 series  
✅ **Smart Defaults**: Auto-select best model for tasks  
✅ **Cost Optimization**: Efficient token usage  
✅ **Enhanced Capabilities**: Function calling, JSON mode  
✅ **Backward Compatible**: Legacy models still work  
✅ **Performance Boost**: Faster responses với Flash models  

Enjoy coding với the latest Gemini AI! 🚀