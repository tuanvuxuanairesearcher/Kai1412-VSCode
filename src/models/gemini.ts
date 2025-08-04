import axios, { AxiosInstance } from 'axios';
import { AIModel, AIMessage, AIModelConfig, AIModelResponse, StreamingResponse, CodeContext } from './types';

export class GeminiModel extends AIModel {
  private client: AxiosInstance;

  constructor(config: AIModelConfig) {
    super(config);
    this.client = axios.create({
      baseURL: 'https://generativelanguage.googleapis.com/v1beta',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async generateResponse(messages: AIMessage[]): Promise<AIModelResponse> {
    try {
      const contents = this.convertMessagesToGeminiFormat(messages);
      
      const response = await this.client.post(
        `/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,
        {
          contents,
          generationConfig: {
            temperature: this.config.temperature || 0.7,
            maxOutputTokens: this.config.maxTokens || 2000
          }
        }
      );

      const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      return {
        content,
        usage: {
          promptTokens: response.data.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.data.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.data.usageMetadata?.totalTokenCount || 0
        },
        finishReason: response.data.candidates?.[0]?.finishReason
      };
    } catch (error: any) {
      throw new Error(`Gemini API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async* generateStreamingResponse(messages: AIMessage[]): AsyncGenerator<StreamingResponse> {
    try {
      const contents = this.convertMessagesToGeminiFormat(messages);
      
      const response = await this.client.post(
        `/models/${this.config.model}:streamGenerateContent?key=${this.config.apiKey}`,
        {
          contents,
          generationConfig: {
            temperature: this.config.temperature || 0.7,
            maxOutputTokens: this.config.maxTokens || 2000
          }
        },
        {
          responseType: 'stream'
        }
      );

      let buffer = '';
      
      for await (const chunk of response.data) {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);
              const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
              
              if (content) {
                yield { content, done: false };
              }
              
              if (parsed.candidates?.[0]?.finishReason) {
                yield { content: '', done: true };
                return;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error: any) {
      throw new Error(`Gemini Streaming Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async generateCompletion(prompt: string, context?: CodeContext): Promise<string> {
    const messages: AIMessage[] = [
      {
        role: 'user',
        content: context ? this.formatPromptWithContext(prompt, context) : prompt
      }
    ];

    const response = await this.generateResponse(messages);
    return response.content;
  }

  private convertMessagesToGeminiFormat(messages: AIMessage[]) {
    const contents = [];
    let systemMessage = '';

    for (const message of messages) {
      if (message.role === 'system') {
        systemMessage = message.content;
        continue;
      }

      contents.push({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.role === 'user' && systemMessage ? `${systemMessage}\n\n${message.content}` : message.content }]
      });
      
      systemMessage = ''; // Only add system message to first user message
    }

    return contents;
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

  getModelInfo(): { name: string; provider: string } {
    return {
      name: this.config.model,
      provider: 'Google Gemini'
    };
  }
}