# AnyTool Backend Service

Python backend service layer for Creative Suite AI, enabling autonomous multi-tool orchestration with AnyTool integration.

## 📋 Overview

This backend service provides REST API endpoints for executing complex workflows using AnyTool, a powerful autonomous agent framework. It acts as a bridge between the React frontend and AnyTool's capabilities.

## 🚀 Quick Start

### Prerequisites

- **Python 3.12+** (required for AnyTool)
- **pip** package manager
- **Gemini API Key** with billing enabled

### Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   
   # On macOS/Linux:
   source venv/bin/activate
   
   # On Windows:
   venv\Scripts\activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Install AnyTool (Required for full functionality):**
   
   AnyTool must be installed separately from its GitHub repository:
   
   ```bash
   # Clone AnyTool repository
   git clone https://github.com/anthropics/anytool.git
   cd anytool
   
   # Install AnyTool
   pip install -e .
   
   # Return to backend directory
   cd ../backend
   ```
   
   **Note:** The current implementation provides a placeholder wrapper. Once AnyTool is installed, you'll need to update `anytool_wrapper.py` to integrate with the actual AnyTool library.

5. **Configure environment variables:**
   ```bash
   # Copy example environment file
   cp .env.example .env
   
   # Edit .env and add your Gemini API key
   nano .env  # or use your preferred editor
   ```
   
   Required environment variables:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

6. **Start the backend server:**
   ```bash
   python server.py
   ```
   
   The server will start on `http://localhost:5001`

### Verify Installation

Test the health endpoint:
```bash
curl http://localhost:5001/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "anytool-backend",
  "version": "1.0.0",
  "anytool_configured": true
}
```

## 🔧 Configuration

### Environment Variables

All configuration is managed through environment variables in the `.env` file:

| Variable | Default | Description |
|----------|---------|-------------|
| `GEMINI_API_KEY` | - | **Required**. Your Google Gemini API key |
| `PORT` | 5001 | Server port |
| `HOST` | 0.0.0.0 | Server host (0.0.0.0 allows external connections) |
| `DEBUG` | False | Enable Flask debug mode |
| `ANYTOOL_LOG_LEVEL` | INFO | Logging level (DEBUG, INFO, WARNING, ERROR) |
| `ANYTOOL_WORKSPACE` | /tmp/anytool_workspace | Directory for task workspaces |
| `CORS_ORIGINS` | http://localhost:3000,http://localhost:5173 | Allowed CORS origins |
| `MAX_CONCURRENT_TASKS` | 5 | Maximum concurrent workflow executions |
| `TASK_TIMEOUT` | 3600 | Task timeout in seconds (1 hour) |
| `WORKSPACE_RETENTION_HOURS` | 24 | How long to keep old workspaces |

## 📡 API Endpoints

### Health Check
```http
GET /api/health
```

Returns server status and configuration info.

**Response:**
```json
{
  "status": "healthy",
  "service": "anytool-backend",
  "version": "1.0.0",
  "anytool_configured": true
}
```

---

### Execute Workflow
```http
POST /api/anytool/execute
Content-Type: application/json
```

Execute an AnyTool workflow.

**Request Body:**
```json
{
  "task": "Generate a music video from 'dancing robot': 1. Create a story, 2. Generate 5 keyframe images, 3. Create video with Veo 3.1",
  "config": {
    "backend_scope": ["mcp", "shell", "web"],
    "enable_recording": true,
    "max_iterations": 10
  }
}
```

**Response (202 Accepted):**
```json
{
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "started_at": "2024-01-08T12:00:00Z",
  "response": null,
  "artifacts": [],
  "error": null
}
```

---

### Get Task Status
```http
GET /api/anytool/status/:taskId
```

Get the current status of a workflow execution.

**Response:**
```json
{
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "response": "Workflow completed successfully...",
  "artifacts": [
    {
      "type": "image",
      "name": "keyframe_1.png",
      "path": "/tmp/anytool_workspace/550e8400.../keyframe_1.png",
      "size": 102400
    }
  ],
  "error": null,
  "started_at": "2024-01-08T12:00:00Z",
  "completed_at": "2024-01-08T12:05:00Z"
}
```

**Status values:**
- `pending`: Task queued but not started
- `running`: Task currently executing
- `completed`: Task finished successfully
- `failed`: Task failed with error

---

### Get Execution Recording
```http
GET /api/anytool/recording/:taskId
```

Get detailed execution trajectory with screenshots and tool calls.

**Response:**
```json
{
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "trajectory": [
    {
      "step": 1,
      "action": "initialize",
      "timestamp": "2024-01-08T12:00:00Z",
      "description": "Initialized workflow",
      "screenshot": "base64_encoded_image_data"
    },
    {
      "step": 2,
      "action": "tool_call",
      "timestamp": "2024-01-08T12:01:00Z",
      "description": "Called image generation tool",
      "tool": "imagen",
      "params": {"prompt": "..."}
    }
  ],
  "artifacts": [...],
  "started_at": "2024-01-08T12:00:00Z",
  "completed_at": "2024-01-08T12:05:00Z",
  "status": "completed"
}
```

---

### Get Available Tools
```http
GET /api/anytool/tools
```

List all tools available to AnyTool.

**Response:**
```json
{
  "tools": [
    "mcp",
    "shell",
    "web",
    "filesystem",
    "python",
    "image_generation",
    "video_generation"
  ]
}
```

---

### Cancel Task
```http
POST /api/anytool/cancel/:taskId
```

Cancel a running workflow execution.

**Response:**
```json
{
  "success": true,
  "message": "Task 550e8400-e29b-41d4-a716-446655440000 cancelled successfully"
}
```

## 📝 Example Workflow Requests

