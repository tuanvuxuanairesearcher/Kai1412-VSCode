import * as vscode from 'vscode';
import * as path from 'path';

export class CodeParser {
  static getLanguageFromFileName(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    const languageMap: { [key: string]: string } = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.java': 'java',
      '.c': 'c',
      '.cpp': 'cpp',
      '.cxx': 'cpp',
      '.cc': 'cpp',
      '.cs': 'csharp',
      '.php': 'php',
      '.rb': 'ruby',
      '.go': 'go',
      '.rs': 'rust',
      '.kt': 'kotlin',
      '.swift': 'swift',
      '.html': 'html',
      '.css': 'css',
      '.scss': 'scss',
      '.sass': 'sass',
      '.json': 'json',
      '.xml': 'xml',
      '.yaml': 'yaml',
      '.yml': 'yaml',
      '.md': 'markdown',
      '.sql': 'sql',
      '.sh': 'bash',
      '.ps1': 'powershell'
    };

    return languageMap[ext] || 'text';
  }

  static getDocumentationFormat(language: string): string {
    const formatMap: { [key: string]: string } = {
      'javascript': 'JSDoc',
      'typescript': 'JSDoc',
      'python': 'docstring',
      'java': 'Javadoc',
      'csharp': 'XML documentation comments',
      'php': 'PHPDoc',
      'ruby': 'RDoc',
      'go': 'Go doc comments',
      'rust': 'Rust doc comments',
      'kotlin': 'KDoc',
      'swift': 'Swift documentation comments'
    };

    return formatMap[language] || 'standard comments';
  }

  static extractContextFromDocument(document: vscode.TextDocument, selection?: vscode.Selection): {
    selectedCode?: string;
    cursorPosition?: { line: number; character: number };
    entireFile?: string;
    fileName: string;
    language: string;
  } {
    const context = {
      fileName: path.basename(document.fileName),
      language: this.getLanguageFromFileName(document.fileName),
      entireFile: document.getText()
    };

    if (selection) {
      if (!selection.isEmpty) {
        return {
          ...context,
          selectedCode: document.getText(selection)
        };
      } else {
        return {
          ...context,
          cursorPosition: {
            line: selection.active.line,
            character: selection.active.character
          }
        };
      }
    }

    return context;
  }

  static getFunctionAtPosition(document: vscode.TextDocument, position: vscode.Position): string | null {
    const line = document.lineAt(position);
    const lineText = line.text.trim();

    // Simple patterns for different languages
    const functionPatterns = [
      /^(function\s+\w+|const\s+\w+\s*=.*=>|class\s+\w+)/,  // JavaScript/TypeScript
      /^(def\s+\w+|class\s+\w+)/,                            // Python
      /^(public|private|protected)?\s*(static\s+)?\w+\s+\w+\s*\(/,  // Java/C#
      /^(fn\s+\w+|impl\s+\w+)/,                             // Rust
      /^(func\s+\w+|type\s+\w+)/                            // Go
    ];

    for (const pattern of functionPatterns) {
      if (pattern.test(lineText)) {
        return lineText;
      }
    }

    // Look for function signatures in nearby lines
    for (let i = Math.max(0, position.line - 5); i <= Math.min(document.lineCount - 1, position.line + 5); i++) {
      const nearbyLine = document.lineAt(i).text.trim();
      for (const pattern of functionPatterns) {
        if (pattern.test(nearbyLine)) {
          return nearbyLine;
        }
      }
    }

    return null;
  }

  static isRegexPattern(text: string): boolean {
    // Simple heuristic to detect regex patterns
    return /^\/.*\/[gimuy]*$/.test(text.trim()) || 
           /^\^.*\$$/.test(text.trim()) ||
           text.includes('\\d') || text.includes('\\w') || text.includes('\\s');
  }

  static isSQLQuery(text: string): boolean {
    const sqlKeywords = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'WITH'];
    const upperText = text.toUpperCase().trim();
    return sqlKeywords.some(keyword => upperText.startsWith(keyword));
  }

  static isCronExpression(text: string): boolean {
    // Basic cron expression pattern (5 or 6 fields)
    const cronPattern = /^[\s\d\*\/\-\,\?]+$/;
    const fields = text.trim().split(/\s+/);
    return (fields.length === 5 || fields.length === 6) && cronPattern.test(text);
  }

  static getTestFramework(language: string): string {
    const frameworkMap: { [key: string]: string } = {
      'javascript': 'Jest',
      'typescript': 'Jest',
      'python': 'pytest',
      'java': 'JUnit',
      'csharp': 'NUnit',
      'php': 'PHPUnit',
      'ruby': 'RSpec',
      'go': 'testing package',
      'rust': 'built-in test framework',
      'kotlin': 'JUnit',
      'swift': 'XCTest'
    };

    return frameworkMap[language] || 'appropriate testing framework';
  }
}