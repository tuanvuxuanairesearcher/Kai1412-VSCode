import * as vscode from 'vscode';
import { ModelFactory } from '../models';
import { PromptLibrary } from '../config';
import { CodeParser } from '../utils';

export class EditorAssistanceProvider {
  private modelFactory: ModelFactory;
  private promptLibrary: PromptLibrary;

  constructor() {
    this.modelFactory = ModelFactory.getInstance();
    this.promptLibrary = PromptLibrary.getInstance();
  }

  async generateCode(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor found');
      return;
    }

    const selection = editor.selection;
    const document = editor.document;
    const context = CodeParser.extractContextFromDocument(document, selection);

    // Get user description
    const description = await vscode.window.showInputBox({
      prompt: 'Describe the code you want to generate',
      placeHolder: 'e.g., Create a function to validate email addresses',
      ignoreFocusOut: true
    });

    if (!description) {
      return;
    }

    try {
      const model = this.modelFactory.getCurrentModel();
      if (!model) {
        throw new Error('No AI model configured');
      }

      // Show progress
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Generating code...',
        cancellable: false
      }, async () => {
        const prompt = this.promptLibrary.formatPrompt('codeGeneration', {
          description,
          fileName: context.fileName,
          language: context.language,
          selectedCode: context.selectedCode || ''
        });

        const generatedCode = await model.generateCompletion(prompt, context);
        
        // Show diff view for review
        await this.showDiffView(editor, selection, generatedCode, 'Generated Code');
      });

    } catch (error: any) {
      vscode.window.showErrorMessage(`Failed to generate code: ${error.message}`);
    }
  }

  async explainCode(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor found');
      return;
    }

    const selection = editor.selection;
    if (selection.isEmpty) {
      vscode.window.showErrorMessage('Please select some code to explain');
      return;
    }

    const document = editor.document;
    const selectedCode = document.getText(selection);
    const context = CodeParser.extractContextFromDocument(document, selection);

    try {
      const model = this.modelFactory.getCurrentModel();
      if (!model) {
        throw new Error('No AI model configured');
      }

      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Explaining code...',
        cancellable: false
      }, async () => {
        let prompt: string;

        // Special handling for different code types
        if (CodeParser.isRegexPattern(selectedCode)) {
          prompt = `Explain this regular expression in detail:\n\n${selectedCode}\n\nBreak down each part and provide examples of what it matches.`;
        } else if (CodeParser.isSQLQuery(selectedCode)) {
          prompt = `Explain this SQL query in detail:\n\n${selectedCode}\n\nBreak down each clause and explain what the query does.`;
        } else if (CodeParser.isCronExpression(selectedCode)) {
          prompt = `Explain this cron expression:\n\n${selectedCode}\n\nDescribe when this job will run.`;
        } else {
          prompt = this.promptLibrary.formatPrompt('codeExplanation', {
            language: context.language,
            code: selectedCode
          });
        }

        const explanation = await model.generateCompletion(prompt, context);
        
        // Show explanation in a new document
        await this.showExplanationDocument(explanation, context.language);
      });

    } catch (error: any) {
      vscode.window.showErrorMessage(`Failed to explain code: ${error.message}`);
    }
  }

  async writeDocumentation(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor found');
      return;
    }

    const selection = editor.selection;
    if (selection.isEmpty) {
      vscode.window.showErrorMessage('Please select a function or class to document');
      return;
    }

    const document = editor.document;
    const selectedCode = document.getText(selection);
    const context = CodeParser.extractContextFromDocument(document, selection);

    try {
      const model = this.modelFactory.getCurrentModel();
      if (!model) {
        throw new Error('No AI model configured');
      }

      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Writing documentation...',
        cancellable: false
      }, async () => {
        const docFormat = CodeParser.getDocumentationFormat(context.language);
        const prompt = this.promptLibrary.formatPrompt('documentation', {
          language: context.language,
          code: selectedCode,
          docFormat
        });

        const documentation = await model.generateCompletion(prompt, context);
        
        // Insert documentation above the selected code
        const startLine = selection.start.line;
        const insertPosition = new vscode.Position(startLine, 0);
        
        await editor.edit(editBuilder => {
          editBuilder.insert(insertPosition, documentation + '\n');
        });
      });

    } catch (error: any) {
      vscode.window.showErrorMessage(`Failed to write documentation: ${error.message}`);
    }
  }

  async findProblems(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor found');
      return;
    }

    const selection = editor.selection;
    if (selection.isEmpty) {
      vscode.window.showErrorMessage('Please select some code to analyze');
      return;
    }

    const document = editor.document;
    const selectedCode = document.getText(selection);
    const context = CodeParser.extractContextFromDocument(document, selection);

    try {
      const model = this.modelFactory.getCurrentModel();
      if (!model) {
        throw new Error('No AI model configured');
      }

      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Analyzing code for problems...',
        cancellable: false
      }, async () => {
        const prompt = this.promptLibrary.formatPrompt('problemFinding', {
          language: context.language,
          code: selectedCode
        });

        const analysis = await model.generateCompletion(prompt, context);
        
        // Show analysis in a new document
        await this.showAnalysisDocument(analysis, 'Code Analysis');
      });

    } catch (error: any) {
      vscode.window.showErrorMessage(`Failed to analyze code: ${error.message}`);
    }
  }

  async generateUnitTests(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor found');
      return;
    }

    const document = editor.document;
    const selection = editor.selection;
    let codeToTest: string;
    
    if (selection.isEmpty) {
      // Try to find function at cursor position
      const functionCode = CodeParser.getFunctionAtPosition(document, selection.active);
      if (!functionCode) {
        vscode.window.showErrorMessage('Please place cursor in a function or select code to test');
        return;
      }
      codeToTest = functionCode;
    } else {
      codeToTest = document.getText(selection);
    }

    const context = CodeParser.extractContextFromDocument(document, selection);

    try {
      const model = this.modelFactory.getCurrentModel();
      if (!model) {
        throw new Error('No AI model configured');
      }

      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Generating unit tests...',
        cancellable: false
      }, async () => {
        const testFramework = CodeParser.getTestFramework(context.language);
        const prompt = this.promptLibrary.formatPrompt('unitTests', {
          language: context.language,
          code: codeToTest
        }) + `\n\nUse ${testFramework} for the tests.`;

        const tests = await model.generateCompletion(prompt, context);
        
        // Create new test file
        await this.createTestFile(context.fileName, tests, context.language);
      });

    } catch (error: any) {
      vscode.window.showErrorMessage(`Failed to generate unit tests: ${error.message}`);
    }
  }

  async convertToLanguage(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor found');
      return;
    }

    const document = editor.document;
    const context = CodeParser.extractContextFromDocument(document);

    // Get target language
    const languages = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'Go', 
      'Rust', 'Kotlin', 'Swift', 'PHP', 'Ruby'
    ];

    const targetLanguage = await vscode.window.showQuickPick(languages, {
      placeHolder: 'Select target language'
    });

    if (!targetLanguage) {
      return;
    }

    try {
      const model = this.modelFactory.getCurrentModel();
      if (!model) {
        throw new Error('No AI model configured');
      }

      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Converting to ${targetLanguage}...`,
        cancellable: false
      }, async () => {
        const prompt = this.promptLibrary.formatPrompt('languageConversion', {
          sourceLanguage: context.language,
          targetLanguage: targetLanguage.toLowerCase(),
          code: context.entireFile || ''
        });

        const convertedCode = await model.generateCompletion(prompt, context);
        
        // Create new file with converted code
        await this.createConvertedFile(context.fileName, convertedCode, targetLanguage.toLowerCase());
      });

    } catch (error: any) {
      vscode.window.showErrorMessage(`Failed to convert code: ${error.message}`);
    }
  }

  async suggestRefactoring(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor found');
      return;
    }

    const selection = editor.selection;
    if (selection.isEmpty) {
      vscode.window.showErrorMessage('Please select some code to refactor');
      return;
    }

    const document = editor.document;
    const selectedCode = document.getText(selection);
    const context = CodeParser.extractContextFromDocument(document, selection);

    try {
      const model = this.modelFactory.getCurrentModel();
      if (!model) {
        throw new Error('No AI model configured');
      }

      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Suggesting refactoring...',
        cancellable: false
      }, async () => {
        const prompt = this.promptLibrary.formatPrompt('refactoring', {
          language: context.language,
          code: selectedCode
        });

        const refactoredCode = await model.generateCompletion(prompt, context);
        
        // Show diff view for review
        await this.showDiffView(editor, selection, refactoredCode, 'Refactored Code');
      });

    } catch (error: any) {
      vscode.window.showErrorMessage(`Failed to suggest refactoring: ${error.message}`);
    }
  }

  async suggestNames(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor found');
      return;
    }

    const selection = editor.selection;
    const document = editor.document;
    const wordRange = document.getWordRangeAtPosition(selection.active);
    
    if (!wordRange) {
      vscode.window.showErrorMessage('Please place cursor on a variable, function, or class name');
      return;
    }

    const currentName = document.getText(wordRange);
    const context = CodeParser.extractContextFromDocument(document, selection);

    try {
      const model = this.modelFactory.getCurrentModel();
      if (!model) {
        throw new Error('No AI model configured');
      }

      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Suggesting better names...',
        cancellable: false
      }, async () => {
        // Get surrounding code for context
        const lineStart = Math.max(0, selection.active.line - 5);
        const lineEnd = Math.min(document.lineCount - 1, selection.active.line + 5);
        const contextRange = new vscode.Range(lineStart, 0, lineEnd, 0);
        const contextCode = document.getText(contextRange);

        const prompt = this.promptLibrary.formatPrompt('nameGeneration', {
          type: 'identifier',
          currentName,
          language: context.language,
          code: contextCode
        });

        const suggestions = await model.generateCompletion(prompt, context);
        
        // Show suggestions in a new document
        await this.showSuggestionsDocument(suggestions, `Name Suggestions for "${currentName}"`);
      });

    } catch (error: any) {
      vscode.window.showErrorMessage(`Failed to suggest names: ${error.message}`);
    }
  }

  private async showDiffView(editor: vscode.TextEditor, selection: vscode.Selection, newContent: string, title: string): Promise<void> {
    const originalContent = editor.document.getText(selection);
    
    // Create temporary documents for diff
    const originalDoc = await vscode.workspace.openTextDocument({
      content: originalContent,
      language: editor.document.languageId
    });

    const newDoc = await vscode.workspace.openTextDocument({
      content: newContent,
      language: editor.document.languageId
    });

    // Show diff
    await vscode.commands.executeCommand('vscode.diff', 
      originalDoc.uri, 
      newDoc.uri, 
      `${title} - Original ↔ Suggested`
    );
  }

  private async showExplanationDocument(content: string, language: string): Promise<void> {
    const doc = await vscode.workspace.openTextDocument({
      content,
      language: 'markdown'
    });

    await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
  }

  private async showAnalysisDocument(content: string, title: string): Promise<void> {
    const doc = await vscode.workspace.openTextDocument({
      content: `# ${title}\n\n${content}`,
      language: 'markdown'
    });

    await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
  }

  private async showSuggestionsDocument(content: string, title: string): Promise<void> {
    const doc = await vscode.workspace.openTextDocument({
      content: `# ${title}\n\n${content}`,
      language: 'markdown'
    });

    await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
  }

  private async createTestFile(originalFileName: string, testContent: string, language: string): Promise<void> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      // Create in memory document if no workspace
      const doc = await vscode.workspace.openTextDocument({
        content: testContent,
        language
      });
      await vscode.window.showTextDocument(doc);
      return;
    }

    // Generate test file name
    const baseName = originalFileName.replace(/\.[^/.]+$/, '');
    const extension = language === 'typescript' ? '.test.ts' : 
                      language === 'javascript' ? '.test.js' : 
                      language === 'python' ? '_test.py' : 
                      `.test.${language}`;
    
    const testFileName = `${baseName}${extension}`;
    const testUri = vscode.Uri.joinPath(workspaceFolder.uri, testFileName);

    // Create test file
    const edit = new vscode.WorkspaceEdit();
    edit.createFile(testUri, { ignoreIfExists: true });
    edit.insert(testUri, new vscode.Position(0, 0), testContent);
    
    await vscode.workspace.applyEdit(edit);
    
    // Open the test file
    const doc = await vscode.workspace.openTextDocument(testUri);
    await vscode.window.showTextDocument(doc);
  }

  private async createConvertedFile(originalFileName: string, convertedContent: string, targetLanguage: string): Promise<void> {
    const extensions: { [key: string]: string } = {
      'javascript': '.js',
      'typescript': '.ts',
      'python': '.py',
      'java': '.java',
      'csharp': '.cs',
      'cpp': '.cpp',
      'go': '.go',
      'rust': '.rs',
      'kotlin': '.kt',
      'swift': '.swift',
      'php': '.php',
      'ruby': '.rb'
    };

    const extension = extensions[targetLanguage] || `.${targetLanguage}`;
    const baseName = originalFileName.replace(/\.[^/.]+$/, '');
    const newFileName = `${baseName}${extension}`;

    const doc = await vscode.workspace.openTextDocument({
      content: convertedContent,
      language: targetLanguage
    });

    await vscode.window.showTextDocument(doc);
    
    // Suggest saving the file
    const action = await vscode.window.showInformationMessage(
      `Code converted to ${targetLanguage}. Save as ${newFileName}?`,
      'Save',
      'Keep in Memory'
    );

    if (action === 'Save') {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (workspaceFolder) {
        const newUri = vscode.Uri.joinPath(workspaceFolder.uri, newFileName);
        await vscode.workspace.fs.writeFile(newUri, Buffer.from(convertedContent, 'utf8'));
        
        // Open the saved file
        const savedDoc = await vscode.workspace.openTextDocument(newUri);
        await vscode.window.showTextDocument(savedDoc);
      }
    }
  }
}