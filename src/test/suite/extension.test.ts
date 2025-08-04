import * as assert from 'assert';
import * as vscode from 'vscode';
import { ModelFactory } from '../../models';
import { ConfigurationManager, PromptLibrary } from '../../config';
import { CodeParser, GitHelper } from '../../utils';

suite('AI Assistant Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  // Test ModelFactory
  suite('ModelFactory Tests', () => {
    test('Should create ModelFactory singleton', () => {
      const factory1 = ModelFactory.getInstance();
      const factory2 = ModelFactory.getInstance();
      assert.strictEqual(factory1, factory2);
    });

    test('Should create local AI model with test configuration', async () => {
      const config = vscode.workspace.getConfiguration('aiAssistant');
      await config.update('provider', 'local', vscode.ConfigurationTarget.Global);
      await config.update('local.endpoint', 'http://localhost:1998', vscode.ConfigurationTarget.Global);
      await config.update('local.model', 'qwen3-0.6b', vscode.ConfigurationTarget.Global);
      await config.update('local.apiKey', 'EMPTY', vscode.ConfigurationTarget.Global);

      const factory = ModelFactory.getInstance();
      const model = factory.createModel();
      
      assert.ok(model);
      assert.strictEqual(model.getModelInfo().provider, 'Local AI');
      assert.strictEqual(model.getModelInfo().name, 'qwen3-0.6b');
    });

    test('Should validate model configuration', () => {
      const factory = ModelFactory.getInstance();
      const validation = factory.validateCurrentModel();
      
      assert.ok(validation.isValid || validation.error?.includes('properly configured'));
    });
  });

  // Test ConfigurationManager
  suite('ConfigurationManager Tests', () => {
    test('Should create ConfigurationManager singleton', () => {
      const manager1 = ConfigurationManager.getInstance();
      const manager2 = ConfigurationManager.getInstance();
      assert.strictEqual(manager1, manager2);
    });

    test('Should get provider configuration', () => {
      const manager = ConfigurationManager.getInstance();
      const provider = manager.getProvider();
      assert.ok(['openai', 'gemini', 'local'].includes(provider));
    });

    test('Should validate configuration', () => {
      const manager = ConfigurationManager.getInstance();
      const validation = manager.validateConfiguration();
      assert.ok(typeof validation.isValid === 'boolean');
      assert.ok(Array.isArray(validation.errors));
    });
  });

  // Test PromptLibrary
  suite('PromptLibrary Tests', () => {
    test('Should create PromptLibrary singleton', () => {
      const library1 = PromptLibrary.getInstance();
      const library2 = PromptLibrary.getInstance();
      assert.strictEqual(library1, library2);
    });

    test('Should get default templates', () => {
      const library = PromptLibrary.getInstance();
      const templates = library.getAllTemplates();
      
      assert.ok(templates.length > 0);
      
      const codeGenTemplate = library.getTemplate('codeGeneration');
      assert.ok(codeGenTemplate);
      assert.ok(codeGenTemplate.template.includes('{description}'));
    });

    test('Should format prompts with variables', () => {
      const library = PromptLibrary.getInstance();
      const formatted = library.formatPrompt('codeGeneration', {
        description: 'Create a hello world function',
        fileName: 'test.js',
        language: 'javascript',
        selectedCode: ''
      });
      
      assert.ok(formatted.includes('Create a hello world function'));
      assert.ok(formatted.includes('test.js'));
      assert.ok(formatted.includes('javascript'));
    });
  });

  // Test CodeParser
  suite('CodeParser Tests', () => {
    test('Should detect language from filename', () => {
      assert.strictEqual(CodeParser.getLanguageFromFileName('test.js'), 'javascript');
      assert.strictEqual(CodeParser.getLanguageFromFileName('test.ts'), 'typescript');
      assert.strictEqual(CodeParser.getLanguageFromFileName('test.py'), 'python');
      assert.strictEqual(CodeParser.getLanguageFromFileName('test.java'), 'java');
    });

    test('Should get documentation format for language', () => {
      assert.strictEqual(CodeParser.getDocumentationFormat('javascript'), 'JSDoc');
      assert.strictEqual(CodeParser.getDocumentationFormat('python'), 'docstring');
      assert.strictEqual(CodeParser.getDocumentationFormat('java'), 'Javadoc');
    });

    test('Should detect regex patterns', () => {
      assert.ok(CodeParser.isRegexPattern('/^[a-z]+$/'));
      assert.ok(CodeParser.isRegexPattern('^\\d+$'));
      assert.ok(!CodeParser.isRegexPattern('normal string'));
    });

    test('Should detect SQL queries', () => {
      assert.ok(CodeParser.isSQLQuery('SELECT * FROM users'));
      assert.ok(CodeParser.isSQLQuery('INSERT INTO table VALUES'));
      assert.ok(!CodeParser.isSQLQuery('not a query'));
    });

    test('Should detect cron expressions', () => {
      assert.ok(CodeParser.isCronExpression('0 9 * * 1-5'));
      assert.ok(CodeParser.isCronExpression('*/15 * * * *'));
      assert.ok(!CodeParser.isCronExpression('not a cron'));
    });

    test('Should get test framework for language', () => {
      assert.strictEqual(CodeParser.getTestFramework('javascript'), 'Jest');
      assert.strictEqual(CodeParser.getTestFramework('python'), 'pytest');
      assert.strictEqual(CodeParser.getTestFramework('java'), 'JUnit');
    });
  });

  // Test GitHelper
  suite('GitHelper Tests', () => {
    test('Should create GitHelper instance', () => {
      const gitHelper = new GitHelper();
      assert.ok(gitHelper);
    });

    test('Should format commit for explanation', () => {
      const gitHelper = new GitHelper();
      const mockCommit = {
        hash: 'abc123def456',
        author_name: 'Test Author',
        date: '2023-12-01',
        message: 'Test commit message'
      };
      
      const formatted = gitHelper.formatCommitForExplanation(mockCommit);
      assert.ok(formatted.includes('abc123de'));
      assert.ok(formatted.includes('Test Author'));
      assert.ok(formatted.includes('Test commit message'));
    });

    test('Should generate conventional commit suggestion', () => {
      const gitHelper = new GitHelper();
      const mockDiff = '+++ b/src/test.js\n+function test() {}\n- old function';
      
      const suggestion = gitHelper.generateConventionalCommitSuggestion(mockDiff);
      assert.ok(suggestion.includes(':'));
    });
  });
});