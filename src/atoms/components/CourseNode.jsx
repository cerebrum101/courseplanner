import React, { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import '../../styles/index.css';


import CourseDashboard from '../../organisms/CourseDashboard';



const CourseNode = memo(({ data }) => {


  function handleClick() {
    if (data.onNodeClick) {
      data.onNodeClick(data.label);
    }
  }

  return (
    <div className="border bg-white shadow-md rounded-md p-4 text-center relative min-w-[150px]"

    onClick={handleClick}
    >
      {/* Top Handle (Target only) */}
      <Handle 
        type="target" 
        position={Position.Top} 
        id="top-target"
        className="w-3 h-3 bg-blue-500"
      />

      <div className="font-semibold text-gray-800">{data.name}</div>
      {data.label && (
        <div className="text-sm text-gray-600">{data.label}</div>
      )}

      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="bottom-source"
        className="w-3 h-3 bg-blue-500"
      />

      <Handle 
        type="target" 
        position={Position.Bottom} 
        id="bottom-target"
        className="w-3 h-3 bg-blue-500"
      />
    </div>
  );
});

CourseNode.displayName = 'CourseNode';

export default CourseNode;