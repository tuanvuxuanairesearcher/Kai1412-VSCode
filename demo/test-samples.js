// Sample JavaScript code for testing AI Assistant extension features

// Email validation function - good for explaining, documenting, testing
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Problematic function - good for problem finding
function divide(a, b) {
    return a / b; // Missing zero check, no input validation
}

// Function that could be refactored - good for refactoring suggestions
function getUserInfo(userId) {
    var users = getUsers();
    var user = null;
    for (var i = 0; i < users.length; i++) {
        if (users[i].id == userId) {
            user = users[i];
            break;
        }
    }
    if (user != null) {
        return user.name + " (" + user.email + ")";
    } else {
        return "User not found";
    }
}

// Simple function for unit test generation
function calculateArea(radius) {
    return Math.PI * radius * radius;
}

// Class for documentation and testing
class UserManager {
    constructor() {
        this.users = [];
    }
    
    addUser(user) {
        this.users.push(user);
    }
    
    findUser(id) {
        return this.users.find(u => u.id === id);
    }
}

// Complex regex for explanation testing
const complexEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// SQL query for explanation testing
const getUserQuery = `
    SELECT u.id, u.name, u.email, p.title as position
    FROM users u
    LEFT JOIN positions p ON u.position_id = p.id
    WHERE u.active = 1
    ORDER BY u.created_at DESC
    LIMIT 10
`;

// Cron expression for explanation testing
const dailyBackupCron = "0 2 * * *"; // Every day at 2 AM

// Function with poor naming - good for name suggestions
function fn1(x, y) {
    return x * y + 10;
}

// Incomplete function - good for code generation
function processData(data) {
    // TODO: Implement data processing logic
    // Should validate input, transform data, and return results
}