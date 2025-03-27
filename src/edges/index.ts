import type { Edge, EdgeTypes } from '@xyflow/react';
import courseDataJSON from '../data/completeCourses1.json';
import '../styles/index.css';

// A larger, more diverse Tailwind-inspired palette for each level.
// The arrays have 7 colors (from very light to very dark).
const tailwindPalette: Record<number, string[]> = {
  2: ["#DCFCE7", "#BBF7D0", "#86EFAC", "#4ADE80", "#22C55E", "#16A34A", "#15803D"],
  3: ["#DBEAFE", "#BFDBFE", "#93C5FD", "#60A5FA", "#3B82F6", "#2563EB", "#1D4ED8"],
  4: ["#FEE2E2", "#FECACA", "#FCA5A5", "#F87171", "#EF4444", "#DC2626", "#B91C1C"],
  5: ["#FEF3C7", "#FDE68A", "#FCD34D", "#FBBF24", "#F59E0B", "#D97706", "#B45309"],
  6: ["#F3F4F6", "#E5E7EB", "#D1D5DB", "#9CA3AF", "#6B7280", "#4B5563", "#374151"]
};

// Build a mapping: level → array of courseCodes in JSON order.
// This is used to determine left-to-right order for each level.
const levelOrder: Record<number, string[]> = {};
courseDataJSON.coursesData.forEach(course => {
  const lvl = course.level ?? 1;
  if (!levelOrder[lvl]) levelOrder[lvl] = [];
  levelOrder[lvl].push(course.courseCode);
});


export const courseEdges: Edge[] = courseDataJSON.coursesData.flatMap(el =>
  el.prerequisites
    .filter(prereq => typeof prereq === "object" && prereq !== null)
    .map(prereq => {
      const lvl = el.level ?? 1;
      // Pick the palette for this level.
      const palette = tailwindPalette[lvl] || ["#AAAAAA"];
      // Get the order array for this level.
      const orderForLevel = levelOrder[lvl] || [];
      // Determine the index of this course in its level (based on JSON order).
      const index = orderForLevel.indexOf(el.courseCode);
      const total = orderForLevel.length;
      // If there is more than one course, map the left-to-right order (0 to total-1)
      // into an index into our palette (0 to palette.length-1).
      const paletteIndex = total > 1 ? Math.round((index / (total - 1 )) * (palette.length - 1 )) : 0;
      const strokeColor = palette[paletteIndex];



      return {
        id: `${prereq.courseCode}->${el.courseCode}`,
        source: prereq.courseCode,
        target: el.courseCode,
        animated: false,
        markerEnd: "arrowclosed",
        type: "bezier",
        style: { stroke: strokeColor },
      };
    })
);


export const edgeTypes = {} satisfies EdgeTypes;
