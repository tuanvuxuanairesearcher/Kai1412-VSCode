import * as vscode from 'vscode';
import { PromptTemplate } from '../models/types';

export class PromptLibrary {
  private static instance: PromptLibrary;
  private templates: Map<string, PromptTemplate> = new Map();

  private constructor() {
    this.initializeDefaultTemplates();
  }

  static getInstance(): PromptLibrary {
    if (!PromptLibrary.instance) {
      PromptLibrary.instance = new PromptLibrary();
    }
    return PromptLibrary.instance;
  }

  private initializeDefaultTemplates(): void {
    const defaultTemplates: PromptTemplate[] = [
      {
        id: 'codeGeneration',
        name: 'Code Generation',
        template: 'Generate code based on the following description. Write clean, well-commented, and production-ready code:\n\n{description}\n\nContext:\n- File: {fileName}\n- Language: {language}\n- Selected code: {selectedCode}',
        variables: ['description', 'fileName', 'language', 'selectedCode']
      },
      {
        id: 'codeExplanation',
        name: 'Code Explanation',
        template: 'Explain the following code in detail. Break down what it does, how it works, and any important concepts:\n\n```{language}\n{code}\n```',
        variables: ['language', 'code']
      },
      {
        id: 'documentation',
        name: 'Documentation Generation',
        template: 'Write comprehensive documentation for the following {language} code. Include parameter descriptions, return values, examples, and any important notes:\n\n```{language}\n{code}\n```\n\nGenerate appropriate documentation format ({docFormat}) for this language.',
        variables: ['language', 'code', 'docFormat']
      },
      {
        id: 'problemFinding',
        name: 'Problem Finding',
        template: 'Analyze the following code for potential issues, bugs, performance problems, and code quality concerns. Provide specific recommendations for improvement:\n\n```{language}\n{code}\n```',
        variables: ['language', 'code']
      },
      {
        id: 'unitTests',
        name: 'Unit Test Generation',
        template: 'Generate comprehensive unit tests for the following {language} function/class. Include edge cases, error scenarios, and positive test cases:\n\n```{language}\n{code}\n```\n\nUse appropriate testing framework for {language}.',
        variables: ['language', 'code']
      },
      {
        id: 'refactoring',
        name: 'Refactoring Suggestions',
        template: 'Suggest refactoring improvements for the following code. Focus on readability, maintainability, performance, and best practices:\n\n```{language}\n{code}\n```',
        variables: ['language', 'code']
      },
      {
        id: 'commitMessage',
        name: 'Commit Message Generation',
        template: 'Generate a clear and concise commit message based on the following git diff. Follow conventional commit format:\n\n{diff}',
        variables: ['diff']
      },
      {
        id: 'nameGeneration',
        name: 'Name Suggestions',
        template: 'Suggest better names for the following {type} based on its context and usage:\n\nCurrent name: {currentName}\nCode context:\n```{language}\n{code}\n```\n\nProvide 5 alternative names with brief explanations.',
        variables: ['type', 'currentName', 'language', 'code']
      },
      {
        id: 'languageConversion',
        name: 'Language Conversion',
        template: 'Convert the following {sourceLanguage} code to {targetLanguage}. Maintain the same functionality and add appropriate comments:\n\n```{sourceLanguage}\n{code}\n```',
        variables: ['sourceLanguage', 'targetLanguage', 'code']
      },
      {
        id: 'errorExplanation',
        name: 'Error Explanation',
        template: 'Explain the following error message and provide solutions to fix it:\n\nError: {error}\n\nContext:\n- File: {fileName}\n- Language: {language}\n- Code around error:\n```{language}\n{code}\n```',
        variables: ['error', 'fileName', 'language', 'code']
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  getTemplate(id: string): PromptTemplate | undefined {
    // First check custom templates from settings
    const customTemplate = this.getCustomTemplate(id);
    if (customTemplate) {
      return customTemplate;
    }

    // Fall back to default template
    return this.templates.get(id);
  }

  private getCustomTemplate(id: string): PromptTemplate | undefined {
    const config = vscode.workspace.getConfiguration('aiAssistant.prompts');
    const customPrompt = config.get<string>(id);
    
    if (customPrompt) {
      const defaultTemplate = this.templates.get(id);
      return {
        id,
        name: defaultTemplate?.name || id,
        template: customPrompt,
        variables: defaultTemplate?.variables || []
      };
    }

    return undefined;
  }

  getAllTemplates(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }

  formatPrompt(templateId: string, variables: Record<string, string>): string {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    let formattedPrompt = template.template;
    
    // Replace variables in the template
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{${key}}`;
      formattedPrompt = formattedPrompt.replace(new RegExp(placeholder, 'g'), value || '');
    }

    return formattedPrompt;
  }

  async openPromptLibraryEditor(): Promise<void> {
    const panel = vscode.window.createWebviewPanel(
      'promptLibrary',
      'AI Assistant Prompt Library',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    panel.webview.html = this.getPromptLibraryHTML();
    
    panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'getTemplates':
            panel.webview.postMessage({
              command: 'templatesData',
              templates: this.getAllTemplates()
            });
            break;
          
          case 'updateTemplate':
            await this.updateCustomTemplate(message.templateId, message.template);
            vscode.window.showInformationMessage('Prompt template updated successfully');
            break;
          
          case 'resetTemplate':
            await this.resetTemplate(message.templateId);
            vscode.window.showInformationMessage('Prompt template reset to default');
            break;
        }
      },
      undefined
    );
  }

  private async updateCustomTemplate(templateId: string, template: string): Promise<void> {
    const config = vscode.workspace.getConfiguration('aiAssistant.prompts');
    await config.update(templateId, template, vscode.ConfigurationTarget.Global);
  }

  private async resetTemplate(templateId: string): Promise<void> {
    const config = vscode.workspace.getConfiguration('aiAssistant.prompts');
    await config.update(templateId, undefined, vscode.ConfigurationTarget.Global);
  }

  private getPromptLibraryHTML(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Assistant Prompt Library</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            padding: 20px;
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
        }
        .template-card {
            border: 1px solid var(--vscode-panel-border);
            margin: 10px 0;
            padding: 15px;
            border-radius: 4px;
            background: var(--vscode-editor-background);
        }
        .template-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .template-name {
            font-weight: bold;
            font-size: 16px;
        }
        .template-buttons {
            display: flex;
            gap: 10px;
        }
        button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 6px 12px;
            border-radius: 3px;
            cursor: pointer;
        }
        button:hover {
            background: var(--vscode-button-hoverBackground);
        }
        .secondary-button {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        .secondary-button:hover {
            background: var(--vscode-button-secondaryHoverBackground);
        }
        textarea {
            width: 100%;
            min-height: 150px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            padding: 8px;
            font-family: var(--vscode-editor-font-family);
            font-size: var(--vscode-editor-font-size);
            resize: vertical;
        }
        .variables {
            margin-top: 10px;
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
        }
        .variable-tag {
            background: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            padding: 2px 6px;
            border-radius: 3px;
            margin-right: 5px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <h1>AI Assistant Prompt Library</h1>
    <p>Customize the prompts used by AI Assistant for different features. Use variables like {variable} to insert dynamic content.</p>
    
    <div id="templates-container">
        Loading templates...
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        // Request templates data on load
        vscode.postMessage({ command: 'getTemplates' });
        
        // Listen for messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            
            if (message.command === 'templatesData') {
                renderTemplates(message.templates);
            }
        });
        
        function renderTemplates(templates) {
            const container = document.getElementById('templates-container');
            container.innerHTML = '';
            
            templates.forEach(template => {
                const card = document.createElement('div');
                card.className = 'template-card';
                card.innerHTML = \`
                    <div class="template-header">
                        <div class="template-name">\${template.name}</div>
                        <div class="template-buttons">
                            <button onclick="updateTemplate('\${template.id}', this)">Update</button>
                            <button class="secondary-button" onclick="resetTemplate('\${template.id}')">Reset</button>
                        </div>
                    </div>
                    <textarea id="template-\${template.id}">\${template.template}</textarea>
                    <div class="variables">
                        Variables: \${template.variables.map(v => \`<span class="variable-tag">{\${v}}</span>\`).join('')}
                    </div>
                \`;
                container.appendChild(card);
            });
        }
        
        function updateTemplate(templateId, button) {
            const textarea = document.getElementById(\`template-\${templateId}\`);
            const template = textarea.value;
            
            vscode.postMessage({
                command: 'updateTemplate',
                templateId: templateId,
                template: template
            });
        }
        
        function resetTemplate(templateId) {
            vscode.postMessage({
                command: 'resetTemplate',
                templateId: templateId
            });
            
            // Refresh templates
            vscode.postMessage({ command: 'getTemplates' });
        }
    </script>
</body>
</html>`;
  }
}