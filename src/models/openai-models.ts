/**
 * OpenAI Models Configuration
 * Updated with latest GPT-4.1, GPT-4.5, GPT-4o, O1, O3, O4 series models
 */

export interface OpenAIModelInfo {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  contextWindow?: number;
  pricing: {
    input: number;        // per 1M tokens
    cachedInput?: number; // per 1M tokens (if supported)
    output: number;       // per 1M tokens
  };
  capabilities: string[];
  series: 'gpt-4.1' | 'gpt-4.5' | 'gpt-4o' | 'o1' | 'o3' | 'o4' | 'codex' | 'legacy';
  releaseDate?: string;
}

export const OPENAI_MODELS: Record<string, OpenAIModelInfo> = {
  // GPT-4.1 Series (Latest GPT-4 generation)
  'gpt-4.1': {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    description: 'Latest GPT-4 model with enhanced capabilities',
    maxTokens: 4096,
    contextWindow: 128000,
    pricing: { input: 2.00, cachedInput: 0.50, output: 8.00 },
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'function-calling', 'json-mode'],
    series: 'gpt-4.1',
    releaseDate: '2025-04-14'
  },

  'gpt-4.1-2025-04-14': {
    id: 'gpt-4.1-2025-04-14',
    name: 'GPT-4.1 (2025-04-14)',
    description: 'Timestamped GPT-4.1 model',
    maxTokens: 4096,
    contextWindow: 128000,
    pricing: { input: 2.00, cachedInput: 0.50, output: 8.00 },
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'function-calling', 'json-mode'],
    series: 'gpt-4.1',
    releaseDate: '2025-04-14'
  },

  'gpt-4.1-mini': {
    id: 'gpt-4.1-mini',
    name: 'GPT-4.1 Mini',
    description: 'Cost-efficient GPT-4.1 variant',
    maxTokens: 4096,
    contextWindow: 128000,
    pricing: { input: 0.40, cachedInput: 0.10, output: 1.60 },
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'function-calling', 'json-mode'],
    series: 'gpt-4.1',
    releaseDate: '2025-04-14'
  },

  'gpt-4.1-mini-2025-04-14': {
    id: 'gpt-4.1-mini-2025-04-14',
    name: 'GPT-4.1 Mini (2025-04-14)',
    description: 'Timestamped GPT-4.1 Mini model',
    maxTokens: 4096,
    contextWindow: 128000,
    pricing: { input: 0.40, cachedInput: 0.10, output: 1.60 },
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'function-calling', 'json-mode'],
    series: 'gpt-4.1',
    releaseDate: '2025-04-14'
  },

  'gpt-4.1-nano': {
    id: 'gpt-4.1-nano',
    name: 'GPT-4.1 Nano',
    description: 'Ultra-lightweight GPT-4.1 for simple tasks',
    maxTokens: 2048,
    contextWindow: 32000,
    pricing: { input: 0.10, cachedInput: 0.025, output: 0.40 },
    capabilities: ['text-generation', 'code-generation', 'basic-reasoning'],
    series: 'gpt-4.1',
    releaseDate: '2025-04-14'
  },

  'gpt-4.1-nano-2025-04-14': {
    id: 'gpt-4.1-nano-2025-04-14',
    name: 'GPT-4.1 Nano (2025-04-14)',
    description: 'Timestamped GPT-4.1 Nano model',
    maxTokens: 2048,
    contextWindow: 32000,
    pricing: { input: 0.10, cachedInput: 0.025, output: 0.40 },
    capabilities: ['text-generation', 'code-generation', 'basic-reasoning'],
    series: 'gpt-4.1',
    releaseDate: '2025-04-14'
  },

  // GPT-4.5 Series (Preview)
  'gpt-4.5-preview': {
    id: 'gpt-4.5-preview',
    name: 'GPT-4.5 Preview',
    description: 'Next-generation GPT model with advanced capabilities',
    maxTokens: 8192,
    contextWindow: 200000,
    pricing: { input: 75.00, cachedInput: 37.50, output: 150.00 },
    capabilities: ['text-generation', 'code-generation', 'advanced-reasoning', 'multimodal', 'function-calling', 'json-mode'],
    series: 'gpt-4.5',
    releaseDate: '2025-02-27'
  },

  'gpt-4.5-preview-2025-02-27': {
    id: 'gpt-4.5-preview-2025-02-27',
    name: 'GPT-4.5 Preview (2025-02-27)',
    description: 'Timestamped GPT-4.5 Preview model',
    maxTokens: 8192,
    contextWindow: 200000,
    pricing: { input: 75.00, cachedInput: 37.50, output: 150.00 },
    capabilities: ['text-generation', 'code-generation', 'advanced-reasoning', 'multimodal', 'function-calling', 'json-mode'],
    series: 'gpt-4.5',
    releaseDate: '2025-02-27'
  },

  // GPT-4o Series (Omni models)
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Multimodal GPT-4 with vision and audio capabilities',
    maxTokens: 4096,
    contextWindow: 128000,
    pricing: { input: 2.50, cachedInput: 1.25, output: 10.00 },
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'multimodal', 'vision', 'function-calling', 'json-mode'],
    series: 'gpt-4o',
    releaseDate: '2024-08-06'
  },

  'gpt-4o-2024-08-06': {
    id: 'gpt-4o-2024-08-06',
    name: 'GPT-4o (2024-08-06)',
    description: 'Timestamped GPT-4o model',
    maxTokens: 4096,
    contextWindow: 128000,
    pricing: { input: 2.50, cachedInput: 1.25, output: 10.00 },
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'multimodal', 'vision', 'function-calling', 'json-mode'],
    series: 'gpt-4o',
    releaseDate: '2024-08-06'
  },

  'gpt-4o-audio-preview': {
    id: 'gpt-4o-audio-preview',
    name: 'GPT-4o Audio Preview',
    description: 'GPT-4o with audio processing capabilities',
    maxTokens: 4096,
    contextWindow: 128000,
    pricing: { input: 2.50, output: 10.00 },
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'multimodal', 'audio', 'function-calling'],
    series: 'gpt-4o',
    releaseDate: '2025-06-03'
  },

  'gpt-4o-audio-preview-2025-06-03': {
    id: 'gpt-4o-audio-preview-2025-06-03',
    name: 'GPT-4o Audio Preview (2025-06-03)',
    description: 'Timestamped GPT-4o Audio Preview',
    maxTokens: 4096,
    contextWindow: 128000,
    pricing: { input: 2.50, output: 10.00 },
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'multimodal', 'audio', 'function-calling'],
    series: 'gpt-4o',
    releaseDate: '2025-06-03'
  },

  'gpt-4o-realtime-preview': {
    id: 'gpt-4o-realtime-preview',
    name: 'GPT-4o Realtime Preview',
    description: 'GPT-4o optimized for real-time interactions',
    maxTokens: 4096,
    contextWindow: 128000,
    pricing: { input: 5.00, cachedInput: 2.50, output: 20.00 },
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'multimodal', 'realtime', 'function-calling'],
    series: 'gpt-4o',
    releaseDate: '2025-06-03'
  },

  'gpt-4o-realtime-preview-2025-06-03': {
    id: 'gpt-4o-realtime-preview-2025-06-03',
    name: 'GPT-4o Realtime Preview (2025-06-03)',
    description: 'Timestamped GPT-4o Realtime Preview',
    maxTokens: 4096,
    contextWindow: 128000,
    pricing: { input: 5.00, cachedInput: 2.50, output: 20.00 },
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'multimodal', 'realtime', 'function-calling'],
    series: 'gpt-4o',
    releaseDate: '2025-06-03'
  },

  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Cost-efficient multimodal GPT-4o variant',
    maxTokens: 4096,
    contextWindow: 128000,
    pricing: { input: 0.15, cachedInput: 0.075, output: 0.60 },
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'multimodal', 'vision', 'function-calling', 'json-mode'],
    series: 'gpt-4o',
    releaseDate: '2024-07-18'
  },

  'gpt-4o-mini-2024-07-18': {
    id: 'gpt-4o-mini-2024-07-18',
    name: 'GPT-4o Mini (2024-07-18)',
    description: 'Timestamped GPT-4o Mini model',
    maxTokens: 4096,
    contextWindow: 128000,
    pricing: { input: 0.15, cachedInput: 0.075, output: 0.60 },
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'multimodal', 'vision', 'function-calling', 'json-mode'],
    series: 'gpt-4o',
    releaseDate: '2024-07-18'
  },

  'gpt-4o-mini-audio-preview': {
    id: 'gpt-4o-mini-audio-preview',
    name: 'GPT-4o Mini Audio Preview',
    description: 'GPT-4o Mini with audio capabilities',
    maxTokens: 4096,
    contextWindow: 128000,
    pricing: { input: 0.15, output: 0.60 },
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'multimodal', 'audio', 'function-calling'],
    series: 'gpt-4o',
    releaseDate: '2024-12-17'
  },

  'gpt-4o-mini-audio-preview-2024-12-17': {
    id: 'gpt-4o-mini-audio-preview-2024-12-17',
    name: 'GPT-4o Mini Audio Preview (2024-12-17)',
    description: 'Timestamped GPT-4o Mini Audio Preview',
    maxTokens: 4096,
    contextWindow: 128000,
    pricing: { input: 0.15, output: 0.60 },
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'multimodal', 'audio', 'function-calling'],
    series: 'gpt-4o',
    releaseDate: '2024-12-17'
  },

  'gpt-4o-mini-realtime-preview': {
    id: 'gpt-4o-mini-realtime-preview',
    name: 'GPT-4o Mini Realtime Preview',
    description: 'GPT-4o Mini optimized for real-time interactions',
    maxTokens: 4096,
    contextWindow: 128000,
    pricing: { input: 0.60, cachedInput: 0.30, output: 2.40 },
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'multimodal', 'realtime', 'function-calling'],
    series: 'gpt-4o',
    releaseDate: '2024-12-17'
  },

  'gpt-4o-mini-realtime-preview-2024-12-17': {
    id: 'gpt-4o-mini-realtime-preview-2024-12-17',
    name: 'GPT-4o Mini Realtime Preview (2024-12-17)',
    description: 'Timestamped GPT-4o Mini Realtime Preview',
    maxTokens: 4096,
    contextWindow: 128000,
    pricing: { input: 0.60, cachedInput: 0.30, output: 2.40 },
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'multimodal', 'realtime', 'function-calling'],
    series: 'gpt-4o',
    releaseDate: '2024-12-17'
  },

  // O1 Series (Reasoning models)
  'o1': {
    id: 'o1',
    name: 'O1',
    description: 'Advanced reasoning model with chain-of-thought capabilities',
    maxTokens: 4096,
    contextWindow: 200000,
    pricing: { input: 15.00, cachedInput: 7.50, output: 60.00 },
    capabilities: ['text-generation', 'code-generation', 'advanced-reasoning', 'chain-of-thought', 'problem-solving'],
    series: 'o1',
    releaseDate: '2024-12-17'
  },

  'o1-2024-12-17': {
    id: 'o1-2024-12-17',
    name: 'O1 (2024-12-17)',
    description: 'Timestamped O1 reasoning model',
    maxTokens: 4096,
    contextWindow: 200000,
    pricing: { input: 15.00, cachedInput: 7.50, output: 60.00 },
    capabilities: ['text-generation', 'code-generation', 'advanced-reasoning', 'chain-of-thought', 'problem-solving'],
    series: 'o1',
    releaseDate: '2024-12-17'
  },

  'o1-pro': {
    id: 'o1-pro',
    name: 'O1 Pro',
    description: 'Professional-grade reasoning model with enhanced capabilities',
    maxTokens: 8192,
    contextWindow: 200000,
    pricing: { input: 150.00, output: 600.00 },
    capabilities: ['text-generation', 'code-generation', 'advanced-reasoning', 'chain-of-thought', 'problem-solving', 'research'],
    series: 'o1',
    releaseDate: '2025-03-19'
  },

  'o1-pro-2025-03-19': {
    id: 'o1-pro-2025-03-19',
    name: 'O1 Pro (2025-03-19)',
    description: 'Timestamped O1 Pro model',
    maxTokens: 8192,
    contextWindow: 200000,
    pricing: { input: 150.00, output: 600.00 },
    capabilities: ['text-generation', 'code-generation', 'advanced-reasoning', 'chain-of-thought', 'problem-solving', 'research'],
    series: 'o1',
    releaseDate: '2025-03-19'
  },

  'o1-mini': {
    id: 'o1-mini',
    name: 'O1 Mini',
    description: 'Cost-efficient reasoning model',
    maxTokens: 4096,
    contextWindow: 128000,
    pricing: { input: 1.10, cachedInput: 0.55, output: 4.40 },
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'chain-of-thought', 'problem-solving'],
    series: 'o1',
    releaseDate: '2024-09-12'
  },

  'o1-mini-2024-09-12': {
    id: 'o1-mini-2024-09-12',
    name: 'O1 Mini (2024-09-12)',
    description: 'Timestamped O1 Mini model',
    maxTokens: 4096,
    contextWindow: 128000,
    pricing: { input: 1.10, cachedInput: 0.55, output: 4.40 },
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'chain-of-thought', 'problem-solving'],
    series: 'o1',
    releaseDate: '2024-09-12'
  },

  // O3 Series (Next-gen reasoning)
  'o3': {
    id: 'o3',
    name: 'O3',
    description: 'Next-generation reasoning model',
    maxTokens: 4096,
    contextWindow: 200000,
    pricing: { input: 2.00, cachedInput: 0.50, output: 8.00 },
    capabilities: ['text-generation', 'code-generation', 'advanced-reasoning', 'chain-of-thought', 'problem-solving'],
    series: 'o3',
    releaseDate: '2025-04-16'
  },

  'o3-2025-04-16': {
    id: 'o3-2025-04-16',
    name: 'O3 (2025-04-16)',
    description: 'Timestamped O3 model',
    maxTokens: 4096,
    contextWindow: 200000,
    pricing: { input: 2.00, cachedInput: 0.50, output: 8.00 },
    capabilities: ['text-generation', 'code-generation', 'advanced-reasoning', 'chain-of-thought', 'problem-solving'],
    series: 'o3',
    releaseDate: '2025-04-16'
  },

  'o3-pro': {
    id: 'o3-pro',
    name: 'O3 Pro',
    description: 'Professional O3 model with enhanced reasoning',
    maxTokens: 8192,
    contextWindow: 200000,
    pricing: { input: 20.00, output: 80.00 },
    capabilities: ['text-generation', 'code-generation', 'advanced-reasoning', 'chain-of-thought', 'problem-solving', 'research'],
    series: 'o3',
    releaseDate: '2025-06-10'
  },

  'o3-pro-2025-06-10': {
    id: 'o3-pro-2025-06-10',
    name: 'O3 Pro (2025-06-10)',
    description: 'Timestamped O3 Pro model',
    maxTokens: 8192,
    contextWindow: 200000,
    pricing: { input: 20.00, output: 80.00 },
    capabilities: ['text-generation', 'code-generation', 'advanced-reasoning', 'chain-of-thought', 'problem-solving', 'research'],
    series: 'o3',
    releaseDate: '2025-06-10'
  },

  'o3-deep-research': {
    id: 'o3-deep-research',
    name: 'O3 Deep Research',
    description: 'O3 optimized for deep research and analysis',
    maxTokens: 8192,
    contextWindow: 200000,
    pricing: { input: 10.00, cachedInput: 2.50, output: 40.00 },
    capabilities: ['text-generation', 'code-generation', 'advanced-reasoning', 'chain-of-thought', 'research', 'analysis'],
    series: 'o3',
    releaseDate: '2025-06-26'
  },

  'o3-deep-research-2025-06-26': {
    id: 'o3-deep-research-2025-06-26',
    name: 'O3 Deep Research (2025-06-26)',
    description: 'Timestamped O3 Deep Research model',
    maxTokens: 8192,
    contextWindow: 200000,
    pricing: { input: 10.00, cachedInput: 2.50, output: 40.00 },
    capabilities: ['text-generation', 'code-generation', 'advanced-reasoning', 'chain-of-thought', 'research', 'analysis'],
    series: 'o3',
    releaseDate: '2025-06-26'
  },

  'o3-mini': {
    id: 'o3-mini',
    name: 'O3 Mini',
    description: 'Cost-efficient O3 reasoning model',
    maxTokens: 4096,
    contextWindow: 128000,
    pricing: { input: 1.10, cachedInput: 0.55, output: 4.40 },
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'chain-of-thought', 'problem-solving'],
    series: 'o3',
    releaseDate: '2025-01-31'
  },

  'o3-mini-2025-01-31': {
    id: 'o3-mini-2025-01-31',
    name: 'O3 Mini (2025-01-31)',
    description: 'Timestamped O3 Mini model',
    maxTokens: 4096,
    contextWindow: 128000,
    pricing: { input: 1.10, cachedInput: 0.55, output: 4.40 },
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'chain-of-thought', 'problem-solving'],
    series: 'o3',
    releaseDate: '2025-01-31'
  },

  // O4 Series (Latest reasoning)
  'o4-mini': {
    id: 'o4-mini',
    name: 'O4 Mini',
    description: 'Latest mini reasoning model',
    maxTokens: 4096,
    contextWindow: 128000,
    pricing: { input: 1.10, cachedInput: 0.275, output: 4.40 },
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'chain-of-thought', 'problem-solving'],
    series: 'o4',
    releaseDate: '2025-04-16'
  },

  'o4-mini-2025-04-16': {
    id: 'o4-mini-2025-04-16',
    name: 'O4 Mini (2025-04-16)',
    description: 'Timestamped O4 Mini model',
    maxTokens: 4096,
    contextWindow: 128000,
    pricing: { input: 1.10, cachedInput: 0.275, output: 4.40 },
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'chain-of-thought', 'problem-solving'],
    series: 'o4',
    releaseDate: '2025-04-16'
  },

  'o4-mini-deep-research': {
    id: 'o4-mini-deep-research',
    name: 'O4 Mini Deep Research',
    description: 'O4 Mini optimized for research tasks',
    maxTokens: 8192,
    contextWindow: 128000,
    pricing: { input: 2.00, cachedInput: 0.50, output: 8.00 },
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'chain-of-thought', 'research', 'analysis'],
    series: 'o4',
    releaseDate: '2025-06-26'
  },

  'o4-mini-deep-research-2025-06-26': {
    id: 'o4-mini-deep-research-2025-06-26',
    name: 'O4 Mini Deep Research (2025-06-26)',
    description: 'Timestamped O4 Mini Deep Research model',
    maxTokens: 8192,
    contextWindow: 128000,
    pricing: { input: 2.00, cachedInput: 0.50, output: 8.00 },
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'chain-of-thought', 'research', 'analysis'],
    series: 'o4',
    releaseDate: '2025-06-26'
  },

  // Codex Series (Code-specialized)
  'codex-mini-latest': {
    id: 'codex-mini-latest',
    name: 'Codex Mini Latest',
    description: 'Specialized coding model optimized for development tasks',
    maxTokens: 4096,
    contextWindow: 8000,
    pricing: { input: 1.50, cachedInput: 0.375, output: 6.00 },
    capabilities: ['code-generation', 'code-completion', 'code-analysis', 'debugging', 'refactoring'],
    series: 'codex'
  },

  // Legacy Models (for backward compatibility)
  'gpt-4': {
    id: 'gpt-4',
    name: 'GPT-4 (Legacy)',
    description: 'Legacy GPT-4 model',
    maxTokens: 4096,
    contextWindow: 8192,
    pricing: { input: 30.00, output: 60.00 },
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'function-calling'],
    series: 'legacy'
  },

  'gpt-4-turbo': {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo (Legacy)',
    description: 'Legacy GPT-4 Turbo model',
    maxTokens: 4096,
    contextWindow: 128000,
    pricing: { input: 10.00, output: 30.00 },
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'function-calling', 'json-mode'],
    series: 'legacy'
  },

  'gpt-3.5-turbo': {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo (Legacy)',
    description: 'Legacy GPT-3.5 Turbo model',
    maxTokens: 4096,
    contextWindow: 16384,
    pricing: { input: 0.50, output: 1.50 },
    capabilities: ['text-generation', 'code-generation', 'function-calling'],
    series: 'legacy'
  }
};

