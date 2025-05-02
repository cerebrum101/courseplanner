import { Edge, Node } from '@xyflow/react';
import { Course } from '../atoms/types/course.types';

// Helper function to extract course codes from the requirement string
const extractCourseCodes = (reqString: string): string[] => {
  const matches = reqString.match(/%([^%]+)%/g) || [];
  return matches.map(match => match.slice(1, -1));
};

// Helper to normalize course codes for comparison
const normalizeCode = (code: string) => code.trim().toUpperCase();

// Helper function to parse the requirement string and create edges
const parseRequirementString = (
  reqString: string,
  courseCode: string,
  addedCardsCodes: string[],
  edgeType: 'prerequisite' | 'corequisite' | 'antirequisite',
  currentNodes: Node[],
  courseMap: Map<string, Course>,
  globalEdgeIds: Set<string>
): { edges: Edge[]; nodes: Node[] } => {
  const nodes: Node[] = [];
  let orNodeCounter = 0;

  // Function to create an OR utility node
  const createOrNode = (sourceCourses: string[], targetCourse: string): string | null => {
    const normalizedAdded = addedCardsCodes.map(normalizeCode);
    const normalizedSources = sourceCourses.map(normalizeCode);
    // console.log('[OR DEBUG] Normalized addedCardsCodes:', normalizedAdded);
    // console.log('[OR DEBUG] Normalized sourceCourses:', normalizedSources);
    const presentSources = Array.from(new Set(normalizedSources))
      .filter(code => normalizedAdded.includes(code) && courseMap.has(code));
    // console.log('[OR DEBUG] createOrNode:', { sourceCourses, presentSources, addedCardsCodes, normalizedAdded, courseMapSize: courseMap.size });
    if (presentSources.length < 2) return null;

    const orNodeId = `OR_${presentSources.join('_')}_${orNodeCounter++}`;
    // console.log('[OR DEBUG] OR node id:', orNodeId);

    // Check if the OR node already exists in currentNodes
    const existingOrNode = currentNodes.find(n => n.id === orNodeId);
    let position;
    if (existingOrNode) {
      position = existingOrNode.position;
    } else {
      // Calculate new position only on initial creation
      const sourcePositions = presentSources
        .map(code => {
          const node = currentNodes.find(n => normalizeCode(n.id) === code);
          return node?.position || { x: 0, y: 0 };
        });
      const targetNode = currentNodes.find(n => normalizeCode(n.id) === normalizeCode(targetCourse));
      const targetPosition = targetNode?.position || { x: 0, y: 0 };
      const avgX = sourcePositions.reduce((sum, pos) => sum + pos.x, 0) / sourcePositions.length;
      const avgY = sourcePositions.reduce((sum, pos) => sum + pos.y, 0) / sourcePositions.length;
      position = {
        x: (avgX + targetPosition.x) / 2,
        y: (avgY + targetPosition.y) / 2,
      };
    }

    nodes.push({
      id: orNodeId,
      type: 'orNode',
      position,
      data: {
        label: 'OR',
        name: 'OR',
        onNodeClick: () => {}
      }
    });
    return orNodeId;
  };

  // Function to get edge style based on type
  const getEdgeStyle = (isOrConnection: boolean) => {
    if (isOrConnection) {
      return { stroke: '#800080' }; // Purple for OR connections
    }
    switch (edgeType) {
      case 'prerequisite':
        return { stroke: 'blue' };
      case 'corequisite':
        return { stroke: '#2ECC40', };
      case 'antirequisite':
        return { stroke: 'red', };
      default:
        return { stroke: 'blue' };
    }
  };

  // Function to process a group of courses (either AND or OR)
  const processCourseGroup = (
    courses: string[],
    isOrGroup: boolean,
    targetCourse: string
  ): { edges: Edge[]; nodes: Node[] } => {
    const normalizedAdded = addedCardsCodes.map(normalizeCode);
    const uniqueCourses = Array.from(new Set(courses.map(normalizeCode))).filter(code => courseMap.has(code));
    // console.log('[OR DEBUG] processCourseGroup:', { courses, uniqueCourses, isOrGroup, targetCourse, normalizedAdded });
    const groupEdges: Edge[] = [];
    const groupNodes: Node[] = [];

    // Helper to get label for edge
    const getLabel = () => {
      if (edgeType === 'corequisite') return 'COREQ';
      if (edgeType === 'antirequisite') return 'ANTIREQ';
      return undefined;
    };

    if (isOrGroup && uniqueCourses.length > 1) {
      // Find present sources
      const presentSources = uniqueCourses.filter(code => normalizedAdded.includes(code));
      if (presentSources.length === 1) {
        // Only one present, draw direct orange edge, no OR node
        const edgeId = `${presentSources[0]}->${targetCourse}`;
        if (!globalEdgeIds.has(edgeId)) {
          groupEdges.push({
            id: edgeId,
            source: presentSources[0],
            target: targetCourse,
            type: 'default',
            style: { stroke: '#FFA500' }, // Orange
            sourceHandle: 'bottom-source',
            targetHandle: 'top-target',
            label: getLabel(),
          });
          globalEdgeIds.add(edgeId);
        }
      } else if (presentSources.length > 1) {
        // Usual OR node logic
        const orNodeId = createOrNode(uniqueCourses, targetCourse);
        if (orNodeId) {
          groupNodes.push(nodes[nodes.length - 1]);
          uniqueCourses.forEach(sourceCourse => {
            if (normalizedAdded.includes(sourceCourse)) {
              const edgeId = `${sourceCourse}->${orNodeId}`;
              if (!globalEdgeIds.has(edgeId)) {
                groupEdges.push({
                  id: edgeId,
                  source: sourceCourse,
                  target: orNodeId,
                  type: 'default',
                  style: getEdgeStyle(true),
                  sourceHandle: 'bottom-source',
                  targetHandle: 'top-target',
                  label: getLabel(),
                });
                globalEdgeIds.add(edgeId);
              }
            }
          });
          const orToTargetId = `${orNodeId}->${targetCourse}`;
          if (!globalEdgeIds.has(orToTargetId)) {
            groupEdges.push({
              id: orToTargetId,
              source: orNodeId,
              target: targetCourse,
              type: 'default',
              style: getEdgeStyle(false),
              sourceHandle: 'bottom-source',
              targetHandle: 'top-target',
              label: getLabel(),
            });
            globalEdgeIds.add(orToTargetId);
          }
        } 
        // else {
        //   // console.log('[OR DEBUG] OR node not created for', uniqueCourses, 'target:', targetCourse);
        // }
      }
      // If presentSources.length === 0, do nothing
    } else {
      // Handle AND group or single course
      uniqueCourses.forEach(sourceCourse => {
        if (normalizedAdded.includes(sourceCourse)) {
          const edgeId = `${sourceCourse}->${targetCourse}`;
          if (!globalEdgeIds.has(edgeId)) {
            groupEdges.push({
              id: edgeId,
              source: sourceCourse,
              target: targetCourse,
              type: 'default',
              style: getEdgeStyle(false),
              sourceHandle: 'bottom-source',
              targetHandle: 'top-target',
              label: getLabel(),
            });
            globalEdgeIds.add(edgeId);
          }
        }
      });
    }
    return { edges: groupEdges, nodes: groupNodes };
  };

  // Parse the requirement string
  const parseString = (str: string, targetCourse: string): { edges: Edge[]; nodes: Node[] } => {
    let resultEdges: Edge[] = [];
    let resultNodes: Node[] = [];

    // If the string contains 'OR' and no parentheses, treat as a flat OR group
    if (str.includes('OR') && !str.includes('(')) {
      const courses = extractCourseCodes(str);
      const { edges: orEdges, nodes: orNodes } = processCourseGroup(courses, true, targetCourse);
      return { edges: orEdges, nodes: orNodes };
    }

    // Handle OR groups in parentheses
    const orGroups = str.match(/\(([^()]+)\)/g) || [];
    let remainingStr = str;

    orGroups.forEach(group => {
      const cleanGroup = group.slice(1, -1); // Remove parentheses
      const courses = extractCourseCodes(cleanGroup);
      const { edges: groupEdges, nodes: groupNodes } = processCourseGroup(courses, true, targetCourse);
      resultEdges = [...resultEdges, ...groupEdges];
      resultNodes = [...resultNodes, ...groupNodes];
      remainingStr = remainingStr.replace(group, '');
    });

    // Handle remaining courses (AND groups)
    const remainingCourses = extractCourseCodes(remainingStr);
    if (remainingCourses.length > 0) {
      const { edges: andEdges, nodes: andNodes } = processCourseGroup(remainingCourses, false, targetCourse);
      resultEdges = [...resultEdges, ...andEdges];
      resultNodes = [...resultNodes, ...andNodes];
    }

    // Deduplicate edges by ID before returning
    const dedupedEdges = Array.from(new Map(resultEdges.map(e => [e.id, e])).values());
    return { edges: dedupedEdges, nodes: resultNodes };
  };

  return parseString(reqString, courseCode);
};

