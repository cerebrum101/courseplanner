import { Node, Edge } from '@xyflow/react';

const STORAGE_KEY = 'reactflow_courses';

export const saveFlow = (nodes: Node[], edges: Edge[]) => {
  try {
    const flow = { nodes, edges };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flow));
  } catch (error) {
    console.error('Failed to save flow:', error);
    // Optionally show a user-friendly error message
  }
};

export const loadFlow = (): { nodes: Node[], edges: Edge[] } => {
  try {
    const savedFlow = localStorage.getItem(STORAGE_KEY);
    if (savedFlow) {
      const flow = JSON.parse(savedFlow);
      // Validate the loaded data structure
      if (!flow.nodes || !Array.isArray(flow.nodes) || !flow.edges || !Array.isArray(flow.edges)) {
        console.error('Invalid flow data structure');
        return { nodes: [], edges: [] };
      }
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
    console.error('Failed to reset flow:', error);
  }
};
