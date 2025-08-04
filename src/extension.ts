import * as vscode from 'vscode';
import { ModelFactory } from './models';
import { ConfigurationManager, PromptLibrary } from './config';
import { ChatPanel } from './ui';
import { EditorAssistanceProvider } from './providers/editorAssistance';
import { InlineCompletionProvider } from './providers/inlineCompletion';
import { GitIntegrationProvider } from './providers/gitIntegration';
import { CommandsProvider } from './commands';

let extensionContext: vscode.ExtensionContext;

export function activate(context: vscode.ExtensionContext) {
    extensionContext = context;
    
    console.log('AI Assistant extension is being activated...');

    // Initialize core services
    const modelFactory = ModelFactory.getInstance();
    const configManager = ConfigurationManager.getInstance();
    const promptLibrary = PromptLibrary.getInstance();

    // Initialize AI model
    try {
        modelFactory.createModel();
    } catch (error: any) {
        console.warn('Failed to initialize AI model:', error.message);
        vscode.window.showWarningMessage('AI Assistant: Failed to initialize AI model. Please check your configuration.');
    }

    // Initialize providers
    const editorAssistance = new EditorAssistanceProvider();
    const inlineCompletion = new InlineCompletionProvider();
    const gitIntegration = new GitIntegrationProvider();
    const commandsProvider = new CommandsProvider();

    // Register commands
    const commands = [
        // Chat commands
        vscode.commands.registerCommand('aiAssistant.openChat', () => {
            ChatPanel.createOrShow(context.extensionUri);
        }),

        // Editor assistance commands
        vscode.commands.registerCommand('aiAssistant.generateCode', async () => {
            await editorAssistance.generateCode();
        }),

        vscode.commands.registerCommand('aiAssistant.explainCode', async () => {
            await editorAssistance.explainCode();
        }),

        vscode.commands.registerCommand('aiAssistant.writeDocumentation', async () => {
            await editorAssistance.writeDocumentation();
        }),

        vscode.commands.registerCommand('aiAssistant.findProblems', async () => {
            await editorAssistance.findProblems();
        }),

        vscode.commands.registerCommand('aiAssistant.generateUnitTests', async () => {
            await editorAssistance.generateUnitTests();
        }),

        vscode.commands.registerCommand('aiAssistant.convertToLanguage', async () => {
            await editorAssistance.convertToLanguage();
        }),

        vscode.commands.registerCommand('aiAssistant.suggestRefactoring', async () => {
            await editorAssistance.suggestRefactoring();
        }),

        vscode.commands.registerCommand('aiAssistant.suggestNames', async () => {
            await editorAssistance.suggestNames();
        }),

        // Git integration commands
        vscode.commands.registerCommand('aiAssistant.generateCommitMessage', async () => {
            await gitIntegration.generateCommitMessage();
        }),

        vscode.commands.registerCommand('aiAssistant.explainCommit', async () => {
            await gitIntegration.explainCommit();
        }),

        // Error explanation command
        vscode.commands.registerCommand('aiAssistant.explainError', async () => {
            await commandsProvider.explainError();
        }),

        // Inline completion toggle
        vscode.commands.registerCommand('aiAssistant.toggleInlineCompletion', async () => {
            const current = configManager.isInlineCompletionEnabled();
            await configManager.updateConfiguration('enableInlineCompletion', !current);
            vscode.window.showInformationMessage(`AI code completion ${!current ? 'enabled' : 'disabled'}`);
        }),

        // Settings command
        vscode.commands.registerCommand('aiAssistant.openSettings', async () => {
            await configManager.openSettings();
        }),

        // Prompt library command
        vscode.commands.registerCommand('aiAssistant.openPromptLibrary', async () => {
            await promptLibrary.openPromptLibraryEditor();
        })
    ];

    // Register inline completion provider
    if (configManager.isInlineCompletionEnabled()) {
        const inlineProvider = vscode.languages.registerInlineCompletionItemProvider(
            { pattern: '**' },
            inlineCompletion
        );
        context.subscriptions.push(inlineProvider);
    }

    // Register all commands
    context.subscriptions.push(...commands);

    // Listen for configuration changes
    const configChangeListener = configManager.onConfigurationChanged((e) => {
        if (e.affectsConfiguration('aiAssistant.provider') || 
            e.affectsConfiguration('aiAssistant.openai') ||
            e.affectsConfiguration('aiAssistant.gemini') ||
            e.affectsConfiguration('aiAssistant.local')) {
            // Refresh AI model when provider settings change
            try {
                modelFactory.refreshModel();
                vscode.window.showInformationMessage('AI Assistant: Model configuration updated');
            } catch (error: any) {
                vscode.window.showErrorMessage(`AI Assistant: Failed to update model configuration: ${error.message}`);
            }
        }

        if (e.affectsConfiguration('aiAssistant.enableInlineCompletion')) {
            // Handle inline completion toggle
            vscode.window.showInformationMessage('AI Assistant: Please reload the window for inline completion changes to take effect', 'Reload Window')
                .then(selection => {
                    if (selection === 'Reload Window') {
                        vscode.commands.executeCommand('workbench.action.reloadWindow');
                    }
                });
        }
    });

    context.subscriptions.push(configChangeListener);

    // Show initial configuration prompt if needed
    setTimeout(async () => {
        await configManager.showConfigurationPrompt();
    }, 1000);

    // Add status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(robot) AI Assistant';
    statusBarItem.tooltip = 'Click to open AI Assistant chat';
    statusBarItem.command = 'aiAssistant.openChat';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    console.log('AI Assistant extension activated successfully');
}

export function deactivate() {
    console.log('AI Assistant extension deactivated');
}

export function getExtensionContext(): vscode.ExtensionContext {
    return extensionContext;
}