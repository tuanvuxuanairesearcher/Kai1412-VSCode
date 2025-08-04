import axios, { AxiosInstance } from 'axios';
import { AIModel, AIMessage, AIModelConfig, AIModelResponse, StreamingResponse, CodeContext } from './types';
import { getOpenAIModelInfo, openaiSupportsMultimodal, openaiSupportsFunctionCalling, supportsAdvancedReasoning } from './openai-models';

export class OpenAIModel extends AIModel {
  private client: AxiosInstance;

  constructor(config: AIModelConfig) {
    super(config);
    this.client = axios.create({
      baseURL: 'https://api.openai.com/v1',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Log model info for debugging
    const modelInfo = getOpenAIModelInfo(config.model);
    if (modelInfo) {
      console.log(`Using ${modelInfo.name}: ${modelInfo.description}`);
      console.log(`Series: ${modelInfo.series}, Capabilities: ${modelInfo.capabilities.join(', ')}`);
    }
  }

  async generateResponse(messages: AIMessage[]): Promise<AIModelResponse> {
    try {
      const modelInfo = getOpenAIModelInfo(this.config.model);
      const maxTokens = modelInfo?.maxTokens || this.config.maxTokens || 2000;
      
      const requestBody: any = {
        model: this.config.model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        temperature: this.config.temperature || 0.7,
        max_tokens: Math.min(maxTokens, 4096)
      };

      // Add function calling support for compatible models
      if (openaiSupportsFunctionCalling(this.config.model)) {
        // Could add function definitions here if needed
      }

      const response = await this.client.post('/chat/completions', requestBody);

      return {
        content: response.data.choices[0].message.content,
        usage: {
          promptTokens: response.data.usage?.prompt_tokens || 0,
          completionTokens: response.data.usage?.completion_tokens || 0,
          totalTokens: response.data.usage?.total_tokens || 0
        },
        finishReason: response.data.choices[0].finish_reason
      };
    } catch (error: any) {
      throw new Error(`OpenAI API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async* generateStreamingResponse(messages: AIMessage[]): AsyncGenerator<StreamingResponse> {
    try {
      const response = await this.client.post('/chat/completions', {
        model: this.config.model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 2000,
        stream: true
      }, {
        responseType: 'stream'
      });

      let buffer = '';
      
      for await (const chunk of response.data) {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              yield { content: '', done: true };
              return;
            }
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                yield { content, done: false };
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error: any) {
      throw new Error(`OpenAI Streaming Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async generateCompletion(prompt: string, context?: CodeContext): Promise<string> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: 'You are an AI coding assistant. Provide helpful, accurate, and concise responses.'
      },
      {
        role: 'user',
        content: context ? this.formatPromptWithContext(prompt, context) : prompt
      }
    ];

    const response = await this.generateResponse(messages);
    return response.content;
  }

  private formatPromptWithContext(prompt: string, context: CodeContext): string {
    let contextInfo = `File: ${context.fileName}\nLanguage: ${context.language}\n`;
    
    if (context.selectedCode) {
      contextInfo += `Selected code:\n\`\`\`${context.language}\n${context.selectedCode}\n\`\`\`\n`;
    }
    
    if (context.cursorPosition) {
      contextInfo += `Cursor position: Line ${context.cursorPosition.line}, Column ${context.cursorPosition.character}\n`;
    }

    return `${contextInfo}\n${prompt}`;
  }

  isConfigured(): boolean {
    return !!(this.config.apiKey && this.config.model);
  }

  getModelInfo(): { name: string; provider: string; capabilities?: string[]; series?: string } {
    const modelInfo = getOpenAIModelInfo(this.config.model);
    return {
      name: modelInfo?.name || this.config.model,
      provider: 'OpenAI',
      capabilities: modelInfo?.capabilities,
      series: modelInfo?.series
    };
  }
}