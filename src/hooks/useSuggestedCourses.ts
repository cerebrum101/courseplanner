import { useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import { findSuggestedCourses } from '../utils/findSuggestedCourses';
import { Course } from '../atoms/types/course.types';

interface SuggestedCourseNode extends Node {
  id: string;
  type: 'SuggestedCourse';
  data: {
    label: string;
    name: string;
    onAddSuggested: (courseCode: string) => void;
  };
}

/**
 * Hook to generate suggested course nodes and edges
 * Suggested courses are those whose prerequisites are all satisfied
 */
export const useSuggestedCourses = (
  addedCardsCodes: string[],
  allCourses: Course[],
  setNodes: (updater: (nodes: Node[]) => Node[]) => void,
  setEdges: (updater: (edges: Edge[]) => Edge[]) => void,
  onAddSuggested: (courseCode: string) => void
) => {
  useEffect(() => {
    // Find suggested courses
    const suggestedCourses = findSuggestedCourses(allCourses, addedCardsCodes);
    
    // Limit to top N suggestions to avoid clutter
    const maxSuggestions = 10;
    const limitedSuggestions = suggestedCourses.slice(0, maxSuggestions);
    
    // Generate suggested nodes and edges
    setNodes((currentNodes) => {
      // Remove old suggestion nodes
      const nonSuggestionNodes = currentNodes.filter(node => node.type !== 'SuggestedCourse');
      
      // Create new suggestion nodes
      const suggestionNodes: SuggestedCourseNode[] = limitedSuggestions.map((course, index) => {
        // Position suggestions below the existing nodes
        const baseY = 400;
        const baseX = index * 200;
        
        return {
          id: `suggestion-${course.courseCode}`,
          type: 'SuggestedCourse',
          position: { x: baseX, y: baseY },
          data: {
            label: course.courseCode || '',
            name: course.courseName || '',
            onAddSuggested,
          },
          draggable: true,
        } as SuggestedCourseNode;
      });
      
      return [...nonSuggestionNodes, ...suggestionNodes];
    });
    
    // Generate gray edges from prerequisites to suggestions
    setEdges((currentEdges) => {
      // Remove old suggestion edges
      const nonSuggestionEdges = currentEdges.filter(edge => !edge.id.startsWith('suggestion-edge-'));
      
      const suggestionEdges: Edge[] = [];
      
      limitedSuggestions.forEach((course) => {
        const suggestionNodeId = `suggestion-${course.courseCode}`;
        
        // Extract prerequisites
        let prereqCodes: string[] = [];
        
        if (course.PREREQNEW) {
          const matches = course.PREREQNEW.match(/%([^%]+)%/g) || [];
          prereqCodes = matches.map(match => match.slice(1, -1).trim());
        } else if (course.prerequisites) {
          course.prerequisites.forEach(prereq => {
            if (typeof prereq === 'string' && !prereq.startsWith('!')) {
              prereqCodes.push(prereq);
            } else if (typeof prereq === 'object' && prereq.courses) {
              prereqCodes.push(...prereq.courses);
            }
          });
        }
        
        // Create gray edges from each prerequisite to the suggestion
        prereqCodes.forEach(prereqCode => {
          if (addedCardsCodes.includes(prereqCode)) {
            suggestionEdges.push({
              id: `suggestion-edge-${prereqCode}-${course.courseCode}`,
              source: prereqCode,
              target: suggestionNodeId,
              type: 'default',
              animated: false,
              style: { stroke: '#9CA3AF', strokeDasharray: '5 5' }, // Gray dashed line
              sourceHandle: 'bottom-source',
              targetHandle: 'top-target',
            });
          }
        });
      });
      
      return [...nonSuggestionEdges, ...suggestionEdges];
    });
  }, [addedCardsCodes, allCourses, setNodes, setEdges, onAddSuggested]);
};

