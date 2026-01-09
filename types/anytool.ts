/**
 * AnyTool TypeScript type definitions
 * Provides type safety for backend API integration
 */

export interface WorkflowRequest {
  task: string;
  config?: AnyToolConfig;
}

export interface AnyToolConfig {
  backend_scope?: string[];
  enable_recording?: boolean;
  max_iterations?: number;
}

export interface Artifact {
  type: string;
  name: string;
  path: string;
  size: number;
  url?: string;
}

export interface TrajectoryStep {
  step: number;
  action: string;
  timestamp: string;
  description: string;
  screenshot?: string;
  tool?: string;
  params?: any;
  result?: any;
}

export interface WorkflowResult {
  task_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  response?: string;
  artifacts?: Artifact[];
  error?: string;
  started_at?: string;
  completed_at?: string;
  trajectory?: TrajectoryStep[];
}

export interface TrajectoryData {
  task_id: string;
  trajectory: TrajectoryStep[];
  artifacts: Artifact[];
  started_at?: string;
  completed_at?: string;
  status: string;
}

export interface HealthStatus {
  status: string;
  service: string;
  version: string;
  anytool_configured: boolean;
}

export interface ToolsResponse {
  tools: string[];
}

export interface CancelResponse {
  success: boolean;
  message: string;
}
