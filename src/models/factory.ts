import * as vscode from 'vscode';
import { AIModel, AIModelConfig } from './types';
import { OpenAIModel } from './openai';
import { GeminiModel } from './gemini';
import { LocalAIModel } from './local';

export class ModelFactory {
  private static instance: ModelFactory;
  private currentModel: AIModel | null = null;

  private constructor() {}

  static getInstance(): ModelFactory {
    if (!ModelFactory.instance) {
      ModelFactory.instance = new ModelFactory();
    }
    return ModelFactory.instance;
  }

  getCurrentModel(): AIModel | null {
    return this.currentModel;
  }

  createModel(config?: AIModelConfig): AIModel {
    const modelConfig = config || this.getConfigFromSettings();
    
    switch (modelConfig.provider) {
      case 'openai':
        this.currentModel = new OpenAIModel(modelConfig);
        break;
      case 'gemini':
        this.currentModel = new GeminiModel(modelConfig);
        break;
      case 'local':
        this.currentModel = new LocalAIModel(modelConfig);
        break;
      default:
        throw new Error(`Unsupported AI provider: ${modelConfig.provider}`);
    }

    return this.currentModel;
  }

  refreshModel(): AIModel {
    return this.createModel();
  }

  private getConfigFromSettings(): AIModelConfig {
    const config = vscode.workspace.getConfiguration('aiAssistant');
    const provider = config.get<string>('provider', 'openai') as 'openai' | 'gemini' | 'local';

    const baseConfig: AIModelConfig = {
      provider,
      model: '',
      temperature: 0.7,
      maxTokens: 2000
    };

    switch (provider) {
      case 'openai':
        return {
          ...baseConfig,
          apiKey: config.get<string>('openai.apiKey', ''),
          model: config.get<string>('openai.model', 'gpt-4')
        };
      
      case 'gemini':
        return {
          ...baseConfig,
          apiKey: config.get<string>('gemini.apiKey', ''),
          model: config.get<string>('gemini.model', 'gemini-pro')
        };
      
      case 'local':
        return {
          ...baseConfig,
          endpoint: config.get<string>('local.endpoint', 'http://localhost:11434'),
          model: config.get<string>('local.model', 'llama2'),
          apiKey: config.get<string>('local.apiKey', '')
        };
      
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  validateCurrentModel(): { isValid: boolean; error?: string } {
    if (!this.currentModel) {
      return {
        isValid: false,
        error: 'No AI model configured. Please check your settings.'
      };
    }

    if (!this.currentModel.isConfigured()) {
      const modelInfo = this.currentModel.getModelInfo();
      return {
        isValid: false,
        error: `${modelInfo.provider} model is not properly configured. Please check your API key and settings.`
      };
    }

    return { isValid: true };
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    const validation = this.validateCurrentModel();
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error
      };
    }

    try {
      await this.currentModel!.generateCompletion('Hello, this is a test message. Please respond with "Test successful".');
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: `Connection test failed: ${error.message}`
      };
    }
  }
}