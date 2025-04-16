import { useEffect, useMemo } from 'react';
import { CourseNode } from '../atoms/types/course.types';
import { Node } from '@xyflow/react';




export const useCourseNodes = (
  addedCardsCodes: string[],
  nodes: Node[],
  courseMap: Map<string, any>,
  handleNodeClick: (nodeId: string) => void,
  setNodes: (nodes: CourseNode[]) => void
) => {
  useEffect(() => {
    const courseNodes = addedCardsCodes.map((code, index) => {
      const existingNode = nodes.find(n => n.id === code);
      const courseName = courseMap.get(code)?.courseName;

      // let initX = 200;

      const x = Math.floor((+index)/5)*250;
      const y = (index % 5)*150;
      
      return {
        id: code,
        position: existingNode?.position || { 
          x: x, 
          y: y, 
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
    setNodes(courseNodes)
  }, [addedCardsCodes, courseMap, handleNodeClick, setNodes]);
}; 