import type { Edge, EdgeTypes } from '@xyflow/react';
import courseDataJSON from '../data/completeCourses1.json';
import '../styles/index.css';

// A function to retrieve the "base" HSL color for each level.
function getBaseHSL(level?: number): { h: number; s: number; l: number } {
  switch (level) {
    case 2:
      // Pastel green
      return { h: 120, s: 60, l: 80 };
    case 3:
      // Pastel blue
      return { h: 210, s: 60, l: 80 };
    case 4:
      // Pastel magenta
      return { h: 320, s: 60, l: 80 };
    case 5:
      // Pastel yellow
      return { h: 50, s: 80, l: 80 };
    case 6:
      // Pastel gray
      return { h: 0, s: 0, l: 80 };
    default:
      // A default light gray
      return { h: 0, s: 0, l: 70 };
  }
}

/**
 * Interpolate a color in HSL space:
 * - We keep Hue and Saturation the same.
 * - We vary Lightness from baseL to (baseL - lightnessRange).
 *   For example, if baseL=80 and lightnessRange=30,
 *   the darkest is 50 (80 - 30).
 *
 * @param baseH hue, saturation, and lightness
 * @param index position from left to right in the level
 * @param total total nodes in that level
 * @param lightnessRange how many percentage points of lightness to reduce
 */
function interpolateHSL(
  baseH: number,
  baseS: number,
  baseL: number,
  index: number,
  total: number,
  lightnessRange: number
): string {
  if (total <= 1) {
    // no interpolation if there's only one node
    return `hsl(${baseH}, ${baseS}%, ${baseL}%)`;
  }
  // factor goes from 0 on the left to 1 on the right
  const factor = index / (total - 1);
  // new lightness
  const newL = baseL - factor * lightnessRange;
  return `hsl(${baseH}, ${baseS}%, ${newL}%)`;
}

// Build a mapping: level → array of courseCodes (in JSON order).
const levelOrder: Record<number, string[]> = {};
courseDataJSON.coursesData.forEach(course => {
  const lvl = course.level ?? 1;
  if (!levelOrder[lvl]) {
    levelOrder[lvl] = [];
  }
  levelOrder[lvl].push(course.courseCode);
});

// You can tweak this range if you want less or more variation
const lightnessRange = 30;

export const initialEdges: Edge[] = [];

export const courseEdges: Edge[] = courseDataJSON.coursesData.flatMap(el =>
  el.prerequisites
    .filter(prereq => typeof prereq === 'object' && prereq !== null)
    .map(prereq => {
      const lvl = el.level ?? 1;
      const baseHSL = getBaseHSL(lvl);

      // Identify the position of this course in its level
      const orderForLevel = levelOrder[lvl] || [];
      const index = orderForLevel.indexOf(el.courseCode);
      const total = orderForLevel.length;

      // Interpolate the final color
      const strokeColor = interpolateHSL(
        baseHSL.h,
        baseHSL.s,
        baseHSL.l,
        index,
        total,
        lightnessRange
      );

      return {
        id: `${prereq.courseCode}->${el.courseCode}`,
        source: prereq.courseCode,
        target: el.courseCode,
        animated: false,
        markerEnd: 'arrowclosed',
        type: 'bezier',
        style: { stroke: strokeColor },
      };
    })
);

export const edgeTypes = {} satisfies EdgeTypes;
