/**
 * AnyTool Service - Frontend API client
 * Handles communication with the AnyTool backend service
 */

import {
  WorkflowRequest,
  WorkflowResult,
  TrajectoryData,
  HealthStatus,
  ToolsResponse,
  CancelResponse,
} from '../types/anytool';

const API_BASE_URL = '/api';

/**
 * AnyTool Service Class
 * Provides methods for interacting with the AnyTool backend
 */
export class AnyToolService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Check if the backend service is available and healthy
   */
  async checkHealth(): Promise<HealthStatus> {
    const response = await fetch(`${this.baseUrl}/health`);
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(request: WorkflowRequest): Promise<WorkflowResult> {
    const response = await fetch(`${this.baseUrl}/anytool/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `Request failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get the status of a workflow execution
   */
  async getStatus(taskId: string): Promise<WorkflowResult> {
    const response = await fetch(`${this.baseUrl}/anytool/status/${taskId}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Task ${taskId} not found`);
      }
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `Request failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get the execution recording/trajectory for a task
   */
  async getRecording(taskId: string): Promise<TrajectoryData> {
    const response = await fetch(`${this.baseUrl}/anytool/recording/${taskId}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Recording for task ${taskId} not found`);
      }
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `Request failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get list of available tools
   */
  async getAvailableTools(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/anytool/tools`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `Request failed: ${response.statusText}`);
    }

    const data: ToolsResponse = await response.json();
    return data.tools;
  }

  /**
   * Cancel a running task
   */
  async cancelTask(taskId: string): Promise<CancelResponse> {
    const response = await fetch(`${this.baseUrl}/anytool/cancel/${taskId}`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `Request failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Poll task status until completion or failure
   * 
   * @param taskId - The task ID to poll
   * @param onProgress - Optional callback for status updates
   * @param pollInterval - Polling interval in milliseconds (default: 2000)
   * @param timeout - Maximum time to poll in milliseconds (default: 300000 = 5 minutes)
   */
  async pollStatus(
    taskId: string,
    onProgress?: (result: WorkflowResult) => void,
    pollInterval: number = 2000,
    timeout: number = 300000
  ): Promise<WorkflowResult> {
    const startTime = Date.now();

    while (true) {
      // Check timeout
      if (Date.now() - startTime > timeout) {
        throw new Error('Polling timeout exceeded');
      }

      // Get current status
      const result = await this.getStatus(taskId);

      // Call progress callback if provided
      if (onProgress) {
        onProgress(result);
      }

      // Check if task is complete
      if (result.status === 'completed' || result.status === 'failed' || result.status === 'cancelled') {
        return result;
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }

  /**
   * Check if backend is available
   * Returns true if backend is reachable, false otherwise
   */
  async isBackendAvailable(): Promise<boolean> {
    try {
      await this.checkHealth();
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const anytoolService = new AnyToolService();

// Export class for custom instances
export default AnyToolService;
