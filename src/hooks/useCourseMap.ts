import { useMemo } from 'react';
import { Course } from '../atoms/types/course.types';
import courseDataJSON from '../data/courseData.json';

export const useCourseMap = () => {
  return useMemo(() => {
    const map = new Map<string, Course>();
    courseDataJSON.coursesData.forEach((course: Course) => {
      map.set(course.courseCode, course);
    });
    return map;
  }, []);
}; 