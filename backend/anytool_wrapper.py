"""
AnyTool Wrapper Module
Provides a wrapper class for interacting with the AnyTool library
"""

import asyncio
import logging
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict

from config import config

# Configure logging
logging.basicConfig(
    level=getattr(logging, config.ANYTOOL_LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class WorkflowResult:
    """Result of a workflow execution"""
    task_id: str
    status: str  # 'pending', 'running', 'completed', 'failed'
    response: Optional[str] = None
    artifacts: List[Dict[str, Any]] = None
    error: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    trajectory: Optional[List[Dict[str, Any]]] = None
    
    def __post_init__(self):
        if self.artifacts is None:
            self.artifacts = []
        if self.trajectory is None:
            self.trajectory = []
    
    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization"""
        return asdict(self)


class AnyToolWrapper:
    """
    Wrapper class for AnyTool integration
    
    This class provides a high-level interface for executing workflows,
    managing tasks, and retrieving execution recordings.
    
    Note: This is a placeholder implementation. The actual AnyTool integration
    requires the AnyTool library to be installed and properly configured.
    See backend/README.md for installation instructions.
    """
    
    def __init__(self):
        self.tasks: Dict[str, WorkflowResult] = {}
        self.running_tasks: Dict[str, asyncio.Task] = {}
        logger.info("AnyToolWrapper initialized")
    
    async def execute_workflow(
        self,
        task: str,
        config_options: Optional[Dict[str, Any]] = None
    ) -> WorkflowResult:
        """
        Execute an AnyTool workflow
        
        Args:
            task: The task description/prompt for AnyTool
            config_options: Optional configuration including:
                - backend_scope: List of allowed backends (e.g., ['mcp', 'shell', 'web'])
                - enable_recording: Whether to record execution trajectory
                - max_iterations: Maximum number of iterations
        
        Returns:
            WorkflowResult with task_id and initial status
        """
        task_id = str(uuid.uuid4())
        workspace = config.get_task_workspace(task_id)
        
        logger.info(f"Starting workflow execution for task {task_id}")
        logger.debug(f"Task: {task}")
        logger.debug(f"Config: {config_options}")
        
        # Initialize result
        result = WorkflowResult(
            task_id=task_id,
            status='pending',
            started_at=datetime.utcnow().isoformat()
        )
        self.tasks[task_id] = result
        
        # Start async task execution
        async_task = asyncio.create_task(
            self._execute_workflow_async(task_id, task, workspace, config_options)
        )
        self.running_tasks[task_id] = async_task
        
        return result
    
    async def _execute_workflow_async(
        self,
        task_id: str,
        task: str,
        workspace: Path,
        config_options: Optional[Dict[str, Any]]
    ):
        """
        Internal async method for workflow execution
        
        This is where the actual AnyTool integration would happen.
        For now, this is a placeholder that simulates workflow execution.
        """
        try:
            result = self.tasks[task_id]
            result.status = 'running'
            
            logger.info(f"Executing workflow for task {task_id}")
            
            # Placeholder: In a real implementation, this would:
            # 1. Initialize AnyTool with the provided configuration
            # 2. Execute the workflow
            # 3. Capture recordings and artifacts
            # 4. Handle errors and retries
            
            # Simulate work
            await asyncio.sleep(2)
            
            # Placeholder response
            result.status = 'completed'
            result.response = (
                f"Workflow completed successfully. "
                f"This is a placeholder implementation. "
                f"To enable full AnyTool functionality, please install AnyTool "
                f"and update this wrapper. See backend/README.md for details."
            )
            result.completed_at = datetime.utcnow().isoformat()
            
            # Placeholder artifacts
            result.artifacts = [
                {
                    'type': 'text',
                    'name': 'execution_log.txt',
                    'path': str(workspace / 'execution_log.txt'),
                    'size': 0
                }
            ]
            
            # Placeholder trajectory
            result.trajectory = [
                {
                    'step': 1,
                    'action': 'initialize',
                    'timestamp': datetime.utcnow().isoformat(),
                    'description': 'Workflow initialized'
                },
                {
                    'step': 2,
                    'action': 'execute',
                    'timestamp': datetime.utcnow().isoformat(),
                    'description': 'Task executed (placeholder)'
                }
            ]
            
            logger.info(f"Workflow {task_id} completed successfully")
            
        except Exception as e:
            logger.error(f"Error executing workflow {task_id}: {str(e)}", exc_info=True)
            result.status = 'failed'
            result.error = str(e)
            result.completed_at = datetime.utcnow().isoformat()
        
        finally:
            # Clean up running task reference
            if task_id in self.running_tasks:
                del self.running_tasks[task_id]
    
    async def get_status(self, task_id: str) -> Optional[WorkflowResult]:
        """
        Get the status of a workflow execution
        
        Args:
            task_id: The unique task identifier
        
        Returns:
            WorkflowResult or None if task not found
        """
        return self.tasks.get(task_id)
    
    async def get_recording(self, task_id: str) -> Optional[Dict[str, Any]]:
        """
        Get the execution recording/trajectory for a task
        
        Args:
            task_id: The unique task identifier
        
        Returns:
            Dictionary containing trajectory data or None if not found
        """
        result = self.tasks.get(task_id)
        if not result:
            return None
        
        return {
            'task_id': task_id,
            'trajectory': result.trajectory,
            'artifacts': result.artifacts,
            'started_at': result.started_at,
            'completed_at': result.completed_at,
            'status': result.status
        }
    
    async def get_available_tools(self) -> List[str]:
        """
        Get list of available tools that AnyTool can use
        
        Returns:
            List of tool names
        """
        # Placeholder: In real implementation, this would query AnyTool
        return [
            'mcp',
            'shell',
            'web',
            'filesystem',
            'python',
            'image_generation',
            'video_generation'
        ]
    
    async def cancel_task(self, task_id: str) -> bool:
        """
        Cancel a running task
        
        Args:
            task_id: The unique task identifier
        
        Returns:
            True if task was cancelled, False otherwise
        """
        if task_id in self.running_tasks:
            task = self.running_tasks[task_id]
            task.cancel()
            
            result = self.tasks.get(task_id)
            if result:
                result.status = 'cancelled'
                result.completed_at = datetime.utcnow().isoformat()
            
            logger.info(f"Task {task_id} cancelled")
            return True
        
        return False
    
    async def cleanup_old_workspaces(self):
        """
        Clean up old workspace directories based on retention policy
        """
        try:
            import time
            from datetime import timedelta
            
            retention_seconds = config.WORKSPACE_RETENTION_HOURS * 3600
            current_time = time.time()
            
            for workspace_dir in config.ANYTOOL_WORKSPACE.iterdir():
                if workspace_dir.is_dir():
                    age = current_time - workspace_dir.stat().st_mtime
                    if age > retention_seconds:
                        import shutil
                        shutil.rmtree(workspace_dir)
                        logger.info(f"Cleaned up old workspace: {workspace_dir}")
        
        except Exception as e:
            logger.error(f"Error cleaning up workspaces: {str(e)}", exc_info=True)


# Global instance
anytool_wrapper = AnyToolWrapper()
