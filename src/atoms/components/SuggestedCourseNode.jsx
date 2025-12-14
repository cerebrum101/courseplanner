import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import '../../styles/index.css';

const SuggestedCourseNode = memo(({ data }) => {
  function handleAddClick(e) {
    e.stopPropagation(); // Prevent node click
    if (data.onAddSuggested) {
      data.onAddSuggested(data.label);
    }
  }

  return (
    <div 
      className="border-2 border-dashed border-gray-400 bg-gray-100 shadow-md rounded-md p-4 text-center relative min-w-[150px] opacity-70"
      style={{ borderColor: '#9CA3AF' }}
    >
      {/* Top Handle (Target only) */}
      <Handle 
        type="target" 
        position={Position.Top} 
        id="top-target"
        className="w-3 h-3 bg-gray-400"
      />

      <div className="font-semibold text-gray-600">{data.name}</div>
      {data.label && (
        <div className="text-sm text-gray-500">{data.label}</div>
      )}
      
      {/* Add Suggested Button */}
      <button
        onClick={handleAddClick}
        className="mt-2 px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded transition-colors"
      >
        Add Suggested
      </button>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="bottom-source"
        className="w-3 h-3 bg-gray-400"
      />

      <Handle 
        type="target" 
        position={Position.Bottom} 
        id="bottom-target"
        className="w-3 h-3 bg-gray-400"
      />
    </div>
  );
});

SuggestedCourseNode.displayName = 'SuggestedCourseNode';

export default SuggestedCourseNode;

