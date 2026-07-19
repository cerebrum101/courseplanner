import { useEffect, useRef } from 'react';
import { CourseNode } from '../atoms/types/course.types';
// import { Node } from '@xyflow/react';
import { saveFlow, loadFlow, resetFlow } from '../utils/saveCourses';

export const useCourseNodes = (
  addedCardsCodes: string[],
  nodes: CourseNode[],
  courseMap: Map<string, any>,
  handleNodeClick: (nodeId: string) => void,
  setNodes: (nodes: CourseNode[] | ((nodes: CourseNode[]) => CourseNode[])) => void,
  setEdges: (edges: any[]) => void
) => {
  const handleNodeClickRef = useRef(handleNodeClick);
  handleNodeClickRef.current = handleNodeClick;
  // Handle saving the current flow state
  const handleSave = () => {
    saveFlow(nodes, []);
  };

  // Handle restoring the saved flow state
  const handleRestore = () => {
    const savedFlow = loadFlow();
    if (savedFlow.nodes.length > 0) {
      setNodes(savedFlow.nodes as CourseNode[]);
      setEdges(savedFlow.edges);
    }
  };

  // Handle resetting the flow state
  const handleReset = () => {
    resetFlow();
    setNodes([]);
    setEdges([]);
  };

  // Only create new nodes when courses are added or removed
  useEffect(() => {
    setNodes((currentNodes) => {
      const courseNodes = addedCardsCodes.map((code) => {
        const existingNode = currentNodes.find((n) => n.id === code);
        const courseName = courseMap.get(code)?.courseName;

        if (existingNode) {
          return {
            ...existingNode,
            data: {
              label: code,
              name: courseName,
              onNodeClick: handleNodeClickRef.current,
            },
            type: 'Course',
            targetPosition: 'top',
          } as CourseNode;
        }

        const lastNode = currentNodes[currentNodes.length - 1];
        const newX = lastNode?.position.x || 0;
        const newY = lastNode?.position.y || 0;

        return {
          id: code,
          position: {
            x: newX + 100,
            y: newY,
          },
          data: {
            label: code,
            name: courseName,
            onNodeClick: handleNodeClickRef.current,
          },
          draggable: true,
          type: 'Course',
          targetPosition: 'top',
        } as CourseNode;
      });

      const orNodes = currentNodes.filter((node) => node.id.startsWith('OR_'));
      return [...courseNodes, ...orNodes];
    });
  }, [addedCardsCodes, courseMap, setNodes]);

  return {
    handleSave,
    handleRestore,
    handleReset
  };
}; 