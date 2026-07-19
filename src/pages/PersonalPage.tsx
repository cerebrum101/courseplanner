import { useState, useCallback, useEffect } from 'react';
import Dashboard from '../molecules/Dashboard.jsx';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Edge,
  ColorMode,
  Panel,
  addEdge,
  Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '../styles/index.css';

import CourseNodes from '../atoms/components/CourseNode.jsx';
import OrNode from '../atoms/components/OrNode.jsx';
import CourseDashboard from '../organisms/CourseDashboard.jsx';
import ColorModeSelector from '../atoms/components/ColorModeSelector';
import { useCourseMap } from '../hooks/useCourseMap';
import { useCourseNodes } from '../hooks/useCourseNodes';
import { useCourseEdges } from '../hooks/useCourseEdges';
import { useNodeClick } from '../hooks/useNodeClick';
import { useReverseDependencyMap } from '../hooks/useReverseDependencyMap';
import { saveFlow, loadFlow, resetFlow } from '../utils/saveCourses';

const nodeTypes = {
  Course: CourseNodes,
  orNode: OrNode
};

interface UserDrawnEdge extends Edge {
  type: 'user-drawn';
}

export default function UserPlanPage() {
  const [addedCardsCodes, setAddedCardsCodes] = useState<string[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  
  const [currCourse, setCurrCourse] = useState<string>('');
  const [isDashboardVisible, setIsDashboardVisible] = useState(false);
  const [colorMode, setColorMode] = useState<ColorMode>('light');
  
  // ONLY Fall 2026 filter
  const [showOnlyFall2026, setShowOnlyFall2026] = useState(false);

  // Apply dark mode class to document
  useEffect(() => {
    if (colorMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [colorMode]);

  const onChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    setColorMode(evt.target.value as ColorMode);
  };

  const courseMap = useCourseMap();
  const reverseDependencyMap = useReverseDependencyMap();
  const handleNodeClick = useNodeClick(currCourse, setCurrCourse, setIsDashboardVisible);

  const handleNodesChange = useCallback((changes: any[]) => {
    onNodesChange(changes);
    const removedNodes = changes
      .filter((change: any) => change.type === 'remove')
      .map((change: any) => change.id);

    if (removedNodes.length > 0) {
      setAddedCardsCodes((prev: string[]) => {
        return prev.filter((code: string) => !removedNodes.includes(code));
      });
    }
  }, [onNodesChange]);

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      const newEdge: UserDrawnEdge = {
        ...params,
        id: `user-edge-${Date.now()}`,
        type: 'user-drawn',
      } as UserDrawnEdge;
      
      setEdges((eds: any[]) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  useCourseNodes(addedCardsCodes, nodes, courseMap, handleNodeClick, setNodes, setEdges);
  useCourseEdges(addedCardsCodes, courseMap, setEdges, setNodes);

  const handleToggleDashboard = () => {
    setIsDashboardVisible((prev) => !prev);
  };

  const handleSaveClick = () => { saveFlow(nodes, edges); };
  
  const handleRestoreClick = () => {
    const savedFlow = loadFlow();
    if (savedFlow && savedFlow.nodes.length > 0) {
      setNodes(savedFlow.nodes as any[]);
      setEdges(savedFlow.edges as any[]);
      setAddedCardsCodes(savedFlow.nodes.map((node: any) => node.id));
    }
  };
  
  const handleResetClick = () => {
    resetFlow();
    setAddedCardsCodes([]);
    setNodes([]);
    setEdges([]);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls style={{ zIndex: 50 }} />
          <Panel position="top-left" style={{ zIndex: 50 }}>
            <ColorModeSelector value={colorMode} onChange={onChange} />
          </Panel>
          
          <Panel position="top-right" className="flex gap-2" style={{ zIndex: 50 }}>
            <button onClick={handleSaveClick} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Save Flow</button>
            <button onClick={handleRestoreClick} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">Restore Flow</button>
            <button onClick={handleResetClick} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Reset Flow</button>
          </Panel>
        </ReactFlow>
      </div>
      
      <Dashboard
        addedCardsCodes={addedCardsCodes}
        setAddedCardsCodes={setAddedCardsCodes}
        showOnlyFall2026={showOnlyFall2026}
        setShowOnlyFall2026={setShowOnlyFall2026}
      />

      <CourseDashboard
        selctedCourseData={courseMap.get(currCourse)}
        isVisible={isDashboardVisible}
        onToggleVisibility={handleToggleDashboard}
        reverseDependencyMap={reverseDependencyMap}
        addedCardsCodes={addedCardsCodes}
        setAddedCardsCodes={setAddedCardsCodes}
      />
    </div>
  );
}