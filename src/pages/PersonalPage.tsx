import { useState, ChangeEventHandler, useCallback } from 'react'; // Import useEffect
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
  addEdge, // Import addEdge
  Connection, // Import Connection type
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '../styles/index.css';

import CourseNodes from '../atoms/components/CourseNode.jsx';
import OrNode from '../atoms/components/OrNode.jsx';
import CourseDashboard from '../organisms/CourseDashboard.jsx';
import ColorModeSelector from '../atoms/components/ColorModeSelector';
import { CourseNode } from '../atoms/types/course.types';
import { useCourseMap } from '../hooks/useCourseMap';
import { useCourseNodes } from '../hooks/useCourseNodes';
import { useCourseEdges } from '../hooks/useCourseEdges';
import { useNodeClick } from '../hooks/useNodeClick';
// import { useNodesChange } from '../hooks/useNodesChange';
import { saveFlow, loadFlow, resetFlow } from '../utils/saveCourses';

const nodeTypes = {
  Course: CourseNodes,
  orNode: OrNode
};

// Define a type for user-drawn edges (optional but good practice)
// You could add more properties here if needed later
interface UserDrawnEdge extends Edge {
  type: 'user-drawn';
  // Add other custom properties if necessary
}

interface OrNode extends Node {
  id: string;
  type: 'orNode';
  data: {
    label: string;
    name: string;
    onNodeClick: (nodeId: string) => void;
  };
}

type FlowNode = CourseNode | OrNode;

export default function UserPlanPage() {
  const [addedCardsCodes, setAddedCardsCodes] = useState<string[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge | UserDrawnEdge>([]);
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

  // --- Add the onConnect handler for manual edge creation ---
  const onConnect = useCallback(
    (params: Connection | Edge) => {
      // console.log('onConnect fired', params); // Add a log to confirm it runs
      const newEdge: UserDrawnEdge = {
        ...params,
        id: `user-edge-${Date.now()}`, // Unique ID for user-drawn edges
        type: 'user-drawn', // <--- THIS IS CRUCIAL
        // You can add other properties here, like style, if you want them to look different
        // style: { stroke: '#f6ad55', strokeWidth: 2 },
      };
      setEdges((eds) => addEdge(newEdge, eds));
      // console.log('Edge added by onConnect:', newEdge); // Log the edge being added
    },
    [setEdges]
  );
  // ---------------------------------------------------------

  // Update nodes when addedCardsCodes changes
  useCourseNodes(addedCardsCodes, nodes, courseMap, handleNodeClick, setNodes, setEdges);

  // Generate edges based on prerequisites and corequisites
  // You will need to modify useCourseEdges to ignore 'user-drawn' edges
  useCourseEdges(addedCardsCodes, courseMap, setEdges, setNodes);

  // Example of how you might process edges, filtering out user-drawn ones
  // This logic should be where your existing edge processing happens.
  // Based on your structure, this is likely within or triggered by useCourseEdges.
  // useEffect(() => {
  //   // console.log("Total edges:", edges.length);
  //   // const programmaticEdges = edges.filter(edge => edge.type !== 'user-drawn');
  //   // console.log("Programmatic edges for processing:", programmaticEdges.length);
  //   // Call your specific processing logic here, passing programmaticEdges
  //   // For example: processMyCourseDependencies(programmaticEdges);
  // }, [edges]); // Re-run when edges change


  const handleToggleDashboard = () => {
    setIsDashboardVisible(prev => !prev);
  };

  // Custom handlers for the buttons
  const handleSaveClick = () => {
    // You might want to decide if you save user-drawn edges or not
    // If you save them, the load logic should also handle their type
    saveFlow(nodes, edges);
  };

  const handleRestoreClick = () => {
    const savedFlow = loadFlow();
    if (savedFlow.nodes.length > 0) {
      const courses = savedFlow.nodes.map(node => node.id);
      setAddedCardsCodes(courses);
      setNodes(savedFlow.nodes as FlowNode[]);
      // Ensure restored edges have the correct type if they were user-drawn
      setEdges(savedFlow.edges as (Edge | UserDrawnEdge)[]);
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
      onConnect={onConnect} // Add the onConnect handler here
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