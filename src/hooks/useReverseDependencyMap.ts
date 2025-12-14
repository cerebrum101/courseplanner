import { useMemo } from 'react';
import { Course } from '../atoms/types/course.types';
import { buildReverseDependencyMap, ReverseDependencies } from '../utils/reverseDependencies';
import courseDataJSON from '../data/courseData.json';

/**
 * Hook that builds and returns a reverse dependency map for all courses.
 * The map is memoized and only computed once during component initialization.
 * 
 * @returns Map where key is course code and value contains arrays of courses that depend on it
 */
export const useReverseDependencyMap = (): Map<string, ReverseDependencies> => {
  return useMemo(() => {
    // Cast the JSON data to Course array
    const courses = courseDataJSON.coursesData as Course[];
    
    // Build the reverse dependency map
    const reverseMap = buildReverseDependencyMap(courses);
    
    // Optional: Log statistics for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[Reverse Dependencies] Map built successfully');
      console.log('[Reverse Dependencies] Total courses:', reverseMap.size);
      
      // Count how many courses are prerequisites for others
      let prereqCount = 0;
      let coreqCount = 0;
      let antireqCount = 0;
      
      reverseMap.forEach(deps => {
        if (deps.prerequisiteFor.length > 0) prereqCount++;
        if (deps.corequisiteFor.length > 0) coreqCount++;
        if (deps.antirequisiteFor.length > 0) antireqCount++;
      });
      
      console.log('[Reverse Dependencies] Courses used as prerequisites:', prereqCount);
      console.log('[Reverse Dependencies] Courses used as corequisites:', coreqCount);
      console.log('[Reverse Dependencies] Courses used as antirequisites:', antireqCount);
    }
    
    return reverseMap;
  }, []); // Empty dependency array - only compute once
};

