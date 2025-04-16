import { useCallback } from 'react';

export const useNodeClick = (
  currCourse: string,
  setCurrCourse: (course: string) => void,
  setIsDashboardVisible: (visible: boolean) => void
) => {
  return useCallback((nodeId: string) => {
    // If clicking the same node, just ensure dashboard is visible
    if (nodeId === currCourse) {
      setIsDashboardVisible(true);
    } else {
      // If clicking a different node, update both course and visibility
      setCurrCourse(nodeId);
      setIsDashboardVisible(true);
    }
  }, [currCourse, setCurrCourse, setIsDashboardVisible]);
}; 