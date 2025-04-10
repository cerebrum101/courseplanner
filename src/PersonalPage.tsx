import { useEffect, useMemo, useState, useCallback } from 'react';
import Dashboard from './components/Dashboard.jsx'
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './styles/index.css';
import courseDataJSON from './data/completeCourses2.json';

import CourseNodes from './components/CourseNode.jsx';
import CourseDashboard from './components/CourseDashboard.jsx';

type CourseNode = Node & {
  data: {
    label: string;
    name: string;
    onNodeClick: (nodeId: string) => void;
  };
};

const nodeTypes = {
  Course: CourseNodes
};

interface CoursePrereq {
  courseCode: string;
  courseName: string;
  gradeRequired: string;
}

interface Course {
  courseCode: string;
  courseName: string;
  prerequisites: (string | { type: string; courses: string[] })[];
  corequisites: (string | { type: string; courses: string[] })[];
  antirequisites: string[];
}

// interface CoursesData {
//   coursesData: Course[];
// }

const initialNodes = [
  {
    id: 'welcome-1',
    type: 'default',
    data: { label: 'made by @ataywork' },
    position: { x: 0, y: -100 },
    style: {
      background: 'transparent',
      border: 'none',
      color: '#9CA3AF', // gray-400
      fontSize: '0.875rem' // text-sm
    }
  },
  {
    id: 'welcome-2',
    type: 'default',
    data: { label: 'Search and add courses from the Dashboard' },
    position: { x: -200, y: 0 },
    style: {
      backgroundColor: 'rgba(31, 41, 55, 0.9)', // gray-900 with opacity
      color: 'white',
      border: '1px solid rgba(75, 85, 99, 0.5)', // gray-600 border
      borderRadius: '0.5rem', // rounded-lg
      padding: '0.75rem 1rem', // p-3
      width: '280px',
      fontSize: '0.875rem' // text-sm
    }
  },
  {
    id: 'welcome-3',
    type: 'default',
    data: { label: 'Prerequisites will automatically connect' },
    position: { x: 0, y: 100 },
    style: {
      backgroundColor: 'rgba(31, 41, 55, 0.9)',
      color: 'white',
      border: '1px solid rgba(75, 85, 99, 0.5)',
      borderRadius: '0.5rem',
      padding: '0.75rem 1rem',
      width: '280px',
      fontSize: '0.875rem'
    }
  }
];

