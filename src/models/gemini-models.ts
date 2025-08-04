/**
 * Google Gemini Models Configuration
 * Updated with latest Gemini 2.5 series models
 */

export interface GeminiModelInfo {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  pricing?: {
    input: number;    // per 1M tokens
    output: number;   // per 1M tokens
  };
  capabilities: string[];
}

export const GEMINI_MODELS: Record<string, GeminiModelInfo> = {
  'gemini-2.5-pro': {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    description: 'Most capable multimodal model with advanced reasoning',
    maxTokens: 8192,
    pricing: {
      input: 1.25,
      output: 5.00
    },
    capabilities: [
      'text-generation',
      'code-generation',
      'reasoning',
      'multimodal',
      'function-calling',
      'json-mode'
    ]
  },
  
  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash', 
    description: 'Fast and versatile model for diverse tasks',
    maxTokens: 8192,
    pricing: {
      input: 0.075,
      output: 0.30
    },
    capabilities: [
      'text-generation',
      'code-generation',
      'reasoning',
      'multimodal',
      'function-calling',
      'json-mode'
    ]
  },
  
  'gemini-2.5-flash-lite': {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    description: 'Lightweight and fast model for simple tasks',
    maxTokens: 4096,
    pricing: {
      input: 0.0375,
      output: 0.15
    },
    capabilities: [
      'text-generation',
      'code-generation',
      'basic-reasoning'
    ]
  },

  // Legacy models for backward compatibility
  'gemini-pro': {
    id: 'gemini-pro',
    name: 'Gemini Pro (Legacy)',
    description: 'Legacy Gemini Pro model',
    maxTokens: 4096,
    capabilities: [
      'text-generation',
      'code-generation',
      'reasoning'
    ]
  },

  'gemini-pro-vision': {
    id: 'gemini-pro-vision',
    name: 'Gemini Pro Vision (Legacy)',
    description: 'Legacy Gemini Pro with vision capabilities',
    maxTokens: 4096,
    capabilities: [
      'text-generation',
      'code-generation',
      'vision',
      'multimodal'
    ]
  }
};

/**
 * Get model info by ID
 */
export function getGeminiModelInfo(modelId: string): GeminiModelInfo | null {
  return GEMINI_MODELS[modelId] || null;
}

/**
 * Get all available Gemini models
 */
export function getAllGeminiModels(): GeminiModelInfo[] {
  return Object.values(GEMINI_MODELS);
}

/**
 * Get recommended model for specific task
 */
export function getRecommendedGeminiModel(task: 'code' | 'chat' | 'analysis' | 'fast'): string {
  switch (task) {
    case 'code':
      return 'gemini-2.5-pro';  // Best for complex code tasks
    case 'chat':
      return 'gemini-2.5-flash'; // Good balance for conversations
    case 'analysis':
      return 'gemini-2.5-pro';  // Best reasoning capabilities
    case 'fast':
      return 'gemini-2.5-flash-lite'; // Fastest response
    default:
      return 'gemini-2.5-flash';
  }
}

/**
 * Check if Gemini model supports multimodal capabilities
 */
export function geminiSupportsMultimodal(modelId: string): boolean {
  const model = getGeminiModelInfo(modelId);
  return model?.capabilities.includes('multimodal') || false;
}

/**
 * Check if Gemini model supports function calling
 */
export function geminiSupportsFunctionCalling(modelId: string): boolean {
  const model = getGeminiModelInfo(modelId);
  return model?.capabilities.includes('function-calling') || false;
}