#!/usr/bin/env node

/**
 * AI Assistant Extension Demo Test Script
 * 
 * This script demonstrates how to interact with the mock AI server
 * programmatically to test various features.
 */

const axios = require('axios');

const API_BASE = 'http://localhost:1998';
const API_KEY = 'EMPTY';

class AIAssistantDemo {
    constructor() {
        this.client = axios.create({
            baseURL: API_BASE,
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async checkHealth() {
        try {
            const response = await this.client.get('/health');
            console.log('✅ Server health:', response.data);
            return true;
        } catch (error) {
            console.error('❌ Server health check failed:', error.message);
            return false;
        }
    }

    async testChatCompletion(prompt, description) {
        console.log(`\n🧪 Testing: ${description}`);
        console.log(`📝 Prompt: ${prompt}\n`);

        try {
            const response = await this.client.post('/v1/chat/completions', {
                model: 'qwen3-0.6b',
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                temperature: 0.7,
                max_tokens: 500
            });

            const result = response.data.choices[0].message.content;
            console.log(`🤖 Response: ${result.substring(0, 200)}${result.length > 200 ? '...' : ''}\n`);
            
            return result;
        } catch (error) {
            console.error(`❌ Error: ${error.response?.data?.error?.message || error.message}\n`);
            return null;
        }
    }

    async testStreamingCompletion(prompt, description) {
        console.log(`\n🌊 Testing Streaming: ${description}`);
        console.log(`📝 Prompt: ${prompt}\n`);

        try {
            const response = await this.client.post('/v1/chat/completions', {
                model: 'qwen3-0.6b',
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                stream: true,
                temperature: 0.7,
                max_tokens: 300
            }, {
                responseType: 'stream'
            });

            console.log('🤖 Streaming Response:');
            let fullResponse = '';
            let buffer = '';

            return new Promise((resolve, reject) => {
                response.data.on('data', (chunk) => {
                    buffer += chunk.toString();
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            if (data === '[DONE]') {
                                console.log('\n✅ Streaming completed\n');
                                resolve(fullResponse);
                                return;
                            }
                            
                            try {
                                const parsed = JSON.parse(data);
                                const content = parsed.choices?.[0]?.delta?.content || '';
                                if (content) {
                                    process.stdout.write(content);
                                    fullResponse += content;
                                }
                            } catch (e) {
                                // Skip invalid JSON
                            }
                        }
                    }
                });

                response.data.on('error', (error) => {
                    console.error('❌ Streaming error:', error);
                    reject(error);
                });
            });

        } catch (error) {
            console.error(`❌ Streaming Error: ${error.response?.data?.error?.message || error.message}\n`);
            return null;
        }
    }

    async runAllDemos() {
        console.log('🚀 AI Assistant Extension Demo Test');
        console.log('====================================');

        // Check server health
        const isHealthy = await this.checkHealth();
        if (!isHealthy) {
            console.log('\n❌ Server is not running. Please start the test server first:');
            console.log('   ./scripts/start-test-server.sh');
            return;
        }

        // Test different types of prompts that the extension would use
        const tests = [
            {
                prompt: 'Generate code based on the following description. Write clean, well-commented, and production-ready code:\n\nCreate a function to validate email addresses\n\nContext:\n- File: email-validator.js\n- Language: javascript\n- Selected code: ',
                description: 'Code Generation (Email Validator)'
            },
            {
                prompt: 'Explain the following code in detail. Break down what it does, how it works, and any important concepts:\n\n```javascript\nfunction validateEmail(email) {\n    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n    return emailRegex.test(email);\n}\n```',
                description: 'Code Explanation'
            },
            {
                prompt: 'Write comprehensive documentation for the following javascript code. Include parameter descriptions, return values, examples, and any important notes:\n\n```javascript\nfunction calculateArea(radius) {\n    return Math.PI * radius * radius;\n}\n```\n\nGenerate appropriate documentation format (JSDoc) for this language.',
                description: 'Documentation Generation'
            },
            {
                prompt: 'Analyze the following code for potential issues, bugs, performance problems, and code quality concerns. Provide specific recommendations for improvement:\n\n```javascript\nfunction divide(a, b) {\n    return a / b;\n}\n```',
                description: 'Problem Finding'
            },
            {
                prompt: 'Generate comprehensive unit tests for the following javascript function/class. Include edge cases, error scenarios, and positive test cases:\n\n```javascript\nfunction validateEmail(email) {\n    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n    return emailRegex.test(email);\n}\n```\n\nUse Jest for the tests.',
                description: 'Unit Test Generation'
            },
            {
                prompt: 'Suggest refactoring improvements for the following code. Focus on readability, maintainability, performance, and best practices:\n\n```javascript\nfunction getUserInfo(userId) {\n    var users = getUsers();\n    var user = null;\n    for (var i = 0; i < users.length; i++) {\n        if (users[i].id == userId) {\n            user = users[i];\n            break;\n        }\n    }\n    if (user != null) {\n        return user.name + " (" + user.email + ")";\n    } else {\n        return "User not found";\n    }\n}\n```',
                description: 'Refactoring Suggestions'
            },
            {
                prompt: 'Generate a clear and concise commit message based on the following git diff. Follow conventional commit format:\n\n+++ b/src/email-validator.js\n+function validateEmail(email) {\n+    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n+    return emailRegex.test(email);\n+}\n+++ b/README.md\n+## Email Validation\n+Added email validation utility function.',
                description: 'Commit Message Generation'
            },
            {
                prompt: 'Explain the following error message and provide solutions to fix it:\n\nError: TypeError: Cannot read property \'length\' of undefined\n\nContext:\n- File: user-manager.js\n- Language: javascript\n- Code around error:\n```javascript\nfunction processUsers(users) {\n    return users.length > 0 ? users.map(u => u.name) : [];\n}\n```',
                description: 'Error Explanation'
            }
        ];

        // Run regular completion tests
        for (const test of tests) {
            await this.testChatCompletion(test.prompt, test.description);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Brief delay
        }

        // Test streaming with one example
        await this.testStreamingCompletion(
            'Explain how JavaScript closures work with practical examples.',
            'JavaScript Closures Explanation'
        );

        // Test concurrent requests
        console.log('🔄 Testing Concurrent Requests...');
        const concurrentPromises = [
            this.testChatCompletion('Generate a simple hello world function', 'Concurrent Test 1'),
            this.testChatCompletion('Explain what is a variable in programming', 'Concurrent Test 2'),
            this.testChatCompletion('Create a basic for loop example', 'Concurrent Test 3')
        ];

        const startTime = Date.now();
        await Promise.all(concurrentPromises);
        const endTime = Date.now();
        
        console.log(`✅ Concurrent requests completed in ${endTime - startTime}ms\n`);

        console.log('🎉 All demo tests completed successfully!');
        console.log('\nNext steps:');
        console.log('1. Install the extension in VS Code');
        console.log('2. Configure it to use localhost:1998 with API key "EMPTY"');
        console.log('3. Try the features manually using the VS Code interface');
    }
}

// Run the demo
const demo = new AIAssistantDemo();
demo.runAllDemos().catch(console.error);