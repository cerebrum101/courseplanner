// useCourseEdges.ts (or .js)
import { useEffect } from 'react';
import { Edge, Node } from '@xyflow/react';
import { Course, CourseNode } from '../atoms/types/course.types';
import { createPrerequisiteEdges, createCorequisiteEdges, createAntirequisiteEdges } from '../utils/courseReqsEdges';

interface UserDrawnEdge extends Edge {
  type: 'user-drawn';
}

interface OrNode extends Node {
  id: string;
  type: 'orNode';
  data: {
    label: string;
    name: string;
    onNodeClick: (nodeId: string) => void;
  };
}

type FlowNode = CourseNode | OrNode;

export const useCourseEdges = (
  addedCardsCodes: string[],
  courseMap: Map<string, Course>,
  // Ensure this type matches the one in UserPlanPage for setEdges
  setEdges: (edges: (Edge | UserDrawnEdge)[] | ((eds: (Edge | UserDrawnEdge)[]) => (Edge | UserDrawnEdge)[])) => void,
  setNodes: (nodes: FlowNode[] | ((nds: FlowNode[]) => FlowNode[])) => void
) => {
  useEffect(() => {
    // console.log('useCourseEdges effect running for codes:', addedCardsCodes); // Log hook run

    // 1. Calculate the new set of programmatic edges and nodes
    setNodes(currentNodes => {
      const programmaticEdges: Edge[] = [];
      const programmaticNodes: OrNode[] = [];

      addedCardsCodes.forEach(courseCode => {
        const course = courseMap.get(courseCode);
        if (!course) return;
        // Pass courseMap as last argument
        const { edges: prerequisiteEdges, nodes: prerequisiteNodes } = createPrerequisiteEdges(course, courseCode, addedCardsCodes, currentNodes, courseMap);
        programmaticEdges.push(...prerequisiteEdges);
        programmaticNodes.push(...prerequisiteNodes as OrNode[]);
        const { edges: corequisiteEdges, nodes: corequisiteNodes } = createCorequisiteEdges(course, courseCode, addedCardsCodes, currentNodes, courseMap);
        programmaticEdges.push(...corequisiteEdges);
        programmaticNodes.push(...corequisiteNodes as OrNode[]);
        const { edges: antirequisiteEdges, nodes: antirequisiteNodes } = createAntirequisiteEdges(course, courseCode, addedCardsCodes, currentNodes, courseMap);
        programmaticEdges.push(...antirequisiteEdges);
        programmaticNodes.push(...antirequisiteNodes as OrNode[]);
      });

      // 2. Update the edges state using the updater function
      setEdges(currentEdges => {
        // console.log('setEdges updater function running in useCourseEdges'); // Log updater run
        // console.log('Current edges before filter:', currentEdges); // See what's in currentEdges

        // Filter the current edges to keep only user-drawn ones
        const currentUserDrawnEdges = currentEdges.filter(edge => edge.type === 'user-drawn');
        // console.log('User-drawn edges found:', currentUserDrawnEdges); // See filtered edges

        // Combine the new programmatic edges with the preserved user-drawn edges
        const nextEdges = [...programmaticEdges, ...currentUserDrawnEdges];
        // console.log('Next edges state:', nextEdges); // See the combined state

        return nextEdges;
      });

      // 3. Filter out any existing OR utility nodes whose sources/target are missing
      const nonOrNodes = currentNodes.filter(node => {
        if (!node.id.startsWith('OR_')) return true;
        // Parse sources and target from the OR node id
        const match = node.id.match(/^OR_(.+)_\d+$/);
        if (!match) return false;
        const sources = match[1].split('_');
        // OR node should only exist if at least two sources and the target are present
        const presentSources = sources.filter(code => addedCardsCodes.includes(code));
        // Find the target by looking for an edge from this OR node
        const hasTarget = programmaticEdges.some(e => e.source === node.id);
        return presentSources.length >= 2 && hasTarget;
      });
      return [...nonOrNodes, ...programmaticNodes];
    });
  }, [addedCardsCodes, courseMap, setEdges, setNodes]);
};