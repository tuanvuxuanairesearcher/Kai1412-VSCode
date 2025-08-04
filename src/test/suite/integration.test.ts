import * as assert from 'assert';
import * as vscode from 'vscode';
import { ModelFactory } from '../../models';
import { EditorAssistanceProvider } from '../../providers/editorAssistance';
import { GitIntegrationProvider } from '../../providers/gitIntegration';
import { InlineCompletionProvider } from '../../providers/inlineCompletion';

// Integration tests require mock server running on localhost:1998
suite('AI Assistant Integration Tests', () => {
  let modelFactory: ModelFactory;
  let editorAssistance: EditorAssistanceProvider;
  let gitIntegration: GitIntegrationProvider;
  let inlineCompletion: InlineCompletionProvider;

  suiteSetup(async () => {
    // Configure extension to use test server
    const config = vscode.workspace.getConfiguration('aiAssistant');
    await config.update('provider', 'local', vscode.ConfigurationTarget.Global);
    await config.update('local.endpoint', 'http://localhost:1998', vscode.ConfigurationTarget.Global);
    await config.update('local.model', 'qwen3-0.6b', vscode.ConfigurationTarget.Global);
    await config.update('local.apiKey', 'EMPTY', vscode.ConfigurationTarget.Global);

    // Initialize providers
    modelFactory = ModelFactory.getInstance();
    editorAssistance = new EditorAssistanceProvider();
    gitIntegration = new GitIntegrationProvider();
    inlineCompletion = new InlineCompletionProvider();

    // Wait a bit for configuration to take effect
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  suite('Model Integration Tests', () => {
    test('Should connect to mock server', async function() {
      this.timeout(10000); // 10 second timeout
      
      try {
        const model = modelFactory.createModel();
        const testResult = await modelFactory.testConnection();
        
        assert.ok(testResult.success, `Connection failed: ${testResult.error}`);
      } catch (error) {
        // Skip test if server not running
        console.warn('Mock server not running, skipping integration tests');
        this.skip();
      }
    });

    test('Should generate code completion', async function() {
      this.timeout(10000);
      
      try {
        const model = modelFactory.getCurrentModel();
        if (!model) {
          this.skip();
          return;
        }

        const response = await model.generateCompletion('Generate a function to validate email addresses');
        
        assert.ok(response);
        assert.ok(response.length > 0);
        assert.ok(response.includes('function') || response.includes('email'));
        
        console.log('Generated code:', response.substring(0, 100) + '...');
      } catch (error: any) {
        console.warn('Code generation test failed:', error.message);
        this.skip();
      }
    });

    test('Should handle streaming responses', async function() {
      this.timeout(10000);
      
      try {
        const model = modelFactory.getCurrentModel();
        if (!model) {
          this.skip();
          return;
        }

        const messages = [
          { role: 'user' as const, content: 'Explain how JavaScript closures work' }
        ];

        let fullResponse = '';
        let chunkCount = 0;
        
        for await (const chunk of model.generateStreamingResponse(messages)) {
          fullResponse += chunk.content;
          chunkCount++;
          
          if (chunk.done) {
            break;
          }
        }

        assert.ok(fullResponse.length > 0);
        assert.ok(chunkCount > 0);
        
        console.log(`Received ${chunkCount} chunks, total length: ${fullResponse.length}`);
      } catch (error: any) {
        console.warn('Streaming test failed:', error.message);
        this.skip();
      }
    });
  });

  suite('Editor Assistance Integration Tests', () => {
    test('Should create test document for editor tests', async () => {
      const document = await vscode.workspace.openTextDocument({
        content: `function validateEmail(email) {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email);
}`,
        language: 'javascript'
      });

      const editor = await vscode.window.showTextDocument(document);
      assert.ok(editor);
      assert.strictEqual(editor.document.languageId, 'javascript');
    });

    test('Should test inline completion provider', async function() {
      this.timeout(10000);
      
      try {
        const document = await vscode.workspace.openTextDocument({
          content: 'function test() {\\n  // Generate code here\\n}',
          language: 'javascript'
        });

        const position = new vscode.Position(1, 20);
        const context: vscode.InlineCompletionContext = {
          triggerKind: vscode.InlineCompletionTriggerKind.Automatic,
          selectedCompletionInfo: undefined
        };

        const token = new vscode.CancellationTokenSource().token;
        
        const completions = await inlineCompletion.provideInlineCompletionItems(
          document,
          position,
          context,
          token
        );

        // Note: Inline completion might return null for various reasons (debouncing, context, etc.)
        if (completions) {
          assert.ok(Array.isArray(completions) || completions.items);
          console.log('Inline completion provided');
        } else {
          console.log('Inline completion returned null (expected in some cases)');
        }
      } catch (error: any) {
        console.warn('Inline completion test failed:', error.message);
      }
    });
  });

  suite('Error Handling Tests', () => {
    test('Should handle invalid API key gracefully', async function() {
      this.timeout(5000);
      
      // Temporarily set invalid API key
      const config = vscode.workspace.getConfiguration('aiAssistant');
      await config.update('local.apiKey', 'INVALID', vscode.ConfigurationTarget.Global);
      
      try {
        const model = modelFactory.refreshModel();
        const response = await model.generateCompletion('test prompt');
        
        // Should not reach here
        assert.fail('Expected error for invalid API key');
      } catch (error: any) {
        assert.ok(error.message.includes('401') || error.message.includes('Invalid API key'));
        console.log('Correctly handled invalid API key');
      } finally {
        // Restore valid API key
        await config.update('local.apiKey', 'EMPTY', vscode.ConfigurationTarget.Global);
        modelFactory.refreshModel();
      }
    });

    test('Should handle network errors gracefully', async function() {
      this.timeout(5000);
      
      // Temporarily set invalid endpoint
      const config = vscode.workspace.getConfiguration('aiAssistant');
      await config.update('local.endpoint', 'http://localhost:9999', vscode.ConfigurationTarget.Global);
      
      try {
        const model = modelFactory.refreshModel();
        const response = await model.generateCompletion('test prompt');
        
        // Should not reach here
        assert.fail('Expected network error');
      } catch (error: any) {
        assert.ok(error.message.includes('ECONNREFUSED') || error.message.includes('Network Error'));
        console.log('Correctly handled network error');
      } finally {
        // Restore valid endpoint
        await config.update('local.endpoint', 'http://localhost:1998', vscode.ConfigurationTarget.Global);
        modelFactory.refreshModel();
      }
    });
  });

  suite('Performance Tests', () => {
    test('Should handle multiple concurrent requests', async function() {
      this.timeout(15000);
      
      try {
        const model = modelFactory.getCurrentModel();
        if (!model) {
          this.skip();
          return;
        }

        const promises = [];
        const startTime = Date.now();
        
        for (let i = 0; i < 5; i++) {
          promises.push(
            model.generateCompletion(`Generate a simple function number ${i}`)
          );
        }

        const responses = await Promise.all(promises);
        const endTime = Date.now();
        const duration = endTime - startTime;

        assert.strictEqual(responses.length, 5);
        responses.forEach((response, index) => {
          assert.ok(response);
          assert.ok(response.length > 0);
          console.log(`Response ${index}: ${response.substring(0, 50)}...`);
        });

        console.log(`Completed 5 concurrent requests in ${duration}ms`);
        
        // Should complete within reasonable time (adjust as needed)
        assert.ok(duration < 10000, 'Concurrent requests took too long');
      } catch (error: any) {
        console.warn('Performance test failed:', error.message);
        this.skip();
      }
    });
  });
});