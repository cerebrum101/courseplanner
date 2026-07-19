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
  const [colorMode, setColorMode] = useState<ColorMode>('light');
  
  // ONLY Fall 2026
  const [showOnlyFall2026, setShowOnlyFall2026] = useState(false);

  // LIFTED STATE: Parent controls BOTH dashboards to slide UI correctly
  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const [isRightOpen, setIsRightOpen] = useState(true);

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
  const handleNodeClick = useNodeClick(currCourse, setCurrCourse, setIsLeftOpen);

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

  const handleSaveClick = () => { saveFlow(nodes, edges); };
  const handleRestoreClick = () => {
    const savedFlow = loadFlow();
    if (savedFlow && savedFlow.nodes.length > 0) {
      setAddedCardsCodes(savedFlow.nodes.map((node: any) => node.id));
      setNodes(savedFlow.nodes as any[]);
      setEdges(savedFlow.edges as any[]);
    }
  };
  const handleResetClick = () => {
    resetFlow();
    setAddedCardsCodes([]);
    setNodes([]);
    setEdges([]);
  };

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="flex-1 relative h-full min-w-0">
        <ReactFlow
          className="w-full h-full touch-pan-x touch-pan-y"
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          
          <Controls
            className={`planner-controls !shadow-md transition-all duration-300 ${
              isLeftOpen ? 'md:!left-[calc(25%+20px)]' : ''
            }`}
          />
          
          <Panel
            position="top-left"
            className={`planner-panel-left transition-all duration-300 max-md:!left-2 max-md:!top-14 ${
              isLeftOpen ? 'md:!left-[calc(25%+20px)]' : 'max-md:!left-2'
            }`}
          >
            <ColorModeSelector value={colorMode} onChange={onChange} />
          </Panel>
          
          <Panel
            position="top-right"
            className={`flex flex-col sm:flex-row gap-1 sm:gap-2 max-w-[calc(100vw-3rem)] transition-all duration-300 max-md:!right-2 max-md:!top-14 ${
              isRightOpen ? 'md:!right-[calc(25%+20px)]' : 'max-md:!right-2'
            }`}
          >
            <button onClick={handleSaveClick} className="px-2 py-1.5 sm:px-3 sm:py-1 text-xs sm:text-sm bg-blue-500 text-white rounded hover:bg-blue-600 touch-manipulation whitespace-nowrap">Save Flow</button>
            <button onClick={handleRestoreClick} className="px-2 py-1.5 sm:px-3 sm:py-1 text-xs sm:text-sm bg-green-500 text-white rounded hover:bg-green-600 touch-manipulation whitespace-nowrap">Restore Flow</button>
            <button onClick={handleResetClick} className="px-2 py-1.5 sm:px-3 sm:py-1 text-xs sm:text-sm bg-red-500 text-white rounded hover:bg-red-600 touch-manipulation whitespace-nowrap">Reset Flow</button>
          </Panel>
        </ReactFlow>
      </div>
      
      <Dashboard
        addedCardsCodes={addedCardsCodes}
        setAddedCardsCodes={setAddedCardsCodes}
        showOnlyFall2026={showOnlyFall2026}
        setShowOnlyFall2026={setShowOnlyFall2026}
        isOpen={isRightOpen}
        setIsOpen={setIsRightOpen}
      />

      <CourseDashboard
        selctedCourseData={courseMap.get(currCourse)}
        reverseDependencyMap={reverseDependencyMap}
        addedCardsCodes={addedCardsCodes}
        setAddedCardsCodes={setAddedCardsCodes}
        isOpen={isLeftOpen}
        setIsOpen={setIsLeftOpen}
      />
    </div>
  );
}