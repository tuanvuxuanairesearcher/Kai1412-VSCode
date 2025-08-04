/**
 * Common types and interfaces for AI models
 */

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface AIModelConfig {
  provider: 'openai' | 'gemini' | 'local';
  apiKey?: string;
  endpoint?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIModelResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

export interface StreamingResponse {
  content: string;
  done: boolean;
}

export interface CodeContext {
  fileName: string;
  language: string;
  selectedCode?: string;
  cursorPosition?: {
    line: number;
    character: number;
  };
  entireFile?: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[];
}

export abstract class AIModel {
  protected config: AIModelConfig;

  constructor(config: AIModelConfig) {
    this.config = config;
  }

  abstract generateResponse(messages: AIMessage[]): Promise<AIModelResponse>;
  abstract generateStreamingResponse(messages: AIMessage[]): AsyncGenerator<StreamingResponse>;
  abstract generateCompletion(prompt: string, context?: CodeContext): Promise<string>;
  abstract isConfigured(): boolean;
  abstract getModelInfo(): { name: string; provider: string };
}