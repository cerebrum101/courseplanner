import { useState, ChangeEventHandler, useEffect, useCallback } from 'react';
import Dashboard from '../molecules/Dashboard.jsx'
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Edge,
  ColorMode,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '../styles/index.css';

import CourseNodes from '../atoms/components/CourseNode.jsx';
import CourseDashboard from '../organisms/CourseDashboard.jsx';
import ColorModeSelector from '../atoms/components/ColorModeSelector';
import { CourseNode } from '../atoms/types/course.types';
import { useCourseMap } from '../hooks/useCourseMap';
import { useCourseNodes } from '../hooks/useCourseNodes';
import { useCourseEdges } from '../hooks/useCourseEdges';
import { useNodeClick } from '../hooks/useNodeClick';
import { useNodesChange } from '../hooks/useNodesChange';
import { saveFlow, loadFlow, resetFlow } from '../utils/saveCourses';

const nodeTypes = {
  Course: CourseNodes
};

export default function UserPlanPage() {
  const [addedCardsCodes, setAddedCardsCodes] = useState<string[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState<CourseNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [currCourse, setCurrCourse] = useState('');
  const [isDashboardVisible, setIsDashboardVisible] = useState(false);
  const [colorMode, setColorMode] = useState<ColorMode>('light');
  
  const onChange: ChangeEventHandler<HTMLSelectElement> = (evt) => {
    setColorMode(evt.target.value as ColorMode);
  };

  const courseMap = useCourseMap();
  const handleNodeClick = useNodeClick(currCourse, setCurrCourse, setIsDashboardVisible);
  
  // Modified handleNodesChange to properly handle course state
  const handleNodesChange = useCallback((changes: any[]) => {
    onNodesChange(changes);
    
    // Update addedCardsCodes based on node changes
    const removedNodes = changes
      .filter(change => change.type === 'remove')
      .map(change => change.id);
    
    if (removedNodes.length > 0) {
      setAddedCardsCodes(prev => {
        const newCodes = prev.filter(code => !removedNodes.includes(code));
        return newCodes;
      });
    }
  }, [onNodesChange]);

  // Update nodes when addedCardsCodes changes
  useCourseNodes(addedCardsCodes, nodes, courseMap, handleNodeClick, setNodes, setEdges);
  
  // Generate edges based on prerequisites and corequisites
  useCourseEdges(addedCardsCodes, courseMap, setEdges);

  const handleToggleDashboard = () => {
    setIsDashboardVisible(prev => !prev);
  };

  // Custom handlers for the buttons
  const handleSaveClick = () => {
    saveFlow(nodes, edges);
  };

  const handleRestoreClick = () => {
    const savedFlow = loadFlow();
    if (savedFlow.nodes.length > 0) {
      const courses = savedFlow.nodes.map(node => node.id);
      setAddedCardsCodes(courses);
      setNodes(savedFlow.nodes as CourseNode[]);
      setEdges(savedFlow.edges);
    }
  };

  const handleResetClick = () => {
    resetFlow();
    setAddedCardsCodes([]);
    setNodes([]);
    setEdges([]);
  };

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={handleNodesChange}
      onEdgesChange={onEdgesChange}
      fitView
      nodesDraggable={true}
      nodeTypes={nodeTypes}
      colorMode={colorMode}
    >
      <Background />
      <Controls />
      <CourseDashboard 
        selctedCourseData={courseMap.get(currCourse)}
        isVisible={isDashboardVisible}
        onToggleVisibility={handleToggleDashboard}
      />
      <Dashboard 
        addedCardsCodes={addedCardsCodes}
        setAddedCardsCodes={setAddedCardsCodes}
      />
      <Panel position="bottom-left">
        <ColorModeSelector onChange={onChange} value={colorMode} />
      </Panel>
      <Panel position="bottom-right" className="flow-controls">
        <div className="flex gap-2">
          <button
            onClick={handleSaveClick}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Save Flow
          </button>
          <button
            onClick={handleRestoreClick}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Restore Flow
          </button>
          <button
            onClick={handleResetClick}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Reset Flow
          </button>
        </div>
      </Panel>
    </ReactFlow>
  );
}