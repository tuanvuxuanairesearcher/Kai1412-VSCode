import * as vscode from 'vscode';
import { ModelFactory } from '../models';
import { PromptLibrary } from '../config';
import { CodeParser } from '../utils';

export class CommandsProvider {
  private modelFactory: ModelFactory;
  private promptLibrary: PromptLibrary;

  constructor() {
    this.modelFactory = ModelFactory.getInstance();
    this.promptLibrary = PromptLibrary.getInstance();
  }

  async explainError(): Promise<void> {
    // Get error text from selection or input
    let errorText: string | undefined;
    
    const editor = vscode.window.activeTextEditor;
    if (editor && !editor.selection.isEmpty) {
      errorText = editor.document.getText(editor.selection);
    }

    if (!errorText) {
      errorText = await vscode.window.showInputBox({
        prompt: 'Enter the error message you want explained',
        placeHolder: 'e.g., TypeError: Cannot read property \'length\' of undefined',
        ignoreFocusOut: true
      });
    }

    if (!errorText) {
      return;
    }

    try {
      const model = this.modelFactory.getCurrentModel();
      if (!model) {
        throw new Error('No AI model configured');
      }

      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Explaining error...',
        cancellable: false
      }, async () => {
        let context = '';
        let fileName = '';
        let language = '';

        // Get additional context if we have an active editor
        if (editor) {
          const documentContext = CodeParser.extractContextFromDocument(editor.document, editor.selection);
          fileName = documentContext.fileName;
          language = documentContext.language;
          
          // Get code around the error location
          if (!editor.selection.isEmpty) {
            const startLine = Math.max(0, editor.selection.start.line - 5);
            const endLine = Math.min(editor.document.lineCount - 1, editor.selection.end.line + 5);
            const contextRange = new vscode.Range(startLine, 0, endLine, 0);
            context = editor.document.getText(contextRange);
          }
        }

        const prompt = this.promptLibrary.formatPrompt('errorExplanation', {
          error: errorText,
          fileName: fileName || 'unknown',
          language: language || 'unknown',
          code: context || 'No additional context available'
        });

        const explanation = await model.generateCompletion(prompt);

        // Show explanation in a new document
        await this.showErrorExplanation(explanation, errorText);
      });

    } catch (error: any) {
      vscode.window.showErrorMessage(`Failed to explain error: ${error.message}`);
    }
  }

  private async showErrorExplanation(explanation: string, originalError: string): Promise<void> {
    const content = `# Error Explanation\n\n## Original Error\n\`\`\`\n${originalError}\n\`\`\`\n\n## Explanation\n\n${explanation}`;
    
    const doc = await vscode.workspace.openTextDocument({
      content,
      language: 'markdown'
    });

    await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
  }
}