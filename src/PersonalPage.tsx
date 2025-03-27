import { useEffect, useMemo, useState } from 'react';
import Dashboard from './components/Dashboard';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './styles/index.css';

// Define type for your nodes
type CourseNode = Node & {
  data: {
    label: string;
  };
};

export default function UserPlanPage() {
  // Explicitly type your state
  const [addedCards, setAddedCards] = useState<string[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState<CourseNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useMemo(() => {
    setNodes(addedCards.map((code, index) => ({
      id: code,
      position: { x: index * 200, y: 0 },
      data: { label: code },
      draggable: true,
      type: 'default'
    })));  // <-- Now properly closed
  }, [addedCards, setNodes]);

  return (
    <ReactFlow
      nodes={nodes}
      onNodesChange={onNodesChange}
      fitView
      nodesDraggable={true}
    >
      <Background />
      <Controls />
      <Dashboard 
        addedCards={addedCards}
        setAddedCards={setAddedCards}
      />
    </ReactFlow>
  );
}