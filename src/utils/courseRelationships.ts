import { Edge, MarkerType } from '@xyflow/react';
import { Course } from '../atoms/types/course.types';

export const createPrerequisiteEdges = (
  course: Course,
  courseCode: string,
  addedCardsCodes: string[]
): Edge[] => {
  const edges: Edge[] = [];

  course.prerequisites?.forEach(prereq => {
    if (typeof prereq === 'string') {
      // Skip instructors approval only !PERM courses
      if (prereq.startsWith('!')) {
        return;
      }
      
      // If it's a regular course code and it's in the added cards
      if (addedCardsCodes.includes(prereq)) {
        edges.push({
          id: `${prereq}->${courseCode}`,
          source: prereq,
          target: courseCode,
          type: 'default',
          animated: false,
          style: { stroke: 'blue' }, // Blue for prerequisites
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: 'blue', // Blue arrow
          },
          sourceHandle: 'bottom-source',
          targetHandle: 'top-target',
        });
      }
    } 
    // Handle object prerequisites with "type" and "courses" array
    else if (typeof prereq === 'object' && 'type' in prereq && 'courses' in prereq) {
      // For "or" type prerequisites, create edges for each course in the array
      if (prereq.type === 'or') {
        prereq.courses.forEach((crs, index) => {
          const OrPrereq = prereq.courses[index+1] || prereq.courses[index-1];
          if(addedCardsCodes.includes(crs)) {
            edges.push({
              id: `${crs}->${courseCode}`,
              source: crs,
              target: courseCode,
              type: 'default',
              animated: true,
              style: { stroke: '#ee82ee' }, // Pink for OR prerequisites
              label: `OR ${OrPrereq}`,
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: 'pink',
              },
              sourceHandle: 'bottom-source',
              targetHandle: 'top-target',
            });
          }
        });
      }
    }
  });

  return edges;
};

export const createCorequisiteEdges = (
  course: Course,
  courseCode: string,
  addedCardsCodes: string[]
): Edge[] => {
  const edges: Edge[] = [];

  course.corequisites?.forEach(coreq => {
    // Handle string corequisites
    if (typeof coreq === 'string') {
      if (addedCardsCodes.includes(coreq)) {
        edges.push({
          id: `${coreq}->${courseCode}`,
          source: coreq,
          target: courseCode,
          type: 'default',
          style: { stroke: '#2ECC40' }, // Green for corequisites
          label: "COREQ",
          sourceHandle: 'bottom-source',
          targetHandle: 'bottom-target',
        });
      }
    } 
    // Handle object corequisites with "type" and "courses" array
    else if (typeof coreq === 'object' && 'type' in coreq && 'courses' in coreq) {
      if (coreq.type === 'or') {
        coreq.courses.forEach((coreqCourseCode: string) => {
          if (addedCardsCodes.includes(coreqCourseCode)) {
            edges.push({
              id: `${coreqCourseCode}->${courseCode}`,
              source: coreqCourseCode,
              target: courseCode,
              type: 'default',
              style: { stroke: '#10b981' }, // Teal for OR corequisites
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#10b981',
              },
              sourceHandle: 'bottom-source',
              targetHandle: 'bottom-target',
            });
          }
        });
      }
    }
  });

  return edges;
};

export const createAntirequisiteEdges = (
  course: Course,
  courseCode: string,
  addedCardsCodes: string[]
): Edge[] => {
  const edges: Edge[] = [];

  course.antirequisites?.forEach(antireq => {
    if(!antireq){
      return;
    }

    if(typeof antireq === 'string') {
      if(addedCardsCodes.includes(antireq)){
        edges.push({
          id: `${antireq}->${courseCode}`,
          source: antireq,
          target: courseCode,
          type: 'default',
          style: { stroke: 'red' }, // red for antireqs
          label: "ANTIREQ",
          sourceHandle: 'bottom-source',
          targetHandle: 'bottom-target',
        });
      }
    } else if (typeof antireq === 'object' && 'courses' in antireq) {
      antireq.courses.forEach(courseCode => {
        if(addedCardsCodes.includes(courseCode)){
          edges.push({
            id: `${courseCode}->${courseCode}`,
            source: courseCode,
            target: courseCode,
            type: 'default',
            style: { stroke: 'red' },
            label: "ANTIREQ",
            sourceHandle: 'bottom-source',
            targetHandle: 'bottom-target',
          });
        }
      });
    }
  });

  return edges;
}; 