import type { Edge, EdgeTypes } from '@xyflow/react';
import courseDataJSON from '../data/courses.json';

export const initialEdges: Edge[] = [
  // { id: 'a->c', source: 'a', target: 'c', animated: true },
  // { id: 'b->d', source: 'b', target: 'd' },
  // { id: 'c->d', source: 'c', target: 'd', animated: true },
];

export const courseEdges: Edge[] = courseDataJSON.coursesData.flatMap(el =>
  el.prerequisites
    .filter(prereq => typeof prereq === 'object' && prereq !== null)
    .map(prereq => ({
      id: `${prereq.courseCode}->${el.courseCode}`,
      source: prereq.courseCode,
      target: el.courseCode,
      animated: false,
      markerEnd: 'arrowclosed' , // Only specify type
    }))
);

export const edgeTypes = {
  // Add your custom edge types here!
} satisfies EdgeTypes;
