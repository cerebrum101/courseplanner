import type { NodeTypes } from '@xyflow/react';
import { PositionLoggerNode } from './PositionLoggerNode';
import { AppNode } from './types';

import coursesDataJson from '../data/completeCourses1.json';
import '../styles/index.css';
import Dashboard from '../components/Dashboard';

// ---------- Data Interfaces ----------
interface CoursePrereq {
  courseCode: string;
  courseName: string;
  gradeRequired: string;
}

interface Course {
  courseCode: string;
  courseName: string;
  prerequisites: Array<CoursePrereq | string>;
  corequisites: any[];
  antirequisites: any[];
  level?: number;  // Already computed in the JSON.
}

interface CoursesData {
  coursesData: Course[];
}

const nodes: AppNode[] = Dashboard.filteredCards.map(code => {
    const labelValue = {code}
    const pos = { x: 0, y: 0 };
    return {
      id: code,
      position: pos,
      data: { label: labelValue },
      className: '',
    };
  });

  return nodes;
}

const data: CoursesData = coursesDataJson;
const courses = data.coursesData;


export const nodeTypes = {
  'position-logger': PositionLoggerNode,
  // Add any other custom node types here.
} satisfies NodeTypes;

