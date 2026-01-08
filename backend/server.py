"""
Flask Server for AnyTool Backend Service
Provides REST API endpoints for workflow execution and management
"""

import asyncio
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS

from config import config
from anytool_wrapper import anytool_wrapper

# Configure logging
logging.basicConfig(
    level=getattr(logging, config.ANYTOOL_LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Enable CORS
CORS(app, origins=config.CORS_ORIGINS, supports_credentials=True)


@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    Returns server status and basic configuration info
    """
    return jsonify({
        'status': 'healthy',
        'service': 'anytool-backend',
        'version': '1.0.0',
        'anytool_configured': True  # Update when real AnyTool is integrated
    }), 200


@app.route('/api/anytool/execute', methods=['POST'])
async def execute_workflow():
    """
    Execute an AnyTool workflow
    
    Request body:
    {
        "task": "string (required) - The workflow task description",
        "config": {
            "backend_scope": ["mcp", "shell", "web"],
            "enable_recording": true,
            "max_iterations": 10
        }
    }
    
    Response:
    {
        "task_id": "string - Unique task identifier",
        "status": "string - pending/running/completed/failed",
        "response": "string - Workflow response (when completed)",
        "artifacts": [...],
        "error": "string - Error message (if failed)"
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'task' not in data:
            return jsonify({
                'error': 'Missing required field: task'
            }), 400
        
        task = data['task']
        config_options = data.get('config', {})
        
        # Validate task
        if not isinstance(task, str) or not task.strip():
            return jsonify({
                'error': 'Task must be a non-empty string'
            }), 400
        
        logger.info(f"Received workflow execution request: {task[:100]}...")
        
        # Execute workflow
        result = await anytool_wrapper.execute_workflow(task, config_options)
        
        return jsonify(result.to_dict()), 202
    
    except Exception as e:
        logger.error(f"Error in execute_workflow: {str(e)}", exc_info=True)
        return jsonify({
            'error': f'Internal server error: {str(e)}'
        }), 500


@app.route('/api/anytool/status/<task_id>', methods=['GET'])
async def get_task_status(task_id: str):
    """
    Get the status of a workflow execution
    
    Response:
    {
        "task_id": "string",
        "status": "string - pending/running/completed/failed",
        "response": "string - Workflow response (when completed)",
        "artifacts": [...],
        "error": "string - Error message (if failed)",
        "started_at": "ISO timestamp",
        "completed_at": "ISO timestamp"
    }
    """
    try:
        result = await anytool_wrapper.get_status(task_id)
        
        if not result:
            return jsonify({
                'error': f'Task {task_id} not found'
            }), 404
        
        return jsonify(result.to_dict()), 200
    
    except Exception as e:
        logger.error(f"Error in get_task_status: {str(e)}", exc_info=True)
        return jsonify({
            'error': f'Internal server error: {str(e)}'
        }), 500


@app.route('/api/anytool/recording/<task_id>', methods=['GET'])
async def get_task_recording(task_id: str):
    """
    Get the execution recording/trajectory for a task
    
    Response:
    {
        "task_id": "string",
        "trajectory": [
            {
                "step": 1,
                "action": "string",
                "timestamp": "ISO timestamp",
                "description": "string",
                "screenshot": "base64 encoded image (optional)"
            }
        ],
        "artifacts": [...],
        "started_at": "ISO timestamp",
        "completed_at": "ISO timestamp",
        "status": "string"
    }
    """
    try:
        recording = await anytool_wrapper.get_recording(task_id)
        
        if not recording:
            return jsonify({
                'error': f'Recording for task {task_id} not found'
            }), 404
        
        return jsonify(recording), 200
    
    except Exception as e:
        logger.error(f"Error in get_task_recording: {str(e)}", exc_info=True)
        return jsonify({
            'error': f'Internal server error: {str(e)}'
        }), 500


@app.route('/api/anytool/tools', methods=['GET'])
async def get_available_tools():
    """
    Get list of available tools
    
    Response:
    {
        "tools": ["tool1", "tool2", ...]
    }
    """
    try:
        tools = await anytool_wrapper.get_available_tools()
        return jsonify({
            'tools': tools
        }), 200
    
    except Exception as e:
        logger.error(f"Error in get_available_tools: {str(e)}", exc_info=True)
        return jsonify({
            'error': f'Internal server error: {str(e)}'
        }), 500


@app.route('/api/anytool/cancel/<task_id>', methods=['POST'])
async def cancel_task(task_id: str):
    """
    Cancel a running task
    
    Response:
    {
        "success": true/false,
        "message": "string"
    }
    """
    try:
        success = await anytool_wrapper.cancel_task(task_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': f'Task {task_id} cancelled successfully'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': f'Task {task_id} not found or not running'
            }), 404
    
    except Exception as e:
        logger.error(f"Error in cancel_task: {str(e)}", exc_info=True)
        return jsonify({
            'error': f'Internal server error: {str(e)}'
        }), 500


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'error': 'Endpoint not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {str(error)}", exc_info=True)
    return jsonify({
        'error': 'Internal server error'
    }), 500


def main():
    """Main entry point for the server"""
    try:
        # Validate configuration
        config.validate()
        logger.info("Configuration validated successfully")
        
        # Start server
        logger.info(f"Starting AnyTool backend server on {config.HOST}:{config.PORT}")
        logger.info(f"CORS enabled for origins: {config.CORS_ORIGINS}")
        
        app.run(
            host=config.HOST,
            port=config.PORT,
            debug=config.DEBUG
        )
    
    except ValueError as e:
        logger.error(f"Configuration error: {str(e)}")
        print(f"\n❌ Configuration Error: {str(e)}")
        print("Please check your .env file and ensure all required variables are set.")
        print("See backend/.env.example for reference.\n")
        exit(1)
    
    except Exception as e:
        logger.error(f"Failed to start server: {str(e)}", exc_info=True)
        print(f"\n❌ Failed to start server: {str(e)}\n")
        exit(1)


if __name__ == '__main__':
    main()
