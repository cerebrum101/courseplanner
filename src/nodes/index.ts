import type { NodeTypes } from '@xyflow/react';
import { PositionLoggerNode } from './PositionLoggerNode';
import { AppNode } from './types';

import coursesDataJson from '../data/completeCourses1.json';
import '../styles/index.css';

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

// ---------- Tree Layout Computation ----------
function createTreeNodes(courses: Course[]): AppNode[] {
  // Group courses by their pre-computed level.
  const levelMap: Record<number, Course[]> = {};
  courses.forEach(course => {
    const lvl = course.level ?? 1;
    if (!levelMap[lvl]) {
      levelMap[lvl] = [];
    }
    levelMap[lvl].push(course);
  });

  // Define spacing constants.
  const verticalSpacing = 300;   // Vertical distance between levels.
  const horizontalSpacing = 200; // Horizontal spacing for symmetric layout.

  // This map will hold our final positions.
  const positions = new Map<string, { x: number; y: number }>();

  // Get center x coordinate from MATH 161. We assume its x is 0.
  // (If desired, you can change this to another center value.)
  const centerX = 0;

  // For level 1, we place MATH 161 at the center.
  if (levelMap[1] && levelMap[1].length > 0) {
    // We assume only MATH 161 is level 1.
    const math161 = levelMap[1].find(course => course.courseCode === "MATH 161");
    if (math161) {
      positions.set(math161.courseCode, { x: centerX, y: 0 });
    }
  }

  // For levels > 1, use the JSON order and position nodes symmetrically around centerX.
  const sortedLevels = Object.keys(levelMap)
    .map(Number)
    .sort((a, b) => a - b);

  sortedLevels.forEach(level => {
    if (level === 1) {
      return; // already handled
    }
    const coursesAtLevel = levelMap[level];
    coursesAtLevel.forEach((course, i) => {
      let offset = 0;
      if (i > 0) {
        // For node index i>0:
        // - odd indices: place to the left (negative offset)
        // - even indices: place to the right (positive offset)
        // The distance increases as ceil(i/2) * horizontalSpacing.
        const d = Math.ceil(i / 2);
        offset = (i % 2 === 1 ? -1 : 1) * d * horizontalSpacing;
      }
      positions.set(course.courseCode, {
        x: centerX + offset,
        y: (level - 1) * verticalSpacing,
      });
    });
  });


  // Build final AppNode array.
  const nodes: AppNode[] = courses.map(course => {
    const labelValue = `[${course.courseCode}] ${course.courseName}` 
    const pos = positions.get(course.courseCode) || { x: 0, y: 0 };
    return {
      id: course.courseCode,
      position: pos,
      data: { label: labelValue },
      className: '',
    };
  });

  return nodes;
}

// function createLabelValue(code, name) { 

//   return (
//     <>



//   </>)
// }



// ---------- Build Final Nodes & Export ----------
const data: CoursesData = coursesDataJson;
const courses = data.coursesData;
export const courseNodes: AppNode[] = createTreeNodes(courses);

export const nodeTypes = {
  'position-logger': PositionLoggerNode,
  // Add any other custom node types here.
} satisfies NodeTypes;
