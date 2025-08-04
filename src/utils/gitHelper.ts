import * as vscode from 'vscode';
import simpleGit, { SimpleGit } from 'simple-git';
import * as path from 'path';

export class GitHelper {
  private git: SimpleGit;
  private workspaceRoot: string;

  constructor(workspaceRoot?: string) {
    this.workspaceRoot = workspaceRoot || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
    this.git = simpleGit(this.workspaceRoot);
  }

  async isGitRepository(): Promise<boolean> {
    try {
      await this.git.status();
      return true;
    } catch {
      return false;
    }
  }

  async getStatus(): Promise<any> {
    try {
      return await this.git.status();
    } catch (error) {
      throw new Error(`Failed to get git status: ${error}`);
    }
  }

  async getStagedDiff(): Promise<string> {
    try {
      return await this.git.diff(['--cached']);
    } catch (error) {
      throw new Error(`Failed to get staged diff: ${error}`);
    }
  }

  async getUnstagedDiff(): Promise<string> {
    try {
      return await this.git.diff();
    } catch (error) {
      throw new Error(`Failed to get unstaged diff: ${error}`);
    }
  }

  async getAllChanges(): Promise<string> {
    try {
      const staged = await this.getStagedDiff();
      const unstaged = await this.getUnstagedDiff();
      
      if (staged && unstaged) {
        return `Staged changes:\n${staged}\n\nUnstaged changes:\n${unstaged}`;
      } else if (staged) {
        return staged;
      } else if (unstaged) {
        return unstaged;
      } else {
        return 'No changes detected';
      }
    } catch (error) {
      throw new Error(`Failed to get all changes: ${error}`);
    }
  }

  async getCommitHistory(count: number = 10): Promise<any[]> {
    try {
      const log = await this.git.log({ maxCount: count });
      return [...log.all];
    } catch (error) {
      throw new Error(`Failed to get commit history: ${error}`);
    }
  }

  async getCommitDiff(commitHash: string): Promise<string> {
    try {
      return await this.git.show([commitHash]);
    } catch (error) {
      throw new Error(`Failed to get commit diff: ${error}`);
    }
  }

  async getCurrentBranch(): Promise<string> {
    try {
      const status = await this.git.status();
      return status.current || 'unknown';
    } catch (error) {
      throw new Error(`Failed to get current branch: ${error}`);
    }
  }

  async getRemoteUrl(): Promise<string | null> {
    try {
      const remotes = await this.git.getRemotes(true);
      const origin = remotes.find(remote => remote.name === 'origin');
      return origin?.refs?.fetch || null;
    } catch (error) {
      return null;
    }
  }

  async getFileHistory(filePath: string, count: number = 10): Promise<any[]> {
    try {
      const relativePath = path.relative(this.workspaceRoot, filePath);
      const log = await this.git.log({ file: relativePath, maxCount: count });
      return [...log.all];
    } catch (error) {
      throw new Error(`Failed to get file history: ${error}`);
    }
  }

  async getLastCommit(): Promise<any | null> {
    try {
      const log = await this.git.log({ maxCount: 1 });
      return log.latest;
    } catch (error) {
      return null;
    }
  }

  async stageAllChanges(): Promise<void> {
    try {
      await this.git.add('.');
    } catch (error) {
      throw new Error(`Failed to stage changes: ${error}`);
    }
  }

  async createCommit(message: string): Promise<void> {
    try {
      await this.git.commit(message);
    } catch (error) {
      throw new Error(`Failed to create commit: ${error}`);
    }
  }

  formatCommitForExplanation(commit: any): string {
    const date = new Date(commit.date).toLocaleDateString();
    const author = commit.author_name;
    const message = commit.message;
    const hash = commit.hash.substring(0, 8);

    return `Commit: ${hash}\nAuthor: ${author}\nDate: ${date}\nMessage: ${message}`;
  }

  generateConventionalCommitSuggestion(diff: string): string {
    // Analyze diff to suggest commit type and scope
    const lines = diff.split('\n');
    const addedLines = lines.filter(line => line.startsWith('+')).length;
    const removedLines = lines.filter(line => line.startsWith('-')).length;
    
    let type = 'feat'; // default
    let scope = '';
    
    // Simple heuristics
    if (diff.includes('test') || diff.includes('spec')) {
      type = 'test';
    } else if (diff.includes('README') || diff.includes('doc')) {
      type = 'docs';
    } else if (diff.includes('package.json')) {
      type = 'chore';
    } else if (removedLines > addedLines * 2) {
      type = 'refactor';
    } else if (diff.includes('fix') || diff.includes('bug')) {
      type = 'fix';
    }
    
    // Try to extract scope from file paths
    const filePattern = /\+\+\+ b\/([^\/]+)/g;
    let match;
    const folders = new Set<string>();
    
    while ((match = filePattern.exec(diff)) !== null) {
      const folder = match[1];
      if (!folder.includes('.')) {
        folders.add(folder);
      }
    }
    
    if (folders.size === 1) {
      scope = Array.from(folders)[0];
    }
    
    return scope ? `${type}(${scope}): ` : `${type}: `;
  }
}