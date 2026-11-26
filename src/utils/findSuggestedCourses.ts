import { Course } from '../atoms/types/course.types';
// @ts-ignore - plain .mjs module, no types
import { hasCourseRequirements, prerequisitesMet } from './suggest.mjs';

/**
 * Courses worth suggesting for the current plan: not already added, has at
 * least one course prerequisite, and some alternative of those prerequisites
 * is fully on the canvas.
 */
export const findSuggestedCourses = (
  allCourses: Course[],
  addedCardsCodes: string[]
): Course[] => {
  const addedSet = new Set(addedCardsCodes);
  return allCourses.filter((course) => {
    if (!course.courseCode || addedSet.has(course.courseCode)) return false;
    if (!hasCourseRequirements(course)) return false;
    return prerequisitesMet(course, addedSet);
  });
};
