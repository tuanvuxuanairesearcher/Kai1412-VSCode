import * as vscode from 'vscode';
import { ModelFactory } from '../models/factory';
import { AIMessage } from '../models/types';
import { GitHelper, CodeParser } from '../utils';
import * as path from 'path';

export class ChatPanel {
  public static currentPanel: ChatPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];
  private _chatHistory: AIMessage[] = [];
  private _modelFactory: ModelFactory;
  private _gitHelper: GitHelper;

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.ViewColumn.Beside
      : undefined;

    // If we already have a panel, show it.
    if (ChatPanel.currentPanel) {
      ChatPanel.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      'aiAssistantChat',
      'AI Assistant Chat',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, 'media'),
          vscode.Uri.joinPath(extensionUri, 'out', 'compiled')
        ]
      }
    );

    ChatPanel.currentPanel = new ChatPanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._modelFactory = ModelFactory.getInstance();
    this._gitHelper = new GitHelper();

    // Set the webview's initial html content
    this._update();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programmatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        await this._handleWebviewMessage(message);
      },
      null,
      this._disposables
    );
  }

  private async _handleWebviewMessage(message: any) {
    switch (message.command) {
      case 'sendMessage':
        await this._handleUserMessage(message.text);
        break;
      
      case 'clearChat':
        this._chatHistory = [];
        this._panel.webview.postMessage({ command: 'chatCleared' });
        break;
      
      case 'exportChat':
        await this._exportChatHistory();
        break;
      
      case 'getInitialData':
        this._panel.webview.postMessage({
          command: 'initialData',
          chatHistory: this._chatHistory
        });
        break;
    }
  }

  private async _handleUserMessage(text: string) {
    const userMessage: AIMessage = {
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    this._chatHistory.push(userMessage);
    
    // Send user message to webview
    this._panel.webview.postMessage({
      command: 'messageAdded',
      message: userMessage
    });

    try {
      // Process special commands and context references
      const processedContent = await this._processMessageContent(text);
      
      if (processedContent !== text) {
        userMessage.content = processedContent;
      }

      // Get AI model and generate response
      const model = this._modelFactory.getCurrentModel();
      if (!model) {
        throw new Error('No AI model configured');
      }

      // Show typing indicator
      this._panel.webview.postMessage({ command: 'showTyping' });

      // Create context for the conversation
      const messages = this._chatHistory.slice(-10); // Keep last 10 messages for context
      
      // Generate streaming response
      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: '',
        timestamp: Date.now()
      };

      this._chatHistory.push(assistantMessage);

      for await (const chunk of model.generateStreamingResponse(messages)) {
        if (chunk.content) {
          assistantMessage.content += chunk.content;
          this._panel.webview.postMessage({
            command: 'messageChunk',
            messageIndex: this._chatHistory.length - 1,
            chunk: chunk.content
          });
        }
        
        if (chunk.done) {
          break;
        }
      }

      // Hide typing indicator
      this._panel.webview.postMessage({ command: 'hideTyping' });

    } catch (error: any) {
      this._panel.webview.postMessage({ command: 'hideTyping' });
      
      const errorMessage: AIMessage = {
        role: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: Date.now()
      };
      
      this._chatHistory.push(errorMessage);
      this._panel.webview.postMessage({
        command: 'messageAdded',
        message: errorMessage
      });
    }
  }

  private async _processMessageContent(content: string): Promise<string> {
    let processedContent = content;

    // Handle #thisFile reference
    if (content.includes('#thisFile')) {
      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor) {
        const context = CodeParser.extractContextFromDocument(activeEditor.document);
        const fileInfo = `File: ${context.fileName} (${context.language})\n\`\`\`${context.language}\n${context.entireFile}\n\`\`\``;
        processedContent = processedContent.replace('#thisFile', fileInfo);
      } else {
        processedContent = processedContent.replace('#thisFile', '(No active file)');
      }
    }

    // Handle #localChanges reference
    if (content.includes('#localChanges')) {
      try {
        if (await this._gitHelper.isGitRepository()) {
          const changes = await this._gitHelper.getAllChanges();
          processedContent = processedContent.replace('#localChanges', `Git changes:\n\`\`\`diff\n${changes}\n\`\`\``);
        } else {
          processedContent = processedContent.replace('#localChanges', '(Not a git repository)');
        }
      } catch (error) {
        processedContent = processedContent.replace('#localChanges', `(Error getting git changes: ${error})`);
      }
    }

    // Handle #file:path references
    const fileReferencePattern = /#file:([^\s]+)/g;
    let match;
    while ((match = fileReferencePattern.exec(content)) !== null) {
      const filePath = match[1];
      try {
        const fullPath = path.isAbsolute(filePath) 
          ? filePath 
          : path.join(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '', filePath);
        
        const document = await vscode.workspace.openTextDocument(fullPath);
        const context = CodeParser.extractContextFromDocument(document);
        const fileInfo = `File: ${context.fileName} (${context.language})\n\`\`\`${context.language}\n${context.entireFile}\n\`\`\``;
        processedContent = processedContent.replace(match[0], fileInfo);
      } catch (error) {
        processedContent = processedContent.replace(match[0], `(Error reading file: ${filePath})`);
      }
    }

    // Handle #symbol:name references
    const symbolReferencePattern = /#symbol:([^\s]+)/g;
    while ((match = symbolReferencePattern.exec(content)) !== null) {
      const symbolName = match[1];
      try {
        // Find symbol in workspace
        const symbols = await vscode.commands.executeCommand<vscode.SymbolInformation[]>(
          'vscode.executeWorkspaceSymbolProvider',
          symbolName
        );
        
        if (symbols && symbols.length > 0) {
          const symbol = symbols[0];
          const document = await vscode.workspace.openTextDocument(symbol.location.uri);
          const range = symbol.location.range;
          const symbolCode = document.getText(range);
          const context = CodeParser.extractContextFromDocument(document);
          
          const symbolInfo = `Symbol: ${symbolName} in ${context.fileName}\n\`\`\`${context.language}\n${symbolCode}\n\`\`\``;
          processedContent = processedContent.replace(match[0], symbolInfo);
        } else {
          processedContent = processedContent.replace(match[0], `(Symbol not found: ${symbolName})`);
        }
      } catch (error) {
        processedContent = processedContent.replace(match[0], `(Error finding symbol: ${symbolName})`);
      }
    }

    return processedContent;
  }

  private async _exportChatHistory() {
    if (this._chatHistory.length === 0) {
      vscode.window.showInformationMessage('No chat history to export');
      return;
    }

    const content = this._chatHistory.map(msg => {
      const timestamp = new Date(msg.timestamp || Date.now()).toLocaleString();
      return `[${timestamp}] ${msg.role.toUpperCase()}: ${msg.content}`;
    }).join('\n\n');

    const document = await vscode.workspace.openTextDocument({
      content,
      language: 'markdown'
    });

    await vscode.window.showTextDocument(document);
  }

  public dispose() {
    ChatPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _update() {
    const webview = this._panel.webview;
    this._panel.webview.html = this._getHtmlForWebview(webview);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Assistant Chat</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            margin: 0;
            padding: 0;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .chat-header {
            padding: 10px 20px;
            border-bottom: 1px solid var(--vscode-panel-border);
            background-color: var(--vscode-editor-background);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .chat-title {
            font-weight: bold;
            margin: 0;
        }
        
        .chat-actions {
            display: flex;
            gap: 10px;
        }
        
        .action-button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 4px 8px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
        }
        
        .action-button:hover {
            background: var(--vscode-button-hoverBackground);
        }
        
        .chat-container {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
        }
        
        .message {
            margin-bottom: 20px;
            padding: 12px 16px;
            border-radius: 8px;
            line-height: 1.5;
        }
        
        .message.user {
            background-color: var(--vscode-inputOption-activeBackground);
            border-left: 3px solid var(--vscode-inputOption-activeBorder);
            margin-left: 40px;
        }
        
        .message.assistant {
            background-color: var(--vscode-textBlockQuote-background);
            border-left: 3px solid var(--vscode-textBlockQuote-border);
            margin-right: 40px;
        }
        
        .message-role {
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
            font-size: 11px;
            opacity: 0.7;
        }
        
        .message-content {
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        
        .message-content code {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 2px 4px;
            border-radius: 3px;
            font-family: var(--vscode-editor-font-family);
        }
        
        .message-content pre {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
            font-family: var(--vscode-editor-font-family);
        }
        
        .message-timestamp {
            font-size: 10px;
            opacity: 0.5;
            margin-top: 5px;
        }
        
        .input-container {
            padding: 20px;
            border-top: 1px solid var(--vscode-panel-border);
            background-color: var(--vscode-editor-background);
        }
        
        .input-row {
            display: flex;
            gap: 10px;
            align-items: flex-end;
        }
        
        .message-input {
            flex: 1;
            min-height: 38px;
            max-height: 120px;
            padding: 8px 12px;
            border: 1px solid var(--vscode-input-border);
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 5px;
            resize: vertical;
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
        }
        
        .send-button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
        }
        
        .send-button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        
        .send-button:disabled {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            cursor: not-allowed;
        }
        
        .typing-indicator {
            display: none;
            margin-bottom: 20px;
            padding: 12px 16px;
            border-radius: 8px;
            background-color: var(--vscode-textBlockQuote-background);
            border-left: 3px solid var(--vscode-textBlockQuote-border);
            margin-right: 40px;
            font-style: italic;
            opacity: 0.7;
        }
        
        .context-help {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 8px;
        }
        
        .context-tag {
            background: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            padding: 2px 6px;
            border-radius: 3px;
            margin-right: 5px;
            font-family: monospace;
            font-size: 10px;
        }
        
        .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: var(--vscode-descriptionForeground);
        }
        
        .empty-state h3 {
            margin-bottom: 10px;
        }
        
        .empty-state p {
            margin-bottom: 20px;
            line-height: 1.5;
        }
        
        .example-prompts {
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
            margin: 0 auto;
        }
        
        .example-prompt {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            border: none;
            padding: 8px 12px;
            border-radius: 5px;
            cursor: pointer;
            text-align: left;
            font-size: 12px;
        }
        
        .example-prompt:hover {
            background: var(--vscode-button-secondaryHoverBackground);
        }
    </style>
</head>
<body>
    <div class="chat-header">
        <h3 class="chat-title">AI Assistant Chat</h3>
        <div class="chat-actions">
            <button class="action-button" onclick="clearChat()">Clear</button>
            <button class="action-button" onclick="exportChat()">Export</button>
        </div>
    </div>
    
    <div class="chat-container" id="chatContainer">
        <div class="empty-state" id="emptyState">
            <h3>Welcome to AI Assistant!</h3>
            <p>Start a conversation with AI or try these example prompts:</p>
            <div class="example-prompts">
                <button class="example-prompt" onclick="sendExample('Explain the current file #thisFile')">
                    Explain the current file
                </button>
                <button class="example-prompt" onclick="sendExample('Review my recent changes #localChanges')">
                    Review my recent changes
                </button>
                <button class="example-prompt" onclick="sendExample('How do I implement a binary search in JavaScript?')">
                    How do I implement a binary search?
                </button>
                <button class="example-prompt" onclick="sendExample('What are the best practices for error handling in TypeScript?')">
                    Error handling best practices
                </button>
            </div>
        </div>
        
        <div class="typing-indicator" id="typingIndicator">
            AI is thinking...
        </div>
    </div>
    
    <div class="input-container">
        <div class="context-help">
            Use <span class="context-tag">#thisFile</span> <span class="context-tag">#localChanges</span> 
            <span class="context-tag">#file:path</span> <span class="context-tag">#symbol:name</span> 
            for context references
        </div>
        <div class="input-row">
            <textarea class="message-input" id="messageInput" placeholder="Ask anything about code, git, or programming..." rows="1"></textarea>
            <button class="send-button" onclick="sendMessage()" id="sendButton">Send</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let chatHistory = [];
        
        // Auto-resize textarea
        const messageInput = document.getElementById('messageInput');
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
        
        // Send message on Enter (Shift+Enter for new line)
        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Request initial data
        vscode.postMessage({ command: 'getInitialData' });
        
        // Listen for messages from the extension
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.command) {
                case 'initialData':
                    chatHistory = message.chatHistory || [];
                    renderChat();
                    break;
                    
                case 'messageAdded':
                    chatHistory.push(message.message);
                    renderChat();
                    break;
                    
                case 'messageChunk':
                    if (chatHistory[message.messageIndex]) {
                        chatHistory[message.messageIndex].content += message.chunk;
                        renderChat();
                    }
                    break;
                    
                case 'showTyping':
                    document.getElementById('typingIndicator').style.display = 'block';
                    scrollToBottom();
                    break;
                    
                case 'hideTyping':
                    document.getElementById('typingIndicator').style.display = 'none';
                    break;
                    
                case 'chatCleared':
                    chatHistory = [];
                    renderChat();
                    break;
            }
        });
        
        function sendMessage() {
            const input = document.getElementById('messageInput');
            const text = input.value.trim();
            
            if (text) {
                vscode.postMessage({
                    command: 'sendMessage',
                    text: text
                });
                input.value = '';
                input.style.height = 'auto';
            }
        }
        
        function sendExample(text) {
            document.getElementById('messageInput').value = text;
            sendMessage();
        }
        
        function clearChat() {
            vscode.postMessage({ command: 'clearChat' });
        }
        
        function exportChat() {
            vscode.postMessage({ command: 'exportChat' });
        }
        
        function renderChat() {
            const container = document.getElementById('chatContainer');
            const emptyState = document.getElementById('emptyState');
            
            if (chatHistory.length === 0) {
                emptyState.style.display = 'block';
                return;
            }
            
            emptyState.style.display = 'none';
            
            // Keep existing messages and only add new ones
            const existingMessages = container.querySelectorAll('.message').length;
            
            for (let i = existingMessages; i < chatHistory.length; i++) {
                const message = chatHistory[i];
                const messageElement = createMessageElement(message);
                container.appendChild(messageElement);
            }
            
            // Update the last message if it's being streamed
            if (chatHistory.length > 0) {
                const lastMessage = chatHistory[chatHistory.length - 1];
                const lastMessageElement = container.querySelector('.message:last-child .message-content');
                if (lastMessageElement && lastMessage.role === 'assistant') {
                    lastMessageElement.textContent = lastMessage.content;
                }
            }
            
            scrollToBottom();
        }
        
        function createMessageElement(message) {
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${message.role}\`;
            
            const roleDiv = document.createElement('div');
            roleDiv.className = 'message-role';
            roleDiv.textContent = message.role === 'user' ? 'You' : 'AI Assistant';
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            contentDiv.textContent = message.content;
            
            const timestampDiv = document.createElement('div');
            timestampDiv.className = 'message-timestamp';
            timestampDiv.textContent = new Date(message.timestamp || Date.now()).toLocaleTimeString();
            
            messageDiv.appendChild(roleDiv);
            messageDiv.appendChild(contentDiv);
            messageDiv.appendChild(timestampDiv);
            
            return messageDiv;
        }
        
        function scrollToBottom() {
            const container = document.getElementById('chatContainer');
            container.scrollTop = container.scrollHeight;
        }
    </script>
</body>
</html>`;
  }
}