/**
 * Get model info by ID
 */
export function getOpenAIModelInfo(modelId: string): OpenAIModelInfo | null {
  return OPENAI_MODELS[modelId] || null;
}

/**
 * Get all available OpenAI models
 */
export function getAllOpenAIModels(): OpenAIModelInfo[] {
  return Object.values(OPENAI_MODELS);
}

/**
 * Get models by series
 */
export function getOpenAIModelsBySeries(series: OpenAIModelInfo['series']): OpenAIModelInfo[] {
  return Object.values(OPENAI_MODELS).filter(model => model.series === series);
}

/**
 * Get recommended model for specific task
 */
export function getRecommendedOpenAIModel(task: 'code' | 'chat' | 'reasoning' | 'research' | 'fast' | 'budget'): string {
  switch (task) {
    case 'code':
      return 'codex-mini-latest';     // Specialized for coding
    case 'chat':
      return 'gpt-4o-mini';          // Good balance for conversations
    case 'reasoning':
      return 'o3';                   // Best reasoning capabilities
    case 'research':
      return 'o3-deep-research';     // Optimized for research
    case 'fast':
      return 'gpt-4.1-nano';         // Fastest response
    case 'budget':
      return 'gpt-4.1-nano';         // Most cost-effective
    default:
      return 'gpt-4o-mini';          // Safe default
  }
}

