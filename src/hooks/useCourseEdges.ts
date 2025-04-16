import { useEffect } from 'react';
import { Edge } from '@xyflow/react';
import { Course } from '../atoms/types/course.types';
import { createPrerequisiteEdges, createCorequisiteEdges, createAntirequisiteEdges } from '../utils/courseRelationships';

export const useCourseEdges = (
  addedCardsCodes: string[],
  courseMap: Map<string, Course>,
  setEdges: (edges: Edge[]) => void
) => {
  useEffect(() => {
    const newEdges: Edge[] = [];
    
    addedCardsCodes.forEach(courseCode => {
      const course = courseMap.get(courseCode);
      
      if (!course) return;

      // Process prerequisites
      const prerequisiteEdges = createPrerequisiteEdges(course, courseCode, addedCardsCodes);
      newEdges.push(...prerequisiteEdges);

      // Process corequisites
      const corequisiteEdges = createCorequisiteEdges(course, courseCode, addedCardsCodes);
      newEdges.push(...corequisiteEdges);

      // Process antirequisites
      const antirequisiteEdges = createAntirequisiteEdges(course, courseCode, addedCardsCodes);
      newEdges.push(...antirequisiteEdges);
    });

    setEdges(newEdges);
  }, [addedCardsCodes, courseMap, setEdges]);
}; 