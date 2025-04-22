import { useMemo } from 'react';
import { Course } from '../atoms/types/course.types';
import courseDataJSON from '../data/courseData.json';

export const useCourseMap = () => {
  return useMemo(() => {
    const map = new Map<string, Course>();
    courseDataJSON.coursesData.forEach((course: any) => {
      map.set(course.courseCode, {
        ...course,
        credits: Number(course.credits)
      });
    });
    return map;
  }, []);
}; 