### Example 1: Simple Story Generation
```bash
curl -X POST http://localhost:5001/api/anytool/execute \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Generate a short creative story about a time-traveling cat",
    "config": {
      "backend_scope": ["mcp"],
      "enable_recording": false
    }
  }'
```

### Example 2: Music Video Production
```bash
curl -X POST http://localhost:5001/api/anytool/execute \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Create a music video: 1. Generate story for 'cyberpunk city', 2. Create 5 keyframe images with Imagen, 3. Generate video with Veo 3.1, 4. Create thumbnail variations",
    "config": {
      "backend_scope": ["mcp", "shell", "web"],
      "enable_recording": true,
      "max_iterations": 20
    }
  }'
```

### Example 3: Check Status
```bash
curl http://localhost:5001/api/anytool/status/550e8400-e29b-41d4-a716-446655440000
```

## 🔧 Integration with AnyTool

### Current Implementation Status

The current implementation provides a **placeholder wrapper** that simulates AnyTool functionality. This allows the frontend to be developed and tested without requiring a full AnyTool installation.

### Enabling Full AnyTool Integration

To enable real AnyTool functionality:

1. **Install AnyTool** (see Installation section above)

2. **Update `anytool_wrapper.py`:**
   
   Replace the placeholder `_execute_workflow_async` method with actual AnyTool integration:
   
   ```python
   async def _execute_workflow_async(self, task_id, task, workspace, config_options):
       try:
           # Import AnyTool
           from anytool import Agent, Config
           
           # Initialize AnyTool agent
           agent = Agent(
               workspace=str(workspace),
               config=Config(
                   backend_scope=config_options.get('backend_scope', ['mcp']),
                   enable_recording=config_options.get('enable_recording', True),
                   max_iterations=config_options.get('max_iterations', 10)
               )
           )
           
           # Execute workflow
           result = await agent.execute(task)
           
           # Update task status
           self.tasks[task_id].status = 'completed'
           self.tasks[task_id].response = result.response
           self.tasks[task_id].artifacts = result.artifacts
           # ... etc
       except Exception as e:
           # Handle errors
           ...
   ```

3. **Test the integration:**
   ```bash
   # Start server
   python server.py
   
   # Test with a simple task
   curl -X POST http://localhost:5001/api/anytool/execute \
     -H "Content-Type: application/json" \
     -d '{"task": "List files in current directory"}'
   ```

## 🐛 Troubleshooting

### Issue: "GEMINI_API_KEY is required"
**Solution:** Ensure your `.env` file exists and contains a valid API key:
```bash
echo "GEMINI_API_KEY=your_key_here" > .env
```

### Issue: Port 5001 already in use
**Solution:** Change the port in `.env`:
```bash
echo "PORT=5002" >> .env
```

### Issue: CORS errors from frontend
**Solution:** Add your frontend URL to `CORS_ORIGINS` in `.env`:
```bash
echo "CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://your-url" >> .env
```

### Issue: ModuleNotFoundError for anytool
**Solution:** The placeholder implementation doesn't require AnyTool. For full functionality, install AnyTool as described in the Installation section.

### Issue: Workspace permission errors
**Solution:** Ensure the workspace directory is writable:
```bash
mkdir -p /tmp/anytool_workspace
chmod 755 /tmp/anytool_workspace
```

## 🔒 Security Considerations

1. **API Keys**: Never commit `.env` files to version control. The `.env.example` is provided as a template.

2. **CORS Origins**: In production, restrict `CORS_ORIGINS` to only trusted domains.

3. **Workspace Isolation**: Each task gets its own isolated workspace directory to prevent cross-contamination.

4. **Task Timeouts**: Configure `TASK_TIMEOUT` to prevent runaway workflows.

5. **Rate Limiting**: Consider adding rate limiting for production deployments.

## 📊 Monitoring and Logging

Logs are written to stdout with configurable levels:

```bash
# Enable debug logging
echo "ANYTOOL_LOG_LEVEL=DEBUG" >> .env

# View logs
python server.py
```

Log format:
```
2024-01-08 12:00:00 - server - INFO - Starting AnyTool backend server on 0.0.0.0:5001
2024-01-08 12:00:15 - anytool_wrapper - INFO - Starting workflow execution for task abc-123
2024-01-08 12:05:00 - anytool_wrapper - INFO - Workflow abc-123 completed successfully
```

## 🧪 Testing

### Manual Testing

1. **Health check:**
   ```bash
   curl http://localhost:5001/api/health
   ```

2. **Execute workflow:**
   ```bash
   curl -X POST http://localhost:5001/api/anytool/execute \
     -H "Content-Type: application/json" \
     -d '{"task": "Test task"}'
   ```

3. **Check status:**
   ```bash
   curl http://localhost:5001/api/anytool/status/<task_id>
   ```

### Automated Testing

Unit tests can be added in a `tests/` directory:

```bash
# Create tests directory
mkdir tests

# Run tests (once implemented)
python -m pytest tests/
```

## 🚀 Production Deployment

### Running with Gunicorn

For production, use Gunicorn instead of Flask's development server:

```bash
pip install gunicorn

# Run with 4 worker processes
gunicorn -w 4 -b 0.0.0.0:5001 server:app
```

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["python", "server.py"]
```

Build and run:
```bash
docker build -t creative-suite-backend .
docker run -p 5001:5001 --env-file .env creative-suite-backend
```

## 📚 Additional Resources

- [AnyTool Documentation](https://github.com/anthropics/anytool)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- Full AnyTool integration
- Unit and integration tests
- Rate limiting and authentication
- WebSocket support for real-time updates
- Task queue management (Celery, Redis)
- Database for persistent task history

## 📄 License

This backend service is part of Creative Suite AI and follows the same license.
