/**
 * TrajectoryViewer Component
 * Displays step-by-step execution timeline with screenshots and tool calls
 */

import React, { useState } from 'react';
import { TrajectoryData, TrajectoryStep } from '../types/anytool';

interface TrajectoryViewerProps {
  trajectoryData: TrajectoryData | null;
  isLoading?: boolean;
}

const TrajectoryViewer: React.FC<TrajectoryViewerProps> = ({ trajectoryData, isLoading }) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (stepNumber: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepNumber)) {
      newExpanded.delete(stepNumber);
    } else {
      newExpanded.add(stepNumber);
    }
    setExpandedSteps(newExpanded);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    } catch {
      return timestamp;
    }
  };

  const getStepIcon = (action: string) => {
    switch (action) {
      case 'initialize':
        return '🚀';
      case 'tool_call':
        return '🔧';
      case 'execute':
        return '⚙️';
      case 'complete':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '📋';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#1a183d]/60 border border-[#ff00ff]/30 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-[#00ff00]">Execution Trajectory</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ff00]"></div>
          <span className="ml-3 text-[#a09cc9]">Loading trajectory...</span>
        </div>
      </div>
    );
  }

  if (!trajectoryData) {
    return (
      <div className="bg-[#1a183d]/60 border border-[#ff00ff]/30 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-[#00ff00]">Execution Trajectory</h3>
        <p className="text-[#a09cc9]">No trajectory data available.</p>
      </div>
    );
  }

  const { trajectory, artifacts, started_at, completed_at, status } = trajectoryData;

  return (
    <div className="bg-[#1a183d]/60 border border-[#ff00ff]/30 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-[#00ff00]">Execution Trajectory</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          status === 'completed' ? 'bg-green-500/20 text-green-400' :
          status === 'failed' ? 'bg-red-500/20 text-red-400' :
          status === 'running' ? 'bg-blue-500/20 text-blue-400' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {status}
        </span>
      </div>

      {/* Execution Metadata */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        {started_at && (
          <div>
            <span className="text-[#6a669a]">Started:</span>
            <span className="ml-2 text-[#e0e0ff]">{formatTimestamp(started_at)}</span>
          </div>
        )}
        {completed_at && (
          <div>
            <span className="text-[#6a669a]">Completed:</span>
            <span className="ml-2 text-[#e0e0ff]">{formatTimestamp(completed_at)}</span>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-4 mb-6">
        {trajectory && trajectory.length > 0 ? (
          trajectory.map((step: TrajectoryStep) => (
            <div key={step.step} className="border-l-2 border-[#ff00ff]/50 pl-4">
              <div 
                className="cursor-pointer hover:bg-[#2a275c]/50 p-3 rounded transition-colors"
                onClick={() => toggleStep(step.step)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{getStepIcon(step.action)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-[#00ff00]">Step {step.step}</span>
                        <span className="text-xs text-[#6a669a]">
                          {formatTimestamp(step.timestamp)}
                        </span>
                      </div>
                      <p className="text-[#e0e0ff]">{step.description}</p>
                      {step.tool && (
                        <span className="inline-block mt-2 px-2 py-1 bg-[#ff00ff]/20 text-[#ff00ff] text-xs rounded">
                          {step.tool}
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="text-[#a09cc9] hover:text-[#00ff00] transition-colors">
                    {expandedSteps.has(step.step) ? '▼' : '▶'}
                  </button>
                </div>

                {/* Expanded Details */}
                {expandedSteps.has(step.step) && (
                  <div className="mt-3 pl-11 space-y-3">
                    {step.params && (
                      <div>
                        <h4 className="text-sm font-medium text-[#ff00ff] mb-1">Parameters:</h4>
                        <pre className="bg-[#0d0c1c] p-2 rounded text-xs overflow-x-auto">
                          {JSON.stringify(step.params, null, 2)}
                        </pre>
                      </div>
                    )}
                    {step.result && (
                      <div>
                        <h4 className="text-sm font-medium text-[#ff00ff] mb-1">Result:</h4>
                        <pre className="bg-[#0d0c1c] p-2 rounded text-xs overflow-x-auto">
                          {JSON.stringify(step.result, null, 2)}
                        </pre>
                      </div>
                    )}
                    {step.screenshot && (
                      <div>
                        <h4 className="text-sm font-medium text-[#ff00ff] mb-1">Screenshot:</h4>
                        <img 
                          src={`data:image/png;base64,${step.screenshot}`}
                          alt={`Step ${step.step} screenshot`}
                          className="rounded border border-[#ff00ff]/30 max-w-full"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-[#a09cc9] text-center py-4">No trajectory steps recorded.</p>
        )}
      </div>

      {/* Artifacts */}
      {artifacts && artifacts.length > 0 && (
        <div className="border-t border-[#ff00ff]/30 pt-4">
          <h4 className="text-lg font-semibold text-[#00ff00] mb-3">Generated Artifacts</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {artifacts.map((artifact, index) => (
              <div 
                key={index}
                className="bg-[#0d0c1c] border border-[#ff00ff]/30 rounded-lg p-3 hover:border-[#00ff00]/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-[#e0e0ff] truncate">{artifact.name}</p>
                    <p className="text-xs text-[#6a669a] mt-1">
                      Type: {artifact.type} • Size: {(artifact.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  {artifact.url && (
                    <a
                      href={artifact.url}
                      download={artifact.name}
                      className="ml-2 text-[#00ff00] hover:text-[#ff00ff] transition-colors"
                      title="Download"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrajectoryViewer;
