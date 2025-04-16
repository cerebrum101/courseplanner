import { useState, useEffect, useMemo, useCallback, ChangeEventHandler } from 'react';
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
import { Course, CourseNode } from '../atoms/types/course.types';
import { useCourseMap } from '../hooks/useCourseMap';
import { useCourseNodes } from '../hooks/useCourseNodes';
import { useCourseEdges } from '../hooks/useCourseEdges';
import { useNodeClick } from '../hooks/useNodeClick';
import { useNodesChange } from '../hooks/useNodesChange';

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
  const handleNodesChange = useNodesChange(onNodesChange, setAddedCardsCodes);
  
  // Update nodes when addedCardsCodes changes
  useCourseNodes(addedCardsCodes, nodes, courseMap, handleNodeClick, setNodes);
  
  // Generate edges based on prerequisites and corequisites
  useCourseEdges(addedCardsCodes, courseMap, setEdges);

  const handleToggleDashboard = () => {
    setIsDashboardVisible(prev => !prev);
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
    </ReactFlow>
  );
}