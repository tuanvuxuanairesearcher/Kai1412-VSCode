const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 1998;

app.use(cors());
app.use(express.json());

// Mock responses for different types of requests
const mockResponses = {
  codeGeneration: `function validateEmail(email) {
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return emailRegex.test(email);
}`,
  
  codeExplanation: `This code defines a function called \`validateEmail\` that checks if an email address is valid using a regular expression.

**How it works:**
1. **Regular Expression**: \`/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/\`
   - \`^[^\\s@]+\`: Matches one or more characters that are not whitespace or @
   - \`@\`: Matches the @ symbol literally
   - \`[^\\s@]+\`: Matches one or more characters that are not whitespace or @
   - \`\\.\`: Matches a literal dot (escaped)
   - \`[^\\s@]+$\`: Matches one or more characters until the end

2. **test() method**: Returns true if the email matches the pattern, false otherwise

**Example usage:**
\`\`\`javascript
console.log(validateEmail("user@example.com")); // true
console.log(validateEmail("invalid-email"));     // false
\`\`\``,

  documentation: `/**
 * Validates an email address using regex pattern matching
 * @param {string} email - The email address to validate
 * @returns {boolean} True if the email is valid, false otherwise
 * @example
 * validateEmail("user@example.com") // returns true
 * validateEmail("invalid-email") // returns false
 */`,

  unitTests: `const { validateEmail } = require('./email-validator');

describe('validateEmail', () => {
  test('should return true for valid email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('test.email@domain.co.uk')).toBe(true);
    expect(validateEmail('user+tag@example.org')).toBe(true);
  });

  test('should return false for invalid email addresses', () => {
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('@domain.com')).toBe(false);
    expect(validateEmail('user space@domain.com')).toBe(false);
  });

  test('should return false for empty or null inputs', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail(null)).toBe(false);
    expect(validateEmail(undefined)).toBe(false);
  });
});`,

  commitMessage: `feat: add email validation utility

Add validateEmail function with regex pattern matching
- Validates email format using standard regex
- Handles edge cases and null inputs
- Includes comprehensive test coverage`,

  refactoring: `// Refactored version with better error handling and validation
function validateEmail(email) {
    // Input validation
    if (!email || typeof email !== 'string') {
        return false;
    }
    
    // Trim whitespace
    email = email.trim();
    
    // Check length constraints
    if (email.length === 0 || email.length > 254) {
        return false;
    }
    
    // More comprehensive email regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_\`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    return emailRegex.test(email);
}`,

  problemFinding: `**Potential Issues Found:**

1. **No Input Validation**: The function doesn't check if the input is null, undefined, or not a string
   - **Fix**: Add input validation at the beginning

2. **Basic Regex**: The current regex is quite simple and may not catch all edge cases
   - **Fix**: Use a more comprehensive email validation regex

3. **No Length Checking**: Very long strings could cause performance issues
   - **Fix**: Add maximum length validation

4. **No Trimming**: Leading/trailing spaces aren't handled
   - **Fix**: Trim the input before validation

5. **Missing JSDoc**: No documentation for the function
   - **Fix**: Add proper JSDoc comments

**Recommended Improvements:**
- Add input sanitization
- Use more robust email validation
- Add error handling
- Include unit tests`,

  nameGeneration: `**Better Names for \`validateEmail\`:**

1. **\`isValidEmail\`** - More descriptive boolean naming convention
2. **\`checkEmailFormat\`** - Clearly indicates format checking
3. **\`verifyEmailAddress\`** - Professional, indicates verification
4. **\`emailFormatValidator\`** - Descriptive but longer
5. **\`isEmailValid\`** - Clear boolean intent

**Recommended:** \`isValidEmail\` - follows JavaScript boolean function naming conventions and is concise yet clear.`,

  errorExplanation: `**Error Explanation:**

**TypeError: Cannot read property 'length' of undefined**

**What this means:**
This error occurs when you try to access the \`length\` property on a variable that is \`undefined\`.

**Common causes:**
1. Variable not initialized
2. Function didn't return expected value
3. Array/string is null or undefined
4. Typo in variable name

**How to fix:**
1. **Check if variable exists before using:**
   \`\`\`javascript
   if (myVariable && myVariable.length) {
       // Safe to use length
   }
   \`\`\`

2. **Use optional chaining (ES2020):**
   \`\`\`javascript
   const length = myVariable?.length || 0;
   \`\`\`

3. **Provide default values:**
   \`\`\`javascript
   const myArray = getData() || [];
   \`\`\`

**Prevention:**
- Always initialize variables
- Use TypeScript for better type checking
- Add proper error handling`,

  languageConversion: `# Python equivalent of the JavaScript email validation

import re

def validate_email(email):
    """
    Validates an email address using regex pattern matching
    
    Args:
        email (str): The email address to validate
        
    Returns:
        bool: True if the email is valid, False otherwise
    """
    if not email or not isinstance(email, str):
        return False
    
    email_regex = r'^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
    return bool(re.match(email_regex, email))

# Example usage
if __name__ == "__main__":
    test_emails = [
        "user@example.com",
        "invalid-email",
        "test@domain.co.uk"
    ]
    
    for email in test_emails:
        result = validate_email(email)
        print(f"{email}: {result}")`
};

