import { Course } from '../atoms/types/course.types';

/**
 * Extract course codes from PREREQNEW format (%COURSE%)
 */
const extractCourseCodesFromString = (reqString: string): string[] => {
  if (!reqString) return [];
  const matches = reqString.match(/%([^%]+)%/g) || [];
  return matches.map(match => match.slice(1, -1).trim());
};

/**
 * Extract course codes from legacy prerequisites array
 */
const extractCourseCodesFromArray = (
  reqArray: (string | { type: string; courses: string[] })[]
): string[] => {
  if (!reqArray) return [];
  
  const codes: string[] = [];
  
  reqArray.forEach(item => {
    if (typeof item === 'string') {
      // Skip special markers like !PERM
      if (!item.startsWith('!')) {
        codes.push(item.trim());
      }
    } else if (typeof item === 'object' && 'courses' in item) {
      // For OR groups, we need at least ONE of the courses
      // For now, we'll be conservative and require all OR options to be available
      codes.push(...item.courses.map(c => c.trim()));
    }
  });
  
  return codes;
};

/**
 * Check if all prerequisites for a course are satisfied
 * For OR groups: at least one course must be in addedCodes
 * For AND requirements: all courses must be in addedCodes
 */
const arePrerequisitesSatisfied = (
  course: Course,
  addedCodes: Set<string>
): boolean => {
  // Check PREREQNEW format
  if (course.PREREQNEW) {
    const prereqString = course.PREREQNEW;
    
    // Handle OR groups in parentheses: (%CS 101% OR %CS 102%)
    const orGroupMatches = prereqString.match(/\(([^()]+)\)/g) || [];
    
    for (const orGroup of orGroupMatches) {
      const coursesInGroup = extractCourseCodesFromString(orGroup);
      // At least one course from the OR group must be present
      const hasOneFromGroup = coursesInGroup.some(code => addedCodes.has(code));
      if (!hasOneFromGroup) return false;
    }
    
    // Remove OR groups and check remaining AND requirements
    let remaining = prereqString;
    orGroupMatches.forEach(group => {
      remaining = remaining.replace(group, '');
    });
    
    const andCourses = extractCourseCodesFromString(remaining);
    return andCourses.every(code => addedCodes.has(code));
  }
  
  // Check legacy prerequisites array
  if (course.prerequisites && course.prerequisites.length > 0) {
    for (const prereq of course.prerequisites) {
      if (typeof prereq === 'string') {
        // Skip special markers
        if (prereq.startsWith('!')) continue;
        // AND requirement
        if (!addedCodes.has(prereq)) return false;
      } else if (typeof prereq === 'object' && prereq.type === 'or') {
        // OR requirement - at least one must be present
        const hasOne = prereq.courses.some(code => addedCodes.has(code));
        if (!hasOne) return false;
      }
    }
  }
  
  return true;
};

/**
 * Find courses that can be suggested based on current added courses
 * A course is suggested if:
 * 1. It's NOT already added
 * 2. ALL its prerequisites ARE added
 * 3. It has at least one prerequisite (not a foundational course)
 */
export const findSuggestedCourses = (
  allCourses: Course[],
  addedCardsCodes: string[]
): Course[] => {
  const addedSet = new Set(addedCardsCodes);
  const suggested: Course[] = [];
  
  for (const course of allCourses) {
    const courseCode = course.courseCode;
    if (!courseCode) continue;
    
    // Skip if already added
    if (addedSet.has(courseCode)) continue;
    
    // Check if it has prerequisites
    const hasPrereqs = (course.PREREQNEW && course.PREREQNEW.trim() !== '') ||
                       (course.prerequisites && course.prerequisites.length > 0);
    
    if (!hasPrereqs) continue; // Skip foundational courses
    
    // Check if all prerequisites are satisfied
    if (arePrerequisitesSatisfied(course, addedSet)) {
      suggested.push(course);
    }
  }
  
  return suggested;
};