export const createPrerequisiteEdges = (
  course: Course,
  courseCode: string,
  addedCardsCodes: string[],
  currentNodes: Node[],
  courseMap: Map<string, Course>
): { edges: Edge[]; nodes: Node[] } => {
  // Move deduplication set to top-level per course
  const globalEdgeIds = new Set<string>();
  if (course.PREREQNEW) {
    return parseRequirementString(course.PREREQNEW, courseCode, addedCardsCodes, 'prerequisite', currentNodes, courseMap, globalEdgeIds);
  }
  return { edges: [], nodes: [] };
};

export const createCorequisiteEdges = (
  course: Course,
  courseCode: string,
  addedCardsCodes: string[],
  currentNodes: Node[],
  courseMap: Map<string, Course>
): { edges: Edge[]; nodes: Node[] } => {
  const globalEdgeIds = new Set<string>();
  if (course.COREQNEW) {
    return parseRequirementString(course.COREQNEW, courseCode, addedCardsCodes, 'corequisite', currentNodes, courseMap, globalEdgeIds);
  }
  return { edges: [], nodes: [] };
};

export const createAntirequisiteEdges = (
  course: Course,
  courseCode: string,
  addedCardsCodes: string[],
  currentNodes: Node[],
  courseMap: Map<string, Course>
): { edges: Edge[]; nodes: Node[] } => {
  const globalEdgeIds = new Set<string>();
  if (course.ANTIREQNEW) {
    return parseRequirementString(course.ANTIREQNEW, courseCode, addedCardsCodes, 'antirequisite', currentNodes, courseMap, globalEdgeIds);
  }
  return { edges: [], nodes: [] };
};
