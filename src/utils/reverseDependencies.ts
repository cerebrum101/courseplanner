import { Course } from '../atoms/types/course.types';

// Type definition for reverse dependencies
export interface ReverseDependencies {
  prerequisiteFor: string[];  // Courses that need this course as prerequisite
  corequisiteFor: string[];   // Courses that need this course as corequisite
  antirequisiteFor: string[]; // Courses that conflict with this course
}

// Helper function to extract course codes from requirement strings (PREREQNEW, COREQNEW, ANTIREQNEW format)
const extractCourseCodesFromString = (reqString: string): string[] => {
  if (!reqString || reqString.trim() === '') return [];
  
  // Extract all course codes between % delimiters
  const matches = reqString.match(/%([^%]+)%/g) || [];
  return matches.map(match => match.slice(1, -1).trim());
};

// Helper function to extract course codes from legacy array format
const extractCourseCodesFromArray = (
  reqArray: (string | { type: string; courses: string[] })[]
): string[] => {
  if (!reqArray || !Array.isArray(reqArray)) return [];
  
  const codes: string[] = [];
  
  reqArray.forEach(item => {
    if (typeof item === 'string') {
      // Skip special markers like !PERM
      if (!item.startsWith('!')) {
        codes.push(item.trim());
      }
    } else if (typeof item === 'object' && 'courses' in item) {
      // Handle OR groups: { type: 'or', courses: [...] }
      codes.push(...item.courses.map(c => c.trim()));
    }
  });
  
  return codes;
};

/**
 * Builds a reverse dependency map for all courses.
 * This map allows O(1) lookup to find which courses require a given course.
 * 
 * @param courses - Array of all courses from the database
 * @returns Map where key is course code and value is an object containing arrays of courses that depend on it
 */
export const buildReverseDependencyMap = (
  courses: Course[]
): Map<string, ReverseDependencies> => {
  const reverseMap = new Map<string, ReverseDependencies>();
  
  // Initialize map with empty arrays for all courses
  courses.forEach(course => {
    if (course.courseCode) {
      reverseMap.set(course.courseCode, {
        prerequisiteFor: [],
        corequisiteFor: [],
        antirequisiteFor: [],
      });
    }
  });
  
  // Build reverse dependencies by iterating through all courses
  courses.forEach(course => {
    const courseCode = course.courseCode;
    if (!courseCode) return;
    
    // Extract prerequisite codes
    let prereqCodes: string[] = [];
    if (course.PREREQNEW) {
      // Use new format (preferred)
      prereqCodes = extractCourseCodesFromString(course.PREREQNEW);
    } else if (course.prerequisites) {
      // Fallback to old format
      prereqCodes = extractCourseCodesFromArray(course.prerequisites);
    }
    
    // Add current course to each prerequisite's "prerequisiteFor" list
    prereqCodes.forEach(prereqCode => {
      const entry = reverseMap.get(prereqCode);
      if (entry && !entry.prerequisiteFor.includes(courseCode)) {
        entry.prerequisiteFor.push(courseCode);
      }
    });
    
    // Extract corequisite codes
    let coreqCodes: string[] = [];
    if (course.COREQNEW) {
      coreqCodes = extractCourseCodesFromString(course.COREQNEW);
    } else if (course.corequisites) {
      coreqCodes = extractCourseCodesFromArray(course.corequisites);
    }
    
    // Add current course to each corequisite's "corequisiteFor" list
    coreqCodes.forEach(coreqCode => {
      const entry = reverseMap.get(coreqCode);
      if (entry && !entry.corequisiteFor.includes(courseCode)) {
        entry.corequisiteFor.push(courseCode);
      }
    });
    
    // Extract antirequisite codes
    let antireqCodes: string[] = [];
    if (course.ANTIREQNEW) {
      antireqCodes = extractCourseCodesFromString(course.ANTIREQNEW);
    } else if (course.antirequisites) {
      antireqCodes = extractCourseCodesFromArray(course.antirequisites);
    }
    
    // Add current course to each antirequisite's "antirequisiteFor" list
    antireqCodes.forEach(antireqCode => {
      const entry = reverseMap.get(antireqCode);
      if (entry && !entry.antirequisiteFor.includes(courseCode)) {
        entry.antirequisiteFor.push(courseCode);
      }
    });
  });
  
  // Sort all arrays for consistent ordering
  reverseMap.forEach(deps => {
    deps.prerequisiteFor.sort();
    deps.corequisiteFor.sort();
    deps.antirequisiteFor.sort();
  });
  
  return reverseMap;
};