// Helper function to get appropriate response based on prompt content
function getResponseForPrompt(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('generate') && lowerPrompt.includes('code')) {
    return mockResponses.codeGeneration;
  } else if (lowerPrompt.includes('explain') && lowerPrompt.includes('code')) {
    return mockResponses.codeExplanation;
  } else if (lowerPrompt.includes('documentation') || lowerPrompt.includes('jsdoc')) {
    return mockResponses.documentation;
  } else if (lowerPrompt.includes('unit test') || lowerPrompt.includes('test')) {
    return mockResponses.unitTests;
  } else if (lowerPrompt.includes('commit message')) {
    return mockResponses.commitMessage;
  } else if (lowerPrompt.includes('refactor')) {
    return mockResponses.refactoring;
  } else if (lowerPrompt.includes('problem') || lowerPrompt.includes('issue')) {
    return mockResponses.problemFinding;
  } else if (lowerPrompt.includes('name') || lowerPrompt.includes('suggest')) {
    return mockResponses.nameGeneration;
  } else if (lowerPrompt.includes('error') || lowerPrompt.includes('typeerror')) {
    return mockResponses.errorExplanation;
  } else if (lowerPrompt.includes('convert') || lowerPrompt.includes('python')) {
    return mockResponses.languageConversion;
  } else {
    return "I'm a mock AI assistant running Qwen3 0.6B. I can help you with code generation, explanation, documentation, testing, and more!";
  }
}

// OpenAI-compatible chat completions endpoint
app.post('/v1/chat/completions', (req, res) => {
  const { messages, stream = false, model = 'qwen3-0.6b' } = req.body;
  
  // Validate API key
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== 'Bearer EMPTY') {
    return res.status(401).json({
      error: {
        message: 'Invalid API key',
        type: 'invalid_request_error'
      }
    });
  }

  const lastMessage = messages[messages.length - 1];
  const responseContent = getResponseForPrompt(lastMessage.content);

  if (stream) {
    // Streaming response
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked'
    });

    // Simulate streaming by sending chunks
    const words = responseContent.split(' ');
    let wordIndex = 0;

    const sendChunk = () => {
      if (wordIndex < words.length) {
        const chunk = {
          id: 'chatcmpl-test123',
          object: 'chat.completion.chunk',
          created: Math.floor(Date.now() / 1000),
          model: model,
          choices: [{
            index: 0,
            delta: {
              content: words[wordIndex] + ' '
            },
            finish_reason: null
          }]
        };
        
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        wordIndex++;
        setTimeout(sendChunk, 50); // 50ms delay between words
      } else {
        // Send final chunk
        const finalChunk = {
          id: 'chatcmpl-test123',
          object: 'chat.completion.chunk',
          created: Math.floor(Date.now() / 1000),
          model: model,
          choices: [{
            index: 0,
            delta: {},
            finish_reason: 'stop'
          }]
        };
        
        res.write(`data: ${JSON.stringify(finalChunk)}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      }
    };

    sendChunk();
  } else {
    // Non-streaming response
    const response = {
      id: 'chatcmpl-test123',
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: responseContent
        },
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: lastMessage.content.length / 4, // Rough estimation
        completion_tokens: responseContent.length / 4,
        total_tokens: (lastMessage.content.length + responseContent.length) / 4
      }
    };

    res.json(response);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    model: 'qwen3-0.6b',
    timestamp: new Date().toISOString()
  });
});

// Models endpoint
app.get('/v1/models', (req, res) => {
  res.json({
    object: 'list',
    data: [{
      id: 'qwen3-0.6b',
      object: 'model',
      created: Math.floor(Date.now() / 1000),
      owned_by: 'local-test'
    }]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock AI Server running on http://localhost:${PORT}`);
  console.log(`📡 Model: Qwen3 0.6B`);
  console.log(`🔑 API Key: EMPTY`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Models: http://localhost:${PORT}/v1/models`);
  console.log(`💬 Chat completions: POST http://localhost:${PORT}/v1/chat/completions`);
});