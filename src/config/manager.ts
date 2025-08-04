import * as vscode from 'vscode';

export class ConfigurationManager {
  private static instance: ConfigurationManager;

  private constructor() {}

  static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  getProvider(): 'openai' | 'gemini' | 'local' {
    return vscode.workspace.getConfiguration('aiAssistant').get('provider', 'openai');
  }

  getOpenAIConfig() {
    const config = vscode.workspace.getConfiguration('aiAssistant.openai');
    return {
      apiKey: config.get<string>('apiKey', ''),
      model: config.get<string>('model', 'gpt-4')
    };
  }

  getGeminiConfig() {
    const config = vscode.workspace.getConfiguration('aiAssistant.gemini');
    return {
      apiKey: config.get<string>('apiKey', ''),
      model: config.get<string>('model', 'gemini-pro')
    };
  }

  getLocalConfig() {
    const config = vscode.workspace.getConfiguration('aiAssistant.local');
    return {
      endpoint: config.get<string>('endpoint', 'http://localhost:11434'),
      model: config.get<string>('model', 'llama2'),
      apiKey: config.get<string>('apiKey', '')
    };
  }

  isInlineCompletionEnabled(): boolean {
    return vscode.workspace.getConfiguration('aiAssistant').get('enableInlineCompletion', true);
  }

  getCompletionAcceptKey(): string {
    return vscode.workspace.getConfiguration('aiAssistant').get('completionAcceptKey', 'Tab');
  }

  shouldShowChatPanel(): boolean {
    return vscode.workspace.getConfiguration('aiAssistant').get('showChatPanel', true);
  }

  async updateConfiguration(section: string, value: any, target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Global): Promise<void> {
    const config = vscode.workspace.getConfiguration('aiAssistant');
    await config.update(section, value, target);
  }

  async openSettings(): Promise<void> {
    await vscode.commands.executeCommand('workbench.action.openSettings', 'aiAssistant');
  }

  onConfigurationChanged(callback: (e: vscode.ConfigurationChangeEvent) => void): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('aiAssistant')) {
        callback(e);
      }
    });
  }

  validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const provider = this.getProvider();

    switch (provider) {
      case 'openai':
        const openaiConfig = this.getOpenAIConfig();
        if (!openaiConfig.apiKey) {
          errors.push('OpenAI API Key is required');
        }
        if (!openaiConfig.model) {
          errors.push('OpenAI model is required');
        }
        break;

      case 'gemini':
        const geminiConfig = this.getGeminiConfig();
        if (!geminiConfig.apiKey) {
          errors.push('Gemini API Key is required');
        }
        if (!geminiConfig.model) {
          errors.push('Gemini model is required');
        }
        break;

      case 'local':
        const localConfig = this.getLocalConfig();
        if (!localConfig.endpoint) {
          errors.push('Local AI endpoint is required');
        }
        if (!localConfig.model) {
          errors.push('Local AI model is required');
        }
        try {
          new URL(localConfig.endpoint);
        } catch {
          errors.push('Local AI endpoint must be a valid URL');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async showConfigurationPrompt(): Promise<void> {
    const validation = this.validateConfiguration();
    
    if (!validation.isValid) {
      const action = await vscode.window.showWarningMessage(
        `AI Assistant configuration issues:\n${validation.errors.join('\n')}`,
        'Open Settings',
        'Ignore'
      );

      if (action === 'Open Settings') {
        await this.openSettings();
      }
    }
  }
}