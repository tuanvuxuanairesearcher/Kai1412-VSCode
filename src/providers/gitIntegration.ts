import * as vscode from 'vscode';
import { ModelFactory } from '../models';
import { PromptLibrary } from '../config';
import { GitHelper } from '../utils';

export class GitIntegrationProvider {
  private modelFactory: ModelFactory;
  private promptLibrary: PromptLibrary;
  private gitHelper: GitHelper;

  constructor() {
    this.modelFactory = ModelFactory.getInstance();
    this.promptLibrary = PromptLibrary.getInstance();
    this.gitHelper = new GitHelper();
  }

  async generateCommitMessage(): Promise<void> {
    try {
      // Check if we're in a git repository
      if (!(await this.gitHelper.isGitRepository())) {
        vscode.window.showErrorMessage('Not in a git repository');
        return;
      }

      // Get current changes
      const status = await this.gitHelper.getStatus();
      
      if (!status.staged || status.staged.length === 0) {
        const action = await vscode.window.showWarningMessage(
          'No staged changes found. Stage changes first or generate commit message for all changes?',
          'Stage All & Continue',
          'Use All Changes',
          'Cancel'
        );

        if (action === 'Cancel') {
          return;
        } else if (action === 'Stage All & Continue') {
          await this.gitHelper.stageAllChanges();
        }
      }

      // Get diff for commit message generation
      let diff: string;
      if (status.staged && status.staged.length > 0) {
        diff = await this.gitHelper.getStagedDiff();
      } else {
        diff = await this.gitHelper.getAllChanges();
      }

      if (!diff || diff.trim().length === 0) {
        vscode.window.showInformationMessage('No changes to commit');
        return;
      }

      const model = this.modelFactory.getCurrentModel();
      if (!model) {
        throw new Error('No AI model configured');
      }

      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Generating commit message...',
        cancellable: false
      }, async () => {
        // Generate commit message
        const prompt = this.promptLibrary.formatPrompt('commitMessage', { diff });
        const commitMessage = await model.generateCompletion(prompt);

        // Clean up the commit message
        const cleanedMessage = this.cleanCommitMessage(commitMessage);

        // Show commit message options
        await this.showCommitMessageOptions(cleanedMessage, diff);
      });

    } catch (error: any) {
      vscode.window.showErrorMessage(`Failed to generate commit message: ${error.message}`);
    }
  }

  async explainCommit(): Promise<void> {
    try {
      // Check if we're in a git repository
      if (!(await this.gitHelper.isGitRepository())) {
        vscode.window.showErrorMessage('Not in a git repository');
        return;
      }

      // Get commit selection method
      const method = await vscode.window.showQuickPick([
        { label: 'Latest commit', value: 'latest' },
        { label: 'Select from recent commits', value: 'select' },
        { label: 'Enter commit hash', value: 'hash' }
      ], {
        placeHolder: 'How would you like to select the commit?'
      });

      if (!method) {
        return;
      }

      let commitHash: string;
      let commit: any;

      switch (method.value) {
        case 'latest':
          commit = await this.gitHelper.getLastCommit();
          if (!commit) {
            vscode.window.showErrorMessage('No commits found');
            return;
          }
          commitHash = commit.hash;
          break;

        case 'select':
          const commits = await this.gitHelper.getCommitHistory(20);
          if (commits.length === 0) {
            vscode.window.showErrorMessage('No commits found');
            return;
          }

          const selectedCommit = await vscode.window.showQuickPick(
            commits.map(c => ({
              label: c.message.split('\n')[0],
              description: `${c.hash.substring(0, 8)} - ${c.author_name}`,
              detail: new Date(c.date).toLocaleString(),
              commit: c
            })),
            { placeHolder: 'Select a commit to explain' }
          );

          if (!selectedCommit) {
            return;
          }

          commit = selectedCommit.commit;
          commitHash = commit.hash;
          break;

        case 'hash':
          const inputHash = await vscode.window.showInputBox({
            prompt: 'Enter commit hash',
            placeHolder: 'e.g., abc123def',
            validateInput: (value) => {
              if (!value || value.length < 6) {
                return 'Please enter a valid commit hash (at least 6 characters)';
              }
              return null;
            }
          });

          if (!inputHash) {
            return;
          }

          commitHash = inputHash;
          break;

        default:
          return;
      }

      const model = this.modelFactory.getCurrentModel();
      if (!model) {
        throw new Error('No AI model configured');
      }

      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Explaining commit...',
        cancellable: false
      }, async () => {
        // Get commit diff
        const commitDiff = await this.gitHelper.getCommitDiff(commitHash);
        
        // Create explanation prompt
        const commitInfo = commit ? this.gitHelper.formatCommitForExplanation(commit) : `Commit: ${commitHash}`;
        const prompt = `Explain the following git commit in detail. Describe what changes were made, why they might have been made, and their impact:

${commitInfo}

Diff:
\`\`\`diff
${commitDiff}
\`\`\`

Provide a clear and comprehensive explanation of this commit.`;

        const explanation = await model.generateCompletion(prompt);

        // Show explanation in a new document
        await this.showCommitExplanation(explanation, commitHash);
      });

    } catch (error: any) {
      vscode.window.showErrorMessage(`Failed to explain commit: ${error.message}`);
    }
  }

  private cleanCommitMessage(message: string): string {
    let cleaned = message.trim();

    // Remove any markdown code blocks
    cleaned = cleaned.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '');

    // Split into lines and clean up
    const lines = cleaned.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    if (lines.length === 0) {
      return 'Update code';
    }

    // Take the first line as the main commit message
    let commitMessage = lines[0];

    // Remove any prefix labels like "Commit message:" or "Message:"
    commitMessage = commitMessage.replace(/^(commit\s*message|message|commit):\s*/i, '');

    // Ensure first letter is capitalized
    if (commitMessage.length > 0) {
      commitMessage = commitMessage.charAt(0).toUpperCase() + commitMessage.slice(1);
    }

    // Remove trailing punctuation if it's just a period
    if (commitMessage.endsWith('.') && !commitMessage.includes('. ')) {
      commitMessage = commitMessage.slice(0, -1);
    }

    // Add body if available and relevant
    const bodyLines = lines.slice(1).filter(line => 
      !line.toLowerCase().includes('commit message') &&
      !line.toLowerCase().includes('summary') &&
      line.length > 10
    );

    if (bodyLines.length > 0 && commitMessage.length < 50) {
      // Add a blank line between subject and body
      return commitMessage + '\n\n' + bodyLines.join('\n');
    }

    return commitMessage;
  }

  private async showCommitMessageOptions(commitMessage: string, diff: string): Promise<void> {
    // Show the generated commit message and options
    const action = await vscode.window.showInformationMessage(
      `Generated commit message:\n\n"${commitMessage}"`,
      { modal: true },
      'Use This Message',
      'Edit Message',
      'Copy to Clipboard',
      'Show Diff',
      'Cancel'
    );

    switch (action) {
      case 'Use This Message':
        await this.commitWithMessage(commitMessage);
        break;

      case 'Edit Message':
        const editedMessage = await vscode.window.showInputBox({
          prompt: 'Edit the commit message',
          value: commitMessage,
          ignoreFocusOut: true
        });

        if (editedMessage) {
          await this.commitWithMessage(editedMessage);
        }
        break;

      case 'Copy to Clipboard':
        await vscode.env.clipboard.writeText(commitMessage);
        vscode.window.showInformationMessage('Commit message copied to clipboard');
        break;

      case 'Show Diff':
        await this.showDiffDocument(diff);
        // Show options again after showing diff
        setTimeout(() => this.showCommitMessageOptions(commitMessage, diff), 1000);
        break;
    }
  }

  private async commitWithMessage(message: string): Promise<void> {
    try {
      await this.gitHelper.createCommit(message);
      vscode.window.showInformationMessage(`Commit created: ${message}`);
    } catch (error: any) {
      vscode.window.showErrorMessage(`Failed to create commit: ${error.message}`);
    }
  }

  private async showDiffDocument(diff: string): Promise<void> {
    const doc = await vscode.workspace.openTextDocument({
      content: diff,
      language: 'diff'
    });

    await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
  }

  private async showCommitExplanation(explanation: string, commitHash: string): Promise<void> {
    const content = `# Commit Explanation: ${commitHash.substring(0, 8)}\n\n${explanation}`;
    
    const doc = await vscode.workspace.openTextDocument({
      content,
      language: 'markdown'
    });

    await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
  }
}