/**
 * Check if OpenAI model supports multimodal capabilities
 */
export function openaiSupportsMultimodal(modelId: string): boolean {
  const model = getOpenAIModelInfo(modelId);
  return model?.capabilities.includes('multimodal') || model?.capabilities.includes('vision') || false;
}

/**
 * Check if OpenAI model supports function calling
 */
export function openaiSupportsFunctionCalling(modelId: string): boolean {
  const model = getOpenAIModelInfo(modelId);
  return model?.capabilities.includes('function-calling') || false;
}

/**
 * Check if model supports reasoning
 */
export function supportsAdvancedReasoning(modelId: string): boolean {
  const model = getOpenAIModelInfo(modelId);
  return model?.capabilities.includes('advanced-reasoning') || model?.capabilities.includes('chain-of-thought') || false;
}

/**
 * Get cost per 1M tokens for input/output
 */
export function getModelCost(modelId: string): { input: number; cachedInput?: number; output: number } | null {
  const model = getOpenAIModelInfo(modelId);
  return model?.pricing || null;
}

/**
 * Get most cost-effective models
 */
export function getCostEffectiveModels(limit: number = 5): OpenAIModelInfo[] {
  return Object.values(OPENAI_MODELS)
    .sort((a, b) => (a.pricing.input + a.pricing.output) - (b.pricing.input + b.pricing.output))
    .slice(0, limit);
}

/**
 * Get latest models (by release date)
 */
export function getLatestModels(limit: number = 10): OpenAIModelInfo[] {
  return Object.values(OPENAI_MODELS)
    .filter(model => model.releaseDate)
    .sort((a, b) => new Date(b.releaseDate!).getTime() - new Date(a.releaseDate!).getTime())
    .slice(0, limit);
}