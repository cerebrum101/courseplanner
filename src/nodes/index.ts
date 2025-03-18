import type { NodeTypes } from '@xyflow/react';

import { PositionLoggerNode } from './PositionLoggerNode';
import { AppNode } from './types';

import coursesDataJson from '../data/courses.json'

export const initialNodes: AppNode[] = [
  { id: 'a', type: 'input', position: { x: 0, y: 0 }, data: { label: 'wire' } },
  {
    id: 'b',
    type: 'position-logger',
    position: { x: -100, y: 100 },
    data: { label: 'drag me!' },
  },

  { id: 'c', position: { x: 100, y: 100 }, data: { label: 'your ideas' } },

  {
    id: 'd',
    type: 'output',
    position: { x: 0, y: 200 },
    data: { label: 'with React Flow' },
  },
];

export const courseNodes: AppNode[] = coursesDataJson.coursesData.map((el, index) => ({
  id: el.courseCode,  // Unique course code as ID
  position: { x: (index % 4) * 200, y: Math.round(index/4) *100 }, // Spread out nodes horizontally
  data: { label: el.courseName }, // Display course name as label
  className: 'fall-course-node',
}));

export const nodeTypes = {
  'position-logger': PositionLoggerNode,
  // Add any of your custom nodes here!
} satisfies NodeTypes;
