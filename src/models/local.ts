import axios, { AxiosInstance } from 'axios';
import { AIModel, AIMessage, AIModelConfig, AIModelResponse, StreamingResponse, CodeContext } from './types';

export class LocalAIModel extends AIModel {
  private client: AxiosInstance;

  constructor(config: AIModelConfig) {
    super(config);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    this.client = axios.create({
      baseURL: config.endpoint,
      headers,
      timeout: 60000 // 60 seconds timeout for local models
    });
  }

  async generateResponse(messages: AIMessage[]): Promise<AIModelResponse> {
    try {
      // Try OpenAI-compatible API first
      const response = await this.client.post('/v1/chat/completions', {
        model: this.config.model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 2000
      });

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
      // If OpenAI-compatible API fails, try Ollama format
      if (error.response?.status === 404) {
        return this.generateOllamaResponse(messages);
      }
      throw new Error(`Local AI API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  private async generateOllamaResponse(messages: AIMessage[]): Promise<AIModelResponse> {
    try {
      const prompt = messages.map(msg => {
        const rolePrefix = msg.role === 'user' ? 'Human: ' : 
                          msg.role === 'assistant' ? 'Assistant: ' : 
                          'System: ';
        return `${rolePrefix}${msg.content}`;
      }).join('\n\n') + '\n\nAssistant: ';

      const response = await this.client.post('/api/generate', {
        model: this.config.model,
        prompt,
        stream: false,
        options: {
          temperature: this.config.temperature || 0.7,
          num_predict: this.config.maxTokens || 2000
        }
      });

      return {
        content: response.data.response,
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0
        },
        finishReason: response.data.done ? 'stop' : 'length'
      };
    } catch (error: any) {
      throw new Error(`Ollama API Error: ${error.response?.data?.error || error.message}`);
    }
  }

  async* generateStreamingResponse(messages: AIMessage[]): AsyncGenerator<StreamingResponse> {
    try {
      // Try OpenAI-compatible streaming first
      const response = await this.client.post('/v1/chat/completions', {
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

      yield* this.handleOpenAIStream(response.data);
    } catch (error: any) {
      // Fallback to Ollama streaming
      if (error.response?.status === 404) {
        yield* this.generateOllamaStream(messages);
      } else {
        throw new Error(`Local AI Streaming Error: ${error.response?.data?.error?.message || error.message}`);
      }
    }
  }

  private async* handleOpenAIStream(stream: any): AsyncGenerator<StreamingResponse> {
    let buffer = '';
    
    for await (const chunk of stream) {
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
  }

  private async* generateOllamaStream(messages: AIMessage[]): AsyncGenerator<StreamingResponse> {
    try {
      const prompt = messages.map(msg => {
        const rolePrefix = msg.role === 'user' ? 'Human: ' : 
                          msg.role === 'assistant' ? 'Assistant: ' : 
                          'System: ';
        return `${rolePrefix}${msg.content}`;
      }).join('\n\n') + '\n\nAssistant: ';

      const response = await this.client.post('/api/generate', {
        model: this.config.model,
        prompt,
        stream: true,
        options: {
          temperature: this.config.temperature || 0.7,
          num_predict: this.config.maxTokens || 2000
        }
      }, {
        responseType: 'stream'
      });

      let buffer = '';
      
      for await (const chunk of response.data) {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.response) {
                yield { content: parsed.response, done: false };
              }
              if (parsed.done) {
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
      throw new Error(`Ollama Streaming Error: ${error.response?.data?.error || error.message}`);
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
    return !!(this.config.endpoint && this.config.model);
  }

  getModelInfo(): { name: string; provider: string } {
    return {
      name: this.config.model,
      provider: 'Local AI'
    };
  }
}