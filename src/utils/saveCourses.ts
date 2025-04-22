import { Node, Edge } from '@xyflow/react';

const STORAGE_KEY = 'reactflow_courses';

export const saveFlow = (nodes: Node[], edges: Edge[]) => {
  try {
    const flow = { nodes, edges };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flow));

  } catch (error) {

  }
};

export const loadFlow = (): { nodes: Node[], edges: Edge[] } => {
  try {
    const savedFlow = localStorage.getItem(STORAGE_KEY);
    if (savedFlow) {
      const flow = JSON.parse(savedFlow);

      return flow;
    }
    return { nodes: [], edges: [] };
  } catch (error) {
    console.error('Failed to load flow:', error);
    return { nodes: [], edges: [] };
  }
};

export const resetFlow = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);

  } catch (error) {

  }
};
