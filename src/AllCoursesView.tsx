import { useCallback } from 'react';

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import './styles/index.css';

import { courseNodes, nodeTypes } from './nodes';
import { courseEdges, edgeTypes } from './edges';


export default function AllCoursesView() {
  const [nodes, setNodes , onNodesChange] = useNodesState(courseNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(courseEdges);

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges]
  );

  return (
    <ReactFlow
      nodes={nodes}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      edges={edges}
      edgeTypes={edgeTypes}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      nodesDraggable={true}
      
    >
      <Background />
      {/* <MiniMap /> */}
      <Controls />
    </ReactFlow>
  );
}
