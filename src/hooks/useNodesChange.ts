import { useCallback } from 'react';
import { OnNodesChange, NodeChange } from '@xyflow/react';
import { CourseNode } from '../atoms/types/course.types';

export const useNodesChange = (
  onNodesChange: OnNodesChange<CourseNode>,
  setAddedCardsCodes: React.Dispatch<React.SetStateAction<string[]>>
) => {
  return useCallback((changes: NodeChange<CourseNode>[]) => {
    onNodesChange(changes);
    
    // Filter removed nodes
    const removedNodes = changes
      .filter((change): change is NodeChange<CourseNode> & { type: 'remove'; id: string } => 
        change.type === 'remove' && 'id' in change
      )
      .map(change => change.id);
    
    if (removedNodes.length > 0) {
      setAddedCardsCodes(prev => prev.filter(code => !removedNodes.includes(code)));
    }
  }, [onNodesChange, setAddedCardsCodes]);
}; 