export default function UserPlanPage() {
  const [addedCardsCodes, setAddedCardsCodes] = useState<string[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState<CourseNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [currCourse, setCurrCourse] = useState('');
  const [isDashboardVisible, setIsDashboardVisible] = useState(false);

  const handleNodesChange = useCallback((changes: any) => {
    onNodesChange(changes);
    
    // Filter  removed nodes
    const removedNodes = changes
      .filter((change: any) => change.type === 'remove')
      .map((change: any) => change.id);
    
    if (removedNodes.length > 0) {
      setAddedCardsCodes(prev => prev.filter(code => !removedNodes.includes(code)));
    }
  }, [onNodesChange]);

  // Create a course map for quick lookup
  const courseMap = useMemo(() => {
    const map = new Map<string, Course>();
    courseDataJSON.coursesData.forEach(course => {
      map.set(course.courseCode, course);
    });
    return map;
  }, []);

  const handleNodeClick = useCallback((nodeId: string) => {
    // If clicking the same node, just ensure dashboard is visible
    if (nodeId === currCourse) {
      setIsDashboardVisible(true);
    } else {
      // If clicking a different node, update both course and visibility
      setCurrCourse(nodeId);
      setIsDashboardVisible(true);
    }
  }, [currCourse]);

  // Update nodes when addedCardsCodes changes
  useMemo(() => {
    const courseNodes = addedCardsCodes.map((code) => {
      const existingNode = nodes.find(n => n.id === code);
      const courseName = courseMap.get(code)?.courseName;
      return {
        id: code,
        position: existingNode?.position || { 
          x: Math.random() * 100, 
          y: Math.random() * 100 
        },
        data: { 
          label: code,
          name: courseName,
          onNodeClick: handleNodeClick
        },
        draggable: true,
        type: 'Course',
        targetPosition: 'top',
      } as CourseNode;
    });
    // Keep initial nodes and merge with course nodes
    setNodes([ ...courseNodes]);
  }, [addedCardsCodes]);

  // Generate edges based on prerequisites and corequisites
  useEffect(() => {
    const newEdges: Edge[] = [];
    
    addedCardsCodes.forEach(courseCode => {
      const course = courseMap.get(courseCode);
      
      if (!course) return;

      // Process prerequisites
      course.prerequisites.forEach(prereq => {

        if (typeof prereq === 'string') {
          // Skip  insturctors approval only !PERM courses
          if (prereq.startsWith('!')) {
            return;
          }
          
          // If it's a regular course code and it's in the added cards
          if (addedCardsCodes.includes(prereq)) {
            newEdges.push({
              id: `${prereq}->${courseCode}`,
              source: prereq,
              target: courseCode,
              type: 'default',
              animated: false,
              style: { stroke: 'blue' }, // Blue for prerequisites
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: 'blue', // Blue arrow
              },
              sourceHandle: 'bottom-source',
              targetHandle: 'top-target',
            });
          }
        } 
        // Handle object prerequisites with "type" and "courses" array
        else if (typeof prereq === 'object' && 'type' in prereq && 'courses' in prereq) {
          // For "or" type prerequisites, create edges for each course in the array
          if (prereq.type === 'or') {
            prereq.courses.forEach( (crs, index) => {
                const OrPrereq = prereq.courses[index+1] || prereq.courses[index-1];
                if(addedCardsCodes.includes(crs)) {
                  newEdges.push({
                    id: `${crs}->${courseCode}`,
                    source: crs,
                    target: courseCode,
                    type: 'default',
                    animated: true,
                    style: { stroke: '#ee82ee' }, // Blue for prerequisites
                    label: `OR ${OrPrereq}` ,
                    markerEnd: {
                      type: MarkerType.ArrowClosed,
                      color: 'pink', // Blue arrow
                    },
                    sourceHandle: 'bottom-source',
                    targetHandle: 'top-target',
                  });
                }
              }
            );

          }
        }
      });

      // Process corequisites
      course.corequisites.forEach(coreq => {
        // Handle string corequisites
        if (typeof coreq === 'string') {
          if (addedCardsCodes.includes(coreq)) {
            newEdges.push({
              id: `${coreq}->${courseCode}`,
              source: coreq,
              target: courseCode,
              type: 'default',
              style: { stroke: '#2ECC40' }, // Green for corequisites
              label: "COREQ",
              sourceHandle: 'bottom-source',
              targetHandle: 'bottom-target',
            });
          }
        } 
        // Handle object corequisites with "type" and "courses" array
        else if (typeof coreq === 'object' && 'type' in coreq && 'courses' in coreq) {
          if (coreq.type === 'or') {
            coreq.courses.forEach((coreqCourseCode: string) => {
              if (addedCardsCodes.includes(coreqCourseCode)) {
                newEdges.push({
                  id: `${coreqCourseCode}->${courseCode}`,
                  source: coreqCourseCode,
                  target: courseCode,
                  type: 'default',
                  style: { stroke: '#10b981' }, // Pink + animate for OR
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: '#10b981', // 
                  },
                  sourceHandle: 'bottom-source',
                  targetHandle: 'bottom-target',
                });
              }
            });
          }
        }
      });

      course.antirequisites.forEach(antireq => {
        if(!antireq){
          return;
        }

        if(addedCardsCodes.includes(antireq)){
          newEdges.push({
            id: `${antireq}->${courseCode}`,
            source: antireq,
            target: courseCode,
            type: 'default',
            style: { stroke: 'red' }, // red for antireqs
            label: "ANTIREQ",
            sourceHandle: 'bottom-source',
            targetHandle: 'bottom-target',
          });
        }
      });
    });

    setEdges(newEdges);
  }, [addedCardsCodes, courseMap]);

  const handleToggleDashboard = useCallback(() => {
    setIsDashboardVisible(prev => !prev);
  }, []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={handleNodesChange}
      onEdgesChange={onEdgesChange}
      fitView
      nodesDraggable={true}
      nodeTypes={nodeTypes}
    >
      <Background />
      <Controls />
      <CourseDashboard 
        selctedCourseData={courseMap.get(currCourse)}
        isVisible={isDashboardVisible}
        onToggleVisibility={handleToggleDashboard}
      />
      <Dashboard 
        addedCardsCodes={addedCardsCodes}
        setAddedCardsCodes={setAddedCardsCodes}
      />
    </ReactFlow>
  );
}