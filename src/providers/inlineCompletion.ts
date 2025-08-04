import * as vscode from 'vscode';
import { ModelFactory } from '../models';
import { ConfigurationManager } from '../config';
import { CodeParser } from '../utils';

export class InlineCompletionProvider implements vscode.InlineCompletionItemProvider {
  private modelFactory: ModelFactory;
  private configManager: ConfigurationManager;
  private lastTriggerTime: number = 0;
  private readonly DEBOUNCE_MS = 500; // Wait 500ms after user stops typing

  constructor() {
    this.modelFactory = ModelFactory.getInstance();
    this.configManager = ConfigurationManager.getInstance();
  }

  async provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.InlineCompletionContext,
    token: vscode.CancellationToken
  ): Promise<vscode.InlineCompletionItem[] | vscode.InlineCompletionList | null> {
    
    // Check if inline completion is enabled
    if (!this.configManager.isInlineCompletionEnabled()) {
      return null;
    }

    // Debounce requests to avoid too many API calls
    const now = Date.now();
    if (now - this.lastTriggerTime < this.DEBOUNCE_MS) {
      return null;
    }
    this.lastTriggerTime = now;

    // Don't provide completions in comments or strings
    if (this.isInCommentOrString(document, position)) {
      return null;
    }

    // Get current line and prefix
    const line = document.lineAt(position);
    const linePrefix = line.text.substring(0, position.character);
    const lineSuffix = line.text.substring(position.character);

    // Don't complete if line is too short or empty
    if (linePrefix.trim().length < 2) {
      return null;
    }

    // Don't complete if user is just navigating (no trigger character)
    if (context.triggerKind === vscode.InlineCompletionTriggerKind.Automatic && 
        !this.shouldTriggerCompletion(linePrefix)) {
      return null;
    }

    try {
      const model = this.modelFactory.getCurrentModel();
      if (!model) {
        return null;
      }

      // Check if model is configured
      const validation = this.modelFactory.validateCurrentModel();
      if (!validation.isValid) {
        return null;
      }

      // Get context around the cursor
      const contextLines = this.getContextLines(document, position);
      const codeContext = CodeParser.extractContextFromDocument(document);

      // Create completion prompt
      const prompt = this.createCompletionPrompt(contextLines, linePrefix, lineSuffix, codeContext.language);

      // Generate completion
      const completion = await model.generateCompletion(prompt, codeContext);

      if (!completion || completion.trim().length === 0) {
        return null;
      }

      // Clean up the completion
      const cleanedCompletion = this.cleanCompletion(completion, linePrefix, lineSuffix);

      if (!cleanedCompletion) {
        return null;
      }

      return [{
        insertText: cleanedCompletion,
        range: new vscode.Range(position, position),
        filterText: linePrefix,
      }];

    } catch (error) {
      // Silently fail for inline completions to avoid interrupting user workflow
      console.error('Inline completion error:', error);
      return null;
    }
  }

  private shouldTriggerCompletion(linePrefix: string): boolean {
    // Trigger on common programming patterns
    const triggerPatterns = [
      /\.\w*$/, // After dot (method/property access)
      /\w+\($/, // After opening parenthesis
      /\w+\s*=$/, // After assignment
      /if\s*\($/, // After if statement
      /for\s*\($/, // After for loop
      /while\s*\($/, // After while loop
      /function\s+\w*\($/, // After function declaration
      /const\s+\w+\s*=$/, // After const declaration
      /let\s+\w+\s*=$/, // After let declaration
      /var\s+\w+\s*=$/, // After var declaration
      /=>\s*$/, // After arrow function
      /{\s*$/, // After opening brace
      /,\s*$/, // After comma
    ];

    return triggerPatterns.some(pattern => pattern.test(linePrefix));
  }

  private isInCommentOrString(document: vscode.TextDocument, position: vscode.Position): boolean {
    const line = document.lineAt(position);
    const lineText = line.text;
    const charIndex = position.character;

    // Simple heuristic to detect comments and strings
    // This could be improved with proper language parsing
    
    // Check for line comments
    const lineCommentIndex = lineText.indexOf('//');
    if (lineCommentIndex >= 0 && lineCommentIndex < charIndex) {
      return true;
    }

    // Check for hash comments (Python, etc.)
    const hashCommentIndex = lineText.indexOf('#');
    if (hashCommentIndex >= 0 && hashCommentIndex < charIndex) {
      return true;
    }

    // Check for strings (simple check)
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < charIndex; i++) {
      const char = lineText[i];
      if ((char === '"' || char === "'" || char === '`') && !inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar && inString) {
        // Check if escaped
        if (i === 0 || lineText[i - 1] !== '\\') {
          inString = false;
          stringChar = '';
        }
      }
    }

    return inString;
  }

  private getContextLines(document: vscode.TextDocument, position: vscode.Position): string {
    // Get a few lines before and after for context
    const startLine = Math.max(0, position.line - 10);
    const endLine = Math.min(document.lineCount - 1, position.line + 2);
    
    let context = '';
    for (let i = startLine; i <= endLine; i++) {
      const line = document.lineAt(i);
      if (i === position.line) {
        // Mark current line
        context += `${line.text.substring(0, position.character)}[CURSOR]${line.text.substring(position.character)}\n`;
      } else {
        context += line.text + '\n';
      }
    }
    
    return context;
  }

  private createCompletionPrompt(context: string, linePrefix: string, lineSuffix: string, language: string): string {
    return `You are a code completion AI. Complete the code at the [CURSOR] position.

Language: ${language}

Context:
\`\`\`${language}
${context}
\`\`\`

Rules:
1. Only provide the completion text that should be inserted at the cursor
2. Do not repeat the existing line prefix
3. Keep completions concise and relevant
4. Follow the coding style and patterns in the context
5. Do not include explanations or comments unless they're part of the code
6. If the line after the cursor (${lineSuffix}) already contains relevant code, make sure your completion flows naturally

Complete the code:`;
  }

  private cleanCompletion(completion: string, linePrefix: string, lineSuffix: string): string {
    let cleaned = completion.trim();

    // Remove code block markers if present
    cleaned = cleaned.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '');

    // Remove any repetition of the line prefix
    if (cleaned.startsWith(linePrefix.trim())) {
      cleaned = cleaned.substring(linePrefix.trim().length);
    }

    // Take only the first line for inline completions (multi-line completions are complex)
    const firstLine = cleaned.split('\n')[0];
    cleaned = firstLine.trim();

    // Don't provide empty completions
    if (cleaned.length === 0) {
      return '';
    }

    // Don't provide completions that are too long (likely hallucinations)
    if (cleaned.length > 200) {
      return '';
    }

    // Don't provide completions that duplicate the suffix
    if (lineSuffix.trim().length > 0 && cleaned.includes(lineSuffix.trim())) {
      return '';
    }

    // Make sure completion starts with appropriate character if needed
    if (linePrefix.endsWith('.') && !cleaned.match(/^\w/)) {
      return '';
    }

    return cleaned;
  }
}