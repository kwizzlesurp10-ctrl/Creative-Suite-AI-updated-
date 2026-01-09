"""
Backend configuration module
Handles environment variables and application settings
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Application configuration"""
    
    # API Keys
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    
    # Server settings
    PORT = int(os.getenv('PORT', 5001))
    HOST = os.getenv('HOST', '0.0.0.0')
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    
    # AnyTool settings
    ANYTOOL_LOG_LEVEL = os.getenv('ANYTOOL_LOG_LEVEL', 'INFO')
    ANYTOOL_WORKSPACE = Path(os.getenv('ANYTOOL_WORKSPACE', '/tmp/anytool_workspace'))
    
    # CORS settings
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:5173').split(',')
    
    # Task management
    MAX_CONCURRENT_TASKS = int(os.getenv('MAX_CONCURRENT_TASKS', 5))
    TASK_TIMEOUT = int(os.getenv('TASK_TIMEOUT', 3600))  # 1 hour default
    
    # Workspace cleanup
    WORKSPACE_RETENTION_HOURS = int(os.getenv('WORKSPACE_RETENTION_HOURS', 24))
    
    @classmethod
    def validate(cls):
        """Validate required configuration"""
        if not cls.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is required. Please set it in your .env file.")
        
        # Create workspace directory if it doesn't exist
        cls.ANYTOOL_WORKSPACE.mkdir(parents=True, exist_ok=True)
    
    @classmethod
    def get_task_workspace(cls, task_id: str) -> Path:
        """Get workspace directory for a specific task"""
        workspace = cls.ANYTOOL_WORKSPACE / task_id
        workspace.mkdir(parents=True, exist_ok=True)
        return workspace


# Export singleton config
config = Config()
