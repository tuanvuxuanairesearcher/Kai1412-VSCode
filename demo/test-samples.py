# Sample Python code for language conversion testing

import re
from typing import List, Optional

def validate_email(email: str) -> bool:
    """
    Validates an email address using regex pattern matching
    """
    email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    return bool(re.match(email_regex, email))

class UserManager:
    """
    A simple user management class
    """
    def __init__(self):
        self.users = []
    
    def add_user(self, user: dict) -> None:
        """Add a user to the manager"""
        self.users.append(user)
    
    def find_user(self, user_id: int) -> Optional[dict]:
        """Find a user by ID"""
        for user in self.users:
            if user.get('id') == user_id:
                return user
        return None
    
    def get_active_users(self) -> List[dict]:
        """Get all active users"""
        return [user for user in self.users if user.get('active', False)]

# Function with potential issues
def divide_numbers(a, b):
    return a / b  # No zero division check

# Sample data for testing
sample_users = [
    {"id": 1, "name": "John Doe", "email": "john@example.com", "active": True},
    {"id": 2, "name": "Jane Smith", "email": "jane@example.com", "active": False},
    {"id": 3, "name": "Bob Johnson", "email": "bob@example.com", "active": True}
]