import { useEffect } from 'react';
import { CourseNode } from '../atoms/types/course.types';
// import { Node } from '@xyflow/react';
import { saveFlow, loadFlow, resetFlow } from '../utils/saveCourses';

export const useCourseNodes = (
  addedCardsCodes: string[],
  nodes: CourseNode[],
  courseMap: Map<string, any>,
  handleNodeClick: (nodeId: string) => void,
  setNodes: (nodes: CourseNode[]) => void,
  setEdges: (edges: any[]) => void
) => {
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

  // Only create new nodes when courses are added
  useEffect(() => {
    const courseNodes = addedCardsCodes.map((code) => {
      const existingNode = nodes.find(n => n.id === code);
      const courseName = courseMap.get(code)?.courseName;

      // If we have an existing node, use its position
      if (existingNode) {
        return {
          id: code,
          position: existingNode.position,
          data: { 
            label: code,
            name: courseName,
            onNodeClick: handleNodeClick
          },
          draggable: true,
          type: 'Course',
          targetPosition: 'top',
        } as CourseNode;
      }

      // For new nodes, find the last node's position or use default
      const lastNode = nodes[nodes.length - 1];
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
          onNodeClick: handleNodeClick
        },
        draggable: true,
        type: 'Course',
        targetPosition: 'top',
      } as CourseNode;
    });
    setNodes(courseNodes);
  }, [addedCardsCodes, courseMap, handleNodeClick, setNodes]);

  return {
    handleSave,
    handleRestore,
    handleReset
  };
}; 