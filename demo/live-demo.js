// Live Demo File - AI Assistant Extension
// Use this file for real-time demo in VS Code

console.log("🎬 Starting AI Assistant Extension Demo");

// Demo 1: Code Generation Target
// Place cursor here and press Ctrl+\ then type:
// "Create a function to validate Vietnamese phone numbers"


// Demo 2: Code that needs explanation
const complexRegex = /^(?:\+84|84|0)([1-9][0-9]{8,9})$/;
// Select this regex and right-click → AI Actions → Explain Code

// Demo 3: Function that needs documentation
function calculateCompoundInterest(principal, rate, time, frequency) {
    return principal * Math.pow((1 + rate/frequency), frequency * time);
}
// Select function above → Right-click → AI Actions → Write Documentation

// Demo 4: Problematic code for analysis
function processUserData(userData) {
    return userData.map(user => {
        return user.name + " - " + user.email.toLowerCase();
    });
}
// Select function above → Right-click → AI Actions → Find Problems

// Demo 5: Function for unit test generation
function validatePassword(password) {
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    if (!/[^A-Za-z0-9]/.test(password)) return false;
    return true;
}
// Place cursor in function → Right-click → AI Actions → Generate Unit Tests

// Demo 6: Code for refactoring
function getUserById(users, id) {
    var result = null;
    for (var i = 0; i < users.length; i++) {
        if (users[i].id == id) {
            result = users[i];
            break;
        }
    }
    return result;
}
// Select function → Right-click → AI Actions → Suggest Refactoring

// Demo 7: Inline completion test area
// Type these slowly to trigger inline completion:
// function validate
// const user = 
// if (email.includes

// Demo 8: Sample data for context
const sampleUsers = [
    { id: 1, name: "Nguyen Van A", email: "a@example.com", phone: "0901234567" },
    { id: 2, name: "Tran Thi B", email: "b@example.com", phone: "0987654321" }
];

// Demo 9: Error-prone code
function divideNumbers(a, b) {
    return a / b; // What problems can AI find here?
}

// Demo 10: Complex algorithm for explanation
function quickSort(arr) {
    if (arr.length <= 1) return arr;
    const pivot = arr[arr.length - 1];
    const left = arr.slice(0, -1).filter(x => x <= pivot);
    const right = arr.slice(0, -1).filter(x => x > pivot);
    return [...quickSort(left), pivot, ...quickSort(right)];
}

/* 
🎯 Demo Checklist:
□ Code Generation (Ctrl+\)
□ Code Explanation (regex, algorithm)  
□ Documentation Generation
□ Problem Finding
□ Unit Test Generation
□ Refactoring Suggestions
□ Inline Completion
□ Chat Interface (#thisFile)
□ Git Integration (commit message)
*/

console.log("✅ Demo file ready for AI Assistant features!");