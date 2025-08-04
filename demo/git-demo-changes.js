// Git Demo File - Make changes here to test commit message generation

// Original function
function basicCalculator(a, b, operation) {
    if (operation === 'add') return a + b;
    if (operation === 'subtract') return a - b;
    if (operation === 'multiply') return a * b;
    if (operation === 'divide') return a / b;
    return 0;
}

// TODO: Add these features to test git integration:
// 1. Add input validation
// 2. Add support for more operations (power, sqrt)
// 3. Add error handling for division by zero
// 4. Add JSDoc documentation

// Enhanced calculator (uncomment to create git changes)
/*
function enhancedCalculator(a, b, operation) {
    // Input validation
    if (typeof a !== 'number' || typeof b !== 'number') {
        throw new Error('Inputs must be numbers');
    }
    
    switch (operation) {
        case 'add':
            return a + b;
        case 'subtract':
            return a - b;
        case 'multiply':
            return a * b;
        case 'divide':
            if (b === 0) throw new Error('Division by zero');
            return a / b;
        case 'power':
            return Math.pow(a, b);
        case 'sqrt':
            return Math.sqrt(a);
        default:
            throw new Error('Unsupported operation');
    }
}
*/

console.log("Make changes to this file, then use Git integration demo!");