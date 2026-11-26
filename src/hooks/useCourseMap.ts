import { useMemo } from 'react';
import { Course } from '../atoms/types/course.types';
import courseDataJSON from '../data/courseData.json';

export const useCourseMap = () => {
  return useMemo(() => {
    const map = new Map<string, Course>();
    courseDataJSON.coursesData.forEach((course: any) => {
      const entry = { ...course, credits: Number(course.creditsECTS) };
      map.set(course.courseCode, entry);
      // cross-listed codes resolve to the same course
      (course.aliases || []).forEach((a: string) => { if (!map.has(a)) map.set(a, entry); });
    });
    return map;
  }, []);
}; 