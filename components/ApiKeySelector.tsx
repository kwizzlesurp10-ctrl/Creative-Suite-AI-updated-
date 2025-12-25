import React from 'react';

/**
 * Component for prompting users to select an API key
 * Only displays when API key is not configured
 */
interface ApiKeySelectorProps {
  apiKeySelected: boolean;
  onSelectApiKey: () => void;
  featureName: string;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ apiKeySelected, onSelectApiKey, featureName }) => {
  if (apiKeySelected) {
    return null;
  }

  return (
    <div className="bg-[#ff00ff]/20 border border-[#ff00ff] text-[#f8bbd0] px-4 py-3 rounded-lg relative my-4 text-center" role="alert">
      <strong className="font-bold block text-lg">API Key Required</strong>
      <span className="block sm:inline mt-2">To use the {featureName}, you must select an API key. This feature requires a project with billing enabled.</span>
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={onSelectApiKey}
          className="bg-[#ff00ff] hover:bg-[#e600e6] text-[#0d0c1c] font-bold py-2 px-4 rounded-lg transition-colors"
          aria-label="Select API key for video generation"
        >
          Select API Key
        </button>
        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[#00ff00] hover:text-[#99ff99] underline"
          aria-label="Learn about Gemini API billing (opens in new tab)"
        >
          Learn about billing
        </a>
      </div>
    </div>
  );
};

export default ApiKeySelector;