import * as vscode from 'vscode';
import { ChatPanel } from './chatPanel';
import { ModelFactory } from '../models';
import { ConfigurationManager, PromptLibrary } from '../config';
import { GitHelper, CodeParser } from '../utils';

export class ChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'aiAssistant.chatView';
  private modelFactory: ModelFactory;
  private configManager: ConfigurationManager;
  private promptLibrary: PromptLibrary;
  private gitHelper: GitHelper;
  private codeParser: CodeParser;

  constructor(private readonly extensionUri: vscode.Uri) {
    this.modelFactory = ModelFactory.getInstance();
    this.configManager = ConfigurationManager.getInstance();
    this.promptLibrary = PromptLibrary.getInstance();
    this.gitHelper = new GitHelper();
    this.codeParser = new CodeParser();
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [
        this.extensionUri
      ]
    };

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'openFullChat':
          // Open the full chat panel
          ChatPanel.createOrShow(this.extensionUri);
          break;
        case 'sendMessage':
          // Handle message sending (implement your chat logic here)
          this.handleMessage(webviewView.webview, data.message);
          break;
      }
    });
  }

  private async handleMessage(webview: vscode.Webview, message: string) {
    // Show typing indicator
    webview.postMessage({
      type: 'showTyping'
    });

    try {
      // Process context references in the message
      const processedMessage = await this.processContextReferences(message);
      
      // Get AI model
      const model = this.modelFactory.createModel();
      if (!model) {
        throw new Error('AI model not configured. Please check your settings.');
      }

      // Generate AI response
      const response = await model.generateResponse([
        {
          role: 'user',
          content: processedMessage
        }
      ]);
      
      webview.postMessage({
        type: 'response',
        message: response.content
      });
    } catch (error: any) {
      console.error('Error handling chat message:', error);
      webview.postMessage({
        type: 'error',
        message: `Failed to get AI response: ${error.message}`
      });
    }
  }

  private async processContextReferences(message: string): Promise<string> {
    let processedMessage = message;

    try {
      // Handle #thisFile reference
      if (message.includes('#thisFile')) {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
          const document = activeEditor.document;
          const fileName = document.fileName;
          const content = document.getText();
          const language = document.languageId;
          
          processedMessage = processedMessage.replace(
            '#thisFile',
            `the current file "${fileName}" (${language}):\n\`\`\`${language}\n${content}\n\`\`\``
          );
        } else {
          processedMessage = processedMessage.replace('#thisFile', 'the current file (no file is currently open)');
        }
      }

      // Handle #localChanges reference  
      if (message.includes('#localChanges')) {
        try {
          const changes = await this.gitHelper.getAllChanges();
          const changesText = changes 
            ? `Current git changes:\n\`\`\`diff\n${changes}\n\`\`\``
            : 'No local changes found';
          processedMessage = processedMessage.replace('#localChanges', changesText);
        } catch (error) {
          processedMessage = processedMessage.replace('#localChanges', 'Unable to get local changes (not a git repository?)');
        }
      }

      // Handle #file:path reference
      const fileRefMatch = message.match(/#file:([^\s]+)/g);
      if (fileRefMatch) {
        for (const fileRef of fileRefMatch) {
          const filePath = fileRef.replace('#file:', '');
          try {
            const fileUri = vscode.Uri.file(filePath);
            const fileContent = await vscode.workspace.fs.readFile(fileUri);
            const content = fileContent.toString();
            const language = this.getLanguageFromPath(filePath);
            
            processedMessage = processedMessage.replace(
              fileRef,
              `the file "${filePath}" (${language}):\n\`\`\`${language}\n${content}\n\`\`\``
            );
          } catch (error) {
            processedMessage = processedMessage.replace(fileRef, `file "${filePath}" (not found or not accessible)`);
          }
        }
      }

      // Handle #symbol:name reference
      const symbolRefMatch = message.match(/#symbol:([^\s]+)/g);
      if (symbolRefMatch) {
        for (const symbolRef of symbolRefMatch) {
          const symbolName = symbolRef.replace('#symbol:', '');
          const activeEditor = vscode.window.activeTextEditor;
          
          if (activeEditor) {
            const document = activeEditor.document;
            const content = document.getText();
            
            // Simple symbol extraction (could be enhanced with actual AST parsing)
            const lines = content.split('\n');
            const symbolLines = lines.filter(line => 
              line.includes(symbolName) && 
              (line.includes('function') || line.includes('class') || line.includes('const') || line.includes('let') || line.includes('var'))
            );
            
            if (symbolLines.length > 0) {
              processedMessage = processedMessage.replace(
                symbolRef,
                `the symbol "${symbolName}":\n\`\`\`${document.languageId}\n${symbolLines.join('\n')}\n\`\`\``
              );
            } else {
              processedMessage = processedMessage.replace(symbolRef, `symbol "${symbolName}" (not found in current file)`);
            }
          } else {
            processedMessage = processedMessage.replace(symbolRef, `symbol "${symbolName}" (no file is currently open)`);
          }
        }
      }

    } catch (error) {
      console.error('Error processing context references:', error);
    }

    return processedMessage;
  }

  private getLanguageFromPath(filePath: string): string {
    const extension = filePath.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'ts': 'typescript',
      'jsx': 'javascript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'scala': 'scala',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'less': 'less',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'sql': 'sql',
      'sh': 'bash',
      'bat': 'batch',
      'ps1': 'powershell'
    };
    return languageMap[extension || ''] || 'text';
  }

  private getHtmlForWebview(webview: vscode.Webview) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Assistant</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            margin: 0;
            padding: 10px;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .header {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }
        
        .logo {
            width: 24px;
            height: 24px;
            margin-right: 10px;
            opacity: 0.8;
        }
        
        .title {
            font-weight: bold;
            color: var(--vscode-foreground);
        }
        
        .chat-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        
        .messages {
            flex: 1;
            overflow-y: auto;
            margin-bottom: 10px;
            padding: 5px;
        }
        
        .message {
            margin-bottom: 15px;
            padding: 8px 12px;
            border-radius: 6px;
            max-width: 100%;
            word-wrap: break-word;
        }
        
        .user-message {
            background-color: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            align-self: flex-end;
        }
        
        .ai-message {
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            border-left: 3px solid var(--vscode-charts-blue);
        }
        
        .input-container {
            display: flex;
            gap: 5px;
            margin-top: auto;
        }
        
        #messageInput {
            flex: 1;
            padding: 8px;
            border: 1px solid var(--vscode-input-border);
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 4px;
            font-family: inherit;
            font-size: inherit;
        }
        
        #messageInput:focus {
            outline: 1px solid var(--vscode-focusBorder);
        }
        
        .send-btn, .expand-btn {
            padding: 8px 12px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-family: inherit;
        }
        
        .send-btn:hover, .expand-btn:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        
        .expand-btn {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        
        .typing {
            font-style: italic;
            opacity: 0.7;
            color: var(--vscode-descriptionForeground);
        }
        
        .quick-actions {
            margin-bottom: 10px;
        }
        
        .quick-action {
            display: inline-block;
            padding: 4px 8px;
            margin: 2px;
            background-color: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            border-radius: 12px;
            font-size: 11px;
            cursor: pointer;
            user-select: none;
        }
        
        .quick-action:hover {
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🤖</div>
        <div class="title">AI Assistant</div>
    </div>
    
    <div class="quick-actions">
        <span class="quick-action" onclick="insertQuickAction('Explain this code')">📝 Explain</span>
        <span class="quick-action" onclick="insertQuickAction('Generate unit tests')">🧪 Tests</span>
        <span class="quick-action" onclick="insertQuickAction('Fix this error')">🔧 Fix</span>
        <span class="quick-action" onclick="insertQuickAction('Add documentation')">📚 Docs</span>
    </div>
    
    <div class="chat-container">
        <div id="messages" class="messages">
            <div class="message ai-message">
                👋 Hi! I'm your AI coding assistant. Ask me anything about your code!
                <br><br>
                <strong>Try these commands:</strong><br>
                • "Explain this function"<br>
                • "Generate unit tests"<br>
                • "Fix this error"<br>
                • "Add documentation"
            </div>
        </div>
        
        <div class="input-container">
            <input type="text" id="messageInput" placeholder="Ask me anything about your code..." />
            <button class="send-btn" onclick="sendMessage()">Send</button>
            <button class="expand-btn" onclick="openFullChat()">Expand</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        function sendMessage() {
            const input = document.getElementById('messageInput');
            const message = input.value.trim();
            
            if (message) {
                addMessage(message, 'user');
                input.value = '';
                
                vscode.postMessage({
                    type: 'sendMessage',
                    message: message
                });
            }
        }
        
        function openFullChat() {
            vscode.postMessage({
                type: 'openFullChat'
            });
        }
        
        function insertQuickAction(text) {
            const input = document.getElementById('messageInput');
            input.value = text;
            input.focus();
        }
        
        function addMessage(message, sender) {
            const messagesDiv = document.getElementById('messages');
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${sender}-message\`;
            messageDiv.textContent = message;
            messagesDiv.appendChild(messageDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
        
        function showTyping() {
            const messagesDiv = document.getElementById('messages');
            const typingDiv = document.createElement('div');
            typingDiv.className = 'message ai-message typing';
            typingDiv.id = 'typing-indicator';
            typingDiv.textContent = '🤖 Thinking...';
            messagesDiv.appendChild(typingDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
        
        function hideTyping() {
            const typingDiv = document.getElementById('typing-indicator');
            if (typingDiv) {
                typingDiv.remove();
            }
        }
        
        // Handle Enter key
        document.getElementById('messageInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.type) {
                case 'showTyping':
                    showTyping();
                    break;
                    
                case 'response':
                    hideTyping();
                    addMessage(message.message, 'ai');
                    break;
                    
                case 'error':
                    hideTyping();
                    addMessage('❌ ' + message.message, 'ai');
                    break;
            }
        });
    </script>
</body>
</html>`;
  }
}